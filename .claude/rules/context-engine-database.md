# Context Engine Database Rules

> Database patterns for Context Engine: Drizzle ORM, PostgreSQL, pgvector.
> For high-level architecture, see: [context-engine.md](context-engine.md)

## Core Principles

1. **Schema is source of truth** — All database structure lives in Drizzle schema, not raw SQL
2. **Multi-tenant by default** — Every query must be scoped to `orgId`
3. **Explicit over magic** — Prefer generated columns over triggers, native types over custom SQL
4. **Index intentionally** — Every index should have a documented query pattern it serves
5. **Migrations are immutable** — Never edit a migration after it's been applied

## Schema Design

### Column Type Selection

| Use Case          | Drizzle Type                       | Notes                                   |
| ----------------- | ---------------------------------- | --------------------------------------- |
| Primary keys      | `uuid().defaultRandom()`           | UUIDs for distributed systems           |
| Foreign keys      | `uuid().references()`              | Always define `onDelete` behavior       |
| JSON data         | `jsonb().$type<T>()`               | Type-safe JSONB with inference          |
| Vector embeddings | `vector({ dimensions: N })`        | Native pgvector support                 |
| Full-text search  | `tsvector` + `generatedAlwaysAs()` | Auto-computed, no triggers              |
| Timestamps        | `timestamp().defaultNow()`         | Always include `createdAt`, `updatedAt` |
| Enums             | `varchar().$type<Union>()`         | Prefer union types over PG enums        |

### Generated Columns Over Triggers

| Prefer                          | Avoid                               |
| ------------------------------- | ----------------------------------- |
| `generatedAlwaysAs(sql`...`)`   | `CREATE TRIGGER` in setup scripts   |
| Schema-defined computed columns | External SQL files for column logic |
| Drizzle-managed indexes         | Raw `CREATE INDEX` statements       |

**Why:** Generated columns are declarative, version-controlled, and Drizzle-aware.

### Multi-Tenant Isolation

| Rule                                   | Rationale                          |
| -------------------------------------- | ---------------------------------- |
| Every table with user data has `orgId` | Prevents cross-tenant data leakage |
| All queries filter by `orgId` first    | Index efficiency + security        |
| Foreign keys reference within org      | Logical data boundaries            |
| Composite indexes start with `orgId`   | Query planner optimization         |

## Index Strategy

### Index Naming Convention

```
{table}_{columns}_{type}_idx

Examples:
- components_org_id_idx (single column)
- components_org_slug_idx (composite, unique)
- embedding_chunks_embedding_hnsw_idx (vector index)
- components_search_vector_idx (GIN index)
```

### Index Type Selection

| Query Pattern      | Index Type       | Drizzle Syntax                                |
| ------------------ | ---------------- | --------------------------------------------- |
| Equality lookups   | B-tree (default) | `index().on(column)`                          |
| Unique constraints | B-tree unique    | `uniqueIndex().on(columns)`                   |
| Vector similarity  | HNSW             | `.using('hnsw', col.op('vector_cosine_ops'))` |
| Full-text search   | GIN              | `.using('gin', column)`                       |
| JSONB containment  | GIN              | `.using('gin', column)`                       |

### HNSW Index Parameters

| Parameter         | Default | Tune When                                      |
| ----------------- | ------- | ---------------------------------------------- |
| `m`               | 16      | Higher for better recall, more memory          |
| `ef_construction` | 64      | Higher for better index quality, slower builds |

## Query Patterns

### Repository Method Structure

| Method Type      | Returns     | Error Handling                    |
| ---------------- | ----------- | --------------------------------- |
| `getById`        | `T \| null` | Return null for not found         |
| `getByIdOrThrow` | `T`         | Throw specific error if not found |
| `list`           | `T[]`       | Empty array if none found         |
| `create`         | `T`         | Throw on constraint violation     |
| `update`         | `T \| null` | Return null if not found          |
| `delete`         | `boolean`   | Return false if not found         |

### Batch Operations

| Prefer                          | Avoid                        |
| ------------------------------- | ---------------------------- |
| Single `insert().values([...])` | Loop with individual inserts |
| `inArray()` for bulk lookups    | N+1 query patterns           |
| Transactions for related writes | Multiple independent writes  |

### JSONB Queries

| Operation      | Drizzle Pattern                 |
| -------------- | ------------------------------- |
| Extract text   | `sql\`${col}->>'key'\``         |
| Extract object | `sql\`${col}->'key'\``          |
| Deep path      | `sql\`${col}->'a'->'b'->>'c'\`` |
| Contains       | `sql\`${col} @> ${json}\``      |

## pgvector Patterns

### Distance Functions

| Function         | Use Case                         | Index Ops           |
| ---------------- | -------------------------------- | ------------------- |
| `cosineDistance` | Semantic similarity (normalized) | `vector_cosine_ops` |
| `l2Distance`     | Euclidean distance               | `vector_l2_ops`     |
| `innerProduct`   | Dot product similarity           | `vector_ip_ops`     |

### Vector Search Rules

| Rule                                | Rationale                         |
| ----------------------------------- | --------------------------------- |
| Order by distance function directly | Ensures HNSW index usage          |
| Don't wrap distance in expressions  | `1 - cosineDistance` breaks index |
| Filter before vector search         | Reduces search space              |
| Limit results at query level        | Don't fetch all then slice        |

### Embedding Column Design

| Decision   | Recommendation                          |
| ---------- | --------------------------------------- |
| Dimensions | Match your embedding model exactly      |
| Nullable   | Yes, for pending embeddings             |
| Index      | HNSW for approximate NN, none for exact |

## Migration Patterns

### Safe Migration Rules

| Safe                   | Unsafe                           |
| ---------------------- | -------------------------------- |
| Add nullable column    | Add non-nullable without default |
| Add index concurrently | Drop column with data            |
| Add table              | Rename column (breaks queries)   |
| Add default value      | Change column type               |

### Migration Workflow

1. Generate migration with `drizzle-kit generate`
2. Review generated SQL before applying
3. Test on local database first
4. Apply with `drizzle-kit migrate`
5. Never edit applied migrations

## Anti-Patterns

- Queries without `orgId` filter (security risk)
- Raw SQL for operations Drizzle supports natively
- Triggers when generated columns work
- Missing indexes on frequently filtered columns
- N+1 queries in loops
- Storing computed data that could be generated
- Using `any` to bypass Drizzle types
- Circular foreign key references

## Do Not

- Query across organization boundaries
- Use raw SQL for vector operations (use Drizzle's `cosineDistance`)
- Create indexes without knowing the query pattern
- Edit migrations after they're applied
- Store embeddings without tracking the model version
- Use triggers for computed columns (use `generatedAlwaysAs`)
