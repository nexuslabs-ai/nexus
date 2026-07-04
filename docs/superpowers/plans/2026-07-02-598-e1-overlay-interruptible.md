# E1 — Interruptible Overlay Open/Close Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Workstream E principle #4 (part of issue #598) — convert the overlay open/close animations from tw-animate-css **keyframes** (`animate-in` / `animate-out`) to **interruptible CSS transitions** on `data-[state]`, so rapid open/close retargets instead of replaying a fixed timeline.

**Architecture:** Do **not** rely on Radix `Presence` for CSS-transition
teardown. Radix Presence is animation-gated (`animationName` /
`animationend`), while this work removes the keyframes that currently provide
both the enter 0% frame and the exit unmount delay. The spike must first add a
small Nexus transition-presence helper that uses `forceMount`, owns the visual
motion state, waits for `transitionend`, and gates closed content from pointer
and focus access. Only after Popover proves that helper should the recipe fan
out to other surfaces.

**Tech Stack:** React, Tailwind v4 (`nx:` prefix, data-attribute variants,
individual transform-property transitions), Radix primitives with `forceMount`,
a Nexus transitionend helper, tw-animate-css (removing keyframe utilities from
these surfaces), Storybook 10 (`storybook/test`).

## Global Constraints

- **Existing motion tokens only** (`nx:duration-fast|default|slow`,
  `nx:ease-enter|exit|move`) - no new scale.
- Preserve each surface's existing timing semantics unless the PR explicitly
  justifies a change. Do not silently collapse `duration-slow/default` plus
  `ease-enter/exit` into one `duration-fast ease-move` recipe.
- **`nx:motion-reduce:transition-none`** on every converted surface.
- **Loading/height keyframes stay keyframes** — do NOT touch spinner, skeleton, accordion, collapsible, progress-indeterminate, caret-blink.
- **Radix `Presence` is not the transition teardown mechanism** - every
  converted Presence-backed surface needs `forceMount` plus Nexus-owned
  transitionend teardown.
- **No `@starting-style` for this work** - it is below the Nexus browser floor.
- Tailwind v4 scale/translate utilities emit individual transform properties.
  Use `nx:transition-[opacity,scale]` for fade+scale surfaces and
  `nx:transition-[opacity,translate]` (or `opacity,scale,translate` where both
  are used) for directional slide surfaces. Do **not** use
  `transition-[opacity,transform]` for `scale-95`.
- Closed/closing content must be gated: no pointer interaction, no focusable
  descendants reachable by Tab, and hidden from assistive tech while closed.
- `nx:` prefix before every modifier; semantic tokens only. **Pre-production.** **PR:** `feat(motion): …`, base `main`, body references `#598` (this is sub-PR 1 of 4).

---

## File Structure (surfaces carrying `data-[state=open]:animate-in / animate-out`)

- `packages/react/src/components/popover/popover.tsx:77` — **spike surface**
- `packages/react/src/components/overlay-layout/overlay-layout.ts:48` — Dialog/AlertDialog content: fade + scale
- `packages/react/src/components/overlay-layout/overlay-layout.ts:59` — Dialog/AlertDialog scrim: opacity only, no scale
- `packages/react/src/components/dropdown-menu/dropdown-menu.tsx:135`
- `packages/react/src/components/context-menu/context-menu.tsx:135`
- `packages/react/src/components/menubar/menubar.tsx:183,240`
- `packages/react/src/components/select/select.tsx:170`
- `packages/react/src/components/hover-card/hover-card.tsx:95`
- `packages/react/src/components/tooltip/tooltip.tsx:82,83`
- `packages/react/src/components/sheet/sheet.tsx:80,102` — scrim opacity + panel slide from edge
- `packages/react/src/components/drawer/drawer.tsx:72` — Vaul owns runtime transitions; verify and leave out of scope unless evidence says Nexus owns the close transition
- `packages/react/src/components/navigation-menu/navigation-menu.tsx:186,195,235,303`

---

### Task 1: Spike + verify the recipe on Popover

**Files:** `popover.tsx` (around :77), `Popover.stories.tsx`, and a shared
helper if the spike proves the pattern belongs outside Popover.

- [ ] **Step 1: Write the failing tests** - cover the behavior the PR exists to
      deliver, not only class-string cleanup.

Required assertions:

