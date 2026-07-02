# Workstream A — Typography Base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the four tiny, systemic typography/base-layer wins from the interface-details plan (Workstream A / issue #594) — heading `text-wrap: balance`, the `-moz-osx-font-smoothing` twin, `tabular-nums` on the chart axis + Progress demo, and replacing the lone `transition: all`.

**Architecture:** Four independent edits, each its own commit inside one PR. Two are behavioural and unit/story-tested (`appearancePrefsToCss` CSS emission; the `input-otp` transition class); one adds a deterministic class-presence story (chart `tabular-nums`); one adds `text-wrap: balance` to four `@utility` blocks, verified by a computed-style story. No new APIs, no token changes, no ripple beyond these files.

**Tech Stack:** TypeScript, Tailwind v4 (`nx:` prefix), React, Storybook 10 (`storybook/test` play functions), Vitest (`@nexus/core` unit tests), `@nexus/tailwind` CSS `@utility` definitions.

## Global Constraints

_Every task's requirements implicitly include this section._

- **Browser floor:** Chrome/Edge 111+, Firefox 113+, Safari 15.4+, Samsung 22+. `text-wrap: balance` is Safari 17.5+ / Firefox 121+ / Chrome 114+ — a **progressive enhancement** that silently no-ops below support (never gate behaviour on it).
- **Semantic tokens only; `nx:` prefix before every modifier.** No raw primitives, no raw `nx:text-*` (eslint-plugin-nexus enforces this at `pnpm lint` + pre-commit).
- **Tests are stories:** component behaviour is asserted via play functions in `*.stories.tsx` (imports from `storybook/test`). No separate `*.test.tsx` for components. `@nexus/core` logic uses `*.test.ts` (Vitest).
- **Reduced motion:** never remove existing `nx:motion-reduce:*` guards.
- **Do NOT** bake `tabular-nums` into `TableCell` — it is correctly opt-in per numeric column.
- **Pre-production:** change in place; no backcompat, shims, or flags.
- **PR:** conventional title `feat(polish): …`, base `main`, body `Closes #594`, include Summary + Test Plan + the polish.md evidence checklist.

---

## File Structure

- `packages/core/src/lib/appearance-model.ts` — modify the `appearancePrefsToCss` `html { … }` rule (line 344) to emit the `-moz-osx-font-smoothing` twin.
- `packages/core/src/lib/appearance-model.test.ts` — add a unit assertion for the twin.
- `packages/react/src/components/input-otp/input-otp.tsx` — replace `nx:transition-all` (line 123) with a scoped transition.
- `packages/react/src/components/input-otp/InputOtp.stories.tsx` — add a play-fn story asserting the scoped transition.
- `packages/react/src/components/chart/chart.tsx` — add `tabular-nums` to the cartesian-axis-tick selector (line 75).
- `packages/react/src/components/chart/Chart.stories.tsx` — add a class-presence assertion (or new story).
- `packages/react/src/components/progress/Progress.stories.tsx` — add `nx:tabular-nums` to the demo `%` readout (line 126).
- `packages/tailwind/typography-utilities.css` — add `text-wrap: balance;` to the four `typography-heading-*` `@utility` blocks (lines 3–33).
- `packages/react/src/stories/Typography.stories.tsx` — add a computed-style story proving headings balance.

---

### Task 1: `-moz-osx-font-smoothing` twin (`appearancePrefsToCss`)

**Files:**

- Modify: `packages/core/src/lib/appearance-model.ts:344`
- Test: `packages/core/src/lib/appearance-model.test.ts` (add to the existing `describe('appearancePrefsToCss')` block, ~line 292)

**Interfaces:** Consumes — nothing. Produces — nothing other tasks depend on.

- [ ] **Step 1: Write the failing test**

Add this `it` block inside the existing `describe('appearancePrefsToCss', () => { … })` in `packages/core/src/lib/appearance-model.test.ts`:

```ts
it('pairs -moz-osx-font-smoothing with the -webkit- property', () => {
  const base = {
    uiFont: 'Inter',
    codeFont: 'JetBrains Mono',
    uiFontSize: 16,
    codeFontSize: 13,
    reduceMotion: 'system' as const,
    pointerCursors: false,
    fontSmoothing: true,
  };

  const on = appearancePrefsToCss(base);
  expect(on).toContain('-webkit-font-smoothing: antialiased');
  expect(on).toContain('-moz-osx-font-smoothing: grayscale');

  const off = appearancePrefsToCss({ ...base, fontSmoothing: false });
  expect(off).toContain('-webkit-font-smoothing: auto');
  expect(off).toContain('-moz-osx-font-smoothing: auto');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:unit appearance-model`
Expected: FAIL — the `-moz-osx-font-smoothing` assertions fail (only `-webkit-` is emitted today).

- [ ] **Step 3: Write the minimal implementation**

In `packages/core/src/lib/appearance-model.ts`, replace line 344:

```ts
    `html { -webkit-font-smoothing: ${prefs.fontSmoothing ? 'antialiased' : 'auto'}; }`,
```

with:

```ts
    `html { -webkit-font-smoothing: ${prefs.fontSmoothing ? 'antialiased' : 'auto'}; -moz-osx-font-smoothing: ${prefs.fontSmoothing ? 'grayscale' : 'auto'}; }`,
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:unit appearance-model`
Expected: PASS (all assertions, including the two existing `-webkit-` ones).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/lib/appearance-model.ts packages/core/src/lib/appearance-model.test.ts
git commit -m "feat(appearance): pair -moz-osx-font-smoothing with -webkit twin"
```

---

### Task 2: Scope `input-otp` slot transition (drop `transition: all`)

**Files:**

- Modify: `packages/react/src/components/input-otp/input-otp.tsx:123`
- Test: `packages/react/src/components/input-otp/InputOtp.stories.tsx` (add a story)

**Interfaces:** Consumes — nothing. Produces — nothing.

- [ ] **Step 1: Write the failing test**

Add this story to `InputOtp.stories.tsx` (reuse the file's existing `InputOTP`, `InputOTPGroup`, `InputOTPSlot` imports and its `expect` from `storybook/test`; add them to the imports if missing):

```tsx
export const TransitionScoped: Story = {
  render: () => (
    <InputOTP maxLength={4}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  ),
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector('[data-slot="input-otp-slot"]');
    await expect(slot).not.toHaveClass('nx:transition-all');
    await expect(slot).toHaveClass(
      'nx:transition-[color,background-color,border-color]'
    );
  },
};
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:storybook input-otp`
Expected: FAIL — the slot still carries `nx:transition-all` and lacks the scoped class.

- [ ] **Step 3: Write the minimal implementation**

In `packages/react/src/components/input-otp/input-otp.tsx`, replace line 123:

```tsx
        'nx:bg-background nx:text-foreground nx:typography-body-small nx:transition-all nx:duration-fast nx:motion-reduce:transition-none',
```

with:

```tsx
        'nx:bg-background nx:text-foreground nx:typography-body-small nx:transition-[color,background-color,border-color] nx:duration-fast nx:motion-reduce:transition-none',
