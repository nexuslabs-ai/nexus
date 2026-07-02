# E1 — Interruptible Overlay Open/Close Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Workstream E principle #4 (part of issue #598) — convert the overlay open/close animations from tw-animate-css **keyframes** (`animate-in` / `animate-out`) to **interruptible CSS transitions** on `data-[state]`, so rapid open/close retargets instead of replaying a fixed timeline.

**Architecture:** Radix sets `data-state="open|closed"` and (via `Presence`) keeps the node mounted until the exit animation/transition ends. Replace `data-[state=open]:animate-in … fade-in-0 zoom-in-95 (slide-*)` / `data-[state=closed]:animate-out …` with a **state-driven transition**: a rest state (`opacity-100 scale-100`), a closed state (`data-[state=closed]:opacity-0 data-[state=closed]:scale-95` + slide for panels), `transition-[opacity,transform]` on the existing `nx:duration-*` / `nx:ease-*` tokens, and `nx:motion-reduce:transition-none`. This is **spike-driven**: prove the recipe + Radix `Presence` exit-before-unmount on ONE surface, then apply it to the rest.

**Tech Stack:** React, Tailwind v4 (`nx:` prefix, `data-[state=*]:` + `transition-*`), Radix `Presence`, tw-animate-css (removing its keyframe utilities from these surfaces), Storybook 10 (`storybook/test`).

## Global Constraints

- **Existing motion tokens only** (`nx:duration-fast|default`, `nx:ease-enter|exit|move`) — no new scale.
- **`nx:motion-reduce:transition-none`** on every converted surface.
- **Loading/height keyframes stay keyframes** — do NOT touch spinner, skeleton, accordion, collapsible, progress-indeterminate, caret-blink.
- **Radix `Presence` must still unmount on close** — the closed-state transition must actually run before unmount (`forceMount` only if a surface needs it).
- `nx:` prefix before every modifier; semantic tokens only. **Pre-production.** **PR:** `feat(motion): …`, base `main`, body references `#598` (this is sub-PR 1 of 4).

---

## File Structure (surfaces carrying `data-[state=open]:animate-in / animate-out`)

- `packages/react/src/components/popover/popover.tsx:77` — **spike surface**
- `packages/react/src/components/overlay-layout/overlay-layout.ts:48,59` — Dialog/AlertDialog content + shared popover recipe
- `packages/react/src/components/dropdown-menu/dropdown-menu.tsx:135`
- `packages/react/src/components/context-menu/context-menu.tsx:135`
- `packages/react/src/components/menubar/menubar.tsx:183,240`
- `packages/react/src/components/select/select.tsx:170`
- `packages/react/src/components/hover-card/hover-card.tsx:95`
- `packages/react/src/components/tooltip/tooltip.tsx:82,83`
- `packages/react/src/components/sheet/sheet.tsx:80,102` — panels (slide from edge)
- `packages/react/src/components/drawer/drawer.tsx:72` — Vaul (may already use its own transitions; verify)
- `packages/react/src/components/navigation-menu/navigation-menu.tsx:186,195,235,303`

---

### Task 1: Spike + verify the recipe on Popover

**Files:** `popover.tsx` (around :77) + `Popover.stories.tsx`.

- [ ] **Step 1: Write the failing/verifying test** — a play fn that opens then closes the popover and asserts the content unmounts after the transition (proves Radix `Presence` still tears down):

```tsx
export const InterruptibleOpenClose: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Content</PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByText('Open');
    await userEvent.click(trigger);
    const content = await within(document.body).findByText('Content');
    await expect(content).toBeVisible();
    // No animate-in keyframe utility remains on the content.
    const panel = content.closest('[data-slot="popover-content"]')!;
    await expect(panel).not.toHaveClass('nx:data-[state=open]:animate-in');
    await expect(panel).toHaveClass('nx:motion-reduce:transition-none');
    await userEvent.keyboard('{Escape}');
    await waitForElementToBeRemoved(() =>
      document.body.querySelector('[data-slot="popover-content"]')
    );
  },
};
```

(Import `within`, `userEvent`, `expect`, `waitForElementToBeRemoved` from `storybook/test`.)

- [ ] **Step 2: Run — verify it fails**

Run: `pnpm test:storybook popover` → FAIL (content still uses `animate-in`).

- [ ] **Step 3: Implement the recipe on Popover** — in `popover.tsx`, read the content's full animate composition (the `animate-in/out` at :77 plus its neighbouring `fade-in-0 zoom-in-95 …` / `fade-out-0 zoom-out-95 …` classes) and replace the keyframe set with the transition equivalent. Recipe:

