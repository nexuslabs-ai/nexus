# Homepage draft

The homepage composes the existing hero, six intentionally empty preview blocks,
frameworks, coexistence, Storybook testing, source ownership, appearance settings,
closing actions, and footer. It inherits NxdsAppearanceProvider.

Frameworks studio provides independently persisted layout and sizing controls via
the existing DialRoot. See FRAMEWORKS.md for reference and validation details.

The rotating hero synchronizes benefit copy with matching tiles, uses real ecosystem
marks, and sizes labeled tiles to their contents. Other hero iterations remain available.

Validation: prototype production build, scoped lint, browser verification of tile
widths and Frameworks studio layout/reset. Full docs validation is recorded in the PR.

Existing app studio preserves the three-library code example and adds three visual
iterations: Add one component, Side-by-side controls, and Annotated app. Visual
iterations offer MUI, Ant Design, and shadcn/ui selectors alongside Nexus. MUI
and Ant Design use their packages. The shadcn demo adapts the default button/input
from examples/shadcn-app/components/ui into scoped CSS, without a global reset. The demo inherits appearance state and scopes derived Nexus color tokens
to its addition, because another appearance provider would update document styles.

Guidance: MDN CSS container queries and MUI's interoperability documentation informed
the 40rem container breakpoint and separate component styling. Browser checks verified
that add/remove preserves the existing input, origin labels toggle, and changing the
Nexus accent leaves the MUI button color unchanged. Scoped lint and the standalone
preview production build pass.

Library selector verification: switching libraries preserves the controlled input,
and Ant Design and shadcn save actions display their respective status. Modern Web
Guidance CLI was unavailable offline (ENOTCACHED); consulted bundled
`.agents/skills/modern-web-guidance/guides/css/design-token-reactivity.md` and
https://ant.design/components/config-provider/ instead. Host color variables remain
local and independent of the derived Nexus accent. No environment queries added.

Visual integration snippets reuse the docs `CodeBlock` and copy announcer. Syntax
is generated with Shiki GitHub Dark by
`node apps/docs/scripts/generate-coexistence-code.mjs`; rerun after editing
`coexistence-samples.mjs` or the theme. This example uses a fixed 14px editor
font, a numbered gutter, and full-row addition highlights on the GitHub Dark
surface; the styling is scoped to this example. Only the Nexus import and added button are
highlighted. Plus markers are CSS-generated so copying returns clean source.
The selector, live visual, and code share one bordered card. One-time setup is
omitted. Verified library switching, connected layout, and copy confirmation in
the preview. The concise example omits the optional per-demo accent derivation.

All Existing app studio iterations now use the same integration code component,
including the original Code · three libraries option. The obsolete plain-code
renderer and its styles were removed.

Guided integration replaces the code-only view with the shared live example.
Every visual iteration defaults to With Nexus and provides Without Nexus / With
Nexus controls. The preview and complete action component snippet share the same
state. At a 48rem container width, code sits on the left and one unified settings
UI sits on the right; narrower containers stack them in that order. The Nexus
action joins the existing actions without a separate panel or explanation column.
Browser verification confirmed that the existing Save button retains its position
and background color when Nexus is toggled.
Browser verification confirmed that removing Nexus removes both its action and
import/JSX, and restoring it updates both. Library selection stays synchronized.

The library selector now sits above the connected card. Nexus is always included;
the With/Without Nexus controls and component-origin labels have been removed.
The side iteration retains its separate accent comparison controls.

The shared example is now an invite form, with host email/role controls and a
Nexus submit action. Removed the redundant demo heading. Component and Appearance
views share generated Shiki snippets; the Appearance object is generated from
`invitationAppearance`, the same function used on the live button. Per-library
button styles are scoped; no global provider or host theme is changed. shadcn
uses the existing adapted input and a styled native role select.
Guidance reused: bundled `guides/css/design-token-reactivity.md`, scoped custom
properties without environment branching. Browser checks covered all three
library selections, the appearance view, local submission, and MUI computed
button color/height. The code pane scrolls to keep the comparison compact.

Provider-backed update: the invite form now runs in `coexistence-preview/`, an
independent iframe document with its own `NxdsAppearanceProvider`. Removed the
button-level appearance overrides and adapted shadcn stand-ins. MUI and Ant Design
are published components; shadcn Input and Radix Select are copied from the
repository's shadcn example. Component/Appearance snippets show this implementation.
See `apps/docs/coexistence-preview/README.md` for generation and source details.
Verified the iframe emits provider styles, the button has no inline style, library
switching leaves the parent's theme CSS unchanged, and local form actions work.

### Three adoption paths

App studio defaults to `adoption-slider`; `adoption` retains the side-by-side
layout and earlier iterations remain selectable. The
HeroUI row renders real @heroui/react 3.2.6 Card, Avatar, Chip, ProgressBar,
and Button components with @heroui/styles 3.2.6. Both sides share one React
tree; only the added default shadcn or Nexus stylesheet changes. Application
CSS handles layout, not component colors. `?integration=baseline` loads the
unchanged HeroUI screen for computed-style comparisons. The native-content row uses
the existing MUI/Ant comparison runtime. The adoption row uses real copied
shadcn controls and Nexus buttons inside a local NxdsAppearanceProvider.

