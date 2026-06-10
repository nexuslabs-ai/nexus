# Codex Appearance Editor — Implementation Plan (Phase 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A live Codex Appearance editor scene in `apps/console` — edit Theme, Accent / Background / Foreground, and Contrast through pixel-faithful controls, and the whole console re-themes in real time, with a code-diff preview of the contract.

**Architecture:** A new `/design/codex` scene reads/writes the `codexContract` already held by `ThemeProvider` (Phase 2). Three new console-local presentational components — `SettingRow` (label+description+control layout), `ColorField` (swatch + native picker + hex input), `ThemeConfigDiff` (the prev→next code preview) — compose with shipped `@nexus/react` controls (`ToggleGroup`, `Slider`, `Input`). Editing any field calls `setCodexContract`, which flows through Phase 2's `useDerivedTheme` to repaint the app. Entering the scene activates the contract (sets the default if none).

**Tech Stack:** React 19, `@nexus/react` (Slider, ToggleGroup, Input, PageHeader), `@nexus/core` types, `@tanstack/react-router`. No console unit runner — gated by `tsc` + a live dev-server check.

**Scope note:** Phase 3 = the **live color/contrast/theme editor** — the derivation showcase — plus the 3 new components and the diff preview, styled pixel-faithfully. **Deferred to Phase 4:** the app-preference rows from the screenshot (UI/Code font + size, Translucent sidebar, Pointer cursors, Reduce motion, Diff markers, Font smoothing — these need the contract extended with non-derivation fields) and **Import / Copy theme + named presets** (theme-as-data). Spec: `docs/superpowers/specs/2026-06-09-codex-appearance-theming-design.md` §8–§9.

---

## File Structure

| File                                                   | Responsibility                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `apps/console/src/modules/codex/setting-row.tsx`       | Create: label + description + control row layout.                                  |
| `apps/console/src/modules/codex/color-field.tsx`       | Create: swatch + native color picker + hex input (local draft, commits valid hex). |
| `apps/console/src/modules/codex/theme-config-diff.tsx` | Create: prev→next code preview of the contract.                                    |
| `apps/console/src/modules/codex/codex-route.tsx`       | Create: the editor scene, wired to `useThemeContext`.                              |
| `apps/console/src/app/router.tsx`                      | Modify: register the `/design/codex` route.                                        |
| `apps/console/src/shell/app-sidebar.tsx`               | Modify: add the "Codex" nav link.                                                  |

**Verify typecheck:** `pnpm --filter @nexus/console typecheck`
**Run the app:** `pnpm --filter @nexus/console dev`

---

## Task 1: `SettingRow` layout component

**Files:**

- Create: `apps/console/src/modules/codex/setting-row.tsx`

- [ ] **Step 1: Write the component**

```tsx
// apps/console/src/modules/codex/setting-row.tsx
import type { ReactNode } from 'react';

import { Label } from '@nexus/react';

interface SettingRowProps {
  label: string;
  description?: string;
  /** Associates the label with the control for a11y. */
  htmlFor?: string;
  children: ReactNode;
}

/** One Codex settings row: label (+ optional description) left, control right. */
export function SettingRow({
  label,
  description,
  htmlFor,
  children,
}: SettingRowProps) {
  return (
    <div className="nx:flex nx:items-center nx:justify-between nx:gap-4 nx:py-3">
      <div className="nx:space-y-0.5">
        <Label htmlFor={htmlFor}>{label}</Label>
        {description ? (
          <p className="nx:typography-body-small nx:text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="nx:shrink-0">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @nexus/console typecheck`
Expected: no errors (component not yet imported).

- [ ] **Step 3: Commit**

```bash
git add apps/console/src/modules/codex/setting-row.tsx
git commit -m "feat(console): SettingRow layout for the Codex editor"
```

---

## Task 2: `ColorField` component

**Files:**

- Create: `apps/console/src/modules/codex/color-field.tsx`

A swatch with an invisible native `<input type="color">` overlay (the OS picker) plus a hex `Input`. Holds a local draft so the user can type freely; only commits a valid `#rrggbb` to the parent (an invalid hex would make `deriveTheme` throw).

- [ ] **Step 1: Write the component**

