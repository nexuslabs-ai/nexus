# Build on what you use — real library comparison

Local prototype: `http://127.0.0.1:4187/dock-story/`.

In **DialKit → Coexistence studio**, choose **Workspace theme study · new**,
**Coexistence diagram · previous**,
**App examples · previous**,
**Nexus appearance · previous**, **Real libraries + Nexus · previous**, or
**Placeholder comparison · previous**.
The original placeholder component remains in use for its previous option; its
original entry-point files are also saved in `coexistence-baseline/`. The real
library comparison's pre-appearance files are saved in
`coexistence-appearance-baseline/`. Dock styles, controls and variants are unchanged.

The default workspace theme study compares real MUI and Nexus settings forms.
See [the study results and integration limits](WORKSPACE-THEME-STUDY.md).

## Dedicated playground removed — October 24

The standalone `/dock-story/coexistence/` page, its entry point and its stylesheet
were removed with user approval. The chapter CTA uses the existing integration
documentation destination again. The real examples remain available in the
saved DialKit iterations. Dedicated-page implementation and validation notes
below are historical.

## Diagram and dedicated playground — original implementation

The new default iteration replaces only the Build on what you use canvas with a
diagram. One application boundary holds the existing library and the Nexus
addition as peers, with separate appearance paths below. Library selection uses
the existing dock; its component, sizing, position and controls are unchanged.
The CTA carries the selected library and light/dark mode to
`/dock-story/coexistence/`.

The diagram is a schematic, not a live rendering of library components. Its
Nexus module enters once, then acquires an accent; Change Nexus appearance
demonstrates an isolated color/corner change. Replay restarts only that module.
The dedicated page contains the actual same-DOM coexistence examples, real Nexus
appearance controls, keyboard-operable reveal slider, local interactions and
source disclosures loaded directly from the implementation files with `?raw`.
Each library starts with its default appearance when selected on that page.

The previous chapter remains available under App examples · previous, and the
pre-diagram entry-point files are saved in `coexistence-diagram-baseline/`.

Guidance: Modern Web Guidance `motion`, retrieved 2026-10-24 with skill version
`2026_09_04-7de96777`, following the query “responsive diagram reveal animation
transform opacity”. Entry uses transform and opacity; the accent uses opacity.
Animations finish once and can be replayed explicitly. Nexus's explicit
`prefs.reduceMotion` disables motion; no OS/preference or feature-detection query
was introduced. The existing CSS layout guidance is reused for container-based
spacing and natural document flow on the dedicated page.

Validation:

- Scoped ESLint and formatting pass for the changed source.
- All three library diagram choices, the appearance toggle and selected-library
  destination were exercised. Existing-side markup/styles and dock bounds stayed
  unchanged during the diagram's appearance toggle.
- Checked the diagram at 1119×1194, 390×844 and 1280×720. A short-canvas rule at
  580px removes supporting notes and tightens node spacing so the diagram clears
  both the heading and dock. At 2369×1794, DOM bounds confirm a centered 1368px
  diagram with no horizontal overflow; the screenshot transport cropped that
  large virtual viewport, so wide visual review is limited to those bounds.
- The dedicated page has no horizontal overflow at 390px; its real-example
  columns stack. Its source-audit controls are in document flow on that page.
- MUI seats update the native total (5 seats → $145), Ant invitation updates the
  native member list/usage, and shadcn payment history/review actions work locally.
- On the dedicated page, 67 sampled Ant element styles stayed unchanged while
  Nexus Corners changed the added card's radius from 12px to 20px. Prior app-example
  validation below covers MUI and shadcn appearance isolation.
- The reveal responds to keyboard input and makes both frames inert between
  endpoints. Source disclosures contain the actual current compositions.
- The previous App examples iteration was rendered, then the diagram restored.
- No production build, commit, push or deployment was performed.

## App examples iteration

This iteration uses the homepage references as app composition examples while
preserving the coexistence behavior. It does not reproduce the homepage's
intentional default-stylesheet collision demonstration.

