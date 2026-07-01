# Responsive Design Rules

Nexus is designed **mobile-first and desktop-first**: **Narrow (mobile) and Standard (desktop) are both first-class targets** — neither is a degradation of the other. Author **mobile-first** — the base (unprefixed) utilities are the Narrow/mobile case, and min-width prefixes (`nx:lg:`, `nx:xl:`) layer on the wider tiers. Components are tuned against **two reference widths — a mobile reference (~390px) and a desktop reference (~1280px)** — and must read well at both. **Wide (≥1536px)** gets extra breathing room when available.

> **Consumer-brand re-aiming.** The reference brand is co-primary (mobile + desktop) out of the box — mobile is _not_ an inversion of a desktop default. Consumer brands can still re-aim `@theme { --breakpoint-* }` to weight a particular tier for their product; the Narrow / Standard / Wide labels describe the reference brand's bands, not hard-coded behaviour.

## Display class table

**This table is the single source of truth.** Other rule files (`components.md`) link here rather than duplicating these rows.

| Tailwind class | Range (rem / px @16) | Nexus display class | Design target                                       |
| -------------- | -------------------- | ------------------- | --------------------------------------------------- |
| _(no prefix)_  | base / <640px        | Narrow              | ★ mobile foundation — style here first (~390px ref) |
| `nx:sm:`       | 40rem / 640px+       | Narrow              | ★ first-class                                       |
| `nx:md:`       | 48rem / 768px+       | Narrow              | ★ first-class                                       |
| `nx:lg:`       | 64rem / 1024px+      | Standard            | ★ first-class — desktop floor                       |
| `nx:xl:`       | 80rem / 1280px+      | Standard            | ★ first-class — desktop reference                   |
| `nx:2xl:`      | 96rem / 1536px+      | Wide                | extra breathing room                                |

**Narrow / Standard / Wide are documentation labels, not utilities.** There is no `nx:standard:` class. Contributors use the standard Tailwind class names (`nx:sm:`, `nx:md:`, `nx:lg:`, `nx:xl:`, `nx:2xl:`) in code; the display-class labels exist to anchor design and review conversations.

> **Rem breakpoints track the user's font-size preference — not zoom.** Breakpoints are rem-based, so they respond to the browser's **default font-size** setting — in a media query, `rem` resolves against that browser default (a user preference), not against any `html { font-size }` the page itself sets. Full-page zoom is _not_ the mechanism: zoom scales every length unit, rem and px alike, so rem-vs-px makes no difference under it. The payoff is for a user who raises their base font size — each rem grows, the breakpoints fire at a _narrower_ viewport, and the layout drops to a roomier tier as the text enlarges (a px-based layout would ignore the preference). Example: doubling the base font to 32px turns `nx:lg:` (64rem) into a 2048px threshold and `nx:md:` (48rem) into 1536px, so a 1280px viewport that is normally Standard (`nx:xl:` matches) now reads Narrow — only `nx:sm:` (40rem → 1280px) still matches. This is intended accessibility behaviour: layout should follow text size. Test components at 100/150/200% zoom (for reflow) **and** with an enlarged browser default font (for breakpoint behaviour).

## Touch targets

