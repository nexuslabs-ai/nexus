# Context Engine API Rules

> API patterns for Context Engine: Hono framework, MCP protocol, endpoint design.
> For high-level architecture, see: [context-engine.md](context-engine.md)

## Core Principles

1. **AI consumers first** — Responses must be easy for AI assistants to parse and use
2. **Multi-tenant isolation** — Every request is scoped to an organization
3. **Fail with guidance** — Errors should help AI recover, not just report failure
4. **Consistent contracts** — Same patterns across all endpoints
5. **Stateless handlers** — No request-to-request state in handlers

## Response Design for AI Consumers

### Response Structure

| Aspect               | Guideline                                        |
| -------------------- | ------------------------------------------------ |
| **Flat over nested** | AI parses shallow structures more reliably       |
| **Explicit nulls**   | Return `null` not missing keys for absent values |
| **Typed arrays**     | Empty array `[]` not `null` for no results       |
| **String IDs**       | UUIDs as strings, not objects                    |
| **ISO timestamps**   | `2025-01-15T10:00:00Z` format                    |

### Success Response Pattern

| Field     | Required | Purpose                       |
| --------- | -------- | ----------------------------- |
| `success` | Yes      | Discriminator for result type |
| `data`    | Yes      | The actual payload            |
| `meta`    | Optional | Pagination, counts, hints     |

### Error Response Pattern

| Field           | Required | Purpose                         |
| --------------- | -------- | ------------------------------- |
| `success`       | Yes      | Always `false` for errors       |
| `error.code`    | Yes      | Machine-readable error code     |
| `error.message` | Yes      | Human/AI-readable explanation   |
| `error.details` | Optional | Additional context for recovery |

### Error Codes

| Code Pattern       | When to Use                  |
| ------------------ | ---------------------------- |
| `NOT_FOUND`        | Resource doesn't exist       |
| `VALIDATION_ERROR` | Invalid input data           |
| `UNAUTHORIZED`     | Missing or invalid auth      |
| `FORBIDDEN`        | Valid auth but no permission |
| `CONFLICT`         | Resource state conflict      |
| `RATE_LIMITED`     | Too many requests            |
| `INTERNAL_ERROR`   | Unexpected server error      |

## Endpoint Design

### URL Structure

```
/v1/{resource}           # Collection
/v1/{resource}/:id       # Single item
/v1/{resource}/:id/{sub} # Nested resource
```

### HTTP Method Semantics

| Method | Use              | Idempotent | Response              |
| ------ | ---------------- | ---------- | --------------------- |
| GET    | Read resource(s) | Yes        | 200 with data         |
| POST   | Create resource  | No         | 201 with created item |
| PUT    | Full replace     | Yes        | 200 with updated item |
| PATCH  | Partial update   | Yes        | 200 with updated item |
| DELETE | Remove resource  | Yes        | 204 no content        |

### Query Parameters

| Parameter  | Convention                    | Example               |
| ---------- | ----------------------------- | --------------------- |
| Pagination | `limit`, `offset` or `cursor` | `?limit=10&offset=20` |
| Filtering  | Field name directly           | `?framework=react`    |
| Sorting    | `sort` with direction         | `?sort=-createdAt`    |
| Search     | `q` for full-text             | `?q=button`           |
| Inclusion  | `include` for relations       | `?include=chunks`     |

## Handler Patterns

### Handler Structure

| Step                        | Purpose                       |
| --------------------------- | ----------------------------- |
| 1. Extract & validate input | Parse params, query, body     |
| 2. Authenticate & authorize | Verify org access             |
| 3. Execute business logic   | Call repository/service       |
| 4. Transform response       | Shape data for AI consumption |
| 5. Return with status       | Appropriate HTTP status       |

### Input Validation

| Validate               | At Layer                    |
| ---------------------- | --------------------------- |
| Types, required fields | Zod schema at handler entry |
| Business rules         | Service/repository layer    |
| Authorization          | Middleware or handler start |

### Error Handling

| Error Type       | Handler Behavior           |
| ---------------- | -------------------------- |
| Validation error | 400 with field details     |
| Not found        | 404 with resource hint     |
| Auth error       | 401/403 with recovery hint |
| Service error    | 500 with correlation ID    |

## Multi-Tenant Patterns

### Organization Scoping

| Rule                  | Implementation                              |
| --------------------- | ------------------------------------------- |
| Extract org from auth | Middleware sets `c.var.orgId`               |
| Pass to all queries   | Every repository call includes `orgId`      |
| Validate ownership    | Check resource belongs to org before access |
| Never trust client    | Org comes from auth token, not request      |

### Authorization Flow

```
Request → Auth Middleware → Extract Org → Validate Access → Handler
                ↓
            Reject if invalid
```

## MCP Protocol Patterns

### MCP Response Design

| Aspect                   | Guideline                                    |
| ------------------------ | -------------------------------------------- |
| **Context completeness** | Include everything AI needs to generate code |
| **Props with types**     | Full type info for each prop                 |
| **Examples included**    | Real usage examples, not synthetic           |
| **Patterns explicit**    | When to use, when not to use                 |

### Search Response Quality

| Include         | Purpose                    |
| --------------- | -------------------------- |
| Component name  | Identification             |
| Description     | What it does               |
| Props summary   | Quick reference            |
| Score/relevance | Help AI rank results       |
| Usage hint      | When to use this component |

## Middleware Patterns

### Middleware Order

| Order | Middleware     | Purpose                     |
| ----- | -------------- | --------------------------- |
| 1     | Request ID     | Correlation for logging     |
| 2     | Logger         | Request/response logging    |
| 3     | Error handler  | Catch and format errors     |
| 4     | Auth           | Validate token, extract org |
| 5     | Rate limiter   | Protect against abuse       |
| 6     | Route handlers | Business logic              |

### Cross-Cutting Concerns

| Concern    | Handle Via                   |
| ---------- | ---------------------------- |
| Logging    | Middleware + structured logs |
| Errors     | Global error handler         |
| Validation | Zod + validation middleware  |
| Auth       | Auth middleware              |
| CORS       | CORS middleware              |

## Performance Patterns

### Response Optimization

| Pattern         | When                                   |
| --------------- | -------------------------------------- |
| Pagination      | List endpoints with >20 items          |
| Field selection | Large resources with optional fields   |
| Caching headers | Stable resources (ETag, Cache-Control) |
| Compression     | Responses >1KB                         |

### Database Query Optimization

| Pattern                   | Purpose                   |
| ------------------------- | ------------------------- |
| Select only needed fields | Reduce transfer size      |
| Batch related queries     | Avoid N+1                 |
| Use indexes               | Filter on indexed columns |
| Limit early               | Don't fetch then slice    |

## Anti-Patterns

- Deeply nested response structures (hard for AI to parse)
- Generic error messages ("Something went wrong")
- Missing error codes (AI can't programmatically handle)
- Trusting client-provided org ID
- Queries without org scoping
- Synchronous long-running operations
- Exposing internal error details in production
- Inconsistent response shapes across endpoints

## Do Not

- Return different shapes for success vs error (use discriminated union)
- Leak internal implementation in error messages
- Allow cross-org data access under any circumstance
- Block the event loop with synchronous operations
- Return unbounded lists without pagination
- Use HTTP 200 for errors (use proper status codes)
- Assume AI understands implicit context (be explicit)
