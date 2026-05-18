# Schema Audit

Cross-layer audit of the database schema and the code that depends on it. Two agents run in parallel — design lens and implementation lens — and their findings are consolidated into one unified report printed to stdout.

## Agents Used

| Agent                                                   | Skill                                                       | Perspective                                                                             |
| ------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [Principal Architect](../agents/principal-architect.md) | [audit-schema-guide](../skills/audit-schema-guide/SKILL.md) | Design — domain-model fit, 1:1 sidecars, denormalization, FK direction, missing parents |
| [SDE2](../agents/sde2.md)                               | [audit-schema-guide](../skills/audit-schema-guide/SKILL.md) | Implementation — constraints, indexes, RLS, 0001 drift, schema↔route/service drift      |

## Required Input

None. The command runs against the current working tree.

```
Examples:
  /audit-schema
```

---

## Phase 1: Discover

1. **Read the database surface end-to-end:**
   - `packages/db/src/schema.ts`
   - `packages/db/drizzle/0001_custom-sql.sql`
   - `packages/db/drizzle/0002_seed-reference-data.sql`

2. **Glob the layers above for SDE2's lane:**

   ```bash
   # All API route files
   apps/api/src/routes/**/*.ts

   # All service files (recursive — covers nested modules like extraction-drafts/)
   packages/core/src/services/**/*.ts
   ```

3. **Build a brief entity inventory** — one line per table — to anchor both agents on a shared vocabulary:

   ```
   table_name | row_noun (one row represents...) | key_columns | FKs | RLS
   -----------+----------------------------------+-------------+-----+-----
   sources    | one paper / book / origin tag    | (id, sourceType) | questions.sourceId → sources.id | sources_select (authenticated read)
   ```

   Keep it brief. The agents read the schema themselves; this is just shared vocabulary for the report.

## Phase 2: Spawn Both Agents in Parallel

**IMPORTANT: Spawn both agents simultaneously using the Agent tool. Do NOT execute the audits yourself and do NOT wait for one to finish before spawning the other.**

Each agent has a distinct focus lane — keep to it to avoid duplicate findings.

