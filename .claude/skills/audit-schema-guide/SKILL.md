---
name: audit-schema-guide
description: Audit the database schema and the layers above it (services, API routes) for design soundness and cross-layer consistency. Use when auditing schema/service/route alignment, checking for denormalization smells, or verifying that DB constraints are mirrored at the boundary.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git:*, gh:*)
  - WebSearch
  - WebFetch
user-invocable: false
---

# Schema Audit

## Purpose

Audit the database schema and the layers above it (services, API routes) without anchoring on a diff. Catches structural smells that line-level review misses — a table whose row noun doesn't match its name, a 1:1 sidecar that should collapse into the parent, identity strings duplicated per row, missing parent tables, FK direction inversions, and implementation drift between schema constraints and the zod / service code that should mirror them.

## When to Use

- On-demand by the operator (`/audit-schema`) for a structural sanity check.
- After any large schema change to verify the design held end-to-end.
- Before greenlighting a feature that introduces a new entity.

## Base Rules

Always load and check the schema/service/route surface against:

| Rule                                                                     | Purpose                                                                                   |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| [code-quality.md](../../rules/code-quality.md)                           | Governing principle: favor simplicity over cleverness; entity model must read clean       |
| [parse-dont-narrow.md](../../rules/parse-dont-narrow.md)                 | Boundary inputs must go through zod, not hand-rolled `typeof` guards or `as` casts        |
| [dont-duplicate-validation.md](../../rules/dont-duplicate-validation.md) | Once FK / zod / caller contract enforces an invariant, services must not re-validate      |
| [ripple-effect.md](../../rules/ripple-effect.md)                         | A change isn't done until callers / callees / adjacent code are as clean as a fresh write |
| [project-stage.md](../../rules/project-stage.md)                         | Pre-production: no migration shims; restructure in place                                  |
| [code-comments.md](../../rules/code-comments.md)                         | Comments must justify their existence; flag rationale blocks on obvious code              |

## Audit Process

1. **Read the inputs end-to-end.** Schema (`packages/db/src/schema.ts`), custom SQL (`packages/db/drizzle/0001_custom-sql.sql`), seed data (`0002_seed-reference-data.sql`). For implementation lane: also routes (`apps/api/src/routes/**/*.ts`) and services (`packages/core/src/services/**/*.ts`).

2. **Ignore open PRs and recent diffs.** The point of this audit is to read the surface as if you opened it for the first time today. Don't anchor on what changed; anchor on what _should_ be true.

3. **Apply your lens.** Architect lane scrutinizes design; SDE2 lane scrutinizes implementation consistency. Stay in your lane — see "Agent-Specific Focus" below.

4. **Document findings.** Use the output format below. Reference `file:line`. Distinguish blocking vs minor.

## Output Format

The template below **is the entire report body**. There is no preamble paragraph, no trailing summary, no "Findings" / "Observations" / "Notes" sections, and no numbered prose lists. If a concern needs more than the Issues row, it goes in `Architectural Concerns` — subject to the cap.

```markdown
## {Agent Name} Audit — Verdict: {VERDICT}

### Issues

| #   | Severity    | Where                     | Issue                 | Recommendation               |
| --- | ----------- | ------------------------- | --------------------- | ---------------------------- |
| 1   | ❌ Blocking | `schema.ts:860`           | {concise description} | {only if fix is non-obvious} |
| 2   | ⚠️ Minor    | `routes/questions.ts:172` | {concise description} | {only if fix is non-obvious} |

### Architectural Concerns

{Only include for genuine design-level issues where the fix isn't obvious.
Use: **{Concern title}** (`file.ts:line`) — 1–2 sentences max. Omit section if none.}
```

**Rules:**

- Omit `Architectural Concerns` section entirely if there are none.
- Omit `Issues` table entirely if there are no issues (verdict will be `APPROVED`).
- `Where` column: `file_path:line_number`. Relative paths from repo root.
- `Recommendation` column: only populate when the fix isn't obvious from the description.
- **No preamble or trailing paragraph.** The verdict line is the only body prose above the Issues table.
- **No "Findings", "Observations", "Notes", "What's done well" sections** — banned regardless of heading.
- **No praise.** "Cleanly normalized", "sound FK plumbing" — cut all of it. The verdict signals quality.
- **No numbered prose concern lists in the body.** Three concerns = three rows in `Issues` or three entries in `Architectural Concerns`.