- opening renders content visibly;
- the panel has no `animate-in` / `animate-out` keyframe utilities;
- computed `transition-property` includes `opacity` and `scale`;
- closing leaves the panel mounted long enough to observe the visible exit
  state (`opacity < 1` or equivalent closed-state class + computed opacity);
- a close interrupted by a re-open cancels stale teardown and leaves the panel
  present/open;
- final `transitionend` removes or fully deactivates the panel according to the
  helper contract;
- the closed/closing state blocks pointer interaction and keyboard focus.

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
    const panel = content.closest('[data-slot="popover-content"]')!;

    await expect(content).toBeVisible();
    await expect(panel).not.toHaveClass('nx:data-[state=open]:animate-in');
    await expect(panel).not.toHaveClass('nx:data-[state=closed]:animate-out');
    await expect(panel).toHaveClass('nx:motion-reduce:transition-none');

    const openTransition = getComputedStyle(panel).transitionProperty;
    await expect(openTransition).toContain('opacity');
    await expect(openTransition).toContain('scale');

    await userEvent.keyboard('{Escape}');

    // The exit must paint while still mounted; eventual teardown alone is not
    // enough evidence for interruptibility.
    await waitFor(() => {
      expect(panel).toHaveAttribute('data-motion-state', 'closed');
      expect(Number(getComputedStyle(panel).opacity)).toBeLessThan(1);
    });

    await expect(panel).toHaveStyle({ pointerEvents: 'none' });

    await userEvent.click(trigger);
    await waitFor(() =>
      expect(panel).toHaveAttribute('data-motion-state', 'open')
    );
    await expect(panel).toBeVisible();

    await userEvent.keyboard('{Escape}');
    panel.dispatchEvent(
      new TransitionEvent('transitionend', {
        bubbles: true,
        propertyName: 'opacity',
      })
    );
    await waitForElementToBeRemoved(() =>
      document.body.querySelector('[data-slot="popover-content"]')
    );
  },
};
```

(Import `within`, `userEvent`, `expect`, `waitFor`, and
`waitForElementToBeRemoved` from `storybook/test`.)

- [ ] **Step 2: Run — verify it fails**

Run: `pnpm test:storybook popover` -> FAIL for the real gaps: keyframe classes
are still present, computed transition properties are absent/wrong, and exit
teardown is still Presence animation-gated.

- [ ] **Step 3: Implement the transition-presence helper on Popover first.**
      This is not a class-only swap.

Implementation requirements:

- Make Popover root state observable to content. Preserve controlled and
  uncontrolled root usage.
- `PopoverContent` uses `forceMount` so Radix does not remove the node before
  the exit transition paints.
- Add a Nexus-owned motion state, e.g. `data-motion-state="open|closed"`.
  Enter must mount/prepare in the closed state, then flip to open on the next
  animation frame. This replaces the keyframe 0% frame without using
  `@starting-style`.
- On close, set the motion state to closed, wait for `transitionend` from the
  animated property (`opacity` for fade+scale), then tear down. Ignore stale
  transitionend events after an interrupted reopen.
- Closed/closing content gets `aria-hidden`, no pointer interaction, and focus
  gating. If the implementation uses `inert`, first verify Safari 15.4 support
  or provide a fallback because `inert` may sit outside the Nexus floor.

Popover class recipe:

```
REMOVE:  nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out
         nx:data-[state=open]:fade-in-0  nx:data-[state=closed]:fade-out-0
         nx:data-[state=open]:zoom-in-95 nx:data-[state=closed]:zoom-out-95
         nx:data-[state=open]:duration-default nx:data-[state=open]:ease-enter
         nx:data-[state=closed]:duration-fast nx:data-[state=closed]:ease-exit
         nx:data-[side=bottom]:slide-in-from-top-2
         nx:data-[side=left]:slide-in-from-right-2
         nx:data-[side=right]:slide-in-from-left-2
         nx:data-[side=top]:slide-in-from-bottom-2
         nx:motion-reduce:data-[state=open]:animate-none
         nx:motion-reduce:data-[state=closed]:animate-none
ADD:     nx:transition-[opacity,scale]
         nx:motion-reduce:transition-none
         nx:data-[motion-state=open]:duration-default
         nx:data-[motion-state=open]:ease-enter
         nx:data-[motion-state=closed]:duration-fast
         nx:data-[motion-state=closed]:ease-exit
         nx:data-[motion-state=closed]:opacity-0
         nx:data-[motion-state=closed]:scale-95
         nx:data-[motion-state=closed]:pointer-events-none
