# #553 Token-Mode Distinctness Calibration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every shipped Appearance token-mode earn its name — by adding a sibling-mode distinctness audit and resolving the known duplicates (`regular`/`default`, `normal`/`medium`/`bold`, plus the shadow visual-review gap) with deliberate per-family decisions.

**Architecture:** A new `audit:mode-distinctness` script in `@nexus/core` compares sibling modes within each token-mode family (spacing / radius / borderwidth / shadow), failing on byte-identical pairs that aren't on an explicit, reasoned allowlist. The duplicates are resolved per-family by **deliberate decision** (remove / preserve / visual-review), not blanket retune — and with **no surviving-mode value retune** (deleting byte-duplicate modes is enough to make the rest distinct). Shadow work keeps Nexus semantic derived surfaces and ships a Fluid-style comparison **lab artifact**, deferring an actual renderer to a tracked follow-up rather than hardcoding Fluid's surface colors.

**Tech Stack:** Node ESM scripts under `packages/core/scripts/`, Vitest unit project, the existing token-mode manifest (`token-mode-manifest.js` / `validate-spacing-modes.js`), the modular + tailwind token generators, the `audit-tokens` CI job.

## Global Constraints

- **Do not silently change #550's rename/value-preservation history.** `mode-rename-value-preservation.test.js` must stay green. Deleted modes drop out of `MODE_RENAME` deliberately. **No surviving mode's values change** — every renamed mode that remains (`maia→fine`, `vega→normal`, `nova→strong`, the spacing survivors, etc.) keeps its exact oracle values, so the test needs no surgery.
- **Public Appearance values stay stable:** `NexusDensity` (`compact`/`default`/`comfortable`/`spacious`), `NexusStroke` (`fine`/`normal`/`strong`), `NexusCorners`, `NexusElevation`. Never move a public default.
- **Pre-production** ([`.claude/rules/project-stage.md`](../../../.claude/rules/project-stage.md)): delete redundant modes outright — no deprecation, shims, or aliasing-by-keeping-a-dead-file.
- **Off-grid spacing px is lint-enforced:** `@nexus/canonical-spacing-steps` errors on any px `$value` in `spacing-*.json` outside `canonical-step-set.json`. This plan deletes `regular`; it introduces **no** new spacing px values, so the lint and the `refresh:canonical-set --check` stay green.
- **Do not hardcode Fluid surface colors into Nexus.** Keep Nexus semantic derived surfaces (`background`, `container`, `popover`, `nav`, etc.) powered by `surfaceTone`, mode, and `contrast`. Borrow Fluid's light/dark shadow rendering technique, not its fixed `surface-1` to `surface-8` color ladder.
- **Modern Web Guidance gate:** Required because the shadow direction touches CSS rendering behavior. Use repo-local guidance and the browser floor in `AGENTS.md`; avoid new browser-platform features. The Fluid lab uses plain CSS box-shadows and no unsupported layout API.

---

## Decisions (the deliberate per-family calls #553 requires)

#553 explicitly asks to "decide whether duplicate hidden modes should be removed, hidden, or retuned," and its acceptance criteria sanction alias/hide/remove as alternatives to retuning. The answer differs by family:

