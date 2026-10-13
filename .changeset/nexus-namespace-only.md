---
'@nexus_ds/core': minor
'@nexus_ds/react': minor
---

Breaking: Nexus CSS now emits only `nx:` utilities and `--nx-*` variables, so
it leaves the host app's own styles alone.

| Before                                                                        | After                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nexus.css` imports Tailwind with Preflight                                   | Imports Tailwind's theme and utilities only. A new app imports `tailwindcss/preflight.css` itself                                                                          |
| Global `*` border colour, `body` colour and background                        | Removed. Components set their own border colours; put `nx:bg-background nx:text-foreground nx:typography-body-default` on `<body>`                                         |
| 107 unprefixed `--color-*` aliases on `:root`                                 | Removed. Use `--nx-color-*`                                                                                                                                                |
| `:root` / `:root:not(.dark)` `color-scheme`                                   | Only `.dark { color-scheme: dark }`                                                                                                                                        |
| Provider sets `:root { font-size }`                                           | Removed. Nexus type sizes are `--nx-typography-size-*` variables                                                                                                           |
| Provider sets `code, pre { font-size }` and always sets `html` font smoothing | The code size reaches only Nexus classes. Smoothing, pointer cursors and reduce motion apply page-wide only when turned on                                                 |
| Provider and first-paint script write an inline `color-scheme` and a meta tag | Removed, along with `colorScheme` and `metaColorScheme` on `NexusFirstPaintResolution`                                                                                     |
| `TooltipProvider` required                                                    | Optional. Each `Tooltip` works on its own and joins a `TooltipProvider` group when inside one                                                                              |
| `toast` and `Toaster` share sonner's default toaster                          | Use the `nexus` toaster id, so a host Toaster never shows Nexus toasts. `dismiss()`, `getToasts()` and `useSonner` cover only Nexus toasts; `Toaster` no longer takes `id` |
| Keyframes `overlay-presence-exit`, `progress-indeterminate`                   | `nx-overlay-presence-exit`, `nx-progress-indeterminate`                                                                                                                    |

Components that render native elements now reset those elements' browser
defaults themselves, and Dialog and AlertDialog centre without a transform.