```

Base is `opacity-100 scale-100`. Do not carry over Popover's directional
`slide-in-from-*` classes unless the spike also models them as transitionable
`translate` states; otherwise they silently disappear and change the entrance
motion.

- [ ] **Step 4: Run — verify it passes + manually confirm** open, close,
      close-then-reopen mid-exit, and Escape/click-away. Confirm the panel does
      not accept pointer/focus while closing.

Run: `pnpm test:storybook popover` -> PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/popover
git commit -m "feat(motion): interruptible transitions for Popover open/close (#598)"
```

---

### Task 2: Apply the verified recipe to the remaining surfaces

**Files:** each surface in File Structure above (except Popover).

Do not fan out until Task 1 proves the helper with tests. For each surface,
move from Radix/animation-state classes to the shared transition-presence
contract, then adapt only the visual recipe.

- **Popover-family fade+scale surfaces** (`overlay-layout.ts:48`,
  dropdown-menu, context-menu, menubar, select, hover-card): use
  `nx:transition-[opacity,scale]`, closed opacity/scale, preserved open/close
  duration/ease tokens, and closed pointer/focus gating.
- **Dialog/AlertDialog scrim** (`overlay-layout.ts:59`): opacity only. Use
  `nx:transition-opacity` plus closed opacity. Do **not** add `scale-95` to a
  full-bleed scrim.
- **Tooltip** (`tooltip.tsx:82,83`): convert the unconditional enter keyframes
  and closed keyframes to the same helper-backed fade+scale recipe. Verify
  tooltip delay/escape behavior still works.
- **Sheet** (`sheet.tsx:80,102`): scrim is opacity only; panel uses directional
  translate. Tailwind v4 translate utilities emit the individual `translate`
  property, so the panel transition property must include `translate`, not only
  `transform`.
- **Drawer** (`drawer.tsx:72`): Vaul owns the drawer runtime transition model.
  Keep Drawer out of this PR unless the spike proves a Nexus-owned keyframe is
  actually controlling its interruptibility; if excluded, say so in the PR body.
- **NavigationMenu** (`navigation-menu.tsx:186,195,235,303`): convert viewport
  and inline flyout recipes separately. Preserve any directional motion by
  translating it to `translate` states rather than dropping it.

- [ ] **Step 1:** For each surface, add or update a play-fn that asserts no
      `animate-in` / `animate-out` class remains, `motion-reduce:transition-none`
      is present, computed `transition-property` matches the used individual
      properties (`opacity`, `scale`, `translate`), the exit visibly paints, and
      interruption cancels stale teardown. Run `pnpm test:storybook <surface>`
      -> FAIL.
- [ ] **Step 2:** Apply the helper and the surface-specific recipe. Re-run ->
      PASS. Manually confirm pointer/focus gating in the closed/closing state.
- [ ] **Step 3:** Commit per surface or in small logical groups (e.g. helper +
      Popover, popover-family, panels, navigation-menu):

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
- [ ] Popover spike proves forceMount + Nexus transitionend teardown + closed-state gating
- [ ] Per-surface play-fn: no `animate-in` / `animate-out` class, `motion-reduce:transition-none` present, computed transition-property matches opacity/scale/translate, exit visibly paints, interruption cancels stale teardown

## Modern Web Guidance / polish.md
- Existing `nx:duration-*` / `nx:ease-*` tokens (no parallel scale); reduced-motion guarded; opacity plus individual scale/translate properties only. Radix Presence is animation-gated, so CSS-transition teardown is owned by the Nexus helper.
EOF
)"
```

---

## Self-Review

**Spec coverage (#4):** all `data-[state=open]:animate-in/out` surfaces enumerated; helper + recipe proven on Popover (Task 1) then applied per-surface (Task 2). Loading/height keyframes explicitly excluded. Drawer/Vaul flagged for exclusion unless verification proves Nexus owns its transition.

**Placeholder scan:** the Popover recipe is concrete (exact REMOVE/ADD class lists), while remaining surfaces are grouped by motion shape: fade+scale, opacity-only scrim, or directional translate. The "spike then apply" structure is deliberate because Radix Presence cannot be trusted for transition teardown.

**Type/name consistency:** `data-slot="popover-content"`, `data-motion-state`, computed `transition-property`, and `motion-reduce:transition-none` are aligned between the implementation recipe and the assertions. `scale-95` maps to `scale`, not `transform`, under Tailwind v4.
