# Nexus docs and Create

The docs application owns `/create`, an interactive playground using public Nexus
components and Core appearance APIs. Article URLs remain unchanged.

## Run and validate

From the repository root:

- `pnpm --filter @nexus_ds/docs dev` — generates the catalog and watches Core sources.
- `pnpm test:create` — builds docs and runs the production-browser playground suite.
- `pnpm test:unit` — includes inspection parity, catalog coverage, gallery coverage,
  appearance/export, protocol and docs generator checks.
- `pnpm --filter @nexus_ds/docs typecheck`
- `pnpm --filter @nexus_ds/docs audit:csp` — after a production build.

## Boundaries

`app/(docs)` owns article chrome. `app/(create)` retains the docs header but omits
article sidebars, footer and floating appearance picker. `app/(preview)` serves
`/create/preview` without docs providers or appearance persistence. Only that
internal, non-indexed route permits same-origin framing in the frame policy.

The docs appearance provider is the shared source of truth across articles and
Create, including surface tone, mode and appearance preferences. The host computes
one accepted preview appearance result. Preview, token runtime values and export consume it. Invalid changes leave the accepted result
intact. Undo affects appearance only; Reset also remounts the active demo. The
optional `nexus-docs-appearance` key persists the shared state. Create no longer
reads or writes its former playground-only storage key. Follow-device mode resolves
consistently in the site, preview and export.

The frame channel validates source, origin, connection, document and revision.
A bounded handshake accommodates hydration after load; acknowledgement follows
successful scene commit, including lazy examples. Failed frames ask visitors to
refresh the page. Portals stay inside the preview document. The borderless preview
sizes to its content; native keyboard navigation moves between documents.

## Adding examples

`app/_create/gallery.ts` lists documented public families in the docs categories.
Each entry has a lazy module in `demos/`. Compound components are demonstrated by
their parent composition. The Appearance entry covers the six appearance UI
families. Provider/hooks/types/internal helpers are not gallery entries.

Update the docs registry when adding a family. Coverage reconciles the registry,
package export paths, story files, demos and generated Inspector evidence. The
production browser suite checks the Examples sampler. Individual component demos
are retained for a separate docs PR; Create does not expose a Components view.
Use local data and existing Nexus components/tokens; demo navigation remains local.

`generate:catalog` uses the authoritative Core generator; browser code imports only
its JSON outputs. Catalog records retain authored/build-default values and source
provenance. Runtime token details separately display the current accepted preview
value. `gallery-evidence.json` is generated from the real demo source, not a second
hand-maintained example. Regenerate and commit it after changing a demo.

The dev wrapper regenerates on Core token/engine/tool changes. Invalid sources
replace data with an error payload instead of presenting a stale catalog. Production
builds fail on invalid sources. Generated catalog payloads are ignored and included
in Turbo build outputs; filesystem/parser tooling never enters browser chunks.

Exports include the appearance configuration, generated light/dark theme CSS,
preference CSS and root attributes/setup guidance. Project generation, theme import,
shuffle/locks and appearance-sharing URLs are deliberately out of scope.

### Token workspace

`/token` hosts the token explorer in the same two-pane layout as `/create`,
with search, token group, value type, and mode filters in the left rail (a Filters
panel on narrow screens). The docs header links to Tokens. It inherits the shared
docs appearance without showing theme-editing controls. Token filters, variants, provenance and browser history
remain available; old `/create?view=tokens` links redirect with their selections.
Token rows expand in place using Nexus accordions, with URL-backed selection and
variant deep links. Create itself contains only the examples canvas.
