# Shared Dock and showcase appearance

Appearance studio offers **Dock + showcase · new** (the default) and **Showcase only · previous**. The previous page state and showcase state are kept separately, so switching comparison modes restores the independent Dock appearance without losing the showcase edits. The original three source files are also preserved in `shared-appearance-baseline/` with SHA-256 hashes.

`main.jsx` owns the appearance settings. In shared mode, the page's Nexus appearance provider and the existing showcase preview document receive the same sanitized configuration. The page header and CTA also inherit that provider. In previous mode, the page uses its independent configuration. No state-to-state synchronization effect or new storage/cookie writes were added.

The showcase retains its own document and real provider because the provider writes root attributes, semantic styles and font size. The existing source/origin/channel/revision-checked message bridge passes the configuration to that document. This shares settings, not a provider instance across documents.

Grid structure, Dock placement, chapter transitions and the reusable Dock source are unchanged. Real density and typography settings can change the rendered size of token-based elements; the grid does not gain widgets.

## Icons

`dock-icons.js` already imports ordinary tool icons from `@tabler/icons-react`, the same library used by Nexus. Nexus's `packages/react/src/lib/icons.ts` barrel is internal to built-in component controls; its source explicitly asks consumers to supply user-facing icons through props. Framework and UI-library logos remain application-owned brand artwork. No new icon library or icon migration is needed for this wiring change.

## Guidance and verification

Retrieved modern-web-guidance `component-specific-light-dark-theme` for the query "synchronize theme CSS custom properties across an iframe and parent document." Applied explicit configuration messaging to the controlled iframe, with coherent foreground/background values supplied by the real providers. No OS, input-device, preference or feature-detection branch was introduced.

- Scoped ESLint, Prettier and diff whitespace checks pass.
- The two-entry production Vite build passes. The existing shared bundle still exceeds Vite's 500 kB advisory.
- In shared mode, Square changed the actual Dock bar and continuous surface to 0px radius, and the showcase controls visibly followed.
- Switching to light mode updated the page, Dock and showcase. Switching to the previous comparison restored the dark page and Dock while retaining the light showcase. Returning to shared mode reapplied the shared settings.
- Relaxed density changed the Dock's height from 72px to 76px. The active pill and panel both measured 288px wide and had the same left edge, retaining their continuous surface.
- Pointer-triggered Reset restored default density while staying in Customize. Automated locator clicks can scroll the sticky chapter track, as already observed with the previous controls; pointer verification avoids conflating that automation behavior with a reset action.
- Browser error logs were empty during verification. Baseline hashes remain intact.

This batch changes the local prototype only. The separate reusable Dock PR is unchanged.
