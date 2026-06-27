# Phase E0 — Friendly Token-Mode Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename Appearance token-mode IDs from internal codenames (nova/mira/maia/vega/lyra/luma/sera, sharp/mellow/blunt) to friendly canonical names (compact/default/…, square/round/…) everywhere Nexus ships them — token files, generated CSS selectors, runtime DOM attributes, public types, docs theme infra, stories, tests — with zero change to any token _value_ or visual behavior.

**Architecture:** The rename is **four independent family maps plus typography**, never a global find-replace. Mode names are _discovered from token filenames_ (`/^{family}-([a-z]+)\.json$/`), so a `git mv` of a token file flips both the discovered mode name and the emitted `[data-*="…"]` selector in one move. Each family is migrated as one **atomic slice** (token rename + hardcoded canonical list + default flag + public type/options/default + sanitize normalization + regenerated CSS + docs `theme-modes.ts` + tests) so the build and runtime theming stay green after every commit. A single frozen rename-map module is the source of truth; a captured value-oracle fixture proves the rename preserved values; a context-scoped audit proves no codename survives in a load-bearing position.

**Tech Stack:** Node ESM build scripts (`packages/core/scripts/`), DTCG JSON tokens, Tailwind v4 CSS generation, TypeScript (`@nexus/core` runtime model), Next.js docs app (`apps/docs`), Vitest.

## Global Constraints

- **Family-scoped, never global.** The same codename maps to a _different_ friendly name per family: `vega` → spacing `regular` / shadow `flat` / borderwidth `normal` / typography `default`; `nova` → density `compact` / elevation `strong` / stroke `strong`; `mira` → density `default` / elevation `standard` / borderwidth `bold`; `maia` → density `relaxed` / elevation `quiet` / stroke `fine`; `lyra` → density `tight` / shadow `soft` / borderwidth `medium`. A repo-wide `s/vega/.../` would corrupt data. Every rename and audit lookup is keyed by family.
- **Atomic per family.** The pre-commit hook (`package.json` `lint-staged`) runs `validate:spacing-modes` on any `spacing-*.json` / `{radius,borderwidth,shadow}/*.json` change, and that validator checks the hardcoded `CANONICAL_*_MODES` lists. So a token-file rename and its canonical-list update **must** land in the same commit, or the commit is rejected. State value and CSS selector must also flip together (see Architecture).
- **No token value changes.** This is a rename only. `git mv` preserves file content byte-for-byte; the value-oracle fixture (Task 1.3) + golden test (Task 2.7) enforce zero value deltas.
- **Unchanged on purpose:** `data-style` / `data-radius` / `data-shadow` / `data-borderwidth` attribute _names_; the `nx:` utility prefix; `--nx-color-*` variables; radius `subtle` and `smooth` modes (already friendly); the `snappy` motion mode (not in this taxonomy); all brand / base / status / chart token names.
- **`extra-round` is the only hyphenated friendly name.** The validator's `modePattern` is `([a-z]+)`, which rejects hyphens. The radius pattern must widen to `([a-z]+(?:-[a-z]+)*)` (Task 2.4). All other friendly names are single words.
- **Pre-production (`.claude/rules/project-stage.md`).** No feature flags, no dual-write. The one deliberate exception is the sanitize _normalization_ of persisted Appearance prefs (Task 2.1), included to honor #546's "accept old persisted values" requirement. It is a one-time read-migration of a user preference, not a behavior toggle, and is isolated to one helper + its wiring so it can be dropped wholesale if the team prefers the clean "version-bump and let stale values fall back to defaults" path. See Task 2.1's note.

### The frozen rename map (source of truth)

| Family                   | Attr               | Codename → Friendly                                                         | Public?                   |
| ------------------------ | ------------------ | --------------------------------------------------------------------------- | ------------------------- |
| **spacing** (density)    | `data-style`       | `nova`→`compact`, `mira`→`default`, `luma`→`comfortable`, `sera`→`spacious` | public (in model)         |
|                          |                    | `lyra`→`tight`, `vega`→`regular`, `maia`→`relaxed`                          | hidden (tokens/docs only) |
| **shadow** (elevation)   | `data-shadow`      | `maia`→`quiet`, `mira`→`standard`, `nova`→`strong`                          | public (in model)         |
|                          |                    | `vega`→`flat`, `lyra`→`soft`                                                | hidden                    |
| **radius** (corners)     | `data-radius`      | `sharp`→`square`, `mellow`→`round`                                          | public (in model)         |
|                          |                    | `blunt`→`extra-round`                                                       | hidden                    |
|                          |                    | `subtle`→`subtle`, `smooth`→`smooth`                                        | **unchanged**             |
| **borderwidth** (stroke) | `data-borderwidth` | `maia`→`fine`, `vega`→`normal`, `nova`→`strong`                             | public (in model)         |
|                          |                    | `lyra`→`medium`, `mira`→`bold`                                              | hidden                    |
| **typography**           | — (global file)    | `vega`→`default`                                                            | hidden                    |

> **Public vs hidden:** the runtime model (`appearance-model.ts`) only exposes the **public** modes (4 density, 4 corners incl. unchanged subtle/smooth, 3 elevation, 3 stroke). Hidden modes exist as token files + CSS selectors + docs picker options, but never enter persisted Appearance state. So the model flip (types/options/defaults/normalizer) touches only public modes; the token rename + docs `theme-modes.ts` touch every mode.

---

## File Structure

**PR-1 — inventory, mapping spec, audit, value oracle (no behavior change):**

- Create `packages/core/scripts/lib/mode-rename-map.js` — frozen four-family map + derived `RETIRED_CODENAMES`. Single source of truth.
- Create `packages/core/scripts/lib/__tests__/mode-rename-map.test.js` — map is a per-family bijection and covers every current token file.
- Create `packages/core/scripts/capture-mode-values.js` — writes the pre-rename value oracle.
- Create `packages/core/scripts/__tests__/__fixtures__/pre-rename-mode-values.json` — committed oracle (generated, then committed).
- Create `packages/core/scripts/audit-mode-codenames.js` — context-scoped codename detector.
- Create `packages/core/scripts/__tests__/audit-mode-codenames.test.js` — proves it flags codenames in load-bearing positions and ignores prose.
- Modify `packages/core/package.json` — add `audit:mode-codenames` and `capture:mode-values` scripts.

**PR-2 — per-family atomic cutover (build + runtime stay green each task):**

- Modify `packages/core/src/lib/appearance-model.ts` — types, option `value`s, defaults, new `normalizeAppearanceModeIds` helper (Task 2.1 + per-family).
- Modify `packages/core/src/lib/appearance-snapshot.ts` — `SNAPSHOT_VERSION` 2 → 3 (Task 2.1).
- `git mv` 28 token files under `packages/core/tokens/` (per family).
- Modify `packages/core/scripts/validate-spacing-modes.js` — `CANONICAL_*_MODES`, `BASELINE_MODE`, per-family `baseline` + radius `modePattern` (per family).
- Modify `packages/core/scripts/utils.js` — `DEFAULT_CONFIG`, `CANONICAL_SPACING_DEFAULT_MODE` (per family).
- Modify `packages/core/package.json` — `build:tokens:modular` and `build:tailwind` flags (per family).
- Regenerated artifacts: `packages/tailwind/*` and `apps/docs/public/themes/*` (via `pnpm tokens:tailwind && pnpm tokens:modular`).
- Modify `apps/docs/app/_lib/theme-modes.ts` — `THEME_MODE_VALUES`, `DEFAULT_THEME_STATE`, `THEME_MODE_OPTIONS`, `THEME_STYLESHEET_HREFS` (per family).
- Modify `apps/docs/app/layout.tsx` — `data-style` default (spacing task).
- Modify tests: `appearance-model.test.ts`, `appearance-snapshot.test.ts`, `scripts/__tests__/*`, `apps/docs/app/_lib/theme-modes.test.ts`.
- Create `packages/core/scripts/__tests__/mode-rename-value-preservation.test.js` (Task 2.7).

**PR-3 — docs content, stories, audit gate, visual QA:**

- Modify `apps/docs/app/_pages/Spacing.tsx`, `MultiBrand.tsx`, `Radius.tsx` — prose + example codenames → friendly.
- Modify any Storybook story referencing modes (audit pass).
- Modify `packages/core/package.json` + CI — wire `audit:mode-codenames` as a blocking gate.
- Update `#546` / `#531` with completion status.

---

## PR-1 — Inventory, Mapping Spec & Context-Scoped Audit

> Freezes the contract and builds the tooling. **No token files renamed, no behavior changed.** Mergeable on its own.

### Task 1.1: Freeze the rename map as the single source of truth

**Files:**

- Create: `packages/core/scripts/lib/mode-rename-map.js`
- Test: `packages/core/scripts/lib/__tests__/mode-rename-map.test.js`

**Produces:** `MODE_RENAME` (object keyed by family → `{codename: friendly}`) and `RETIRED_CODENAMES` (string[]), consumed by the audit (1.4), the value oracle (1.3), the normalizer (2.1), and every per-family slice.

- [ ] **Step 1: Write the failing test**