| Family           | Duplicate (verified)                                                                                       | Decision                                                                                                                | Why                                                                                                                                                                                                                                                                                                                                                                                                                                           | Alternative (rejected)                                                                                                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Spacing**      | `regular` == `default` (byte-identical file). `tight`/`relaxed` already differ via numeric scale.          | **Delete `regular`; keep `default` as the canonical bundled baseline.**                                                 | The user decision is that byte-identical public-ish options are redundant. `--spacingDefault=default` already makes `default` the bundled mode; keeping `regular` only teaches a distinction that does not exist. No spacing value retune is needed.                                                                                                                                                                                          | Retune `regular`: creates a confusing "regular vs default" split and risks off-grid spacing. Keep alias: accepted earlier, now rejected by product direction.                                                                                                   |
| **Border width** | `normal` == `medium` == `bold` (all `1/2`). `fine` (`1/1`) and `strong` (`1.5/3`) are already distinct.    | **Remove `medium` and `bold`. No value retune.**                                                                        | Public model already exposes only `fine`/`normal`/`strong`. Deleting the two byte-duplicates of `normal` leaves three modes that already differ: fine `1/1`, normal `1/2`, strong `1.5/3` (fine ↔ normal differ on `thick`). No surviving value moves, so value-preservation stays untouched.                                                                                                                                                 | Calibrate `fine.default` to `0.5px`: changes a public stroke value (contradicts the stability constraint), was never a #553 finding, risks a sub-pixel hairline at DPR 1, and forces value-preservation surgery. Keep `medium`/`bold`: over-teaches duplicates. |
| **Shadow**       | All 5 modes byte-distinct already, but visual distinctness is weak and dark-mode elevation can feel muddy. | **Keep Nexus derived surfaces; ship a Fluid-style comparison lab artifact; defer the renderer to a tracked follow-up.** | The audit already passes (modes are byte-distinct), so #553's shadow criterion ("visual review artifact or a documented threshold") is met by the lab. A renderer is genuinely new scope — and because shadow modes are in `MODE_RENAME`, touching their values in-PR would re-open the value-preservation blocker. Borrow Fluid's lighting technique in the lab without hardcoding its `#171717`→`#484848` dark ladder or `surface-1` names. | Build the renderer inside #553: re-opens value-preservation + over-scopes the PR. Copy Fluid surface colors directly: breaks Nexus `surfaceTone` and contrast semantics.                                                                                        |
| **Radius**       | Siblings differ; only `full` is shared.                                                                    | **No change, no allowlist entry.**                                                                                      | The audit gate is **whole-mode** byte-identity; radius modes differ beyond the shared `full`, so they pass. `full` is a per-leaf coincidence the whole-mode gate ignores.                                                                                                                                                                                                                                                                     | A per-leaf `radius.full` allowlist (the original draft): only meaningful for a per-leaf audit, which would be noisy.                                                                                                                                            |

**Net effect on the value-preservation blocker:** clean. Spacing `vega→regular` and borderwidth `lyra→medium` / `mira→bold` drop out of `MODE_RENAME` because those modes are deleted. Every surviving renamed mode — `borderwidth.maia→fine` (`1/1`), `vega→normal` (`1/2`), `nova→strong` (`1.5/3`), and the spacing survivors — keeps its exact oracle values. No calibration exception, no test surgery.

> If the reviewer objects to deleting `regular`, stop and revisit the product decision. Do not reintroduce `regular` as an alias unless the issue explicitly changes direction again.

---

## File Structure

