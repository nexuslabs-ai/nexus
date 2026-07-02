# Image Outlines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Workstream B / issue #596 — give Avatar and ItemMedia images a subtle 1px inset hairline so they don't blend into the surface, using a floor-safe Root `::after` pseudo-element (never `outline` on the element, never inset shadow on the `<img>`).

**Architecture:** Add an inset hairline via `::after` on the component root (a non-replaced element): `after:inset-0 after:rounded-[inherit] after:outline after:outline-1 after:-outline-offset-1` in **pure black @10% (light) / pure white @10% (dark)** — a tinted token would read as dirt on the edge. The Root `::after` follows the border radius (circle + rounded) and paints reliably across the whole floor, unlike `outline` on the element (rectangular < Safari 16.4) or inset `box-shadow` on a replaced `<img>` (often non-painting). Verified by class-presence + visual stories.

**Tech Stack:** React, Tailwind v4 (`nx:` prefix, `after:` variant, `-outline-offset`), Radix Avatar, Storybook 10 (`storybook/test`).

## Global Constraints

- **Pure black/white only** for the hairline (`black/10` light, `white/10` dark). This is the one sanctioned `nx:dark:` case on a raw primitive (per components.md). Do **not** use a tinted border token.
- **Floor-safe technique:** Root `::after`, not element `outline`, not `<img>` inset shadow.
- **`nx:` prefix before every modifier;** semantic tokens elsewhere; `pnpm lint` (eslint-plugin-nexus) may flag the raw `black`/`white` — if so, add a scoped `eslint-disable` with a reason (see Task 1 Step 4).
- **Tests are stories.** **Pre-production:** change in place. **PR:** `feat(polish): …`, base `main`, body `Closes #596`, Summary + Test Plan + polish.md evidence (incl. light/dark + circle/rounded + Safari-floor visual check).

---

## File Structure

- `packages/react/src/components/avatar/avatar.tsx:8` — add the `::after` hairline to `avatarVariants` base.
- `packages/react/src/components/avatar/Avatar.stories.tsx` — class-presence + light/dark visual story.
- `packages/react/src/components/item/item.tsx:134` — add the `::after` hairline to the `image` variant of `itemMediaVariants`.
- `packages/react/src/components/item/Item.stories.tsx` — class-presence story on ItemMedia image.

---

### Task 1: Avatar image hairline

**Files:** `avatar.tsx:8`, `Avatar.stories.tsx`.

**Interfaces:** Consumes — nothing. Produces — nothing.

- [ ] **Step 1: Write the failing test**

Add to `Avatar.stories.tsx` (reuse existing `Avatar`, `AvatarImage`, `AvatarFallback` imports + `expect` from `storybook/test`):

```tsx
export const ImageHairline: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="avatar"]');
    await expect(root).toHaveClass('nx:after:outline-black/10');
    await expect(root).toHaveClass('nx:dark:after:outline-white/10');
  },
};
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test:storybook avatar`
Expected: FAIL — the avatar root has no `::after` hairline.

- [ ] **Step 3: Implement**

In `packages/react/src/components/avatar/avatar.tsx`, change the base string at line 8 from:

```ts
const avatarVariants = cva('nx:relative nx:flex nx:shrink-0', {
```

to:

```ts
const avatarVariants = cva(
  'nx:relative nx:flex nx:shrink-0 nx:after:pointer-events-none nx:after:absolute nx:after:inset-0 nx:after:rounded-[inherit] nx:after:outline nx:after:outline-1 nx:after:-outline-offset-1 nx:after:outline-black/10 nx:dark:after:outline-white/10',
  {
```

(Root is already `nx:relative`, so the `::after` positions correctly. It rings the whole avatar including the fallback tile — the intended consistent edge.)

- [ ] **Step 4: Run to verify it passes + lint**

Run: `pnpm test:storybook avatar && pnpm lint`
Expected: story PASS. If `pnpm lint` flags `nx:after:outline-black/10` / `nx:dark:after:outline-white/10` as a raw primitive, add this directly above `const avatarVariants = cva(` and re-run lint:

```ts
// eslint-disable-next-line @nexus/no-raw-primitives -- image hairline requires pure black/white; a tinted token reads as dirt on the edge (#596)
```

