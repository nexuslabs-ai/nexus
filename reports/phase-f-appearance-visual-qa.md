# Phase F Appearance Visual QA

## Baseline

- Branch: `codex/phase-f-appearance-visual-qa`
- Base/head at start: `5fc8ba554`
- Started: `2026-06-29T19:10:59Z`
- Issue: #566
- Epic: #531

## Summary

Phase F checked the Appearance system as a real product surface, not only as an
API. The pass covered Console Appearance, Settings, the topbar quick control,
command palette entry, a dense CRM scene, and Storybook token/component states
across light/dark, surface tones, contrast, typography, density, corners,
elevation, and stroke.

Outcome: no visual blocker remains in the captured surfaces. The pass found and
fixed one visual runtime-consumption gap, and verified the clearer border alias
classes remain runtime-safe:

- `strong` stroke used `1.5px` for default borders, but Chromium computes
  `1.5px` borders as `1px`, making the public Stroke control look inert on
  common borders.

## Baseline Commands

| Command                                       | Result | Notes                                                              |
| --------------------------------------------- | ------ | ------------------------------------------------------------------ |
| `corepack pnpm audit:appearance-reactivity`   | Pass   | `Appearance reactivity audit clean (120 files scanned).`           |
| `corepack pnpm typecheck:dist`                | Pass   | Core, React Appearance, and Tailwind/CSS dist probes passed.       |
| `corepack pnpm --filter @nexus/react build`   | Pass   | Built `@nexus/react` dist.                                         |
| `corepack pnpm --filter @nexus/console build` | Pass   | Built console dist; Vite emitted the existing large chunk warning. |

## Tooling Notes

- Use `corepack pnpm`, not the Codex shim `pnpm`. The repo pins
  `pnpm@10.12.1`; the shim currently runs pnpm 11 and rejects the lockfile
  because it no longer reads `pnpm.overrides`.
- The first failed pnpm attempt damaged `node_modules`;
  `corepack pnpm install --frozen-lockfile` restored dependencies without
  lockfile changes.

## Screenshot Inventory

| ID                              | Surface                 | State                                        | Path                                                             |
| ------------------------------- | ----------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| console-light-stone             | `/design/appearance`    | light stone contrast 60                      | `reports/phase-f/console-appearance-light-stone.png`             |
| console-light-neutral           | `/design/appearance`    | light neutral contrast 60                    | `reports/phase-f/console-appearance-light-neutral.png`           |
| console-light-zinc              | `/design/appearance`    | light zinc contrast 60                       | `reports/phase-f/console-appearance-light-zinc.png`              |
| console-light-slate             | `/design/appearance`    | light slate contrast 60                      | `reports/phase-f/console-appearance-light-slate.png`             |
| console-light-gray              | `/design/appearance`    | light gray contrast 60                       | `reports/phase-f/console-appearance-light-gray.png`              |
| console-dark-stone              | `/design/appearance`    | dark stone contrast 60                       | `reports/phase-f/console-appearance-dark-stone.png`              |
| console-dark-neutral            | `/design/appearance`    | dark neutral contrast 60                     | `reports/phase-f/console-appearance-dark-neutral.png`            |
| console-dark-zinc               | `/design/appearance`    | dark zinc contrast 60                        | `reports/phase-f/console-appearance-dark-zinc.png`               |
| console-dark-slate              | `/design/appearance`    | dark slate contrast 60                       | `reports/phase-f/console-appearance-dark-slate.png`              |
| console-dark-gray               | `/design/appearance`    | dark gray contrast 60                        | `reports/phase-f/console-appearance-dark-gray.png`               |
| console-dark-slate-contrast-0   | `/design/appearance`    | dark slate contrast 0                        | `reports/phase-f/console-appearance-dark-slate-contrast-0.png`   |
| console-dark-slate-contrast-60  | `/design/appearance`    | dark slate contrast 60                       | `reports/phase-f/console-appearance-dark-slate-contrast-60.png`  |
| console-dark-slate-contrast-100 | `/design/appearance`    | dark slate contrast 100                      | `reports/phase-f/console-appearance-dark-slate-contrast-100.png` |
| console-settings-appearance     | `/design/scenes`        | dark slate settings appearance               | `reports/phase-f/console-settings-appearance-dark-slate.png`     |
| console-topbar-quick-control    | topbar quick control    | dark slate topbar quick control open         | `reports/phase-f/console-topbar-quick-control-dark-slate.png`    |
| console-command-palette         | command palette         | dark slate command palette search appearance | `reports/phase-f/console-command-palette-dark-slate.png`         |
| console-dense-crm               | `/m/crm`                | dark slate dense CRM scene                   | `reports/phase-f/console-crm-dark-slate.png`                     |
| storybook-typography            | Tokens/Typography       | dark slate strong elevation                  | `reports/phase-f/storybook-typography-dark-slate.png`            |
| storybook-spacing               | Tokens/Spacing          | dark slate strong elevation                  | `reports/phase-f/storybook-spacing-dark-slate.png`               |
| storybook-shadow                | Tokens/Shadow           | dark slate strong elevation                  | `reports/phase-f/storybook-shadow-dark-slate.png`                |
| storybook-colors                | Tokens/Colors           | dark slate strong elevation                  | `reports/phase-f/storybook-colors-dark-slate.png`                |
| storybook-button                | Components/Button       | dark slate strong elevation                  | `reports/phase-f/storybook-button-dark-slate.png`                |
| storybook-card                  | Components/Card         | dark slate strong elevation                  | `reports/phase-f/storybook-card-dark-slate.png`                  |
| storybook-input                 | Components/Input        | dark slate strong elevation                  | `reports/phase-f/storybook-input-dark-slate.png`                 |
| storybook-table                 | Components/Table        | dark slate strong elevation                  | `reports/phase-f/storybook-table-dark-slate.png`                 |
| storybook-sheet                 | Components/Sheet        | dark slate strong elevation                  | `reports/phase-f/storybook-sheet-dark-slate.png`                 |
| storybook-dialog-open           | Components/Dialog       | dark slate dialog open                       | `reports/phase-f/storybook-dialog-open-dark-slate.png`           |
| storybook-select-open           | Components/Select       | dark slate select open                       | `reports/phase-f/storybook-select-open-dark-slate.png`           |
| storybook-popover-open          | Components/Popover      | dark slate popover open                      | `reports/phase-f/storybook-popover-open-dark-slate.png`          |
| storybook-sheet-open            | Components/Sheet        | dark slate Sheet default open                | `reports/phase-f/storybook-sheet-open-dark-slate.png`            |
| storybook-dropdownmenu-open     | Components/DropdownMenu | dark slate DropdownMenu default open         | `reports/phase-f/storybook-dropdownmenu-open-dark-slate.png`     |

