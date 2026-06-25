# Nexus Style-Token Leak Audit

This document keeps the baseline audit evidence first. The implementation
follow-up section records changes made on this branch after that baseline scan.

## Baseline Proof

| Field              | Value                                                                                |
| ------------------ | ------------------------------------------------------------------------------------ |
| Worktree           | `/Users/temp/.codex/worktrees/3d2a/nexus`                                            |
| Branch             | detached HEAD; `git name-rev HEAD` resolves to `main`                                |
| HEAD               | `644eb78535566d498edd33fb833ebb1afe3fbb8a`                                           |
| Base checked       | `main` at `644eb78535566d498edd33fb833ebb1afe3fbb8a`                                 |
| Merge-base         | `644eb78535566d498edd33fb833ebb1afe3fbb8a`                                           |
| Initial diff state | clean by `git diff --quiet`, `git diff --cached --quiet`, and `git diff main...HEAD` |
| Untracked files    | none by `git ls-files --others --exclude-standard`                                   |

Tracked scope used for the primary audit:

| Tree                         | Files |    LOC |
| ---------------------------- | ----: | -----: |
| `packages/react/src`         |   189 | 41,712 |
| `packages/core`              |    89 | 21,576 |
| `packages/tailwind`          |     6 |  1,309 |
| `apps/console`               |   148 | 16,681 |
| Primary plus secondary total |   432 | 81,278 |

Related but non-finding context:

| Tree                           | Files |   LOC | Use                                                   |
| ------------------------------ | ----: | ----: | ----------------------------------------------------- |
| `packages/eslint-plugin-nexus` |    14 | 1,062 | Existing guard inspection and plug proposal target    |
| `apps/docs`                    |    78 | 7,246 | Excluded marketing/docs consumer; appendix count only |

## Scope And Method

Findings are classified into these buckets:

| Bucket               | Meaning                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| leak                 | Raw or arbitrary styling escapes an existing token/composite surface and has a plausible token-backed target. |
| convention           | Valid utility, but violates a repo convention such as padding-based control sizing.                           |
| sanctioned-exception | Existing documented or verified exception; do not migrate without a separate design decision.                 |
| allowed-one-off      | Arbitrary/system value is locally meaningful and not replaceable by the current scale.                        |
| needs-new-token      | A design-system concept exists, but no current token/composite names it.                                      |
| needs-decision       | The scan found a real seam, but the correct policy is not yet settled.                                        |
| non-runtime          | Story, docs, token source, generated token output, or guard code; not counted as runtime source leakage.      |

Mechanical inventory used these families:

- Typography weight: `nx:(...:)font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)`.
- Typography leading: `nx:(...:)leading-(none|tight|snug|normal|relaxed|loose|<number>|[...])`.
- Typography tracking: `nx:(...:)tracking-(tighter|tight|normal|wide|wider|widest|[...])`.
- Typography size: named `text-*`, arbitrary `text-[...]`, and inline `fontSize/fontWeight/lineHeight/letterSpacing`.
- Color: raw primitive fill/stroke/ring/gradient utilities plus color literals.
- Spacing/sizing: arbitrary `p/m/gap/size/w/h/min/max/inset/top/right/bottom/left/translate-*`.
- Fixed-height convention: `h-*` inside `packages/react/src/components/ui`.
- Radius/border: arbitrary `rounded-[...]`, `rounded-*-[...]`, and `border-[...]`.
- Z-index: `z-*` minus `z-overlay`, `z-sticky`, `z-modal`, `z-popover`, `z-toast`, `z-max`.
- Focus/ring: non-focus `ring-*` utilities.
- Motion: arbitrary `duration/ease/delay/animate-[...]`.
- Responsive: viewport prefixes inside component internals and raw `vh`.

Modern Web Guidance CSS guidance was checked before writing conclusions. Relevant points: prefer token/custom-property architecture for nontrivial values, use `outline` for focus visibility, preserve forced-colors behavior with system colors where needed, and prefer `svh/lvh/dvh` over raw `vh`. The repo browser floor remains Chrome 111+, Edge 111+, Firefox 113+, Safari 15.4+, Samsung Internet 22+, with OKLCH treated as the floor feature.

## Baseline Executive Summary

This is not a #495-scale migration. At baseline, the primary React runtime had a concentrated set of open seams:

| Rank | Finding                                                                                                                         |                                                        Count | Classification                          |
| ---: | ------------------------------------------------------------------------------------------------------------------------------- | -----------------------------------------------------------: | --------------------------------------- |
|    1 | Typography non-size utilities (`font-*`, `leading-*`) bypassed both reset and lint.                                             |                        10 primary hits, plus 28 console hits | leak / needs-new-token / needs-decision |
|    2 | Raw numeric z-index appears in local stacking contexts.                                                                         |                                               6 primary hits | needs-decision before linting           |
|    3 | Chart uses arbitrary radius and border width where token or chart-specific policy should exist.                                 |                                          3 primary leak hits | leak                                    |
|    4 | Avatar initials arbitrary text sizes are sanctioned by issue #496, but related weight/leading/ring geometry still needs policy. |  9 sanctioned size hits, 1 weight/leading line, 3 ring lines | sanctioned-exception / needs-decision   |
|    5 | Input and Switch fixed geometry are convention issues, not token leaks.                                                         | Input 3 `h-*`; Switch 4 arbitrary geometry tokens plus `h-5` | convention                              |
|    6 | `apps/console` contains raw typography and color swatch literals.                                                               |                                        47 runtime candidates | secondary consumer exposure             |

Clean or guarded areas:

