# Customize: live component gallery

The Customize chapter offers live Nexus components and small blocks. Dock studio → Customize canvas now defaults to **Components & blocks · new**, with **Labeled board · previous**, **Component gallery · previous** and **Blocks · previous** preserved. The existing Customize control-style choices remain independent.

## Components and blocks refinement

The user requested no headings that identify component categories. The latest `ComponentBoard.jsx` removes those headings and the category separators, retaining only the content inside examples and accessible control labels. `LabeledComponentBoard.jsx` preserves the previous board exactly for comparison.

The mixed grid includes standalone buttons, badges, alerts, progress, tabs and selection controls alongside two Nexus Card compositions: a workspace creation form and a workspace invitation. Workspace creation uses browser required-field validation and local state only; its confirmation names the workspace, and editing the name resets that confirmation. The dock and shared appearance channel are unchanged.

This refinement reuses the documented reference lock, grid mechanics and modern-web guidance below. It adds no new layout mechanism. Verified in the 4187 preview: category headings are absent, the two remaining content headings are Create a workspace and Room for your next idea, and form submission shows a local confirmation. Screenshot: `components-and-blocks-preview.jpg`. Scoped ESLint and formatting checks pass.

## Component board comparison

`ComponentBoard.jsx` and `component-board.css` add an alternative arrangement. Three independent columns pair Buttons with Feedback, Fields with Selection, and Cards with Overlays. Nexus Separators give each stack a quiet division. Examples keep their natural height and the same appearance provider; no component-specific styling overrides or new library components were introduced.

Reference lock: Nexus owns type, surfaces, state colors and control geometry. Refero's shadcn style (`c14c0a94-1037-449e-bf5b-4cb972656ac7`, https://ui.shadcn.com) contributes the compact component collection; Linear's changelog style (`11d3e58a-87d7-4a9a-bbf5-720f4fd3ffc6`, https://linear.app/changelog) contributes restrained grouping and thin separation. No reference colors, fonts or radius values were copied. The user's request to improve arrangement drives the independent stacks and removal of numbered headings and repetitive helper copy.

Modern Web Guidance: the CLI search `responsive component showcase grid compact layout container queries` succeeded; retrieved `responsive-design` and `size-aware-styling`, and consulted bundled `guides/css/css-layout.md`. The board uses intrinsic heights, explicit grid tracks and container thresholds at 44rem and 64rem. Columns follow DOM order, with no dense auto-placement or visual reordering. Repository policy excludes the guide's feature-detection fallbacks. Width is capped at 78rem, with dock clearance supplied by bottom padding.

Verification on port 4187:

- At 1440px, three 368px columns within a 1248px board show all six group headings; screenshot `component-board-preview.jpg`.
- At 390px, one 310px content column fits within the 358px canvas with no horizontal overflow. Width never adds examples. Viewport override reset afterward.
- Violet appearance changes update the live Button while its Saved state and typed workspace value persist. Appearance and example values restored afterward.
- Switched to Component gallery · previous and verified it renders; returned to Component board · new for delivery. Original gallery source and styling are unchanged.
- Scoped ESLint and Prettier pass. Vite production build passes using `--configLoader native` in the temporary copy; existing combined-prototype chunk-size warning remains. The initial temp copy needed refreshing with the main session's new `WorkspaceThemeStudy` dependency before this build.

The existing dock, chapter header and other chapters are unchanged by this iteration. Short viewports scroll within the component canvas rather than shrinking component controls.

## Scope

- Only the Customize canvas changes. The Explore chapter and every dock implementation are unchanged.
- `ComponentGallery.jsx` composes Nexus Button, Input, Textarea, NativeSelect, Field, Checkbox, Switch, RadioGroup, Tabs, Slider, Badge, Alert, Progress, Avatar, Item, Card, Popover and Separator.
- `AppearancePreview.jsx` keeps the existing source/origin-checked appearance message channel. `appearance-preview.jsx` renders the gallery inside the same document-level appearance provider as the old blocks. The gallery is not keyed on appearance or selected dock tool, so changes should retain typed input, selected tabs and local component state.
- The page still owns layout, gallery labels and example state. The source audit describes these as composition. Component surfaces, borders, colors, states and shape come from Nexus. Three consumer-supplied Tabler icons follow the library's existing icon convention; this is not a claim that the page layout or every icon is a Nexus component.
- Brand and semantic colors retain their distinct roles. Changing the brand does not recolor success or warning statuses into the brand color.

## Layout and reference decision

The approved direction is natural-sized component examples, grouped by actions, inputs, selection, feedback, content and overlays. Nexus remains the visual authority. The shadcn reference (Refero style `c14c0a94-1037-449e-bf5b-4cb972656ac7`, https://ui.shadcn.com) contributes compact, directly interactive specimens and quiet grouping; none of its color or radius values are copied. The user's supplied HeroUI showcase is the secondary reference for component variety.

The gallery uses a content-height grid with a maximum width of 84rem. Container thresholds at 40rem and 64rem give two and three columns; narrower space uses one column. More screen width never adds examples. The gallery can scroll inside the existing fixed chapter canvas, with bottom space for the unchanged dock and fade. No component is stretched to the viewport height.

## Modern Web Guidance

- Query attempted: `responsive component gallery CSS grid container queries`. The offline CLI returned `ENOTCACHED`; this was not a successful online lookup.
- Bundled source: `.agents/skills/modern-web-guidance/guides/css/css-layout.md`, particularly Grid, Container queries, and intrinsic layout guidance.
- Decisions: explicit tracks, content-height rows, wrapped actions, container-driven layout, DOM-order keyboard traversal, and Nexus Popover for floating content. No environment or feature-detection branches were added.
- Static verification: production Vite build of the independent preview passed; scoped ESLint and Prettier passed. The build reports the existing large-chunk warning for the combined prototype.

## Preview status

Following the user's explicit request to use port 4187, the six gallery-related files were synchronized to the existing live preview. Its listener and server configuration were preserved. Original live files were backed up to `/tmp/nexus-gallery-4187-baseline`; source imports were translated to the existing preview's legacy package aliases. No server was started on port 4191.

Verified on `http://127.0.0.1:4187/dock-story/#top`:

- Green brand changes update the gallery and shared dock appearance while typed workspace text and the selected Build tab persist.
- Square corners change the input's computed radius from 8px to 0px without losing its value.
- Sharing settings opens the Nexus Popover; Escape closes it and returns focus to its trigger.
- DialKit → Dock studio → Customize Canvas renders both Blocks · previous and Component gallery · new. The gallery is selected for delivery.
- At 390px, the gallery has one 318px content column with no horizontal overflow. At 1920px, its grid is capped at 1344px with three columns and the same six groups. The 1280px desktop view was visually reviewed; the viewport override was reset afterward.
- Default appearance was restored after checks. Screenshot: `component-gallery-preview.jpg`.

Density and typography remain connected through the unchanged provider channel but were not separately exercised in this pass. The default disabled Button has a very dark appearance in this preview's existing Nexus build; no component styling override was added to conceal that upstream behavior.

The independent build copy remains at `/tmp/nexus-component-gallery-preview` for the production-build evidence above.
