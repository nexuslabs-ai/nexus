# E1 — Interruptible Overlay Open/Close Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Workstream E principle #4 (part of issue #598) — convert the overlay open/close animations from tw-animate-css **keyframes** (`animate-in` / `animate-out`) to **interruptible CSS transitions** on `data-[state]`, so rapid open/close retargets instead of replaying a fixed timeline.

**Architecture:** Do **not** rely on Radix `Presence` for CSS-transition
teardown. Radix Presence is animation-gated (`animationName` /
`animationend`), while this work removes the keyframes that currently provide
both the enter 0% frame and the exit unmount delay. The spike must first add a
small Nexus transition-presence helper that uses `forceMount`, owns the visual
motion state, waits for `transitionend`, and gates exiting content from pointer
and focus access. Teardown means **full unmount** of the Radix
portal/content/overlay subtree after the exit transition completes; a mounted
but visually hidden/deactivated subtree is not an acceptable closed state
because modal Radix side effects such as scroll lock, outside hiding, and focus
scope are Presence-gated. The precursor PR must prove the helper on both
Popover (non-modal positioning surface) and Dialog (modal side-effect surface)
before any recipe fans out to other overlays.

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
- **Teardown means full unmount** - after the visible exit transition ends, the
  helper must unmount the Radix portal/content/overlay subtree. Do not keep a
  closed modal subtree mounted as `aria-hidden`, pointer-blocked, or otherwise
  "deactivated"; that leaves modal side effects alive.
- **Split precursor from fan-out** - the first implementation PR is the shared
  helper plus Popover and Dialog spikes only. Remaining overlay surfaces move in
  follow-up PRs after the modal and non-modal contracts are proven.
- **No `@starting-style` for this work** - it is below the Nexus browser floor.
- Tailwind v4 scale/translate utilities emit individual transform properties.
  Use `nx:transition-[opacity,scale]` for fade+scale surfaces and
  `nx:transition-[opacity,translate]` (or `opacity,scale,translate` where both
  are used) for directional slide surfaces. Do **not** use
  `transition-[opacity,transform]` for `scale-95`.
- Exiting content must be gated: no pointer interaction and no focusable
  descendants reachable by Tab while the exit is in progress. Do not create a
  visible semantic node that is also `aria-hidden`. If a visual-only exit shell
  is used, the semantic Radix subtree must already be unmounted and the shell
  must be non-focusable, `aria-hidden`, and pointer-events-none. Do not rely on
  `inert` unless the PR names a Safari 15.4-safe fallback.
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
- `packages/react/src/components/drawer/drawer.tsx:72` — Nexus owns this scrim
  recipe; Vaul owns the drawer primitive/panel lifecycle. Verify the Nexus
  scrim keyframes separately and leave Vaul panel lifecycle out of scope unless
  evidence proves Nexus-owned close timing controls interruptibility.
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
  state (`opacity < 1` or equivalent exiting-state class + computed opacity);
- a close interrupted by a re-open cancels stale teardown and leaves the panel
  present/open;
