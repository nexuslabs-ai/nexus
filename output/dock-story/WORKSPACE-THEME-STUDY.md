# Workspace theme study

Local preview: `http://127.0.0.1:4187/dock-story/#top`.

Choose **DialKit → Coexistence studio → Workspace theme study · new**.
The comparison appears in **Build on what you use**. The dock is unchanged.
**Coexistence diagram · previous** and all earlier comparison iterations remain
available. The pre-change entry point and audit are saved in
`workspace-theme-baseline/`.

## What the comparison measures

The target uses installed MUI 9.5.0 components and
`createTheme({ palette: { mode } })`, with no theme overrides. The Nexus form uses
real Card, Field, Input, Switch and Button components. Both forms share local
values. Submitting only changes preview state.

The three layers are:

1. **Nexus defaults**: default Nexus appearance in the selected mode.
2. **Appearance only**: a manual mapping of MUI brand color and body font, plus
   Nexus neutral surfaces, subtle corners and flat elevation presets.
3. **With custom code**: the same mapping plus scoped token overrides and
   consumer CSS. This is a local adapter, not a built-in MUI theme importer.

The source disclosure loads the actual mapping, adapter CSS and forms with
`?raw`, so the displayed code stays tied to the implementation.

## Measured results

Normal/light state, at a 16px root font size:

| Property                 | MUI target              | Appearance only                  | With custom code        |
| ------------------------ | ----------------------- | -------------------------------- | ----------------------- |
| Card radius              | 4px                     | 8px                              | 4px                     |
| Card shadow              | None                    | Small shadow despite Flat preset | None                    |
| Heading                  | 20px / 32px, weight 500 | 18px / 28px, weight 700          | 20px / 32px, weight 500 |
| Heading font             | MUI font stack          | Separate Nexus heading stack     | MUI font stack          |
| Button height            | 36.5px                  | 40px                             | 36.5px                  |
| Button line height       | 24.5px                  | 20px                             | 24.5px                  |
| Button casing and shadow | Uppercase, elevation 2  | Sentence case, no shadow         | Matches sampled target  |
| Brand                    | #1976d2                 | Derived equivalent in OKLCH      | Exact RGB token mapping |
| Field labels             | Floating                | Above field                      | Above field             |

In dark mode, the adapter matches the sampled MUI paper surface (#121212),
primary (#90caf9), foreground and disabled-button colors. Appearance-only uses
Nexus's derived neutral surfaces instead of MUI's exact palette.

Matching measured properties does not make the components identical. Field
anatomy, switch geometry and press feedback remain Nexus. The Nexus card remains
taller because its labels and spacing have different anatomy. Focus remains a
visible Nexus focus treatment, with the mapped color.

## Integration code that every layer needs

Both implementations render in the same iframe DOM. The iframe isolates the
study from the outer page and dock, not one library from the other.

The harness explicitly keeps `html:root { font-size: 16px }`. Without this guard,
the Nexus reset changes MUI's rem basis. This is shared integration CSS and must
not be counted as a zero-code appearance match.

The appearance mapping uses MUI's Roboto / Helvetica / Arial font stack. It does
not download Roboto. Actual font fallback depends on available fonts.

Results describe this local preview's dependency graph. The Vite preview aliases
Nexus components to the `nexus-homepage` checkout, and the Dock to the separate
`nexus-dock` checkout. They are not a claim about every published Nexus version.
Canonical study files use `@nxds`; the preview sync translates those imports to
the existing runtime's `@nexus_ds` names.

The remaining Card shadow and separate heading font are observed runtime
behavior. The study records them rather than changing system components to make
the comparison pass.

## Validation on October 24, 2026

- Scoped ESLint passes with no warnings. Formatting passes.
- Rendered the new iteration and the preserved diagram through DialKit.
- Light and dark comparisons: 31 sampled MUI element styles stayed unchanged
  when switching the Nexus matching layer.
- Dock bounds stayed unchanged across matching-layer changes.
- Exercised shared edits, switch toggling, local save feedback, required-name
  validation, invalid and disabled presets, and visible keyboard focus.
- Inspected the 1119×1194 layout. Natural card heights avoid stretching the forms
  to fill the chapter. The study scrolls within the available canvas.
- Narrow viewport automation timed out. Stacking rules exist, but mobile and
  short-viewport rendering were not verified in this run.
- No full production build or CI run. No commit, push, PR or deployment.

Evidence: `theme-study-evidence/metrics.json` and
`theme-study-evidence/workspace-theme-preview.png`.

## Guidance and reference sources

Modern Web Guidance `css-layout`, version `2026_09_04-7de96777`, retrieved
October 24 after the query “responsive comparison panels iframe form states”.
The implementation uses bounded width, natural-height cards and container
queries. The iframe pair stacks at 650px of available width; the parent reserves
stacked-frame height at 680px. These are component-container decisions, not
monitor-specific breakpoints. Desktop bounds and overflow were inspected;
narrow rendering remains unverified as noted above.

The visual reference is the current Dock Story page and MUI's unmodified theme.
Official sources:

- [MUI default theme](https://mui.com/material-ui/customization/default-theme/)
- [MUI theming](https://mui.com/material-ui/customization/theming/)
- [TextField API](https://mui.com/material-ui/api/text-field/)
- [Button API](https://mui.com/material-ui/api/button/)

The useful product claim supported by this study is that appearance settings
establish a shared visual direction. Exact adoption of another product's design
language still requires token mapping and component-level decisions.