```js
// packages/core/scripts/lib/__tests__/mode-rename-map.test.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { MODE_RENAME, RETIRED_CODENAMES } from '../mode-rename-map.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS = path.resolve(__dirname, '..', '..', '..', 'tokens');
const UNCHANGED = { radius: new Set(['subtle', 'smooth']) };

describe('mode-rename-map', () => {
  it('is a bijection within each family (no two codenames share a friendly name)', () => {
    for (const [family, map] of Object.entries(MODE_RENAME)) {
      const friendly = Object.values(map);
      expect(new Set(friendly).size, `${family} friendly names collide`).toBe(
        friendly.length
      );
    }
  });

  it('derives RETIRED_CODENAMES as the sorted union of every codename', () => {
    const expected = [
      ...new Set(Object.values(MODE_RENAME).flatMap((m) => Object.keys(m))),
    ].sort();
    expect(RETIRED_CODENAMES).toEqual(expected);
  });

  function expectModeCovered(family, mode) {
    if (UNCHANGED[family]?.has(mode)) return;
    const map = MODE_RENAME[family];
    const friendlyModes = new Set(Object.values(map));
    expect(
      mode in map || friendlyModes.has(mode),
      `${family}-${mode} is not a known codename or friendly target`
    ).toBe(true);
  }

  it('covers every current spacing token file', () => {
    const files = fs
      .readdirSync(path.join(TOKENS, 'semantic'))
      .filter((f) => /^spacing-([a-z]+)\.json$/.test(f))
      .map((f) => f.match(/^spacing-([a-z]+)\.json$/)[1]);
    for (const codename of files) {
      expectModeCovered('spacing', codename);
    }
  });

  it('leaves radius subtle/smooth unchanged (not in the map)', () => {
    expect(MODE_RENAME.radius.subtle).toBeUndefined();
    expect(MODE_RENAME.radius.smooth).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit packages/core/scripts/lib/__tests__/mode-rename-map.test.js`
Expected: FAIL with `Cannot find module '../mode-rename-map.js'` — i.e. the test was **collected and ran**. If you instead see `No test files found`, the `unit` vitest project glob doesn't cover `scripts/lib/__tests__/` — fix the project config before continuing, or the suite is silently green (the #429 trap).

- [ ] **Step 3: Create the map module**

```js
// packages/core/scripts/lib/mode-rename-map.js
//
// Single source of truth for the Phase E0 token-mode rename (#546).
// FAMILY-SCOPED BY DESIGN: the same codename maps to a DIFFERENT friendly name
// per family (e.g. `vega` -> spacing `regular`, shadow `flat`, borderwidth
// `normal`, typography `default`), so a global find-replace corrupts data.
// Every consumer must scope lookups by family. Modes absent from a family's
// map are unchanged (radius `subtle` / `smooth`).
export const MODE_RENAME = {
  spacing: {
    nova: 'compact',
    mira: 'default',
    luma: 'comfortable',
    sera: 'spacious',
    lyra: 'tight',
    vega: 'regular',
    maia: 'relaxed',
  },
  shadow: {
    maia: 'quiet',
    mira: 'standard',
    nova: 'strong',
    vega: 'flat',
    lyra: 'soft',
  },
  radius: {
    sharp: 'square',
    mellow: 'round',
    blunt: 'extra-round',
  },
  borderwidth: {
    maia: 'fine',
    vega: 'normal',
    nova: 'strong',
    lyra: 'medium',
    mira: 'bold',
  },
  typography: {
    vega: 'default',
  },
};

// The codenames going away — what the audit forbids in load-bearing positions
// after migration. Derived from MODE_RENAME so it can never drift.
export const RETIRED_CODENAMES = [
  ...new Set(Object.values(MODE_RENAME).flatMap((m) => Object.keys(m))),
].sort();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit packages/core/scripts/lib/__tests__/mode-rename-map.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/scripts/lib/mode-rename-map.js packages/core/scripts/lib/__tests__/mode-rename-map.test.js
git commit -m "feat(core): freeze Phase E0 token-mode rename map (#546)"
```

### Task 1.2: Confirm the inventory matches the map (drift guard)

**Files:**

- Modify: `packages/core/scripts/lib/__tests__/mode-rename-map.test.js`

**Interfaces:** Consumes `MODE_RENAME` from Task 1.1. This task makes the map's coverage of _primitive_ families (shadow/radius/borderwidth/typography) explicit, so a future added token file without a map entry fails CI.

- [ ] **Step 1: Add the failing coverage test**

```js
// append inside the describe() block in mode-rename-map.test.js
const PRIMITIVE_FAMILIES = {
  shadow: /^shadow-([a-z]+)-(?:light|dark)\.json$/,
  radius: /^radius-([a-z]+(?:-[a-z]+)*)\.json$/,
  borderwidth: /^borderwidth-([a-z]+)\.json$/,
  typography: /^typography-([a-z]+)\.json$/,
};

it.each(Object.entries(PRIMITIVE_FAMILIES))(
  'covers every current %s token file',
  (family, pattern) => {
    const dir = path.join(TOKENS, 'primitives', family);
    const codenames = new Set(
      fs
        .readdirSync(dir)
        .map((f) => f.match(pattern))
        .filter(Boolean)
        .map((m) => m[1])
    );
    for (const codename of codenames) {
      expectModeCovered(family, codename);
    }
  }
);
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm test:unit packages/core/scripts/lib/__tests__/mode-rename-map.test.js`
Expected: PASS — the map already covers all primitive families. (If it FAILS, a token file lacks a map entry; add it to `MODE_RENAME` before continuing.)

- [ ] **Step 3: Commit**

```bash
git add packages/core/scripts/lib/__tests__/mode-rename-map.test.js
git commit -m "test(core): assert rename map covers every token-mode file"
```

### Task 1.3: Capture the pre-rename value oracle

**Files:**

- Create: `packages/core/scripts/capture-mode-values.js`
- Create (generated, then committed): `packages/core/scripts/__tests__/__fixtures__/pre-rename-mode-values.json`
- Modify: `packages/core/package.json` (add `capture:mode-values` script)

**Interfaces:** Produces a fixture mapping `"{family}.{codename}"` → sorted `{leafPath: $value}` of every mode token file **before** any rename. Task 2.7 asserts the friendly files reproduce these exact values.

- [ ] **Step 1: Write the capture script**

```js
// packages/core/scripts/capture-mode-values.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { leafPathsOf } from './validate-spacing-modes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS = path.resolve(__dirname, '..', 'tokens');
const OUT = path.join(
  __dirname,
  '__tests__',
  '__fixtures__',
  'pre-rename-mode-values.json'
);

// [family, dir, filename->codename]
const FAMILIES = [
  ['spacing', path.join(TOKENS, 'semantic'), /^spacing-([a-z]+)\.json$/],
  [
    'shadow',
    path.join(TOKENS, 'primitives', 'shadow'),
    /^shadow-([a-z]+)-(light|dark)\.json$/,
  ],
  [
    'radius',
    path.join(TOKENS, 'primitives', 'radius'),
    /^radius-([a-z]+)\.json$/,
  ],
  [
    'borderwidth',
    path.join(TOKENS, 'primitives', 'borderwidth'),
    /^borderwidth-([a-z]+)\.json$/,
  ],
  [
    'typography',
    path.join(TOKENS, 'primitives', 'typography'),
    /^typography-([a-z]+)\.json$/,
  ],
];

function leafValues(obj) {
  const out = {};
  for (const leafPath of leafPathsOf(obj)) {
    const value = leafPath
      .split('.')
      .reduce((node, key) => node[key], obj).$value;
    out[leafPath] = value;
  }
  return out;
}

const result = {};
for (const [family, dir, pattern] of FAMILIES) {
  for (const file of fs.readdirSync(dir)) {
    const m = file.match(pattern);
    if (!m) continue;
    const codename = m[1];
    const variant = m[2] ? `-${m[2]}` : '';
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    result[`${family}.${codename}${variant}`] = leafValues(data);
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(result, null, 2)}\n`);
console.log(
  `✨ Captured ${Object.keys(result).length} mode value-sets → ${OUT}`
);
```

- [ ] **Step 2: Add the script to package.json**

In `packages/core/package.json` `scripts`, add:

```json
"capture:mode-values": "node scripts/capture-mode-values.js",
```

- [ ] **Step 3: Run it and commit the oracle**

Run: `pnpm --filter @nexus/core capture:mode-values`
Expected: `✨ Captured 28 mode value-sets` (7 spacing + 10 shadow + 5 radius + 5 borderwidth + 1 typography). Confirm the count matches the token files on disk before committing.

```bash
git add packages/core/scripts/capture-mode-values.js packages/core/scripts/__tests__/__fixtures__/pre-rename-mode-values.json packages/core/package.json
git commit -m "test(core): capture pre-rename token-mode value oracle (#546)"
```

### Task 1.4: Build the context-scoped codename audit

**Files:**

- Create: `packages/core/scripts/audit-mode-codenames.js`
- Test: `packages/core/scripts/__tests__/audit-mode-codenames.test.js`
- Modify: `packages/core/package.json` (add `audit:mode-codenames`)

**Interfaces:** Produces `findCodenameViolations({ roots, allowlist }) → Array<{file, line, text}>`. Scans **only load-bearing positions** (token filenames, `data-{style,radius,shadow,borderwidth}="<codename>"`, `[data-{family}="<codename>"]` selectors, `/themes/{family}-{codename}.css` paths) — never bare words in prose/comments. The CLI exits 1 if any violation is outside the allowlist.

> **Why context-scoped, not allowlist-on-grep.** Raw codename counts are high and dominated by legitimate/unchanged uses (`subtle` 118 files — _kept_; `vega` 59, `nova` 48, `maia` 43, `sharp` 30 — a mix of to-migrate refs and unrelated words like the `sharp` image lib or `luma`/luminance). A blanket word-grep would force a 100+-entry allowlist. By matching only the positions where a codename is load-bearing, the allowlist shrinks to two principled entries: the rename map itself (it names codenames by design) and the changelog.

- [ ] **Step 1: Write the failing test**

```js
// packages/core/scripts/__tests__/audit-mode-codenames.test.js
import { describe, expect, it } from 'vitest';

