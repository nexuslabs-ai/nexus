# Appearance Theming → Nexus Package APIs — Epic Plan

> **For agentic workers:** This is an **epic umbrella**, not a single executable plan. It spans four independent subsystems; each Phase below gets its **own** `docs/superpowers/` artifact before implementation (a spec for Phase A, a `writing-plans` plan for B/C/D). Implement a Phase via `superpowers:subagent-driven-development` or `superpowers:executing-plans` only after that Phase's own plan exists.

**Goal:** Promote the runtime appearance-theming capability from an `apps/console`-only implementation into first-class Nexus package APIs — a derive engine + model in `@nexus/core` and a provider + editor behind a dedicated `@nexus/react/appearance` entry — so any consumer (or agent) gets brand-from-seeds, APCA-legal theming out of the box.

**Architecture:** `@nexus/core` owns framework-agnostic data (contract, prefs, option maps, sanitizers) + the engine (`deriveTheme` → token **data**, `themeToCss` → web applier). `@nexus/react/appearance` is a **separate bundle entry** owning the React provider, the `useNexusAppearance` hook, and the editor UI. The `@nexus/core` Tailwind generator emits per-mode attribute blocks so layout axes apply via `data-*` attributes, not CSS-file loads. `apps/console` dogfoods the packages and keeps only shell/route concerns.

**Tech Stack:** TypeScript, React, Vite (library mode, multi-entry), Tailwind v4, culori + apca-w3 (OKLCH/APCA math), size-limit, Storybook (stories-as-tests), vitest.

**Status:** PR #437 **merged** to `main` (squash `f2cb983`, "console proves it"). This epic is the "Nexus ships it" follow-up. Source to promote currently lives under `apps/console/src/{app,hooks,lib,modules}` on `main`.

## Global Constraints

- **Bundle ceiling:** `@nexus/react` ESM size-limit is **88 kB** (root `package.json` `size-limit`), currently **~86.9 kB** → ~1 kB headroom. `deriveTheme`+`themeToCss` bundled (culori+apca tree-shaken, brotli) ≈ **15.25 kB**. The engine MUST NOT land in the main `index.mjs` barrel.
- **`@nexus/core` is `private: true`** (unpublished); deps `culori@^4`, `apca-w3@^0.1.9`. Any cross-package runtime use must resolve to bundle-or-publish explicitly.
- **APCA legibility is a guarantee, not a default** — every derived text/surface pair must clear the gate (`packages/core/src/lib/derive-theme.ts` legibility sweep is the invariant test).
- **Cross-platform split is load-bearing:** `deriveTheme` returns data; `themeToCss` is the web applier. Never fold `themeToCss` into a React hook.
- **Browserslist floor Safari 15.4** → no `light-dark()` in emitted CSS (`themeToCss` uses `:root` / `:root.dark`).
- **Stories ARE tests** (`.claude/rules/testing-react.md`): shipped components are tested via `*.stories.tsx` play functions + the `audit:storybook-coverage` DoD gate; hooks/utils via `*.test.ts`. A `*.test.tsx` under `packages/react/src/components/**` is silently excluded from the unit run (`vitest.config.ts`).
- **Pre-production** (`.claude/rules/project-stage.md`): rename/remove freely, no aliases, no migration shims.

---

## Aligned decisions (2026-06-26)

1. **Teach the engine to mix the full token set** — `deriveTheme` should derive _all_ `--nx-color-*` (not the ~66 it does today), so a "surface tone" selection is real for every tone, not frozen at baked stone. _(Open design question — see Phase A.)_
2. **Ship behind its own door** — `@nexus/react/appearance` is a **separate bundle entry with its own size budget**; `@nexus/core` joins `@nexus/react` as an **optional peer + external** (mirroring `sonner`/`recharts`), not a bundled hard dependency.
3. **Add a first-paint contract** — a pre-hydration inline script applies persisted theme before paint (fixes FOUC and the SSR `window is not defined` crash together).
4. **Test the repo's way + sweep up** — stories + play functions + `audit:storybook-coverage` for shipped components; migrate (don't re-author) existing core/lib tests; delete dead state instead of promoting it.

---

## Phase decomposition

