# First-chapter component showcase

The existing grid, chapter headings, viewport track and dock geometry remain the build target. Five existing visible slots now contain interactive Nexus compositions; widening the screen does not add cards. All dock comparisons remain.

| Decision                                 | Source                                                   | Application                                                                                                                                         |
| ---------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product tasks rather than decorative UI  | shadcn homepage, https://ui.shadcn.com/                  | Project form, activity, access settings, conversations and preferences.                                                                             |
| Variety and direct interaction           | HeroUI homepage, https://heroui.com/                     | Six dock categories, inputs, tabs, switches, checkboxes, sliders and actions with local feedback.                                                   |
| Restrained surfaces and functional color | Refero shadcn style c14c0a94-1037-449e-bf5b-4cb972656ac7 | Nexus owns typography and component tokens. Accent appears in chart data; semantic badges express status. No decorative imagery or gradients added. |
| Existing composition is fixed            | User instruction                                         | Preserve grid columns, gaps, dock, bottom fade and chapter height. Cards scroll internally if their content exceeds the available slot.             |

## Components and blocks

The controls import Nexus Card anatomy, Avatar, Badge, Button, Checkbox, ChoiceCard, RadioGroup, Input, Label, NativeSelect, Progress, Separator, Slider, Switch, Table anatomy, Tabs and Textarea. Activity uses Nexus ChartContainer and ChartTooltipContent with the library-supported Recharts primitives and the Nexus categorical chart token. Blocks are local compositions, not prebuilt Nexus blocks. All data is sample data; forms change local state only.

Components: project form, activity chart, team access, conversation, preferences.
Dashboard: tasks, activity, workspace plan, team access, preferences.
Mail: searchable inbox, draft composer, team access, files, preferences.
Chat: conversation, team access, tasks, notes, files.
Finances: workspace plan, activity, invoice table, tasks, preferences.
CRM: contact form, pipeline, team access, tasks, notes.

## Chapter continuity

Customize and Ownership reuse the category selected in Explore. The current controls change theme, surface accent/tint, grid spacing, card corners, borders, shadows and treatment. Internal controls retain Nexus styling. Full token editing and component content/variant controls can build on these shared examples; this change does not pretend those complete editors already exist.

Coexistence remains the explicitly labeled layout comparison. A real comparison should render equivalent project, access and preference tasks with the actual MUI/Ant/shadcn components and add Nexus incrementally. Do not relabel a recolored Nexus board as a third-party implementation.

## Guidance

Search: responsive interactive component showcase forms cards within container grid.
Retrieved: `forms` via modern-web-guidance CLI. `container-queries` was not a valid guide ID; no guidance was inferred from that failure. A second search for size container queries returned `size-aware-styling`, which was retrieved successfully.
Use visible associated labels, native form validation, semantic controls and local submit feedback. The existing grid provides definite card dimensions, so `container-type: size` supports width and height queries for their contents. Narrow cards stack controls; short cards prioritize essential controls. No environment detection or preference queries were added. The existing Grid and Columns options retain their layout behavior.

## Validation

- Scoped ESLint passed for the two showcase components and chapter integration.
- All six dock categories rendered five cards in the default layout.
- Verified project creation feedback, Week/Month activity tabs, notification switch, message submission and task/progress updates in the browser.
- Verified the selected board appears in Customize and Ownership; the Radius control changed the actual card radius.
- Inspected light and dark themes at desktop size, and content at 390 × 844. No horizontal page or card overflow at the narrow size; taller card content scrolls within its slot.
- Existing sticky stage, dock and bottom fade were retained. Browser console checks reported no warnings or errors.
- Forms are local demos. No external invitations, mail or payments are performed. Not every example action received an exhaustive browser test.

## October 23: large-display layout and whole-page source audit

The original project card measured 1,354px high at 1698 × 1794 while its centered contents occupied 471px. The other cards had the same imbalance. The five-card grid and dock stay fixed. Cards with enough height now align content at the top; the chart and conversation expand into available height. Optional project fields, member rows and notification settings appear at card-height thresholds, so widening alone never adds widgets.

Guidance: searched modern-web-guidance for responsive card density and retrieved `fluid-scaling` and `size-aware-styling`. Decision: use the existing explicit-size card container, with minimum width 280px and height thresholds 440/600/750/1000/1250px. These thresholds belong to card contents, not particular monitor sizes. No preference, OS, input-device or feature-detection branches were added.

Nexus replacements: CardHeader/CardTitle/CardDescription, ChartContainer/ChartTooltipContent, ChoiceCard/RadioGroup, Separator, Table anatomy and chapter CTA Buttons replace bespoke equivalents. The preview aliases Recharts to the existing Nexus repository dependency; no package was installed.

`SourceAudit.jsx` contains a source-reviewed ownership map. Red outlines identify custom composition, custom styles around Nexus components, and directly used third-party UI. The map covers the header, chapters, showcase, dock/panels, diagrams, Stories and footer. DialKit panels outside the page root are included. Nexus-owned internal SVGs and hidden inputs are excluded; direct prototype icon imports carry an explicit attribute. Markings do not change accessible names, control behavior or layout. The temporary audit control itself is excluded. This is an inspection aid for the current prototype, not an automatic certification of future code.

The page is not entirely Nexus: custom dock surfaces/motion, page/grid layout, chat bubbles, diagrams, card style overrides, Tabler icon imports and DialKit remain and are visibly marked. A red container can contain genuine Nexus controls. The current comparison is still a labeled layout preview. The chart uses the Nexus categorical token rather than the prototype accent slider.

Verified in the running preview: 1698 × 1794, 1280 × 900, 1920 × 1200 and 390 × 844 CSS pixels; five cards and no horizontal page/card overflow. At the native large size the project card and all four smaller cards fit without vertical overflow. Inspected both themes, changed a ChoiceCard radio and Week/Month tabs, enabled/disabled the audit, and inspected live markings on the expanding dock panel, external DialKit panel, framework diagram, Stories and footer. A clean reload clears transient Vite dependency-reoptimization/HMR errors. Recharts still emits an initial negative-size measurement warning on mount before its ResizeObserver resolves the size; seven bars render after measurement. No library internals were modified to suppress that warning.

All changes remain local. Prior dock iterations are preserved.

Scoped ESLint passed for the showcase, audit overlay, chapter integration, entry point and Stories example. The Stories label now uses Nexus Label while preserving its intentional missing-label regression mode.
