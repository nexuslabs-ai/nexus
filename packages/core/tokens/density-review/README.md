# Shared density-scale review (draft)

This PR isolates the shared density changes from the uncommitted Button/ButtonGroup work. It is not ready to merge. Findings below must be resolved in this PR before marking it ready; they are not deferred to unspecified follow-up work.

## Decision and scope

The previous scale allowed Tight to exceed Default and Spacious to be smaller than Relaxed. The approved replacement height progression is:

| Consumer size    | Tight | Compact | Default | Comfortable | Relaxed | Spacious |
| ---------------- | ----: | ------: | ------: | ----------: | ------: | -------: |
| XS (`h-7`)       |    24 |      26 |      28 |          30 |      32 |       34 |
| Small (`h-8`)    |    28 |      30 |      32 |          34 |      36 |       38 |
| Default (`h-10`) |    36 |      38 |      40 |          42 |      44 |       46 |
| Large (`h-12`)   |    44 |      46 |      48 |          50 |      52 |       54 |

These are shared numeric spacing tokens, not dedicated control heights. Widths, heights, padding, margins, gaps and offsets using the changed steps also change. Steps whose Default value is at least 24px use offsets -4/-2/0/+2/+4/+6px. Smaller Tight steps reuse Compact; smaller Spacious steps reuse Relaxed. Tight container/layout role spacing reuses Compact. Default and Relaxed token files remain unchanged. The ESLint canonical spacing-value list is regenerated from the approved token files so its validation stays in sync.

No Button API, fixed-icon primitive, 13px typography, press interaction or ButtonGroup implementation changes belong to this PR. The approved Button text/icon sizing work stays in `codex/button-interactions`. The XS row describes the approved consumer mapping; XS Button itself is not introduced here.

## Audit provenance

The exploratory audit ran on `codex/button-interactions` at HEAD `0e81cd38d` plus its uncommitted Button, icon, typography and density changes. It is evidence of risk, not a passing run against this isolated main-based branch. Source scanning found 62 implementation files directly referencing changed spacing steps, with additional transitive consumers. All 78 Storybook files were exercised so the audit did not rely exclusively on the direct-reference scan.

| Density     | Stories passed | Failed | Total |
| ----------- | -------------: | -----: | ----: |
| Tight       |            954 |     17 |   971 |
| Compact     |            954 |     17 |   971 |
| Comfortable |            960 |     11 |   971 |
| Spacious    |            954 |     17 |   971 |

Three stories (Button PressFeedback, Button DisabledAndLoadingThemes, ButtonGroup ErrorOutlineGroup) all passed in isolated single-worker runs at each density. This narrows the full-suite failures but does not establish their concurrent reliability.

Representative examples for all 68 component/appearance Storybook families were captured at Tight and Spacious and reviewed as contact sheets. Selected open dialogs, drawers, sheets, menus and popovers were also inspected. Nonvisual AppearanceScript and explicitly scoped appearance examples are not proof that every nested scope uses the toolbar density. This is not exhaustive variant/theme/viewport/RTL verification. Charts were captured during animation and need settled-state visual verification. The Storybook a11y configuration disables colour-contrast checks; this is not contrast certification.

`coverage.csv` records the story-family inventory and full-suite failures. `direct-consumers.json` records the static scan; it is not a complete import-graph analysis.

## Findings and merge gates

- [ ] **Switch checked-thumb alignment regression.** `packages/react/src/components/switch/switch.tsx` uses `h-5 w-9` for its default track and `size-4 translate-x-4` for its thumb. At Comfortable, the new track is 38px wide, with a 16px thumb, 16px travel and 2px borders. The checked right inset is 4px rather than the matching 2px. Before the change the track was 36px. Anchor checked travel to actual available track space using the existing styling vocabulary; add a story assertion across density and RTL. Do not silently distort the approved height scale to accommodate the switch.
- [ ] **Density-sensitive icon consumers.** Badge still uses numeric spacing for glyphs; its icon stories expect 14px but measured 12px at Tight/Compact and 16px at Spacious. This coupling predates the new scale, but the patch changes which values those glyphs inherit. Decide and document whether each affected glyph should track density or use an approved fixed icon token. Do not import the uncommitted Button icon-token addition implicitly.
- [ ] **Default-only measurement assertions.** Accordion, Alert, Badge, Button, ButtonGroup, Card, Select, Slider and Tooltip contain assertions assuming Default geometry. Default-only stories must explicitly select Default; stories intended to cover density must assert the chosen density contract. Do not relax meaningful layout assertions merely to turn the suite green.
- [ ] **Full-suite pointer/colour reliability.** Isolated successes do not erase full-suite native-pointer timeouts or colour-string comparison races. Reproduce with an intentional concurrency configuration and verify the final suite.
- [ ] **Complete remaining visual checks.** Open states, settled charts, dark theme, narrow containers and RTL need final coverage on the isolated branch. Fix confirmed regressions in this PR.
- [ ] **Coordinate appearance work.** PR #814 / issue #796 changes root selectors and appearance ownership. Reconcile generated CSS and rerun density evidence after that branch lands. This draft targets main to avoid importing unrelated Button/Alert work.

## Reproduction

Run `pnpm --filter @nexus_ds/core build`, then `pnpm --filter @nexus_ds/core build:tailwind`, and copy `packages/core/dist/tailwind/*.css` to `packages/tailwind/`.

For the exploratory density sweep, the only temporary change was adding `{ initialGlobals: { density: '<mode>' } }` after `projectAnnotations` in `packages/react/.storybook/vitest.setup.ts`, then running `node node_modules/vitest/vitest.mjs run --project storybook`. The setup file was restored after the run. Stories with their own explicit NexusRoot/appearance still retain that override. The focused rerun added `--maxWorkers=1` and selected `Press Feedback|Error Outline Group|Disabled And Loading Themes`.

Core catalogue assertions now require spacing to be nondecreasing across densities and strictly increasing through the numeric steps inside each mode. The existing generated-CSS parity test verifies all emitted spacing declarations.

## Isolated branch verification

Against main base `abc5dc8b8885f93c6936ff9fb6c41a4c498aa00e`: Core build and Tailwind generation passed; all 14 catalogue tests passed; spacing-mode validation, focused ESLint, Core and React typechecks passed. This does not supersede the unresolved component audit above.

## Release

A major core changeset records the intentional breaking visual change to existing shared values. Do not hardcode a release version: publish the version produced by Changesets, accounting for other pending releases. Confirm the release classification when this draft becomes ready.
