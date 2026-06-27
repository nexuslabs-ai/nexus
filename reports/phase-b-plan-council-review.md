# Phase B Plan — Council Review

**Plan reviewed:** "Phase B Package Engine + Provider Plan" (by Codex)
**Method:** 5-agent council (architect / sde2 / tester / omissions-sweep / adversarial refuter), every claim verified against source.
**Verdict:** **Fundamentally sound and faithful to the epic — but not yet executable.** 4 blocking issues, ~13 should-fixes. The plan describes _what_ to build correctly; it under-specifies (or gets wrong) several _how_ details that would fail at build/test time.

A deliberate note on calibration: 3 of my own first-pass findings were **refuted** by the adversarial pass (see §4). I'm reporting them as refuted rather than burying them — the surviving findings below all survived an explicit attempt to break them.

---

## 1. Blocking (verified against source — must resolve before implementation)

### B1. The `@nexus/core` dependency is mis-wired — it bundles into `index.mjs` today and blows the 88 kB budget

This is the verified, load-bearing problem. `@nexus/core` is a **devDependency only** (`react/package.json:34`); `peerDependenciesMeta.optional` is inert without a matching `peerDependencies` entry, and core is **absent from the vite `external` list** (`vite.config.ts:31-42`). So as the plan is wired, the engine (plus culori + apca-w3) bundles into the main barrel and breaks the ~1 kB-headroom 88 kB budget. **Fix:** add core to `peerDependencies` **and** `external` (keep in devDeps for Storybook). (sde2 B2/B3.)

Underneath that wiring sits a **decision the plan must make explicit but doesn't**: bundle the engine into `appearance.mjs`, or keep it external. The epic already anticipated unpublished core — its _Out of scope (v1)_ list (epic L141) says "Publishing `@nexus/core` to a registry (**resolve via bundle/external within the workspace**)." For v1 the consumers are the workspace apps (console/playground), where `external` + the pnpm symlink resolves fine — so external is viable and **not** a blocker on its own; it just has to be _wired_ (above) and _chosen_ (below):