| File                                                                                  | Responsibility                                                                                       | Task |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---- |
| `packages/core/scripts/lib/mode-distinctness.js` (new)                                | Pure comparison core: `diffLeaves`, `comparePairs`, `findViolations`, `DISTINCTNESS_ALLOWLIST`       | 1    |
| `packages/core/scripts/audit-mode-distinctness.js` (new)                              | CLI: read token files via the manifest, run the core, print diagnostics, exit 1 on violations        | 1    |
| `packages/core/scripts/lib/__tests__/mode-distinctness.test.js` (new)                 | Unit tests for the pure core                                                                         | 1    |
| `packages/core/package.json`                                                          | `audit:mode-distinctness` package script                                                             | 1    |
| `packages/core/tokens/semantic/spacing-regular.json` (delete)                         | Redundant density mode                                                                               | 2    |
| `packages/core/tokens/primitives/borderwidth/borderwidth-{medium,bold}.json` (delete) | Redundant stroke modes (both byte-identical to `normal`); `fine`/`normal`/`strong` survive untouched | 2    |
| `packages/core/scripts/lib/mode-rename-map.js`                                        | Drop `vega→regular`, `lyra→medium`, `mira→bold`                                                      | 2    |
| `packages/core/scripts/lib/token-mode-manifest.js`                                    | spacing canonical list → 6, baseline → `default`; borderwidth → 3                                    | 2    |
| `apps/docs/app/_lib/theme-modes.ts`                                                   | spacing picker drops `regular`; borderwidth picker → 3                                               | 2    |
| `packages/core/scripts/__tests__/__fixtures__/pre-rename-mode-values.json`            | Drop stale `spacing.vega`, `borderwidth.lyra`, `borderwidth.mira` (deleted modes)                    | 2    |
| root `package.json`                                                                   | `audit:mode-distinctness` script + lint-staged token glob                                            | 3    |
| `.github/workflows/ci.yml`                                                            | `audit-tokens` step                                                                                  | 3    |
| docs/stories that present spacing or borderwidth modes                                | Drop `regular`, `medium`, `bold`; describe fine/normal/strong values                                 | 4    |
| `reports/issue-553-fluid-shadow-lab.html`                                             | Static light/dark Fluid-style shadow comparison artifact (the #553 shadow deliverable)               | 4    |
| `#556`                                                                                | Nested surface/elevation + Fluid-style shadow recipes — deferred out of #553                         | 4    |
| `docs/superpowers/plans/2026-06-28-issue-553-token-mode-distinctness.md`              | This plan (shadow lab direction + deferred renderer)                                                 | 4    |

---

### Task 1: Distinctness audit (pure core + CLI + explicit allowlist support)

**Files:**

- Create: `packages/core/scripts/lib/mode-distinctness.js`
- Create: `packages/core/scripts/audit-mode-distinctness.js`
- Test: `packages/core/scripts/lib/__tests__/mode-distinctness.test.js`
- Modify: `packages/core/package.json`

**Interfaces:**

- Consumes: `leafPathsOf`, `discoverFamilyModes`, `KEY_PARITY_MODE_FAMILY_CONFIGS` from `../validate-spacing-modes.js`; `CANONICAL_SHADOW_MODES` etc. from `../token-mode-manifest.js`.
- Produces: `diffLeaves(a,b)`, `comparePairs(family, leavesByMode)`, `findViolations(findings, allowlist)`, `DISTINCTNESS_ALLOWLIST`.

- [ ] **Step 0: Confirm the manifest config shape.** Read `packages/core/scripts/lib/token-mode-manifest.js` (`MODE_FAMILY_CONFIGS`) and `validate-spacing-modes.js` (`discoverFamilyModes`) to confirm each family config's `family`, `dir`, and `modePattern` field names before wiring the CLI. (Not a placeholder — a 2-minute read so the CLI uses the real fields.)

- [ ] **Step 1: Write the failing core test**

```js
// packages/core/scripts/lib/__tests__/mode-distinctness.test.js
import { describe, expect, it } from 'vitest';
import {
  diffLeaves,
  comparePairs,
  findViolations,
  DISTINCTNESS_ALLOWLIST,
} from '../mode-distinctness.js';

const px = (v) => ({ value: v, unit: 'px' });

describe('mode-distinctness core', () => {
  it('diffLeaves reports only differing leaf paths', () => {
    const a = { 'container.p': px(24), 'container.gap': px(16) };
    const b = { 'container.p': px(22), 'container.gap': px(16) };
    expect(diffLeaves(a, b)).toEqual(['container.p']);
  });

  it('comparePairs flags an identical pair with 0 differing leaves', () => {
    const leaves = { 'container.p': px(24) };
    const findings = comparePairs('spacing', {
      default: leaves,
      regular: { ...leaves },
    });
    expect(findings).toEqual([
      {
        family: 'spacing',
        a: 'default',
        b: 'regular',
        differingLeaves: 0,
        firstDiffs: [],
      },
    ]);
  });

  it('findViolations fails identical pairs but spares an allowlisted pair', () => {
    const identical = [
      {
        family: 'spacing',
        a: 'default',
        b: 'regular',
        differingLeaves: 0,
        firstDiffs: [],
      },
    ];
    expect(findViolations(identical, [])).toHaveLength(1);
    expect(
      findViolations(identical, [
        { family: 'spacing', modes: ['default', 'regular'], reason: 'x' },
      ])
    ).toHaveLength(0);
  });

  it('keeps distinct pairs out of violations and surfaces leaf counts', () => {
    const findings = comparePairs('borderwidth', {
      normal: { default: px(1), thick: px(2) },
      strong: { default: px(1.5), thick: px(3) },
    });
    expect(findings[0].differingLeaves).toBe(2);
    expect(findViolations(findings, [])).toHaveLength(0);
  });

  it('ships no default allowlist entries until a future intentional alias exists', () => {
    expect(DISTINCTNESS_ALLOWLIST).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it — verify it fails** — `pnpm --filter @nexus/core test:unit scripts/lib/__tests__/mode-distinctness.test.js` → FAIL ("Cannot find module '../mode-distinctness.js'").

- [ ] **Step 3: Implement the pure core**

```js
// packages/core/scripts/lib/mode-distinctness.js
import { leafPathsOf } from '../validate-spacing-modes.js';

// Intentional duplicates. Each needs a real architectural reason.
// Empty after #553 because regular/medium/bold are deleted instead of aliased.
export const DISTINCTNESS_ALLOWLIST = [];

function valueAtPath(obj, dotted) {
  return dotted.split('.').reduce((node, key) => node[key], obj).$value;
}

export function leafValues(modeData) {
  const out = {};
  for (const p of leafPathsOf(modeData)) out[p] = valueAtPath(modeData, p);
  return out;
}

export function diffLeaves(aLeaves, bLeaves) {
  const diffs = [];
  for (const key of new Set([
    ...Object.keys(aLeaves),
    ...Object.keys(bLeaves),
  ])) {
    if (JSON.stringify(aLeaves[key]) !== JSON.stringify(bLeaves[key]))
      diffs.push(key);
  }
  return diffs.sort();
}

export function comparePairs(family, leavesByMode) {
  const names = Object.keys(leavesByMode).sort();
  const findings = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const diffs = diffLeaves(leavesByMode[names[i]], leavesByMode[names[j]]);
      findings.push({
        family,
        a: names[i],
        b: names[j],
        differingLeaves: diffs.length,
        firstDiffs: diffs.slice(0, 5),
      });
    }
  }
  return findings;
}

