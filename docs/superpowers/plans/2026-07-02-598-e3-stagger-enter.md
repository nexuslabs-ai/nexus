# E3 — Split & Stagger Enter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Workstream E principle #5 (part of issue #598) — when a menu / listbox opens, stagger its items in (each slightly delayed) instead of the whole container appearing at once.

**Architecture:** This is **spike-driven** and the most exploratory of the E sub-PRs — items currently have no entrance animation, so this adds one. Approach: a co-located keyframe (fade + small `translateY`) applied per item, with a per-item `animation-delay` driven by `:nth-child` (CSS-only, bounded to the first ~8 items; further items animate with the max delay). Use the existing `nx:duration-*` / `nx:ease-*` tokens; `nx:motion-reduce:animate-none` disables the whole thing. Prove the mechanism on DropdownMenu first, evaluate the feel, then apply to the other stable item lists. **If the spike shows stagger adds noise rather than polish on any surface, leave that surface out and note it** — do not force it. Command is intentionally excluded because cmdk remounts filtered items while typing, replaying the entrance motion during search. Toast is intentionally excluded because Sonner owns the stack/item DOM and does not expose stable Nexus slots for this contract.

**Tech Stack:** React, Tailwind v4 (`nx:` prefix, arbitrary `[&>*:nth-child(n)]` + `[animation-delay:*]`), co-located component CSS `@keyframes` (per the repo's custom-keyframe pattern), Storybook 10 (`storybook/test`).

## Global Constraints

- Existing motion tokens; **`nx:motion-reduce:animate-none`** on the staggered items.
- Custom keyframes follow the repo pattern: a co-located `{component}.css` with `@theme inline { --animate-*; @keyframes … }` imported by BOTH the component index CSS and the Storybook preview root (verify emission in dist + storybook-static).
- `nx:` prefix; semantic tokens only. **Pre-production.** **PR:** `feat(motion): …`, base `main`, body references `#598` (sub-PR 3 of 4).

---

## File Structure

- New/updated co-located CSS for the stagger keyframe (e.g. reuse an existing `--animate-*` if one fits; otherwise add one under the menu components' CSS).
- `packages/react/src/components/dropdown-menu/dropdown-menu.tsx` — **spike surface** (item list).
- `packages/react/src/components/context-menu/context-menu.tsx`, `menubar/menubar.tsx`, `select/select.tsx` (listbox).
- Command and Sonner remain out of scope: Command would replay on filtered cmdk item remounts; Sonner's toast stack is library-owned.
- Stories for each.

---

### Task 1: Spike the stagger mechanism on DropdownMenu

**Files:** dropdown-menu component + its CSS + `DropdownMenu.stories.tsx`.

- [ ] **Step 1: Write the verifying test** — a play fn that opens the menu and asserts the items carry the stagger animation class + reduced-motion guard:

```tsx
export const StaggeredItems: Story = {
  render: () => (/* a DropdownMenu with 5 items — reuse the file's default story shape */),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.click(trigger);
    const items = document.body.querySelectorAll('[data-slot="dropdown-menu-item"]');
    await expect(items.length).toBeGreaterThan(1);
    await expect(items[0]).toHaveClass('nx:motion-reduce:animate-none');
    // Item 2 has a larger animation-delay than item 1 (staggered).
  },
};
```

- [ ] **Step 2: Run — FAIL.** `pnpm test:storybook dropdown-menu`

- [ ] **Step 3: Implement the mechanism.** Define a stagger keyframe in the menu's co-located CSS (fade + `translateY(-2px)` → `0`), exposed as an `--animate-*` utility (or reuse an existing enter animation). On the menu content, apply it to each item with `:nth-child`-based delays, e.g. on the content class:

```
nx:[&>[data-slot=dropdown-menu-item]]:animate-<stagger>
nx:[&>[data-slot=dropdown-menu-item]]:motion-reduce:animate-none
nx:[&>[data-slot=dropdown-menu-item]:nth-child(2)]:[animation-delay:30ms]
nx:[&>[data-slot=dropdown-menu-item]:nth-child(3)]:[animation-delay:60ms]
nx:[&>[data-slot=dropdown-menu-item]:nth-child(4)]:[animation-delay:90ms]
nx:[&>[data-slot=dropdown-menu-item]:nth-child(n+5)]:[animation-delay:120ms]
```

(Delays are a starting point; tune during the spike. Keep total stagger < ~150ms so the menu still feels instant.)

- [ ] **Step 4: Run — PASS + evaluate the feel.** `pnpm test:storybook dropdown-menu`. If it reads as sluggish, reduce the step or the item count that staggers.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/dropdown-menu
git commit -m "feat(motion): staggered item entrance for DropdownMenu (#598)"
```

---

### Task 2: Apply the validated stagger to the other item lists

**Files:** context-menu, menubar, select (listbox); command and sonner notes.

- [ ] For **each** of context-menu, menubar, select: add the same per-item stagger (adjusting the `data-slot` selector) + a story asserting the stagger class + `motion-reduce:animate-none`. Run `pnpm test:storybook <surface>` → FAIL → implement → PASS.
- [ ] **Command:** leave out of this stagger contract. cmdk filters by unmounting/remounting items while the user types, so item-enter motion replays during search and reads as noise rather than polish.
- [ ] **Toast (sonner):** the stack markup is owned by the `sonner` library and themed only via CSS vars, so per-item stagger is not a stable Nexus-owned contract. Document that toast stagger is out of scope and leave it.
- [ ] Commit per surface (or a small group):

```bash
git add packages/react/src/components/<surface>
git commit -m "feat(motion): staggered item entrance for <surface> (#598)"
```

---

### Task 3: Validate and open the sub-PR

- [ ] `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:storybook` — green. Confirm the stagger keyframe is emitted in dist + storybook-static (custom-keyframe pattern).
- [ ] Open PR:

```bash
git push -u origin aishvarya/motion-stagger
gh pr create --base main \
  --title "feat(motion): staggered item entrance for menus (E3 of #598)" \
  --body "$(cat <<'EOF'
## Summary
Menu / listbox items stagger in on open (fade + small translate, ~30ms step, capped). Command is left out because cmdk remounts filtered items while typing; toast stagger is left out because Sonner owns the item DOM. Reduced-motion disables the shipped stagger.

## GitHub Issue
Part of #598 (Workstream E, principle #5). Sub-PR 3 of 4.

## Test Plan
- [ ] lint / format:check / typecheck / test:storybook green
- [ ] Per-surface story asserts stagger class + `motion-reduce:animate-none`; keyframe emitted in dist + storybook-static

## Modern Web Guidance / polish.md
- Existing motion tokens; reduced-motion guarded; total stagger kept < ~150ms so menus still feel instant. Surfaces where stagger added noise were left out (noted).
EOF
)"
```

---

## Self-Review

**Spec coverage (#5):** menu/listbox staggered (Task 1 spike + Task 2 apply); Command explicitly scoped out because filtering replays item entry; toast explicitly scoped out as library-owned. No gaps.

**Placeholder scan:** the mechanism is concrete (keyframe + exact nth-child delay classes); "spike then apply" and "tune the step" are legitimate for a genuinely new animation, not TBD placeholders.

**Type/name consistency:** `data-slot="dropdown-menu-item"` matches source; the stagger + `motion-reduce:animate-none` classes are consistent between impl and assertions.
