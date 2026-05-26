/*
 * audit-storybook-coverage.mjs — audit a Nexus component's stories against the
 * required-story matrix in .claude/rules/testing-react.md.
 *
 * Existence-only audit: for each required name the script verifies an export
 * exists in the stories file. Missing stories surface with a paste-ready
 * snippet quoted from the rule. Drift (`DataAttributesTest` vs
 * `WithDataAttributes`) is a hard miss for the six literal names. Variant/size
 * story names accept any story exercising the value (args-match, then
 * render-JSX match, then case-folded name match).
 *
 * Why a script (not a subagent body): structural rule-vs-files diffs belong in
 * deterministic scripts that CI can gate on. The repo has four precedents
 * (`packages/core/scripts/audit-*.js`); this audit fits the same mould.
 *
 * See .claude/rules/testing-react.md (matrix), .claude/rules/storybook.md
 * (story conventions), .claude/agents/storybook-coverage-reviewer.md (the
 * natural-language wrapper that shells out to this script).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const COMPONENTS_ROOT = path.join(__dirname, '..', 'src', 'components');
const CONFIG_PATH = path.join(__dirname, 'base-variants.config.json');

const COMPONENT_SUBDIRS = ['ui', 'primitives'];
const EXCLUDE_PATH_FRAGMENTS = ['__generated__', 'node_modules', 'dist'];
const STORY_SUFFIX = '.stories.tsx';
const TEST_SUFFIX = '.test.tsx';

const EXIT_OK = 0;
const EXIT_FINDINGS = 1;
const EXIT_CONFIG = 2;

const KNOWN_FLAGS = new Set(['component', 'all', 'json']);
const FLAG_PATTERN = /^--([a-zA-Z][a-zA-Z0-9-]*)(?:=(.+))?$/;

const DOCS_HINT = 'see .claude/rules/testing-react.md';

class ConfigError extends Error {}

// ─────────────────────────────────────────────────────────────────────────────
// CLI parsing
// ─────────────────────────────────────────────────────────────────────────────

export function findUnknownFlags(args) {
  return Object.keys(args).filter((k) => !KNOWN_FLAGS.has(k));
}

export function parseArgs(argv) {
  const args = { component: null, all: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const match = argv[i].match(FLAG_PATTERN);
    if (!match) continue;
    const [, key, inlineVal] = match;
    if (key === 'all' || key === 'json') {
      args[key] = inlineVal === undefined ? true : inlineVal !== 'false';
      continue;
    }
    if (inlineVal !== undefined) {
      args[key] = inlineVal;
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i++;
    }
  }
  return args;
}

// ─────────────────────────────────────────────────────────────────────────────
// Source scanner: character-by-character, string/comment aware.
//   findCallExpressionArgs — locate `cva(` and return the source range of its
//     parenthesised argument list.
//   findObjectKey — given a brace-delimited object's source range, return the
//     value range for `key:` at the top level.
//   parseObjectKeys — return the top-level string-keyed property names of a
//     brace-delimited object.
//
// This sidesteps regex pitfalls with multi-line variants blocks (Tabs uses
// arrays-of-strings across six lines per variant value), template literals,
// and inline comments. ~50 LOC of state machine.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Walk the source from `startIdx` (which must point at an open bracket of
 * `open`) and return the index of the matching close, respecting strings,
 * template literals, and comments. Returns -1 if unmatched.
 */
export function matchBracket(src, startIdx, open = '{', close = '}') {
  if (src[startIdx] !== open) return -1;
  let depth = 0;
  let i = startIdx;
  while (i < src.length) {
    const ch = src[i];
    // String literals
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') i++;
        i++;
      }
      i++;
      continue;
    }
    // Template literals — skip ${...} substitutions
    if (ch === '`') {
      i++;
      while (i < src.length && src[i] !== '`') {
        if (src[i] === '\\') {
          i += 2;
          continue;
        }
        if (src[i] === '$' && src[i + 1] === '{') {
          const end = matchBracket(src, i + 1, '{', '}');
          if (end === -1) return -1;
          i = end + 1;
          continue;
        }
        i++;
      }
      i++;
      continue;
    }
    // Comments
    if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length - 1 && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}