function isAllowed(family, a, b, allowlist) {
  return allowlist.some(
    (e) => e.family === family && e.modes.includes(a) && e.modes.includes(b)
  );
}

export function findViolations(findings, allowlist = DISTINCTNESS_ALLOWLIST) {
  return findings.filter(
    (f) => f.differingLeaves === 0 && !isAllowed(f.family, f.a, f.b, allowlist)
  );
}
```

- [ ] **Step 4: Run it — verify pass** — same command → 5 tests PASS.

- [ ] **Step 5: Write the CLI wrapper**

Reuse the manifest configs. Build one comparison group per family; for **shadow**, split into `shadow-light` and `shadow-dark` groups (compare light-vs-light and dark-vs-dark only — never light against dark). Read each mode file, flatten with `leafValues`, run `comparePairs` + `findViolations`. Print every pair's `differingLeaves` (diagnostics #553 wants) and exit 1 on violations.

```js
// packages/core/scripts/audit-mode-distinctness.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  KEY_PARITY_MODE_FAMILY_CONFIGS,
  discoverFamilyModes,
} from './validate-spacing-modes.js';
import {
  comparePairs,
  findViolations,
  leafValues,
  DISTINCTNESS_ALLOWLIST,
} from './lib/mode-distinctness.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function groupsForConfig(config) {
  // config fields confirmed in Step 0: { family, dir, modePattern }
  const modes = discoverFamilyModes(config);
  const read = (file) =>
    leafValues(
      JSON.parse(fs.readFileSync(path.join(config.dir, file), 'utf8'))
    );
  if (config.family === 'shadow') {
    return ['light', 'dark'].map((variant) => ({
      family: `shadow-${variant}`,
      leavesByMode: Object.fromEntries(
        modes.map((m) => [m, read(`shadow-${m}-${variant}.json`)])
      ),
    }));
  }
  return [
    {
      family: config.family,
      leavesByMode: Object.fromEntries(
        modes.map((m) => [m, read(`${config.family}-${m}.json`)])
      ),
    },
  ];
}

const allFindings = KEY_PARITY_MODE_FAMILY_CONFIGS.flatMap((config) =>
  groupsForConfig(config).flatMap(({ family, leavesByMode }) =>
    comparePairs(family, leavesByMode)
  )
);

for (const f of allFindings) {
  const tag =
    f.differingLeaves === 0
      ? 'DUP '
      : `${String(f.differingLeaves).padStart(3)} `;
  console.log(
    `${tag} ${f.family}: ${f.a} vs ${f.b}${f.firstDiffs.length ? `  [${f.firstDiffs.join(', ')}]` : ''}`
  );
}