## Findings

| #   | Severity | Surface                | State                        | Evidence                                                                                                                                                                                              | Decision                                                                                                                                              |
| --- | -------- | ---------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Verified | Card/Input/Accordion   | Runtime stroke/color aliases | The clearer `border-width-*` / `border-color-*` aliases still resolve to runtime Stroke/Border variables and merge safely with border colors and width overrides.                                     | Kept the clearer aliases and kept the appearance reactivity audit focused on raw widths, numeric widths, and arbitrary literals that bypass controls. |
| F2  | Fixed    | Stroke control         | `strong` on common borders   | Chromium computes `1.5px` border widths as `1px`; live Card/Input/CRM default borders therefore looked unchanged under `strong`.                                                                      | Changed `borderwidth-strong.default` to `2px`, regenerated modular/docs/Tailwind CSS, and updated distinctness expectations.                          |
| F3  | Fixed    | Package consumer build | Docs build                   | `@nexus/react` ESM exported `CommandDialog`, but generated top-level declarations re-exported component directories. Next/docs package resolution did not expose `CommandDialog` from `@nexus/react`. | Rewrote generated declaration component exports to explicit `/index` barrel paths and extended the dist consumer probe to import `CommandDialog`.     |
| F4  | Watch    | Density control        | table-heavy CRM scene        | Density variables move, and compact visibly reduces CRM row height. Comfortable/spacious are subtle in the CRM table because table rows still lean on numeric/fixed spacing.                          | Not a blocker for Phase F. Track as a future product-density calibration if stronger table density is desired.                                        |

## Control Measurements

| Control        | Values Checked                             | Result                                                                                                                                           |
| -------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| UI font size   | 12 / 14 / 18                               | Body text changed to `12px / 14px / 18px`; heading scale followed (`25.7143px / 30px / 38.5714px`).                                              |
| Code font size | 11 / 12 / 16                               | Code preview changed to `11px / 12px / 16px`.                                                                                                    |
| Density        | compact / default / comfortable / spacious | CRM row height changed `51px -> 57px` from compact to default; role spacing vars also move. Comfortable/spacious are subtle on this table scene. |
| Corners        | square / subtle / smooth / round           | Card radius changed `0px / 8px / 12px / 16px`.                                                                                                   |
| Elevation      | quiet / standard / strong                  | Card shadow alpha/geometry steps increased monotonically.                                                                                        |
| Stroke         | fine / normal / strong                     | CRM row divider changed `1px / 1px / 2px`; `strong` now visibly changes default borders.                                                         |