/**
 * For each call-expression `name(...)` at the top level (string/comment aware),
 * return the source range of the parenthesised argument list. Returns
 * `[{ start, end }]` indexing into `src` where `start` is the `(` and `end` is
 * the matching `)`.
 */
export function findCallExpressionArgs(src, name) {
  const out = [];
  const pattern = new RegExp(`\\b${name}\\s*\\(`, 'g');
  let m;
  while ((m = pattern.exec(src)) !== null) {
    const openParen = src.indexOf('(', m.index);
    if (openParen === -1) continue;
    const closeParen = matchBracket(src, openParen, '(', ')');
    if (closeParen === -1) continue;
    out.push({ start: openParen, end: closeParen, callStart: m.index });
  }
  return out;
}

/**
 * Given an object literal's source (without surrounding braces — i.e. just
 * the body), return the top-level string-keyed property names in order.
 * Skips spread (`...foo`), computed keys (`[expr]:`), and method shorthand.
 */
export function parseObjectKeys(body) {
  const src = `{${body}}`;
  const keys = [];
  let i = 1;
  while (i < src.length - 1) {
    // Skip whitespace
    while (i < src.length && /\s/.test(src[i])) i++;
    // Skip comments
    if (src[i] === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (src[i] === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length - 1 && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    // Try to match a key — quoted (any content) OR bare identifier.
    // Avatar's CVA quotes leading-digit values like `'2xs'`, so the quoted
    // branch must allow arbitrary content; the bare-identifier branch follows
    // standard JS identifier-start rules.
    const remaining = src.slice(i);
    const keyMatch = remaining.match(
      /^(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))\s*:/
    );
    if (keyMatch) {
      keys.push(keyMatch[1] ?? keyMatch[2] ?? keyMatch[3]);
      i += keyMatch[0].length;
      // Walk past the value
      while (i < src.length && /\s/.test(src[i])) i++;
      i = walkValue(src, i);
      // Skip trailing comma
      while (i < src.length && /[\s,]/.test(src[i])) i++;
      continue;
    }
    // Unknown token; advance one char defensively
    i++;
  }
  return keys;
}

function walkValue(src, start) {
  let i = start;
  if (src[i] === '{' || src[i] === '[' || src[i] === '(') {
    const open = src[i];
    const close = open === '{' ? '}' : open === '[' ? ']' : ')';
    const end = matchBracket(src, i, open, close);
    return end === -1 ? src.length : end + 1;
  }
  if (src[i] === '"' || src[i] === "'") {
    const quote = src[i];
    i++;
    while (i < src.length && src[i] !== quote) {
      if (src[i] === '\\') i++;
      i++;
    }
    return i + 1;
  }
  if (src[i] === '`') {
    i++;
    while (i < src.length && src[i] !== '`') {
      if (src[i] === '\\') {
        i += 2;
        continue;
      }
      if (src[i] === '$' && src[i + 1] === '{') {
        const end = matchBracket(src, i + 1, '{', '}');
        i = end === -1 ? src.length : end + 1;
        continue;
      }
      i++;
    }
    return i + 1;
  }
  // Identifier / literal — walk to next `,` or `}` at the top level
  let depth = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      i = walkValue(src, i);
      continue;
    }
    if (ch === '{' || ch === '[' || ch === '(') {
      depth++;
    } else if (ch === '}' || ch === ']' || ch === ')') {
      if (depth === 0) return i;
      depth--;
    } else if (ch === ',' && depth === 0) {
      return i;
    }
    i++;
  }
  return i;
}

/**
 * Given an object's source range (`braceStart` points at the `{`), find the
 * value range for `key:` at the top level. Returns `{ start, end }` of the
 * value's source, or null if the key is absent.
 */