```
// Spawn both at the same time:

Agent(
  subagent_type: "principal-architect",
  description: "Design audit of schema",
  prompt: """
  Audit the database schema for design soundness.

  ## Files to read
  - packages/db/src/schema.ts (full)
  - packages/db/drizzle/0001_custom-sql.sql
  - packages/db/drizzle/0002_seed-reference-data.sql

  ## Entity inventory (precomputed)
  {entity_inventory}

  ## Your Focus (ONLY these areas — do not overlap with SDE2)
  - Domain-model fit: does each table's name describe what one row represents?
  - 1:1 sidecars (FK + UNIQUE on the same column) that should collapse into the parent.
  - Denormalization smells: identity strings duplicated across rows that should live on a parent.
  - FK direction: does the relationship arrow point the natural way?
  - Missing parent tables: a noun the system clearly has, but no row of its own.
  - Identifier choices: PK type (uuid vs serial vs composite) matches how this row gets referenced from URLs, FKs, CLI args.
  - API contract shape that hints at a missing entity (e.g., separate /papers + /books routes hint at a missing /sources parent).

  ## Out of Scope for You
  Do NOT flag: constraint adequacy, index coverage, FK ON DELETE actions, RLS policies, drift between schema.ts and 0001, drift between schema and zod / service code. Those are SDE2's lane.

  ## Method
  - Ignore any open PRs or recent diffs.
  - Read schema.ts as if you opened it for the first time today.
  - For each table: ask "does the row noun match the table name?". If no, that's a finding.

  ## Output Caps (strict — see audit-schema-guide skill for full rules)
  - **Issue row "Issue" column ≤15 words; "Recommendation" ≤20 words.**
  - **Architectural Concerns entry ≤2 sentences.** No alternative-path discussion; pick one direction.
  - **No preamble, no trailing summary, no praise, no numbered prose lists.**
  - **Self-check:** re-read your report body. Any paragraph >2 sentences → cut or split.

  ## Instructions
  1. Read .claude/skills/audit-schema-guide/SKILL.md for full output format and verdict rules.
  2. Focus exclusively on your lane above.
  3. Output report following the audit-schema-guide skill's format AND the output caps above.
  4. Return REVIEW_BODY + VERDICT in the structured format — DO NOT print to stdout.
  """
)

Agent(
  subagent_type: "sde2",
  description: "Implementation audit of schema, services, routes",
  prompt: """
  Audit implementation consistency between schema, services, and API routes.

  ## Files to read
  - packages/db/src/schema.ts (full)
  - packages/db/drizzle/0001_custom-sql.sql
  - apps/api/src/routes/**/*.ts (see file list below)
  - packages/core/src/services/**/*.ts (see file list below, recursive)

  ## Route files
  {route_file_list}

  ## Service files
  {service_file_list}

  ## Entity inventory (precomputed)
  {entity_inventory}

  ## Your Focus (ONLY these areas — do not overlap with Architect)
  - Schema constraints: CHECK / UNIQUE / FK adequate for the invariants the table claims? Index coverage right for the access patterns? FK ON DELETE actions correct (RESTRICT vs CASCADE)?
  - RLS policies: match the row's tenancy semantics? Or rely on a route-level check that contradicts them?
  - 0001_custom-sql drift: do triggers / functions still reference current column names and types in schema.ts? Has any column been renamed or dropped without updating 0001?
  - Schema↔route drift: does each route's zod body schema reflect DB constraints? FK columns validated for existence? Partial UNIQUEs surfaced as ConflictError? `parse-dont-narrow.md` followed at boundaries?
  - Schema↔service drift: do services re-validate what FK / zod / caller contract already enforces (`dont-duplicate-validation.md`)? Defensive throws for caller-gated invariants?

  ## Out of Scope for You
  Do NOT flag: whether the schema design itself is right (assume given). Do NOT propose new tables or restructurings. Those are Architect's lane.

  ## Method
  - For each table: list its constraints (CHECK / UNIQUE / FK / indexes / RLS).
  - For each route or service that touches that table: verify the layer above mirrors or respects those constraints.
  - 0001 drift check: open 0001_custom-sql.sql and verify every column reference exists in schema.ts with the expected type.

  ## Output Caps (strict — see audit-schema-guide skill for full rules)
  - **Issue row "Issue" column ≤15 words; "Recommendation" ≤20 words.**
  - **Architectural Concerns entry ≤2 sentences.**
  - **No preamble, no trailing summary, no praise, no numbered prose lists.**
  - **Self-check:** re-read your report body. Any paragraph >2 sentences → cut or split.

  ## Instructions
  1. Read .claude/skills/audit-schema-guide/SKILL.md for full output format and verdict rules.
  2. Focus exclusively on your lane above.
  3. Output report following the audit-schema-guide skill's format AND the output caps above.
  4. Return REVIEW_BODY + VERDICT in the structured format — DO NOT print to stdout.
  """
)
```

Wait for both to return, then proceed to Phase 3.

## Phase 3: Consolidate

1. Collect findings from both agents:

   ```
   architect_review_body, architect_verdict
   sde2_review_body,      sde2_verdict
   ```

2. **Dedupe** — if both agents flagged the same `file:line`, keep the architect's entry if it's design-level, drop the duplicate from sde2's table. Genuine cross-lane overlap is rare.

3. **Categorize**:
   - Architect's `Issues` table → "Design findings" section.
   - SDE2's `Issues` table → "Implementation findings" section.
   - Architect's `Architectural Concerns` subsection stays in its own section.

## Phase 4: Print Unified Report

Print to stdout. No GitHub posting, no file write, no scheduling.

```markdown
## Schema Audit — {YYYY-MM-DD}

**Principal Architect:** {architect_verdict}
**SDE2:** {sde2_verdict}

### Design findings (Principal Architect)

{architect's Issues table, or "No design findings." if empty}

### Implementation findings (SDE2)

{sde2's Issues table, or "No implementation findings." if empty}

### Architectural Concerns

{architect's Architectural Concerns subsection, or omit section entirely if empty}
```

---

## Audit Principles

1. **Be honest.** Read the surface as if you didn't write it. The audit's value is its independence from intent.
2. **Be specific.** `file:line` references; concrete recommendations.
3. **Be in your lane.** Architect = design; SDE2 = implementation. Overlap dilutes both.
4. **Ignore the diff.** This is a structural audit, not a PR review. The point is what the code _should_ look like, not how it changed.
5. **No deferral framing.** Anything worth flagging is fixable. Do not recommend deferring to a follow-up unless you cite an existing tracked issue. See `.claude/rules/no-follow-up-deferral.md`.