```

(Outline/focus-ring must stay instant, so it is intentionally excluded from the transition.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:storybook input-otp`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/input-otp/input-otp.tsx packages/react/src/components/input-otp/InputOtp.stories.tsx
git commit -m "fix(input-otp): scope slot transition to color/bg/border, drop transition-all"
```

---

### Task 3: `tabular-nums` on chart axis ticks (+ Progress demo)

**Files:**

- Modify: `packages/react/src/components/chart/chart.tsx:75`
- Modify: `packages/react/src/components/progress/Progress.stories.tsx:126`
- Test: `packages/react/src/components/chart/Chart.stories.tsx` (add a class-presence story)

**Interfaces:** Consumes — nothing. Produces — nothing.

- [ ] **Step 1: Write the failing test**

Add this story to `Chart.stories.tsx` (reuse the file's existing chart imports and `expect` from `storybook/test`; the render can reuse any existing chart composition in that file — substitute the minimal one already present, e.g. `<ChartContainer config={…}>…</ChartContainer>`):

```tsx
export const AxisTicksTabular: Story = {
  render: () => (
    <ChartContainer
      config={{
        v: { label: 'V', color: 'var(--nx-color-primary-background)' },
      }}
    >
      <LineChart
        data={[
          { name: 'A', v: 1 },
          { name: 'B', v: 1000 },
        ]}
      >
        <XAxis dataKey="name" />
        <YAxis />
        <Line dataKey="v" />
      </LineChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const chart = canvasElement.querySelector('[data-slot="chart"]');
    await expect(chart).toHaveClass(
      'nx:[&_.recharts-cartesian-axis-tick_text]:tabular-nums'
    );
  },
};
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:storybook chart`
Expected: FAIL — the chart container does not yet carry the `tabular-nums` axis-tick variant.

- [ ] **Step 3: Write the minimal implementation**

In `packages/react/src/components/chart/chart.tsx` line 75, append the tabular-nums variant next to the existing axis-tick selector. The class list currently contains:

```
nx:[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground
```

Add immediately after it (inside the same string literal):

```
nx:[&_.recharts-cartesian-axis-tick_text]:tabular-nums
```

Then, in `packages/react/src/components/progress/Progress.stories.tsx`, update the demo `%` readout at line 126 from:

```tsx
          <span className="nx:typography-label-default nx:text-muted-foreground">
```

to:

```tsx
          <span className="nx:typography-label-default nx:tabular-nums nx:text-muted-foreground">
```

(The Progress component renders no number itself; this is the documented demo pairing so an animating readout does not shift width. No separate test — it is a story markup change verified by the story rendering.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:storybook chart`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/chart/chart.tsx packages/react/src/components/chart/Chart.stories.tsx packages/react/src/components/progress/Progress.stories.tsx
git commit -m "feat(chart): tabular-nums on cartesian axis ticks; pair on Progress demo"
```

---

### Task 4: `text-wrap: balance` on the four heading utilities

**Files:**

- Modify: `packages/tailwind/typography-utilities.css` (the four `typography-heading-*` blocks, lines 3–33)
- Test: `packages/react/src/stories/Typography.stories.tsx` (add a computed-style story)

**Interfaces:** Consumes — nothing. Produces — nothing.

- [ ] **Step 1: Write the failing test**

Add this story to `Typography.stories.tsx` (reuse its existing `expect` / `within` imports from `storybook/test`; add them if missing):

```tsx
export const HeadingsBalance: Story = {
  render: () => (
    <h2
      data-testid="balanced-heading"
      className="nx:typography-heading-large"
      style={{ inlineSize: '18rem' }}
    >
      A deliberately long heading that wraps onto multiple lines
    </h2>
  ),
  play: async ({ canvasElement }) => {
    const heading = canvasElement.querySelector<HTMLElement>(
      '[data-testid="balanced-heading"]'
    )!;
    const style = getComputedStyle(heading);
    // Chromium reports the longhand `text-wrap-style`; older engines the shorthand.
    const wrap =
      style.getPropertyValue('text-wrap-style') ||
      style.getPropertyValue('text-wrap');
    await expect(wrap).toContain('balance');
  },
};
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:storybook typography`
Expected: FAIL — `typography-heading-large` does not yet set `text-wrap: balance`.

- [ ] **Step 3: Write the minimal implementation**

In `packages/tailwind/typography-utilities.css`, add `  text-wrap: balance;` as the last declaration inside **each** of the four heading utilities. After the change they read:

```css
@utility typography-heading-large {
  font-family: var(--nx-typography-family-font-sans);
  font-size: var(--nx-typography-size-3xl);
  font-weight: var(--nx-typography-weight-semibold);
  line-height: var(--nx-typography-line-height-3xl);
  letter-spacing: var(--nx-typography-letterspacing-normal);
  text-wrap: balance;
}

@utility typography-heading-medium {
  font-family: var(--nx-typography-family-font-sans);
  font-size: var(--nx-typography-size-2xl);
  font-weight: var(--nx-typography-weight-semibold);
  line-height: var(--nx-typography-line-height-2xl);
  letter-spacing: var(--nx-typography-letterspacing-normal);
  text-wrap: balance;
}

@utility typography-heading-small {
  font-family: var(--nx-typography-family-font-sans);
  font-size: var(--nx-typography-size-xl);
  font-weight: var(--nx-typography-weight-semibold);
  line-height: var(--nx-typography-line-height-xl);
  letter-spacing: var(--nx-typography-letterspacing-normal);
  text-wrap: balance;
}

@utility typography-heading-xsmall {
  font-family: var(--nx-typography-family-font-sans);
  font-size: var(--nx-typography-size-lg);
  font-weight: var(--nx-typography-weight-semibold);
  line-height: var(--nx-typography-line-height-lg);
  letter-spacing: var(--nx-typography-letterspacing-normal);
  text-wrap: balance;
}
```

Leave the `typography-body-*` blocks (which already carry `text-wrap: pretty`) unchanged.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:storybook typography`
Expected: PASS. (If the runner's Chromium reports neither longhand nor shorthand, fall back to a visual-review story — but current floor Chromium reports `text-wrap-style`.)

- [ ] **Step 5: Commit**

```bash
git add packages/tailwind/typography-utilities.css packages/react/src/stories/Typography.stories.tsx
git commit -m "feat(typography): text-wrap: balance on heading utilities"
```

---

### Task 5: Validate the full workstream and open the PR

**Files:** none (validation + PR).

- [ ] **Step 1: Run the full gates**

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:unit && pnpm test:storybook
```

Expected: all PASS. Fix anything red before proceeding.

- [ ] **Step 2: Modern Web Guidance evidence**

The only browser-platform feature here is `text-wrap: balance` — already gated in this plan (Safari 17.5+, progressive-enhancement no-op below). Record in the PR body: MWG guide `improve-text-layout-and-legibility` (targeted heading application, graceful degradation), browser-floor decision, and that no feature is used below floor without degradation.

- [ ] **Step 3: Open the PR**

```bash
git push -u origin <your-branch>
gh pr create --base main \
  --title "feat(polish): typography base — balance, font-smoothing twin, tabular-nums" \
  --body "$(cat <<'EOF'
## Summary
- text-wrap: balance on the 4 typography-heading-* utilities (fixes Card/Dialog/AlertDialog/Sheet/Drawer/EmptyState/Field titles at once)
- -moz-osx-font-smoothing twin paired with -webkit- in appearancePrefsToCss
- tabular-nums on chart cartesian axis ticks + the Progress % demo
- input-otp slot transition scoped from transition-all to color/bg/border

## GitHub Issue
Closes #594

## Test Plan
- [ ] pnpm lint / format:check / typecheck / test:unit / test:storybook green
- [ ] appearancePrefsToCss unit test asserts the -moz- twin
- [ ] Story assertions: input-otp scoped transition, chart axis tabular-nums, headings balance

## Modern Web Guidance
- text-wrap: balance — guide `improve-text-layout-and-legibility`; Safari 17.5+ / progressive-enhancement no-op below floor.
EOF
)"
```

---

## Self-Review

**Spec coverage (Workstream A, issue #594):** `text-wrap: balance` → Task 4 ✅ · `-moz` font-smoothing twin → Task 1 ✅ · `tabular-nums` chart axis + Progress % → Task 3 ✅ · `input-otp` `transition-all` → Task 2 ✅. `TableCell` explicitly excluded (Global Constraints). No gaps.

**Placeholder scan:** every code step shows the exact before/after; no TBD/TODO/"handle edge cases". The one conditional (Task 4 computed-style fallback) names the concrete fallback (visual-review story).

**Type/name consistency:** tasks are independent (no shared new symbols). `appearancePrefsToCss` matches the exported signature (`appearance-model.ts:327`); `data-slot="input-otp-slot"` and `data-slot="chart"` match source; `nx:transition-[color,background-color,border-color]` is identical in the impl (Task 2 Step 3) and the assertion (Task 2 Step 1).
