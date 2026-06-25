# Codex Console Application Layer — Implementation Plan (Phase 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Phase 1 `@nexus/core` engine into `apps/console` so a `CodexThemeContract` re-themes the whole app live — derive the token set in the browser and inject it as a `<style>` that overrides the preset CSS.

**Architecture:** A `useDerivedTheme(contract)` hook runs `themeToCss(deriveTheme(contract))` and injects/updates a single `<style id="nexus-derived-theme">` appended last in `<head>` (so it wins over the preset `base-*.css`/`brands-*.css` `<link>`s at equal `html`/`html.dark` specificity); passing `null` removes it (preset path active). `ThemeProvider` holds the contract state (persisted to localStorage) and exposes `codexContract`/`setCodexContract`. A switch on the existing Appearance settings toggles the default **Codex** contract on/off — flipping the entire console between the curated preset theme and the derived Codex theme.

**Tech Stack:** React 19, `@nexus/core` (the engine), `@tanstack/react-router`, Vite. **No unit-test runner in `apps/console`** — the derivation logic is already unit-tested in `@nexus/core` (Phase 1); console glue is verified by `tsc` + a manual dev-server check.

**Scope note:** Phase 2 = the runtime application layer + a minimal toggle to prove live re-theming. The **pixel-faithful editor screen** (ColorField, ThemeConfigDiff, SettingRow, all the rows) is **Phase 3** (its own plan). Spec: `docs/superpowers/specs/2026-06-09-codex-appearance-theming-design.md` §7.

---

## File Structure

| File                                                                     | Responsibility                                                                                 |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `apps/console/package.json`                                              | Modify: add `@nexus/core` workspace dependency.                                                |
| `apps/console/src/lib/codex-contract.ts`                                 | Create: `DEFAULT_CODEX_CONTRACT` + localStorage load/save/sanitize.                            |
| `apps/console/src/hooks/use-derived-theme.ts`                            | Create: the inject/remove effect hook.                                                         |
| `apps/console/src/app/theme-provider.tsx`                                | Modify: hold `codexContract` state, persist it, mount `useDerivedTheme`, expose it on context. |
| `apps/console/src/modules/design-system/settings/AppearanceSettings.tsx` | Modify: add the "Codex (derived theme)" switch.                                                |

**Verify a single typecheck:** `pnpm --filter @nexus/console typecheck`
**Run the app:** `pnpm --filter @nexus/console dev` (Vite, default port 5173)

---

## Task 1: Add `@nexus/core` as a console dependency

**Files:**

- Modify: `apps/console/package.json`

- [ ] **Step 1: Add the dependency**

In `apps/console/package.json`, add to `"dependencies"` (alphabetically, just before `"@nexus/react"`):

```json
    "@nexus/core": "workspace:*",
```

- [ ] **Step 2: Install + ensure core is built**

Run: `pnpm install && pnpm --filter @nexus/core build`
Expected: install links the workspace package; build re-emits `packages/core/dist/runtime/index.js` + `.d.ts`.

- [ ] **Step 3: Verify the import resolves**

Run: `pnpm --filter @nexus/console exec tsc --noEmit -e "import { deriveTheme } from '@nexus/core'; void deriveTheme;" 2>/dev/null || node -e "require('@nexus/core')" 2>/dev/null; echo "resolved"`
Simpler check — run: `node -e "console.log(typeof require('@nexus/core').deriveTheme)"`
Expected: prints `function`.

- [ ] **Step 4: Commit**

```bash
git add apps/console/package.json pnpm-lock.yaml
git commit -m "chore(console): depend on @nexus/core for runtime theming"
```

---

## Task 2: The default Codex contract + persistence

**Files:**

- Create: `apps/console/src/lib/codex-contract.ts`

- [ ] **Step 1: Write the file**

