# Data display — truncation, dates, numbers, icons, tooltips

**Long content truncates at fixed line counts; full text in `title`. Dates render relative for <24h (`2h ago`), absolute otherwise (`5 May 2026`); one format per surface. Numbers in tables use `tabular-nums` so columns align. Empty cells render `—`, never blank. Icon-only buttons require both `aria-label` AND a Tooltip. Decorative icons are banned.**

## Why

Long names from real customers ("Allen Career Institute Kota — Mathematics Mock Test Series 2026 Term I") overflow containers that short test data fits fine. Date inconsistencies across surfaces (`5/11/2026` vs `May 11, 2026` vs `2 hours ago`) look unfinished. Numeric columns drift visually unless `tabular-nums` is set — one wider digit shifts the entire column. Icon-only buttons are a11y violations without `aria-label`; the icon shape communicates nothing to a screen reader. Decorative icons add weight without function — the opposite of the Workshop register's "functional density" thesis.

## How to apply

### Truncation

- `line-clamp-1` for single-line table cells, `line-clamp-2` for card titles, `line-clamp-3` for descriptions.
- Add `title={fullText}` on truncated elements so hover reveals the full content.
- Numbers don't truncate — widen the column or shrink the font instead.

### Dates and times

- Relative for events within 24 hours: `Just now`, `2h ago`, `Yesterday`.
- Absolute for older events: `5 May 2026` (day-month-year, no comma).
- Time of day if shown uses 12-hour am/pm: `5 May 2026, 3:42 pm`.
- One format per surface — pick relative or absolute, don't mix.
- Use a shared formatter (`formatRelativeOrAbsolute`); never inline `.toLocaleString()` per call site.

### Numbers in tables

- Numeric columns use `tabular-nums` so digits align.
- Right-align numeric columns; left-align text columns.
- Use the locale's thousands separator (`1,250` not `1250`).
- Empty cells render `—` (em dash), never blank.

### Icon-only buttons

- Mandatory `aria-label` matching the button's purpose.
- Mandatory `Tooltip` wrapping, with the same label, 700ms delay, position auto.
- Never on primary actions — primary actions have visible text labels.
- Never on things the user needs to remember (Save action needs a visible "Save" label).

### Decorative icons

- Every icon must communicate function or status.
- If the icon adds no information beyond what the adjacent text says, remove it.
- Status icons (`CheckCircle` for approved, `XCircle` for failed) are functional — keep.
- Decorative flourishes (a sparkle next to "AI", a heart next to "Favorites" when the label already says "Favorites") — remove.

## Examples

❌ Long paper title overflowing:

```tsx
<td>{paper.title}</td>
```

✓ Single-line truncation with hover-reveal:

```tsx
<td className="max-w-xs">
  <span className="line-clamp-1" title={paper.title}>
    {paper.title}
  </span>
</td>
```

❌ Inconsistent date formatting across surfaces:

```tsx
// In the papers list
<td>{new Date(paper.createdAt).toLocaleString()}</td>

// In the paper detail
<p>Created: {format(paper.createdAt, 'MMM d, yyyy')}</p>
```

✓ Shared formatter:

```tsx
// lib/format.ts — formatRelativeOrAbsolute(date) returns "2h ago" or "5 May 2026"
<td>{formatRelativeOrAbsolute(paper.createdAt)}</td>
<p>Created {formatRelativeOrAbsolute(paper.createdAt)}</p>
```

❌ Numeric column drifting without `tabular-nums`:

```tsx
<td>{paper.questionCount}</td>
<td>{paper.totalMarks}</td>
```

✓ Aligned with `tabular-nums`:

```tsx
<td className="tabular-nums text-right">{paper.questionCount}</td>
<td className="tabular-nums text-right">{paper.totalMarks}</td>
```

❌ Empty cell rendered blank:

```tsx
<td>{paper.assignedTo ?? ''}</td>
```

✓ Empty cell rendered with em dash:

```tsx
<td>{paper.assignedTo ?? '—'}</td>
```

❌ Icon-only button with no a11y:

```tsx
<Button size="icon" onClick={openMenu}>
  <MoreHorizontal />
</Button>
```

✓ Icon-only with `aria-label` + Tooltip:

```tsx
<Tooltip content="More actions" delayDuration={700}>
  <Button size="icon" aria-label="More actions" onClick={openMenu}>
    <MoreHorizontal />
  </Button>
</Tooltip>
```

❌ Decorative icon adding no information:

```tsx
<h2>
  <Sparkles className="inline" /> AI Generation
</h2>
```

✓ Icon removed (text already conveys the concept):

```tsx
<h2>AI Generation</h2>
```

## Reference

- `.claude/rules/design.md` — Accessibility Minimums (meaningful labels on interactive elements)
- shadcn Tooltip: https://ui.shadcn.com/docs/components/tooltip
- Tailwind `line-clamp`: https://tailwindcss.com/docs/line-clamp
- Tailwind `tabular-nums`: https://tailwindcss.com/docs/font-variant-numeric
- Phosphor icons: https://phosphoricons.com (default Regular weight)
