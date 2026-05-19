# Guard Clauses Over Nested Conditionals

Keep the happy path at the outer indentation. Exit early on every precondition, validation failure, or unsupported branch. Reading top-to-bottom, the success case should live at column 0 — not inside a stack of `if` blocks.

**Anti-pattern:**

```
if (preconditionA) {
  if (preconditionB) {
    if (validationPasses) {
      // real work, now indented three levels deep
      return result
    }
  }
}
return fallback
```

**Correct pattern:**

```
if (!preconditionA) return fallback
if (!preconditionB) return fallback
if (!validationPasses) return fallback

// real work, at the outer indentation
return result
```

## Rules

- Flip nested `if (ok) { ... }` into `if (!ok) return;` — the reader should not have to track indentation to follow intent.
- `else` after a `return` (or a `throw`, `break`, `continue`) adds no information and costs indentation. Drop it.
- When building a result with optional fields, construct it once with the required fields and attach optional fields behind an `if`. Do not produce two branches of an expression that each assemble a full object literal.
- Don't use conditional expressions (ternaries, short-circuit operators, pattern-match expression forms) to assemble multi-field results. The branches drift out of sync as fields are added.
- When a single function grows three or more conditional branches that each compute a result, split it into per-branch helpers. Each helper uses guard clauses and returns a nullable/optional result; the caller picks the live branch with a fallback at the call site.
- The rule targets control flow that computes or validates a value. It does not apply to short mutually-exclusive rendering expressions that read more naturally as one chained ternary than as an if-ladder.