const violations = findViolations(allFindings, DISTINCTNESS_ALLOWLIST);
if (violations.length) {
  console.error(
    `\n✗ ${violations.length} byte-identical sibling mode pair(s) not on the allowlist:`
  );
  for (const v of violations)
    console.error(`  - ${v.family}: ${v.a} == ${v.b}`);
  process.exit(1);
}
console.log('\n✓ No unintentional byte-identical sibling token-mode pairs.');
```

> The non-`shadow` filename `${config.family}-${m}.json` matches `spacing-*`, `radius-*`, `borderwidth-*`. If Step 0 shows a config whose files don't follow `{family}-{mode}.json`, use the config's own filename builder instead.

- [ ] **Step 6: Add the package script** — in `packages/core/package.json` scripts: `"audit:mode-distinctness": "node scripts/audit-mode-distinctness.js"`.

- [ ] **Step 7: Run it on the live repo** — `pnpm --filter @nexus/core audit:mode-distinctness`. Expected at this point: prints `DUP spacing: default vs regular` **and** `DUP borderwidth: bold vs medium` / `bold vs normal` / `medium vs normal` (violations → exit 1). This confirms the audit catches the real duplicates before Task 2 fixes them. **Do not wire it into CI yet** (Task 3) — the repo is not clean until spacing and borderwidth are resolved.

- [ ] **Step 8: Commit** — `git add packages/core/scripts/lib/mode-distinctness.js packages/core/scripts/audit-mode-distinctness.js packages/core/scripts/lib/__tests__/mode-distinctness.test.js packages/core/package.json && git commit -m "feat(core): add token-mode distinctness audit (#553)"`

### Task 2: Delete redundant spacing/stroke modes

**Files:**

- Delete: `packages/core/tokens/semantic/spacing-regular.json`
- Delete: `packages/core/tokens/primitives/borderwidth/borderwidth-medium.json`, `…/borderwidth-bold.json`
- Modify: `packages/core/scripts/lib/mode-rename-map.js`, `packages/core/scripts/lib/token-mode-manifest.js`, `packages/core/scripts/utils.js`
- Modify: `apps/docs/app/_lib/theme-modes.ts`, docs/stories that list live spacing or borderwidth modes
- Modify: `packages/core/scripts/__tests__/__fixtures__/pre-rename-mode-values.json`
- Modify (mode-inventory test mirrors — the `regular` deletion + `BASELINE_MODE→default` shrink the 7-mode set to 6 and move the spacing baseline, so these hardcoded assertions must follow): `packages/core/scripts/__tests__/validate-spacing-modes.test.js`, `packages/core/scripts/__tests__/generate-tailwind-package.test.js`, `packages/core/scripts/__tests__/generate-modular.test.js`
- **Do not modify** `borderwidth-fine.json` or `mode-rename-value-preservation.test.js` — `fine` keeps its preserved `1/1` value (so no calibration and no value-preservation surgery). The value-preservation test is `MODE_RENAME`-driven and only checks survivors' selectors, so deleting modes needs no edit there; the mode-inventory tests above are a separate concern.

- [ ] **Step 1: Confirm live consumers before deletion.**
  - `git grep -nE "spacing-regular|['\"]regular['\"]" -- packages apps | grep -i spacing`
  - `git grep -nE "borderwidth-(medium|bold)|['\"](medium|bold)['\"]" -- packages apps | grep -i border`
  - Expect token manifests, docs/theme mode lists, generated CSS references, tests, and prose only. If a runtime public API references `regular`/`medium`/`bold`, stop and surface it.

- [ ] **Step 2: Delete redundant token files** — `git rm packages/core/tokens/semantic/spacing-regular.json packages/core/tokens/primitives/borderwidth/borderwidth-medium.json packages/core/tokens/primitives/borderwidth/borderwidth-bold.json`

- [ ] **Step 3: Confirm the survivors are already distinct — no retune.** Leave `borderwidth-fine.json` untouched. Removing `medium` and `bold` (both byte-identical to `normal`) leaves three modes that already differ:

  | stroke | default | thick |
  | ------ | ------: | ----: |
  | fine   |   `1px` | `1px` |
  | normal |   `1px` | `2px` |
  | strong | `1.5px` | `3px` |

  `fine` differs from `normal` on the `thick` leaf (`1px` vs `2px`), so the whole-mode distinctness audit passes with zero value changes. Because no surviving mode's values move, `mode-rename-value-preservation.test.js` stays green untouched.

- [ ] **Step 4: Drop the rename-map entries** — in `mode-rename-map.js`:
  - remove `MODE_RENAME.spacing.vega → regular`
  - remove `MODE_RENAME.borderwidth.lyra → medium`
  - remove `MODE_RENAME.borderwidth.mira → bold`
  - leave `maia→fine`, `vega→normal`, `nova→strong`
  - leave `RETIRED_CODENAMES` derived from remaining family maps (`vega`, `lyra`, `mira` still exist in other families).

- [ ] **Step 5: Shrink canonical mode lists**
  - `token-mode-manifest.js`: `BASELINE_MODE` → `default`
  - `CANONICAL_MODES` → `['comfortable', 'compact', 'default', 'relaxed', 'spacious', 'tight']`
  - `CANONICAL_BORDERWIDTH_MODES` → `['fine', 'normal', 'strong']`
  - `utils.js`: `CANONICAL_SPACING_DEFAULT_MODE` → `default` and update stale comments that call `regular` the bundled/default mode.
  - `validate-spacing-modes.test.js` hardcodes mirrors of these constants — edit two assertions:
    - the `describe('CANONICAL_MODES')` "is the 7-mode set" test: in `expect([...CANONICAL_MODES].sort()).toEqual([...])`, drop the `'regular'` element and rename the `it(...)` to "is the 6-mode set."
    - the `modeFamilyConfigs()` `toEqual([...])`: change the spacing row from `['spacing', 'regular', CANONICAL_MODES]` to `['spacing', 'default', CANONICAL_MODES]` (the baseline follows `BASELINE_MODE`). The borderwidth/radius/shadow rows already reference constants + unchanged baselines, so they need no edit.

- [ ] **Step 6: Update docs picker and live prose**
  - `apps/docs/app/_lib/theme-modes.ts`: remove `regular` from spacing values/options/hrefs; `THEME_MODE_VALUES.borderwidth` → `['normal', 'fine', 'strong']`; remove `medium` and `bold` options/hrefs.
  - `Spacing.tsx` / spacing stories: remove the `regular` row and change prose from "default is byte-identical to regular" to "default is the bundled baseline."
  - `Radius.stories.tsx` / borderwidth prose: list only `normal/fine/strong`, and mention fine is `1px/1px`.

- [ ] **Step 7: Clean the stale oracle entries**
  - in `pre-rename-mode-values.json`, delete `spacing.vega`, `borderwidth.lyra`, and `borderwidth.mira` — those modes are deleted, so they drop out of `MODE_RENAME` and their oracle entries are dead.
  - keep `borderwidth.maia` as the pre-rename source for `fine`: its values (`default: 1px`, `thick: 1px`) still match the untouched `borderwidth-fine.json`, so `mode-rename-value-preservation.test.js` needs **no** change.

- [ ] **Step 8: Regenerate token output** — `pnpm tokens:tailwind && pnpm tokens:modular`. Confirm `git status` shows:
  - `spacing-regular` generated CSS and `apps/docs/public/themes/spacing-regular.css` removed
  - `borderwidth-medium` / `borderwidth-bold` generated CSS and docs theme CSS removed
  - `borderwidth-fine` generated output **unchanged** (it was not edited)
  - no stray drift. Per [[tokens-modular-rewrites-package-json]], `git checkout packages/core/package.json` if the `--brand` flag got rewritten.

  Then update the generator tests that assert on the emitted `[data-style]` selectors (they hardcode the old 7-mode count and use `regular` as an example mode):
  - `generate-tailwind-package.test.js` — the "emits exactly 7 `[data-style]` selectors" test (`toHaveLength(7)` → `6`; update its "Total: 7"/"other 6 modes" comment to 6/5), **and** the `config.spacingDefault` cascade test (`it('config.spacingDefault shifts which mode lands under :root…')`): `toHaveLength(7)` → `6`, and repoint the `expect(css).not.toMatch(/…regular…/)` line to a surviving non-default mode — use `default` (with `spacingDefault: 'relaxed'`, `default` is the mode that loses the `:root` combinator and becomes a plain selector), and update the "all 7 modes" comments to 6.
  - `generate-modular.test.js` — the "emits all 7 per-mode `[data-style]` blocks" test and its `spacingDefault` cascade counterpart: same edits (`toHaveLength(7)` → `6`; repoint `regular` → `default`; "7"→"6" in titles/comments).

- [ ] **Step 9: Verify the gates** — `pnpm validate:spacing-modes && pnpm --filter @nexus/core test:unit && pnpm --filter @nexus/core audit:mode-distinctness && pnpm --filter @nexus/core audit:mode-codenames`. Expected:
  - value-preservation green (no surviving renamed mode's values changed)
  - docs `theme-modes.test.ts` set-equality guard green
  - distinctness audit exits **0** with no spacing or borderwidth duplicate pairs

- [ ] **Step 10: Commit** — `git add -A && git commit -m "refactor(core): remove duplicate spacing and stroke modes (#553)"`

### Task 3: Wire the audit as a CI + pre-commit gate

**Files:** root `package.json`, `.github/workflows/ci.yml`

- [ ] **Step 1: Root script** — add to root `package.json` audit scripts: `"audit:mode-distinctness": "pnpm --filter @nexus/core audit:mode-distinctness"`.

- [ ] **Step 2: CI step** — in `.github/workflows/ci.yml`, in the `audit-tokens` job (gated on `browser_source` since #552, runs after the `regen` step), add after the `Token-mode codename audit` step:

```yaml
- name: Token-mode distinctness audit
  if: ${{ !cancelled() && steps.regen.conclusion == 'success' }}
  run: pnpm audit:mode-distinctness
