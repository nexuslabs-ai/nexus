# Approved token-name migration (#763)

This is a breaking public-name migration. It preserves existing color values,
selectors and contrast pairings; it does not broaden readability guarantees.

## Rename map

| Before                          | After                |
| ------------------------------- | -------------------- |
| `primary-subtle-foreground`     | `primary-text`       |
| `secondary-subtle-foreground`   | `secondary-text`     |
| `error-subtle-foreground`       | `error-text`         |
| `information-subtle-foreground` | `information-text`   |
| `success-subtle-foreground`     | `success-text`       |
| `warning-subtle-foreground`     | `warning-text`       |
| `border-active`                 | `border-focus`       |
| `border-error`                  | `error-border`       |
| `border-information`            | `information-border` |
| `border-success`                | `success-border`     |
| `border-warning`                | `warning-border`     |

Apply this map to `--nx-color-*` runtime variables, `--color-*` theme aliases,
and utilities. For example, `nx:text-primary-subtle-foreground` becomes
`nx:text-primary-text`; `nx:border-border-error` becomes `nx:border-error-border`.
Keep modifiers: `nx:focus-within:border-border-active` becomes
`nx:focus-within:border-border-focus`.

The explicit `nx:border-color-error/information/success/warning` utility aliases
keep their names and reference the renamed normal borders. `nx:border-color-active`
becomes `nx:border-color-focus`. Verify class-merging configuration in copied
consumer libraries as well as application classes and raw CSS/SVG variables.

The six `*-foreground` roles remain content colors for filled backgrounds.
`*-text` also serves matching icons. `foreground` and `muted-foreground` keep
their general hierarchy meaning. Existing APCA pairings are unchanged; the new
names are not a universal promise of contrast on every background. `focus-default`
remains independently derived from primary text and adjusted for its surfaces.

## Saved appearance

CSS-bearing snapshots now use version 7. Version 6 CSS is not replayed by the
bootstrap; the existing sanitizer regenerates CSS while retaining sanitized
preferences. State-only cookies remain version 6 because their shape is unchanged.
SSR applications should pass the cookie-derived snapshot into the first-paint
bootstrap, retaining the selected appearance before hydration.

Without a server cookie/default snapshot, an old local-storage-only snapshot
falls back to the embedded default for first paint; its state is recovered by the
client sanitizer. This is the existing version-mismatch behavior, not a guarantee
of flash-free restoration for local-storage-only deployments.

## Coordinated consumers and release

Upgrade core together with copied React/Tailwind, application utilities and
class-merging configuration. Old-name aliases are not added. Examlly needs an
isolated candidate-package rehearsal and its own reviewed migration before release.
Only core is published among these three packages; copying the private React and
Tailwind sources is a separate consumer update. Follow CONTRIBUTING.md's major
changeset requirement for breaking runtime changes. No package is published by
this PR itself; merging the Version Packages PR can trigger publishing.

This delivery is stacked on token explorer PR #758 at
`838c19937848a4c338f3d7e1ee1b5e73d9861b46`, including the engine/catalogue chain
#722 → #724 → #725 → #755 → #757 → #758. Catalogue aliases and explorer data use
the renamed token identities. Validate against this parent, merge in dependency
order, and revalidate if its implementation changes before landing.

Issue #764 owns the separately approved interaction families and their pending
value/application proposal, including primary hover vs selection and status
hover/active/focus borders. Old status active-border tokens remain until that
migration chooses their replacement values. Radius documentation is already in
#743 / #740. Shared sizing and other inventory proposals are outside this delivery.
