# Core chip comparison

DialKit: Dock studio > Framework Diagram > Core chip · new. Keep Token flow
and Shared foundation available; this option is independent of the dock style.

## Reference and decisions

Primary reference: the user's two-lane chip sketch and the approved existing
dock-story surfaces. Retain the previously researched restrained Linear/shadcn
type hierarchy documented in foundation-iteration-notes.md. This is a code-native
diagram, with no generated imagery or new design-system tokens.

The middle column itself is Nexus core. No core icon and no extra enclosing
core card inside it. Its width is 2fr, with 0.8fr on either side: about 56 percent
of the available column width. Three equal columns and two input-aligned rows place the
four processing modules, with Shared theme spanning both rows. The top
three input rows feed Theme engine > Semantic colors. The remaining nine feed
Tokens & presets > Token values. Both enter the full-height Shared theme module.
The core padding and every internal gap share the external column-gutter value:
16px on desktop and 8px in the narrow layout. The tokens now share an outer
container with the same padding and row groups as the core. All twelve token
boxes have equal height. Three theme inputs occupy the smaller upper group;
nine token/preset inputs occupy the larger lower group. The shared row formula
accounts for the differing number of internal gaps, rather than simply using
a 1:3 ratio that would leave the token heights unequal.
This aligns each token centre with its destination without routing bends.
Each straight line spans the token-container padding, outer gutter and core
padding, terminating at the module edge. No turns, diagonals or shared input bus.
Five straight outputs remain aligned with the frameworks.
The five framework marks remain monochrome and clickable;
planned bindings are explicitly labelled. Surfaces and traces fade behind the dock.

## Layout guidance

The offline modern-web-guidance search for "CSS grid architecture diagram aligned
rows subgrid nested tracks" failed with ENOTCACHED. The follow-up search for
"CSS grid equal rows gap padding orthogonal diagram connectors" also failed with
ENOTCACHED. The latest search for "CSS grid aligned two equal rows nested token
groups horizontal connectors" returned the same ENOTCACHED failure. Read the bundled fallback
.agents/skills/modern-web-guidance/guides/css/css-layout.md, sections 3 and 4.
Use matching explicit rows for both outer containers, with their heights derived
from the 3/9 input counts and gaps. A single horizontal pseudo
element connects each token directly to its module without resize observers,
viewport JavaScript, auto-fill, or additional widgets. Component adaptations use the existing framework size
container, with no environment queries or feature-detection branches.

Below a 700px container width, columns use 1.05 / 2 / 0.85 proportions to fit
framework status badges; token labels can wrap inside their padded container. Internal
padding/gaps match the external 8px gutter. All column labels remain visible,
including Nexus core. Below 640px container height on wider screens, labels use
the existing compact 12px scale and the bottom fade shortens to 100px.

## Verified

- Inspected at normal preview size, 1920x1200, and 390x844; no horizontal overflow.
- Twelve inputs, five frameworks, and no SVG/icon inside the core.
- Light and dark themes inspected; labels remain within their modules.
- Vue click and keyboard activation of Svelte update the framework and dock.
- Switched to the previous Token flow and back to Core chip successfully.
- Scoped JSX ESLint and Prettier checks pass; no browser warnings or errors.
- Previous grid revision: equal rows/columns and matching spacing verified at
  1920x1200 and 390x844. Its orthogonal connectors were replaced by the aligned
  token-container approach above at the user's request.
- Equal-token revision: all twelve heights match within 0.01px of browser
  rounding at 1280x720, 1920x1200 and 390x844. The upper core row aligns with
  the first three inputs; the lower row aligns with the remaining nine. All
  twelve horizontal traces terminate exactly at the destination's left edge
  on the narrow layout. Labels fit, with no horizontal page overflow or console
  warnings/errors. Checked dark desktop and light mobile compositions.
- Latest visual evidence: core-chip-equal-tokens-preview.png.
- Framework statuses now use neutral filled badges with inherited label sizes.
  Checked desktop and 390px light/dark layouts, including the two-line Growing
  library badge; all badges fit within the diagram boundary. Existing status
  wording was preserved in that revision. Evidence:
  framework-status-badges-preview.png.

## Connected flow interaction

At the user's direction, the Svelte, Angular and React Native badges now read
Q1 ’27. Their accessible status remains "Planned for Q1 2027". Those marks,
names and badges render at 72 percent opacity, returning to 90 percent on hover
or visible focus. The framework cards remain selectable.

Hover a token to trace that input through its two core modules and Shared theme
to all five framework outputs. Hover either theme module to trace three inputs;
either preset module traces nine. Shared theme traces both branches. A framework
traces both branches to only that destination. Keyboard focus highlights the same
paths without pulses. A single precedence rule makes visible keyboard focus
supersede a stationary pointer. Pointer motion can take over again on entry.

Use a fixed, clipped line with a child pulse animated only with transform and
opacity. Stagger the input, two core steps, and output by 0/220/440/660ms inside
a 2200ms explanatory cycle. Cards do not move; line geometry is still derived
from the existing gutters. The explicit data-reduce-motion preference disables
the pulse while retaining static connection emphasis. No environment queries,
resize observer, animation library or per-frame React updates were introduced.

Guidance search: "Animate directional connector lines on hover and keyboard
focus without layout shifts" failed offline with ENOTCACHED. Read bundled
guides/ui-behaviors/dynamic-sibling-animations.md and
guides/performance/interactions-in-complex-layouts.md under the existing
modern-web-guidance skill, plus /Users/temp/.agents/skills/emil-design-eng/SKILL.md.
Apply the staged explanatory-motion principle with explicit delays; nxds policy
excludes the guides' sibling-index, feature-detection and preference-query
suggestions. Retain ordinary CSS animations and the existing explicit preference.
No containment is added because connectors intentionally cross columns.

Verified pointer activation in the preview: Radius activates 1 input / 2 core
connections / 5 outputs; Tokens & presets 9/2/5; Shared theme 12/4/5;
Vue 12/4/1; Semantic colors 3/2/5. Tab from Semantic colors changes the source
to Tokens & presets and disables pulses, with the expected branch highlighted.
Idle state has zero active traces. CSS inspection confirms the 0/220/440/660ms
phase delays and changing transforms during pointer activation. All five badges
fit at 390px, all twelve token heights remain equal, and the page has no horizontal
overflow. Light mobile and dark desktop were visually checked. Scoped ESLint and
Prettier pass; the browser reports no warnings/errors. Evidence:
framework-flow-preview.png. The existing explicit reduce-motion CSS override was
inspected; its preference control was not changed during this verification.