```

- [ ] **Step 3: Pre-commit guard** — in root `package.json` `lint-staged`, add `pnpm audit:mode-distinctness` to the existing `"packages/core/tokens/**/*.json"` glob (alongside the codename audit). The audit is argv-agnostic (full scan), so it fires correctly on any staged token file.

- [ ] **Step 4: Verify** — `pnpm audit:mode-distinctness` → exit 0. `pnpm typecheck && pnpm lint`.

- [ ] **Step 5: Commit** — `git add package.json .github/workflows/ci.yml && git commit -m "ci: gate on token-mode distinctness audit (#553)"`

### Task 4: Docs + Fluid-style shadow direction artifact

**Files:** spacing/borderwidth docs and stories, `reports/issue-553-fluid-shadow-lab.html`, this plan.

> Audit + typecheck are blind to docs-prose arrays (the #552 lesson). The completion check for this task is **grep + `test:storybook` + human review**, not "audit clean."

- [ ] **Step 1: Fix stale spacing and borderwidth prose.**
  - Any spacing docs/story table that lists `regular` drops it.
  - Any prose that says `default` is byte-identical to `regular` becomes: `default` is the bundled baseline.
  - `Radius.stories.tsx:134` lists five borderwidth modes (`normal/medium/fine/bold/strong`) → three (`normal/fine/strong`).
  - Any borderwidth/stroke prose should show the shipped values: fine `1/1`, normal `1/2`, strong `1.5/3`.

- [ ] **Step 2: Grep as a pointer (not a gate)**
  - `git grep -nE "\bregular\b" -- packages/react/src apps/docs | grep -i spacing`
  - `git grep -nE "\b(medium|bold)\b" -- packages/react/src apps/docs | grep -i border`
  - expect zero live option references. Triage any hit by hand; historical changelog prose is allowed only if explicitly historical.

- [ ] **Step 3: Keep the Fluid shadow lab as the human-eye artifact.** Update/commit `reports/issue-553-fluid-shadow-lab.html` so it renders:
  - the pasted light ladder: `#fafafa`, `#fcfcfc`, then white surfaces with black-alpha stacked shadows
  - the pasted dark ladder: `#171717` → `#484848` with inset white highlight, faint ring, and layered drop shadows
  - a Nexus-vs-Fluid comparison table explaining that Nexus keeps semantic derived surfaces and borrows only the shadow rendering technique
  - a mapping proposal from Nexus shadow modes/sizes to Fluid-style levels

