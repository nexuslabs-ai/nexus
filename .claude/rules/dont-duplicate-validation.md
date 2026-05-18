# Don't Duplicate Boundary Validation

Once data has been parsed by zod at the boundary, or is protected by a FK constraint, or is gated by an upstream caller contract — **trust it.** Don't re-check what the schema, the database, or the caller already guarantees.

`parse-dont-narrow.md` says _how_ to validate at boundaries. This rule is the inverse: once validated, **stop validating.** Internal existence checks, invariant throws, and cross-reference guards that merely re-express boundary constraints are defense that doesn't earn its keep — they add code without catching anything the boundary missed.

## Anti-patterns

**Re-checking what zod already validated:**

```ts
// zod schema already says: chapterId: z.int().positive()
function buildPayload(input: ValidatedInput) {
  if (typeof input.chapterId !== 'number' || input.chapterId <= 0) {
    throw new Error('Invariant: chapterId invalid');
  }
  // ...
}
```

**Re-checking what FK already enforces:**

```ts
// paper_sections.subject_id has FK → subjects.id
const subjectRows = await tx.select(...).from(subjects).where(inArray(subjects.id, subjectIds));
for (const s of body.sections) {
  if (!subjectRows.find((r) => r.id === s.subjectId)) {
    throw new NotFoundError('Subject', String(s.subjectId));  // FK will catch this on INSERT
  }
}
```

**Defensive throw for a caller-gated invariant:**

```ts
// Caller already filters out sections with null chapterId before calling mutate.
mutationFn: (input) =>
  postCreatePaper({
    sections: input.sections.map((s) => {
      if (s.chapterId === null) {
        throw new Error('Invariant: section missing chapterId');  // caller's blocker guarantees this
      }
      return { ...s, chapterId: s.chapterId };
    }),
  }),
```

## Correct pattern

Lean on the boundary; narrow with `as` when a structural type mismatch remains:

```ts
mutationFn: (input: CreatePaperMutationInput) =>
  postCreatePaper(input as CreatePaperInput),
```

## Rules

- If a FK constraint catches the bad ID on INSERT, don't also check it with a SELECT first. Let the FK fire.
- If a zod schema parsed the field, don't re-check its shape/range/nullability inside the function body.
- If a caller's contract (a gate, a blocker, a prior narrowing) guarantees an invariant, don't re-throw when it's violated — the contract is the defense.
- Cross-reference checks (e.g. "this chapter belongs to this subject") are only worth writing when the DB doesn't enforce the relation _and_ the mismatch causes real data corruption. Otherwise, trust the client — wizards built from the taxonomy API don't ship mismatched IDs.
- Before adding an existence check, list what it catches that the boundary doesn't. If the list is empty, delete the check.

**Exception:** genuine cross-cutting invariants that _no_ boundary can catch — e.g., "these two request bodies must reference the same tenant," or "this sum must equal that sum." Those deserve an explicit check because nothing else is guarding them.

**The litmus test:** if you remove the check, what breaks that wasn't already going to break with a slightly less friendly error? If the answer is "nothing, just a messier error message," the check is defense theater.
