# Forms, dialogs, and actions

**Forms are vertical (labels above inputs); single primary action per surface, on the right; Cancel on the left. Dialogs are for confirms, small edits (≤4 fields), and short focused flows — not for long forms or multi-step wizards. Destructive actions require a confirmation Dialog with the entity named in the title (never "Are you sure?"); the confirm button uses `destructive` variant and names the action.**

## Why

Forms are the heaviest single surface family in Milestone 18 — auth (#603), paper-types (#608), new paper wizard (#607), settings (#612), branding. Dialog misuse is the most common modal regression in B2B SaaS — long forms cram into dialogs that can't fit on mobile, multi-step wizards lose the Escape behavior users expect from dialogs, and confirms get stripped of context with "Are you sure?". Stripe / Linear / Notion all name the entity in destructive confirms (`Delete project "X"?`) — that's the industry baseline.

## How to apply

### Form layout

- Labels above inputs. Never floating labels. Never label-beside-input on desktop.
- Helper text below the input in `text-ink-muted`.
- Error message replaces helper text in `text-error-text` on validation failure.
- Required fields: mark once with a top-of-form legend (`* required`), not asterisks on every label.
- Cancel on the left, primary action on the right.

### Dialog usage

- Use for: confirms, small edits (≤4 fields), short focused flows.
- Don't use for: forms with >4 fields, multi-step wizards, anything mobile-first that needs full screen.
- Always closable three ways: Escape key + click-outside + visible Close button.

### Destructive confirmation

- Title names the entity: `Delete paper "Mock Test 045"?` — never "Are you sure?".
- Confirm button uses `destructive` variant.
- Confirm button names the action: `Delete paper` — never "Yes", "OK", or "Confirm".
- For soft-delete-able entities, pair with an undo toast.
- Hard delete only when the action is irreversible by design.

### Action button hierarchy

- One primary action per surface (most visually prominent).
- Secondary actions use `outline` or `ghost` variants.
- Destructive actions use `destructive` variant.
- Two `<Button>` with the default variant on the same surface is a smell — pick one as primary.

## Examples

❌ Asterisks on every label:

```tsx
<label>
  Name <span className="text-error">*</span>
</label>
<Input />
<label>
  Email <span className="text-error">*</span>
</label>
<Input />
```

✓ Single legend at top:

```tsx
<p className="text-sm text-ink-muted">* required</p>
<FormField label="Name" required>
  <Input />
</FormField>
<FormField label="Email" required>
  <Input />
</FormField>
```

❌ Six-field form inside a Dialog:

```tsx
<Dialog>
  <DialogContent>
    <h2>Edit institute</h2>
    <Input placeholder="Name" />
    <Input placeholder="Email" />
    <Input placeholder="Phone" />
    <Input placeholder="Address" />
    <Input placeholder="GST" />
    <Input placeholder="Website" />
    <Button>Save</Button>
  </DialogContent>
</Dialog>
```

✓ Long form on a full page; the entry point links to it:

```tsx
<Link href="/settings/institute">
  <Button>Edit institute</Button>
</Link>
```

❌ Floating label:

```tsx
<div className="relative">
  <Input id="name" placeholder=" " />
  <label
    htmlFor="name"
    className="absolute left-3 top-3 transition-all peer-focus:top-1"
  >
    Name
  </label>
</div>
```

✓ Label above input:

```tsx
<FormField label="Name">
  <Input />
</FormField>
```

❌ "Are you sure?" destructive confirm:

```tsx
<Dialog>
  <DialogTitle>Are you sure?</DialogTitle>
  <DialogDescription>This action cannot be undone.</DialogDescription>
  <Button onClick={() => deleteMutation.mutate()}>Yes</Button>
  <Button variant="outline">Cancel</Button>
</Dialog>
```

✓ Named-action destructive confirm:

```tsx
<Dialog>
  <DialogTitle>Delete paper "{paper.title}"?</DialogTitle>
  <DialogDescription>
    The paper and its sections will be removed. Undo within 5 seconds.
  </DialogDescription>
  <Button variant="outline">Cancel</Button>
  <Button variant="destructive" onClick={() => deletePaper(paper.id)}>
    Delete paper
  </Button>
</Dialog>
```

❌ Destructive action fires immediately:

```tsx
<Button variant="destructive" onClick={() => deletePaper(paper.id)}>
  Delete paper
</Button>
```

✓ Destructive opens confirmation first:

```tsx
<Button variant="destructive" onClick={() => setConfirmOpen(true)}>
  Delete paper
</Button>
<DeletePaperDialog
  open={confirmOpen}
  paper={paper}
  onConfirm={() => deletePaper(paper.id)}
  onClose={() => setConfirmOpen(false)}
/>
```

❌ Primary on left, Cancel on right:

```tsx
<div className="flex justify-end gap-2">
  <Button>Save</Button>
  <Button variant="outline">Cancel</Button>
</div>
```

✓ Cancel left, primary right:

```tsx
<div className="flex justify-end gap-2">
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</div>
```

## Reference

- `.claude/rules/design.md` — UX Patterns (Error Messaging, One Primary Action, CTAs); Anti-Patterns (Forms longer than 5–6 fields)
- shadcn Dialog: https://ui.shadcn.com/docs/components/dialog
- shadcn Button variants: https://ui.shadcn.com/docs/components/button