- final `transitionend` fully unmounts the Radix portal/content subtree;
- the exiting state blocks pointer interaction and keyboard focus.

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
    await userEvent.tab();
    await expect(panel).not.toContainElement(document.activeElement);

    await userEvent.click(trigger);
    const reopenedContent = await within(document.body).findByText('Content');
    const reopenedPanel = reopenedContent.closest(
      '[data-slot="popover-content"]'
    )!;
    await waitFor(() =>
      expect(reopenedPanel).toHaveAttribute('data-motion-state', 'open')
    );
    await expect(reopenedPanel).toBeVisible();

    await userEvent.keyboard('{Escape}');
    reopenedPanel.dispatchEvent(
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
  animated property (`opacity` for fade+scale), then fully unmount the Radix
  portal/content subtree. Ignore stale transitionend events after an interrupted
  reopen.
- Exiting content gets no pointer interaction and focus gating. Do not add
  `aria-hidden` to a still-visible semantic content node. If the implementation
  uses `inert`, first verify Safari 15.4 support or provide a fallback because
  `inert` may sit outside the Nexus floor.

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

### Task 2: Add the Dialog modal spike gate before fan-out

**Files:** `overlay-layout.ts`, `dialog.tsx`, `Dialog.stories.tsx`, and the
shared transition-presence helper from Task 1.

Popover proves the non-modal positioning case only. It does not exercise
Dialog's modal Radix path, including scroll lock, outside `aria-hidden`
management, or focus return. Do not fan out to any other surface until Dialog
proves the helper releases those modal side effects by fully unmounting after
exit.

Required assertions:

- opening Dialog renders content and overlay visibly;
- Dialog content and scrim have no `animate-in` / `animate-out` keyframe
  utilities;
- Dialog content and scrim include `nx:motion-reduce:transition-none`;
- computed `transition-property` includes `opacity` and `scale` for content;
- computed `transition-property` includes `opacity` for the scrim, and the scrim
  recipe does not add scale;
- closing leaves content/overlay mounted long enough to observe the visible exit
  state;
- no still-visible Dialog content node is marked `aria-hidden`;
- a close interrupted by a re-open cancels stale teardown; re-query the content
  node after the re-open before asserting or dispatching `transitionend`;
- final `transitionend` fully unmounts the current Dialog content and overlay;
- after final unmount, body scroll lock is released, outside `aria-hidden`
  mutations are cleaned up, and focus returns to the trigger.
- focus gating is evidenced either by an automated Tab assertion while exiting
  or, if the portal/focus trap makes that unstable in Storybook, by an explicit
  manual focus-gating checklist item in the PR body.

- [ ] **Step 1:** Write the failing Dialog story/play-fn for the assertions
      above. Run `pnpm test:storybook dialog` -> FAIL.
- [ ] **Step 2:** Apply the helper to Dialog/AlertDialog layout content and
      scrim. Use `nx:transition-[opacity,scale]` for content and
      `nx:transition-opacity` for scrim. Preserve existing open/close
      duration/ease tokens. Run `pnpm test:storybook dialog` -> PASS.
- [ ] **Step 3:** Commit the modal proof separately:

```bash
git add packages/react/src/components/dialog packages/react/src/components/overlay-layout
git commit -m "feat(motion): prove modal overlay transition teardown (#598)"
```

---

### Task 3: Validate and open the precursor sub-PR

- [ ] `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:storybook` — all green.
- [ ] Open PR:

```bash
git push -u origin aishvarya/motion-overlay-interruptible
gh pr create --base main \
  --title "feat(motion): prove interruptible overlay transition teardown (E1 of #598)" \
  --body "$(cat <<'EOF'
## Summary
Introduce the Nexus transition-presence helper and prove interruptible open/close on Popover and Dialog before fan-out. The helper uses `forceMount` only during visible exit, then fully unmounts the Radix portal/content/overlay subtree so modal side effects release naturally. Loading/height keyframes untouched.

## GitHub Issue
Part of #598 (Workstream E, principle #4). Sub-PR 1 of 4.

## Test Plan
- [ ] lint / format:check / typecheck / test:storybook green
- [ ] Popover spike proves forceMount + Nexus transitionend teardown + exiting-state gating
- [ ] Dialog spike proves full unmount releases scroll lock, outside aria-hidden cleanup, and focus return
- [ ] Popover/Dialog play-fns: no `animate-in` / `animate-out` class, `motion-reduce:transition-none` present, computed transition-property matches opacity/scale, exit visibly paints, interruption cancels stale teardown
- [ ] Exiting-state focus gating covered by automated Tab assertions or called out as a manual focus-gating checklist where Storybook focus-trap behavior is unstable

## Modern Web Guidance / polish.md
- Existing `nx:duration-*` / `nx:ease-*` tokens (no parallel scale); reduced-motion guarded; opacity plus individual scale/translate properties only. Radix Presence is animation-gated, so CSS-transition teardown is owned by the Nexus helper. Visible semantic nodes are not marked aria-hidden; inert is avoided unless a Safari 15.4 fallback is named.
EOF
)"
```

---

### Task 4: Apply the verified recipe to remaining surfaces in follow-up PRs

**Files:** each surface in File Structure above (except Popover and
Dialog/AlertDialog).

Do not fan out until Tasks 1-3 land the precursor PR with non-modal and modal
tests. For each follow-up surface, move from Radix/animation-state classes to
the shared transition-presence contract, then adapt only the visual recipe.

- **Popover-family fade+scale surfaces** (dropdown-menu, context-menu, menubar,
  select, hover-card): use
  `nx:transition-[opacity,scale]`, closed opacity/scale, preserved open/close
  duration/ease tokens, and closed pointer/focus gating.
- **Tooltip** (`tooltip.tsx:82,83`): convert the unconditional enter keyframes
  and closed keyframes to the same helper-backed fade+scale recipe. Verify
  tooltip delay/escape behavior still works.
- **Sheet** (`sheet.tsx:80,102`): scrim is opacity only; panel uses directional
  translate. Tailwind v4 translate utilities emit the individual `translate`
  property, so the panel transition property must include `translate`, not only
  `transform`.
- **Drawer** (`drawer.tsx:72`): Nexus owns the scrim recipe at this line; Vaul
  owns the drawer primitive/panel lifecycle. Verify the Nexus scrim keyframes
  independently. Keep Vaul panel lifecycle out of this PR unless evidence proves
  Nexus-owned close timing controls interruptibility; if excluded, say so in the
  PR body.
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
      PASS. Manually confirm pointer/focus gating in the exiting state.
- [ ] **Step 3:** Commit per surface or in small logical groups (e.g.
      popover-family, panels, navigation-menu):

```bash
git add packages/react/src/components/<surface>
git commit -m "feat(motion): interruptible transitions for <surface> open/close (#598)"
```

---

## Self-Review

**Spec coverage (#4):** all `data-[state=open]:animate-in/out` surfaces enumerated; helper + recipe proven on Popover (Task 1) and Dialog (Task 2) before the precursor PR opens (Task 3) and before any follow-up fan-out (Task 4). Loading/height keyframes explicitly excluded. Drawer split is sharpened: Nexus owns the scrim recipe, while Vaul panel lifecycle remains out of scope unless evidence proves Nexus-owned close timing controls interruptibility.

**Placeholder scan:** the Popover recipe is concrete (exact REMOVE/ADD class lists), Dialog has a required modal side-effect spike, and remaining surfaces are grouped by motion shape: fade+scale, opacity-only scrim, or directional translate. The "precursor then fan-out" structure is deliberate because Radix Presence cannot be trusted for transition teardown.

**Type/name consistency:** `data-slot="popover-content"`, `data-motion-state`, computed `transition-property`, and `motion-reduce:transition-none` are aligned between the implementation recipe and the assertions. `scale-95` maps to `scale`, not `transform`, under Tailwind v4.