```tsx
// apps/console/src/modules/codex/color-field.tsx
import { useEffect, useId, useState } from 'react';

import { Input } from '@nexus/react';

interface ColorFieldProps {
  /** Committed hex value, e.g. "#339cff". */
  value: string;
  /** Called only with a valid #rrggbb hex. */
  onChange: (hex: string) => void;
  label: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function ColorField({ value, onChange, label }: ColorFieldProps) {
  const id = useId();
  // Local draft lets the user type a partial hex without the controlled input
  // rejecting keystrokes; we only commit when it's a valid #rrggbb.
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commit = (next: string) => {
    setDraft(next);
    if (HEX_RE.test(next)) onChange(next);
  };

  return (
    <div className="nx:flex nx:items-center nx:gap-2">
      <label
        htmlFor={id}
        className="nx:relative nx:size-7 nx:shrink-0 nx:overflow-hidden nx:rounded-full nx:border nx:border-border-default"
        style={{ backgroundColor: HEX_RE.test(value) ? value : 'transparent' }}
      >
        <input
          id={id}
          type="color"
          value={HEX_RE.test(value) ? value : '#000000'}
          onChange={(e) => commit(e.target.value)}
          aria-label={label}
          className="nx:absolute nx:-inset-2 nx:cursor-pointer nx:opacity-0"
        />
      </label>
      <Input
        value={draft}
        onChange={(e) => commit(e.target.value)}
        aria-label={`${label} hex value`}
        spellCheck={false}
        className="nx:w-28 nx:font-mono nx:uppercase"
      />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @nexus/console typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/console/src/modules/codex/color-field.tsx
git commit -m "feat(console): ColorField — swatch + native picker + hex input"
```

---

## Task 3: `ThemeConfigDiff` preview component

**Files:**

- Create: `apps/console/src/modules/codex/theme-config-diff.tsx`

Renders the contract's derivation-relevant values as a small code block, like the screenshot's `const themePreview: ThemeConfig = { … }`. Tracks the previous render and marks changed lines: a red "removed" line (old value) above a green "added" line (new value). Colored with `error-subtle` / `success-subtle`.

- [ ] **Step 1: Write the component**

```tsx
// apps/console/src/modules/codex/theme-config-diff.tsx
import { useEffect, useRef } from 'react';

import type { CodexThemeContract } from '@nexus/core';

/** The lines we surface in the preview (the derivation-relevant fields). */
function toLines(c: CodexThemeContract): { key: string; text: string }[] {
  const seeds = c.appearance === 'light' ? c.light : c.dark;
  return [
    { key: 'appearance', text: `appearance: "${c.appearance}",` },
    { key: 'accent', text: `accent: "${seeds.accent}",` },
    { key: 'background', text: `background: "${seeds.background}",` },
    { key: 'foreground', text: `foreground: "${seeds.foreground}",` },
    { key: 'contrast', text: `contrast: ${c.contrast},` },
  ];
}

interface ThemeConfigDiffProps {
  contract: CodexThemeContract;
}

export function ThemeConfigDiff({ contract }: ThemeConfigDiffProps) {
  const prevRef = useRef<CodexThemeContract | null>(null);
  const prev = prevRef.current;
  useEffect(() => {
    prevRef.current = contract;
  });

  const nextLines = toLines(contract);
  const prevLines = prev ? toLines(prev) : null;
  const prevByKey = new Map(prevLines?.map((l) => [l.key, l.text]));

  return (
    <pre className="nx:typography-code-block nx:overflow-x-auto nx:rounded-lg nx:border nx:border-border-default nx:bg-muted nx:p-3 nx:text-muted-foreground">
      <code>
        <div>{`const themePreview: ThemeConfig = {`}</div>
        {nextLines.map((line) => {
          const before = prevByKey.get(line.key);
          const changed = before !== undefined && before !== line.text;
          return (
            <div key={line.key}>
              {changed ? (
                <div className="nx:bg-error-subtle nx:text-error-subtle-foreground">{`  - ${before}`}</div>
              ) : null}
              <div
                className={
                  changed
                    ? 'nx:bg-success-subtle nx:text-success-subtle-foreground'
                    : undefined
                }
              >
                {changed ? `  + ${line.text}` : `  ${line.text}`}
              </div>
            </div>
          );
        })}
        <div>{`};`}</div>
      </code>
    </pre>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @nexus/console typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/console/src/modules/codex/theme-config-diff.tsx
git commit -m "feat(console): ThemeConfigDiff — prev→next contract preview"
```

