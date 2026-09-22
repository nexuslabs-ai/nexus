# Extract Non-Trivial Inline Handlers

A JSX handler with branching or several statements belongs in a named function
above the `return`. The JSX should say _which_ handler runs, not contain its
body. One- and two-statement adapters stay inline — a name would say less than
the body already does.

**Enforced by `@nexus_ds/no-multi-statement-jsx-handler`** — inline handler
props with 3+ statements, or a nested callback-object argument, fail
`pnpm lint` and the pre-commit hook.

Don't wrap a bare reference in an arrow: `onClick={() => doThing()}` with no
arguments is just `onClick={doThing}`.
