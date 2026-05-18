# Parse, Don't Narrow

When untyped data enters the program — a `fetch` JSON body, `process.env`, form input, an IPC message — run it through a **zod schema** at the boundary. Do not hand-roll type guards.

**Anti-pattern:**

```ts
const body: unknown = await response.json();
if (
  typeof body !== 'object' ||
  body === null ||
  !('svg' in body) ||
  typeof (body as { svg: unknown }).svg !== 'string'
) {
  throw new Error('malformed');
}
return (body as { svg: string }).svg;
```

**Correct pattern:**

```ts
const schema = z.object({ svg: z.string().min(1) });

const raw: unknown = await response.json();
const parsed = schema.safeParse(raw);
if (!parsed.success) throw new Error('malformed');
return parsed.data.svg;
```

## Rules

- At any boundary where the input is `unknown`, `any`, or an untyped network body — use a zod schema.
- Never use `as` casts to narrow runtime values. `as` is for telling the compiler about a type you already know, not for pretending to check one you don't.
- Never chain `typeof x === 'object' && x !== null && 'field' in x` checks. If it takes more than one `typeof` check, it's a schema.
- Prefer `safeParse` over `parse` when the failure path should become a domain error — it lets you wrap in a typed error without try/catch.
- Define the schema once at module scope, not inline per call. Reuse across success and error paths.
- zod is already a dependency of every workspace package that handles external data. There is no "avoid adding the dep" excuse.

**Exception:** a single `if (typeof x === 'string')` inside an already-typed function is fine. The rule kicks in when you're narrowing across a boundary.

**Paired rule:** once parsed at the boundary, don't re-validate downstream. See `dont-duplicate-validation.md`.

**Reference:** [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) — Alexis King
