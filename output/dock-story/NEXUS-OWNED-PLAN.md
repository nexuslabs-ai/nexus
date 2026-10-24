# Nexus-owned compact controls and Hug sizing

Approved scope: preserve the current appearance, shared provider state and grid; retain the prior prototype in DialKit. Work locally in the existing Dock component workstream; no publication required for preview.

## Plan

1. Freeze prior adapters and Dock module with hashes for an independent comparison.
2. Add filled Slider presentation with component-owned track/thumb/focus styling, then PropertySlider composition for single-value editing. Reuse existing Radix behavior and Input. Support step snapping, disabled/invalid, naming, descriptions and units.
3. Add compact color-field presentation and disabled support; forward both through BrandColorField. Keep select and switch as ordinary Field compositions with normal-flow labels.
4. Add Dock activeWidth and DockPanel density APIs. Keep numeric Hug geometry within Dock's existing measurement lifecycle so opening/closing remains animated.
5. Expose new APIs, document through stories, update parity inventory. Add a separate Nexus-owned comparison in the preview, retaining provider/message bridge unchanged.
6. Run component story interactions/a11y, types/lint/build, public-entry smoke and browser checks at narrow/standard/wide sizes, including shared appearance and previous comparison.

## Council delta

- Accepted: normal-flow select labels, decimal step contract, thumb-owned ARIA and focus, freeze actual old Dock.
- Accepted: forward color-field props through BrandColorField; use component-owned numeric Hug geometry because intrinsic-to-length width does not animate with supported CSS.
- Accepted: verify live module aliases and utility source coverage, one Radix graph, and built public exports/CSS.
- Adjusted Escape contract: standalone editor cancels its draft; inside Dock Escape cancels the draft and dismisses the panel with focus return. Keeping the panel open on the first Escape was not an approved requirement, and would require extra overlay coupling. An integration story must prove cancellation causes no commit.

## Guidance

Modern Web Guidance query: accessible compact property slider editable numeric value and intrinsic width toolbar popover. Retrieved `slider` (saved /tmp/nexus-property-slider-guidance.md). Applied naming, bounds, units and visible focus. Retain existing Nexus/Radix mechanics rather than native replacement. No progress(), typed attr(), interpolate-size or environment branches.
Docs MCP unavailable in this session. Consulted official https://www.radix-ui.com/primitives/docs/components/slider and https://www.radix-ui.com/primitives/docs/components/popover and installed source. No dependency upgrades.

## Ownership

Nexus owns reusable control behavior and styles. The page owns appearance setting choices, state wiring and chapter layout. Prior local overrides remain only for comparison. New components do not import page CSS or DialKit.

## Delivered and verified

- Added public PropertySlider, Slider filled presentation, compact appearance ColorField, Dock activeWidth="hug", and compact DockPanel density. Select and switch rows use ordinary Nexus composition; the select reserves NativeSelect's existing chevron padding.
- Preview comparisons: Dock iteration "Nexus owned · new" versus "Nexus Dock · previous"; Customize controls "Compact Nexus · reusable" versus "Compact Nexus · previous". The previous adapter, Dock implementation and control stylesheet are frozen independently.
- 64 focused browser stories passed, including keyboard/typed edits, bounds and decimal steps, cancellation, disabled/invalid states, controlled updates, form submission, focus return and accessibility. React types, lint, and canonical parity checks passed (10/10). Library and final preview production builds passed.
- Built-package smoke used public exports and published-style theme/CSS imports without prototype control CSS. Confirmed full-row slider fill and equal panel/pill widths.
- Live checks: light/dark appearance; shared dock/showcase font and font-size changes; previous/new comparisons; 390px, 1440px and 2369px viewport widths. Panel and expanded pill both measured 280px; no document horizontal overflow. Viewport override reset after checks.
- The page's existing source-audit overlay and showcase responsive layouts remain outside this change. The narrow audit overlay can obscure the heading; it was not redesigned here. Other chapters' content and the shared appearance bridge are unchanged.
- Local changes only. No commit, push or PR publication performed in this turn.
