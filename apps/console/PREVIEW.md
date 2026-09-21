# Isolated component preview

`/preview` is the preview foundation for Nexus Console. It offers authored brand
presets and explicit light/dark modes, with real Nexus Button, Dialog and Popover
components. It uses the same documented tokens and public components as the Console.
Custom-color drafts, comparisons, and exports are outside this minimal baseline.

## Accepted result and rendering

The parent owns an in-memory `AcceptedPreview`: appearance state, inspection, and a
monotonic render revision. A brand change calls
`inspectTheme(createNexusThemeContract(state))` once. A mode-only change reuses
that inspection. Rendering follows the existing pure path:

`themeToCss(inspection.theme)` + `appearancePrefsToCss(state.prefs)` →
`createNexusAppearanceSnapshot` → `resolveFirstPaint`.

Only the resolved `NexusFirstPaintResolution` and revision cross the frame
boundary. The full inspection and token catalog stay in the parent. The frame
never calls an appearance provider or independently derives a theme. Applying
appearance updates preserves the scene instance, including an open overlay.
Reset restores the Blue/light defaults and remounts the scene. Navigating away
ends the local preview session; returning starts from the defaults.

## Document isolation

`component-preview.html` has its own React root, package CSS, and preview entry.
Its filename deliberately differs from `/preview`: Vite resolves extensionless
HTML requests before SPA routes, so `preview.html` would shadow the host route. It does not
import the Console router, main entry, or bootstrap. Vite's bootstrap transform
matches the resolved host `index.html` filename, so host deep links still receive
first-paint styling while preview documents never read saved Console preferences.

The preview applies classes, data attributes, color-scheme metadata and runtime
styles to its own document. Runtime theme and preference styles follow package
styles. Nexus overlays portal into the frame's body; focus guards and scroll lock
remain in that document. The named iframe has a token-sized viewport, permits
scrolling, and provides explicit keyboard entry/return controls.

This is trusted-content document/style isolation, not a security sandbox.
Same-origin documents share storage capabilities. The preview therefore does not
read or write localStorage, sessionStorage, or cookies; it contains no persistence
provider. Public `@nexus_ds/react` imports can transitively load inert shared
provider/core definitions. Their presence is not a provider mount or an engine
execution. No arbitrary HTML, executable source, or editable CSS is accepted.

## Connection lifecycle

The protocol is Console-owned and versioned independently of persisted appearance
snapshots. Both ends validate message shapes, the exact source window and origin.
A host connection identifies a frame load; a document ID identifies the particular
preview document. Both accompany every render revision.

1. Host sends `connect`; the document answers `ready`.
2. Host sends its latest accepted `apply` data.
3. The document validates the whole payload, applies appearance, and commits the
   React scene using `flushSync` before answering `applied`.
4. Host accepts acknowledgements/errors only for its current connection, document,
   and requested revision. Old replies cannot make a newer revision ready.
5. `pagehide` reports `unloading`; each iframe load starts a fresh handshake and
   replays the latest result. Listeners and pending timers are removed on unmount.

The sample is not rendered until its first accepted appearance. An eight-second
connection/application timeout, document mutation error, or React root error makes
the preview unavailable and hides potentially partial output. Reload creates a
new frame and sends the same latest accepted result. An engine failure retains the
previous accepted result with an explicit last-successful label. A future exporter
must require the current revision's applied status; message receipt alone is not
render evidence.

## Development, production and checks

Vite builds `index.html` and `component-preview.html`. The router base path and frame URL use
`import.meta.env.BASE_URL`. Root hosting and a non-root `/nexus-console/` deployment
are covered by the browser suite; configure the server to serve `component-preview.html` as
its own document and use the host entry for application deep links. The explicitly
supported deployment bases are root-relative paths (for example `/` or `/lab/`).

- `src/preview/preview.test.ts`: exact inspected CSS, mode reuse, document mutation
  boundary, malformed protocol data, stale/source/origin/document filtering,
  latest-revision acknowledgements, teardown and timeout behavior.
- `e2e/preview.test.ts`: opposite host/preview modes, computed token parity, real
  portals, focus restoration, frame-only scroll lock, frame reload/retry/remount,
  initial waiting and failure states, 390px layouts and enlarged typography in
  both documents, and production entry/base-path behavior.
- Browser instrumentation is installed before preview scripts run. It rejects
  any preview storage/cookie access, independently of before/after host snapshots.
- Existing Console CI collection automatically includes this test file; its path
  filters include Console and all relevant package/build dependencies.

Use `pnpm test:console`, `pnpm --filter @nexus_ds/console typecheck`, and
`pnpm audit:browser-support`. Browser automation uses Chromium, not historical
versions of every supported browser. Preserve the explicit Vite targets and
browser-floor audit. No new package dependency was added.

Implementation references: [Vite 7 multi-page builds](https://v7.vite.dev/guide/build#multi-page-app),
[postMessage source and origin checks](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage),
[React DOM flushSync](https://react.dev/reference/react-dom/flushSync).