---

## Task 4: The Codex editor scene

**Files:**

- Create: `apps/console/src/modules/codex/codex-route.tsx`

Reads `codexContract`/`setCodexContract` from `useThemeContext`. On mount, if no contract is active, sets the default (so the editor always edits a live theme). Edits the seed block selected by the Theme control (`light` block for "Light", else the `dark` block). Every change re-themes the app via Phase 2's hook.

- [ ] **Step 1: Write the scene**

```tsx
// apps/console/src/modules/codex/codex-route.tsx
import { useEffect } from 'react';

import type { CodexThemeContract, ThemeSeeds } from '@nexus/core';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
} from '@nexus/react';

import { PageHeader } from '../../components/page-header';
import { useThemeContext } from '../../app/theme-provider';
import { DEFAULT_CODEX_CONTRACT } from '../../lib/codex-contract';
import { ColorField } from './color-field';
import { SettingRow } from './setting-row';
import { ThemeConfigDiff } from './theme-config-diff';

/** Which seed block the editor edits, given the appearance. */
function editedBlock(
  appearance: CodexThemeContract['appearance']
): 'light' | 'dark' {
  return appearance === 'light' ? 'light' : 'dark';
}

export function CodexRoute() {
  const { codexContract, setCodexContract } = useThemeContext();

  // Entering the editor activates the derived theme so edits are visible.
  useEffect(() => {
    if (!codexContract) setCodexContract(DEFAULT_CODEX_CONTRACT);
  }, [codexContract, setCodexContract]);

  const contract = codexContract ?? DEFAULT_CODEX_CONTRACT;
  const block = editedBlock(contract.appearance);
  const seeds = contract[block];

  const setAppearance = (appearance: string) => {
    if (
      appearance !== 'light' &&
      appearance !== 'dark' &&
      appearance !== 'system'
    )
      return;
    setCodexContract({ ...contract, appearance });
  };

  const setSeed = (field: keyof ThemeSeeds, hex: string) => {
    setCodexContract({ ...contract, [block]: { ...seeds, [field]: hex } });
  };

  const setContrast = (values: number[]) => {
    setCodexContract({ ...contract, contrast: values[0] ?? contract.contrast });
  };

  return (
    <div className="nx:mx-auto nx:max-w-2xl nx:space-y-6 nx:p-6">
      <PageHeader
        title="Appearance"
        description="Edit a few values; the whole console re-themes in real time."
      />

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="nx:space-y-4">
          <SettingRow
            label="Mode"
            description="Use light, dark, or match your system"
          >
            <ToggleGroup
              type="single"
              value={contract.appearance}
              onValueChange={setAppearance}
              variant="outline"
            >
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="system">System</ToggleGroupItem>
            </ToggleGroup>
          </SettingRow>
          <ThemeConfigDiff contract={contract} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {block === 'dark' ? 'Dark theme' : 'Light theme'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SettingRow label="Accent">
            <ColorField
              label="Accent"
              value={seeds.accent}
              onChange={(hex) => setSeed('accent', hex)}
            />
          </SettingRow>
          <SettingRow label="Background">
            <ColorField
              label="Background"
              value={seeds.background}
              onChange={(hex) => setSeed('background', hex)}
            />
          </SettingRow>
          <SettingRow label="Foreground">
            <ColorField
              label="Foreground"
              value={seeds.foreground}
              onChange={(hex) => setSeed('foreground', hex)}
            />
          </SettingRow>
          <SettingRow label="Contrast" description={`${contract.contrast}`}>
            <Slider
              value={[contract.contrast]}
              onValueChange={setContrast}
              min={0}
              max={100}
              step={1}
              aria-label="Contrast"
              className="nx:w-48"
            />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @nexus/console typecheck`