import { scanText } from '../audit-mode-codenames.js';

describe('audit-mode-codenames scanText', () => {
  it('flags a retired codename in a data-attribute value', () => {
    const hits = scanText('app.tsx', '<div data-style="nova">');
    expect(hits).toHaveLength(1);
  });

  it('flags a retired codename in a CSS selector', () => {
    const hits = scanText('x.css', '[data-radius="sharp"] { --r: 0; }');
    expect(hits).toHaveLength(1);
  });

  it('flags a retired codename in a /themes/ href', () => {
    const hits = scanText(
      'm.ts',
      "shadow: { maia: '/themes/shadow-maia.css' }"
    );
    expect(hits).toHaveLength(1);
  });

  it('ignores codenames in prose and comments', () => {
    const hits = scanText('doc.md', 'The mira mode was once called nova.');
    expect(hits).toHaveLength(0);
  });

  it('ignores unchanged modes and unrelated words', () => {
    expect(scanText('x.css', '[data-radius="subtle"]')).toHaveLength(0);
    expect(scanText('a.ts', "import sharp from 'sharp';")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit packages/core/scripts/__tests__/audit-mode-codenames.test.js`
Expected: FAIL — `Cannot find module '../audit-mode-codenames.js'`.

- [ ] **Step 3: Implement the audit**

```js
// packages/core/scripts/audit-mode-codenames.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RETIRED_CODENAMES } from './lib/mode-rename-map.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const CODE = RETIRED_CODENAMES.join('|'); // blunt|luma|lyra|maia|mellow|mira|nova|sera|sharp|vega
const FAMILY = 'style|radius|shadow|borderwidth';

// Load-bearing positions ONLY. Each pattern is a place a codename controls
// behavior; prose, comments, and unrelated identifiers are not matched.
const PATTERNS = [
  new RegExp(`data-(?:${FAMILY})\\s*=\\s*["'](?:${CODE})["']`), // JSX attr
  new RegExp(`\\[data-(?:${FAMILY})=["'](?:${CODE})["']\\]`), // CSS selector
  new RegExp(
    `/themes/(?:spacing|shadow|radius|borderwidth|typography)-(?:${CODE})(?:-(?:light|dark))?\\.css`
  ),
];

// Token *filenames* are checked separately (the codename is the file, not a line).
const FILENAME_PATTERN = new RegExp(
  `^(?:spacing|shadow|radius|borderwidth|typography)-(?:${CODE})(?:-(?:light|dark))?\\.json$`
);

export function scanText(file, text) {
  const hits = [];
  text.split('\n').forEach((line, i) => {
    if (PATTERNS.some((re) => re.test(line))) {
      hits.push({ file, line: i + 1, text: line.trim() });
    }
  });
  return hits;
}

const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.json']);
const SKIP_DIR = new Set([
  'node_modules',
  'dist',
  'storybook-static',
  '.next',
  '.turbo',
  '__generated__',
]);
// The two principled homes where codenames legitimately remain post-migration.
const DEFAULT_ALLOWLIST = [
  'packages/core/scripts/lib/mode-rename-map.js',
  'packages/core/scripts/capture-mode-values.js',
  'packages/core/scripts/__tests__/__fixtures__/pre-rename-mode-values.json',
  'apps/docs/app/changelog',
];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIR.has(entry.name)) continue;
      yield* walk(path.join(dir, entry.name));
    } else {
      yield path.join(dir, entry.name);
    }
  }
}

export function findCodenameViolations({
  roots = ['packages', 'apps'],
  allowlist = DEFAULT_ALLOWLIST,
} = {}) {
  const violations = [];
  const isAllowed = (rel) => allowlist.some((a) => rel.startsWith(a));
  for (const root of roots) {
    const abs = path.join(REPO_ROOT, root);
    if (!fs.existsSync(abs)) continue;
    for (const file of walk(abs)) {
      const rel = path.relative(REPO_ROOT, file);
      if (isAllowed(rel)) continue;
      if (FILENAME_PATTERN.test(path.basename(file))) {
        violations.push({
          file: rel,
          line: 0,
          text: `token filename: ${path.basename(file)}`,
        });
        continue;
      }
      if (!SCAN_EXT.has(path.extname(file))) continue;
      for (const hit of scanText(rel, fs.readFileSync(file, 'utf8'))) {
        violations.push(hit);
      }
    }
  }
  return violations;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const violations = findCodenameViolations();
  if (violations.length === 0) {
    console.log(
      '✅ No retired token-mode codenames in load-bearing positions.'
    );
    process.exit(0);
  }
  console.error(`❌ ${violations.length} retired codename reference(s):`);
  for (const v of violations) {
    console.error(`  ${v.file}${v.line ? `:${v.line}` : ''} — ${v.text}`);
  }
  process.exit(1);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit packages/core/scripts/__tests__/audit-mode-codenames.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Add the script (tool only — not yet a CI gate)**

In `packages/core/package.json` `scripts`, add:

```json
"audit:mode-codenames": "node scripts/audit-mode-codenames.js",
```

> Do **not** wire this into CI or `lint-staged` yet — pre-migration it will (correctly) report every current codename and exit 1. PR-3 Task 3.3 flips it to a blocking gate once the repo is clean.

- [ ] **Step 6: Commit**

```bash
git add packages/core/scripts/audit-mode-codenames.js packages/core/scripts/__tests__/audit-mode-codenames.test.js packages/core/package.json
git commit -m "feat(core): add context-scoped token-mode codename audit (#546)"
```

---

## PR-2 — Per-Family Atomic Cutover

> **Revised 2026-06-28** — after #549 (PR-1) merged and an alternative cutover plan was evaluated. Deltas vs the original PR-2: (1) added **Task 2.0** (shared discovery manifest, carry-forward from the #549 architect follow-up) and moved the radius-regex widening into it; (2) threaded the **build-critical token-JSON story imports** (`packages/react/src/stories/*.stories.tsx`) into each family slice — they were missing and would break the `@nexus/react` typecheck/build the instant a token file moves; (3) **removed the `git checkout packages/core/package.json` drift step** — verified no generator writes `package.json`, so that line would have reverted the intended flag edits; (4) recorded two **deliberate exclusions** (no docs persisted-state normalization, no bootstrap v2-snapshot salvage) so an executor doesn't add the over-scope an alternative plan proposed.

> Each task leaves the build **and `test:storybook`** green (`pnpm typecheck`, `pnpm test:unit`, `pnpm validate:spacing-modes`; plus `pnpm test:storybook` at finalization — Task 2.8) and runtime theming correct. **Scope criterion: anything a CI gate asserts behavior on — including `test:storybook` per-mode play functions — migrates in PR-2; only references nothing asserts on (prose, demo labels) defer to PR-3.** Tasks 2.2–2.6 are independent families; they share files (`appearance-model.ts`, the discovery manifest, `utils.js`, `package.json`, `theme-modes.ts`, and `Radius.stories.tsx`), so run them **sequentially**, not in parallel. Task 2.0 lands first, then 2.1; Task 2.7 lands last.

**Pre-flight (run once before Task 2.2):**

- [ ] Read `packages/core/scripts/generate-modular.js` and `packages/core/scripts/generate-tailwind-package.js` end-to-end and confirm they resolve default modes **only** from `DEFAULT_CONFIG`/CLI flags (Task 2.x updates those) — not from a stray hardcoded `'maia'`/`'vega'`/`'sharp'`/`'mira'` literal. If a hardcoded default exists, add its update to the relevant family slice's Step 4. (The CSS audit + golden test are nets, but a hardcoded _default_ would silently ship the wrong baseline, not a leftover codename.)
- [ ] Grep consumers for hardcoded mode literals rather than option iteration: `rg -n "'(nova|mira|maia|vega|lyra|luma|sera|sharp|mellow|blunt)'" packages/react/src apps/console/src` (or the console source root). Expect matches only where a `Record`/`switch` keys on a literal — those break when the type flips and must move to the family slice. Provider/`ThemeControls` should iterate `*_OPTIONS`; if they do, the type flip is safe.
- [ ] Confirm the build-critical story imports: `rg -n "tokens/.*(spacing|shadow|radius|borderwidth|typography)-" packages/react/src/stories`. Expected hits (verified 2026-06-28): `Spacing.stories.tsx` (7 spacing), `Shadow.stories.tsx` (10 shadow ×light/dark), `Radius.stories.tsx` (3 radius + 5 borderwidth), `Typography.stories.tsx` (1). These `import … from '../../../core/tokens/…'` by codename path, so each family slice MUST update the matching imports in the same commit as its `git mv` (see each slice's story step) or `@nexus/react` typecheck breaks.
- [ ] **Inventory the component per-mode SIZE stories (test-critical — do NOT defer to PR-3).** `rg -n "SPACING_MODES|data-style=\"|data-testid=.*-(nova|mira|maia|vega|lyra|luma|sera)" packages/react/src/components/ui packages/react/src/stories`. The shared driver `packages/react/src/stories/spacing-modes.tsx` (`SPACING_MODES` array + `AllModesRow data-style={mode}`) plus per-component stories (`accordion/alert/button/card/dialog/input/input-group/select`, `Spacing.stories.tsx`, and the `test-utils.ts` helper) assert per-mode component sizing via codename `data-style`, `data-testid="…-<codename>"` suffixes, and **codename-keyed expected-height maps** (e.g. `Button.stories.tsx { vega: 32, … }`). A spacing rename orphans them → `test:storybook` play tests fail (typecheck does NOT catch it — they're plain string literals). Migrate every spacing codename → friendly in these files **inside the spacing slice (Task 2.2)**, values byte-identical. The context-scoped audit cannot see dynamic attrs / testid suffixes / map-keys, so the audit residual is **not** a complete inventory — `pnpm test:storybook` is.

### Task 2.0: Extract a shared token-mode discovery manifest

> Carry-forward from the #549 review (architect follow-up). The token-mode `(dir, regex, expected-modes, baseline, fileName)` layout is duplicated across `validate-spacing-modes.js` (`modeFamilyConfigs`), `capture-mode-values.js`, and `mode-rename-map.test.js`. Consolidate **before** the cutover edits every site. **No behavior change.**

**Files:**

- Create: `packages/core/scripts/lib/token-mode-manifest.js`
- Modify: `packages/core/scripts/validate-spacing-modes.js`, `packages/core/scripts/capture-mode-values.js`, `packages/core/scripts/lib/__tests__/mode-rename-map.test.js`

> **Decision — keep it scripts-internal; do NOT export from `@nexus/core`.** The consumers are three same-package `.js` modules. The review floated a `@nexus/core` public export so the docs `.ts` test could bind to it too — but a `.js`→`.ts` import across the package boundary into core's unpublished `scripts/` is worse than the small duplication it removes (typecheck friction + still reaching into unpublished source). So the manifest serves the three `.js` consumers only; the docs `theme-modes.test.ts` keeps its own local discovery (already widened and reading core `tokens/` since #549 — a test-only monorepo read). If a consumer-facing "available modes" list is ever wanted, promote the manifest to a typed public export then — out of scope here.

- [ ] **Step 1: Create the manifest** — move the per-family config out of `validate-spacing-modes.js` into `token-mode-manifest.js`, exporting two explicit views:
  - `TOKEN_MODE_FAMILIES` for every discoverable rename family: spacing, shadow, radius, borderwidth, typography.
  - `KEY_PARITY_MODE_FAMILY_CONFIGS` for the families the validator should compare: spacing, radius, borderwidth, shadow-light, shadow-dark. Typography stays discovery-only because it is a single mode, not a key-parity family.
    Each key-parity entry keeps the existing `{ name, reportName, dir, baseline, expectedModes, modePattern, fileName }` shape, and the manifest also exports the `CANONICAL_*_MODES` arrays and `BASELINE_MODE`. **Widen the radius `modePattern` here, now**, to `/^radius-([a-z]+(?:-[a-z]+)*)\.json$/` — a superset of `([a-z]+)`, so current single-word files match identically (no behavior change) and the radius slice (2.4) just adds `radius-extra-round.json` without touching the regex.

- [ ] **Step 2: Refactor the three consumers** — `validate-spacing-modes.js` imports `KEY_PARITY_MODE_FAMILY_CONFIGS` / canonicals from the manifest (keeping its CLI + exit-code logic and re-exporting the canonicals it already exported); `capture-mode-values.js` and `mode-rename-map.test.js` import `TOKEN_MODE_FAMILIES` from the manifest instead of re-declaring token directories and regexes.

- [ ] **Step 3: Verify no behavior change** — `pnpm validate:spacing-modes && pnpm test:unit` pass; re-run `pnpm --filter @nexus/core capture:mode-values` and confirm `git diff packages/core/scripts/__tests__/__fixtures__/pre-rename-mode-values.json` is **empty** (the oracle is byte-identical).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(core): extract shared token-mode discovery manifest (#546)"
```

### Task 2.1: Add the normalizer and bump the snapshot version

**Files:**

- Modify: `packages/core/src/lib/appearance-model.ts`
- Modify: `packages/core/src/lib/appearance-snapshot.ts`
- Test: `packages/core/src/lib/appearance-model.test.ts`

**Interfaces:** Produces `normalizeAppearanceModeIds(raw: unknown): unknown` — a pure function that, for the four public-mode fields, maps any retired codename → its friendly name (identity on already-friendly values and on non-strings). Consumed by `sanitizeNexusAppearance` (wired per-family in 2.2–2.5).

> **project-stage.md note.** This normalizer is the one deliberate back-compat shim (it lets a returning dogfooder's persisted `density:'nova'` resolve to `'compact'` instead of resetting to default). It is included to honor #546's "accept old persisted values." If the team prefers the strict project-stage.md path (clean over safe), delete this task: the `SNAPSHOT_VERSION` bump alone forces a recompute, and `enumOr` already falls stale values back to defaults. The rest of the plan does not depend on the normalizer existing.

> **Two exclusions — do NOT add these (an alternative plan proposed them; both are out of scope):**
>
> 1. **No bootstrap v2-snapshot salvage.** The `SNAPSHOT_VERSION` bump to 3 is required — without it a stale v2 snapshot would set `data-style="nova"` against the renamed CSS and break spacing. But do **not** teach `createNexusAppearanceBootstrapScript` to read v2 snapshots and normalize old IDs inline: the bump already invalidates v2 → `sanitizeNexusAppearance` recovers the state on hydrate (correct second paint; a one-time _flash_, not a reset), and the engine-free bootstrap cannot recompute `themeCss`, so colors flash to default regardless — the salvage only rescues the `data-*` attrs. It is a back-compat path in an inline script against project-stage.md for a half-fixed one-time flash. Skip it.
> 2. **No docs persisted-state normalization.** Old docs picker selections fall back to defaults on the rename deploy (`sanitizeThemeState` per-field fallback) — one-time, pre-production-acceptable. If docs persistence is later wanted, it must normalize against the **full** per-family map (docs storage holds the hidden modes too — `lyra`/`vega`/`maia`/`blunt`/…), **not** the public-only `PUBLIC_MODE_RENAME`, which would silently drop hidden values.

- [ ] **Step 1: Write the failing test**

```ts
// add to packages/core/src/lib/appearance-model.test.ts
import { normalizeAppearanceModeIds } from './appearance-model';

describe('normalizeAppearanceModeIds', () => {
  // The map ships EMPTY in 2.1 and is populated per family in 2.2–2.5; these
  // two invariants hold at every point in the migration. The codename→friendly
  // assertions live in each family slice (e.g. 2.2 asserts density nova→compact).
  it('is identity on already-friendly values and non-strings', () => {
    expect(
      normalizeAppearanceModeIds({ density: 'compact', corners: 7 })
    ).toMatchObject({ density: 'compact', corners: 7 });
  });

  it('passes non-records through unchanged', () => {
    expect(normalizeAppearanceModeIds('nope')).toBe('nope');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit packages/core/src/lib/appearance-model.test.ts`
Expected: FAIL — `normalizeAppearanceModeIds is not a function`.

- [ ] **Step 3: Implement the normalizer**

In `appearance-model.ts`, above `sanitizeNexusAppearance`, add:

```ts
// Retired codename -> friendly name, for the four PUBLIC mode fields only
// (the only modes that ever entered persisted Appearance state). Mirrors the
// public rows of scripts/lib/mode-rename-map.js; see #546.
// Ships EMPTY here; each family slice (2.2–2.5) adds its entries exactly as
// that family's enum flips to friendly, so normalization is never live ahead
// of the set that accepts its output.
const PUBLIC_MODE_RENAME: Record<
  'density' | 'corners' | 'elevation' | 'stroke',
  Record<string, string>
> = {
  density: {},
  corners: {},
  elevation: {},
  stroke: {},
};

export function normalizeAppearanceModeIds(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  const out: Record<string, unknown> = { ...raw };
  for (const [field, map] of Object.entries(PUBLIC_MODE_RENAME)) {
    const value = out[field];
    if (typeof value === 'string' && value in map) out[field] = map[value];
  }
  return out;
}
```

Then make `sanitizeNexusAppearance` normalize first — change its opening from:

```ts
export function sanitizeNexusAppearance(raw: unknown): NexusAppearanceState {
  if (!isRecord(raw)) return DEFAULT_NEXUS_APPEARANCE;
  const d = DEFAULT_NEXUS_APPEARANCE;
```

to:

```ts
export function sanitizeNexusAppearance(rawInput: unknown): NexusAppearanceState {
  if (!isRecord(rawInput)) return DEFAULT_NEXUS_APPEARANCE;
  const raw = normalizeAppearanceModeIds(rawInput) as Record<string, unknown>;
  const d = DEFAULT_NEXUS_APPEARANCE;
```

> **Why the map ships empty.** If 2.1 introduced the full map before any family flipped, a returning user with `density:'nova'` would: version-bump invalidates the snapshot → recompute → `normalize('nova')→'compact'` → `enumOr('compact', {nova,mira,luma,sera}, 'mira')` rejects `'compact'` (not yet in the codename set) → resets to `'mira'`. That is a (transient, self-healing-at-2.2) **regression** vs. pre-2.1 behavior. Shipping an empty map keeps 2.1 pure identity: `'nova'`→`'nova'`→accepted by the still-codename set → no reset. Each family slice then adds its entries in the same commit that flips its `enumOr` set, so normalization output is always immediately acceptable. The codename→friendly normalize assertion lives in each family slice's Step 1.

- [ ] **Step 4: Bump the snapshot version**

In `appearance-snapshot.ts`, change:

```ts
export const SNAPSHOT_VERSION = 2;
```

to:

```ts
export const SNAPSHOT_VERSION = 3;
```

- [ ] **Step 5: Update the snapshot-version test**

In `packages/core/src/lib/appearance-snapshot.test.ts`, find the assertion referencing `version: 2` (or `SNAPSHOT_VERSION`) and update the literal to `3`. Run the file to confirm.

- [ ] **Step 6: Run tests**

Run: `pnpm test:unit packages/core/src/lib/appearance-model.test.ts packages/core/src/lib/appearance-snapshot.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/lib/appearance-model.ts packages/core/src/lib/appearance-snapshot.ts packages/core/src/lib/appearance-model.test.ts packages/core/src/lib/appearance-snapshot.test.ts
git commit -m "feat(core): add mode-id normalizer, bump snapshot version to 3 (#546)"
```

### Task 2.2: Migrate the spacing (density) family

**Files:**

- `git mv`: 7 files under `packages/core/tokens/semantic/`
- Modify: `packages/core/scripts/validate-spacing-modes.js`, `packages/core/scripts/utils.js`, `packages/core/package.json`, `packages/core/src/lib/appearance-model.ts`
- Modify: `apps/docs/app/_lib/theme-modes.ts`, `apps/docs/app/layout.tsx`
- Modify (regenerated): `packages/tailwind/*`, `apps/docs/public/themes/*`
- Test: `appearance-model.test.ts`, `appearance-snapshot.test.ts`, `scripts/__tests__/*` (spacing assertions), `apps/docs/app/_lib/theme-modes.test.ts`

- [ ] **Step 1: Update test expectations to friendly (failing)**

In `packages/core/src/lib/appearance-model.test.ts`, update density expectations: default `density` `'mira'` → `'default'`; `DENSITY_OPTIONS` value codenames → friendly (`nova`→`compact`, `mira`→`default`, `luma`→`comfortable`, `sera`→`spacious`); and add a normalize-survives assertion:

```ts
it('normalizes a persisted density codename to its friendly value', () => {
  expect(sanitizeNexusAppearance({ density: 'nova' }).density).toBe('compact');
});
```

In `appearance-snapshot.test.ts`, update the `resolveFirstPaint` expectation `'data-style': 'mira'` → `'data-style': 'default'`.

In `scripts/__tests__/generate-modular.test.js`, `generate-tailwind-package.test.js`, `spacing-modes.test.js`, `utils.test.js`: replace spacing selector/mode literals (`[data-style="mira"]`, the 7-mode set, `spacingDefault` override expectations) with the friendly equivalents (`[data-style="default"]`; modes `compact/default/comfortable/spacious/tight/regular/relaxed`).

In `apps/docs/app/_lib/theme-modes.test.ts`: replace spacing codenames in fixtures/expectations with friendly.

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:unit packages/core/src/lib/appearance-model.test.ts`
Expected: FAIL (default density still `'mira'`).

- [ ] **Step 3: Rename the token files**

```bash
cd packages/core/tokens/semantic
git mv spacing-nova.json spacing-compact.json
git mv spacing-mira.json spacing-default.json
git mv spacing-luma.json spacing-comfortable.json
git mv spacing-sera.json spacing-spacious.json
git mv spacing-lyra.json spacing-tight.json
git mv spacing-vega.json spacing-regular.json
git mv spacing-maia.json spacing-relaxed.json
cd -
```

- [ ] **Step 4: Update the hardcoded spacing lists**

In `packages/core/scripts/validate-spacing-modes.js`:

- `export const BASELINE_MODE = 'vega';` → `export const BASELINE_MODE = 'regular';`
- `CANONICAL_MODES` array → `['comfortable', 'compact', 'default', 'regular', 'relaxed', 'spacious', 'tight']` (alphabetical).

In `packages/core/scripts/utils.js`:

- `DEFAULT_CONFIG.spacingDefault: 'mira'` → `'default'`.
- `export const CANONICAL_SPACING_DEFAULT_MODE = 'vega';` → `= 'regular';`.

In `packages/core/package.json`:

- `build:tokens:modular`: `--spacingDefault=mira` → `--spacingDefault=default`.
- `build:tailwind`: `--spacingDefault=mira` → `--spacingDefault=default`.

- [ ] **Step 5: Flip the density model**

In `appearance-model.ts`:

- `export type NexusDensity = 'nova' | 'mira' | 'luma' | 'sera';` → `'compact' | 'default' | 'comfortable' | 'spacious';`
- `DENSITY_OPTIONS` — change each `value` to friendly (labels already read Compact/Default/Comfortable/Spacious): `{ value: 'compact', label: 'Compact' }, { value: 'default', label: 'Default' }, { value: 'comfortable', label: 'Comfortable' }, { value: 'spacious', label: 'Spacious' }`.
- `DEFAULT_NEXUS_APPEARANCE.density: 'mira'` → `'default'`.
- Populate the density normalizer entries (empty since 2.1): `PUBLIC_MODE_RENAME.density = { nova: 'compact', mira: 'default', luma: 'comfortable', sera: 'spacious' }`. This lands in the same commit that flips `DENSITIES` to friendly, so `normalize('nova')→'compact'` is immediately accepted by the new set (the `density: 'nova'` → `'compact'` assertion added in Step 1 now passes).

- [ ] **Step 6: Update the docs spacing infra**

In `apps/docs/app/_lib/theme-modes.ts`:

- `THEME_MODE_VALUES.spacing: ['vega','lyra','maia','mira','nova','luma','sera']` → `['regular','tight','relaxed','default','compact','comfortable','spacious']`.
- `DEFAULT_THEME_STATE.spacing: 'mira'` → `'default'`.
- `THEME_MODE_OPTIONS.spacing` — friendly values + labels: `{value:'regular',label:'Regular'}, {value:'tight',label:'Tight'}, {value:'relaxed',label:'Relaxed'}, {value:'default',label:'Default'}, {value:'compact',label:'Compact'}, {value:'comfortable',label:'Comfortable'}, {value:'spacious',label:'Spacious'}`.

In `apps/docs/app/layout.tsx`: `data-style="mira"` → `data-style="default"`.

- [ ] **Step 6b: Update the build-critical story imports** — in `packages/react/src/stories/Spacing.stories.tsx`, update the 7 token-JSON import **paths** to the friendly filenames (`spacing-nova.json` → `spacing-compact.json`, `spacing-mira.json` → `spacing-default.json`, … `spacing-vega.json` → `spacing-regular.json`); rename the local bindings to match for readability (`spacingNova` → `spacingCompact`, …). This MUST be in this commit — `@nexus/react` typecheck/build resolves these paths and breaks the moment the token files move. Also re-key its `MODE_FILES` map + `DEFAULT_MODE` (codename → friendly), since `SpacingMode` (from `spacing-modes.tsx`) flips in Step 6c.

- [ ] **Step 6c: Migrate the per-mode SIZE stories (test-critical — fails `test:storybook` otherwise).** Apply the spacing map (`vega→regular, lyra→tight, maia→relaxed, mira→default, nova→compact, luma→comfortable, sera→spacious`, values byte-identical) to every spacing codename in: `stories/spacing-modes.tsx` (`SPACING_MODES`), `stories/test-utils.ts`, and the component stories that assert per-mode sizing via `data-style` / `data-testid="…-<codename>"` / codename-keyed expected-height maps — `accordion`, `alert`, `button`, `card`, `dialog`, `input`, `input-group`, `select`, plus the silent-degradation set (`tabs`, `badge`, `button-group`, `dropdown-menu`) so their assertions aren't left vacuous. A word-boundaried script is safe (verified: these files carry **no** `data-radius`/`shadow`/`borderwidth` codenames, so the spacing map is unambiguous). `pnpm --filter @nexus/react typecheck` flags any straggler (e.g. a `SpacingMode`-typed codename key); `pnpm test:storybook` is the real gate.

- [ ] **Step 7: Regenerate artifacts**

```bash
pnpm tokens:tailwind && pnpm tokens:modular
```

> Then confirm the regen touched only generated outputs: `git diff --stat packages/core/package.json` should be **empty** (no generator writes `package.json` — verified 2026-06-28; the historical `--brand` drift no longer applies). If it is somehow non-empty, investigate before committing — do **not** blind-`checkout`, which would revert the intended `--spacingDefault` edit from Step 4.

- [ ] **Step 8: Validate, typecheck, test**

Run: `pnpm validate:spacing-modes && pnpm typecheck && pnpm test:unit`
Expected: PASS. (`validate:spacing-modes` confirms the renamed files match `CANONICAL_MODES`; the appearance + script tests pass with friendly literals.)

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(core): rename spacing density modes to friendly names (#546)"
```

### Task 2.3: Migrate the shadow (elevation) family

**Files:** `git mv` 10 files under `packages/core/tokens/primitives/shadow/`; modify `validate-spacing-modes.js`, `utils.js`, `package.json`, `appearance-model.ts`, `apps/docs/app/_lib/theme-modes.ts`; regenerate; update tests.

- [ ] **Step 1: Update test expectations to friendly (failing)** — elevation default `'maia'` → `'quiet'`; `ELEVATION_OPTIONS` values `maia`→`quiet`, `mira`→`standard`, `nova`→`strong`; `appearance-snapshot.test.ts` `'data-shadow': 'maia'` → `'quiet'`; `scripts/__tests__/mode-collectors.test.js` + `generate-tailwind-package.test.js` shadow selectors/lists → friendly; `theme-modes.test.ts` shadow fixtures → friendly; add `expect(sanitizeNexusAppearance({ elevation: 'maia' }).elevation).toBe('quiet');`.

- [ ] **Step 2: Run to verify failure** — `pnpm test:unit packages/core/src/lib/appearance-model.test.ts` → FAIL.

- [ ] **Step 3: Rename token files**

```bash
cd packages/core/tokens/primitives/shadow
git mv shadow-maia-light.json shadow-quiet-light.json
git mv shadow-maia-dark.json shadow-quiet-dark.json
git mv shadow-mira-light.json shadow-standard-light.json
git mv shadow-mira-dark.json shadow-standard-dark.json
git mv shadow-nova-light.json shadow-strong-light.json
git mv shadow-nova-dark.json shadow-strong-dark.json
git mv shadow-vega-light.json shadow-flat-light.json
git mv shadow-vega-dark.json shadow-flat-dark.json
git mv shadow-lyra-light.json shadow-soft-light.json
git mv shadow-lyra-dark.json shadow-soft-dark.json
cd -
```

- [ ] **Step 4: Update hardcoded lists** — in `validate-spacing-modes.js`: `CANONICAL_SHADOW_MODES = ['flat', 'quiet', 'soft', 'standard', 'strong']`; both shadow configs' `baseline: 'maia'` → `'quiet'`. In `utils.js`: `DEFAULT_CONFIG.shadow: 'maia'` → `'quiet'`. In `package.json` `build:tailwind`: `--shadow=maia` → `--shadow=quiet`.

- [ ] **Step 5: Flip the elevation model** — `NexusElevation = 'quiet' | 'standard' | 'strong';`; `ELEVATION_OPTIONS` values → friendly (labels already Quiet/Standard/Strong); `DEFAULT_NEXUS_APPEARANCE.elevation: 'maia'` → `'quiet'`. Populate `PUBLIC_MODE_RENAME.elevation = { maia: 'quiet', mira: 'standard', nova: 'strong' }`.

- [ ] **Step 6: Update docs shadow infra** — in `theme-modes.ts`: `THEME_MODE_VALUES.shadow` → `['flat','soft','quiet','standard','strong']`; `DEFAULT_THEME_STATE.shadow: 'maia'` → `'quiet'`; `THEME_MODE_OPTIONS.shadow` values+labels → friendly; `THEME_STYLESHEET_HREFS.shadow` → `{ flat:'/themes/shadow-flat.css', soft:'/themes/shadow-soft.css', quiet:'/themes/shadow-quiet.css', standard:'/themes/shadow-standard.css', strong:'/themes/shadow-strong.css' }`.

- [ ] **Step 6b: Story imports** — in `packages/react/src/stories/Shadow.stories.tsx`, update the 10 shadow token-JSON import paths + bindings to friendly (`shadow-maia-{light,dark}.json` → `shadow-quiet-{light,dark}.json`, `shadow-mira-*` → `shadow-standard-*`, `shadow-nova-*` → `shadow-strong-*`, `shadow-vega-*` → `shadow-flat-*`, `shadow-lyra-*` → `shadow-soft-*`). Same commit as the `git mv` (build-critical).

- [ ] **Step 7: Regenerate** — `pnpm tokens:tailwind && pnpm tokens:modular`; then confirm `git diff --stat packages/core/package.json` is empty (no generator writes it — do not blind-`checkout`).

- [ ] **Step 8: Validate + test** — `pnpm validate:spacing-modes && pnpm typecheck && pnpm test:unit` → PASS.

- [ ] **Step 9: Commit** — `git add -A && git commit -m "feat(core): rename shadow elevation modes to friendly names (#546)"`

### Task 2.4: Migrate the radius (corners) family — adds the hyphenated `extra-round`

**Files:** `git mv` 3 files under `packages/core/tokens/primitives/radius/` (subtle/smooth untouched); modify the manifest (radius `baseline`; regex already widened in 2.0), `utils.js`, `package.json`, `appearance-model.ts`, `theme-modes.ts`, `Radius.stories.tsx` (radius imports); regenerate; update tests.

- [ ] **Step 1: Update test expectations to friendly (failing)** — corners default `'sharp'` → `'square'`; `CORNER_OPTIONS` values `sharp`→`square`, `mellow`→`round` (subtle/smooth unchanged); `appearance-snapshot.test.ts` `'data-radius': 'sharp'` → `'square'`; `scripts/__tests__/mode-collectors.test.js` radius selectors/list → friendly; `theme-modes.test.ts` radius fixtures → friendly; add `expect(sanitizeNexusAppearance({ corners: 'mellow' }).corners).toBe('round');`.

- [ ] **Step 2: Run to verify failure** — FAIL.

- [ ] **Step 3: Confirm the radius regex (widened in 2.0) + flip the baseline**

The radius `modePattern` was already widened to `/^radius-([a-z]+(?:-[a-z]+)*)\.json$/` in the Task 2.0 manifest, so `radius-extra-round.json` is discoverable. Here: confirm that's in place, and flip the radius `baseline` in the manifest `'sharp'` → `'square'`. (The generator's own `discoverPrimitives` uses `/^${category}-(.+)\.json$/`, which already accepts hyphens.)

- [ ] **Step 4: Rename token files**

```bash
cd packages/core/tokens/primitives/radius
git mv radius-sharp.json radius-square.json
git mv radius-mellow.json radius-round.json
git mv radius-blunt.json radius-extra-round.json
cd -
```

- [ ] **Step 5: Update hardcoded list** — `CANONICAL_RADIUS_MODES = ['extra-round', 'round', 'smooth', 'square', 'subtle']` (alphabetical). In `utils.js`: `DEFAULT_CONFIG.radius: 'sharp'` → `'square'`. In `package.json` `build:tailwind`: `--radius=sharp` → `--radius=square`.

- [ ] **Step 6: Flip the corners model** — `NexusCorners = 'square' | 'subtle' | 'smooth' | 'round';`; `CORNER_OPTIONS` values `sharp`→`square`, `mellow`→`round` (subtle/smooth rows unchanged); `DEFAULT_NEXUS_APPEARANCE.corners: 'sharp'` → `'square'`. Populate `PUBLIC_MODE_RENAME.corners = { sharp: 'square', mellow: 'round' }` (subtle/smooth are identity — omit).

- [ ] **Step 7: Update docs radius infra** — in `theme-modes.ts`: `THEME_MODE_VALUES.radius` → `['square','subtle','smooth','round','extra-round']`; `DEFAULT_THEME_STATE.radius: 'sharp'` → `'square'`; `THEME_MODE_OPTIONS.radius` values+labels → friendly (`Square`, `Subtle`, `Smooth`, `Round`, `Extra round`); `THEME_STYLESHEET_HREFS.radius` → `{ square:'/themes/radius-square.css', subtle:'/themes/radius-subtle.css', smooth:'/themes/radius-smooth.css', round:'/themes/radius-round.css', 'extra-round':'/themes/radius-extra-round.css' }`.

- [ ] **Step 7b: Story imports (radius only)** — in `packages/react/src/stories/Radius.stories.tsx`, update the 3 **radius** token-JSON imports + bindings to friendly (`radius-sharp.json` → `radius-square.json`, `radius-mellow.json` → `radius-round.json`, `radius-blunt.json` → `radius-extra-round.json`). Leave the 5 `borderwidth-*` imports in this same file untouched — those still resolve (renamed in Task 2.5). Build-critical: same commit as the `git mv`.

- [ ] **Step 8: Regenerate** — `pnpm tokens:tailwind && pnpm tokens:modular`; then confirm `git diff --stat packages/core/package.json` is empty (do not blind-`checkout`).

- [ ] **Step 9: Validate + test** — `pnpm validate:spacing-modes && pnpm typecheck && pnpm test:unit` → PASS. Confirm the `[data-radius="extra-round"]` selector is present in `packages/tailwind/nexus.css` (proves the widened pattern + hyphen survived generation).

- [ ] **Step 10: Commit** — `git add -A && git commit -m "feat(core): rename radius corner modes to friendly names (#546)"`

### Task 2.5: Migrate the borderwidth (stroke) family

**Files:** `git mv` 5 files under `packages/core/tokens/primitives/borderwidth/`; modify `validate-spacing-modes.js`, `utils.js`, `package.json`, `appearance-model.ts`, `theme-modes.ts`; regenerate; update tests.

- [ ] **Step 1: Update test expectations to friendly (failing)** — stroke default `'vega'` → `'normal'`; `STROKE_OPTIONS` values `maia`→`fine`, `vega`→`normal`, `nova`→`strong`; `appearance-snapshot.test.ts` `'data-borderwidth': 'vega'` → `'normal'`; `scripts/__tests__/mode-collectors.test.js` borderwidth list/selectors → friendly; `theme-modes.test.ts` borderwidth fixtures → friendly; add `expect(sanitizeNexusAppearance({ stroke: 'maia' }).stroke).toBe('fine');`.

- [ ] **Step 2: Run to verify failure** — FAIL.

- [ ] **Step 3: Rename token files**

```bash
cd packages/core/tokens/primitives/borderwidth
git mv borderwidth-maia.json borderwidth-fine.json
git mv borderwidth-vega.json borderwidth-normal.json
git mv borderwidth-nova.json borderwidth-strong.json
git mv borderwidth-lyra.json borderwidth-medium.json
git mv borderwidth-mira.json borderwidth-bold.json
cd -
```

- [ ] **Step 4: Update hardcoded list** — `CANONICAL_BORDERWIDTH_MODES = ['bold', 'fine', 'medium', 'normal', 'strong']`; borderwidth config `baseline: 'vega'` → `'normal'`. In `utils.js`: `DEFAULT_CONFIG.borderwidth: 'vega'` → `'normal'`. In `package.json` `build:tailwind`: `--borderwidth=vega` → `--borderwidth=normal`.

- [ ] **Step 5: Flip the stroke model** — `NexusStroke = 'fine' | 'normal' | 'strong';`; `STROKE_OPTIONS` values → friendly (labels already Fine/Normal/Strong); `DEFAULT_NEXUS_APPEARANCE.stroke: 'vega'` → `'normal'`. Populate `PUBLIC_MODE_RENAME.stroke = { maia: 'fine', vega: 'normal', nova: 'strong' }`.

- [ ] **Step 6: Update docs borderwidth infra** — in `theme-modes.ts`: `THEME_MODE_VALUES.borderwidth` → `['normal','medium','fine','bold','strong']`; `DEFAULT_THEME_STATE.borderwidth: 'vega'` → `'normal'`; `THEME_MODE_OPTIONS.borderwidth` values+labels → friendly; `THEME_STYLESHEET_HREFS.borderwidth` → `{ normal:'/themes/borderwidth-normal.css', medium:'/themes/borderwidth-medium.css', fine:'/themes/borderwidth-fine.css', bold:'/themes/borderwidth-bold.css', strong:'/themes/borderwidth-strong.css' }`.

- [ ] **Step 6b: Story imports (borderwidth in `Radius.stories.tsx`)** — update the 5 **borderwidth** token-JSON imports + bindings to friendly (`borderwidth-maia.json` → `borderwidth-fine.json`, `borderwidth-vega.json` → `borderwidth-normal.json`, `borderwidth-nova.json` → `borderwidth-strong.json`, `borderwidth-lyra.json` → `borderwidth-medium.json`, `borderwidth-mira.json` → `borderwidth-bold.json`). This completes `Radius.stories.tsx` (its radius imports moved in 2.4). Build-critical: same commit as the `git mv`.

- [ ] **Step 7: Regenerate** — `pnpm tokens:tailwind && pnpm tokens:modular`; then confirm `git diff --stat packages/core/package.json` is empty (do not blind-`checkout`).

- [ ] **Step 8: Validate + test** — `pnpm validate:spacing-modes && pnpm typecheck && pnpm test:unit` → PASS.

- [ ] **Step 9: Commit** — `git add -A && git commit -m "feat(core): rename borderwidth stroke modes to friendly names (#546)"`

### Task 2.6: Migrate the typography family

**Files:** `git mv` 1 file under `packages/core/tokens/primitives/typography/`; modify `scripts/__tests__/typography-modes.test.js`; regenerate.

- [ ] **Step 1: Update the typography test (failing)** — in `scripts/__tests__/typography-modes.test.js`, `EXPECTED_MODES = ['vega']` → `EXPECTED_MODES = ['default']`.

- [ ] **Step 2: Run to verify failure** — `pnpm test:unit packages/core/scripts/__tests__/typography-modes.test.js` → FAIL.

- [ ] **Step 3: Rename the token file**

```bash
git mv packages/core/tokens/primitives/typography/typography-vega.json packages/core/tokens/primitives/typography/typography-default.json
```

- [ ] **Step 3b: Story import** — in `packages/react/src/stories/Typography.stories.tsx`, update the import path + binding (`typography-vega.json` → `typography-default.json`; `typographyVega` → `typographyDefault`). Build-critical: same commit as the `git mv`.

- [ ] **Step 4: Regenerate** — `pnpm tokens:tailwind && pnpm tokens:modular`; confirm `apps/docs/public/themes/typography-default.css` now exists, `typography-vega.css` is gone, and `git diff --stat packages/core/package.json` is empty (do not blind-`checkout`).

- [ ] **Step 5: Test** — `pnpm test:unit && pnpm typecheck` → PASS.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat(core): rename typography mode vega→default (#546)"`

### Task 2.7: Golden value-preservation + generated-CSS + audit boundary

**Files:**

- Create: `packages/core/scripts/__tests__/mode-rename-value-preservation.test.js`

**Interfaces:** Consumes the PR-1 oracle (`pre-rename-mode-values.json`) and `MODE_RENAME`. Asserts every renamed (friendly) token file reproduces the exact `$value` set its codename source had — the honest "rename only, zero value change" proof — then asserts the generated CSS flipped selectors, and records the audit's PR-3 boundary.

- [ ] **Step 1: Write the test**

```js
// packages/core/scripts/__tests__/mode-rename-value-preservation.test.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { MODE_RENAME } from '../lib/mode-rename-map.js';
import { leafPathsOf } from '../validate-spacing-modes.js';
import oracle from './__fixtures__/pre-rename-mode-values.json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS = path.resolve(__dirname, '..', '..', 'tokens');

const LOCATION = {
  spacing: (m) => [path.join(TOKENS, 'semantic'), `spacing-${m}.json`, ''],
  radius: (m) => [
    path.join(TOKENS, 'primitives', 'radius'),
    `radius-${m}.json`,
    '',
  ],
  borderwidth: (m) => [
    path.join(TOKENS, 'primitives', 'borderwidth'),
    `borderwidth-${m}.json`,
    '',
  ],
  typography: (m) => [
    path.join(TOKENS, 'primitives', 'typography'),
    `typography-${m}.json`,
    '',
  ],
};
// shadow has light/dark variants captured as `shadow.<codename>-light` etc.
const SHADOW_DIR = path.join(TOKENS, 'primitives', 'shadow');

function leafValues(obj) {
  const out = {};
  for (const p of leafPathsOf(obj)) {
    out[p] = p.split('.').reduce((n, k) => n[k], obj).$value;
  }
  return out;
}

describe('token-mode rename preserves every value', () => {
  it.each(
    Object.entries(MODE_RENAME).flatMap(([family, map]) =>
      Object.entries(map).map(([codename, friendly]) => [
        family,
        codename,
        friendly,
      ])
    )
  )('%s %s → %s is byte-identical', (family, codename, friendly) => {
    if (family === 'shadow') {
      for (const variant of ['light', 'dark']) {
        const data = JSON.parse(
          fs.readFileSync(
            path.join(SHADOW_DIR, `shadow-${friendly}-${variant}.json`),
            'utf8'
          )
        );
        expect(leafValues(data)).toEqual(
          oracle[`shadow.${codename}-${variant}`]
        );
      }
      return;
    }
    const [dir, file] = LOCATION[family](friendly);
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    expect(leafValues(data)).toEqual(oracle[`${family}.${codename}`]);
  });
});
```

- [ ] **Step 2: Run the test**

Run: `pnpm test:unit packages/core/scripts/__tests__/mode-rename-value-preservation.test.js`
Expected: PASS — every friendly file reproduces its codename source's values. (A FAIL means a `git mv` pointed at the wrong file or a value drifted — fix before proceeding.)

- [ ] **Step 2b: Assert the generated CSS flipped selectors**

Add a second test in the same file, reading the committed `packages/tailwind/nexus.css` (the artifact consumers load). It proves the rename reached the emitted selectors — friendly present, every retired codename gone:

```js
it('emits friendly data-* selectors and no retired ones', () => {
  const css = fs.readFileSync(
    path.resolve(__dirname, '..', '..', '..', 'tailwind', 'nexus.css'),
    'utf8'
  );
  for (const sel of [
    '[data-style="default"]',
    '[data-radius="square"]',
    '[data-radius="extra-round"]',
    '[data-shadow="quiet"]',
    '[data-borderwidth="normal"]',
  ]) {
    expect(css.includes(sel), `missing ${sel}`).toBe(true);
  }
  for (const c of [
    'nova',
    'mira',
    'maia',
    'vega',
    'lyra',
    'luma',
    'sera',
    'sharp',
    'mellow',
    'blunt',
  ]) {
    expect(
      new RegExp(`\\[data-(style|radius|shadow|borderwidth)="${c}"\\]`).test(
        css
      ),
      `retired selector for "${c}" still emitted`
    ).toBe(false);
  }
});
```

- [ ] **Step 3: Run both tests** — `pnpm test:unit packages/core/scripts/__tests__/mode-rename-value-preservation.test.js` → PASS. (Value FAIL = a `git mv` pointed at the wrong file; selector FAIL = a generator default/flag still codename, or a regen was skipped.)

- [ ] **Step 4: Audit boundary — record the PR-3 residual**

Run `pnpm --filter @nexus/core audit:mode-codenames`. It still exits 1 — that is expected at the end of PR-2. Confirm **every** remaining hit is a PR-3-scoped **prose/demo `data-*`** reference (e.g. `apps/docs/app/_pages/MultiBrand.tsx` `data-style="nova"`), and that **zero** hits are token filenames, generated CSS (`packages/tailwind/*`, `apps/docs/public/themes/*`), package runtime, or docs theme infra (`theme-modes.ts`). If any non-prose hit appears, a slice missed a regen or a consumer — fix it here, not in PR-3.

> **Caveat — the audit residual is NOT the complete PR-3 work-list.** The context-scoped audit only matches literal `data-{family}="codename"` / selectors / hrefs; it is blind to dynamic `data-style={mode}`, `data-testid="…-<codename>"` suffixes, and codename-keyed JS maps. Component per-mode SIZE stories live in those forms and are **test-critical** (they fail `test:storybook`), so they belong in PR-2 (the spacing slice), not PR-3 — and they will not show in this residual. `pnpm test:storybook` (Task 2.8), not the audit, is the completeness check. PR-3 owns only what the audit _does_ see plus a `test:storybook` re-run.

- [ ] **Step 5: Commit**

```bash
git add packages/core/scripts/__tests__/mode-rename-value-preservation.test.js
git commit -m "test(core): prove token-mode rename preserved values + flipped selectors (#546)"
```

### Task 2.8: PR-2 finalization

- [ ] **Step 1: Full regen + validation** — `pnpm tokens:tailwind && pnpm tokens:modular && pnpm validate:spacing-modes && pnpm typecheck && pnpm test:unit && pnpm test:storybook` → all green. `pnpm typecheck` (turbo-wide) guards that every `*.stories.tsx` token-JSON import resolved; **`pnpm test:storybook` is the only gate that catches per-mode play-function failures** (codename `data-style`/testid/map-key drift is invisible to typecheck and `test:unit`). Do not skip it — its omission is why the first cutover attempt shipped 10 red play tests.
- [ ] **Step 2: Builds** — `pnpm --filter @nexus/core build && pnpm --filter @nexus/react build` → both succeed (catches any dist-level fallout the typecheck missed).
- [ ] **Step 3: Open the PR** — branch `codex/issue-546-friendly-mode-cutover`, base `main`. Write the body to a file and use `gh pr create --body-file` (not an inline `$(cat <<EOF)`). Body: `Part of #546`, the per-family commit list, the **audit residual** from Task 2.7 Step 4 as the PR-3 work-list, and the two deliberate exclusions (no bootstrap v2 salvage, no docs persisted-state normalization).

---

## PR-3 — Docs Content, Stories, Audit Gate & Visual QA

> The functional docs theme infra (`theme-modes.ts`, `layout.tsx`) already migrated in PR-2. This PR finishes consumer-facing **content**, turns the audit into a gate, and does visual QA.

### Task 3.1: Update docs prose and example pages

**Files:** `apps/docs/app/_pages/Spacing.tsx`, `apps/docs/app/_pages/MultiBrand.tsx`, `apps/docs/app/_pages/Radius.tsx`

- [ ] **Step 1: Update the example codenames to friendly**

- `Spacing.tsx` `MODES` array: replace codename `mode` strings with friendly names + restate archetypes (`compact`, `default ★ — the bundled default`, `comfortable`, `tight (≈ regular)`, `default (≈ regular, byte-identical)` notes rephrased to friendly); update the inline `<code>mira</code>`/`<code>vega</code>` prose to `<code>default</code>`/`<code>regular</code>`.
- `MultiBrand.tsx` `DIMENSIONS`: spacing options `'7 modes — compact · default · comfortable · …'`; radius `'square · subtle · smooth · round · extra-round'`; border `'3 designs (normal · fine · strong)'`; and the code example `<section data-style="nova">` → `<section data-style="compact">`.
- `Radius.tsx` `RADIUS_MODES` → `square/subtle/smooth/round/extra-round`; `BORDER_DESIGNS` → `normal/fine/strong`; prose "lyra and mira are byte-identical to vega" → "medium and bold are byte-identical to normal".

- [ ] **Step 2: Verify docs typecheck**

Run: `pnpm --filter @nexus/docs typecheck` (or `cd apps/docs && pnpm typecheck`)
Expected: PASS — the `THEME_MODE_OPTIONS`/`THEME_STYLESHEET_HREFS` types (migrated in PR-2) now require friendly literals, so any missed codename in these pages surfaces as a type error.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "docs: switch Appearance example pages to friendly token-mode names (#546)"`

### Task 3.2: Sweep stories and remaining source

**Files:** any `*.stories.tsx` / source under `packages/react/src`, `apps/console` referencing modes.

- [ ] **Step 1: Run the audit to find remaining load-bearing codenames**

Run: `pnpm --filter @nexus/core audit:mode-codenames`
Expected: zero or a short list. For each hit, replace the codename with its family-friendly name. (Console gets its modes from the migrated model, so it should be clean; this catches any hardcoded `data-style="…"` in stories or fixtures.)

- [ ] **Step 2: Re-run to confirm clean** — `pnpm --filter @nexus/core audit:mode-codenames` → `✅ No retired token-mode codenames`.

- [ ] **Step 3: Commit (if anything changed)** — `git add -A && git commit -m "refactor: replace remaining token-mode codenames in stories/source (#546)"`

### Task 3.3: Promote the audit to a blocking gate

**Files:** `packages/core/package.json`, root `package.json` (lint-staged), CI workflow.

- [ ] **Step 1: Wire the audit into CI**

Add `audit:mode-codenames` to the root `package.json` audit scripts:

```json
"audit:mode-codenames": "pnpm --filter @nexus/core audit:mode-codenames",
```

Add it to the CI job that runs the other `audit:*` checks (mirror how `audit:contrast` / `audit:agent-drift` are invoked in `.github/workflows`). Confirm the workflow step runs `pnpm audit:mode-codenames`.

- [ ] **Step 2: Add a pre-commit guard for token files**

In root `package.json` `lint-staged`, extend the token-file globs to also run the audit (cheap, catches a reintroduced codename at commit time):

```json
"packages/core/tokens/**/*.json": [
  "pnpm validate:spacing-modes",
  "pnpm audit:mode-codenames"
],
```

- [ ] **Step 3: Add the post-cutover value-list exclusion**

PR-1's drift guard binds the public value-lists to `MODE_RENAME` (catches typos/unmapped names) but, by construction, **cannot** assert "no value is a retired codename" pre-migration (the values _are_ codenames until the cutover). Now that the repo is friendly, close that half: extend `mode-rename-map.test.js`'s value-list binding (and the docs `theme-modes.test.ts` guard) with an exclusion assertion — every `appearance-model.ts` OPTIONS/DEFAULT value and every docs `THEME_MODE_VALUES` entry is **not** in `RETIRED_CODENAMES`:

```js
// in the existing "binds the public appearance-model value-lists" test
for (const [family, options] of Object.entries(optionsByFamily)) {
  for (const { value } of options) {
    expect(RETIRED_CODENAMES, `${family} option ${value}`).not.toContain(value);
  }
}
```

This is the assertion the context-scoped audit cannot make (it never scans bare strings); together with the audit gate it makes acceptance-criterion #1 provable for the type/option surface as well as DOM/CSS.

- [ ] **Step 4: Run the full audit + a dry-run commit**

Run: `pnpm audit:mode-codenames`
Expected: `✅ No retired token-mode codenames`.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "ci: gate on token-mode codename audit (#546)"`

### Task 3.4: Visual QA + final validation

- [ ] **Step 1: Full build + test suite**

Run: `pnpm build && pnpm test && pnpm typecheck && pnpm validate:spacing-modes && pnpm audit:mode-codenames`
Expected: all PASS / clean.

- [ ] **Step 2: Docs theme-picker smoke test**

Run `pnpm --filter @nexus/docs dev`, open the docs, and exercise the theme picker across **every** mode of spacing / shadow / radius / borderwidth in light and dark. Confirm: (a) each picker option applies (no 404 in the network panel for `/themes/*.css`), (b) the `<html>` `data-style` / linked stylesheet hrefs show friendly names, (c) `extra-round` radius renders. Note any regression.

- [ ] **Step 3: Console parity smoke test**

Run `pnpm console`, open Settings → Appearance, change density/corners/elevation/stroke, reload. Confirm the selection persists (normalizer + version-3 snapshot) and the topbar quick control + command palette agree.

- [ ] **Step 4: Update #546 / #531**

- Comment on #546 confirming all three PRs merged, audit gate live, value-preservation proven; close it.
- Update #531: mark "Phase E0 friendly token-mode migration is complete (#546)" in the Done Bar.

- [ ] **Step 5: Commit any QA fixes** — `git add -A && git commit -m "fix: address Phase E0 visual QA findings (#546)"`

---

## Self-Review

**Spec coverage (against #546):**

- ✅ PR1 "inventory + mapping spec + freeze contract + audit command + allowlist" → Tasks 1.1–1.4 (map frozen, inventory drift-guarded, audit built, allowlist = rename-map + changelog).
- ✅ PR2 "migration helpers + internal cutover + rename token files + update discovery/generators/validators/tests + accept old persisted values + bump snapshot + bootstrap/provider DOM attrs + emit new selectors" → Tasks 2.1–2.7. (Bootstrap/provider need no edits — they forward state values through `resolveFirstPaint`, which is naming-agnostic; the model flip + regenerated CSS do the work.)
- ✅ PR3 "docs theme-mode metadata + examples + stories + old-name audit gate + visual QA + confirm migration" → Tasks 3.1–3.4.
- ✅ Out-of-scope honored: no value retuning (Task 2.7 enforces), no UI redesign, no brand/color/status/chart renames, `snappy`/`subtle`/`smooth` untouched.

**Beyond #546 (review hardening):** collision stated as a Global Constraint + enforced by family-scoped maps; docs `theme-modes.ts` recognized as runtime-functional and migrated in PR-2 (not deferred); audit context-scoped (not allowlist-on-grep); PR-2 sliced per family with normalize wired in lockstep; golden value oracle; `extra-round` regex fix; `tokens:modular` drift-rewrite guarded at every regenerate.

**Placeholder scan:** none — every path, `git mv`, list value, flag, and selector is concrete.

**Type consistency:** `normalizeAppearanceModeIds` / `MODE_RENAME` / `RETIRED_CODENAMES` / `findCodenameViolations` / `scanText` used consistently across tasks. Friendly names match the frozen map table in every family slice.

**Open coordination note (not a code gap):** a ~28-file `tokens/` + generator rename conflicts badly with any in-flight branch touching `packages/core/tokens/` or the generators — e.g. the popover translucent-surfaces work edits `popover-alpha` token JSON. Before starting PR-2, check open PRs on those paths and sequence E0 to avoid a costly rebase.
