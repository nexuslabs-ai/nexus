# Border Naming Aliases

Nexus ships two utility aliases for the border axis:

| Concept                | Original name              | Alias                       |
| ---------------------- | -------------------------- | --------------------------- |
| Default stroke width   | `nx:border-default`        | `nx:border-width-default`   |
| Thick stroke width     | `nx:border-thick`          | `nx:border-width-thick`     |
| Side-aware widths      | `nx:border-t-default`      | `nx:border-width-t-default` |
| Semantic default color | `nx:border-border-default` | `nx:border-color-default`   |
| Semantic state colors  | `nx:border-border-error`   | `nx:border-color-error`     |

Both names work. The aliases point at the same CSS variable lookups as the
original utilities; prefer the alias when it makes the border width or color
intent clearer.
