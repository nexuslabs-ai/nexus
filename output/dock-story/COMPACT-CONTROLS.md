# Compact Nexus controls and content-width Dock selection

Local preview comparison. No reusable Dock or appearance-provider library source was changed.

## Compare

- Dock studio → Customize → **Compact Nexus · new**. **Visual choices · previous**, **Nexus appearance · previous**, and **Prototype controls · previous** remain available.
- Dock studio → Selected Width → **Hug label · new** or **Roomy · previous**. This setting applies to the Nexus Dock iteration.
- Appearance studio retains its shared and isolated settings unchanged.

The original files are preserved in `compact-controls-baseline/`, with SHA-256 hashes. Existing saved DialKit choices are respected; the review preview was switched to the new options through its controls.

## Design decisions

| Decision                                     | Source                                                                                                                                    | Implementation                                                                                                                                                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compact filled rows; label left, value right | Existing DialKit SelectControl, Slider, Toggle and ColorControl source and the user's request                                             | Compose Nexus Field, NativeSelect, Slider, Input, Switch and AppearanceColorField. All styling values use existing Nexus tokens.                                                                                                             |
| A row-wide slider with editable value        | DialKit's slider anatomy                                                                                                                  | Nexus Slider retains pointer and keyboard behavior. Nexus Input accepts a draft; Enter/blur commits a bounded integer, invalid input restores the current value, Escape cancels the draft. Focus on the slider paints a visible row outline. |
| Retain visual gray and corner choices        | Previously approved iteration                                                                                                             | Existing Nexus ToggleGroup compositions and core appearance options remain.                                                                                                                                                                  |
| Closed selection hugs its contents           | User feedback on excess width                                                                                                             | Measure the actual label, icon, gap and padding. Animate the selected width using Nexus motion tokens. The open pill returns to the original Roomy width, so the panel and pill remain one straight surface.                                 |
| Preserve existing visual language            | DialKit is primary; Refero shadcn style `c14c0a94-1037-449e-bf5b-4cb972656ac7` supports precise labels and restrained functional surfaces | Use Nexus surface, typography, spacing, radius and motion roles; no reference palette or font is copied.                                                                                                                                     |

The compact rows and content-width treatment are application compositions, not newly published Nexus variants. SourceAudit identifies these boundaries. The reusable Nexus controls still own their input semantics and the Dock owns selection, focus, dismissals and its continuous surface.

## Guidance

Modern Web Guidance search: “compact property editor slider with editable number keyboard focus and inline select labels”; retrieved `slider`.

Applied explicit labels, bounded values, keyboard behavior and a visible focus indicator. Retained the existing Nexus/Radix Slider rather than implementing new pointer handlers. Did not adopt typed `attr()`, `progress()`, feature queries or environment branches; repository policy takes precedence over the guide's fallback advice.

## Verification

- Scoped ESLint, Prettier and diff whitespace checks pass. The two-entry Vite production build passes; its existing shared-bundle size advisory remains.
- Closed Theme pill measured 126px, compared with the previous 280px. When open, pill and panel both measured 280px with aligned edges. The Dock center and bottom remained at x640 and y700 in the 1280×720 viewport.
- Slider ArrowRight changed Contrast from 50 to 51, with a 2px keyboard focus outline. Typing 64 updated the slider. UI size 18 updated the shared root font to 18px. Typing 999 clamped to the supported maximum of 20; invalid text restored 20. Reset restored 16.
- Violet and Slate selections updated the shared appearance; invalid hex entry restored the committed color. Existing color-field validation is preserved.
- At 390×844, the Colors panel measured 280px and stayed between x77 and x357. Controls had equal 240px client/scroll widths; document width remained 390px. Viewport override was reset afterward.
- Restored Visual choices and Roomy through DialKit: the previous label-above-input layout returned and the closed pill remained 280px. Switched back to the new comparisons for review.
- All referenced Nexus CSS variables resolve in the live provider. Baseline hashes, shared appearance state, and existing choice styles are unchanged.

The grid, provider/message bridge, canonical reusable Dock, and PR #889 are unchanged. This batch is local and uncommitted.
