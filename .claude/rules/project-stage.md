# Project Stage

This project is **pre-production** — there is no live deployment or real user data. The packages Nexus publishes to npm are the exception: other projects consume them, so their public surface is an API.

## What Is Published

The [`## Releasing` table in CONTRIBUTING.md](../../CONTRIBUTING.md#releasing) decides which packages are published. The published surface is:

- **`@nexus_ds/core`** — the runtime's exported JS/TS API (functions, constants, and types such as `NexusAppearancePrefs`) and the `--nx-*` CSS custom property names it emits.
- **`@nexus_ds/eslint-plugin`** — rule names and rule options.

`@nexus_ds/tailwind` (generated token CSS) and `@nexus_ds/react` (components) are **copy/own**: consumers copy them into their project and own the copy, so a change reaches them only when they copy again. They are not versioned on npm. A consumer-facing rename there — an emitted `--nx-*` name or an `nx:` utility — gets a changeset with a migration note for that package's `CHANGELOG.md`. Internal refactors don't.

## What This Means

- **Published APIs.** A rename or removal on the published surface is a breaking release. Ship it with a tested consumer migration guide and a changeset. While a package is below 1.0, a breaking change uses a `minor` changeset; `major` is only for when the team decides to cut 1.0. Do not assume consuming projects update when Nexus changes. Temporary compatibility aliases require an explicit decision; do not add them by default.
- **Internal refactors.** Rename or restructure unpublished internals directly; avoid unnecessary deprecation layers.
- **No migration safety theater.** Drop columns, swap enum types, rename tables directly. No need for multi-step deprecation flows or dual-write patterns.
- **No feature flags or shims.** Change code in place. Don't preserve old behavior behind toggles.
- **Clean over safe for internals.** If the clean approach and the safe-for-production approach differ for unpublished internals, always pick clean. The published surface follows the **Published APIs** rule above.
