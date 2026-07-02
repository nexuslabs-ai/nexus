# E2 — Contextual Icon Cross-Fade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Workstream E principle #7 (part of issue #598) — replace hard-swapped selection indicators (`hidden` ↔ `block`, or Radix mount/unmount) with an opacity + scale cross-fade, so checks/dots ease in instead of popping.

**Architecture:** Keep both glyphs in the DOM and cross-fade with a CSS transition on the existing `ease`/`duration` tokens — no Framer Motion. Checkbox is the clean worked example (both icons already rendered). For Radix `Indicator` (radio, Select/DropdownMenu item) that mounts only when selected, `forceMount` the indicator and drive opacity from the parent's `data-[state]` so the exit can animate too. Every effect is `nx:motion-reduce:`-guarded.

**Tech Stack:** React, Tailwind v4 (`nx:` prefix, `group-data-[state=*]:`, `transition-[opacity,transform]`), Radix (Checkbox/RadioGroup/Select/DropdownMenu indicators), Storybook 10 (`storybook/test`).

## Global Constraints

- Existing motion tokens (`nx:duration-fast`, `nx:ease-enter`); `nx:motion-reduce:transition-none` on every icon.
- `nx:` prefix before every modifier; semantic tokens only. **Pre-production.** **PR:** `feat(motion): …`, base `main`, body references `#598` (sub-PR 2 of 4).

---

## File Structure

- `packages/react/src/components/checkbox/checkbox.tsx:85,90,95` — indicator wrapper + IconCheck/IconMinus.
- `packages/react/src/components/radio-group/radio-group.tsx:69,80` — item root (`group`) + Indicator.
- `packages/react/src/components/select/select.tsx:266-268` and `dropdown-menu/dropdown-menu.tsx:313-315,363-365` — `ItemIndicator`.
- Stories: `Checkbox.stories.tsx`, `RadioGroup.stories.tsx`, `Select.stories.tsx`, `DropdownMenu.stories.tsx`.

---

### Task 1: Checkbox check/minus cross-fade (worked example)

**Files:** `checkbox.tsx:85,90,95`, `Checkbox.stories.tsx`.

- [ ] **Step 1: Write the failing test** — add to `Checkbox.stories.tsx`:

```tsx
export const IndicatorCrossFade: Story = {
  render: () => <Checkbox defaultChecked aria-label="Accept" />,
  play: async ({ canvasElement }) => {
    const check = canvasElement.querySelector('[data-slot="checkbox-check"]');
    await expect(check).not.toHaveClass('nx:hidden');
    await expect(check).toHaveClass('nx:transition-[opacity,transform]');
    await expect(check).toHaveClass(
      'nx:group-data-[state=checked]:opacity-100'
    );
    await expect(check).toHaveClass('nx:motion-reduce:transition-none');
  },
};
```

- [ ] **Step 2: Run — FAIL.** `pnpm test:storybook checkbox`

- [ ] **Step 3: Implement.** In `checkbox.tsx`:

Indicator wrapper (line 85) — add `nx:relative`:

```tsx
className =
  'nx:relative nx:flex nx:items-center nx:justify-center nx:text-current';
```

IconCheck (line 90) — replace `'nx:hidden nx:size-3.5 nx:group-data-[state=checked]:block'` with:

```tsx
className =
  'nx:absolute nx:size-3.5 nx:opacity-0 nx:scale-50 nx:transition-[opacity,transform] nx:duration-fast nx:ease-enter nx:group-data-[state=checked]:opacity-100 nx:group-data-[state=checked]:scale-100 nx:motion-reduce:transition-none';
```

IconMinus (line 95) — replace `'nx:hidden nx:size-3.5 nx:group-data-[state=indeterminate]:block'` with:

```tsx
className =
  'nx:absolute nx:size-3.5 nx:opacity-0 nx:scale-50 nx:transition-[opacity,transform] nx:duration-fast nx:ease-enter nx:group-data-[state=indeterminate]:opacity-100 nx:group-data-[state=indeterminate]:scale-100 nx:motion-reduce:transition-none';
```

