# Project Stage

This project is **pre-production** — there is no live deployment, no real user data, and no external consumers.

## What This Means

- **No backward compatibility.** Delete, rename, or restructure anything freely. Never deprecate — just remove.
- **No migration safety theater.** Drop columns, swap enum types, rename tables directly. No need for multi-step deprecation flows or dual-write patterns.
- **No feature flags or shims.** Change code in place. Don't preserve old behavior behind toggles.
- **Clean over safe.** If the clean approach and the safe-for-production approach differ, always pick clean.

## Database Migrations

Every environment — local dev, CI, and remote Supabase — resets from scratch via `make db-reset`. There is no incremental migration path to maintain.

### Three migration files only

| File                           | Contents                                                               | How it's maintained                                     |
| ------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| `0000_baseline.sql`            | All DDL (enums, tables, FKs, indexes, RLS policies, CHECK constraints) | Auto-generated: `drizzle-kit generate` from `schema.ts` |
| `0001_custom-sql.sql`          | PL/pgSQL functions, triggers, REVOKE/GRANT                             | Hand-maintained: edit in place                          |
| `0002_seed-reference-data.sql` | Taxonomy, exam configs, marking schemes                                | Hand-maintained: edit in place                          |

### When you change the schema

1. Edit `schema.ts` (the single source of truth for DDL)
2. Delete `0000_baseline.sql` and `meta/0000_snapshot.json`
3. Run `drizzle-kit generate` — it produces a fresh baseline + a fresh `meta/0000_snapshot.json`
4. Copy the new `meta/0000_snapshot.json` over `meta/0001_snapshot.json` and `meta/0002_snapshot.json` so all three snapshots stay byte-identical (the journal still indexes 0/1/2; missing snapshot files break the next `drizzle-kit generate` diff)
5. If the change requires new functions/triggers/grants, edit `0001_custom-sql.sql` in place
6. If the change requires new reference data, edit `0002_seed-reference-data.sql` in place
7. Run `make db-reset` to verify

**Never create a new migration file.** Edit the existing three in place. The migration count must stay at three until the project reaches production.