Layout guidance: modern-web-guidance `css-layout`, retrieved 2026-10-19.
Use a container query to stack comparison panels below 48rem; retain native
details/summary disclosure and iframe titles. Check desktop and 390px layouts.

The richer adoption preview compares Alert defaults using the official shadcn
new-york-v4 registry source (retrieved 2026-10-19): default and destructive,
versus Nexus default/destructive/success/information/warning. Both sides use
identical messages; no per-alert color overrides. HeroUI uses its published React components and styles with custom application
layout. The
billing row uses the existing real MUI/Ant controls plus native heading/list
content. Do not describe these as wholesale host-library failures.

Real HeroUI verification (2026-10-20): compare `hero.html` with integration
baseline/shadcn/nexus, pointer outside controls. Nexus matches baseline for
Button foreground/background/radius, Card.Description color, ProgressBar fill,
Chip color/background/radius, and Avatar color/background/radius. Default shadcn
globals change the primary background and progress fill to oklch(0.97 0 0),
Card.Description to that same pale color, and Button/Avatar radius from 24px to
30px (Chip 16px to 20px). Both invitation actions work. No page errors or
horizontal overflow at 540px and 340px iframe widths. This is a default global
stylesheet integration test, not a claim that scoped shadcn themes must fail.

### Comparison slider iteration

`adoption-slider` overlays the same two live iframe documents at equal widths,
with clip-path revealing the left layer. Labels name the integrations explicitly;
these are comparative views, not a chronological before/after. Preview layers
are inert in slider mode so embedded controls cannot intercept dragging or tab
focus. Side-by-side mode keeps the live component interactions.

Guidance: modern-web-guidance search “accessible range input comparison slider
clip path overlay”, retrieved `slider` on 2026-10-20. Use a labelled native range
input, explicit min/max/step, descriptive aria-valuetext, and visible focus
outline. React supplies the percentage custom property rather than the guide's
newer CSS attr()/progress() pattern, following Nexus browser policy.

Verified three sliders, pointer drag to 30%, Home/End to 0/100, arrow-key steps,
MUI/Ant switching, 390px overflow, and restoration of all three side-by-side
pairs. No Chromium page errors. Equal iframe dimensions prevent sliding from
changing the content layout.

Comparison preview theme follows `useNxdsAppearance().resolvedMode` through
iframe URLs in both comparison layouts. HeroUI/shadcn receive the explicit dark
class; the Nexus alert provider receives the same mode. Billing shell colors
use the existing shadcn host tokens instead of fixed light colors. Theme changes
reload isolated previews (resetting their demo-local interaction state), while
parent slider positions and selected MUI/Ant library remain intact. Verified
all six frame URLs, dark classes, and body backgrounds in dark and light modes;
390px layout has no horizontal overflow and Chromium reports no page errors.

The adoption comparisons are standalone named sections with h2 headings.
Their shared App studio controller preserves the comparison iterations.

### Token flow visualization

The shared/connected foundation views use the hero's token icons and shared contrast-balanced
palette in both themes. Three chip groups converge into Nexus core; five labeled
framework branches follow below. The existing framework playground remains
available in DialKit.

Guidance: Modern Web Guidance `motion` (retrieved 2026-10-21). The diagram uses
small SVG dash pulses to communicate direction, with an explicit pause control;
Nexus's explicit `reduceMotion` preference stops them without environment queries.
Container styling adjusts chip and framework sizes while preserving the same flow.
Verified in the local homepage preview at 1280px and 390px, with no horizontal
overflow, and with the pause interaction. Light and dark themes were inspected.

DialKit's `Horizontal pipeline` comparison keeps the same chips, core, palette,
frameworks, and pause control. At a framework container width of 56rem or more,
it presents a left-to-right pipeline; narrower containers keep the vertical flow.
Reuses the motion guidance above. Verified the pipeline and restoration of Shared
foundation through DialKit's runtime store at 1280px, plus 390px reflow without
horizontal overflow. Concentric boundaries is the default; Shared foundation remains available for comparison.

`Individual connections` adds twelve separate chip-to-core paths, routed down
reserved gutters beside each chip column. Fixed row tracks keep the SVG endpoints
aligned with chip centers at both container sizes. It preserves the full-width
core and existing framework fan-out. Reuses the motion guidance and pause behavior
above; checked all twelve paths, pause, and chip fit at 1095px and 390px.

`Interactive flow` builds on Individual connections. Native chip buttons select
one input path; its palette carries through the core and all five output paths.
Pressed state and a polite core caption expose the selection without relying on
color alone. The other comparison layouts remain static chips. Reuses the motion
guidance above; verified pointer selection, Enter activation, exactly one selected
input path, and 390px reflow. Explicit reduced motion and Pause flow retain static
selection feedback.

`Concentric boundaries` places the framework logos immediately below the section
copy, above a Nexus core boundary enclosing a separate design-token boundary.
Curved pulse lines travel upward from core to frameworks. Rounded nested panels
keep twelve labels legible without a circular layout. The explicit reduced-motion preference stops the pulses; this iteration has no
visible pause control. Outer and inner radii are 16px and 11px at the default
root size across breakpoints, and its caption is 14px. Verified twelve chips and no overflow at 1095px and 390px.