- MUI billing: a native subscription, payment form and usage card alongside a
  Nexus seat editor. Submitting five seats updates the native total to $145.
- Ant workspace settings: native usage, team members and plan controls alongside
  a Nexus invitation form. Inviting a Viewer adds that role to the native list
  and updates the usage count.
- shadcn billing: native subscription and payment history alongside Nexus
  information, warning, success and destructive billing alerts. The review
  action and payment-history toggle both work locally.

Native app content retains its position between the before/after states. Nexus
additions start at the top of the second column. Two columns stack at the existing
680px workspace container breakpoint. The dock and surrounding chapter layout
are unchanged. The appearance controls still target only the Nexus addition;
status alert colors continue to express their semantic meaning.

The previous comparison remains selectable. Its entry-point files are also
saved in `reference-examples-baseline/`. The Added with Nexus badge now has
zero horizontal padding, as requested.

Guidance: Modern Web Guidance `css-layout`, retrieved 2026-10-24 with skill
version `2026_09_04-7de96777`. Applied grid for the two-dimensional composition,
flex for content rows, natural card heights, and the existing named container
breakpoint. Checked the rendered desktop composition and computed styles.
Official API references: [MUI TextField](https://mui.com/material-ui/react-text-field/),
[Ant Progress](https://ant.design/components/progress/), and
[shadcn Alert](https://ui.shadcn.com/docs/components/radix/alert).

Verification for this iteration:

- Scoped ESLint passes. A MUI Stack alignment prop warning was corrected to
  use the supported `sx` styling API.
- MUI seat changes and billing save, Ant invitation/role/usage and plan details,
  and shadcn payment history/activity review were exercised in the browser.
  All actions remain in local React state; no email or payment is sent.
- Sampled color, background, border, radius, shadow, font and padding stayed
  unchanged on 50 MUI, 67 Ant, and 30 shadcn elements while Nexus appearance
  changed. Nexus card and button appearance changed, and badge horizontal
  padding was verified as 0px.
- Rendered at the browser's 1119×1194 default, plus a 1280×720 standalone frame;
  the shadcn example was checked in both light and dark modes. A requested
  mobile viewport override did not take effect, so narrow runtime verification
  is not claimed. The existing responsive shell and breakpoint are retained.
- The previous Nexus appearance iteration was selected and its original workspace
  rendered; App examples was then restored.
- No full production build or CI run was performed for this local prototype.

## Nexus appearance iteration

The new variant adds Brand, Corners and Elevation controls above the workspace,
using Nexus Field, FieldGroup, NativeSelect and Button. Options and sanitization
come from the core appearance model. These local overrides update the appearance
provider inside the after frame only; the surrounding page and dock retain their
shared appearance settings. Changing an option reveals the complete after frame
so the Nexus addition is visible. Reset restores the shared settings.

Overrides carry across library tabs. Leaving this chapter or switching comparison
iterations resets them. The previous live variant has no appearance control strip.
Both variants share a correction to the preview theme boundary: the provider owns
the root dark class, and the inner main no longer repeats it. That redundant class
was restoring static Nexus defaults over generated brand and elevation tokens.

## What the comparison demonstrates

The library's UI stays intact. Nexus adds an invitation card alongside it.
Submitting that card adds a member to the existing library's table in local
React state. No invitation or email is sent. Switching libraries resets the demo.

- MUI: installed `@mui/material` 9.5.0 components, with its native theme provider.
- Ant Design: installed `antd` 6.6.6 components, with its native ConfigProvider.
- shadcn/ui: the repo's actual `radix-nova` neutral source components, copied from
  `examples/shadcn-app/components/ui/` into `comparison-ui/`.
- Nexus: Card, Badge, Field, Input, NativeSelect, Button and Alert from the
  current Nexus preview runtime, under its appearance provider.

The light/dark mode is shared. Other Nexus appearance settings apply to the Nexus
addition, not to the library's component styles. This is a coexistence example,
not a theme adapter or a migration of the library's controls to Nexus.

## Boundaries

Each before/after app runs in its own same-origin iframe to isolate library CSS
from the surrounding prototype. Nexus and the selected library share the DOM
and member state _inside_ the after frame. Validated parent messages synchronize
Nexus appearance without remounting the form. Library styling is not overridden
with Nexus tokens. The existing source audit includes both frames and explicitly
marks the third-party components as external UI.

The two side buttons reveal a complete, interactive app. Between the endpoints,
the range reveals both versions visually and makes both frames inert so hidden
controls cannot receive keyboard focus. Returning to comparison resets frame
scroll positions. The comparison has a 1368px maximum width; cards use natural
content height. Below 680px of available workspace width, columns stack and the
frame scrolls. Below 520px of canvas width, the comparison controls wrap.
The appearance strip wraps below 900px of canvas width; its three fields remain
in equal columns and use Nexus responsive Field anatomy for their labels.

## Source and guidance

- [MUI theming](https://mui.com/material-ui/customization/theming/) and
  [Table](https://mui.com/material-ui/react-table/).
- [Ant Design themes](https://ant.design/docs/react/customize-theme/) and
  [Card](https://ant.design/components/card/).
- [shadcn Radix Card](https://ui.shadcn.com/docs/components/radix/card),
  [Button](https://ui.shadcn.com/docs/components/radix/button), and
  [Input](https://ui.shadcn.com/docs/components/radix/input).
- Modern Web Guidance, retrieved 2026-10-24 using `modern-web-guidance@latest`,
  skill version `2026_09_04-7de96777`: `slider` and `css` guides. Applied native
  labelled range interaction, `aria-valuetext`, visible keyboard focus, scoped
  styling, and container-based layout. Used a plain percentage custom property
  for the reveal instead of experimental typed `attr()` or `progress()`. No
  feature detection or device/preference queries were added.
- The appearance iteration reused the CSS guide on 2026-10-24 after the query
  `scoped theme customization form controls CSS custom properties`: one provider
  theme boundary, namespaced Nexus tokens, and container-based control layout.
  Verified through rendered styles and narrow/desktop browser views.

The shadcn files retain their source classes. Only import paths changed: local
`cn`, and the equivalent individual Radix Slot package available in this preview.
The theme CSS is copied from `examples/shadcn-app/app/globals.css`; Tailwind scans
only these copied components and the workspace. Unused animation imports are
omitted. See `comparison-ui/LICENSE.md` for upstream attribution.

## Verification

- Scoped ESLint on the changed JSX files passes.
- MUI, Ant Design and shadcn each render their actual components in the browser.
- Submitting the Nexus card adds a row to each library's table. Ant's selected
  Viewer role is retained; native member search and digest controls work.
- Keyboard End reveals the original app; side buttons reveal interactive apps.
- Light/dark switching updates library mode and Nexus without losing the form.
- Previous placeholder iteration renders; the new iteration is restored.
- Appearance iteration: sampled computed color, background, border, radius,
  shadow, font and padding on 76 MUI, 97 Ant, and 61 shadcn elements. They stayed
  identical while Nexus brand, corners and elevation changed. The shadcn check
  also passed in light mode. Reset restored the sampled Nexus defaults.
- The previous real-library variant renders without the new control strip and
  remains selectable. New controls were checked at 1280×720, 1180×1194 and
  390×844; the narrow layout has no page-level horizontal overflow. The workspace
  scrolls inside its frame at short heights.
- Checked the chapter at 1180×1194, 2369×1794, and 390×844. No page-level horizontal
  overflow at the narrow size; the compact workspace scrolls within its frame.
- Existing Recharts sizing warnings originate from another chapter. No new
  comparison runtime errors were observed. Full production build/CI was not run.

This remains a local exploration. Nothing from this change has been committed
or pushed.
