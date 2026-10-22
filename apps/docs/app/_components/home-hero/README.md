# Homepage hero

Integrated from the local homepage exploration into the docs homepage.

- `/`: locked compact layout
- `/?iteration=workbench`: five + four tile grid
- `/?iteration=wheel`: original small 3D wheel
- `/?iteration=compact&tune=1`: browser-local DialKit studio with all three versions

The rejected live specimen cards are excluded. Studio changes remain browser-local; defaults and component source are versioned here. The existing docs appearance provider controls light/dark mode.

Source guidance: modern-web-guidance `drag` guide (previously retrieved for this exploration). Pointer capture and a movement threshold distinguish dragging from clicking; keyboard arrows, Home, and End provide wheel navigation. No environment-dependent variants are introduced.

Page flow: the final tool's `animationend` reveals following content; replay remounts the sequence. Guidance: `.agents/skills/modern-web-guidance/guides/ui-behaviors/dynamic-sibling-animations.md`. The six-card prototype gallery uses fixed 60ms sibling delays rather than newly available `sibling-index()` or environment queries, following Nexus browser policy. Verified the initial hidden state and final revealed grid in the browser; typecheck and scoped lint pass.

### Headline with tiles

`?iteration=headline` preserves compact as a separate comparison. Hero studio's
Layout selector also includes Headline with tiles. All three phrases use the
same title treatment; the accessible h1 contains the complete sentence sequence.
Tile and tool animations are shared with the compact version.

Guidance: modern-web-guidance search `responsive typography heading layout`,
retrieved `improve-text-layout-and-legibility` and `typography`. Use balanced
short phrases, unitless line height, and clamped container-relative type from
1.75rem to 3rem (or the studio Title Size). Container units follow the repository's
responsive rule; no environment queries are introduced. Verified the desktop
composition in the running prototype and checked lint and TypeScript.

### Inline stacks

`?iteration=stacks` and the Inline stacks studio preset place category/tool decks
beside the headline. Native buttons advance each deck; hover or focus pauses the
single automatic tour, and manual activation takes over. Three visible faces
keep the full nine-category collection compact without moving the text.

Reused typography guidance (`typography`, `improve-text-layout-and-legibility`)
and the bundled `ui-behaviors/dynamic-sibling-animations.md` guide. Motion uses
transform/opacity with fixed deck dimensions; Nexus policy excludes environment
queries. Checked the desktop preview, accessible button labels, lint and Vite build.

### Studio iteration navigation

The studio now uses one native Iteration selector above DialKit's exported
ControlRenderer. It loads the existing saved settings and repairs the internal
layout identity for that named iteration. Compact row is the former Version 1;
Workbench grid maps to Workbench — original. Headline with tiles is one layout.
The duplicate native preset/layout menus are no longer displayed. Existing
browser data is retained. The selector updates the URL when switching.

Validation: preview and accessible selector inspected; Vite build passed.
The full ESLint invocation hit a minimatch dependency crash in
jsx-a11y/label-has-associated-control; other rules passed with only that rule
excluded for the verification command. The native select has an explicit label
and matching htmlFor/id, verified in the browser accessibility tree.

### Title + CTAs

`?iteration=cta` adds a separate title/actions header, then the existing compact
customization/tool section below a divider. The new studio preset preserves all
older iterations. Browse Components targets `/components`; Playground targets
`/create` in docs (the standalone prototype uses its `/playground.html`).
Existing balanced-heading guidance is reused; buttons wrap intrinsically and
use Nexus Button. Verified desktop composition/accessibility and docs production
build. Separate lint passes with the previously documented crashing rule excluded.

### Feature strip (A)

`?iteration=strip&tune=1` selects **Feature strip** in the existing native Hero studio.
The centered title/CTAs lead into side-by-side customization and compatibility groups.
Labels remain visible; tiles retain the existing palette and gently cycle their emphasis.
Forms, preferences, and buttons below use real Nexus components. The form is a local demo.
Previous iteration components are unchanged.

Responsive guidance: queried `responsive two column feature strip container queries`
with modern-web-guidance and retrieved `responsive-design`. The strip uses a named
inline-size container: groups stack below 68rem; examples become three columns at
48rem. Tile rows wrap on narrow containers. No environment queries or feature detection.
Reference lock: approved concept A, existing Nexus type/palette and controls, thin
separators, no drop shadows; shadcn-inspired direct component examples.

### Tilted tiles