| Area                                                | Status                                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Raw named font size                                 | Guarded by `--text-*` reset and `rawFontSize` lint. No primary runtime named `text-xs/sm/base/...` hits found. |
| Raw primitive `bg/text/border` colors               | Guarded by `nx-class-conventions` `rawPrimitive`. No open primary runtime hits found in the scanned set.       |
| Raw primitive `fill/stroke/ring/from/via/to` colors | No current primary runtime primitive-color hits found, but the lint gap remains open.                          |
| Shadow                                              | `--shadow-*` reset is present; no arbitrary shadow or focusable-shadow leak found by this scan.                |
| Motion                                              | No arbitrary motion utility hits found in primary or console runtime.                                          |
| Raw `vh`                                            | No raw `vh` hits found in primary or console runtime; current arbitrary viewport heights use `svh`.            |

## Defense Coverage Matrix

| Family                                        | Reset in `packages/tailwind/nexus.css`       | Lint guard                                                                                         | Audit script                         | Net status                                                                             |
| --------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| Color primitives: `bg/text/border`            | `--color-*` reset                            | `rawPrimitive`                                                                                     | `audit-class-refs` for semantic refs | Guarded.                                                                               |
| Color primitives: `fill/stroke/ring/gradient` | `--color-*` reset                            | none                                                                                               | none                                 | Currently clean in runtime, but future seam is open.                                   |
| Color literals                                | n/a                                          | none                                                                                               | none                                 | Runtime literals are mostly selector/system/app data, not direct token leaks.          |
| Typography size: named                        | `--text-*` reset                             | `rawFontSize`                                                                                      | none                                 | Guarded.                                                                               |
| Typography size: arbitrary                    | bypasses reset                               | none                                                                                               | none                                 | Avatar exception is sanctioned; console/icon candidates remain.                        |
| Typography weight/leading/tracking            | not reset                                    | current branch adds runtime-scoped `rawFontWeight`, `rawLineHeight`, and `rawLetterSpacing` checks | none                                 | Baseline was open; current branch guards React/console runtime classes through ESLint. |
| Typography composites                         | n/a                                          | `deadTypography`                                                                                   | drift test                           | Guarded by hardcoded live list plus test.                                              |
| Spacing/sizing named                          | `--spacing-*` reset plus Nexus scale         | token JSON spacing guard only                                                                      | none                                 | Reset-only for source classes; arbitrary values bypass.                                |
| Radius                                        | `--radius-*` reset                           | none                                                                                               | none                                 | Reset-only; Chart has arbitrary radius hits.                                           |
| Border width                                  | custom `--border-*` utilities                | none                                                                                               | none                                 | Chart has arbitrary `border-[1.5px]`.                                                  |
| Shadow                                        | `--shadow-*` reset                           | none                                                                                               | none                                 | Source clean in this scan.                                                             |
| Z-index                                       | token keys exist, but namespace is not reset | none                                                                                               | none                                 | Open; 6 primary numeric hits.                                                          |
| Focus                                         | n/a                                          | none                                                                                               | component review only                | Presence audit candidate; Avatar non-focus rings need decision.                        |
| Motion                                        | custom imports / Tailwind defaults           | none                                                                                               | none                                 | Source clean in this scan.                                                             |
| Responsive                                    | `--breakpoint-*` reset                       | none                                                                                               | responsive rule docs                 | Viewport-prefix exceptions need a clearer allowlist.                                   |

Current reset block verified at `packages/tailwind/nexus.css:19-24`:

```css
--color-*: initial;
--spacing-*: initial;
--text-*: initial;
--radius-*: initial;
--shadow-*: initial;
--breakpoint-*: initial;
```

Notably absent from that reset block: `--font-weight-*`, `--leading-*`, `--tracking-*`, and `--z-index-*`.

## Per-Family Findings

### Color

Closed/blocked:

| Surface                                              | Evidence                                                                                         | Status                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------- |
| Raw primitive `bg/text/border`                       | `nx-class-conventions.js` has `rawPrimitive`; `nexus.css` resets `--color-*`.                    | Guarded.                          |
| Semantic color refs                                  | `packages/core/scripts/audit-class-refs.js` validates semantic refs against emitted `--color-*`. | Guarded for the prefixes it owns. |
| Runtime raw primitive `fill/stroke/ring/from/via/to` | Mechanical scan found 0 raw primitive runtime hits.                                              | Source clean, guard gap remains.  |

Still-possible/open:

| Location                                                                  | Pattern                                                                          | Bucket          | Recommendation                                                                                                                                                         |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/react/src/components/ui/chart/chart.tsx:75`                     | `#ccc`, `#fff` inside arbitrary selectors matching Recharts generated attributes | allowed-one-off | Keep out of primitive-color lint or require a documented selector-literal allowlist. These literals identify third-party SVG attributes; they do not apply raw colors. |
| `packages/react/src/components/ui/native-select/native-select.tsx:97,115` | `nx:bg-[Canvas]`, `nx:text-[CanvasText]`                                         | allowed-one-off | Forced-colors/system-color values are deliberate browser UI integration. Do not classify as arbitrary font-size/color leak.                                            |
| `apps/console/src/hooks/useTheme.ts:4-17`                                 | 11 hex swatch values                                                             | needs-decision  | Secondary consumer app stores palette swatch metadata. Prefer deriving from token data if this is meant to stay design-system-authored.                                |

False positives subtracted: issue references in comments such as `#281`, `#418`, `#119`, and `#118`.

### Typography

Closed/blocked:

