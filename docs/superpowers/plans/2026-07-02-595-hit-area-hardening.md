# Hit-Area Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Workstream C / issue #595 — extend three small controls (Slider thumb, Breadcrumb ellipsis, Alert close) to a ~44px touch target via a coarse-pointer `::after` overlay, and add the same modality-gated extension to checkbox/radio/switch so a bare control clears ~44px on touch.

**Architecture:** Each control gains `nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-N` (overlay only on coarse pointers), plus `nx:relative` on plain buttons that need a positioned ancestor. Inset sizes are chosen so `visible box + 2×inset ≈ 44px`, except the Slider thumb which is **capped at `-inset-2`** so adjacent range thumbs don't overlap (collision rule). Verified by class-presence story assertions.

**Tech Stack:** React, Tailwind v4 (`nx:` prefix, `pointer-coarse:` variant), Radix (Slider, Checkbox, RadioGroup, Switch), Storybook 10 (`storybook/test`).

## Global Constraints

- **Touch floor:** ~44px on coarse pointers (WCAG 2.5.5); the `::after` inset provides it. **Collision rule:** never let two adjacent controls' hit areas overlap — cap the inset for controls that sit in tight groups (Slider range thumbs).
- **Modality gating** (`nx:pointer-coarse:`), never viewport. `nx:` prefix before every modifier; semantic tokens only; no raw primitives.
- **Tests are stories** (`storybook/test` play functions); no `*.test.tsx` for components.
- **Pre-production:** change in place. **PR:** `fix(a11y): …`, base `main`, body `Closes #595`, Summary + Test Plan + polish.md evidence.

---

## File Structure

- `packages/react/src/components/slider/slider.tsx:80` — coarse `::after` on the thumb (capped `-inset-2`).
- `packages/react/src/components/breadcrumb/breadcrumb.tsx:191` — coarse `::after` on the ellipsis trigger.
- `packages/react/src/components/alert/alert.tsx:332` — coarse `::after` on the close button.
- `packages/react/src/components/checkbox/checkbox.tsx:57`, `radio-group/radio-group.tsx:69`, `switch/switch.tsx` (base cva, ~line 15) — opt-in coarse extension.
- Stories: `Slider.stories.tsx`, `Breadcrumb.stories.tsx`, `Alert.stories.tsx`, `Checkbox.stories.tsx`, `RadioGroup.stories.tsx`, `Switch.stories.tsx`.

---

### Task 1: Top-tier controls (Slider thumb, Breadcrumb ellipsis, Alert close)

**Files:** the three component files above + their stories.

**Interfaces:** Consumes — nothing. Produces — nothing.

- [ ] **Step 1: Write the failing tests**

