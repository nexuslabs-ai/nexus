---
'@nexus_ds/react': minor
---

Add the `Marker` primitive for inline annotations and labelled dividers.

`Marker` renders a low-emphasis annotation row — an optional `MarkerIcon` plus
`MarkerContent` — for lists, feeds, and message streams. `variant="separator"`
centres the label between two rules; `variant="border"` rests the row above a
bottom rule. The label stays real text in reading order, so it is announced
where it appears; use `Separator` for a purely decorative rule with no label.

`asChild` composes the row onto different semantics — a heading for a labelled
section, or a link / button for an actionable row.
