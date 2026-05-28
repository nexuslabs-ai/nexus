# Surface Contract

5-level surface stack for Nexus. Each level is defined by a **luminance step**, never by hue. Components don't pick surfaces — _contexts_ do.

## The stack (recessed → raised)

| Level | Token            | Light value | Dark value | Role                                                                   |
| ----- | ---------------- | ----------- | ---------- | ---------------------------------------------------------------------- |
| 1     | `nav-background` | `{p.100}`   | `{p.950}`  | Fixed chrome (sidebar, topbar). Theme-stable, namespace-distinct.      |
| 2     | `muted`          | `{p.50}`    | `{p.800}`  | Recessed secondary regions (inset panels, code blocks, table headers). |
| 3     | `background`     | `{white}`   | `{p.900}`  | Page canvas — the default surface.                                     |
| 4     | `container`      | `{white}`   | `{p.800}`  | Raised surfaces (cards, dialog bodies).                                |
| 5     | `popover`        | `{white}`   | `{p.700}`  | Floating overlays (menus, tooltips, dropdowns).                        |

`{p.X}` = palette ref (`slate` / `neutral` / `gray` / `stone` / `zinc`). The value columns here and in the nav table below mirror `base-{palette}-{light,dark}.json` (canonical) — they make the luminance grammar the rules encode concrete; they are not a second source of truth, so sync from the JSON if they ever disagree.

## Rules

1. **Luminance only.** Never tint a surface to indicate elevation. Use a gray step.
2. **Light mode: `background`, `container`, `popover` all share `{white}`.** Elevation comes from `shadow-sm` / `shadow-md` and `border-default` — not from a darker fill. This is the "Model 2" canvas (matches Linear, Notion, Vercel/Geist).
3. **Dark mode: container/popover step lighter than canvas.** Shadow is additive but not load-bearing; the luminance step is what reads as raised.
4. **Direction is consistent across modes.** Raised sits closer to white in light mode, lighter than canvas in dark mode. Recessed sits darker in light mode; in dark mode "more recessed than canvas" is impossible — `muted` stays at `{p.800}` (one lighter than canvas at `{p.900}`) and relies on border/inset framing for the recessed read.
5. **Components don't pick surfaces, contexts do.** A card inside a sidebar uses `container`; the sidebar uses `nav-background`. A dialog body uses `container`; the dropdown inside the dialog uses `popover`.
6. **When `-active` cannot step to a distinct shade, the press cue moves off the fill.** The token still resolves (to the same value as rest) so component code has a stable hook, but the visual affordance comes from `nx:active:border-border-active` or `nx:active:shadow-inner` (the `inset`-baked shadow primitive) — applied to the component's `:active` / `[data-state="active"]` selector, not always-on, and not as a fill change. This is forced by dark-mode shade scarcity (`container = {p.800}` has no distinct darker step that doesn't collide with canvas; `popover = {p.700}` has no distinct darker step that doesn't collide with container) and by light-mode near-white compression (`popover-hover` and `popover-active` both sit at `{p.50}`). See § Known overlaps for the specific pairs; see [`components.md` § State Patterns](../../../.claude/rules/components.md#state-patterns) for the component-side application.

## Nav as a namespace

The `nav-*` block is one namespace, not a relabel of `muted`. It bundles its own background, foreground, muted-foreground, hover/active item states, and border because navigation chrome needs independent theming (often distinctly darker than canvas, sometimes brand-tinted later). `nav-border` is flat (a top-level key, not nested under `border.*`) because it travels with the rest of the nav tokens as one unit — splitting it into `border.nav` would scatter the namespace.

The namespace deliberately stops at surface chrome. **Primary buttons and other CTAs placed inside nav use the base `primary-*` / status `-*` tokens; focus rings use `focus-*`.** Nav does not ship its own `nav-primary-*` or `nav-ring` — a sidebar button is a primary button that happens to live in a sidebar, not a separately-tokenised thing. (This is where Nexus diverges from shadcn's `sidebar-primary*` / `sidebar-ring`; the bet is that one set of brand and focus tokens is easier to keep coherent than two.)

| Token                  | Light value | Dark value | Role                                |
| ---------------------- | ----------- | ---------- | ----------------------------------- |
| `nav-background`       | `{p.100}`   | `{p.950}`  | Nav surface (sidebar/topbar fill)   |
| `nav-foreground`       | `{p.900}`   | `{p.50}`   | Nav label text                      |
| `nav-muted-foreground` | `{p.600}`   | `{p.300}`  | Nav helper / metadata text          |
| `nav-item-hover`       | `{p.200}`   | `{p.900}`  | Hover state on nav items            |
| `nav-item-active`      | `{p.300}`   | `{p.800}`  | Selected / active nav item          |
| `nav-border`           | `{p.200}`   | `{p.800}`  | Dividers within nav, nav frame edge |

## Known overlaps

These collisions are intentional — they fall out of the luminance grammar. The list below covers the surface-stack and nav tokens; for the comprehensive shade-by-shade view (which catalogues every token that lands on a given shade, including disabled / border / foreground tiers), see [color-shades.md](color-shades.md) § The 11-step grid.

- **Dark mode `container = muted = background-hover = {p.800}`.** All three render at the same shade in dark mode. Cards (`container`) are bordered + static; muted regions are de-emphasised content blocks; `background-hover` is a transient interaction state on items _inside_ containers. Context resolves the ambiguity — a row that highlights on hover does not visually become a card.
- **Dark mode `container-active = container = {p.800}`.** No darker shade is available without colliding with canvas (`{p.900}`), and stepping lighter would collide with `container-hover = {p.700}`. Press cue moves off the fill per Rule 6.
- **Dark mode `popover-active = popover = {p.700}`.** Same shape as container-active: stepping darker collides with `container`, stepping lighter collides with `popover-hover = {p.600}`. Press cue moves off the fill per Rule 6. (In practice, popover surfaces themselves are rarely pressed — selected items inside a popover use their own item-level styling, not `popover-active`.)
- **Light mode `popover-hover = popover-active = {p.50}`.** Near-white compression: rest sits at `{white}`, hover steps to `{p.50}`, and there's no half-step between `{p.50}` and `{p.100}` (which is owned by `container-active` / `background-active`). Stepping `popover-active` to `{p.100}` would muddy the popover/container distinction. Press cue moves off the fill per Rule 6.
- **Dark mode `muted-foreground-subtle = muted-foreground = {p.300}`.** The tertiary text tier collapses in dark mode because no palette step exists between `{p.300}` (clears the [APCA gate](tokens.md#apca-contrast-gate) on `muted = {p.800}`) and `{p.400}` (too dim, Lc -39). Light mode preserves the tier (`muted-foreground = {p.500}`, `muted-foreground-subtle = {p.400}`). To restore the dark-mode tier, either nudge `muted` itself or extend the palette with an intermediate step — both are out of scope of the surface contract.
- **Dark mode `nav-border = nav-item-active = {p.800}`.** Same shade because the border between nav items and the selected item's fill sit at the same depth — the active item reads as "pressed into" the chrome, not "raised above" it.

## See also

- [color-shades.md](color-shades.md) — what each 50→950 shade is for
- [tokens.md](tokens.md) — pipeline, OKLCH conversion, APCA gate
- [shadcn-divergences.md](../../../.claude/rules/shadcn-divergences.md) — shadcn → Nexus token mapping
- [components.md § Layering model](../../../.claude/rules/components.md#layering-model) — z-index / stacking order, the structural axis paired with this file's elevation/shadow contract
