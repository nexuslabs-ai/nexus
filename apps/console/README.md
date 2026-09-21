# Nexus Console

A minimal, account-free token explorer built with documented Nexus components
and tokens. Conceptual explanations and component guidance belong in Nexus docs
and Storybook.

## Routes

- `/` opens `/explore`.
- `/explore` provides the complete searchable catalog, logical token groups,
  mode variants, aliases, generated CSS, source provenance, and runtime inspection.
- `/preview` runs real Button, Dialog, and Popover components in an isolated
  document with brand presets, light/dark mode, reset, and recovery.
- `/settings/appearance` changes the saved Console interface preferences.

Retired business, learning, and reference URLs show a page-not-found screen with
an operable return to the explorer. The shared Sidebar supports narrow screens;
page headings receive focus and set the document title. Labels have an 8px gap
to fields using the Nexus spacing token.

Catalog values and engine evidence describe build defaults; changing Console
appearance changes the interface, not those values. Catalog and trace data load
separately. See [token catalog architecture](../../packages/core/docs/token-catalog.md)
for coverage, generation, source refresh, and provenance boundaries.

## Development and validation

Run `pnpm console` from the repository root. Run `pnpm test:console` for the
production build and browser tests, and `pnpm --filter @nexus_ds/console typecheck`.
Unit tests cover catalog grouping, appearance/bootstrap, and browser boundaries.
The browser suite covers deep links, filtering, aliases, empty/missing records,
keyboard use, narrow layouts, enlarged text, and development catalog refresh.

## Removed application

`migration-inventory.json` records the disposition of every original Console
source file and mock worker at baseline `22edcb96d23d3361f45a35aead48866cd7464110`.
The mock business/auth app, API fixtures, worker, learning chapters, and duplicate
reference screens are absent. The shared appearance provider remains; its Sonner
peer dependency is retained. No accounts or business API requests are required.

See [preview isolation](PREVIEW.md) for the message contract and browser coverage.
Preview appearance is local to the page and never changes saved Console settings.
