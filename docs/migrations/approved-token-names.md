# Approved token-name migration

This is a breaking public-name migration. It preserves existing color values,
selectors and contrast pairings; it does not broaden readability guarantees.

## Rename map

| Before                  | After                   |
| ----------------------- | ----------------------- |
| `border-active`         | `border-focus`          |
| `border-error`          | `error-border`          |
| `border-information`    | `information-border`    |
| `border-success`        | `success-border`        |
| `border-warning`        | `warning-border`        |
| `border-primary`        | `primary-border`        |
| `border-primary-active` | `primary-border-active` |

Apply this map to `--nx-color-*` runtime variables, `--color-*` theme aliases,
and utilities. For example, `nx:border-border-error` becomes `nx:border-error-border`;
`nx:ring-border-primary` becomes `nx:ring-primary-border`. Keep modifiers:
`nx:focus-within:border-border-active` becomes
`nx:focus-within:border-border-focus`.

The explicit `nx:border-color-error/information/success/warning/primary` and
`nx:border-color-primary-active` utility aliases keep their names and reference
the renamed borders. `nx:border-color-active` becomes `nx:border-color-focus`.
The status active borders (`border-error-active`, `border-information-active`,
`border-success-active`, `border-warning-active`) keep their names in this
release. Verify class-merging configuration in copied consumer libraries as well
as application classes and raw CSS/SVG variables.

Content-color names are unchanged in this migration. The six
`primary-subtle-foreground`, `secondary-subtle-foreground`,
`error-subtle-foreground`, `information-subtle-foreground`,
`success-subtle-foreground`, and `warning-subtle-foreground` tokens retain their
names and values. Their filled-background `*-foreground` counterparts also stay
unchanged. This release introduces no `*-text` names.

Existing APCA pairings are unchanged; the border renames do not broaden contrast
guarantees.

## `border-focus` is not the focus ring

`border-focus` and `focus-default` are different colors for different jobs:

| Token          | Color        | Use                                                             |
| -------------- | ------------ | --------------------------------------------------------------- |
| `border-focus` | Neutral grey | A container's border while focus is inside it (`focus-within:`) |

| `focus-default` | Brand, shares `primary-subtle-foreground` | The ring on the focused control itself (`focus-visible:` outline) |

A focused control always uses `focus-default`. Use `border-focus` only on the
wrapper around it, such as a search row or a date-picker frame.

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

## Upgrading

Upgrade core together with copied React/Tailwind, application utilities and
class-merging configuration. Old-name aliases are not added. Only core is
published; copying the React and Tailwind sources is a separate consumer update.
Validate the new package in your project before upgrading.
