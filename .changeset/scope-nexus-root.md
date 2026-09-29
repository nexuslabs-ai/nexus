---
'@nexus_ds/core': minor
'@nexus_ds/tailwind': minor
'@nexus_ds/react': minor
'@nexus_ds/eslint-plugin': minor
---

Scope Nexus styling and appearance to a root element, so Nexus can sit inside an existing app without touching it.

Breaking:

- Nexus applies only inside an element marked `data-nexus-root`. The mode and setting attributes are `data-nx-mode`, `data-nx-density`, `data-nx-radius`, `data-nx-shadow` and `data-nx-borderwidth`; the `.dark` class and the unprefixed `data-density` / `data-radius` / `data-shadow` / `data-borderwidth` attributes no longer do anything.
- `@nexus_ds/tailwind` no longer declares the unprefixed `--color-*` aliases on `:root`, no longer styles `*`, `body` or `:root`, and ships no Preflight: the host loads Tailwind 4 Preflight. Colour utilities read `var(--nx-color-X, var(--nx-default-color-X))`, with light and dark defaults declared on the root.
- `themeToCss(derived, scope)` and `appearancePrefsToCss(prefs, scope)` take the root selector and emit into `@layer base`. `resolveFirstPaint`, `NEXUS_APPEARANCE_DATA_ATTRS` and `NexusFirstPaintResolution` are removed; use `nexusRootAttributes`, `nexusRootScope`, `NEXUS_ROOT_ATTRIBUTES` and `deriveNexusAppearanceCss`. `SNAPSHOT_VERSION` is 8, so stored snapshots written for `:root` are re-derived.
- `NexusAppearanceProvider` is standalone only: its root is `<html>`, it is uncontrolled (the `state` prop and `reset` are removed), and on unmount it removes only the root attributes it added. `NexusResolvedAppearanceMode` is replaced by core's `NexusResolvedMode`.
- `SidebarProvider` writes a cookie only when given `cookieName`.
- `@nexus_ds/tailwind` has no `nx:dark:` variant; semantic tokens already carry their dark value. Theme values that read a runtime variable (colour, radius, easing, shadow, border width, default transition) are `@theme inline reference`, so utilities read the runtime variable directly and nothing is declared on `:root`.
- The eslint plugin no longer allows a bare `dark` class.

New: `NexusRoot` (from `@nexus_ds/react/appearance`) scopes Nexus to its subtree from a host-resolved appearance and writes nothing outside itself. Overlays carry the nearest root into their portals, and `useNexusRootAttributes` (also from `@nexus_ds/react/appearance`) lets your own portals do the same. `NexusAppearanceProvider` takes a `nonce` for its injected styles, and the bootstrap script gives its styles its own nonce. A root's preference rules stop at nested roots. Embedded roots no longer set the page's `rem`: `uiFontSize` applies to the root's text, not to `rem`-based sizes.
