# Color Shade Use Cases

The 50 → 950 scale per palette (slate / neutral / gray / stone / zinc). One row per shade — its luminance role, what semantic tokens reference it in each mode, what not to use it for.

Shade values are perceptually graded (see `tokens.md` § Color Token Pipeline) so the steps are _visual_, not RGB-arithmetic. A shade like `{slate.500}` is not the hex midpoint between `{slate.50}` and `{slate.950}`; it's where the eye places "medium" on a perceptual lightness curve. When pairing text on surface, APCA Lc is the gate — see § APCA contrast gate in `tokens.md`.

## The 11-step grid

| Shade | Lightness role | Light-mode use                                                                                                   | Dark-mode use                                                                                                            |
| ----- | -------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `50`  | Near-white     | `background-hover`, `muted`, `disabled`, `container-hover`, `popover-hover`, `popover-active`, `border.disabled` | `nav-foreground`                                                                                                         |
| `100` | Very light     | `background-active`, `container-active`, `nav-background`                                                        | _(rarely used — too close to white for any dark-mode role)_                                                              |
| `200` | Light          | `border.default`, `nav-item-hover`, `nav-border`                                                                 | _(rarely used)_                                                                                                          |
| `300` | Light-medium   | `nav-item-active`, `primary.disabled`                                                                            | `muted-foreground`, `muted-foreground-subtle`, `disabled-foreground`, `nav-muted-foreground`                             |
| `400` | Medium-light   | `border.active`, `disabled-foreground`, `muted-foreground-subtle`                                                | `border.active`                                                                                                          |
| `500` | Mid            | `muted-foreground` — the secondary-text anchor                                                                   | _(anchor — rarely surfaced as a token; underlies brand `-background` derivations)_                                       |
| `600` | Medium-dark    | `nav-muted-foreground`, brand `-background` (e.g. `primary.background`)                                          | `popover-hover`                                                                                                          |
| `700` | Dark           | brand `-background-hover`                                                                                        | `popover`, `container-hover`, `popover-active`, `border.default`                                                         |
| `800` | Very dark      | brand `-background-active`                                                                                       | `muted`, `container`, `container-active`, `background-hover`, `nav-item-active`, `nav-border` — the raised-surface shade |
| `900` | Darker         | `foreground`, `nav-foreground`, `container-foreground`                                                           | `background` — the canvas                                                                                                |
| `950` | Near-black     | `foreground` (some palettes set primary text here when the contrast wins)                                        | `nav-background`, `background-active`, `disabled`, `border.disabled` — the deepest surface                               |

## Reading the grid

A token like `muted-foreground` references `{p.500}` in light mode and `{p.300}` in dark mode. **The mapping is not a simple flip.** Both occupy the "secondary text" role — perceptually equivalent in their respective modes — but the shade numbers differ because perceptual lightness against a light vs dark surface needs different L values to land at the same APCA tier.

When introducing a new semantic token:

1. Pick the _role_ first (canvas / muted / container / popover / nav / text-tier).
2. Find the row above for that role.
3. Use the column matching the mode.
4. Run `yarn workspace @nexus/core audit:contrast`. APCA is the gate; if a pair fails, the shade choice is wrong, not the threshold (see `tokens.md` for why thresholds aren't negotiable).

## Anti-patterns

- **Don't use `{p.500}` as a "default" tint.** It's the secondary-text anchor; using it as a fill produces muddy mid-luminance surfaces that fight every text layer above.
- **Don't use `{p.50}` for borders in light mode.** It's nearly white; you'll get an invisible divider. Use `{p.200}` (`border.default`).
- **Don't use `{p.950}` for body text in light mode.** `{p.900}` is the primary text anchor; `{p.950}` is reserved for dark-mode disabled and the deepest chrome.
- **Don't pair `{p.400}` text on `{p.800}` surface in dark mode.** Fails APCA Lc ≥ 45 (verified empirically — this is exactly why `muted-foreground-subtle` collapses to `{p.300}` in dark mode; see [surfaces.md § Known overlaps](surfaces.md#known-overlaps)).
- **Don't introduce a new shade between two existing steps.** The 11-step grid is the contract. If a design needs a luminance not on the grid, the right move is to evaluate whether the role can use an adjacent shade — not to add a `{p.350}`.

## See also

- [surfaces.md](surfaces.md) — the 5-level surface stack that consumes these shades
- [tokens.md](tokens.md) — pipeline, OKLCH conversion, APCA gate details
