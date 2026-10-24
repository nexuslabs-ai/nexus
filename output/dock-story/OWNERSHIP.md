# Dock story ownership baseline — 23 October 2026

This is an implementation inventory, not an adoption score. An outlined container can hold genuine Nexus components. Red remains enabled across the page, including intentional application composition and external tooling.

Subsequent Dock batch: **Nexus Dock · new** now uses the reusable library Dock, DockItem, DockLabel and DockPanel. The older **Roomy · bare icons** implementation remains available. The baseline below describes the earlier migration; see [DOCK.md](./DOCK.md) for the new ownership boundary, preview source alias, plan review and verification. Compact controls are not part of the Dock batch.

## Source and comparison

- Live preview: http://127.0.0.1:4187/dock-story/
- Its Vite alias resolves `@nexus_ds/react` to `/Users/temp/.codex/worktrees/nexus-homepage/nexus/packages/react/src/index.ts`, revision `502069b45a516821d3528d3ea69b9eeb4ea527e7`. The migrated Field/Item/Message/Bubble sources had no local changes at capture.
- The maintained prototype is `output/dock-story` in the d12c checkout. Its component imports use the newer `@nxds/react` name. Preview synchronization translates that import name and the existing appearance hook name only; it does not switch the live library checkout.
- `ownership-baseline.json` records SHA-256 hashes of the live source before this migration and geometry files that must remain unchanged.
- Dock studio → Showcase: **Original · before migration** uses the preserved `original/ShowcaseCards.jsx` and `original/ShowcaseGrid.jsx`. **Nexus fields, rows & messages** uses the migrated files. Both use the same unchanged `showcase-grid.css`, dock and chapter layout. The selector also applies to Customize and Ownership, which reuse the showcase.
- Switching comparison versions remounts the showcase and resets its local demo form/message state.

## Ownership ledger

| Area / source                                                                        | Baseline                                                              | New version in this batch                                                                     | Remaining ownership                                                                    |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Project, composer, contact, note and invitation forms (`ShowcaseCards.jsx`)          | Nexus inputs with custom field wrappers, labels and fieldsets         | Nexus Field, FieldLabel, FieldSet, FieldLegend and FieldGroup                                 | Form submission/data and card packing are application-owned                            |
| Settings and choices (`ShowcaseCards.jsx`)                                           | Custom switch/checkbox row arrangements                               | Nexus FieldContent/FieldDescription and ChoiceRow anatomy; explicit labels and descriptions   | Local state and optional-section visibility remain application-owned                   |
| People/team rows (`ShowcaseCards.jsx`)                                               | Custom avatar/name/description/role row styles                        | Nexus Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions                   | Data, role choices and demo invitation feedback remain application-owned               |
| Inbox and file rows (`ShowcaseCards.jsx`)                                            | Nexus Button restyled into bespoke rows                               | Nexus Item anatomy; inbox uses its asChild button composition, files use Nexus Button actions | Search/selection/sample-file feedback and consumer icons remain application-owned      |
| Conversation (`ShowcaseCards.jsx`)                                                   | Custom bubbles, sender metadata and alignment                         | Nexus MessageGroup/Message/MessageAvatar/MessageContent/Header/Footer and Bubble/Content      | Message state, scroll viewport, height thresholds and composer remain page composition |
| Cards, charts, metrics (`showcase-grid.css`)                                         | Nexus Card/Chart with custom surface overrides and block presentation | Unchanged in this batch                                                                       | Mixed ownership; remains red where marked                                              |
| Header, headings, five-card grid, footer (`main.jsx`, `DockChapterJourney.jsx`, CSS) | Native semantics and Nexus controls/utilities composed into the page  | Unchanged                                                                                     | Supported application composition; not a missing Nexus component                       |
| Dock and panel (`StraightDock.jsx`, other preserved variants)                        | Custom surface and motion with native tool buttons                    | Unchanged                                                                                     | Explicit custom behavior; later semantic/composition investigation                     |
| Visitor controls (`DialKitToolControls.jsx`, `DockToolControls.jsx`)                 | External DialKit and custom controls changing prototype settings      | Unchanged                                                                                     | Migration candidate; real appearance-state wiring is a separate batch                  |
| Developer studio                                                                     | DialKit controls for comparing iterations                             | New Showcase comparison selector                                                              | Intentional external tooling                                                           |
| Coexistence                                                                          | Two labeled placeholder grids                                         | Unchanged                                                                                     | Layout preview, not real MUI/Ant/shadcn implementations                                |
| Framework chapters                                                                   | Custom diagrams and framework claims                                  | Unchanged                                                                                     | App diagram composition; claims require separate verification                          |
| Stories                                                                              | Nexus test subjects plus custom presentation / external controls      | Unchanged                                                                                     | Local checks retain their explicit distinction from CI                                 |
| Icons                                                                                | Consumer-imported Tabler and brand icons                              | Unchanged                                                                                     | Supported extension content; not a Nexus icon-library gap                              |

