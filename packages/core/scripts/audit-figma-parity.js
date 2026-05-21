import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractTokens, readTokenFile } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.resolve(__dirname, '..', 'tokens');
const PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives');
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
export const DEFAULT_SNAPSHOT = path.join(TOKENS_DIR, 'figma-snapshot.json');

/**
 * Today only the single-mode shape is wired:
 *   { file: '<path>' } — diff `snapshot[category]` against the one code file.
 *
 * The intended shapes for multi-mode and mode × theme (wired alongside #61/#62/#63):
 *   { dir: '<path>', filePattern: '{cat}-{mode}.json' }
 *   { dir: '<path>', filePattern: '{cat}-{mode}-{theme}.json' }
 *
 * Those branches add `--mode`/`--theme` parsing, a path resolver, and a deeper
 * snapshot subtree read (`snapshot[cat][mode]` / `snapshot[cat][mode][theme]`).
 * See .claude/rules/figma.md — Code-vs-Figma Parity Audit → Snapshot shape.
 */
const CATEGORIES = {
  color: {
    file: path.join(PRIMITIVES_DIR, 'color.json'),
  },
};

const KNOWN_FLAGS = new Set(['category', 'snapshot', 'mode', 'theme']);

const EXIT_OK = 0;
const EXIT_DRIFT = 1;
const EXIT_CONFIG = 2;

const DOCS_HINT = 'see .claude/rules/figma.md → Code-vs-Figma Parity Audit';

class ConfigError extends Error {}

const FLAG_PATTERN = /^--([a-zA-Z][a-zA-Z0-9-]*)(?:=(.+))?$/;