```
REMOVE:  nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out
         nx:data-[state=open]:fade-in-0  nx:data-[state=closed]:fade-out-0
         nx:data-[state=open]:zoom-in-95 nx:data-[state=closed]:zoom-out-95
ADD:     nx:transition-[opacity,transform] nx:duration-fast nx:ease-move
         nx:motion-reduce:transition-none
         nx:data-[state=closed]:opacity-0 nx:data-[state=closed]:scale-95
```

(Base is implicitly `opacity-100 scale-100`. The transition interpolates both ways and is interruptible.)

- [ ] **Step 4: Run — verify it passes + manually confirm** the open/close feels right and that clicking-open-then-away mid-animation retargets smoothly.

Run: `pnpm test:storybook popover` → PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/popover
git commit -m "feat(motion): interruptible transitions for Popover open/close (#598)"
```

---

### Task 2: Apply the verified recipe to the remaining surfaces

**Files:** each surface in File Structure above (except Popover).

For **each** surface: apply the same recipe as Task 1 Step 3, adapting the direction —

- **Menus/popover-family** (overlay-layout.ts:48,59; dropdown-menu:135; context-menu:135; menubar:183,240; select:170; hover-card:95): fade + zoom → `transition-[opacity,transform]` + `data-[state=closed]:opacity-0 data-[state=closed]:scale-95`.
- **Tooltip** (tooltip.tsx:82,83): the enter is unconditional `animate-in fade-in-0 zoom-in-95`; convert to `transition-[opacity,transform] data-[state=closed]:opacity-0 data-[state=closed]:scale-95` with a base open state.
- **Sheet** (sheet.tsx:80,102) and **Drawer** (drawer.tsx:72): these SLIDE from an edge. Keep the slide but make it a transition: `transition-transform data-[state=closed]:translate-x-full` (per side) instead of `slide-out-to-*`. Vaul (Drawer) may already animate via its own runtime CSS — verify before changing; if Vaul owns it, leave Drawer out of scope and note it.
- **NavigationMenu** (navigation-menu.tsx:186,195,235,303): convert its viewport/flyout animate set the same way.

- [ ] **Step 1:** For each surface, add a play-fn (mirroring Task 1) asserting the `animate-in` keyframe class is gone, `motion-reduce:transition-none` is present, and the content unmounts on close. Run `pnpm test:storybook <surface>` → FAIL.
- [ ] **Step 2:** Apply the recipe. Re-run → PASS. Manually confirm Radix `Presence` still tears down each surface (add `forceMount` only if a surface fails to unmount).
- [ ] **Step 3:** Commit per surface or in small logical groups (e.g. one commit for the popover-family, one for panels, one for navigation-menu):

```bash
git add packages/react/src/components/<surface>
git commit -m "feat(motion): interruptible transitions for <surface> open/close (#598)"
```

---

### Task 3: Validate and open the sub-PR

- [ ] `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:storybook` — all green.
- [ ] Open PR:

```bash
git push -u origin aishvarya/motion-overlay-interruptible
gh pr create --base main \
  --title "feat(motion): interruptible overlay open/close transitions (E1 of #598)" \
  --body "$(cat <<'EOF'
## Summary
Convert overlay open/close from tw-animate-css keyframes to interruptible `data-[state]` transitions across the popover family, tooltip, sheet, drawer, and navigation-menu. Rapid open/close now retargets instead of replaying. Loading/height keyframes untouched.

## GitHub Issue
Part of #598 (Workstream E, principle #4). Sub-PR 1 of 4.

## Test Plan
- [ ] lint / format:check / typecheck / test:storybook green
- [ ] Per-surface play-fn: no `animate-in` class, `motion-reduce:transition-none` present, content unmounts on close (Radix Presence)

## Modern Web Guidance / polish.md
- Existing `nx:duration-*` / `nx:ease-*` tokens (no parallel scale); reduced-motion guarded; opacity/transform only (GPU-composited). Radix `Presence` exit-before-unmount verified per surface.
EOF
)"
```

---

## Self-Review

**Spec coverage (#4):** all `data-[state=open]:animate-in/out` surfaces enumerated; recipe proven on Popover (Task 1) then applied per-surface (Task 2). Loading/height keyframes explicitly excluded. Drawer/Vaul flagged for verification.

**Placeholder scan:** the recipe is concrete (exact REMOVE/ADD class lists); the "spike then apply" structure is deliberate for genuinely per-surface work, not a placeholder. Each surface has an explicit file:line and the same recipe.

**Type/name consistency:** `data-slot="popover-content"` and the `data-[state=closed]` / `motion-reduce:transition-none` classes are identical between the impl recipe and the assertions.