| Surface         | Evidence                                                                | Status                                       |
| --------------- | ----------------------------------------------------------------------- | -------------------------------------------- |
| Raw named sizes | `--text-*` reset plus `rawFontSize` lint.                               | Guarded; no primary runtime named-size hits. |
| Dead composites | `LIVE_TYPOGRAPHY` in `nx-class-conventions.js` plus drift test comment. | Guarded, but list is hardcoded.              |

Primary runtime findings:

| Location                                                           | Pattern                             | Bucket               | Recommendation                                                                                                                                      |
| ------------------------------------------------------------------ | ----------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/react/src/components/ui/avatar/avatar.tsx:11-19`         | 9 `nx:text-[...]` sizes             | sanctioned-exception | Verified by issue #496. Avatar initials scale with avatar diameter, not semantic role. Keep allowed unless a new avatar-initials token is designed. |
| `packages/react/src/components/ui/avatar/avatar.tsx:199`           | `nx:font-medium`, `nx:leading-none` | needs-decision       | Decide whether Avatar fallback initials get a local token/policy alongside the #496 arbitrary-size exception.                                       |
| `packages/react/src/components/ui/chart/chart.tsx:174,180`         | `nx:font-medium`                    | leak                 | Use a typography composite or add a chart tooltip label token.                                                                                      |
| `packages/react/src/components/ui/chart/chart.tsx:327`             | `nx:leading-none`                   | leak                 | Composite-swap trap required: likely delete redundant line-height if the composite already owns it.                                                 |
| `packages/react/src/components/ui/chart/chart.tsx:338`             | `nx:font-mono nx:font-medium`       | needs-new-token      | Existing `code-inline` may not be right for chart numeric values; decide on a chart value typography token/composite.                               |
| `packages/react/src/components/ui/date-picker/date-picker.tsx:339` | `nx:leading-none`                   | leak                 | Composite-swap trap required.                                                                                                                       |
| `packages/react/src/components/ui/date-picker/date-picker.tsx:345` | `nx:data-[today=true]:font-medium`  | leak                 | Prefer token/composite ownership for emphasized day text.                                                                                           |
| `packages/react/src/components/ui/field/field.tsx:150`             | `nx:leading-snug`                   | leak                 | Confirm whether the field content composite should own this line-height.                                                                            |
| `packages/react/src/components/ui/table/table.tsx:379`             | `nx:font-medium`                    | leak                 | Prefer label/body composite or token-backed table header/body role.                                                                                 |

Secondary console findings:

| Family                 | Count | Locations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `font-*`               |    24 | `apps/console/src/app/auth-layout.tsx:20`; `analytics-route.tsx:185`; `verify-route.tsx:58`; `billing-route.tsx:242`; `plan-sheet.tsx:123`; `crm/contact-card.tsx:17`; `crm/contacts-board.tsx:157`; `crm/contacts-columns.tsx:88`; `design-system/ComponentShowcase.tsx:234,263,312,318,324,330`; `inbox/conversation-list.tsx:69` x2; `people/member-card.tsx:17`; `people/people-columns.tsx:94`; `projects/issue-card.tsx:22`; `projects/issues-columns.tsx:97`; `shell/app-sidebar.tsx:77,81,176`; `shell/notifications-menu.tsx:188` |
| `leading-*`            |     3 | `apps/console/src/app/auth-layout.tsx:27`; `design-system/IconShowcase.tsx:51`; `projects/issue-detail-route.tsx:110`                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `tracking-*`           |     1 | `apps/console/src/app/not-found.tsx:13`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| arbitrary `text-[...]` |     1 | `apps/console/src/modules/design-system/IconShowcase.tsx:51`                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### Spacing And Sizing

Closed/blocked:

| Surface                   | Evidence                                                                                           | Status                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Named spacing scale       | `--spacing-*` reset, then Nexus scale in `nexus.css`.                                              | Off-scale named utilities should no-op. |
| Token JSON spacing values | `canonical-spacing-steps.js` validates spacing mode JSON values against `canonical-step-set.json`. | Token-source guard only.                |

Open convention surface:

| Location                                                      | Pattern                                                                           | Bucket     | Recommendation                                                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `packages/react/src/components/ui/input/input.tsx:20-22`      | `nx:h-10`, `nx:h-8`, `nx:h-12`                                                    | convention | Defer to Input-specific cleanup. This is not a token leak; it is a sizing convention question.    |
| `packages/react/src/components/ui/switch/switch.tsx:23-24,44` | `nx:h-5`, `nx:h-[18px]`, `nx:w-[32px]`, `nx:size-[14px]`, `nx:translate-x-[14px]` | convention | Likely intrinsic switch geometry, but should be documented or migrated in a Switch-specific pass. |

Arbitrary spacing/size candidates that are not automatic leaks:

| Location                                                                   | Pattern                                             | Bucket                         |
| -------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------ |
| `packages/react/src/components/ui/avatar/avatar.tsx:209`                   | `right-[0.04em]`, `bottom-[0.04em]`, `size-[0.6em]` | allowed-one-off candidate      |
| `packages/react/src/components/ui/breadcrumb/breadcrumb.tsx:127,154`       | `max-w-[150px]`                                     | needs-decision                 |
| `packages/react/src/components/ui/command/command.tsx:184`                 | `max-h-[300px]`                                     | needs-decision                 |
| `packages/react/src/components/ui/drawer/drawer.tsx:101,102,111`           | `max-h-[80svh]`, `w-[100px]`                        | needs-decision                 |
| `packages/react/src/components/ui/navigation-menu/navigation-menu.tsx:301` | `top-[60%]`                                         | needs-decision                 |
| `packages/react/src/components/ui/sidebar/sidebar.tsx:334,349`             | `w-[calc(...)]`                                     | needs-decision                 |
| `apps/console/src/modules/analytics/analytics-charts.tsx:25`               | `h-[260px]`                                         | secondary consumer             |
| `apps/console/src/modules/coming-soon.tsx:26`                              | `min-h-[60svh]`                                     | secondary consumer, uses `svh` |
| `apps/console/src/modules/inbox/conversation-thread.tsx:234`               | `max-w-[75%]`                                       | secondary consumer             |
| `apps/console/src/modules/inbox/inbox-route.tsx:57`                        | `h-[calc(100svh-3.5rem)]`                           | secondary consumer, uses `svh` |

Policy note: keep arbitrary values when no exact Nexus scale utility exists. Do not snap to a nearby token and change approved geometry.

### Radius And Border Width

Closed/blocked:

| Surface             | Evidence                                                                        | Status                                                                   |
| ------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Named radius scale  | `--radius-*` reset and semantic radius tokens in `nexus.css`.                   | Off-scale named radius should no-op.                                     |
| Named border widths | `--border-default` and `--border-thick` emitted by `borderwidth-utilities.css`. | Token surface exists, but lint does not protect arbitrary border widths. |

Primary runtime findings:

| Location                                                                           | Pattern                                  | Bucket          | Recommendation                                                                                    |
| ---------------------------------------------------------------------------------- | ---------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------- |
| `packages/react/src/components/ui/chart/chart.tsx:272`                             | `nx:rounded-[2px]`                       | leak            | Add/use a chart marker radius token or choose an existing radius if exact.                        |
| `packages/react/src/components/ui/chart/chart.tsx:276`                             | `nx:border-[1.5px]`                      | leak            | Add/use a border-width token if 1.5px is intentional.                                             |
| `packages/react/src/components/ui/chart/chart.tsx:393`                             | `nx:rounded-[2px]`                       | leak            | Same chart marker radius decision as line 272.                                                    |
| `packages/react/src/components/ui/avatar/avatar.tsx:165,199`; `scroll-area.tsx:65` | `nx:rounded-[inherit]`                   | allowed-one-off | Inheritance keyword, not a raw numeric design token. Allowlist if arbitrary-radius lint is added. |
| `packages/react/src/components/ui/scroll-area/scroll-area.tsx:74`                  | `nx:forced-colors:border-[ButtonBorder]` | allowed-one-off | Forced-colors system keyword; preserve accessibility behavior.                                    |

### Shadow

No runtime arbitrary shadow candidates were found. The current source uses tokenized `shadow-*` utilities where present, and `--shadow-*` is reset in `nexus.css`.

### Z-Index

Token source exists at `packages/core/tokens/semantic/z-index.json`: `overlay` 10, `sticky` 30, `modal` 50, `popover` 70, `toast` 100, `max` 9999. `nexus.css` emits token utilities, but does not reset `--z-index-*`.

Primary runtime candidates:

| Location                                                                   | Pattern                                 | Bucket                | Recommendation                                                                                           |
| -------------------------------------------------------------------------- | --------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| `packages/react/src/components/ui/button-group/button-group.tsx:15`        | `nx:*:focus-visible:z-10`               | needs-decision        | Local focus overlap, not structural overlay layering. Decide whether local numeric z values are allowed. |
| `packages/react/src/components/ui/date-picker/date-picker.tsx:343`         | `nx:group-data-[focused=true]/day:z-10` | needs-decision        | Local calendar focus stacking. Token scale may be semantically too broad.                                |
| `packages/react/src/components/ui/date-picker/date-picker.tsx:361`         | `nx:z-10`                               | needs-decision        | Calendar caption local stacking.                                                                         |
| `packages/react/src/components/ui/input-otp/input-otp.tsx:125`             | `nx:data-[active=true]:z-10`            | needs-decision        | Local active-cell stacking.                                                                              |
| `packages/react/src/components/ui/navigation-menu/navigation-menu.tsx:294` | `nx:z-1`                                | leak / needs-decision | Very low local arrow stacking; either local policy or token map needed.                                  |
| `packages/react/src/components/ui/resizable/resizable.tsx:76`              | `nx:z-10`                               | leak / needs-decision | Resize handle local stacking.                                                                            |

Recommendation: do not blindly map all `z-10` to `z-overlay`; the existing token scale names structural layers, while several hits are local overlap inside one component.

### Focus And Ring

Closed/blocked:

| Surface                 | Evidence                                                                                                               | Status      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------- |
| Canonical focus outline | `.claude/rules/components.md` defines `focus-visible:outline-2 outline-focus-default outline-offset-(--focus-offset)`. | Documented. |
| Focus color token       | `nexus.css` emits `--color-focus-default` and `--color-focus-error`.                                                   | Tokenized.  |

Open:

| Location                                                 | Pattern                            | Bucket         | Recommendation                                                                                 |
| -------------------------------------------------------- | ---------------------------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| `packages/react/src/components/ui/avatar/avatar.tsx:123` | selected/group `ring-*`            | needs-decision | Non-focus visual emphasis; decide if Avatar gets a ring exception or should use border tokens. |
| `packages/react/src/components/ui/avatar/avatar.tsx:209` | status marker `ring-[0.1em]`       | needs-decision | Em-based geometry tied to avatar diameter; likely exception if documented.                     |
| `packages/react/src/components/ui/avatar/avatar.tsx:335` | AvatarGroup overlap `ring-[0.1em]` | needs-decision | Same policy as status marker.                                                                  |

Separate presence audit proposal: a future guard should check that known focusable controls include the canonical outline token, but only after mapping components that intentionally use roving-focus background tints rather than outlines.

### Motion

No arbitrary `duration-[...]`, `ease-[...]`, `delay-[...]`, or `animate-[...]` runtime hits were found.

### Responsive

Closed/blocked:

| Surface          | Evidence                                                                                           | Status                                    |
| ---------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Raw `vh`         | Scan found no raw `vh` in primary or console runtime. Current viewport arbitrary values use `svh`. | Clean.                                    |
| Breakpoint scale | `--breakpoint-*` reset and semantic breakpoint tokens in `nexus.css`.                              | Off-scale named breakpoints should no-op. |

Viewport-prefix candidates inside component internals:

| Location                                                                           | Pattern                             | Bucket               | Recommendation                                                                                                            |
| ---------------------------------------------------------------------------------- | ----------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `packages/react/src/components/ui/dialog/dialog.tsx:192,305`                       | `lg:` and `sm:` overlay behavior    | sanctioned-exception | Explicitly named by `responsive.md`.                                                                                      |
| `packages/react/src/components/ui/sheet/sheet.tsx:113,117,181`                     | `sm:`, `lg:` overlay behavior       | sanctioned-exception | `responsive.md` names future Sheet as a viewport-driven overlay exception.                                                |
| `packages/react/src/components/ui/drawer/drawer.tsx:129`                           | `md:text-left`                      | needs-decision       | Likely overlay exception; docs should name Drawer if accepted.                                                            |
| `packages/react/src/components/ui/overlay-layout/overlay-layout.ts:16,23,36`       | shared `sm:` overlay layout classes | needs-decision       | Likely exception because it backs overlay layout; docs should name it if accepted.                                        |
| `packages/react/src/components/ui/sidebar/sidebar.tsx:319,341,427,461,698,932,938` | `lg:` page-shell/sidebar behavior   | needs-decision       | Sidebar is page-shell navigation, not a generic embedded component. If accepted, add it to the documented exception list. |

## Runtime Raw Appendix

This appendix groups the primary and secondary runtime candidates from the mechanical scan after generated files, token source/output, stories, and docs were excluded from findings. Rows with comma-separated lines or token lists are grouped duplicates from the same family and component area.

### Primary React Runtime

| Family                     | Bucket               | Location                                                                                  | Token / pattern                                     |
| -------------------------- | -------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| typography-arbitrary-size  | sanctioned-exception | `packages/react/src/components/ui/avatar/avatar.tsx:11`                                   | `nx:text-[0.625rem]`                                |
| typography-arbitrary-size  | sanctioned-exception | `packages/react/src/components/ui/avatar/avatar.tsx:12`                                   | `nx:text-[0.6875rem]`                               |
| typography-arbitrary-size  | sanctioned-exception | `packages/react/src/components/ui/avatar/avatar.tsx:13`                                   | `nx:text-[0.75rem]`                                 |
| typography-arbitrary-size  | sanctioned-exception | `packages/react/src/components/ui/avatar/avatar.tsx:14`                                   | `nx:text-[1rem]`                                    |
| typography-arbitrary-size  | sanctioned-exception | `packages/react/src/components/ui/avatar/avatar.tsx:15`                                   | `nx:text-[1.125rem]`                                |
| typography-arbitrary-size  | sanctioned-exception | `packages/react/src/components/ui/avatar/avatar.tsx:16`                                   | `nx:text-[1.25rem]`                                 |
| typography-arbitrary-size  | sanctioned-exception | `packages/react/src/components/ui/avatar/avatar.tsx:17`                                   | `nx:text-[1.5rem]`                                  |
| typography-arbitrary-size  | sanctioned-exception | `packages/react/src/components/ui/avatar/avatar.tsx:18`                                   | `nx:text-[1.875rem]`                                |
| typography-arbitrary-size  | sanctioned-exception | `packages/react/src/components/ui/avatar/avatar.tsx:19`                                   | `nx:text-[2.25rem]`                                 |
| focus-ring-utility         | needs-decision       | `packages/react/src/components/ui/avatar/avatar.tsx:123`                                  | selected/group `ring-*` utilities                   |
| radius-border-arbitrary    | allowed-one-off      | `packages/react/src/components/ui/avatar/avatar.tsx:165`                                  | `nx:rounded-[inherit]`                              |
| radius-border-arbitrary    | allowed-one-off      | `packages/react/src/components/ui/avatar/avatar.tsx:199`                                  | `nx:rounded-[inherit]`                              |
| typography-leading         | needs-decision       | `packages/react/src/components/ui/avatar/avatar.tsx:199`                                  | `nx:leading-none`                                   |
| typography-weight          | needs-decision       | `packages/react/src/components/ui/avatar/avatar.tsx:199`                                  | `nx:font-medium`                                    |
| focus-ring-utility         | needs-decision       | `packages/react/src/components/ui/avatar/avatar.tsx:209`                                  | status marker `ring-*`                              |
| spacing-arbitrary          | allowed-one-off      | `packages/react/src/components/ui/avatar/avatar.tsx:209`                                  | `right-[0.04em]`, `bottom-[0.04em]`, `size-[0.6em]` |
| focus-ring-utility         | needs-decision       | `packages/react/src/components/ui/avatar/avatar.tsx:335`                                  | AvatarGroup `ring-*`                                |
| fixed-height-control       | convention           | `packages/react/src/components/ui/badge/badge.tsx:145`                                    | `nx:h-6`                                            |
| spacing-arbitrary          | needs-decision       | `packages/react/src/components/ui/breadcrumb/breadcrumb.tsx:127,154`                      | `nx:max-w-[150px]`                                  |
| z-index                    | needs-decision       | `packages/react/src/components/ui/button-group/button-group.tsx:15`                       | `nx:*:focus-visible:z-10`                           |
| fixed-height-control       | convention           | `packages/react/src/components/ui/button-group/button-group.tsx:36-38`                    | `nx:h-8`, `nx:h-10`, `nx:h-12`                      |
| fixed-height-control       | convention           | `packages/react/src/components/ui/button/button.tsx:32-34`                                | `nx:h-8`, `nx:h-10`, `nx:h-12`                      |
| color-literal              | allowed-one-off      | `packages/react/src/components/ui/chart/chart.tsx:75`                                     | selector literals `#ccc`, `#fff`                    |
| typography-weight          | leak                 | `packages/react/src/components/ui/chart/chart.tsx:174,180`                                | `nx:font-medium`                                    |
| radius-border-arbitrary    | leak                 | `packages/react/src/components/ui/chart/chart.tsx:272`                                    | `nx:rounded-[2px]`                                  |
| radius-border-arbitrary    | leak                 | `packages/react/src/components/ui/chart/chart.tsx:276`                                    | `nx:border-[1.5px]`                                 |
| typography-leading         | leak                 | `packages/react/src/components/ui/chart/chart.tsx:327`                                    | `nx:leading-none`                                   |
| typography-weight          | needs-new-token      | `packages/react/src/components/ui/chart/chart.tsx:338`                                    | `nx:font-mono nx:font-medium`                       |
| radius-border-arbitrary    | leak                 | `packages/react/src/components/ui/chart/chart.tsx:393`                                    | `nx:rounded-[2px]`                                  |
| spacing-arbitrary          | needs-decision       | `packages/react/src/components/ui/command/command.tsx:184`                                | `nx:max-h-[300px]`                                  |
| fixed-height-control       | convention           | `packages/react/src/components/ui/date-picker/date-picker.tsx:211`                        | `nx:h-8`                                            |
| typography-leading         | leak                 | `packages/react/src/components/ui/date-picker/date-picker.tsx:339`                        | `nx:leading-none`                                   |
| z-index                    | needs-decision       | `packages/react/src/components/ui/date-picker/date-picker.tsx:343`                        | `nx:group-data-[focused=true]/day:z-10`             |
| typography-weight          | leak                 | `packages/react/src/components/ui/date-picker/date-picker.tsx:345`                        | `nx:data-[today=true]:font-medium`                  |
| z-index                    | needs-decision       | `packages/react/src/components/ui/date-picker/date-picker.tsx:361`                        | `nx:z-10`                                           |
| responsive-viewport-prefix | sanctioned-exception | `packages/react/src/components/ui/dialog/dialog.tsx:192,305`                              | overlay `lg:` / `sm:` classes                       |
| spacing-arbitrary          | needs-decision       | `packages/react/src/components/ui/drawer/drawer.tsx:101,102,111`                          | `max-h-[80svh]`, `w-[100px]`                        |
| responsive-viewport-prefix | needs-decision       | `packages/react/src/components/ui/drawer/drawer.tsx:129`                                  | `nx:md:text-left`                                   |
| typography-leading         | leak                 | `packages/react/src/components/ui/field/field.tsx:150`                                    | `nx:leading-snug`                                   |
| fixed-height-control       | convention           | `packages/react/src/components/ui/field/field.tsx:236`                                    | `nx:h-5`                                            |
| fixed-height-control       | convention           | `packages/react/src/components/ui/input-group/input-group.tsx:137,138`                    | `nx:h-6`, `nx:h-8`                                  |
| z-index                    | needs-decision       | `packages/react/src/components/ui/input-otp/input-otp.tsx:125`                            | `nx:data-[active=true]:z-10`                        |
| fixed-height-control       | convention           | `packages/react/src/components/ui/input-otp/input-otp.tsx:133`                            | `nx:h-4`                                            |
| fixed-height-control       | convention           | `packages/react/src/components/ui/input/input.tsx:20-22`                                  | `nx:h-10`, `nx:h-8`, `nx:h-12`                      |
| fixed-height-control       | convention           | `packages/react/src/components/ui/kbd/kbd.tsx:35`                                         | `nx:h-5`                                            |
| color-system               | allowed-one-off      | `packages/react/src/components/ui/native-select/native-select.tsx:97,115`                 | `nx:bg-[Canvas]`, `nx:text-[CanvasText]`            |
| z-index                    | needs-decision       | `packages/react/src/components/ui/navigation-menu/navigation-menu.tsx:294`                | `nx:z-1`                                            |
| spacing-arbitrary          | needs-decision       | `packages/react/src/components/ui/navigation-menu/navigation-menu.tsx:301`                | `nx:top-[60%]`                                      |
| responsive-viewport-prefix | needs-decision       | `packages/react/src/components/ui/overlay-layout/overlay-layout.ts:16,23,36`              | shared overlay `sm:` classes                        |
| fixed-height-control       | convention           | `packages/react/src/components/ui/progress/progress.tsx:42`                               | `nx:h-2`                                            |
| fixed-height-control       | convention           | `packages/react/src/components/ui/resizable/resizable.tsx:69`                             | handle hit-area `h-*`                               |
| z-index                    | needs-decision       | `packages/react/src/components/ui/resizable/resizable.tsx:76`                             | `nx:z-10`                                           |
| fixed-height-control       | convention           | `packages/react/src/components/ui/resizable/resizable.tsx:76`                             | `nx:h-4`                                            |
| fixed-height-control       | convention           | `packages/react/src/components/ui/scroll-area/scroll-area.tsx:37,99`                      | `nx:h-72`, `nx:h-2.5`                               |
| radius-border-arbitrary    | allowed-one-off      | `packages/react/src/components/ui/scroll-area/scroll-area.tsx:65`                         | `nx:rounded-[inherit]`                              |
| radius-border-arbitrary    | allowed-one-off      | `packages/react/src/components/ui/scroll-area/scroll-area.tsx:74`                         | `nx:forced-colors:border-[ButtonBorder]`            |
| fixed-height-control       | convention           | `packages/react/src/components/ui/separator/separator.tsx:33`                             | `nx:h-5`                                            |
| responsive-viewport-prefix | sanctioned-exception | `packages/react/src/components/ui/sheet/sheet.tsx:113,117,181`                            | Sheet `sm:` / `lg:` overlay classes                 |
| responsive-viewport-prefix | needs-decision       | `packages/react/src/components/ui/sidebar/sidebar.tsx:319,341,427,461,698,932,938`        | page-shell/sidebar `lg:` classes                    |
| spacing-arbitrary          | needs-decision       | `packages/react/src/components/ui/sidebar/sidebar.tsx:334,349`                            | `w-[calc(...)]`                                     |
| fixed-height-control       | convention           | `packages/react/src/components/ui/sidebar/sidebar.tsx:486,657,801-803,963,1009,1022,1125` | sidebar `h-*` geometry                              |
| fixed-height-control       | convention           | `packages/react/src/components/ui/skeleton/skeleton.tsx:22`                               | `nx:h-4`                                            |
| fixed-height-control       | convention           | `packages/react/src/components/ui/slider/slider.tsx:63`                                   | `nx:data-[orientation=horizontal]:h-1.5`            |
| fixed-height-control       | convention           | `packages/react/src/components/ui/switch/switch.tsx:23,24`                                | `nx:h-5`, `nx:h-[18px]`                             |
| spacing-arbitrary          | convention           | `packages/react/src/components/ui/switch/switch.tsx:24,44`                                | `w-[32px]`, `size-[14px]`, `translate-x-[14px]`     |
| typography-weight          | leak                 | `packages/react/src/components/ui/table/table.tsx:379`                                    | `nx:font-medium`                                    |