Expected: no errors. (If `ToggleGroup`/`Slider` aren't exported names, confirm against `packages/react/src/index.ts` and adjust the import.)

- [ ] **Step 3: Commit**

```bash
git add apps/console/src/modules/codex/codex-route.tsx
git commit -m "feat(console): the live Codex appearance editor scene"
```

---

## Task 5: Register the route + sidebar link, then verify live

**Files:**

- Modify: `apps/console/src/app/router.tsx`
- Modify: `apps/console/src/shell/app-sidebar.tsx`

- [ ] **Step 1: Confirm the exact insertion points**

Run: `grep -n "appearanceRoute\|addChildren\|createRoute" apps/console/src/app/router.tsx | head` and `grep -n "DESIGN_ITEMS\|/design/appearance" apps/console/src/shell/app-sidebar.tsx`
Read the surrounding lines so the edits below match the real text.

- [ ] **Step 2: Register the route in `router.tsx`**

Add the import alongside the other design routes:

```tsx
import { CodexRoute } from '../modules/codex/codex-route';
```

Declare the route next to `appearanceRoute`:

```tsx
const codexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/design/codex',
  component: CodexRoute,
});
```

Add `codexRoute` to the `appRoute.addChildren([...])` array (next to `appearanceRoute`).

- [ ] **Step 3: Add the sidebar link in `app-sidebar.tsx`**

In the `DESIGN_ITEMS` array, add an entry after `Appearance` (reuse an existing imported Tabler icon, e.g. `IconWand` or `IconSparkles` — use one already imported in the file, or add the import):

```tsx
  { label: 'Codex', to: '/design/codex', icon: IconSparkles },
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @nexus/console typecheck`
Expected: no errors.

- [ ] **Step 5: Live verification**

Run: `pnpm --filter @nexus/console dev`
In the browser:

1. Click **Codex** in the Design System sidebar group (`/design/codex`).
2. The editor loads and the app is already in the derived theme (default contract activated on mount).
3. Drag **Contrast** — surfaces visibly separate more/less in real time. Change **Accent** (type a hex or use the swatch) — every accent element across the app updates. The **diff preview** shows the changed line (red old → green new).
4. Confirm legibility holds at extremes (text never disappears — the APCA gate).
5. Capture a screenshot (the editor + re-themed app).

- [ ] **Step 6: Commit**

```bash
git add apps/console/src/app/router.tsx apps/console/src/shell/app-sidebar.tsx
git commit -m "feat(console): route + sidebar link for the Codex editor"
```

---

## Self-Review (completed)

**Spec coverage (§8 screen):** SettingRow/ColorField/ThemeConfigDiff = Tasks 1–3; Theme segmented + Accent/Background/Foreground + Contrast, live-wired = Task 4; scene + route + nav = Tasks 4–5; pixel-faithful styling = the dark derived theme applied to the scene itself. **Deferred (Phase 4, stated in scope note):** UI/Code font + size, Translucent sidebar, Pointer cursors, Reduce motion, Diff markers, Font smoothing (need the contract extended with non-derivation fields); Import / Copy / presets (§9, theme-as-data).

**Placeholder scan:** none — every step has complete code or an exact command. Task 5's "confirm exact insertion points" is a real verification step (the route-tree/sidebar text must be matched against source), not deferred work.

**Type consistency:** `CodexThemeContract`/`ThemeSeeds` from `@nexus/core`; `codexContract`/`setCodexContract` from Phase 2's `useThemeContext`; `DEFAULT_CODEX_CONTRACT` from Phase 2's `codex-contract.ts`. `SettingRow`/`ColorField`/`ThemeConfigDiff` defined Tasks 1–3, consumed Task 4. `editedBlock` returns `'light' | 'dark'`, used to index `contract[block]`. `setContrast` reads `values[0]` (Slider emits `number[]`).

**Risk:** the diff preview re-renders on every keystroke; `prevRef` updates in an effect so the "previous" is the last committed render — acceptable for a preview. If it flickers, debounce in Phase 4.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-10-codex-appearance-editor.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task; the 3 components are independent, good for parallel build + review. Visual-polish stakes (Tier-A) suit a focused per-component pass.

**2. Inline Execution** — execute here with checkpoints, as in Phases 1–2.

Which approach? (And: this Phase 3 is the **live color editor**; the app-preference rows + Import/Copy are **Phase 4** — say if you'd rather fold all the screenshot's rows in here instead.)