(Use the exact rule id `pnpm lint` reports. Avatar already carries one such coded exception, so this pattern is precedented.)

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/avatar
git commit -m "feat(avatar): subtle image hairline via root ::after (black/10, white/10 dark)"
```

---

### Task 2: ItemMedia image hairline

**Files:** `item.tsx:134`, `Item.stories.tsx`.

**Interfaces:** Consumes — nothing. Produces — nothing.

- [ ] **Step 1: Write the failing test**

Add to `Item.stories.tsx` (reuse existing `Item`, `ItemMedia` imports + `expect`):

```tsx
export const MediaImageHairline: Story = {
  render: () => (
    <Item>
      <ItemMedia variant="image">
        <img
          src="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="
          alt=""
        />
      </ItemMedia>
    </Item>
  ),
  play: async ({ canvasElement }) => {
    const media = canvasElement.querySelector('[data-slot="item-media"]');
    await expect(media).toHaveClass('nx:after:outline-black/10');
    await expect(media).toHaveClass('nx:dark:after:outline-white/10');
  },
};
```

(Confirm the `data-slot` ItemMedia sets — adjust the selector if it differs, e.g. `[data-slot="item-media"]`.)

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test:storybook item`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `packages/react/src/components/item/item.tsx`, change the `image` variant at line 134 from:

```ts
        image:
          'nx:size-10 nx:overflow-hidden nx:rounded-sm nx:[&_img]:size-full nx:[&_img]:object-cover',
```

to:

```ts
        image:
          'nx:relative nx:size-10 nx:overflow-hidden nx:rounded-sm nx:[&_img]:size-full nx:[&_img]:object-cover nx:after:pointer-events-none nx:after:absolute nx:after:inset-0 nx:after:rounded-[inherit] nx:after:outline nx:after:outline-1 nx:after:-outline-offset-1 nx:after:outline-black/10 nx:dark:after:outline-white/10',
```

(The wrapper is `overflow-hidden`; the inset `::after` at `-outline-offset-1` renders 1px inside the edge, within the clip.)

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test:storybook item && pnpm lint`
Expected: PASS (add the same scoped `eslint-disable` above `const itemMediaVariants = cva(` if lint flags the primitive).

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/item
git commit -m "feat(item): image-media hairline via ::after (black/10, white/10 dark)"
```

---

### Task 3: Validate and open the PR

- [ ] **Step 1:** `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:storybook` — all green.
- [ ] **Step 2:** Visually confirm the hairline in Storybook on **light + dark** surfaces and **circle + rounded** avatars, and (if available) a Safari-15.4 check that the ring follows the radius.
- [ ] **Step 3:** Open the PR:

```bash
git push -u origin <branch>
gh pr create --base main \
  --title "feat(polish): subtle image hairline on Avatar + ItemMedia" \
  --body "$(cat <<'EOF'
## Summary
- Avatar and ItemMedia images gain a 1px inset hairline (black/10 light, white/10 dark) via a Root `::after`, so images don't blend into the surface.
- Floor-safe: Root `::after` follows the radius on circle + rounded and paints across the whole floor (unlike element `outline` < Safari 16.4 or inset shadow on a replaced `<img>`).

## GitHub Issue
Closes #596

## Test Plan
- [ ] lint / format:check / typecheck / test:storybook green
- [ ] Class-presence stories; visual check light/dark + circle/rounded + Safari floor

## Modern Web Guidance
- `::after` + `-outline-offset` universally supported; pure black/white avoids tinted-edge "dirt"; `nx:dark:` on a raw primitive is the one sanctioned primitive case (components.md).
EOF
)"
```

---

## Self-Review

**Spec coverage (#596):** Avatar hairline (Task 1) + ItemMedia hairline (Task 2), both via Root `::after`, pure black/white, floor-safe. No gaps.

**Placeholder scan:** exact before/after cva strings; test code complete. The lint-disable step names a concrete conditional and the exact reason; the ItemMedia `data-slot` verification is a one-line confirm, not deferred logic.

**Type/name consistency:** `data-slot="avatar"` (avatar.tsx:116) matches; the hairline class list is byte-identical between Avatar and ItemMedia impl steps and their assertions.