### Secondary Console Runtime

| Family                    | Bucket                           | Location                                                                               | Token / pattern                               |
| ------------------------- | -------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------- |
| typography-weight         | leak                             | `apps/console/src/app/auth-layout.tsx:20`                                              | `nx:font-bold`                                |
| typography-leading        | leak                             | `apps/console/src/app/auth-layout.tsx:27`                                              | `nx:leading-snug`                             |
| typography-tracking       | leak                             | `apps/console/src/app/not-found.tsx:13`                                                | `nx:tracking-wide`                            |
| color-literal             | allowed-one-off / needs-decision | `apps/console/src/hooks/useTheme.ts:4-17`                                              | 11 swatch hex values                          |
| spacing-arbitrary         | needs-decision                   | `apps/console/src/modules/analytics/analytics-charts.tsx:25`                           | `nx:h-[260px]`                                |
| typography-weight         | leak                             | `apps/console/src/modules/analytics/analytics-route.tsx:185`                           | `nx:font-medium`                              |
| typography-weight         | leak                             | `apps/console/src/modules/auth/verify-route.tsx:58`                                    | `nx:font-medium`                              |
| typography-weight         | leak                             | `apps/console/src/modules/billing/billing-route.tsx:242`                               | `nx:font-medium`                              |
| typography-weight         | leak                             | `apps/console/src/modules/billing/plan-sheet.tsx:123`                                  | `nx:font-medium`                              |
| spacing-arbitrary         | needs-decision                   | `apps/console/src/modules/coming-soon.tsx:26`                                          | `nx:min-h-[60svh]`                            |
| typography-weight         | leak                             | `apps/console/src/modules/crm/contact-card.tsx:17`                                     | `nx:font-medium`                              |
| typography-weight         | leak                             | `apps/console/src/modules/crm/contacts-board.tsx:157`                                  | `nx:font-medium`                              |
| typography-weight         | leak                             | `apps/console/src/modules/crm/contacts-columns.tsx:88`                                 | `nx:font-medium`                              |
| typography-weight         | leak                             | `apps/console/src/modules/design-system/ComponentShowcase.tsx:234,263,312,318,324,330` | `font-medium` / `font-semibold`               |
| typography-arbitrary-size | needs-decision                   | `apps/console/src/modules/design-system/IconShowcase.tsx:51`                           | `nx:text-[10px]`                              |
| typography-leading        | leak                             | `apps/console/src/modules/design-system/IconShowcase.tsx:51`                           | `nx:leading-tight`                            |
| typography-weight         | leak                             | `apps/console/src/modules/inbox/conversation-list.tsx:69`                              | `font-semibold` / `font-medium`               |
| spacing-arbitrary         | needs-decision                   | `apps/console/src/modules/inbox/conversation-thread.tsx:234`                           | `nx:max-w-[75%]`                              |
| spacing-arbitrary         | needs-decision                   | `apps/console/src/modules/inbox/inbox-route.tsx:57`                                    | `nx:h-[calc(100svh-3.5rem)]`                  |
| typography-weight         | leak                             | `apps/console/src/modules/people/member-card.tsx:17`                                   | `nx:font-medium`                              |
| typography-weight         | leak                             | `apps/console/src/modules/people/people-columns.tsx:94`                                | `nx:font-medium`                              |
| typography-weight         | leak                             | `apps/console/src/modules/projects/issue-card.tsx:22`                                  | `nx:font-medium`                              |
| typography-leading        | leak                             | `apps/console/src/modules/projects/issue-detail-route.tsx:110`                         | `nx:leading-relaxed`                          |
| typography-weight         | leak                             | `apps/console/src/modules/projects/issues-columns.tsx:97`                              | `nx:font-medium`                              |
| typography-weight         | leak                             | `apps/console/src/shell/app-sidebar.tsx:77,81,176`                                     | `font-bold` / `font-semibold` / `font-normal` |
| typography-weight         | leak                             | `apps/console/src/shell/notifications-menu.tsx:188`                                    | `nx:font-medium`                              |

