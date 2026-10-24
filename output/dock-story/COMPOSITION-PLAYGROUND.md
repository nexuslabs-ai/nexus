# Button and Card composition playground

Status: retired. On October 24, the user approved removing the unused active
CompositionPlayground, CompositionExamples, CompositionControls and
composition-playground.css files. Saved baseline snapshots remain intact.
The implementation notes below are historical.

Scope: new Ownership studio iteration for Make each component yours only. Preserve Create a project and Previous controls, every other chapter, and the dock geometry/behavior. Local prototype; no changes to the separately owned Dock component or PR.

Three working Button recipes (simple action, icon action, split action) and three Card recipes (profile, plan, project). Use public Nexus anatomy and props; the recipe, selection layout, state and source export are application composition. Content, Variants, Composition and Source remain the existing dock tools. Select a recipe on the canvas to edit it; neighboring recipes remain visible for comparison. Shared appearance stays inherited from the existing provider. No new library component.

Save the baseline in composition-playground-baseline. Parent-held settings survive family, chapter and comparison changes; each example's temporary interaction feedback resets on remount. Render actual source from the same imported recipe module plus its effective props, not a separately maintained snippet.

Guidance: modern-web-guidance search `responsive interactive component playground tabs composition`, retrieved `css-layout` on 2026-10-24 using the cached CLI. Use a content-sized flex row, logical dimensions, existing named canvas container for a narrow stacked layout, and overflow:auto in the bounded stage. No dense packing, environment queries, feature detection or newer anchor-position APIs; repository policy overrides those generic guide suggestions. Use Nexus Tabs, Buttons and DropdownMenu for keyboard behavior.

Verification planned: both families, genuine prop changes, structural changes, menu keyboard/focus, functional local actions, copied source bundling and escaping, earlier comparison modes, shared appearance, 390px / standard / large layouts, scoped lint and production build. Hash-check dock and other chapter files against the baseline.