export function findObjectKey(src, braceStart, key) {
  const braceEnd = matchBracket(src, braceStart, '{', '}');
  if (braceEnd === -1) return null;
  const body = src.slice(braceStart + 1, braceEnd);
  let i = 0;
  while (i < body.length) {
    while (i < body.length && /\s/.test(body[i])) i++;
    if (body[i] === '/' && body[i + 1] === '/') {
      while (i < body.length && body[i] !== '\n') i++;
      continue;
    }
    if (body[i] === '/' && body[i + 1] === '*') {
      i += 2;
      while (i < body.length - 1 && !(body[i] === '*' && body[i + 1] === '/'))
        i++;
      i += 2;
      continue;
    }
    const remaining = body.slice(i);
    const keyMatch = remaining.match(
      /^(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))\s*:\s*/
    );
    const matchedKey = keyMatch
      ? (keyMatch[1] ?? keyMatch[2] ?? keyMatch[3])
      : null;
    if (keyMatch && matchedKey === key) {
      const valueStart = braceStart + 1 + i + keyMatch[0].length;
      const valueEnd = walkValue(src, valueStart);
      return { start: valueStart, end: valueEnd };
    }
    if (keyMatch) {
      i += keyMatch[0].length;
      const absStart = braceStart + 1 + i;
      const absEnd = walkValue(src, absStart);
      i = absEnd - braceStart - 1;
      while (i < body.length && /[\s,]/.test(body[i])) i++;
      continue;
    }
    i++;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component-side extraction.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract every `cva(...)` call's `variants` enum keys across the whole file.
 * Returns `{ enums: { name: [values] }, extraEnums: [name], cvaCount }`.
 * `variant` and `size` are first-class (required by the rule); other enums
 * (Badge's `fill`, Avatar's `shape`) are surfaced as `extraEnums` for an
 * informational note.
 */
export function extractCvaEnums(src) {
  const calls = findCallExpressionArgs(src, 'cva');
  const enums = {};
  const extraEnums = new Set();
  for (const call of calls) {
    // Second arg of cva(baseClasses, config). Find the comma after the first
    // arg (string|array|template) at top level.
    const argsRegion = src.slice(call.start + 1, call.end);
    const firstArgEnd = walkValue(`(${argsRegion})`, 1) - 1;
    const remainder = argsRegion.slice(firstArgEnd).trimStart();
    if (!remainder.startsWith(',')) continue;
    const configStart =
      call.start + 1 + firstArgEnd + (argsRegion.slice(firstArgEnd).length - remainder.length) + 1;
    // Find the next `{` from configStart that is the config object
    let i = configStart;
    while (i < call.end && /\s/.test(src[i])) i++;
    if (src[i] !== '{') continue;
    const variantsRange = findObjectKey(src, i, 'variants');
    if (!variantsRange) continue;
    // variants value is itself an object — find its braces
    let vi = variantsRange.start;
    while (vi < variantsRange.end && /\s/.test(src[vi])) vi++;
    if (src[vi] !== '{') continue;
    const variantsEnd = matchBracket(src, vi, '{', '}');
    if (variantsEnd === -1) continue;
    const variantsBody = src.slice(vi + 1, variantsEnd);
    const enumNames = parseObjectKeys(variantsBody);
    for (const enumName of enumNames) {
      // Find this enum's value range
      const enumRange = findObjectKey(src, vi, enumName);
      if (!enumRange) continue;
      let ei = enumRange.start;
      while (ei < enumRange.end && /\s/.test(src[ei])) ei++;
      if (src[ei] !== '{') continue;
      const enumEnd = matchBracket(src, ei, '{', '}');
      if (enumEnd === -1) continue;
      const enumBody = src.slice(ei + 1, enumEnd);
      const values = parseObjectKeys(enumBody);
      if (enumName === 'variant' || enumName === 'size') {
        const existing = enums[enumName] ?? [];
        // Dedupe across multiple CVA blocks in the same file
        for (const v of values) {
          if (!existing.includes(v)) existing.push(v);
        }
        enums[enumName] = existing;
      } else {
        extraEnums.add(enumName);
      }
    }
  }
  return { enums, extraEnums: [...extraEnums], cvaCount: calls.length };
}

/**
 * Does any props interface in the file declare `asChild?:`?
 */
export function detectAsChild(src) {
  return /\basChild\?\s*:/.test(src);
}

/**
 * Display-gate signal: is the component interactive? OR of two signals:
 *  (a) the component's source mentions an `on*` event-handler prop name or
 *      the `disabled` token (covers explicit prop interfaces and CVA base
 *      classes like `nx:disabled:` styling hooks); or
 *  (b) handled by the caller via the stories file's `fn()`-in-`meta.args`.
 * This function returns (a) only; combine with (b) at the call site.
 */
export function detectInteractiveFromComponent(src) {
  // Strip `data-state` and similar `[data-*]` attribute selectors so a CVA
  // class like `nx:data-[state=active]:bg-background` doesn't false-positive
  // the `disabled` check below via accidental substring matches.
  if (/\bdisabled\b/.test(src)) return true;
  if (/\bon[A-Z][A-Za-z]+\s*[?:,)]/.test(src)) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stories-side extraction.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find every `export const Name` story declaration. Returns
 * `[{ name, line, blockStart, blockEnd }]` where `blockStart`/`blockEnd`
 * bracket the story's object literal (if present) so callers can scope further
 * inspection. Matches `: Story`, `: StoryObj`, `: Story<…>`, and the Storybook 8+
 * `= { … } satisfies Story` shape. Non-story exports (`helper = ...`,
 * `render = ...`) are filtered by requiring either the `: Story` annotation or
 * a trailing `satisfies Story`.
 */
export function findStoryExports(src) {
  const out = [];
  const pattern = /^\s*export\s+const\s+(\w+)\s*(?::\s*Story\w*|=)/gm;
  let m;
  while ((m = pattern.exec(src)) !== null) {
    const name = m[1];
    const isTypedStory = m[0].includes(':');
    // Find the next `{` after the match — the story's object literal
    let i = m.index + m[0].length;
    while (i < src.length && src[i] !== '{') i++;
    if (i >= src.length) continue;
    const blockStart = i;
    const blockEnd = matchBracket(src, i, '{', '}');
    if (blockEnd === -1) continue;
    // The `= { … }` shape needs `satisfies Story` afterwards to count as a
    // story (otherwise we'd match any const declaration).
    if (!isTypedStory) {
      const tail = src.slice(blockEnd + 1, blockEnd + 60);
      if (!/^\s*satisfies\s+Story\b/.test(tail)) continue;
    }
    const line = src.slice(0, m.index).split('\n').length;
    out.push({ name, line, blockStart, blockEnd });
  }
  return out;
}

/**
 * Find the `args:` block within a story's body and return its source range,
 * or null if absent.
 */
export function findArgsBlock(src, blockStart) {
  if (blockStart === -1) return null;
  return findObjectKey(src, blockStart, 'args');
}

/**
 * Does this story exercise enum value `value` for enum `enumName`?
 *  - args-match: `args: { [enumName]: 'value' }`
 *  - render-JSX match: `<Component {enumName}="value">` somewhere in the
 *    story's body
 *  - name-match (case-folded, suffix-stripped): story name maps to value
 */
export function storyExercises(src, story, enumName, value) {
  if (story.blockStart === -1) return false;
  // (1) args-match
  const argsRange = findArgsBlock(src, story.blockStart);
  if (argsRange) {
    let ai = argsRange.start;
    while (ai < argsRange.end && /\s/.test(src[ai])) ai++;
    if (src[ai] === '{') {
      const enumValueRange = findObjectKey(src, ai, enumName);
      if (enumValueRange) {
        const raw = src
          .slice(enumValueRange.start, enumValueRange.end)
          .trim()
          .replace(/^["'`]|["'`]$/g, '');
        if (raw === value) return true;
      }
    }
  }
  // (2) render-JSX match — scan the story body
  const body = src.slice(story.blockStart, story.blockEnd + 1);
  const jsxPattern = new RegExp(
    `\\b${enumName}\\s*=\\s*["']${escapeRegExp(value)}["']`,
    ''
  );
  if (jsxPattern.test(body)) return true;
  // (3) name-match — case-fold, strip enum suffix
  const normalizedName = story.name
    .toLowerCase()
    .replace(/variant$|size$|style$|kind$|fill$/i, '');
  if (normalizedName === value.toLowerCase()) return true;
  return false;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Does the stories file's `meta.args` contain a `fn()` spy declaration?
 */
export function detectFnSpy(src) {
  // Find `const meta` declaration
  const metaMatch = src.match(/\bconst\s+meta\s*:[^{=]*=\s*\{/);
  if (!metaMatch) return false;
  const metaStart = metaMatch.index + metaMatch[0].length - 1;
  const metaEnd = matchBracket(src, metaStart, '{', '}');
  if (metaEnd === -1) return false;
  const argsRange = findObjectKey(src, metaStart, 'args');
  if (!argsRange) return false;
  const argsSrc = src.slice(argsRange.start, argsRange.end);
  return /\bfn\s*\(\s*\)/.test(argsSrc);
}

/**
 * Does ANY story in the file use `asChild`?
 */
export function detectAsChildUsage(src) {
  return /\basChild\b/.test(src);
}

// ─────────────────────────────────────────────────────────────────────────────
// File discovery.
// ─────────────────────────────────────────────────────────────────────────────

function kebabToPascal(kebab) {
  return kebab
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function pascalToKebab(pascal) {
  return pascal
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function isExcludedPath(p) {
  return EXCLUDE_PATH_FRAGMENTS.some((frag) => p.includes(frag));
}

/**
 * Find a single component file for `kebab` under COMPONENTS_ROOT. Returns the
 * absolute path, or throws ConfigError if not exactly one match.
 */
export function findComponentFile(kebab, root = COMPONENTS_ROOT) {
  const matches = [];
  for (const subdir of COMPONENT_SUBDIRS) {
    const candidate = path.join(root, subdir, `${kebab}.tsx`);
    if (
      fs.existsSync(candidate) &&
      !candidate.endsWith(STORY_SUFFIX) &&
      !candidate.endsWith(TEST_SUFFIX) &&
      !isExcludedPath(candidate)
    ) {
      matches.push(candidate);
    }
  }
  if (matches.length === 0) {
    throw new ConfigError(
      `component "${kebab}" not found under ${path.relative(REPO_ROOT, root)}/{${COMPONENT_SUBDIRS.join(',')}}/`
    );
  }
  if (matches.length > 1) {
    throw new ConfigError(
      `component "${kebab}" matches multiple files:\n  ${matches.map((p) => path.relative(REPO_ROOT, p)).join('\n  ')}`
    );
  }
  return matches[0];
}

/**
 * Find the stories file for the given component file. The convention is
 * `{kebab}.tsx` → `{Pascal}.stories.tsx` in the same directory.
 */
export function findStoriesFile(componentFile) {
  const dir = path.dirname(componentFile);
  const kebab = path.basename(componentFile, '.tsx');
  const pascal = kebabToPascal(kebab);
  const candidate = path.join(dir, `${pascal}.stories.tsx`);
  if (fs.existsSync(candidate)) return candidate;
  return null;
}

/**
 * List every component file under COMPONENTS_ROOT for `--all` mode.
 */
export function listAllComponents(root = COMPONENTS_ROOT) {
  const out = [];
  for (const subdir of COMPONENT_SUBDIRS) {
    const dir = path.join(root, subdir);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (!entry.endsWith('.tsx')) continue;
      if (entry.endsWith(STORY_SUFFIX) || entry.endsWith(TEST_SUFFIX)) continue;
      if (isExcludedPath(full)) continue;
      out.push(full);
    }
  }
  return out.sort();
}

// ─────────────────────────────────────────────────────────────────────────────
// Showcase-name lookup.
// ─────────────────────────────────────────────────────────────────────────────

let configCache = null;

function readConfig() {
  if (configCache !== null) return configCache;
  if (!fs.existsSync(CONFIG_PATH)) {
    configCache = { components: [] };
    return configCache;
  }
  try {
    configCache = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    throw new ConfigError(
      `failed to parse ${path.relative(REPO_ROOT, CONFIG_PATH)}: ${err.message}`
    );
  }
  return configCache;
}

/**
 * Look up the canonical showcase story name for a component. Avatar uses
 * `AllSizes`; everything else defaults to `AllVariants`.
 */
export function showcaseNameFor(pascalName) {
  const config = readConfig();
  const entry = config.components?.find((c) => c.name === pascalName);
  return entry?.showcase ?? 'AllVariants';
}

// ─────────────────────────────────────────────────────────────────────────────
// Snippet templates — paste-ready fix hints. Inline fallback first; the rule
// file is informational reference only (templates almost never change, and
// re-quoting from markdown is error-prone for an existence-only audit).
// ─────────────────────────────────────────────────────────────────────────────

const SNIPPETS = {
  Default: `export const Default: Story = {
  args: { /* default props */ },
};`,
  Disabled: `export const Disabled: Story = {
  args: { disabled: true /* + any required props */ },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByRole('button');
    await expect(el).toBeDisabled();
    await userEvent.click(el);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};`,
  ClickInteraction: `export const ClickInteraction: Story = {
  args: { /* required props */ },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByRole('button');
    await userEvent.click(el);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};`,
  KeyboardInteraction: `export const KeyboardInteraction: Story = {
  args: { /* required props */ },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByRole('button');
    await userEvent.tab();
    await expect(el).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};`,
  WithDataAttributes: `export const WithDataAttributes: Story = {
  args: { /* representative props */ },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByRole('button');
    await expect(el).toHaveAttribute('data-slot', '<slot-name>');
  },
};`,
  AllVariants: `export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      {/* Visual grid: variants, sizes, states */}
    </div>
  ),
};`,
  AllSizes: `export const AllSizes: Story = {
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-4">
      {/* Visual row across all sizes */}
    </div>
  ),
};`,
  asChild: `export const AsLink: Story = {
  render: (args) => (
    <Component {...args} asChild>
      <a href="https://example.com">As link</a>
    </Component>
  ),
};`,
};

function snippetFor(name) {
  return SNIPPETS[name] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit core.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Story-name drift detection: when the canonical name (e.g. `WithDataAttributes`)
 * is missing but a near-equivalent name (e.g. `DataAttributesTest`) is present,
 * report drift instead of a clean miss so the fix is unambiguous.
 */
const DRIFT_ALIASES = {
  WithDataAttributes: ['DataAttributesTest', 'DataAttrs', 'DataAttributes'],
  Disabled: ['DisabledInteraction', 'DisabledState'],
  ClickInteraction: ['ClickTest', 'OnClick'],
  KeyboardInteraction: [
    'KeyboardTest',
    'KeyboardNavigation',
    'KeyboardNavigationInteraction',
  ],
  Default: ['Basic'],
  AllVariants: ['Variants', 'AllStates'],
  AllSizes: ['Sizes'],
};

/**
 * Build the required-story checklist for a component and check the stories
 * file against it.
 *
 * @returns {{ component, file, storiesFile, findings, summary, info }}
 */
export function auditComponent(componentFile) {
  const src = fs.readFileSync(componentFile, 'utf8');
  const storiesFile = findStoriesFile(componentFile);
  const kebab = path.basename(componentFile, '.tsx');
  const pascal = kebabToPascal(kebab);

  const { enums, extraEnums, cvaCount } = extractCvaEnums(src);
  const hasAsChild = detectAsChild(src);
  const componentInteractive = detectInteractiveFromComponent(src);

  const result = {
    component: pascal,
    file: path.relative(REPO_ROOT, componentFile),
    storiesFile: storiesFile ? path.relative(REPO_ROOT, storiesFile) : null,
    findings: [],
    info: [],
    summary: { total: 0, missing: 0, drift: 0, info: 0 },
  };

  if (!storiesFile) {
    result.findings.push({
      kind: 'missing',
      rule: 'stories-file',
      name: `${pascal}.stories.tsx`,
      expected: `${path.relative(REPO_ROOT, path.dirname(componentFile))}/${pascal}.stories.tsx`,
      snippet: `Scaffold with /new-component ${kebab} (see issue #75).`,
    });
    finalize(result);
    return result;
  }

  const storiesSrc = fs.readFileSync(storiesFile, 'utf8');
  const stories = findStoryExports(storiesSrc);
  const storyNames = new Set(stories.map((s) => s.name));
  const fnSpy = detectFnSpy(storiesSrc);
  const isInteractive = componentInteractive || fnSpy;

  // Empty stories file (no Story exports) — single finding, not 9.
  if (stories.length === 0) {
    result.findings.push({
      kind: 'missing',
      rule: 'stories-file',
      name: 'all stories',
      expected: 'one or more `export const X: Story = { … }` declarations',
      snippet: `Scaffold with /new-component ${kebab} (see issue #75).`,
    });
    finalize(result);
    return result;
  }

  const showcase = showcaseNameFor(pascal);

  // ── 6 literal-name required stories ────────────────────────────────────────
  // `Default`, `WithDataAttributes`, and `<showcase>` are always required.
  // `Disabled`, `ClickInteraction`, `KeyboardInteraction` are required only
  // when the component is interactive (display-gate).
  const literalRequired = [
    { name: 'Default', alwaysRequired: true },
    { name: 'Disabled', alwaysRequired: false },
    { name: 'ClickInteraction', alwaysRequired: false },
    { name: 'KeyboardInteraction', alwaysRequired: false },
    { name: 'WithDataAttributes', alwaysRequired: true },
    { name: showcase, alwaysRequired: true },
  ];

  for (const req of literalRequired) {
    if (!req.alwaysRequired && !isInteractive) {
      result.info.push({
        kind: 'info',
        rule: 'display-gate',
        name: req.name,
        found: 'n/a (display component — no `fn()` spy and no `on*`/`disabled` prop)',
      });
      continue;
    }
    if (storyNames.has(req.name)) continue;
    // Check for drift aliases
    const aliases = DRIFT_ALIASES[req.name] ?? [];
    const drifted = aliases.find((alias) => storyNames.has(alias));
    if (drifted) {
      result.findings.push({
        kind: 'drift',
        rule: 'literal-name',
        name: req.name,
        found: drifted,
        expected: req.name,
        snippet: `Rename \`${drifted}\` → \`${req.name}\` (the rule names this story by literal name; drift breaks greppability and base-variants.config.json references).`,
      });
      continue;
    }
    result.findings.push({
      kind: 'missing',
      rule: 'literal-name',
      name: req.name,
      expected: req.name,
      snippet: snippetFor(req.name),
    });
  }

  // ── Per-(variant|size)-value stories ──────────────────────────────────────
  for (const enumName of ['variant', 'size']) {
    const values = enums[enumName];
    if (!values || values.length === 0) continue;
    for (const value of values) {
      const exercising = stories.find((s) =>
        storyExercises(storiesSrc, s, enumName, value)
      );
      if (exercising) continue;
      result.findings.push({
        kind: 'missing',
        rule: `per-${enumName}`,
        name: `${enumName}="${value}"`,
        expected: `a story exercising ${enumName}="${value}" (via args, render-JSX, or name match)`,
        snippet: `export const ${capitalize(value)}: Story = {
  args: { ${enumName}: '${value}' /* + any required props */ },
};`,
      });
    }
  }

  // ── asChild story (if applicable) ──────────────────────────────────────────
  if (hasAsChild) {
    if (!detectAsChildUsage(storiesSrc)) {
      result.findings.push({
        kind: 'missing',
        rule: 'as-child',
        name: 'asChild story',
        expected: 'a story rendering the component with `asChild` to verify composition',
        snippet: snippetFor('asChild'),
      });
    }
  }

  // ── Informational notes ────────────────────────────────────────────────────
  if (extraEnums.length > 0) {
    result.info.push({
      kind: 'info',
      rule: 'extra-cva-enum',
      name: extraEnums.join(', '),
      found: `${extraEnums.length} CVA enum(s) outside the rule's matrix (the rule only requires per-value stories for \`variant\` and \`size\`)`,
    });
  }
  if (cvaCount > 1) {
    result.info.push({
      kind: 'info',
      rule: 'compound-component',
      name: `${cvaCount} CVA blocks`,
      found: 'compound component — CVA enums unioned across blocks for the audit',
    });
  }

  finalize(result);
  return result;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function finalize(result) {
  result.summary.missing = result.findings.filter((f) => f.kind === 'missing').length;
  result.summary.drift = result.findings.filter((f) => f.kind === 'drift').length;
  result.summary.info = result.info.length;
  result.summary.total = result.findings.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting.
// ─────────────────────────────────────────────────────────────────────────────

function formatHumanFinding(finding) {
  const icon = finding.kind === 'missing' ? '❌' : '⚠️';
  const label = `${icon} ${finding.kind.toUpperCase()}: ${finding.name}`;
  const lines = [label];
  if (finding.found && finding.expected) {
    lines.push(`     found:    ${finding.found}`);
    lines.push(`     expected: ${finding.expected}`);
  } else if (finding.expected) {
    lines.push(`     expected: ${finding.expected}`);
  }
  if (finding.snippet) {
    lines.push('     fix:');
    for (const line of finding.snippet.split('\n')) {
      lines.push(`       ${line}`);
    }
  }
  return lines.join('\n');
}

function formatHumanInfo(info) {
  const lines = [`ℹ️  ${info.rule}: ${info.name}`];
  if (info.found) lines.push(`     ${info.found}`);
  return lines.join('\n');
}

function formatHumanResult(result) {
  const lines = [];
  lines.push(`─── audit-storybook-coverage: ${result.component} ───`);
  lines.push(`  component: ${result.file}`);
  lines.push(`  stories:   ${result.storiesFile ?? '(missing)'}`);
  lines.push('');
  if (result.findings.length === 0 && result.info.length === 0) {
    lines.push('  ✓ no gaps');
    lines.push('');
    return lines.join('\n');
  }
  for (const finding of result.findings) {
    lines.push(formatHumanFinding(finding));
    lines.push('');
  }
  if (result.info.length > 0) {
    lines.push('  ─ info ─');
    for (const info of result.info) {
      lines.push(formatHumanInfo(info));
    }
    lines.push('');
  }
  lines.push(
    `  summary: ${result.summary.missing} missing, ${result.summary.drift} drift, ${result.summary.info} info`
  );
  lines.push('');
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Main.
// ─────────────────────────────────────────────────────────────────────────────

function fail(message) {
  throw new ConfigError(message);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const unknown = findUnknownFlags(args);
  if (unknown.length > 0) {
    fail(
      `unknown flag(s): ${unknown.map((k) => `--${k}`).join(', ')}\n  known: ${[...KNOWN_FLAGS].map((k) => `--${k}`).join(', ')}\n  ${DOCS_HINT}`
    );
  }

  if (!args.component && !args.all) {
    fail(
      `--component <name> or --all is required\n  example: --component button | --component DropdownMenu | --all\n  ${DOCS_HINT}`
    );
  }

  let files;
  if (args.all) {
    files = listAllComponents();
  } else {
    // Accept Pascal or kebab; canonicalize to kebab for filesystem lookup.
    const input = args.component;
    const kebab = input.includes('-') || input === input.toLowerCase()
      ? input
      : pascalToKebab(input);
    files = [findComponentFile(kebab)];
  }

  const results = files.map((f) => auditComponent(f));

  if (args.json) {
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  } else {
    for (const result of results) {
      process.stdout.write(formatHumanResult(result));
    }
    const totalFindings = results.reduce((acc, r) => acc + r.summary.total, 0);
    const totalMissing = results.reduce((acc, r) => acc + r.summary.missing, 0);
    const totalDrift = results.reduce((acc, r) => acc + r.summary.drift, 0);
    if (results.length > 1) {
      process.stdout.write(
        `Audited ${results.length} components — ${totalFindings} finding(s) (${totalMissing} missing, ${totalDrift} drift).\n`
      );
    }
  }

  const anyFindings = results.some((r) => r.summary.total > 0);
  process.exit(anyFindings ? EXIT_FINDINGS : EXIT_OK);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    main();
  } catch (err) {
    if (err instanceof ConfigError) {
      process.stderr.write(`audit-storybook-coverage: ${err.message}\n`);
      process.exit(EXIT_CONFIG);
    }
    throw err;
  }
}

export { ConfigError, EXIT_CONFIG, EXIT_FINDINGS, EXIT_OK };