## Audit boundary

`SourceAudit.jsx` uses source-reviewed selectors. Custom controls are no longer exempt merely because an ancestor has a `data-slot`. Hidden Radix form bridges are excluded explicitly. Custom/consumer SVGs are identified by their source-owned selectors or explicit icon markers; internal library SVGs are not inferred to be custom. Audit annotations are cleared and reapplied when the rendered version changes.

Categories remain visible: replaceable UI, mixed styling overrides, application composition, custom presentation, external controls and consumer icons. The inventory is finite and source-reviewed; arbitrary future code and arbitrary `data-slot` attributes are not automatically certified. Red count changes are not a percentage of Nexus adoption.

## Guidance and validation contract

Reuse the already retrieved modern-web-guidance `accessibility` and `spatial-navigation` guidance: explicit label/description associations, native form behavior, log semantics and keyboard-operable actions. Existing `size-aware-styling` guidance applies to the unchanged card-size thresholds. No new environment queries, new layout system or dock interactions are introduced.

Validate both comparison choices, all six showcase views, local project/invitation/message/contact/note actions, keyboard choices, both themes, narrow and large viewports, and unchanged grid/dock bounds. Nexus library internals are not modified. App changes receive scoped lint and browser verification rather than a new application test suite.

## Verified result

- Scoped ESLint passes for the migrated cards, both grid versions, chapter integration and audit overlay.
- A production Vite build using the live dock-story entry succeeds, with output isolated under `/tmp/nexus-dock-adoption-build`. The existing combined prototype bundle exceeds Vite's 500 kB advisory threshold; no bundle threshold was changed.
- Original and Nexus choices both render and are switchable in Dock studio. At 1698 × 1794 both measured the same grid (x=32, y=434.71875, width=1619, height=1359.28125) and dock (x=521.5, y=1702, width=640, height=72).
- SHA-256 checks confirm the preserved grid CSS, dock component/CSS, chapter layout CSS and page CSS are unchanged. The original snapshot matches its captured hashes.
- All six category views render five cards without horizontal card overflow at the inspected desktop sizes. Inspected light/dark themes at 1698 × 1794 and 390 × 844, with additional category checks at 1280 × 900. Temporary viewport overrides were reset.
- Project submission, local invitation feedback, privacy choice via Space, team role selection, message sending, inbox row selection, file selection and draft saving were exercised successfully. These actions remain local demo interactions. Contact/note forms render Nexus fields; their submit behavior was not separately exercised in this pass.
- Narrow-card team actions move below the person row, and optional details/avatars hide only within the existing narrow card-size context. This is application composition; the outer grid and dock do not change.
- Existing Recharts initial negative-size measurement warnings remain during chart mounting. No new runtime error was observed in the tested interactions. This is not an exhaustive accessibility or full-repository test run.
