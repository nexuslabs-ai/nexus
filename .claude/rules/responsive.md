# Responsive Design Rules

Nexus components are designed for **Standard (≥1024px)** as the primary target. Narrow (<1024px) is graceful degradation; Wide (≥1536px) gets breathing room when available. Use `nx:lg:` as the primary responsive prefix in consumer code.

> **Consumer-brand inversion.** The ≥1024px primary target is the Nexus reference brand's default — set by `--breakpoint-*` in `packages/tailwind/nexus.css:236-240`. Consumer brands building mobile-first products override by re-aiming `@theme { --breakpoint-* }` and treating a different tier as primary. The display-class labels (Narrow / Standard / Wide) describe defaults, not hard-coded behaviour.

## Display class table

**This table is the single source of truth.** Other rule files (`components.md`, `figma.md`) link here rather than duplicating these rows.

| Tailwind class | Range (rem / px @16) | Nexus display class | Use as primary target? |
| -------------- | -------------------- | ------------------- | ---------------------- |
| `nx:sm:`       | 40rem / 640px+       | Narrow              | No (graceful)          |
| `nx:md:`       | 48rem / 768px+       | Narrow              | No (graceful)          |
| `nx:lg:`       | 64rem / 1024px+      | **Standard ★**      | Yes — floor            |
| `nx:xl:`       | 80rem / 1280px+      | **Standard ★**      | Yes — reference        |
| `nx:2xl:`      | 96rem / 1536px+      | Wide                | No (extended)          |

**Narrow / Standard / Wide are documentation labels, not utilities.** There is no `nx:standard:` class. Contributors use the standard Tailwind class names (`nx:sm:`, `nx:md:`, `nx:lg:`, `nx:xl:`, `nx:2xl:`) in code; the display-class labels exist to anchor design and review conversations.

> **Zoom-vs-rem.** Breakpoints are rem-based, so they fire at the user's **zoom-adjusted threshold** — not pixel-adjusted. A user at 1280px viewport zoomed to 200% triggers Narrow (`nx:md:` matches, `nx:lg:` does not), because their effective root font-size doubled. This is intended accessibility behaviour: zoom is text scaling, and layout should follow text. Designers should test components at 100%, 150%, and 200% browser zoom.

## Decision tree — which responsive mechanism

| Mechanism                             | Use case                                                  | Example                                               |
| ------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| `@container` query                    | Component renders differently based on its parent's width | Card that's full-width in a hero, narrow in a sidebar |
| `nx:lg:` viewport prefix              | Page-shell decisions — nav collapse, side panel hide      | Hide secondary sidebar below `lg`                     |
| `clamp()` (CSS primitive)             | Continuous adaptation of size — type, padding             | `font-size: clamp(1rem, 0.9rem + 0.5vw, 1.5rem)`      |
| `svh` / `lvh` / `dvh` (CSS primitive) | Mobile browser-chrome accommodation                       | Full-screen modal: `min-height: 100dvh`               |

### `container-type` cost policy

Only add `container-type: inline-size` to a component where a **child actually queries the container** via `@container (...)`. Each declaration creates a new formatting context with size containment, and the browser begins tracking that element's dimensions across resizes, scrolls, and animations.

Per MDN and web.dev: no element has size containment by default — you manually register a query container with `container-type` when you need it, precisely so the browser can limit the number of elements it tracks. Applying it indiscriminately reintroduces the per-element tracking cost the property was designed to avoid.

Concrete rule: if you grep your file and find no `@container (...)` rule scoping to the declared container, the `container-type` declaration is dead weight — remove it.

## Canonical pattern in JSX

A forthcoming declarative primitive (see [#103](https://github.com/nexuslabs-ai/nexus/issues/103)) — `<Show>` / `<Hide>` — covers both viewport and container axes:

```tsx
// Viewport (page-shell decisions)
<Show above="lg"><aside>Secondary nav</aside></Show>
<Hide below="md"><span>Tablet-and-up context</span></Hide>

// Container (component-internal — Nexus extension over Atlassian's primitive)
<Show containerAbove="md"><Stat /></Show>
<Hide containerBelow="sm"><Avatar /></Hide>
```

Until that primitive ships, the raw fallback is acceptable but verbose — and easy to invert by mistake.

**Anti-pattern (raw class toggling):**

```tsx
<aside className="nx:hidden nx:lg:block">Secondary nav</aside>
```

**Correct pattern (declarative primitive, when available):**

```tsx
<Show above="lg">
  <aside>Secondary nav</aside>
</Show>
```

Prefer the primitive when it ships. Pick the right axis: `above` / `below` for viewport (page shell), `containerAbove` / `containerBelow` for component-internal — matching the decision tree above.

## Anti-patterns

- **Don't use `nx:sm:` inside component internals.** Use `@container` queries instead. A viewport prefix inside a component leaks page-shell concerns into the component's internal layout — the component then renders inconsistently when dropped into a sidebar vs a hero. The exception is full-viewport overlays; see Viewport-driven exceptions below.
- **Don't use raw `vh` units.** They reflect the largest possible viewport on mobile and overshoot when browser chrome is visible. Use `svh` for sticky elements (smallest viewport — never clipped), `dvh` for full-screen heroes (dynamic — adjusts as chrome shows/hides), and `lvh` for modals (largest — what the user sees fullscreen).
- **Don't write responsive component code that assumes a viewport width.** Components don't know their consumer's page shell. Render decisions should follow the component's parent width (`@container`) or be passed in as props — never inferred from the viewport.

## Viewport-driven exceptions

Most components use `@container` for internal responsive behaviour. **Full-viewport overlay components are exceptions** — Dialog, future Sheet, future FullScreenOverlay — because their responsive trigger is positioning relative to the viewport, not their own container width.

A Dialog at 480px viewport is full-bleed (no rounded corners) because _the viewport is narrow_, not because the Dialog's own container is narrow. Migrating to `@container` would flip the rounded-corner threshold to the Dialog's intrinsic width, producing rounded corners on what's still effectively a full-bleed sheet — wrong UX.

Live example: `packages/react/src/components/ui/dialog.tsx` uses `nx:sm:` at three sites — content rounding (`:135`), header text alignment (`:187`), footer flex direction and gap (`:220`). Each is a positioning concern relative to the viewport, not a container-width concern. Keep them.

For exceptions, use viewport breakpoints (`nx:sm:`, `nx:md:`, etc.) as you normally would.

## Forward direction

Fluid scaling via `clamp()` and dynamic viewport units `svh` / `lvh` / `dvh` are forthcoming as tokens. Components that genuinely need them today should use the CSS primitives directly; Nexus token wrappers will follow.

## See also

- [components.md](components.md) — component-authoring rules; `@container` use in component internals is the responsive corollary of Sizing Convention and Layering model
- `packages/tailwind/nexus.css:236-240` — the emitted `--breakpoint-*` token values
- `packages/react/src/components/ui/dialog.tsx` — the live viewport-driven exception