## Writing Style Caps

Caps apply to every output — Issues table rows, Architectural Concerns entries:

- **Issue table "Issue" column:** ≤15 words. A phrase, not a paragraph.
- **Issue table "Recommendation" column:** ≤20 words. One specific direction, not "or consider X, Y, Z".
- **Architectural Concerns entry:** ≤2 sentences. No alternative-path discussion; pick one direction.
- **Plain language.** No history narration, no design-rationale prose, no jargon.

If a finding doesn't fit these caps, it's usually two findings — split it. If it doesn't fit even split, it belongs in `Architectural Concerns`.

**Self-check before returning:** re-read your own report body. If any paragraph is longer than two sentences, or any row's note exceeds the cap, cut or split it.

## Returning Findings

**Do NOT print the report yourself.** The calling command consolidates both agents' reports into one unified output.

Return your findings in this structured format so the caller can consolidate:

```
REVIEW_BODY:
{your audit body using the output format above}

VERDICT: APPROVED | NEEDS DISCUSSION | MINOR CHANGES | CHANGES REQUIRED
```

## Verdict Options

| Agent                   | Verdicts                                           | When to Use          |
| ----------------------- | -------------------------------------------------- | -------------------- |
| **Principal Architect** | `APPROVED`, `NEEDS DISCUSSION`, `CHANGES REQUIRED` | Design audit         |
| **SDE2**                | `APPROVED`, `MINOR CHANGES`, `CHANGES REQUIRED`    | Implementation audit |

### Verdict Guidelines

| Condition                                                                                               | Verdict                               |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| No issues found                                                                                         | `APPROVED`                            |
| Minor preferences only (typos in CHECK messages, missing index off the hot path)                        | `MINOR CHANGES` or `NEEDS DISCUSSION` |
| Denormalization smells, FK direction errors, schema↔layer drift, missing constraints on real invariants | `CHANGES REQUIRED`                    |

## Agent-Specific Focus

Each agent applies their own lens when using this skill. Full prompts (with explicit "Out of scope" sections) live in the calling command.

### Principal Architect Focus

- Domain-model fit: does each table's name describe what one row represents?
- 1:1 sidecars (FK + UNIQUE on the same column) that should collapse into the parent.
- Denormalization smells: identity strings duplicated across rows that should live on a parent.
- FK direction: does the relationship arrow point the natural way?
- Missing parent tables: a noun the system clearly has, but no row of its own.
- Identifier choices: PK type (uuid vs serial vs composite) matches how this row gets referenced from URLs, FKs, CLI args.
- API contract shape that hints at a missing entity (e.g., separate `/papers` + `/books` routes hint at a missing parent).

### SDE2 Focus

- Schema-level: CHECK / UNIQUE / FK constraints adequate for the invariants the table claims; index coverage right for the access patterns; FK ON DELETE actions correct (RESTRICT vs CASCADE); RLS policies match tenancy semantics.
- 0001_custom-sql drift: triggers and functions still reference current column names and types in `schema.ts`.
- Schema↔route drift: route zod body schemas reflect DB constraints; FK columns validated for existence; partial UNIQUEs surfaced as ConflictError; `parse-dont-narrow.md` followed at boundaries.
- Schema↔service drift: services don't re-validate what FK / zod / caller contract already enforces (`dont-duplicate-validation.md`); inputs parsed at the boundary, not narrowed.

See agent files for detailed focus areas and checklists.

## Audit Principles

1. **Be honest.** Read the surface as if you didn't write it. The audit's value is its independence from intent.
2. **Be specific.** `file:line` references; concrete recommendations.
3. **Be in your lane.** Architect = design; SDE2 = implementation. Overlap dilutes both.
4. **Ignore the diff.** This is a structural audit, not a PR review. The point is what the code _should_ look like, not how it changed.
5. **No deferral framing.** Anything worth flagging is fixable. Do not recommend deferring to a follow-up unless you cite an existing tracked issue. See `.claude/rules/no-follow-up-deferral.md`.
