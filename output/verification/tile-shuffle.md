# Tile shuffle iteration

Source: `.agents/skills/modern-web-guidance/guides/ui-atoms/scroll-progress-indicator.md`, reusing the prior scroll-headlines guidance lookup.

Decision: reuse the passive, requestAnimationFrame-coalesced scroll progress subscription. Animate tile opacity, translation (12px arrival, 10px departure), rotation, and scale with a bounded stagger. Keep the original Scroll headlines panel intact through component composition. Repository policy takes precedence over guide feature detection and preference media queries; explicit Nexus reduceMotion selects the static stacked layout. Mobile retains natural stacked content.

Verification: targeted ESLint and Prettier passed; Chromium desktop 1440x900 forward and reverse through all three panels keeps the main title at the same Y position. Original iteration retains three original panels and no shuffle panels. Mobile 390x844 hides the sticky track and has no horizontal overflow. No browser page errors. Visually inspected the rendered desktop screenshot.
