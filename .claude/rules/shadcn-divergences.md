# shadcn/ui Adaptation Guide

Adapting a shadcn/ui component means translating its token vocabulary into
Nexus's. Most of that translation is mechanical and machine-enforced — this file
records only the decisions a reader cannot derive from the token registry or the
linter.

**Mechanical checks live in `@nexus_ds/nx-class-conventions`**, which fails
`pnpm lint` for the wrong prefix order, a banned `accent` token, an incomplete
semantic token path, or a raw primitive colour. Available token names are in
`SEMANTIC_TOKEN_REGISTRY` (`packages/core/src/lib/token-registry.ts`); the
emitted utilities are in `packages/tailwind/nexus.css`. Read those, not a table
here.

## The `nx:` prefix

Every Tailwind utility carries the `nx:` prefix, and it comes **before** every
modifier: `nx:hover:bg-primary-background-hover`, `nx:[&>svg]:text-foreground`,
`nx:md:flex`. Never `hover:nx:…`, and never an unprefixed utility.

## Renames that change the word, not just the shape

| shadcn        | Nexus       | Note                                                      |
| ------------- | ----------- | --------------------------------------------------------- |
| `destructive` | `error-*`   | Tokens only — see below                                   |
| `card`        | `container` | Plus `container-hover` / `container-active`               |
| `accent`      | _removed_   | Was shadcn's hover colour — see below                     |
| `sidebar-*`   | `nav-*`     | One namespace; `nav-border` is flat, not under `border.*` |

**`destructive` survives as a prop value.** The component API keeps
`variant="destructive"` while the internal styling uses `error-*` tokens.
Designers say "error", consumers say "destructive"; both are correct in their
own layer. Don't rename the prop to match the token.

**There is no `accent` token.** shadcn uses `accent` almost entirely for hover,
so the replacement depends on which surface the element sits on — this is the
one mapping that needs judgement rather than a lookup:

| Surface the element sits on | Hover token          |
| --------------------------- | -------------------- |
| Page background             | `background-hover`   |
| Card / panel / list row     | `container-hover`    |
| Popover / menu row          | `popover-hover`      |
| Neutral control rail        | `control-background` |

## Suffixes are required, not decorative

shadcn references a colour family directly (`bg-primary`); Nexus always names
the role (`nx:bg-primary-background`, `nx:text-primary-foreground`). Stopping at
the family name is not a shorthand — it resolves to nothing.

## Semantic tokens replace opacity modifiers

shadcn expresses state by fading a colour: `hover:bg-primary/90`. Nexus has a
real token for each state — `nx:hover:bg-primary-background-hover`,
`nx:active:bg-primary-background-active`, `nx:bg-primary-disabled` — so the
theme controls how state reads, not an arbitrary alpha. Nexus also carries
`*-subtle-*` families and `success` / `warning` / `information` status families
that shadcn has no equivalent for.

## Adaptive by default

Semantic tokens already carry their dark-mode value; the runtime variable is
overridden under `.dark` at emit time. `nx:dark:bg-primary-background` is a
no-op. Reserve `dark:` for raw primitives, which should not appear in component
code anyway.