```ts
// apps/console/src/lib/codex-contract.ts
import type { CodexThemeContract, ThemeSeeds } from '@nexus/core';

/** Codex's own Appearance values — the default derived theme (dogfood). */
export const DEFAULT_CODEX_CONTRACT: CodexThemeContract = {
  appearance: 'dark',
  light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
  dark: { accent: '#339cff', background: '#181818', foreground: '#ffffff' },
  contrast: 60,
};

const STORAGE_KEY = 'nexus-console-codex-contract';

function isSeeds(value: unknown): value is ThemeSeeds {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.accent === 'string' &&
    typeof o.background === 'string' &&
    typeof o.foreground === 'string'
  );
}

/** Coerce an unknown payload into a valid contract, falling back to the default. */
export function sanitizeContract(raw: unknown): CodexThemeContract {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_CODEX_CONTRACT;
  const o = raw as Record<string, unknown>;
  if (!isSeeds(o.light) || !isSeeds(o.dark)) return DEFAULT_CODEX_CONTRACT;
  const appearance =
    o.appearance === 'light' ||
    o.appearance === 'dark' ||
    o.appearance === 'system'
      ? o.appearance
      : DEFAULT_CODEX_CONTRACT.appearance;
  const contrast =
    typeof o.contrast === 'number' && o.contrast >= 0 && o.contrast <= 100
      ? o.contrast
      : DEFAULT_CODEX_CONTRACT.contrast;
  return { appearance, light: o.light, dark: o.dark, contrast };
}

/** Read the persisted contract, or null = preset path active. Never throws. */
export function loadCodexContract(): CodexThemeContract | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeContract(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Persist the contract, or clear it when null. Never throws. */
export function saveCodexContract(contract: CodexThemeContract | null): void {
  try {
    if (contract) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contract));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage failures (private mode, quota)
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @nexus/console typecheck`
Expected: no errors (the file is not yet imported anywhere, but tsc checks it).

- [ ] **Step 3: Commit**

```bash
git add apps/console/src/lib/codex-contract.ts
git commit -m "feat(console): default Codex contract + persistence helpers"
```

---

## Task 3: The `useDerivedTheme` injection hook

**Files:**

- Create: `apps/console/src/hooks/use-derived-theme.ts`

- [ ] **Step 1: Write the hook**

```ts
// apps/console/src/hooks/use-derived-theme.ts
import { useEffect } from 'react';

import { type CodexThemeContract, deriveTheme, themeToCss } from '@nexus/core';

const STYLE_ID = 'nexus-derived-theme';

/**
 * Apply a free-form Codex contract at runtime. Derives the token set and injects
 * it as a single <style> appended last in <head>, so its `html` / `html.dark`
 * rules win over the preset base/brand <link>s (equal specificity, later wins).
 * Passing `null` removes the override and restores the preset path. This syncs
 * React state to an external system (the DOM <head>), so it belongs in an effect.
 *
 * Note: the `.dark` class stays owned by `useTheme` (the preset hook); the toggle
 * that sets the contract also sets `theme.dark` to match the contract appearance.
 */
export function useDerivedTheme(contract: CodexThemeContract | null): void {
  useEffect(() => {
    const existing = document.getElementById(STYLE_ID);
    if (!contract) {
      existing?.remove();
      return;
    }
    const style =
      existing instanceof HTMLStyleElement
        ? existing
        : document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = themeToCss(deriveTheme(contract));
    // appendChild on an already-attached node moves it to the end → stays last.
    document.head.appendChild(style);
  }, [contract]);
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @nexus/console typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/console/src/hooks/use-derived-theme.ts
git commit -m "feat(console): useDerivedTheme — inject the derived token <style>"
```

---

## Task 4: Wire the contract into `ThemeProvider`

**Files:**

- Modify: `apps/console/src/app/theme-provider.tsx`

- [ ] **Step 1: Replace the file**

```tsx
// apps/console/src/app/theme-provider.tsx
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { CodexThemeContract } from '@nexus/core';

import { loadCodexContract, saveCodexContract } from '../lib/codex-contract';
import { useDerivedTheme } from '../hooks/use-derived-theme';
import { type ThemeConfig, useTheme } from '../hooks/useTheme';

type ThemeContextValue = {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  /** Active free-form Codex theme, or null when the curated preset path is active. */
  codexContract: CodexThemeContract | null;
  setCodexContract: React.Dispatch<
    React.SetStateAction<CodexThemeContract | null>
  >;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Mounts the theme engine once at the app root. `useTheme` owns the preset
 * <link> swaps and the `.dark` class; `useDerivedTheme` owns the runtime-derived
 * <style> override. Consumers read both via `useThemeContext`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [codexContract, setCodexContract] = useState<CodexThemeContract | null>(
    loadCodexContract
  );

  // Persist the contract — writing to localStorage is an external-system sync.
  useEffect(() => {
    saveCodexContract(codexContract);
  }, [codexContract]);

  useDerivedTheme(codexContract);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, codexContract, setCodexContract }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within <ThemeProvider>');
  }
  return ctx;
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @nexus/console typecheck`
Expected: no errors (existing `useThemeContext` consumers still get `theme`/`setTheme`; the two new fields are additive).

- [ ] **Step 3: Commit**

```bash
git add apps/console/src/app/theme-provider.tsx
git commit -m "feat(console): hold + persist the Codex contract in ThemeProvider"
```

---

## Task 5: The Codex toggle + live verification

**Files:**

- Modify: `apps/console/src/modules/design-system/settings/AppearanceSettings.tsx`

