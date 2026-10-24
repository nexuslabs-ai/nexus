# Height-aware chapter layout

Local prototype refinement, October 23, 2026. Applies to all six chapters of
`/dock-story/`, with the footer still reached through the final scroll. Earlier
homepage routes, framework comparisons and dock variants remain available.

## Layout

- The existing sticky stage owns a named size container. Its explicit height
  follows `100svh` minus the measured header, without the former 620px minimum.
- Title size follows both available width and height, bounded by the existing
  DialKit title setting. Short stages reduce heading and CTA spacing; stages
  at least 1040px high retain the approved 96px/72px heading padding.
- Narrow stages reserve two title lines so chapter content starts consistently.
- The 112px dock zone controls the bottom fade and the Stories specimen's
  clearance. Canvas boxes and framework diagram rows fill the full available
  height behind the dock, with no reserved bottom padding inside the diagram.
- The core chip retains equal token rows and straight traces. Short, wide
  framework cards place the mark alongside the name and status badge.
- The Stories specimen reduces internal spacing as its own canvas gets shorter.
  No animation, dock control, scroll-selection or theme behavior was replaced.

## Guidance

The offline modern-web-guidance search for adapting full-height chapters to
short and tall containers failed with ENOTCACHED. Consulted bundled guides:

- `.agents/skills/modern-web-guidance/guides/css/size-aware-styling.md`
- `.agents/skills/modern-web-guidance/guides/css/fluid-scaling.md`

Decision: explicit-size named containers for chapter internals, container units
and clamp for fluid type, viewport units only for the full-screen shell. Apply
the repository's no-environment-branching rule instead of the guides' generic
feature-detection fallbacks.

## Verification

- At 1280×720 all six chapters: title 40.6px, canvas starts at 228.1px,
  dock top 628px / bottom 700px; no horizontal overflow.
- The framework canvas gains about 94px versus the previous layout. Following
  visual feedback, removed the extra 112px diagram inset: token boxes, core
  modules and framework cards now extend into the fade behind the dock.
- At 1920×1200: title 56px and heading padding 96px/72px; equal token heights.
- At 390×844: both themes, token text and badges fit, no horizontal overflow;
  the Stories specimen fits without internal scrolling.
- At 1280×600: framework labels fit and the Stories specimen fits above the
  dock without internal scrolling. The live story button still records clicks.
- Source formatting and browser error log checked. This is local prototype
  work; not committed or pushed.