| Phase                                     | Deliverable                                                                                                | Gates                                                           | Depends on                    | Next artifact                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------- | ------------------------------------------ |
| **A — Full-token derivation**             | `deriveTheme` emits the complete `--nx-color-*` set, APCA-held, for any base tone                          | The whole epic's _value_ (without it, surface-tone is cosmetic) | —                             | **Spec via brainstorming** (open design Q) |
| **B — Package the engine + provider**     | `@nexus/core` model/sanitizers + `@nexus/react/appearance` separate entry + generator `data-*` mode-blocks | Bundle ceiling; no engine in main barrel                        | A (engine surface stabilized) | `writing-plans` plan                       |
| **C — First-paint contract**              | Pre-hydration script + SSR-safe provider init                                                              | FOUC; SSR crash                                                 | B (provider exists)           | `writing-plans` plan                       |
| **D — Console dogfood + tests + cleanup** | Console imports packages; stories + coverage; dead code deleted                                            | `audit:storybook-coverage`, size-limit, CI                      | B, C                          | `writing-plans` plan                       |

**Sequencing:** A is the gate — spike it first; its output (the final token list the engine produces) sets B's public surface. B → C → D run in order. A can be spiked in parallel with B's _packaging scaffolding_ (vite entry, exports map) since that scaffolding is independent of the token math.

---

## Phase A — Full-token derivation (needs a spec first)

**Why it's a spike, not a task list.** Today `deriveTheme` (`packages/core/src/lib/derive-theme.ts`) emits ~**66** of the **156** `--nx-color-*` tokens a curated base ships (surfaces, text tiers, primary + subtle). The remaining ~**90** come from static per-base CSS and have no derivation rule yet:

- **status families** (success / warning / error / information) + their `-subtle` / `-hover` / `-active` / `-foreground` variants
- **`-alpha` tokens** (translucent overlays, scrims, `bg-overlay`)
- **`secondary-*`** family
- **`chart-categorical-1..5`**
- **backdrop / nav chrome** tokens

**Open questions the spec must answer:**

1. Are status hues **fixed** (brand-independent green/amber/red/blue, only their surfaces/text re-derived per background+contrast), or seed-relative? (Tier-A systems mostly fix status hue.)
2. How are `-alpha` tokens derived — fixed opacity over the derived surface, or computed?
3. Chart categoricals: derive a perceptually-spaced ramp from the accent, or keep a fixed accessible set?
4. Does every new family pass the APCA gate, and does the existing legibility sweep extend to cover them?

**Deliverable of Phase A:** a `docs/superpowers/specs/` design doc answering the above + an extended `deriveTheme` whose output token list **equals** the curated base token list (verified by a test asserting no `--nx-color-*` key is missing vs `packages/tailwind/nexus.css`). Then the per-tone static `<link>`s can be dropped without freezing tokens.

**Acceptance criteria:**

- `deriveTheme(contract)` returns every `--nx-color-*` key present in a curated base.
- A test asserts parity between derived keys and the curated token set (no silent omissions).
- The APCA legibility sweep covers status + secondary text/surface pairs.
- Picking any surface tone in the editor changes **all** affected tokens, not ~66.

---

## Phase B — Package the engine + provider

**Files (create / modify):**

- Create `packages/core/src/lib/appearance-model.ts` — `NexusThemeContract`, `NexusAppearanceState`, `NexusAppearancePrefs`, `NexusSurfaceTone`, option maps (surface tone / density / corners / elevation / stroke), `DEFAULT_NEXUS_APPEARANCE`, sanitizers, `createNexusThemeContract(state)`. (Promote from `apps/console/src/lib/{codex-contract,codex-prefs,appearance-theme}.ts`, renaming `Codex*`→`Nexus*`.)
- Modify `packages/core/src/index.ts` — export the model + `deriveTheme`/`themeToCss` (already exported).
- Modify `packages/core/scripts/generate-tailwind-package.js` — generalize the spacing `data-style` per-mode emitter to also emit `[data-radius]` / `[data-shadow]` / `[data-borderwidth]` blocks into `nexus.css`.
- Create `packages/react/src/appearance/` — `provider.tsx` (`NexusAppearanceProvider`, `useNexusAppearance`), `appearance-settings.tsx`, `theme-quick-control.tsx`, internal `color-field.tsx` / `setting-row.tsx` / `config-preview.tsx`, `index.ts`.
- Modify `packages/react/vite.config.ts` — multi-entry (`index` + `appearance`); externalize `@nexus/core` + `culori` + `apca-w3`.
- Modify `packages/react/package.json` — add `./appearance` to `exports` with its own `.d.ts`; add `@nexus/core` as optional `peerDependencies` + `peerDependenciesMeta.optional`.
- Modify root `package.json` `size-limit` — add a budget entry for `packages/react/dist/appearance.mjs`.

