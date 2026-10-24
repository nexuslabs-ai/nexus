# Customize appearance migration

The Customize chapter uses Nexus controls and the real appearance model. Dock studio → Customize offers **Visual choices · new**, **Nexus appearance · previous**, and **Prototype controls · previous**. New sessions start with Visual choices; an existing saved comparison selection is respected. The prior implementation is also preserved byte-for-byte in `appearance-baseline/`, with SHA-256 hashes.

## Source-backed behavior

| Tool       | Nexus control                             | Real appearance setting            |
| ---------- | ----------------------------------------- | ---------------------------------- |
| Theme      | Switch, Slider, Field                     | mode; separate light/dark contrast |
| Colors     | NativeSelect, AppearanceColorField, Field | brandColor; surfaceTone            |
| Typography | NativeSelect, Slider, Field               | prefs.uiFont; prefs.uiFontSize     |
| Spacing    | NativeSelect, FieldDescription            | density                            |
| Radius     | NativeSelect, Field                       | corners                            |
| More       | NativeSelect, Field                       | elevation; stroke                  |

Options come from core's appearance-model exports, and all changes pass through its sanitizer. Reset restores the preview defaults. The live preview resolves the Nexus sources at `/Users/temp/.codex/worktrees/nexus-homepage/nexus`, revision `502069b45a516821d3528d3ea69b9eeb4ea527e7`. The maintained prototype uses `@nxds/*`; the live adapter translates this to that checkout's `@nexus_ds/*` names.

The provider at `packages/react/src/components/appearance/provider/provider.tsx` writes document-level attributes, semantic CSS and root font size. A separate same-origin preview document isolates those effects from the header, grid and dock. It uses the real provider with storage and cookie writes disabled. Messages check source, origin, channel and revision. A ResizeObserver passes the original parent grid's computed columns, rows and gap into the preview.

The five cards, their data and interactions reuse ShowcaseGrid. In the new preview only, `revert-layer` removes prototype Card surface overrides and reveals Nexus's own border, radius, surface and shadow utilities. Card interior padding/gap use the Nexus container roles. Density therefore changes interior spacing; it does not change the outer grid or pretend fixed-size inputs have density variants.

## Ownership

The controls are Nexus. The dock's surface, motion, panel positioning, preview frame and grid remain application composition. DialKit remains intentional comparison tooling. The audit follows the preview document, labels composition separately, and releases observers when a preview document is removed. This is not a claim that every red region has been migrated.

## Guidance and verification

Retrieved modern-web-guidance `forms` for this change: explicit labels/descriptions, native form semantics and keyboard-operable controls. NativeSelect keeps menus out of the custom panel's portal-dismissal boundary. No environment or input-device queries were added.

- Scoped ESLint and Prettier pass. The two-entry production Vite build passes; the existing shared bundle still exceeds Vite's 500 kB advisory.
- Verified actual computed changes: square corners → 0px radius; strong stroke → 2px; strong elevation → Nexus shadow; monospace/17px typography inside the frame while the parent remains 16px; light preview while the page remains dark; spacious density → 40px card padding and 24px stack gap; Violet/custom hex → actual component colors.
- Reset and the previous-controls choice were exercised. The previous version renders its original palette/accent/tint controls without the preview frame. Invalid hex is restored by the Nexus field on blur.
- At 390 × 844, the Colors panel fits its existing 154px active-pill width; content width equals scroll width (130px). Color swatch and hex entry wrap inside the panel. No document horizontal overflow was observed.
- At 1698 × 1794, the frame retains the original grid bounds (x32, y434.71875, width1619, height1359.28125), and the dock retains x521.5, y1702, width640, height72.
- Snapshot hashes pass. StraightDock, its CSS, chapter/grid/page CSS, ShowcaseGrid and both previous control implementations remain byte-identical to the baseline.
- Automated locator focus sometimes scrolls the sticky chapter track, including with the preserved controls. Pointer selection/reset were also checked. This pass is not a full browser or accessibility audit.

Changes are local prototype work; no library internals, production homepage, commits or PRs were changed in this batch.

## Visual choices iteration

The user-supplied Ambient UI reference contributes two specific patterns: corner silhouettes and named gray-family swatches. The existing dock retains its surface, active-pill width and motion. The Refero shadcn style reference (`c14c0a94-1037-449e-bf5b-4cb972656ac7`, source https://ui.shadcn.com) reinforces compact labels, restrained borders and functional decoration; no foreign palette or typography was copied.

`AppearanceChoices.jsx` composes Nexus Field, FieldLabel, FieldDescription and ToggleGroup. `NexusAppearanceControls` accepts ReactNode slots for the two pickers, so its original select controls remain available unchanged when those slots are absent. Other tools retain their existing controls and appearance wiring.

- Corner options come from core's `CORNER_OPTIONS`. Each silhouette scopes `data-radius` to that option and reads `--nx-radius-base`: Square 0, Subtle 4, Smooth 8, Round 12, Extra Round 16px. These are the preset's base radii, not a promise that every component uses the same radius role. Cards, for example, use the larger xl role.
- Gray families use the labels, identifiers and sample colors exported by `BASE_TONE_OPTIONS`. Selection updates the real `surfaceTone` setting in the isolated preview provider.
- Nexus ToggleGroup owns input semantics, keyboard navigation, focus and selected-control styling. Labels and checkmarks supplement color. Empty deselection is ignored because an appearance preset is required.
- The specimen drawings, arrangement and swatch checkmark contrast are application composition; the source audit labels this boundary explicitly. No new Nexus primitive is claimed.
- A container breakpoint at 224px changes both choice grids to two columns inside narrow active pills. Long control content scrolls internally, reserving the measured header height plus 224px for dock/panel chrome and clearance. Grid and dock source files are unchanged.

Retrieved modern-web-guidance `accessibility` for the query “Accessible visual radio choices for color swatches and corner radius presets in a compact settings panel.” Applied explicit group names/descriptions, keyboard operation, visible focus, labeled selection and usable targets. No environment queries were introduced.

Verification: the five sample radii resolve to 0/4/8/12/16px; Round updates the real preview Card to its 16px xl radius. Stone and Slate produce different computed Card surfaces (`oklch(0.2561 0.003 70)` and `oklch(0.2477 0.006 264.7)`). Arrow navigation and Space select swatches with a visible 2px focus outline. At 390 × 844 the choices wrap to two columns, and control scroll width equals client width. The prior Nexus Radius select remains selectable in DialKit. Scoped ESLint and the two-entry Vite build pass; the existing shared-bundle size advisory remains. Browser error logs are empty.
