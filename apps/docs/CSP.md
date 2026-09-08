# Content-Security-Policy

The policy lives in [`csp.mjs`](csp.mjs). `next.config.ts` sends it and
`scripts/audit-csp-inventory.mjs` checks each build against it, so both read the
same directives.

It ships as **`Content-Security-Policy-Report-Only`**. `CSP_HEADER_NAME` in
`csp.mjs` is the single constant that decides that; #687 flips it once the
blocker below is gone. Do not flip it before then —
[§ What still blocks enforcement](#what-still-blocks-enforcement).

## `style-src` permits Shiki's inline styles

Shiki writes every syntax colour as an inline `style` attribute, so enforcing a
`style-src` that excluded them would drop the colour out of every code block.
`style-src 'self' 'unsafe-inline'` permits them: a build served with a real
enforcing header produced **zero `style-src` violations** on four pages, three of
them carrying code blocks.

On `/getting-started/theme-setup` all 344 token spans kept their inline colour
under enforcement, resolving to 7 distinct computed values.

### Why the keyword stays rather than moving Shiki into a stylesheet

Shiki is not what `'unsafe-inline'` is paying for. Across the 41 prerendered
pages:

| Source                                        | Style attributes | Distinct values |
| --------------------------------------------- | ---------------: | --------------: |
| Shiki token spans (`color:var(--nx-color-*)`) |             ~505 |               8 |
| The docs app's own pages and components       |              816 |             280 |
| **Total**                                     |        **~1320** |         **288** |

The distinct-value counts are stable across builds and are what the argument
rests on. The raw attribute total is not: Shiki's span count drifts by a span or
two between builds of the same tree (observed 1341 / 1320 / 1321 / 1322), which
is a tokenisation-determinism question for the highlighter, not a CSP one. The
audit gates on whether inline content exists at all, never on an exact count.

The docs app's own inline styles outnumber Shiki's, and 280 distinct values put
a hash-based `style-src` out of reach — `'unsafe-hashes'` would need one hash
per value, and it lets an attacker reuse any hashed declaration anywhere, so it
buys very little for a header that size. Next.js also emits one inline `<style>`
element in its built-in `not-found` page, which the app does not own.

Moving Shiki's output into a stylesheet is therefore possible but pointless: it
would remove 8 of the 288 distinct values and `'unsafe-inline'` would still have
to stay for the other 280. Shiki's colours already reference Nexus tokens rather
than baked hex, so nothing about theming depends on the move either.

**Decision: keep `'unsafe-inline'` in `style-src` and leave Shiki's output
inline.** Revisit only as part of removing the docs app's own inline styles, not
as a highlighter concern.

## What still blocks enforcement

`script-src` does. It is unrelated to Shiki, and it is the reason the policy is
still Report-Only.

The policy hash-lists exactly one inline script, the appearance bootstrap.
Next.js App Router streams its RSC payload through **inline**
`self.__next_f.push(…)` scripts — 658 of them across the build — and a hash in
`script-src` makes any `'unsafe-inline'` inert, so an enforced policy blocks all
of them.

Measured in Chromium against a build with `CSP_HEADER_NAME` set to the enforcing
header:

| Page                           | Violations | All `script-src-elem`? | Rendered body |
| ------------------------------ | ---------: | ---------------------- | ------------- |
| `/getting-started/theme-setup` |         45 | yes                    | empty         |
| `/getting-started/install`     |         30 | yes                    | empty         |
| `/theming/appearance`          |         34 | yes                    | empty         |
| `/foundations/color`           |         26 | yes                    | empty         |

The appearance bootstrap itself is never among them — its hash works. Every
violation is Next.js flight data. `/foundations/color` has no code blocks at
all and still fails, which is the clearest evidence that this is not Shiki's
doing.

The pages render **blank**, not merely unhydrated: the client bundle loads from
`'self'`, finds no RSC payload, and React clears the server HTML.

### The options, and what each costs

- **A nonce.** Next.js's documented approach. Middleware generates a nonce per
  request and Next stamps it on its own inline scripts. It forces dynamic
  rendering, so all 44 pages lose static prerendering.
- **Build-time hashes.** Hash each page's inline scripts after the build and
  emit per-route headers. Keeps prerendering, but means ~30 hashes per route in
  the response headers and it cannot cover a dynamically rendered page.
- **Stay Report-Only.** What ships today.

Tracked in #687; both fixes are larger than a header edit.

### Report-Only currently reports to nobody

The policy sets no `report-uri` or `report-to`, so violations reach each
visitor's devtools console and nothing else. The counts above were collected by
listening for `securitypolicyviolation` events in a browser, not from a
collector. Any plan to rely on Report-Only as an early-warning signal needs an
endpoint first.

## The audit gate

`pnpm audit:csp` parses the header the build baked into
`.next/routes-manifest.json` — the policy that actually shipped — counts what the
output emitted, and reports `enforcementBlockers`.

It re-hashes the appearance bootstrap out of the prerendered HTML, rebuilds the
policy `csp.mjs` would produce from that hash, and requires the shipped header to
equal it. That catches a drifted policy and a stale build in one assertion; the
`*.mjs` entry in `apps/docs/turbo.json` `inputs` is what stops a cached build
from reaching the gate in the first place.

For each kind of inline content it resolves the directive a browser would
actually consult — the `-elem` / `-attr` variant, then the base directive, then
`default-src` — rather than reading one directive name literally.

- While the header is Report-Only it prints the blockers as a warning and
  passes, so the list above cannot go stale without someone seeing it.
- Once `CSP_HEADER_NAME` is the enforcing header, a non-empty list **fails the
  build**.

So dropping `'unsafe-inline'` from `style-src` while inline styles remain, or
switching to enforce while Next's flight scripts remain unhashed, is caught by
the audit rather than by a blank page in production.

```
$ pnpm --filter @nexus_ds/docs audit:csp
  "cspHeader": "Content-Security-Policy-Report-Only",
  "enforcementBlockers": [
    "script-src (…) blocks 658 inline scripts that carry no hash (Next.js RSC flight data)."
  ]
```

## Reproducing the browser measurement

Point `CSP_HEADER_NAME` in `csp.mjs` at `'Content-Security-Policy'`, then:

```bash
pnpm --filter @nexus_ds/docs build
pnpm --filter @nexus_ds/docs start
```

That serves a real enforcing header. Load a page and collect
`securitypolicyviolation` events; the counts above come from that build. Revert
the constant afterwards.

Do not substitute rewriting the header inside the browser's own request
interception — doing so truncated the streamed HTML and produced a misleading
empty DOM. A proxy that only swaps the header name reproduces the same numbers
as the enforcing build.