## Console QA Matrix

### Appearance Surfaces

- [x] `/design/appearance`
- [x] Settings -> Appearance
- [x] topbar quick control
- [x] command palette path to Appearance
- [x] dense console scene after changing Appearance

### Modes And Tones

- [x] light + stone
- [x] light + neutral
- [x] light + zinc
- [x] light + slate
- [x] light + gray
- [x] dark + stone
- [x] dark + neutral
- [x] dark + zinc
- [x] dark + slate
- [x] dark + gray

### Public Controls

- [x] contrast `0 / 60 / 100`
- [x] UI font size `12 / 14 / 18`
- [x] code font size `11 / 12 / 16`
- [x] density `compact / default / comfortable / spacious`
- [x] corners `square / subtle / smooth / round`
- [x] elevation `quiet / standard / strong`
- [x] stroke `fine / normal / strong`

## Storybook QA Matrix

- [x] Typography
- [x] Spacing
- [x] Shadow
- [x] Colors
- [x] Button
- [x] Card
- [x] Input
- [x] Table
- [x] Dialog
- [x] Select
- [x] DropdownMenu
- [x] Popover
- [x] Sheet

## Visual Direction Notes

Product: Nexus console and design-system package.

User: builders and operators using repeated work surfaces.

North star: quiet, scannable, production-grade operational UI with live theming
that feels intentional in both light and dark modes.

The refreshed dark slate console, CRM table, Storybook Card/Input, and overlay
states now read as restrained product UI rather than the earlier heavy preview.
The parked nested-surface issue (#556) remains out of scope; this pass did not
add `surface-level-*` behavior.

## Final Validation

| Command                                                                                                                                                                                                                                              | Result | Notes                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| `corepack pnpm validate:spacing-modes`                                                                                                                                                                                                               | Pass   | Token mode key parity stayed green after `borderwidth-strong` calibration.                          |
| `corepack pnpm audit:mode-distinctness`                                                                                                                                                                                                              | Pass   | `borderwidth: normal vs strong` now differs on both `default` and `thick`.                          |
| `corepack pnpm audit:appearance-reactivity`                                                                                                                                                                                                          | Pass   | `Appearance reactivity audit clean (120 files scanned).`                                            |
| `corepack pnpm test:unit packages/react/scripts/audit-appearance-reactivity.test.js packages/react/src/appearance/appearance-reactivity.test.tsx packages/react/src/lib/utils.test.ts packages/core/scripts/lib/__tests__/mode-distinctness.test.js` | Pass   | Focused reactivity/distinctness checks.                                                             |
| `corepack pnpm test:unit packages/core/scripts/__tests__/mode-rename-value-preservation.test.js packages/core/scripts/lib/__tests__/mode-distinctness.test.js`                                                                                       | Pass   | Frozen migration oracle with one documented Phase F stroke calibration.                             |
| `corepack pnpm test:unit`                                                                                                                                                                                                                            | Pass   | 50 files, 804 tests.                                                                                |
| `corepack pnpm audit:storybook-coverage`                                                                                                                                                                                                             | Pass   | 56 components, 0 findings.                                                                          |
| `corepack pnpm test:storybook`                                                                                                                                                                                                                       | Pass   | 62 files, 713 tests. Existing Chart story size warnings remain stderr-only.                         |
| `corepack pnpm typecheck:dist`                                                                                                                                                                                                                       | Pass   | Core runtime, React Appearance, React top-level `CommandDialog`, and Tailwind/CSS dist probes pass. |
| `PATH=/private/tmp/corepack-pnpm:$PATH corepack pnpm typecheck`                                                                                                                                                                                      | Pass   | Root Turbo typecheck passes when child tasks resolve pnpm 10.12.1.                                  |
| `corepack pnpm lint`                                                                                                                                                                                                                                 | Pass   | ESLint clean.                                                                                       |
| `PATH=/private/tmp/corepack-pnpm:$PATH corepack pnpm build`                                                                                                                                                                                          | Pass   | Root Turbo build passes; console still emits the existing large chunk warning.                      |