- [ ] **Step 4: Record the shadow direction in the lab only — ship no renderer in #553.**
  - Keep Nexus tokens semantic: `background`, `container`, `popover`, `nav`, `control`, etc.
  - Keep `deriveSurfaces` powered by `surfaceTone`, mode, and `contrast`.
  - Do **not** add public `surface-1` through `surface-8` tokens.
  - **Leave every shadow token value untouched in #553.** Shadow modes are in `MODE_RENAME`, so any in-PR change to a shadow value would re-open the value-preservation blocker this plan is committed to avoiding. The audit already passes for shadow (modes are byte-distinct), so #553's shadow criterion is satisfied by the lab artifact alone.
  - The lab _documents_ the proposed renderer as the target of the follow-up (Step 5): a renderer/generator layer emitting per-mode + per-size box-shadow recipes with variable layer counts —
    - light: black-alpha layered drop stack on mostly flat/paper surfaces
    - dark: inset white highlight + faint ring + layered drop stack

- [ ] **Step 5: Cite the tracked follow-up issue.** #553's shadow criterion is "visual review artifact **or** a documented threshold" — the lab (Step 3) satisfies it outright, so the renderer is genuinely **new** scope, not in-scope work being deferred (so [`.claude/rules/no-follow-up-deferral.md`](../../../.claude/rules/no-follow-up-deferral.md) is not in tension). The follow-up is already tracked in #556 ("Add nested surface/elevation context for Appearance surfaces"), which covers the renderer/generator direction and portal-safe surface context. Edit `reports/issue-553-fluid-shadow-lab.html` to cite #556 **before** the Step 7 commit (so the back-reference lands in the committed lab), and add #556 to the #553 PR body.

- [ ] **Step 6: Behavioral check** — `pnpm test:storybook` green (spacing/radius/stroke stories still render).

- [ ] **Step 7: Commit** — `git add packages/react/src/stories apps/docs reports/issue-553-fluid-shadow-lab.html docs/superpowers/plans/2026-06-28-issue-553-token-mode-distinctness.md && git commit -m "docs(appearance): document distinct modes and Fluid shadow lab (#553)"`

### Task 5: Final validation + PR