## Non-Runtime Appendix

The scanner also saw these non-runtime candidates. They are intentionally excluded from source-leak counts:

| Kind                   | Candidate count | Treatment                                                                                            |
| ---------------------- | --------------: | ---------------------------------------------------------------------------------------------------- |
| `story`                |             258 | Story/demo sizing, literals, and assertions; useful for future story policy but not runtime leakage. |
| `docs-out-of-scope`    |             525 | Marketing/docs consumer; excluded by scope.                                                          |
| `token-output`         |           1,059 | Generated theme CSS and package token CSS; token values are expected here.                           |
| `token-source`         |             465 | DTCG token JSON; raw values are canonical source, not leaks.                                         |
| `token-infrastructure` |             108 | Scripts/tests manipulating token values; not class leakage.                                          |
| `guard-source`         |               8 | Existing lint rule/test strings.                                                                     |
| `other`                |               1 | Package metadata/non-runtime residue.                                                                |

## Plug Proposal

Ranked narrow plugs:

| Rank | Plug                                                                                                   | Why                                                                                                                   | Notes                                                                                                                              |
| ---: | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
|    1 | Add focused lint for typography non-size utilities: `font-*`, `leading-*`, `tracking-*`.               | This is the biggest primary runtime leak family and has no reset/lint protection.                                     | Derive allowlists from typography token/composite source or add a drift test. Avoid hardcoding a second live list without a guard. |
|    2 | Add z-index numeric lint with a local-stacking policy.                                                 | Six primary numeric hits exist.                                                                                       | Do not blindly force `z-10` to `z-overlay`; tokens are structural layers, while several hits are local overlap.                    |
|    3 | Add arbitrary radius/border lint for component runtime.                                                | Chart has real arbitrary radius/border leaks.                                                                         | Allowlist `rounded-[inherit]` and forced-colors system keywords such as `ButtonBorder`.                                            |
|    4 | Extend raw primitive color lint to `fill`, `stroke`, `ring`, `from`, `via`, `to`.                      | Current runtime is clean, but the seam remains open.                                                                  | Keep system-color and selector-literal exceptions out of this rule.                                                                |
|    5 | Add a documented exception list for arbitrary spacing/sizing.                                          | Arbitrary values are not inherently bad; several are relative geometry or calc values with no exact scale equivalent. | Enforce exact scale replacement only when an exact Nexus scale value exists.                                                       |
|    6 | Add a focus presence audit for known focusable controls.                                               | Existing rules require outline focus tokens, but no automated presence guard exists.                                  | Scope carefully around roving-focus overlay rows that intentionally use background tint instead of outline.                        |
|    7 | Add docs to `responsive.md` for Drawer, OverlayLayout, and Sidebar if accepted as viewport exceptions. | Current local source uses viewport prefixes beyond the explicit Dialog and future Sheet text.                         | This is documentation/policy closure, not a class migration.                                                                       |
|    8 | Consider a console-only cleanup issue.                                                                 | `apps/console` has 47 runtime candidates, mostly typography.                                                          | Keep separate from design-system package hard gates unless console is intended to be a strict consumer example.                    |

