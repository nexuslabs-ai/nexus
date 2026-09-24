# Project Stage

This project is **pre-production** — there is no live deployment, no real user data, but published tokens are consumed by Examlly.

## What This Means

- **Published token APIs.** Coordinate token renames with a tested consumer migration and a documented breaking release. Do not assume Examlly updates when Nexus changes. Temporary compatibility aliases require an explicit decision; do not add them by default.
- **Internal refactors.** Rename or restructure unpublished internals directly; avoid unnecessary deprecation layers.
- **No migration safety theater.** Drop columns, swap enum types, rename tables directly. No need for multi-step deprecation flows or dual-write patterns.
- **No feature flags or shims.** Change code in place. Don't preserve old behavior behind toggles.
- **Clean over safe.** If the clean approach and the safe-for-production approach differ, always pick clean.
