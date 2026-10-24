# HeroUI incremental adoption prototype

Local prototype for Build on what you use. Select **DialKit → Coexistence studio → HeroUI adoption · new**. The previous Workspace theme study and earlier iterations remain available. The dock component, styling, motion, and position are unchanged; this iteration adds a HeroUI library choice. Other library choices still open existing studies/examples.

## What the experiment actually runs

Three identical HeroUI workspaces start with the same host markup and stylesheet. The baseline frame stays unchanged. The other frames dynamically import either the checked-in default shadcn stylesheet plus its Select, or Nexus styling plus its Select. Both added Selects offer Viewer, Editor, and Admin and share the selected role through origin- and source-checked messages. All actions are local previews.

HeroUI and the added component share one document in each experiment. Iframes separate independent experiments from each other and from the dock; they do not isolate the added library from its host.

- HeroUI: installed `@heroui/react` and `@heroui/styles` 3.2.6.
- shadcn: `apps/docs/coexistence-preview/ui/select.tsx` and `audit-shadcn.css`, reused without modification.
- Nexus: current `packages/react/src` and `packages/core/src`, compiled independently of the older homepage runtime. The actual Nexus Appearance Provider uses the same explicit light/dark mode; storage and cookie writes are disabled.
- No custom collision styles or fake broken variants. No manual global root-font fix or host theme adapter.

Each frame captures computed styles on eight existing host elements before importing the added library. After styles load and finite animations settle, it captures them again. Red outlines mark changed elements. The expandable evidence section exposes the exact before/after values and checks that all three baseline samples match.

This proves the sampled integration, not immunity to arbitrary global CSS. Default shadcn import collisions can be avoided with scoping or consumer configuration. Appearance matching is a separate question; this experiment tests preservation of the existing host.

## Runtime verification

- All three cases checked in both light and dark mode: original 0 changed, shadcn 8 changed, Nexus 0 changed.
- Identical baseline samples verified across the three frames.
- Nexus keyboard selection (Space, ArrowDown, Enter) synchronized Admin into shadcn. Selecting Viewer in shadcn synchronized Nexus.
- Highlight toggle removes and restores outlines. It does not restore or change the imported styles.
- Previous Workspace theme study opened successfully through DialKit.
- At 390 × 844: one column, document width 390, comparison client/scroll width both 358, Nexus frame client/scroll width both 348. No horizontal overflow.
- At 2369 × 1794: three 424px columns in a bounded 1320px study, fixed dock bottom 1774. Cards do not stretch to monitor height.
- Reference-size review at 1180 × 1194; snapshot saved in `hero-adoption-evidence/preview.png`.
- Short screens use the existing canvas scrolling behavior; narrow screens stack the three experiments in reading order. Breakpoint is a 900px **container** width, not a viewport assumption.
- New source passed ESLint and Prettier. Vite build passed; it reports the existing mixed JSON import-attribute warning from core palette imports.
- No Nexus package source changed for this prototype. No commit or PR created.

## Source and guidance

Modern Web Guidance search: `responsive comparison panels highlighting computed style differences`. npm metadata refresh failed with ENOTFOUND; the cached CLI returned results. Layout decisions use the bundled `.agents/skills/modern-web-guidance/guides/css/css-layout.md` (Grid, container queries, overflow): fixed three-column comparison at sufficient container width, a one-column narrow layout, logical properties, and explicit iframe sizing. Browser checks above verify these decisions. Repository no-environment-branching rules take precedence over generic fallback advice; no feature detection or OS/input queries were added.

The docs MCP was unavailable in this tool session. Installed source and official documentation were used:

- https://heroui.com/en/docs/react/components/progress-bar
- https://ui.shadcn.com/docs/components/radix/select
- https://ui.shadcn.com/docs/theming

Build: `pnpm exec vite build --config output/dock-story/hero-adoption-preview/vite.config.mjs`.
The live preview serves compiled files from `/hero-adoption-preview/`; its parent chapter is `/dock-story/`.