- **External** (matches epic Decision #2, sonner/recharts pattern) — engine stays out of every bundle; correct for v1 workspace scope; **requires** core in `peerDependencies` + vite `external`.
- **Bundle into `appearance.mjs`** — the separate entry's own budget absorbs the ~15 kB engine; simplest if core is never published. Makes the culori/apca externalization moot.

The plan names neither; pick one and wire it. (`packages/core/package.json` is `private:true` with no `files`/`main`/`exports`, so _publishing_ core is the heaviest path and explicitly deferred — don't reach for it in B.)

**Same section, separate hard bug — multi-entry `fileName` collision:** `vite.config.ts:28` `fileName: (format) => index.${format === 'es' ? 'mjs' : 'js'}` hardcodes `index`, so both entries write `index.mjs`. Must key off the entry name: `(format, entryName) => …${entryName}…`. (sde2 B2.)

### B2. "Generalize the spacing emitter" hides ~80% of the generator work

`packages/core/scripts/utils.js`: `collectSpacingTokens(semanticDir)` (`:784`) returns a **mode-keyed literal map** (`{ [mode]: tokens[] }`) — exactly what the per-mode `[data-style]` block emitter `generateSpacingModesCSS` (`:893`) consumes. But `collectRadiusTokens(tokensDir, mode)` (`:1160`) and `collectBorderwidthTokens(tokensDir, mode)` (`:1193`) take a **single mode** and return `{cssName, varRef}` shaped for `@theme` emission, and `collectShadowTokens(tokensDir, primitiveMap)` (`:1301`) is different again. **None** produce the per-mode literal map the block emitter needs.

**Fix the plan must spell out:** write 3 new per-mode literal collectors (read all `primitives/{radius,borderwidth,shadow}/*`), and parameterize `generateSpacingModesCSS`'s hardcoded `[data-style]` attribute name + its `spacing-`-prefixed dedup check. (sde2 B1.)

### B3. The shadow-emit prose contradicts the plan's own parity test

The plan says shadow blocks "resolve the **composite** `styles/shadows.json` values per mode." Its generator test says output must "match the **existing modular** shadow CSS semantics." These conflict: the shipped modular CSS (`apps/console/public/themes/shadow-maia.css`) overrides **primitives** (e.g. `--nx-shadow-sm-layer-2-color: oklch(…)`) while the composite `--shadow-sm` stays in `@theme` as `var()` refs. A composite-literal implementation fails the parity test. **Implement shadow as primitive-override** (the same mechanism as spacing/radius) and fix the prose. (sde2 S2.)
Related: all 5 shadow light/dark primitive pairs are **byte-identical**, so the "light/dark-aware" dark branch emits nothing today — it's unexercised and would ship untested (add a divergent-dark fixture or assert the dark-branch shape). (sde2 M2.)

### B4. The plan's own verification step is unrunnable as written

`audit:storybook-coverage --component NexusAppearanceSettings` (in the plan's Test Plan + verification commands) resolves components **only** under `src/components/{ui,primitives}/` (`audit-storybook-coverage.mjs:32,570`; `component-paths.mjs:11`) and **throws** otherwise. The plan places its components in `src/appearance/` → the command exits non-zero. The epic also assigns stories/coverage to **Phase D**, and the variant/size/disabled matrix doesn't fit a settings panel. **Fix:** drop the story/audit items from B; test the provider/hook via `renderHook` + wrapper now (§3), and ship stories in Phase D. (tester B-1.)

**Sequencing note (not a plan-as-written defect):** the plan is _additive_ — it adds `NexusThemeContract` and leaves core's `CodexThemeContract` alone — so it doesn't break the console, but it then ships duplicate/orphan types (§2, Type model). The clean fix (rename `CodexThemeContract`→`NexusThemeContract` in place, pre-prod, no alias) **does** break 60+ console refs (`theme-provider.tsx:1`, `codex-contract.ts:1`, …) until Phase D migrates them. So sequence the rename with the console migration: either rename + migrate the console in B, or keep `CodexThemeContract` until D. The plan must state which. (Explore O1 / Architect A3.)

---

## 2. Should-fix (grouped)

**Type model**

- `NexusThemeContract` is an **orphan** — nothing produces it (`createNexusThemeContract` returns `ThemeDerivationInput`; `NexusAppearanceState` already carries `appearance`). Drop it. Make `NexusAppearanceState` the single source of truth; `createNexusThemeContract(state)` expands it to `ThemeDerivationInput` (no `appearance`). State explicitly that `NexusSurfaceTone` is an **in-place rename** of core's existing `SurfaceTone` (derive-theme.ts:17), not a fresh duplicate. Define `NexusAppearanceMode` once and point `appearance` at it. (Architect A3; refuter downgraded my "duplicate types" F1 to this narrower, correct kernel.)

**`createNexusThemeContract` spec (the plan hand-waves the central transform)**

- Give the exact body, mirroring `codex-contract.ts:14-20`: `light: { accent: brandColor, ...BASE_TONE_SEEDS[tone].light }`, same for dark. Promote `BASE_TONE_SEEDS` (appearance-theme.ts:22-46) into core (no cycle — core imports nothing from react). The surface-tone "option map" must carry **bg/fg seeds**, not just labels. Drop `applyBrandColor`/`applyBaseTone`/`surfaceToneFromSeeds` — dead in a flat-state model. (Architect A4/A5; tester SF-1.)

**Persistence**

- Persist the **compact `NexusAppearanceState`** (brand + tone + contrast + mode + axes + prefs), expand on read — this removes `surfaceToneFromSeeds` and makes tone/seed drift unrepresentable. Resolve the single `storageKey` vs the console's **two** keys (contract + prefs): one key now holds both halves; specify graceful reset (pre-prod — no migration). (Architect A5; Explore O5; tester SF-3.)

**Provider behavior**

- Controlled `state` + `storageKey` precedence is undefined → honor `storageKey` in **uncontrolled mode only**; the parent owns persistence (via `onStateChange`) when controlled. Persist `appearance: 'system'` **verbatim**, not the matchMedia-resolved value. (Architect A7.)
- Document the field→attribute codec: `density→data-style`, `corners→data-radius`, `elevation→data-shadow`, `stroke→data-borderwidth`. (Explore O3.)
- Pin what `config-preview.tsx` renders: `themeToCss` hardcodes `:root`/`:root.dark` (derive-theme.ts:549-551), so it cannot show a **candidate** (un-applied) theme in a pane — any injected block leaks document-wide. Subtree-scoped theming is explicitly **out of scope v1** (epic L140), so the resolution is _not_ a scoped serializer — it's to document that the preview mirrors the **applied** theme only, and that there is one provider per document. The plan names the component but never says what it displays; make that explicit. (Architect A2.)

**Prefs portability**

- `prefsToCss` hardcodes the console-only selector `[data-slot="sidebar-container"]` (translucentSidebar, codex-prefs.ts:114); `diffMarkers` and `AppearanceConfigPreview`'s `markers` prop are console-diff concepts. Decide the **generic** `NexusAppearancePrefs` shape before promotion — don't leak console fields into the package. (Explore O6/O7; my F4.)

**Bundling / budgets**

- `appearance.mjs` size-limit entry needs **a real kB number** (a budget with no number is not a gate) — and `ignore: ['@nexus/core']` **only if** B1 resolves to _external_ (if core is bundled into `appearance.mjs`, do **not** ignore it — that's the weight you're budgeting). Add a gate measuring `index.mjs` immediately after the entry split — multi-entry shared-chunk hoisting can raise it with zero feature change (≈1 kB headroom). (sde2 S4/B4.)
- `cssCodeSplit:false` + multi-entry may rename the bundled CSS off `react.css`; the `./styles.css` export and size-limit path both hardcode it. Pin `build.lib.cssFileName: 'react'`. (sde2 S3.)

**Tests** (Phase-B-legal vehicles)

- Provider/hook behavior → `renderHook(() => useNexusAppearance(), { wrapper: NexusAppearanceProvider })` in a `*.test.ts` (component `*.test.tsx` is banned; stories are Phase D). Covers DOM application (all 5 attrs + `.dark`), `<style>`-tag idempotency, storage round-trip/corruption/`storageKey={false}`, controlled-vs-uncontrolled, system-mode.
- **Highest-value test to add:** `createNexusThemeContract(state)` → `deriveTheme(...)` parametrized over **all 5 tones**, asserting the parity key-set holds (derive-theme.parity.test.ts:47-71). (tester SF-1.)
- **Migrate** the 3 console suites (`codex-contract.test.ts`, `codex-prefs.test.ts`, `appearance-theme.test.ts`) — they already encode the prototype-chain, brand-on-both-modes, font-clamp, and null-payload edge cases the plan lists as "new." Don't re-author. (tester SF-2.)
- system-mode test must **override** the global mock (`packages/test-utils/src/setup.ts:21` hardcodes `matches:false`; raw jsdom `matchMedia` is `undefined`). Assert the `change` listener + cleanup. (tester SF-6.)
- Generator test must assert emitted `nexus.css` contains no `light-dark(` (Safari 15.4 floor) — the existing assertion only covers `themeToCss`. (tester SF-7.)

**Exclude dead / console-local from promotion**

- Mark the dead `theme.dark` field (written, never read; AppearanceSettings.tsx:104) and the console `useTheme` `loadCSS` `<link>`-swapping pattern as **not promoted**. (Explore O4/O9.)

---

## 3. Minor

- `toggledAppearance` (appearance-theme.ts:98) omitted from the promote inventory. (O10)
- `<meta name="color-scheme">` ownership (provider vs host app) undocumented — console does it at `theme-provider.tsx:41-49`. (O11)
- No `validate:*` invariant guard for the 3 new mode families (only `spacing-*` is guarded) — an asymmetric mode file emits a broken `[data-*]` block silently. (sde2 M3)
- `appearance.d.ts` may hit the same TS2742 "cannot be named" rollup issue the existing `@radix-ui/react-context` pin dodges; verify it emits. (sde2 M1)
- Shadow emit-all adds ~11 kB to the **unbudgeted** `nexus.css` (≈2.8 kB/mode × 4 net-new modes) — worth a mention, not a budget violation.

---

## 4. What I refuted from my own first pass (calibration)

- **CSS bloat against the 30 kB budget — REFUTED (empirically).** Token mode blocks ship from the **unbudgeted** `nexus.css` (`@nexus/tailwind`), not `dist/react.css` — which is utilities-only (`grep -c data-style dist/react.css` = 0). Emit-all is the **shipped precedent** (spacing already ships all 7 modes while exposing 4). So "emit all modes" is fine; just document that unexposed modes (`blunt`/`lyra`/`vega`) are reachable only by raw attribute.
- **Optional-peer "silent DX hole" — REFUTED.** It's epic Decision #2; a `./appearance` consumer who omits core gets a **loud** build-time unresolved-module error (same as `<Chart>` without recharts). Forcing it non-optional would nag every Button-only consumer. (The real issue is the wiring in B1.)
- **Base-stylesheet presumption — REFUTED.** Requiring the consumer to load the token stylesheet is the universal `@nexus/react` contract, not an appearance-specific gap.
- **culori/apca externalization — SURVIVES but trivial.** Verified no `@nexus/react` file imports them (`AppearanceColorField` is hex-only, native `<input type=color>` + regex). Harmless dead config today; the real latent trap is _declare-if-newly-imported_. Moot if B1 bundles core.

---

## 5. What the plan got right (faithful, not lucky)

- The four layout enums **exactly match** the console's curated option arrays (`appearance-theme.ts:48-72`) — faithful promotion, not transcription error.
- Themed-shadow vs un-themed-radius/borderwidth distinction is **accurate**.
- Own-key sanitizer (`Object.hasOwn`) matches the shipped console guard and carries forward the **real** prototype-pollution fix from commit `a958b2a`.
- Keeping the engine out of `index.mjs` (no main-barrel re-export, no `@nexus/react` self-import in `./appearance`) is correct for the 88 kB budget.
- Defaults (radius `sharp` / shadow `maia` / borderwidth `vega`) match `DEFAULT_CONFIG` and the curated enums.
- Public default of **light** mode (vs the console's dark) is the right library default.
- The `:root, [data-X="<default>"]` + plain `[data-X="other"]` switch mechanism is the correct generalization of the spacing precedent.

---

## 6. Net recommendation

The plan is a faithful, mostly-correct expansion of the epic's Phase B — its enum curation, sanitizer hardening, and bundle-isolation instincts are right. It is **not yet executable** because of B1 (the `@nexus/core` dependency is mis-wired so it bundles into `index.mjs` today, plus an unmade bundle-vs-external decision and a `fileName` collision), B2/B3 (the generator work it under-describes, and a shadow-emit approach that contradicts its own parity test), and B4 (a verification step whose command exits non-zero as written). Resolve those four, pin the `createNexusThemeContract`/state-model spec (§2), sequence the `Codex*`→`Nexus*` rename against the console migration, and re-scope tests to hook-tests-now / stories-in-D — then it's ready to implement.