- [ ] **Step 1: Full suite** — `pnpm validate:spacing-modes && pnpm audit:mode-codenames && pnpm audit:mode-distinctness && pnpm test:unit && pnpm typecheck && pnpm lint && pnpm test:storybook && pnpm build`. All green/clean.
- [ ] **Step 2: Format gate** — `pnpm format:check` (separate CI gate, see [[feedback-run-format-check-before-push]]).
- [ ] **Step 3: Visual QA** — docs theme picker: confirm spacing no longer offers `regular`; Border Width offers exactly `normal`/`fine`/`strong`; fine/normal/strong are visibly distinct; no 404 for removed `spacing-regular.css` or `borderwidth-{medium,bold}.css`. Console Appearance (after `pnpm build`): density still exposes public `compact/default/comfortable/spacious`; stroke exposes `fine/normal/strong` and persists after reload.
- [ ] **Step 4: Shadow QA** — open `reports/issue-553-fluid-shadow-lab.html`; confirm light and dark reference ladders render; confirm the artifact says Nexus keeps semantic derived surfaces and only borrows Fluid-style shadow recipes.
- [ ] **Step 5: Open the PR** — branch `codex/issue-553-mode-distinctness`, base `main`, `Closes #553`, `Part of #531`. Body: the Decisions table (delete spacing `regular` / remove duplicate borderwidth `medium`+`bold` / preserve radius / Fluid-style shadow lab + #556 follow-up), the audit, and the value-preservation note (deletions only — no surviving-mode value changed). Reference #556 for the nested surface/elevation + Fluid-style shadow renderer follow-up.

---

## Self-Review

**Spec coverage (against #553):**

- ✅ "Add a mode-distinctness audit/test for sibling modes" → Task 1 (pure core + CLI + unit tests).
- ✅ "Flag byte-identical sibling modes unless explicitly allowlisted" → `findViolations` + `DISTINCTNESS_ALLOWLIST`; the default allowlist is empty after `regular`/`medium`/`bold` are deleted.
- ✅ "report the number of differing leaves" → `comparePairs` `differingLeaves` + `firstDiffs`, printed for every pair.
- ✅ "Decide whether duplicate hidden modes should be removed, hidden, or retuned" → the Decisions table (delete spacing regular / remove duplicate borderwidth modes / preserve radius / Fluid shadow lab + deferred renderer).
- ✅ "Border width modes no longer ship as normal/medium/bold byte duplicates" → `medium`/`bold` removed; the survivors `fine` (`1/1`), `normal` (`1/2`), `strong` (`1.5/3`) are already distinct with no retune.
- ✅ "Spacing modes no longer ship regular/default as a confusing duplicate … unless … treated as an alias" → `regular` deleted; `default` remains the bundled baseline.
- ✅ "Shadow … visual review artifact or a clearly documented threshold" → Task 4 Step 3 ships `issue-553-fluid-shadow-lab.html`; Step 5 defers the renderer to a tracked follow-up.
- ✅ Non-goals honored: **no value retune at all** — only deletions of byte-duplicate modes. No surviving mode's values move, so value-preservation is untouched.

**Placeholder scan:** none — every path, deletion, list value, and CI step is concrete. The one explicit orientation step (Task 1 Step 0) confirms manifest field names rather than guessing them.

**Type/name consistency:** `diffLeaves` / `comparePairs` / `findViolations` / `leafValues` / `DISTINCTNESS_ALLOWLIST` are defined in Task 1 and reused by the CLI and tests with identical signatures. `CANONICAL_MODES`, `MODE_RENAME.spacing`, and docs converge on six spacing modes without `regular`. `CANONICAL_BORDERWIDTH_MODES`, `MODE_RENAME.borderwidth`, `THEME_MODE_VALUES.borderwidth`, and the deleted files all converge on `fine`/`normal`/`strong`.

**Risk watch:** the only value-preservation interaction is Task 2's `MODE_RENAME` narrowing (dropping `vega→regular`, `lyra→medium`, `mira→bold`). No surviving renamed mode's values change, so the oracle is edited only to delete dead entries. If any surviving renamed mode's values ever move, stop and re-check (and update the oracle atomically). Separately, the `regular` deletion + `BASELINE_MODE→default` shrink **hardcoded mode-inventory assertions** in `validate-spacing-modes.test.js` (the 7-mode literal + the spacing baseline) and in the two generator tests (`toHaveLength(7)` + the `regular`-cascade example) — these are explicit edits in Task 2 Steps 5 & 8, with `test:unit` (Step 9) as the backstop. They are not value-preservation; `mode-rename-value-preservation.test.js` itself stays untouched.