- [ ] **Step 1: Add the toggle card**

In `AppearanceSettings.tsx`, add `useThemeContext` to the imports:

```tsx
import { useThemeContext } from '../../../app/theme-provider';
import { DEFAULT_CODEX_CONTRACT } from '../../../lib/codex-contract';
```

Inside the `AppearanceSettings` function body, above the `return`, read the contract and define the handler:

```tsx
const { codexContract, setCodexContract } = useThemeContext();
const codexOn = codexContract !== null;

const toggleCodex = (on: boolean) => {
  setCodexContract(on ? DEFAULT_CODEX_CONTRACT : null);
  // keep the preset `.dark` class in step with the contract's appearance
  setTheme((t) => ({
    ...t,
    dark: on ? DEFAULT_CODEX_CONTRACT.appearance === 'dark' : t.dark,
  }));
};
```

Add this `Card` as the **first** child inside the returned `<div className="nx:space-y-6">` (above the existing "Theme" card):

```tsx
<Card>
  <CardHeader>
    <CardTitle>Codex (derived theme)</CardTitle>
    <CardDescription>
      Generate the whole theme at runtime from a few values, instead of a
      preset. Overrides the controls below while on.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
      <div className="nx:space-y-0.5">
        <Label htmlFor="codex-derived">Apply Codex theme</Label>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          accent #339CFF · background #181818 · contrast 60
        </p>
      </div>
      <Switch
        id="codex-derived"
        checked={codexOn}
        onCheckedChange={toggleCodex}
      />
    </div>
  </CardContent>
</Card>
```

(`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Switch` are already imported in this file.)

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm --filter @nexus/console typecheck && pnpm --filter @nexus/console exec eslint src/modules/design-system/settings/AppearanceSettings.tsx`
Expected: both clean.

- [ ] **Step 3: Manual verification (the milestone)**

Run: `pnpm --filter @nexus/console dev`
Then in a browser at `http://localhost:5173`:

1. Navigate to the **Settings** scene → **Appearance** tab (or the Design System → Appearance route).
2. Toggle **Apply Codex theme** on.
3. Expected: the **entire console** — sidebar, cards, buttons, text — repaints to the dark Codex look (near-black `#181818` surfaces, cyan `#339CFF` accent), and text stays legible. Toggling off restores the preset theme.
4. Capture a before/after screenshot (Chrome DevTools MCP `take_screenshot`, or the browser's own capture) for the PR.

If the derived style does **not** win (app doesn't change): confirm the `<style id="nexus-derived-theme">` is the **last** child of `<head>` (DevTools → Elements). If a preset `<link>` is appended after it, that's the known ordering edge case — note it for Phase 3 (the editor will lock preset controls while derived is active, or `themeToCss` switches to `:root` specificity).

- [ ] **Step 4: Commit**

```bash
git add apps/console/src/modules/design-system/settings/AppearanceSettings.tsx
git commit -m "feat(console): toggle the derived Codex theme from Appearance settings"
```

---

## Self-Review (completed)

**Spec coverage (§7 runtime wiring):** `useDerivedTheme` + inject `<style>` = Task 3; contract persistence = Task 2 + Task 4; default Codex preset = Task 2; mounted in ThemeProvider + live repaint verified = Task 4 + Task 5. The `@nexus/core` dependency (implicit prerequisite) = Task 1. Out of scope (Phase 3 plan): the pixel-faithful editor screen, ColorField/ThemeConfigDiff/SettingRow, typography & app-pref knobs, Import/Copy/presets.

**Placeholder scan:** none — every step has complete code or an exact command. The Phase 3 caveat in Task 5 Step 3 is a documented known-limitation note, not deferred work in this plan's scope.

**Type consistency:** `CodexThemeContract`/`ThemeSeeds` imported from `@nexus/core` (exported in Phase 1 Task 8). `codexContract`/`setCodexContract` defined in Task 4's `ThemeContextValue`, consumed in Task 5. `DEFAULT_CODEX_CONTRACT`/`loadCodexContract`/`saveCodexContract` defined in Task 2, consumed in Tasks 4–5. `useDerivedTheme(contract: CodexThemeContract | null)` defined Task 3, called Task 4. `themeToCss`/`deriveTheme` are the Phase 1 exports.

**TDD note:** `apps/console` has no vitest project, so there are no failing-test-first steps — the pure logic is already covered by `@nexus/core`'s 26 unit tests; console glue is gated by `tsc` + the manual dev check in Task 5.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-10-codex-console-application.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks.

**2. Inline Execution** — Execute tasks in this session using executing-plans, with checkpoints.

Which approach?
