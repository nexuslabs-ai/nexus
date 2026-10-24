# Framework chapter layout

Use the same 1 / 1.3 / 1 column proportions as the page canvas. Twelve token rows fill
the left column, Nexus core fills the middle column, and each framework logo
sits above its label on the right. All three columns share their top and bottom
edges. Do not cap the diagram height. Straight connectors span the existing column gaps.
Keep framework support details in the dock-selected note inside Nexus core. Below 700px container
width the same three columns use compact sizing. The token list remains twelve
rows. React, Vue, Svelte, Angular, and React Native use monochrome Tabler framework marks
in the diagram and dock, inheriting the surrounding foreground color.

Guidance: the offline modern-web-guidance search returned ENOTCACHED. Used
.agents/skills/modern-web-guidance/guides/css/css-layout.md as the documented
local fallback. Explicit CSS Grid tracks share the canvas proportions; a sized
container query adapts the diagram without querying input or OS preferences.

Verified in the running prototype at 1920 x 1200 and 390 x 844: aligned desktop
columns, stretched core, logo-above-label framework entries, mobile fit with no
horizontal overflow, no connector SVG, and no browser warning or error logs.
Scoped JSX ESLint and Prettier checks passed. Changes remain local.

Latest verification: all five SVGs loaded, twelve token rows rendered in one
column, and the React Native dock selection updated its card and note. Desktop
and 390px mobile previews had no horizontal overflow. Scoped ESLint passed.

Alignment refinement: centre each token icon-and-label pair. Use one shared
label size for tokens, core, framework names and supporting diagram copy
(16px desktop, 12px short containers, 10px narrow containers). Extend all three
columns to the canvas bottom beneath the dock, using the existing 200px/100px
canvas mask fade. Keep the support note inside the core instead of reserving
space below the diagram. Verified matching computed label sizes, full-height
canvas/dock overlap, and no horizontal overflow at 1920px and 390px widths.

Framework logos are monochrome outline marks in both the diagram and every
dock variant; preserve the five names, sizes, alignment, and behind-dock fade.

Connector refinement: twelve separate horizontal lines run from the centre of
each token row directly to the core edge. Five separate horizontal lines run
from the core edge to each framework card centre. No branches, merged paths or
curves. CSS pseudo-elements anchor each line to its own row; the line length
shares the column-gap variable, including the compact 8px layout.

Keep connector strokes subtle: 1px at 16 percent foreground opacity.

Surface refinement: remove borders from token rows, core, and framework cards.
Use the core surface fill (4 percent foreground mix) throughout; framework
selection uses an 8 percent mix. Token rows and core remain non-interactive.
All five framework cards are native buttons connected to the shared dock
selection, with hover and keyboard focus states. Vue/Svelte clicks and Angular
keyboard activation were verified to update both the card and dock state.
Computed borders are 0px and token/core base fills match.