## Implementation Follow-Up

This branch now implements the rank-1 typography non-size plug:

- `@nexus/nx-class-conventions` now reports raw runtime `nx:font-*`, `nx:leading-*`, and `nx:tracking-*` utilities so typography weight, line-height, and letter-spacing stay owned by composites.
- The new guard is runtime-scoped: stories and `apps/docs` remain excluded from this hard gate.
- The guard includes drift checks for raw font-weight and letter-spacing names against `typography-vega.json`.
- Runtime call sites in `packages/react/src` and `apps/console/src` were migrated where an existing composite matched the intent.
- Two narrow runtime exceptions remain documented in tests: Avatar initials need diameter-coupled fallback typography, and Chart monospace numeric values need a future numeric typography token.

## Validation And Rerun Checklist

Completed in this pass:

- Verified baseline commit and clean initial diff against `main`.
- Read repo instructions, responsive/component rules, existing reset block, existing ESLint rule, spacing JSON guard, semantic color audit script, z-index tokens, typography composites, package browser floor, and issue #496.
- Ran Modern Web Guidance CSS lookup and applied the repo browser-floor override.
- Ran deterministic mechanical scans over primary, secondary, docs, stories, token source/output, and guard source, then classified runtime findings.
- Implemented the rank-1 typography non-size lint plug and migrated in-scope runtime typography leaks.
- Ran `pnpm vitest run packages/eslint-plugin-nexus/__tests__/nx-class-conventions.test.js --project unit`, `pnpm lint`, `pnpm format:check`, and `pnpm typecheck`.

Not run in this pass:

- App builds, reset-efficacy build grep, and per-app emission gates remain deferred because this pass did not implement reset-layer or app-emission plugs.

For remaining plugs, validation should include:

1. Re-run the Phase 1 family patterns and confirm report counts remain intentional.
2. Run `pnpm lint`, `pnpm typecheck`, and `pnpm format:check`.
3. Run affected unit/Storybook checks for touched components.
4. For reset changes, build generated CSS and grep for emitted defaults to prove the reset works at the CSS layer.
5. For app emission gates, build each in-scope app separately and grep that app's built CSS, because Tailwind emission is tree-shaken per app.