Add a class-presence story to each of the three stories files (reuse each file's existing component imports + `expect` from `storybook/test`):

`Slider.stories.tsx`:

```tsx
export const ThumbTouchTarget: Story = {
  render: () => <Slider defaultValue={[50]} aria-label="Volume" />,
  play: async ({ canvasElement }) => {
    const thumb = canvasElement.querySelector('[role="slider"]');
    await expect(thumb).toHaveClass('nx:pointer-coarse:after:-inset-2');
  },
};
```

`Breadcrumb.stories.tsx` (the ellipsis renders a `data-slot="breadcrumb-menu-trigger"` button; reuse the file's ellipsis/menu composition):

```tsx
export const EllipsisTouchTarget: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector(
      '[data-slot="breadcrumb-menu-trigger"]'
    );
    await expect(trigger).toHaveClass('nx:relative');
    await expect(trigger).toHaveClass('nx:pointer-coarse:after:-inset-3');
  },
};
```

`Alert.stories.tsx` (Alert with an AlertClose; reuse existing imports):

```tsx
export const CloseTouchTarget: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up</AlertTitle>
      <AlertClose aria-label="Dismiss" />
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const close = canvasElement.querySelector('[data-slot="alert-close"]');
    await expect(close).toHaveClass('nx:relative');
    await expect(close).toHaveClass('nx:pointer-coarse:after:-inset-1.5');
  },
};
```

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm test:storybook slider breadcrumb alert`
Expected: FAIL — none of the three carries the coarse `::after` yet.

- [ ] **Step 3: Implement**

**Slider** (`slider.tsx:80`) — the thumb is Radix-positioned (already a positioned ancestor), so no `nx:relative` needed. Append to the thumb `className` string, right after `nx:shrink-0`:

```
nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-2
```

(Capped at `-inset-2` = ~32px effective per the collision rule; a full 44px would overlap adjacent range thumbs. If the overlay mispositions in review, add `nx:relative` to the thumb.)

**Breadcrumb** (`breadcrumb.tsx:191`) — add `nx:relative` and the coarse overlay. Insert after `nx:shrink-0` in the class string:

```
nx:relative nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-3
```

(size-5 = 20px → +24 = 44px.)

**Alert** (`alert.tsx:332`) — change line 332 from:

```tsx
        'nx:inline-flex nx:size-8 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:text-muted-foreground',
```

to:

```tsx
        'nx:relative nx:inline-flex nx:size-8 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:text-muted-foreground',
        'nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-1.5',
```

(size-8 = 32px → +12 = 44px, matching Button `icon-sm`.)

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm test:storybook slider breadcrumb alert`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/slider packages/react/src/components/breadcrumb packages/react/src/components/alert
git commit -m "fix(a11y): coarse-pointer ~44px hit area on slider/breadcrumb/alert close"
```

---

### Task 2: Opt-in coarse extension for checkbox / radio / switch

**Files:** `checkbox.tsx:57`, `radio-group.tsx:69`, `switch.tsx` (base cva ~line 15) + their stories.

**Interfaces:** Consumes — nothing. Produces — nothing.

- [ ] **Step 1: Write the failing tests**

Add a story to each of `Checkbox.stories.tsx`, `RadioGroup.stories.tsx`, `Switch.stories.tsx` (reuse existing imports):

```tsx
// Checkbox.stories.tsx
export const TouchTarget: Story = {
  render: () => <Checkbox aria-label="Accept" />,
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('[data-slot="checkbox"]');
    await expect(box).toHaveClass('nx:relative');
    await expect(box).toHaveClass('nx:pointer-coarse:after:-inset-3.5');
  },
};
```

```tsx
// RadioGroup.stories.tsx — assert on a rendered item
export const TouchTarget: Story = {
  render: () => (
    <RadioGroup defaultValue="a">
      <RadioGroupItem value="a" aria-label="A" />
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const item = canvasElement.querySelector('[data-slot="radio-group-item"]');
    await expect(item).toHaveClass('nx:relative');
    await expect(item).toHaveClass('nx:pointer-coarse:after:-inset-3.5');
  },
};
```

```tsx
// Switch.stories.tsx
export const TouchTarget: Story = {
  render: () => <Switch aria-label="Wifi" />,
  play: async ({ canvasElement }) => {
    const sw = canvasElement.querySelector('[data-slot="switch"]');
    await expect(sw).toHaveClass('nx:relative');
    await expect(sw).toHaveClass('nx:pointer-coarse:after:-inset-3');
  },
};
```

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm test:storybook checkbox radio-group switch`
Expected: FAIL.

- [ ] **Step 3: Implement**

Add `nx:relative` + coarse overlay to each control's root class list.

**Checkbox** (`checkbox.tsx:57`) — change line 57 from:

```tsx
        'nx:group nx:peer nx:inline-flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center',
```

to:

```tsx
        'nx:group nx:peer nx:relative nx:inline-flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center',
        'nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-3.5',
```

(size-4 = 16px → +28 = 44px.)

**RadioGroup** (`radio-group.tsx:69`) — change line 69 from:

```tsx
        'nx:size-4 nx:shrink-0 nx:cursor-pointer nx:rounded-full nx:border-default nx:border-border-default nx:bg-background',
```

to:

```tsx
        'nx:relative nx:size-4 nx:shrink-0 nx:cursor-pointer nx:rounded-full nx:border-default nx:border-border-default nx:bg-background',
        'nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-3.5',
```

**Switch** (`switch.tsx`, the base cva array first element, ~line 15) — add to the base string:

```
nx:relative nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-3
```

(h-5 = 20px → +24 = 44px height; width already ≥36.)

**Collision note:** these overlays only appear on coarse pointers. In a dense _bare_ list (no label rows), 44px targets can overlap — the intended usage is one control per ≥44px label row, so this is safe for the common case; a consumer packing bare controls tightly should space them.

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm test:storybook checkbox radio-group switch`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/checkbox packages/react/src/components/radio-group packages/react/src/components/switch
git commit -m "fix(a11y): coarse-pointer ~44px hit area on checkbox/radio/switch"
```

---

### Task 3: Validate and open the PR

- [ ] **Step 1:** `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:storybook` — all green.
- [ ] **Step 2:** Open the PR:

```bash
git push -u origin <branch>
gh pr create --base main \
  --title "fix(a11y): coarse-pointer hit-area hardening (slider/breadcrumb/alert + form controls)" \
  --body "$(cat <<'EOF'
## Summary
- Slider thumb (capped, collision-safe), Breadcrumb ellipsis, Alert close now extend to ~44px on coarse pointers.
- checkbox/radio/switch gain the same modality-gated extension so a bare control clears ~44px on touch.

## GitHub Issue
Closes #595

## Test Plan
- [ ] lint / format:check / typecheck / test:storybook green
- [ ] Class-presence stories assert the coarse `::after` on each control

## Modern Web Guidance
- `pointer-coarse` universally supported across the Nexus floor; WCAG 2.5.5 target-size; collision rule respected (Slider capped).
EOF
)"
```

---

## Self-Review

**Spec coverage (#595):** top-tier Slider/Breadcrumb/Alert (Task 1) + checkbox/radio/switch (Task 2). Collision rule applied to Slider (capped `-inset-2`) and noted for form controls. No gaps.

**Placeholder scan:** exact before/after per control; test code complete. The Slider `nx:relative` fallback is a concrete conditional, not a placeholder.

**Type/name consistency:** `data-slot` values (`checkbox`, `radio-group-item`, `alert-close`, `breadcrumb-menu-trigger`, `switch`) and `[role="slider"]` match source; every asserted class matches its impl step exactly.
