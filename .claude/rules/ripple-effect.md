# Ripple Effect Rule

A change is not done when the immediate code compiles. It is done when the surrounding code is as clean as it would have been if you had written it this way from the start.

**When you change or simplify something, actively look at what connects to it:**

- **Callers** — does the calling code become simpler now? Remove indirection, intermediate variables, or logic that only existed to work around the old shape.
- **Callees** — does the thing you changed now do less? Check if its dependencies can be simplified or removed too.
- **Adjacent code** — is there a similar block nearby that now looks inconsistent or redundant? Clean that up too.
- **Dead weight** — variables, imports, destructured fields, helper functions that only existed to support what you removed. Delete them.

**The signal that you are done:** reading through the changed area feels natural end-to-end, not like a simplified core surrounded by stale scaffolding.

## Examples

- Extract a base class → collapse the now-identical subclasses to one-liners
- Remove a log call → also remove the variables that only computed fields for that log
- Simplify an error → also simplify the catch block that only existed to handle the old shape
- Move null coercion into a function → remove the `?? undefined` at every call site