Both Narrow (mobile) and Standard (desktop) are first-class, so every interactive
component must be comfortably **tappable**, not just clickable. **Minimum
interactive target: ~44px** (WCAG 2.5.5 Target Size · Apple HIG 44pt;
Material's 48dp is the roomier bar). This is a **hit-area floor, not a
visual-size mandate** — a component may look smaller as long as its tappable
area clears ~44px on touch. Component visual sizes are defined in
[components.md § Sizing Convention](components.md#sizing-convention); this
section only governs the extra hit area. For touch, extend the hit area with
padding where it fits or with a coarse-pointer `::after` overlay such as
Sidebar's `nx:after:-inset-2` pattern.

## Decision tree — which responsive mechanism

| Mechanism                             | Use case                                                  | Example                                               |
| ------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| `@container` query                    | Component renders differently based on its parent's width | Card that's full-width in a hero, narrow in a sidebar |
| `nx:lg:` viewport prefix              | Page-shell decisions — nav collapse, side panel hide      | Hide secondary sidebar below `lg`                     |
| `clamp()` (CSS primitive)             | Continuous adaptation of size — type, padding             | `font-size: clamp(1rem, 0.9rem + 0.5vw, 1.5rem)`      |
| `svh` / `lvh` / `dvh` (CSS primitive) | Mobile browser-chrome accommodation                       | Modal that must not clip: `max-height: 100svh`        |

### `container-type` cost policy

Only add `container-type: inline-size` to a component where a **child actually queries the container** via `@container (...)`. Each declaration creates a new formatting context with size containment, and the browser begins tracking that element's dimensions across layout-affecting size changes.

Per MDN and web.dev: no element has size containment by default — you manually register a query container with `container-type` when you need it, precisely so the browser can limit the number of elements it tracks. Applying it indiscriminately reintroduces the per-element tracking cost the property was designed to avoid.

Concrete rule: if you grep your file and find no `@container (...)` rule scoping to the declared container, the `container-type` declaration is dead weight — remove it.

## Canonical pattern in JSX

The declarative `<Show>` / `<Hide>` primitives ([#103](https://github.com/nexuslabs-ai/nexus/issues/103), exported from `@nexus/react`) express responsive visibility across both axes. They toggle `display: contents` ↔ `display: none` — children always render; only visibility changes (no mount/unmount). Because a `contents` wrapper generates no box of its own, an inline, flex, or grid child keeps its natural layout (this is the conclusion of the #103 spike — `display: block`/`revert` would break those cases).

Provide **exactly one** axis (`above` / `below` / `containerAbove` / `containerBelow`) — a discriminated union rejects zero or two at compile time. Container axes query the nearest `@container` ancestor, so a parent must declare one (e.g. the `nx:@container` utility).

> **Two breakpoint scales, same names.** The viewport axes use the `--breakpoint-*` scale (`md` = 48rem); the container axes use Tailwind's native `@container` scale (`md` = 28rem), deliberately smaller because a component reads as "md" at a narrower width than the whole viewport. So `above="md"` and `containerAbove="md"` do **not** fire at the same width.

> **Experimental.** The API is inferred from Atlassian's pattern and may change before it stabilises. Named-container queries (`@container/{name}`) are out of scope for v1 — fall back to raw `nx:@container/{name}/{bp}:` utilities if you need one.

Prefer the primitive over raw class toggling (`nx:hidden nx:lg:block`), which is verbose and easy to invert by mistake. Pick the axis to match the decision tree: `above` / `below` for viewport (page shell), `containerAbove` / `containerBelow` for component-internal.

## Anti-patterns

- **Don't use `nx:sm:` inside component internals.** Use `@container` queries instead. A viewport prefix inside a component leaks page-shell concerns into the component's internal layout — the component then renders inconsistently when dropped into a sidebar vs a hero. The exception is full-viewport overlays; see Viewport-driven exceptions below.
- **Don't use raw `vh` units.** They reflect the largest possible viewport on mobile and overshoot when browser chrome is visible. Per [web.dev's viewport-units guide](https://web.dev/blog/viewport-units) and MDN: use `svh` (small viewport — chrome-shown size) for content that must not clip on initial load — modals, sticky elements; use `lvh` (large viewport — chrome-hidden size) for immersive full-bleed heroes; use `dvh` (dynamic) for layouts that should grow and shrink as chrome shows/hides.
- **Don't use `dvh` for overlay internals.** Dialog-family overlays (Dialog and AlertDialog), Sheet, and Drawer bounds use `svh` so their measured height does not jitter as mobile browser chrome collapses or expands. Reach for `dvh` only when the whole surface is intentionally supposed to resize during that chrome transition.
- **Don't write responsive component code that assumes a viewport width.** Components don't know their consumer's page shell. Render decisions should follow the component's parent width (`@container`) or be passed in as props — never inferred from the viewport.

## Viewport-driven exceptions

Most components use `@container` for internal responsive behaviour — though no shipped Nexus component reaches for it yet (Dialog is the original live datapoint, and it's one of the viewport-driven exceptions below). The `@container` default is forward-looking: it sets the bar for the next wave of internal-responsive components, not a pattern to retrofit existing ones against. **Full-viewport overlay components are exceptions** — Dialog, AlertDialog, Sheet, Drawer, and future FullScreenOverlay — because their responsive trigger is positioning relative to the viewport, not their own container width.

A Dialog at 480px viewport is full-bleed (no rounded corners) because _the viewport is narrow_, not because the Dialog's own container is narrow. Migrating to `@container` would flip the rounded-corner threshold to the Dialog's intrinsic width, producing rounded corners on what's still effectively a full-bleed sheet — wrong UX.

Live examples: `packages/react/src/components/overlay-layout/overlay-layout.ts` uses `nx:sm:` for Dialog-family content corner rounding, header text alignment, and footer flex-direction/gap, and bounds Dialog / AlertDialog content with `svh` while the body slot owns overflow. Sheet and Drawer use `svh` for visible-viewport height bounds: side panels use `h-svh`, top/bottom Sheet panels cap at `max-h-svh`, and top/bottom Drawer panels keep their intentional `max-h-[80svh]` peek. Each is a positioning concern relative to the viewport, not a container-width concern. Keep them.

For exceptions, use viewport breakpoints (`nx:sm:`, `nx:md:`, etc.) as you normally would.

## Forward direction

`clamp()` and the dynamic viewport units (`svh` / `lvh` / `dvh`) are not tokenised yet — components that need them today use the CSS primitives directly.

## See also

- [components.md](components.md) — component-authoring rules; `@container` internal use is the responsive corollary of the Sizing Convention
- [#103](https://github.com/nexuslabs-ai/nexus/issues/103) + `packages/react/src/components/{show,hide}/` (sharing `packages/react/src/lib/responsive-visibility.ts`) — the shipped `<Show>` / `<Hide>` source, stories, and spike-conclusion header
- `packages/core/tokens/semantic/breakpoints.json` — the `--breakpoint-*` token values
- `packages/react/src/components/dialog/dialog.tsx` — the live viewport-driven exception
