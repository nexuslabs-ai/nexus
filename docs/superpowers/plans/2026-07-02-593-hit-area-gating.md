# Hit-Area Gating Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the touch-a11y regression in issue #593 — close/action hit-areas that gate their `::after` extension by **viewport** (`nx:lg:after:hidden`) collapse to ~24px on large touchscreens. Switch all three sites to **pointer-modality** gating (`nx:pointer-coarse:after:*`), as Button already does.

**Architecture:** Three identical class swaps: replace `nx:after:absolute nx:after:-inset-N nx:lg:after:hidden` (always-on overlay, hidden at `lg`) with `nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-N` (overlay present only for coarse pointers, at any viewport). No behaviour change for mouse users; touch users keep the ~44px target at every width. Verified by class-presence story assertions.

**Tech Stack:** React, Tailwind v4 (`nx:` prefix, `pointer-coarse:` variant), Radix (Dialog/Sheet portal, Sidebar), Storybook 10 (`storybook/test` play functions).

## Global Constraints

_Every task's requirements implicitly include this section._

- **Touch target floor:** interactive controls must clear ~44px on coarse pointers (WCAG 2.5.5). The `::after` inset extends the visible box to that target.
- **Modality, not viewport:** gate the hit-area with `nx:pointer-coarse:` (matches `button.tsx` icon sizes), never `nx:lg:`. A large touchscreen is `≥lg` _and_ coarse-pointer.
- **`nx:` prefix before every modifier;** semantic tokens only; no raw primitives (eslint-plugin-nexus enforces at `pnpm lint` + pre-commit).
- **Tests are stories** (play functions in `*.stories.tsx`, imports from `storybook/test`). No separate `*.test.tsx` for components.
- **Pre-production:** change in place; no backcompat/flags.
- **PR:** conventional title `fix(a11y): …`, base `main`, body `Closes #593`, include Summary + Test Plan + the polish.md evidence checklist.

---

## File Structure

- `packages/react/src/components/overlay-layout/overlay-layout.ts` — line 106: swap gating on `overlayCloseButtonClassName` (used by Dialog + Sheet close).
- `packages/react/src/components/dialog/Dialog.stories.tsx` — add a class-presence story on the portaled close button.
- `packages/react/src/components/sidebar/sidebar.tsx` — lines 700 and 934: swap gating (identical string both places).
- `packages/react/src/components/sidebar/Sidebar.stories.tsx` — add a class-presence story on `SidebarMenuAction`.

---

### Task 1: Overlay close button — modality-gate the hit area

**Files:**

- Modify: `packages/react/src/components/overlay-layout/overlay-layout.ts:106`
- Test: `packages/react/src/components/dialog/Dialog.stories.tsx`

**Interfaces:** Consumes — nothing. Produces — nothing.

- [ ] **Step 1: Write the failing test**

Add this story to `Dialog.stories.tsx` (reuse the file's existing `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` imports and `expect` from `storybook/test`; add any missing). The Dialog renders open, so the portaled close button is in `document.body`:

```tsx
export const CloseHitAreaModalityGated: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hit area</DialogTitle>
          <DialogDescription>
            Close hit area is pointer-gated.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async () => {
    const close = document.body.querySelector(
      '[data-slot="dialog-close-button"]'
    );
    await expect(close).not.toHaveClass('nx:lg:after:hidden');
    await expect(close).toHaveClass('nx:pointer-coarse:after:-inset-2.5');
  },
};
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:storybook dialog`
Expected: FAIL — the close button still carries `nx:lg:after:hidden` and lacks the coarse-gated class.

- [ ] **Step 3: Write the minimal implementation**

In `packages/react/src/components/overlay-layout/overlay-layout.ts`, replace line 106:

```ts
  'nx:after:absolute nx:after:-inset-2.5 nx:lg:after:hidden',
```

with:

```ts
  'nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-2.5',
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:storybook dialog`
Expected: PASS. (Sheet reuses the same `overlayCloseButtonClassName`, so it is fixed too.)

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/overlay-layout/overlay-layout.ts packages/react/src/components/dialog/Dialog.stories.tsx
git commit -m "fix(a11y): modality-gate overlay close hit area (drop lg:after:hidden)"
```

---

### Task 2: Sidebar actions — modality-gate the hit area

**Files:**

- Modify: `packages/react/src/components/sidebar/sidebar.tsx:700` and `:934` (identical string in both)
- Test: `packages/react/src/components/sidebar/Sidebar.stories.tsx`

**Interfaces:** Consumes — nothing. Produces — nothing.

- [ ] **Step 1: Write the failing test**

Add this story to `Sidebar.stories.tsx` (reuse the file's existing sidebar imports and the provider scaffold from its default story; `expect` from `storybook/test`):

```tsx
export const MenuActionHitAreaModalityGated: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>Item</SidebarMenuButton>
              <SidebarMenuAction aria-label="More">…</SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const action = canvasElement.querySelector(
      '[data-slot="sidebar-menu-action"]'
    );
    await expect(action).not.toHaveClass('nx:lg:after:hidden');
    await expect(action).toHaveClass('nx:pointer-coarse:after:-inset-2');
  },
};
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:storybook sidebar`
Expected: FAIL — `SidebarMenuAction` still carries `nx:lg:after:hidden`.

- [ ] **Step 3: Write the minimal implementation**

In `packages/react/src/components/sidebar/sidebar.tsx`, at **both** line 700 and line 934, replace the identical string:

```tsx
        'nx:after:absolute nx:after:-inset-2 nx:lg:after:hidden',
```

with:

```tsx
        'nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-2',
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:storybook sidebar`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/sidebar/sidebar.tsx packages/react/src/components/sidebar/Sidebar.stories.tsx
git commit -m "fix(a11y): modality-gate sidebar action hit areas (drop lg:after:hidden)"
```

---

### Task 3: Validate and open the PR

**Files:** none.

- [ ] **Step 1: Run the full gates**

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:storybook
```

Expected: all PASS. Fix anything red before proceeding.

- [ ] **Step 2: Open the PR**

```bash
git push -u origin aishvarya/hit-area-gating
gh pr create --base main \
  --title "fix(a11y): modality-gate touch hit-areas (was viewport-gated)" \
  --body "$(cat <<'EOF'
## Summary
- Overlay close button (Dialog/Sheet) and sidebar actions gated their touch hit-area `::after` by viewport (`lg:after:hidden`), so on a large touchscreen the target collapsed to ~24px.
- Switched all three sites to `pointer-coarse:` modality gating (matches Button). Mouse users: unchanged. Touch users: ~44px target at every width.

## GitHub Issue
Closes #593

## Test Plan
- [ ] pnpm lint / format:check / typecheck / test:storybook green
- [ ] Dialog + Sidebar stories assert the coarse-gated class and absence of `lg:after:hidden`

## Modern Web Guidance
- No new browser-platform feature; `pointer-coarse` (pointer media query) is universally supported across the Nexus floor. WCAG 2.5.5 target-size.
EOF
)"
```

---

## Self-Review

**Spec coverage (#593):** viewport→modality gating at all three sites — overlay close (Task 1), sidebar ×2 (Task 2). No gaps.

**Placeholder scan:** exact before/after strings for all three edits; test code complete. The only "reuse existing scaffold" note (Sidebar provider) points at a concrete existing story, not a placeholder for logic.

**Type/name consistency:** `data-slot="dialog-close-button"` (dialog.tsx:190) and `data-slot="sidebar-menu-action"` (sidebar.tsx:930) match source; the replacement class `nx:pointer-coarse:after:-inset-2.5` / `-inset-2` is identical between each impl step and its assertion.