**Council findings addressed:** B1 (bundle — own entry, externalized engine, own budget, no barrel re-export), M2 (optional-peer not hard dep), M4 part (generator mode-blocks).

**Acceptance criteria:**

- `import { NexusAppearanceProvider } from '@nexus/react/appearance'` resolves from built `dist`.
- `dist/index.mjs` size-limit unchanged (engine NOT in main barrel); `dist/appearance.mjs` has its own budget and passes.
- `nexus.css` contains `[data-radius]` / `[data-shadow]` / `[data-borderwidth]` blocks; default (no attribute) still resolves.
- `@nexus/core` does not appear in a Button-only consumer's bundle.

---

## Phase C — First-paint contract

**Files:**

- Create `packages/react/src/appearance/pre-hydration-script.ts` — exports a stringified inline script (reads the storage key, sets `.dark` + `data-*` attributes + inline `:root` derived vars) for host apps to inline in `<head>` before the app bundle.
- Modify `packages/react/src/appearance/provider.tsx` — initial state read from the DOM (attributes the script set), not `localStorage` during render; all `window`/`document`/`matchMedia` access in effects or guarded; `matchMedia` effect depends on `appearance` only.
- Docs: host-app setup shows the inline script + `<meta name="color-scheme" content="light dark">`.

**Council findings addressed:** B2 (SSR crash), M1-FOUC, minor (effect-dep churn).

**Acceptance criteria:**

- A pure resolver (persisted payload + system pref → class/attr/vars) is unit-tested.
- Provider renders without `window` (SSR) — asserted in a jsdom-less test or via guard test.
- No flash: with a persisted dark theme, first paint is dark (manual + the resolver test).

---

## Phase D — Console dogfood + tests + cleanup

**Files:**

- Modify `apps/console` — wrap in `NexusAppearanceProvider`; render `NexusAppearanceSettings` in `/design/appearance` and Settings→Appearance; `useNexusAppearance` for topbar + command-palette toggles; `NexusThemeQuickControl` in topbar.
- Delete `apps/console/src/lib/{codex-contract,codex-prefs,appearance-theme}.ts`, the local hooks (`use-derived-theme`, `use-appearance-prefs`), and the local Appearance UI now living in the package.
- Delete dead theme assets: `apps/console/public/themes/{radius,shadow,borderwidth}-*.css` once the generator emits attribute blocks; prune from `scripts/sync-console-themes.js` and `generate-modular.js`.
- Remove dead state: the `theme.dark` field (written, never read) and the `setBaseTone` double-write.
- Stories: `*.stories.tsx` + play functions for each shipped component, `data-slot` attributes, `base-variants.config.json` entries.

**Council findings addressed:** M1 (stories-are-tests + DoD gate), M3 (dead state), M4 (dead files), tester gaps (size-limit gate, direct `light-dark()` assertion, matchMedia mock, storage-key migration note).

**Acceptance criteria (the DoD gate the original plan omitted):**

- `pnpm --filter @nexus/react audit:storybook-coverage --component <each new component>` → exit 0.
- `pnpm size-limit` green (incl. the new `appearance.mjs` budget).
- A core test asserts `themeToCss(deriveTheme(...))` does **not** contain `light-dark(`.
- `pnpm typecheck && pnpm lint && pnpm test:unit && pnpm --filter @nexus/react build && pnpm build && pnpm test:storybook && pnpm audit:browser-support` all green.
- Storage-key rename: saved themes reset to default gracefully (documented; pre-prod-acceptable).

---

## Out of scope (v1)

- Subtree-scoped theming (provider themes `document.documentElement` only — `themeToCss` hardcodes `:root`).
- Publishing `@nexus/core` to a registry (resolve via bundle/external within the workspace).
- A native (RN) applier — the data/applier split keeps the door open (#218); not built here.

## Open questions

- **Phase A is the unknown.** Until the derivation strategy for status/alpha/chart/secondary is decided, B's public token surface isn't final. Spike A first.
- Keep curated bases at all? If A fully derives the set, the 5 static base CSS files may become redundant — decide during Phase A whether derive _replaces_ or _coexists with_ curated bases.
