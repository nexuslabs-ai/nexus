# Scroll headlines iteration

Guidance: modern-web-guidance search "sticky scroll progress reveal sections", retrieved `scroll-progress-indicator`. Repository policy overrides the guide's CSS animation-timeline/feature-query approach: use widely available sticky positioning and one passive scroll subscription, coalesced by requestAnimationFrame. No wheel interception or scroll trapping. ResizeObserver recalculates geometry. A short step counter communicates progression.

Desktop uses a 260svh track with a viewport-height sticky stage. Mobile below 64rem uses the existing stacked layout. Explicit Nexus reduceMotion preference uses the stacked layout at every width. The comparison and palette controls remain in DialKit.

Validation: Chromium 1440x900, forward stages 0/1/2 and reverse 2/1/0; stage releases after track; 390x844 shows stacked content and hides scroll track; no horizontal overflow or browser errors. Targeted ESLint passed after import sorting.
