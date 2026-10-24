# Reusable Nexus Dock — 23 October 2026

The approved Roomy · bare icons dock is now a public React component. In Dock studio, **Nexus Dock · new** selects it. **Roomy · bare icons** and all earlier iterations remain available for comparison. The reusable component is committed and pushed in separate [PR #889](https://github.com/nexuslabs-ai/nxds/pull/889) from `codex/reusable-dock`. It is not merged. The homepage adapter and comparison explorations remain local.

## Ownership and API

Source: `packages/react/src/components/dock/dock.tsx`, exported from `packages/react/src/index.ts`.

- `Dock` receives the selected `value`, `onValueChange`, children and an optional `panel` slot. Selection is controlled. Panel opening can be controlled or internal.
- `DockItem` composes the existing ToolbarButton. The consumer supplies an icon, accessible name and value. Disabled items and `asChild` button composition are supported.
- `DockLabel` shows only for the selected tool.
- `DockPanel` owns its title, close action, focus/dismissal behavior and constrained scrolling content.

The component owns the raised pill, bare inactive buttons, continuous same-width panel surface, geometry, motion and keyboard interaction. The caller owns placement, tools, selection data, panel contents and application behavior. There are no chapter modes, icon registries, appearance models or fixed page coordinates in the library.

The page adapter is `NexusDock.jsx`. Existing chapter data, grid, appearance controls and isolated appearance preview remain in the application. Compact property-editor controls are a separate next step.

The desktop strip remains 72px high; it measures 638px wide with six tools (the preserved prototype measures 640px). The active pill is 280px wide. At narrow widths it keeps a 224px minimum and the tool strip scrolls horizontally, rather than compressing the controls into an unusable panel. Selection brings the active tool into view. The page still owns the fixed bottom position.

## Decisions checked by the parallel plan review

- Use the existing Radix-backed Toolbar and Popover foundations. Arrow keys move focus; Enter/Space selects a tool; Arrow Up opens its controls. Escape and the close button return focus to the active tool. An outside click retains focus at its destination.
- A Popover Anchor is not a Trigger. The Dock explicitly tracks its active button, excludes tool changes from outside dismissal, and handles focus return through Popover lifecycle hooks.
- Keep selection controlled because the caller also chooses the panel content. This avoids two competing selected values.
- Use direct Radix Content inside the existing Nexus Popover root for the transparent panel surface and local portal. Disable flipping to preserve the upward expansion; constrain tall contents to the available height.
- Use one measured rectangular surface with Nexus spacing, typography, semantic colors, radii and motion tokens. No Motion dependency, SVG morph, browser detection or input-device query is added. The existing explicit appearance motion preference governs transitions.
- Test dynamic sizing, removed active tools, nested portalled Select, controlled refusal, multiple instances and narrow layouts. A copied prototype alone would not establish these reusable contracts.

## Guidance and related libraries

Modern Web Guidance retrieved `animate-to-from-top-layer` and `animate-to-intrinsic-sizes`. We retained Radix's established presence/focus behavior and used measured numeric CSS transitions instead of adding feature-detected intrinsic-size or top-layer animation fallbacks. Verification covers focus, nested overlays, resize alignment and content overflow. The repo's no-environment-branching rule takes precedence over fallback suggestions.

Official Radix references: [Toolbar](https://www.radix-ui.com/primitives/docs/components/toolbar), [Popover](https://www.radix-ui.com/primitives/docs/components/popover). Docs MCP was unavailable; the installed primitive sources and official documentation were inspected.

Two shadcn-installable community references were checked:

- [Magic UI Dock](https://magicui.design/docs/components/dock): composable Dock/DockIcon, source installed through `@magicui/dock`, cursor magnification using Motion. Its registry source was inspected with the read-only shadcn `view` command.
- [Aceternity Floating Dock](https://ui.aceternity.com/components/floating-dock): navigation items, magnification and mobile/desktop arrangements, available through `@aceternity/floating-dock`.

These references do not provide the connected property panel used here. Nexus follows shadcn's [source ownership and composition principles](https://ui.shadcn.com/docs), with its own semantic tokens and component rules. That is philosophical alignment, not an assertion that styling, APIs or distribution are identical. No third-party Dock code or dependency was installed into Nexus.

## Preview provenance

The live Vite app is under `.codex/visualizations/2026/10/09/.../nexus-home`. Its existing `@nexus_ds/*` aliases still serve the older homepage checkout for established controls. The new `@nexus-dock/source` alias points directly to `/Users/temp/.codex/worktrees/nexus-dock/nexus/packages/react/src/components/dock/dock.tsx` on the isolated PR branch; the maintained adapter imports the public `@nxds/react` API.

The live Tailwind input explicitly scans the canonical React source. Exact-match aliases unify the root Radix packages with the canonical checkout so the new Dock and existing portalled controls share one dismissal/focus stack. The previous Vite config is saved as `vite-before-nexus-dock.mjs`. This mixed-checkout bridge is preview configuration, not a new public package API.

## Fidelity and appearance correction

The first conversion changed the surface and shadow treatment, used smaller/heavier icons, and changed panel spacing and motion. The corrected component restores thin-stroke 26px icons, bare inactive tools, a raised active pill, wider panel spacing and the uninterrupted same-width surface. Colors and material remain semantic Nexus tokens so the provider can control them.

Pill corners previously used a JavaScript half-height calculation, which ignored the provider's square-corner setting. The bar, pill, surface and close button now use Nexus radius tokens. Resize observation also preserves the active tool's visibility and alignment when density or font metrics change.

## Verification

- 15 Dock Storybook interaction and accessibility stories pass in Chromium. They cover focus, nested overlays, narrow layouts, controlled state, removed tools and dynamic geometry.
- The actual Storybook appearance provider drives the new appearance story. Color mode, neutral tone, density, corners, border, elevation, font family/size and reduced motion update computed Dock styles. The open panel stays aligned, selection persists, and the test restores the original provider settings.
- All 90 parity unit tests and 4 generated-CSS scope checks pass. Dock is explicitly listed as a planned Vue port; this implementation is React-only.
- Full repository lint and workspace typecheck pass in the isolated worktree (14 typecheck tasks). Formatting and diff whitespace checks pass.
- Size budgets pass: React ESM 101.81 kB / 102 kB; CSS 17.59 kB / 30 kB.
- Generated docs discover Dock and its two copyable examples.
- Final live preview checked at large-monitor size in both themes. The active tool, panel and surface share their width and horizontal position. Dark/light screenshots are saved alongside this file as `nexus-dock-corrected-dark.png` and `nexus-dock-corrected-light.png`.
- PR #889 CI has started; its jobs were still running at handoff.

Modern Web Guidance for this correction retrieved `animate-to-intrinsic-sizes` and `animate-element-entry-exit`. Numeric surface geometry is retained to follow the active tool, `@starting-style` handles opacity entry, and the existing Radix presence bridge handles exit. Nexus motion tokens, including explicit provider reduced motion, govern the transitions.

The source audit keeps marking custom application composition and external controls. The new library-owned Dock slots do not match the custom prototype Dock selectors; no blanket data-slot exemption or red-mark suppression was added.