export function parseArgs(argv) {
  const args = { category: null, snapshot: DEFAULT_SNAPSHOT };
  for (let i = 0; i < argv.length; i++) {
    const match = argv[i].match(FLAG_PATTERN);
    if (!match) continue;
    const [, key, inlineVal] = match;
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

function normalizeValue(value, type) {
  if (type === 'color' && typeof value === 'string') {
    return value.toLowerCase();
  }
  if (
    type === 'dimension' &&
    typeof value === 'object' &&
    value !== null &&
    'value' in value
  ) {
    const rounded = Math.round(value.value * 10000) / 10000;
    return `${rounded}${value.unit || 'px'}`;
  }
  if (typeof value === 'object' && value !== null) {
    throw new Error(
      `normalizeValue: object value for $type "${type}" is not supported. ` +
        `Wire normalization for this type when its category lands.`
    );
  }
  return value;
}

function buildTokenMap(subtree) {
  const tokens = extractTokens(subtree);
  const map = new Map();
  for (const token of tokens) {
    map.set(token.path.join('.'), {
      value: normalizeValue(token.value, token.type),
      type: token.type,
    });
  }
  return map;
}

/**
 * @param {object} codeSubtree - Parsed JSON for the code side (e.g., color.json contents)
 * @param {object} snapshotSubtree - Parsed JSON for the Figma snapshot side (same shape)
 * @returns {{ path: string, kind: string, code?: object, figma?: object }[]}
 */
export function diffTokenTrees(codeSubtree, snapshotSubtree) {
  const codeMap = buildTokenMap(codeSubtree);
  const figmaMap = buildTokenMap(snapshotSubtree);
  const findings = [];

  for (const [tokenPath, code] of codeMap) {
    const figma = figmaMap.get(tokenPath);
    if (!figma) {
      findings.push({ path: tokenPath, kind: 'missing-in-figma', code });
      continue;
    }
    if (code.type !== figma.type) {
      findings.push({ path: tokenPath, kind: 'type-mismatch', code, figma });
      continue;
    }
    if (code.value !== figma.value) {
      findings.push({ path: tokenPath, kind: 'value-mismatch', code, figma });
    }
  }

  for (const [tokenPath, figma] of figmaMap) {
    if (!codeMap.has(tokenPath)) {
      findings.push({ path: tokenPath, kind: 'missing-in-code', figma });
    }
  }

  return findings.sort((a, b) => a.path.localeCompare(b.path));
}

function formatFinding(finding) {
  const label = finding.path.padEnd(40);
  switch (finding.kind) {
    case 'value-mismatch':
      return `  ✗ ${label} code=${finding.code.value}  figma=${finding.figma.value}  → push ${finding.code.value} to Figma`;
    case 'type-mismatch':
      return `  ✗ ${label} type drift: code=${finding.code.type}  figma=${finding.figma.type}`;
    case 'missing-in-figma':
      return `  ✗ ${label} missing in Figma (code value: ${finding.code.value}) → add to Figma`;
    case 'missing-in-code':
      return `  ✗ ${label} extra in Figma (figma value: ${finding.figma.value}) → remove from Figma`;
    default:
      throw new Error(`formatFinding: unknown kind "${finding.kind}"`);
  }
}

function fail(message) {
  throw new ConfigError(message);
}

function readJsonOrFail(filePath, label) {
  try {
    return readTokenFile(filePath);
  } catch (err) {
    fail(`failed to parse ${label} ${filePath}: ${err.message}`);
  }
}

function gitLastCommitTs(filePath) {
  try {
    const rel = path.relative(REPO_ROOT, filePath);
    const output = execSync(
      `git log -1 --format=%ct -- ${JSON.stringify(rel)}`,
      {
        encoding: 'utf8',
        cwd: REPO_ROOT,
        stdio: ['ignore', 'pipe', 'ignore'],
      }
    ).trim();
    const ts = parseInt(output, 10);
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
}

function isShallowClone() {
  try {
    const output = execSync('git rev-parse --is-shallow-repository', {
      encoding: 'utf8',
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return output === 'true';
  } catch {
    return false;
  }
}

function isCI() {
  const v = process.env.CI?.toLowerCase();
  return v === 'true' || v === '1';
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const unknownFlags = Object.keys(args).filter((k) => !KNOWN_FLAGS.has(k));
  if (unknownFlags.length > 0) {
    fail(
      `unknown flag(s): ${unknownFlags.map((k) => `--${k}`).join(', ')}\n  known: ${[...KNOWN_FLAGS].map((k) => `--${k}`).join(', ')}\n  ${DOCS_HINT}`
    );
  }

  if (!args.category) {
    const supported = Object.keys(CATEGORIES).join(', ');
    fail(
      `--category <name> is required\n  supported: ${supported}\n  pending categories — ${DOCS_HINT}`
    );
  }

  const config = CATEGORIES[args.category];
  if (!config) {
    fail(
      `unknown category "${args.category}"\n  supported: ${Object.keys(CATEGORIES).join(', ')}\n  pending categories — ${DOCS_HINT}`
    );
  }

  if (!fs.existsSync(args.snapshot)) {
    fail(
      `snapshot file not found: ${args.snapshot}\n  Refresh via the figma MCP — ${DOCS_HINT}.`
    );
  }

  const snapshot = readJsonOrFail(args.snapshot, 'snapshot');
  const snapshotSubtree = snapshot[args.category];
  if (!snapshotSubtree) {
    fail(
      `snapshot has no "${args.category}" subtree. Refresh the snapshot or check the category name.`
    );
  }

  const codeTs = gitLastCommitTs(config.file);
  const snapshotTs = gitLastCommitTs(args.snapshot);
  const staleGuardSkipped = codeTs === null || snapshotTs === null;
  if (staleGuardSkipped && isCI()) {
    const shallow = isShallowClone();
    if (shallow) {
      fail(
        `stale-snapshot guard requires full git history but the working tree is a shallow clone. ` +
          `Configure the CI checkout with fetch-depth: 0 (e.g. actions/checkout@v4 with fetch-depth: 0). ${DOCS_HINT}.`
      );
    }
    fail(
      `stale-snapshot guard could not run under CI (git timestamps unavailable for ${path.basename(config.file)} or the snapshot). CI must be able to verify snapshot freshness — fix git availability or stop running this audit in CI.`
    );
  }
  if (!staleGuardSkipped && codeTs > snapshotTs) {
    const codeDate = new Date(codeTs * 1000).toISOString().slice(0, 10);
    const snapDate = new Date(snapshotTs * 1000).toISOString().slice(0, 10);
    fail(
      `snapshot is stale: ${path.basename(config.file)} was last committed ${codeDate}, after snapshot's ${snapDate}. Refresh per .claude/rules/figma.md.`
    );
  }

  const codeData = readJsonOrFail(config.file, 'code file');
  const findings = diffTokenTrees(codeData, snapshotSubtree);

  const meta = snapshotSubtree.$meta;
  const lines = [];
  lines.push(`─── audit-figma-parity --category ${args.category} ───`);
  if (meta?.capturedAt) {
    const source = meta.figmaFileName ? ` (${meta.figmaFileName})` : '';
    lines.push(`  Snapshot: ${meta.capturedAt}${source}`);
  }
  if (staleGuardSkipped) {
    lines.push('  ⚠ stale-snapshot guard skipped (git timestamps unavailable)');
  }
  if (findings.length === 0) {
    lines.push('  ✓ no drift');
    lines.push('');
    lines.push(`Audited ${args.category} — 0 findings.`);
    process.stdout.write(lines.join('\n') + '\n');
    process.exit(EXIT_OK);
  }

  for (const finding of findings) {
    lines.push(formatFinding(finding));
  }
  lines.push('');
  lines.push(`Audited ${args.category} — ${findings.length} drift finding(s).`);
  lines.push('Canonical rule: code wins. Push code values to Figma manually.');
  process.stdout.write(lines.join('\n') + '\n');
  process.exit(EXIT_DRIFT);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    main();
  } catch (err) {
    if (err instanceof ConfigError) {
      process.stderr.write(`audit-figma-parity: ${err.message}\n`);
      process.exit(EXIT_CONFIG);
    }
    throw err;
  }
}