`?iteration=tilted&tune=1` selects **Tilted tiles**. This composes the existing
HeadlineJourney with scoped CSS: alternating -6/5/-3 degree angles and 12px
of overlap at the default gap. Active/focused tiles straighten and rise above
neighbours. Both tile and tool gaps remain tunable (20px yields no overlap).
The original tour, keyboard focus, label expansion, replay and gallery entrance
are inherited unchanged. No drop shadows were added.

Guidance: searched `animate rotate transform overlapping cards hover`, retrieved
`individual-transform-properties`. Independent `rotate` preserves the original
`translate` entrance animation; persistent rotation establishes stacking contexts.
Verified desktop appearance and keyboard label expansion. Below a 40rem container,
tiles wrap so expanded labels remain visible; desktop keeps a single overlapping row.

### Foil material study

`?iteration=foil&tune=1` isolates a 72px square and 180×72px Theme sticker.
The original WebGL fragment material explores angle-dependent hue, a broad
reflection and procedural foil grains, inspired by
https://www.4rknova.com/blog/2025/08/30/foil-sticker.
It does not copy the reference shader or artwork. Labels remain real DOM/SVG.
This first study uses rigid tilt; deformable peel geometry is not implemented.

Guidance: the CLI search for pointer-driven canvas animation failed with npm
ENOTFOUND. Read bundled `css/individual-transform-properties.md` and
`visual-design/expose-canvas-content-to-browser-features.md`, plus MDN's WebGL
2D-content tutorial and requestAnimationFrame reference. Used a stable transform
context, timestamp-based interpolation, and disposed GPU resources/frame callbacks
on unmount. Rejected experimental HTML-in-canvas APIs under Nexus policy; ink
is an ordinary DOM overlay. No browser or input-device detection.

## Tilted tiles + CTAs

`?iteration=tilted-cta&tune=1` preserves the title and tilted customization tiles, adds View components and Create actions, and omits the tools heading and logos. Following content appears without waiting for the omitted tools animation. Original tilted iteration is unchanged. Uses the existing container-responsive tilted layout and wrapping flex action row (Modern Web Guidance `css-layout` and `forms`, retrieved in this session); verify keyboard links and narrow wrapping.

## Rotating headline iteration

`?iteration=rotating` keeps the tilted CTA hero and rotates three benefit lines.
Grid overlays reserve the tallest line; only opacity and transform animate.
A pause button stops motion. No environment queries are used (Nexus policy).
Guidance: modern-web-guidance search `CSS text animation transform opacity accessible pause`, retrieved `motion` (2026-10-15).

The rotating iteration uses one 3.4s timer for both the benefit text and its tile set.
Pause and Auto Tour stop that shared timer. The rotating title uses an 8px line
gap independently of the older section-spacing preset.

## Appearance ownership

Homepage and hero styles consume the enclosing NxdsAppearanceProvider tokens.
Tile surfaces derive primary-subtle pairs from nine illustrative color seeds,
using the provider state and resolved mode. Label/icon ink meets the body contrast
tier. Tool tiles inherit muted and foreground. Fonts and text sizes inherit the typography tokens;
radii and strokes inherit appearance axes. Studio sizes are ratios of the Nexus
spacing/type scales, while corners are no longer independently overridden.
Explicit reduceMotion stops the rotating headline, tile tour, wheel, and stacks.
Material-study artwork (foil shader and vinyl pigment/glints) remains illustrative
art, not a second page theme. Flat sections intentionally have no elevation.

Guidance: bundled modern-web-guidance `guides/css/design-token-reactivity.md`
(the offline CLI returned ENOTCACHED). Use inherited custom properties directly;
no style queries or environment detection are needed. Verify provider font,
mode, density, corners, and reduced-motion changes in the homepage preview.

### Framework iterations

Frameworks studio retains Shared foundation and Text cards and adds Connected
foundation and Framework playground · Zag. The connected layout follows the
framework-to-core composition approved in the design review. The playground
borrows Zag's framework selector plus source/live-example structure, with a real
Nexus React Button counter. Other bindings remain explicitly Planned; no future
package APIs are presented as available.

Guidance: MDN CSS container queries
(https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries).
The existing `frameworks` container switches the demo to two columns and draws
connectors at 48rem. Below that, choices wrap and the demo stacks; connectors are
omitted when the logos no longer form a single row. All surfaces and controls
inherit Nexus appearance tokens. Verified both selections through DialKit and
checked the counter increment/reset and planned-framework messaging in the live
preview. Scoped ESLint and diff checks pass.
