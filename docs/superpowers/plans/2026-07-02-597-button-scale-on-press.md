# Button Scale-on-Press Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Workstream D / issue #597 — give every Button a subtle tactile shrink (`scale(0.96)`) on press, default-on, layered on top of the existing color-darken cue, suppressed under reduced motion, and excluded from the text-only `link` variant.

**Architecture:** Add `nx:active:scale-[0.96]` to the `buttonVariants` base and widen the base transition to include `scale`; add `nx:motion-reduce:active:scale-100` so reduced-motion users get no shrink (there is no global motion reset). The `link` variant opts out with `nx:active:scale-100`. `scale` is a GPU-composited transform (floor-safe). Verified by class-presence stories; reduced-motion proven by a `motion-reduce` assertion.

**Tech Stack:** React, Tailwind v4 (`nx:` prefix, `active:`/`motion-reduce:` variants, arbitrary `scale-[0.96]`), CVA, Storybook 10 (`storybook/test`).

## Global Constraints

- **Default-on** across all variants **except `link`** (text — a shrink reads wrong).
- **Layer on top of** the existing `active:bg-*` press cue — do not replace it.
- **Reduced motion:** `nx:motion-reduce:active:scale-100` (no global reset exists).
- **No `transition: all`** — the base transition lists exact properties.
- **Motion tokens:** the transition uses the existing token-backed default duration/easing; `scale-[0.96]` is the Button-local press distance. Do not invent a new motion scale. `nx:` prefix before every modifier; semantic tokens only.
- **Tests are stories.** **Pre-production:** change in place. **PR:** `feat(polish): …`, base `main`, body `Closes #597`, Summary + Test Plan + polish.md evidence (incl. reduced-motion).

---

## File Structure

- `packages/react/src/components/button/button.tsx:11` — base cva: add `active:scale-[0.96]` + reduced-motion opt-out; widen transition to include `scale`.
- `packages/react/src/components/button/button.tsx:29` — `link` variant: opt out with `active:scale-100`.
- `packages/react/src/components/button/Button.stories.tsx` — class-presence stories (default press + reduced-motion opt-out + link exclusion).

---

### Task 1: Scale-on-press on the base, opt out `link`

**Files:** `button.tsx:11`, `button.tsx:29`, `Button.stories.tsx`.

**Interfaces:** Consumes — nothing. Produces — nothing.

- [ ] **Step 1: Write the failing test**

Add to `Button.stories.tsx` (reuse existing `Button` import + `expect` from `storybook/test`):

```tsx
export const PressScale: Story = {
  render: () => (
    <div>
      <Button>Default</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [primary, link] = canvasElement.querySelectorAll(
      '[data-slot="button"]'
    );
    // Default button shrinks on press, suppressed under reduced motion.
    await expect(primary).toHaveClass('nx:active:scale-[0.96]');
    await expect(primary).toHaveClass('nx:motion-reduce:active:scale-100');
    // Link opts out.
    await expect(link).toHaveClass('nx:active:scale-100');
    await expect(link).not.toHaveClass('nx:active:scale-[0.96]');
  },
};
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test:storybook button`
Expected: FAIL — no scale classes present yet.

- [ ] **Step 3: Implement**

In `packages/react/src/components/button/button.tsx`, in the base cva string (line 11), replace `nx:transition-colors` with:

```
nx:transition-[color,background-color,border-color,scale] nx:active:scale-[0.96] nx:motion-reduce:active:scale-100
```

So the relevant span of the base string changes from:

```
nx:whitespace-nowrap nx:transition-colors nx:focus-visible:outline-2
```

to:

```
nx:whitespace-nowrap nx:transition-[color,background-color,border-color,scale] nx:active:scale-[0.96] nx:motion-reduce:active:scale-100 nx:focus-visible:outline-2
```

Then, in the `link` variant (line 29), append `nx:active:scale-100` so link text does not shrink:

```tsx
        link: 'nx:border-0 nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline nx:active:scale-100 nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
```

(CVA appends the variant class after the base, so `active:scale-100` wins over the base `active:scale-[0.96]` for `link`; `cn()`/tailwind-merge collapses the conflicting scale utility before the CSS cascade needs to arbitrate it.)

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test:storybook button`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/button
git commit -m "feat(button): tactile scale-on-press (0.96), reduced-motion-safe, link excluded"
```

---

### Task 2: Validate and open the PR

- [ ] **Step 1:** `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:storybook` — all green. Confirm the existing Button stories still pass (the new transition list must not drop a previously-animated color state — it covers color/background-color/border-color).
- [ ] **Step 2:** Open the PR:

```bash
git push -u origin <branch>
gh pr create --base main \
  --title "feat(polish): Button scale-on-press (default-on, reduced-motion-safe)" \
  --body "$(cat <<'EOF'
## Summary
- Every Button (except the text `link` variant) shrinks to `scale(0.96)` on press for tactile feedback, layered on top of the existing `active:bg-*` cue.
- Suppressed under `prefers-reduced-motion` via `motion-reduce:active:scale-100`; base transition lists exact properties (no `transition: all`).

## GitHub Issue
Closes #597

## Test Plan
- [ ] lint / format:check / typecheck / test:storybook green
- [ ] Story asserts `active:scale-[0.96]` + `motion-reduce:active:scale-100` on default, and `active:scale-100` without `active:scale-[0.96]` on link

## Modern Web Guidance
- `scale` is a GPU-composited transform (web.dev high-perf animations); floor-safe. Reduced-motion honored per MDN `prefers-reduced-motion`. Uses the existing token-backed default duration/easing; no parallel motion scale introduced.

## Note
- Benchmarks (Linear/Stripe/Geist) don't scale buttons on press — this was an explicit product decision to adopt it. Sanity-check the feel in review.
EOF
)"
```

---

## Self-Review

**Spec coverage (#597):** default-on `active:scale-[0.96]` (Task 1), reduced-motion opt-out, specific transition (no `transition: all`), `link` excluded, layered on existing cue. No gaps.

**Placeholder scan:** exact before/after for both the base and `link` variant; test code complete.

**Type/name consistency:** `data-slot="button"` (button.tsx:195) matches; asserted classes `nx:active:scale-[0.96]`, `nx:motion-reduce:active:scale-100`, `nx:active:scale-100` are byte-identical to the impl step.
