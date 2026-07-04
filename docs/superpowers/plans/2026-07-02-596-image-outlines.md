# Image Outlines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Workstream B / issue #596 — give Avatar and ItemMedia images a subtle 1px inset hairline so they don't blend into the surface, using a floor-safe Root `::after` pseudo-element (never `outline` on the element, never inset shadow on the `<img>`).

**Architecture:** Add an inset hairline via `::after` on the component root (a non-replaced element): `after:inset-0 after:rounded-[inherit] after:outline after:outline-1 after:-outline-offset-1` using the semantic `border-hairline` color. That semantic resolves to pure black @9.4% in light mode and pure white @9.4% in dark mode — a tinted token would read as dirt on the edge. The Root `::after` follows the border radius (circle + rounded) and paints reliably across the whole floor, unlike `outline` on the element (rectangular < Safari 16.4) or inset `box-shadow` on a replaced `<img>` (often non-painting). Verified by computed `::after` outline-color assertions + visual stories.

**Tech Stack:** React, Tailwind v4 (`nx:` prefix, `after:` variant, `-outline-offset`), Radix Avatar, Storybook 10 (`storybook/test`).

## Global Constraints

- **Pure black/white alpha only** for the hairline via semantic `--nx-color-border-hairline`. Do **not** use Tailwind palette classes like `outline-black/10` / `outline-white/10`; `nexus.css` resets `--color-*` primitives to `initial`, so those classes do not emit the intended color. Do **not** use a tinted border token.
- **Floor-safe technique:** Root `::after`, not element `outline`, not `<img>` inset shadow.
- **`nx:` prefix before every modifier;** use `nx:after:outline-border-hairline` for the hairline colour.
- **Tests are stories.** **Pre-production:** change in place. **PR:** `feat(polish): …`, base `main`, body `Closes #596`, Summary + Test Plan + polish.md evidence (incl. light/dark + circle/rounded + Safari-floor visual check).

---

## File Structure

- `packages/react/src/components/avatar/avatar.tsx:8` — add the `::after` hairline to `avatarVariants` base.
- `packages/react/src/components/avatar/Avatar.stories.tsx` — computed `::after` outline-color + light/dark visual story.
- `packages/react/src/components/item/item.tsx:134` — add the `::after` hairline to the `image` variant of `itemMediaVariants`.
- `packages/react/src/components/item/Item.stories.tsx` — computed `::after` outline-color story on ItemMedia image.

---

### Task 1: Avatar image hairline

**Files:** `avatar.tsx:8`, `Avatar.stories.tsx`.

**Interfaces:** Consumes — nothing. Produces — nothing.

- [ ] **Step 1: Write the failing test**

Add to `Avatar.stories.tsx` (reuse existing `Avatar`, `AvatarImage`, `AvatarFallback` imports + `expect` from `storybook/test`; assert computed `::after` output rather than class presence):

```tsx
export const ImageHairline: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="avatar"]');
    expectAvatarHairline(root);
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
  'nx:relative nx:flex nx:shrink-0 nx:after:pointer-events-none nx:after:absolute nx:after:inset-0 nx:after:rounded-[inherit] nx:after:outline nx:after:outline-1 nx:after:-outline-offset-1 nx:after:outline-border-hairline',
  {
```

(Root is already `nx:relative`, so the `::after` positions correctly. It rings the whole avatar including the fallback tile — the intended consistent edge.)

- [ ] **Step 4: Run to verify it passes + lint**

Run: `pnpm test:storybook avatar && pnpm lint`
Expected: story PASS. The test must verify `getComputedStyle(root, '::after').outlineColor` resolves to `--nx-color-border-hairline`; class-presence alone is insufficient because stripped Tailwind palette classes can stay present while emitting no color.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/avatar
git commit -m "feat(avatar): subtle image hairline via root ::after"
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
    expectMediaHairline(media);
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
          'nx:relative nx:size-10 nx:overflow-hidden nx:rounded-sm nx:[&_img]:size-full nx:[&_img]:object-cover nx:after:pointer-events-none nx:after:absolute nx:after:inset-0 nx:after:rounded-[inherit] nx:after:outline nx:after:outline-1 nx:after:-outline-offset-1 nx:after:outline-border-hairline',
```

(The wrapper is `overflow-hidden`; the inset `::after` at `-outline-offset-1` renders 1px inside the edge, within the clip.)

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test:storybook item && pnpm lint`
Expected: PASS; the story must assert the computed `::after` outline, not only the wrapper class string.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/item
git commit -m "feat(item): image-media hairline via ::after"
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
- Avatar and ItemMedia images gain a 1px inset hairline (`--nx-color-border-hairline`) via a Root `::after`, so images don't blend into the surface.
- Floor-safe: Root `::after` follows the radius on circle + rounded and paints across the whole floor (unlike element `outline` < Safari 16.4 or inset shadow on a replaced `<img>`).

## GitHub Issue
Closes #596

## Test Plan
- [ ] lint / format:check / typecheck / test:storybook green
- [ ] Computed `::after` outline-color stories; visual check light/dark + circle/rounded + Safari floor

## Modern Web Guidance
- Search query: `image outline pseudo-element inset hairline border radius CSS`.
- NPX was unavailable/rejected in the implementation environment, so the fallback path is the repo-local Modern Web Guidance skill plus the approved plan and the Nexus browser floor.
- `::after`, `outline`, `outline-offset`, `inset: 0`, `border-radius: inherit`, and CSS custom properties are floor-safe here; `border-hairline` formalizes the pure black/white alpha edge inside the Nexus token layer.
EOF
)"
```

---

## Self-Review

**Spec coverage (#596):** Avatar hairline (Task 1) + ItemMedia hairline (Task 2), both via Root `::after`, semantic `border-hairline`, floor-safe.

**Placeholder scan:** exact before/after cva strings; test code complete. The ItemMedia `data-slot` verification is a one-line confirm, not deferred logic.

**Type/name consistency:** `data-slot="avatar"` and `data-slot="item-media"` match the story selectors; the hairline class list is byte-identical between Avatar and ItemMedia implementation steps, and stories assert the computed pseudo-element result.