- [ ] **Step 4: Run — PASS.** `pnpm test:storybook checkbox`

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/checkbox
git commit -m "feat(motion): cross-fade checkbox check/minus indicators (#598)"
```

---

### Task 2: Radio + Select/DropdownMenu indicators (forceMount recipe)

**Files:** `radio-group.tsx:69,80`, `select.tsx:266-268`, `dropdown-menu.tsx:313-315,363-365` + stories.

Radix `Indicator` / `ItemIndicator` mount only when selected, so a cross-fade _out_ needs `forceMount` + opacity driven by the parent's `data-[state]`.

**Radio recipe** (radio-group.tsx):

- Item root (line 69) — add `nx:group` to the class list so children can read `group-data-[state=checked]`.
- Indicator (line 80) — add `forceMount` and cross-fade the `IconCircleFilled`:

```tsx
<RadioGroupPrimitive.Indicator
  forceMount
  data-slot="radio-group-indicator"
  className="nx:flex nx:items-center nx:justify-center"
>
  <IconCircleFilled className="nx:size-2.5 nx:text-current nx:opacity-0 nx:scale-50 nx:transition-[opacity,transform] nx:duration-fast nx:ease-enter nx:group-data-[state=checked]:opacity-100 nx:group-data-[state=checked]:scale-100 nx:motion-reduce:transition-none" />
</RadioGroupPrimitive.Indicator>
```

**Select / DropdownMenu `ItemIndicator`** (select.tsx:266-268, dropdown-menu.tsx:313-315 check + 363-365 radio dot): add `forceMount` to the `ItemIndicator` and apply the same opacity/scale cross-fade to its icon, gated on the item's selected/checked `data-state` (the item root already exposes it; add `nx:group` to the item root if needed). Confirm `forceMount` doesn't leave a stray hit target (the indicator is decorative, `pointer-events-none` if necessary).

- [ ] **Step 1:** Add a story per component asserting the indicator icon carries `nx:transition-[opacity,transform]` + `nx:motion-reduce:transition-none` and is present in the DOM even when unselected (forceMount). Run `pnpm test:storybook radio-group select dropdown-menu` → FAIL.
- [ ] **Step 2:** Apply the recipe per component. Re-run → PASS. Manually confirm selecting/deselecting cross-fades (not pops) and keyboard/pointer selection still works.
- [ ] **Step 3: Commit**

```bash
git add packages/react/src/components/radio-group packages/react/src/components/select packages/react/src/components/dropdown-menu
git commit -m "feat(motion): cross-fade radio/select/dropdown indicators via forceMount (#598)"
```

---

### Task 3: Validate and open the sub-PR

- [ ] `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:storybook` — green.
- [ ] Open PR:

```bash
git push -u origin aishvarya/motion-icon-crossfade
gh pr create --base main \
  --title "feat(motion): contextual icon cross-fade for selection indicators (E2 of #598)" \
  --body "$(cat <<'EOF'
## Summary
Checkbox check/minus, radio dot, and Select/DropdownMenu item indicators cross-fade (opacity+scale) instead of hard-swapping. Radix indicators use `forceMount` so the exit animates too.

## GitHub Issue
Part of #598 (Workstream E, principle #7). Sub-PR 2 of 4.

## Test Plan
- [ ] lint / format:check / typecheck / test:storybook green
- [ ] Stories assert cross-fade classes + `motion-reduce:transition-none`; selection still works via keyboard + pointer

## Modern Web Guidance / polish.md
- Existing motion tokens; reduced-motion guarded; opacity/transform (GPU-composited); no Framer dependency.
EOF
)"
```

---

## Self-Review

**Spec coverage (#7):** checkbox (Task 1, exact), radio + Select/DropdownMenu (Task 2, forceMount recipe). No gaps.

**Placeholder scan:** checkbox is exact before/after; the Radix-indicator recipe is concrete (forceMount + the same opacity/scale class list). The `nx:group` addition is a named, concrete step.

**Type/name consistency:** `data-slot="checkbox-check"` matches source; the cross-fade class list (`nx:transition-[opacity,transform] nx:duration-fast nx:ease-enter nx:motion-reduce:transition-none`) is identical across all icons and the assertions.
