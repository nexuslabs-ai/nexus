# State color density

**Max one tinted pill per row. Status as `● label`, not pill.**

## Why

Linear, Notion, and Stripe all converge on this in their team / list / table surfaces. Multiple tinted state pills per row turns the page into a "warning panel" and dilutes the signal of any individual state. The brand state colours (error, success, warning, info) read clearest when they're rare.

## How to apply

- **Per row:** at most ONE tinted pill, and it should be a _role_ indicator (Admin, Reviewer, Lead) — not a state.
- **Status** (Online, In review, Approved, Failed, Pending) renders as `<span class="status-dot {variant}"/> Label` — a coloured 8px circle plus ink-muted text. The dot carries the colour signal; the label reads as natural copy.
- **Reserve tinted pill backgrounds** (`bg-error-bg`, `bg-success-bg`, `bg-warning-bg`, `bg-info-bg`) for toasts, alerts, and "needs attention" highlights — never for steady-state row data.
- **Role pills** use `bg-role-bg text-role-text` (light gray, deliberately no colour). Multiple role pills per row are fine if they're factual identity tags (`[You]`, `[Lead]`, `[External]`).

## Examples

❌ Reviewers list with `[Approved]` `[In review]` `[Pending]` `[External]` badges in colored pills:

```tsx
<TableRow>
  <Avatar /> Aishvarya
  <RolePill variant="admin">Admin</RolePill>
  <Pill variant="success">Approved</Pill> {/* state pill — bad */}
  <Pill variant="muted">External</Pill> {/* role pill — fine */}
</TableRow>
```

✓ Same row, dot-status:

```tsx
<TableRow>
  <Avatar /> Aishvarya
  <RolePill>Admin</RolePill>
  <Status variant="success" /> Approved {/* dot + ink-muted label */}
  <RolePill>External</RolePill>
</TableRow>
```

✓ Toast / alert keeps the tinted bg (state-bearing surface, not a row item):

```tsx
<Alert variant="success">Paper saved · 30 questions ready to print</Alert>
```

## Reference

- Spec source: `docs/design/token-system/color-system.html` (section 5 — State colors)
- Token contract: `apps/web/src/app/globals.css` (`--success-bg`, `--error-bg`, `--warning-bg`, `--info-bg` are the only acceptable tinted-pill backgrounds for state)
