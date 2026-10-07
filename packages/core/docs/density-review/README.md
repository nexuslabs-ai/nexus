# Shared density-scale review (draft)

This PR isolates the shared density changes above the committed Button/ButtonGroup stack. It is not ready to merge. Findings below must be resolved in this PR before marking it ready; they are not deferred to unspecified follow-up work.

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

- [x] **Switch checked-thumb alignment.** Replaced fixed travel distances with track-relative logical positioning. Both sizes are tested across six densities, checked/unchecked and LTR/RTL.
- [ ] **Density-sensitive icon consumers.** Badge and Alert now use the approved fixed icon tokens from #818. Other numeric glyph consumers (including menus, sidebar, standalone Spinner and pagination) still need an explicit role-by-role decision; this PR has not silently migrated them.
- [x] **Default-only measurement assertions.** Explicitly scope Default contracts; use resolved spacing tokens for density-aware Button, Slider and Tooltip assertions. Add multi-density Button height and fixed-glyph checks.
- [x] **Full-suite pointer/colour reliability.** Serialize browser story files, release native pointer hover after press tests, and wait for finite colour transitions before comparing final colours.
- [ ] **Complete remaining visual checks.** Open states, settled charts, dark theme, narrow containers and RTL need final coverage on the isolated branch. Fix confirmed regressions in this PR.
- [ ] **Coordinate appearance work.** PR #814 / issue #796 changes root selectors and appearance ownership. Reconcile generated CSS and rerun density evidence after that branch lands. The approved merge order is #814 → #816 → #818 → #817. This draft is rebased onto #818; generated CSS is rebuilt from that appearance-aware source.

## Reproduction

Run `pnpm --filter @nexus_ds/core build`, then `pnpm --filter @nexus_ds/core build:tailwind`, and copy `packages/core/dist/tailwind/*.css` to `packages/tailwind/`.

For the exploratory density sweep, the only temporary change was adding `{ initialGlobals: { density: '<mode>' } }` after `projectAnnotations` in `packages/react/.storybook/vitest.setup.ts`, then running `node node_modules/vitest/vitest.mjs run --project storybook`. The setup file was restored after the run. Stories with their own explicit NexusRoot/appearance still retain that override. The focused rerun added `--maxWorkers=1` and selected `Press Feedback|Error Outline Group|Disabled And Loading Themes`.

Core catalogue assertions now require spacing to be nondecreasing across densities and strictly increasing through the numeric steps inside each mode. The existing generated-CSS parity test verifies all emitted spacing declarations.

## Isolated branch verification

Against main base `abc5dc8b8885f93c6936ff9fb6c41a4c498aa00e`: Core build and Tailwind generation passed; all 14 catalogue tests passed; spacing-mode validation, focused ESLint, Core and React typechecks passed. This does not supersede the unresolved component audit above.

## Release

A major core changeset records the intentional breaking visual change to existing shared values. Do not hardcode a release version: publish the version produced by Changesets, accounting for other pending releases. Confirm the release classification when this draft becomes ready.

## Integration verification (2026-10-07)

Rebased the density commit onto #818 at `f285d10e5`, excluding unrelated newer-main commits. The pre-rebase branch and local-fix stash are retained as recovery points. This changes dependency order, not the approved numeric scale.

Component fixes: Switch anchors thumb travel to the actual track using logical positioning, including RTL; Badge uses the existing 14px icon token; Alert uses the existing 16px icon token. No new token definitions were added by these fixes.

Stories: Default-only measurement stories explicitly select Default. Density-aware assertions resolve current spacing values. Button verifies its full size/height progression; Badge checks fixed icons across six roots; Alert's old density attributes are replaced with real NexusRoot scopes; Switch checks both sizes and directions across all densities. The Storybook runner serializes files because native pointer commands share a browser pointer, and colour comparisons wait for finite button transitions to settle.

Modern Web Guidance: retrieved `css` guidance using `modern-web-guidance` (skill version `2026_09_04-7de96777`), particularly logical properties and token use. Decision: logical track anchoring with existing utilities; verification: Switch geometry assertions across six densities and LTR/RTL plus rendered inspection. No environment queries introduced.

Rebased Core build, generated CSS, all 16 catalogue tests, repository typecheck and focused ESLint passed. Final six-density suite results are recorded in the PR update after completion. The prior 997-story run was on the pre-rebase merged checkout; it is not the count for this base.

The audit JSON was moved out of `tokens/` into `packages/core/docs/density-review/` so it is not treated as an unregistered token document.

Visual checks on this base: Switch six-density matrix in both directions; settled area/bar charts in dark Spacious mode; open Dialog in dark Spacious at desktop and 375px viewport; Alert six-density action layout at 375px. Remaining broad dark/narrow/open-state checks and other glyph consumers remain merge gates. Passing Storybook tests is not full visual or contrast certification.
