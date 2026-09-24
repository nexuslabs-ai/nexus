# Project Stage

This project is **pre-production** — there is no live deployment, no real user data, and no external consumers.

## What This Means

- **No backward compatibility.** Delete, rename, or restructure anything freely. Never deprecate — just remove.
- **No migration safety theater.** Drop columns, swap enum types, rename tables directly. No need for multi-step deprecation flows or dual-write patterns.
- **No feature flags or shims.** Change code in place. Don't preserve old behavior behind toggles.
- **Clean over safe.** If the clean approach and the safe-for-production approach differ, always pick clean.
