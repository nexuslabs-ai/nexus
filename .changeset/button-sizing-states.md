---
'@nexus_ds/react': minor
---

Refine Button and ButtonGroup sizing and states.

- Button adds the bordered `error-outline` variant and the `xs` / `icon-xs` sizes; ButtonGroup and ButtonGroupText add `size="xs"`. Small buttons use 13px labels and every size uses fixed 12/14/16px icons.
- Disabled Buttons in every variant share the neutral disabled colours (`bg-disabled`, `text-disabled-foreground`, `border-border-disabled`). Disabled, `aria-disabled` and loading Buttons block activation during event capture, including keyboard activation of a wrapping menu trigger.
- Loading Buttons keep their variant colours and stay focusable instead of setting native `disabled`. `loading` is ignored with `asChild`.
- Standalone Buttons compress to 0.98 while pressed; Buttons inside a ButtonGroup keep their size.
- Breaking: disabled styling from `buttonVariants` now keys on `data-disabled`, and its base no longer sets `disabled:pointer-events-none`. An element styled with `buttonVariants` must set `data-disabled` and `aria-disabled` to look and behave disabled, as `AlertDialogAction` and `AlertDialogCancel` do.
- Breaking: `ButtonGroupText` no longer accepts `asChild`. Render a link in a group with `<Button asChild>` instead.
