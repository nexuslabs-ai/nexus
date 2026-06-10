# Codex Theme Presets — Implementation Plan (Phase 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the "Codex ▾" named-presets dropdown — pick a built-in theme (Codex / Paper / Forest / Mono) and the editor + whole console snap to it; editing any color forks the selection to "Custom".

**Architecture:** A console-side `CODEX_PRESETS` registry of `{ name, contract }` (presets carry the **contract** — colors; the app-prefs stay user-level and orthogonal). A `Select` in the editor header shows the preset names; choosing one calls `setCodexContract(preset.contract)`. The active selection is computed by comparing the live contract against each preset (`activePresetName`), falling back to "Custom".

**Tech Stack:** React 19, `@nexus/react` Select, `@nexus/core` types. Gated by `tsc` + a live check.

**Scope note:** Built-in presets only. User-saved presets (persisting a custom theme under a name) are out of scope.

---

## File Structure

| File                                             | Responsibility                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `apps/console/src/lib/codex-presets.ts`          | Create: `CodexPreset` type, `CODEX_PRESETS`, `activePresetName`. |
| `apps/console/src/modules/codex/codex-route.tsx` | Modify: add the preset `Select` to the header.                   |

**Verify typecheck:** `pnpm --filter @nexus/console typecheck`

---

## Task 1: The presets registry

**Files:**

- Create: `apps/console/src/lib/codex-presets.ts`

- [ ] **Step 1: Write the file**

```ts
// apps/console/src/lib/codex-presets.ts
import type { CodexThemeContract, ThemeSeeds } from '@nexus/core';

import { DEFAULT_CODEX_CONTRACT } from './codex-contract';

export interface CodexPreset {
  name: string;
  contract: CodexThemeContract;
}

export const CUSTOM_PRESET = 'Custom';

export const CODEX_PRESETS: CodexPreset[] = [
  { name: 'Codex', contract: DEFAULT_CODEX_CONTRACT },
  {
    name: 'Paper',
    contract: {
      appearance: 'light',
      light: {
        accent: '#c2410c',
        background: '#faf9f7',
        foreground: '#1c1917',
      },
      dark: { accent: '#fb923c', background: '#1c1917', foreground: '#faf9f7' },
      contrast: 52,
    },
  },
  {
    name: 'Forest',
    contract: {
      appearance: 'dark',
      light: {
        accent: '#15803d',
        background: '#f5faf6',
        foreground: '#0c1410',
      },
      dark: { accent: '#22c55e', background: '#0c1410', foreground: '#ecfdf5' },
      contrast: 64,
    },
  },
  {
    name: 'Mono',
    contract: {
      appearance: 'dark',
      light: {
        accent: '#475569',
        background: '#ffffff',
        foreground: '#0a0a0a',
      },
      dark: { accent: '#94a3b8', background: '#0a0a0a', foreground: '#fafafa' },
      contrast: 88,
    },
  },
];

function seedsEqual(a: ThemeSeeds, b: ThemeSeeds): boolean {
  return (
    a.accent === b.accent &&
    a.background === b.background &&
    a.foreground === b.foreground
  );
}

function contractsEqual(a: CodexThemeContract, b: CodexThemeContract): boolean {
  return (
    a.appearance === b.appearance &&
    a.contrast === b.contrast &&
    seedsEqual(a.light, b.light) &&
    seedsEqual(a.dark, b.dark)
  );
}

/** Name of the preset matching `contract`, or "Custom" when it's been edited. */
export function activePresetName(contract: CodexThemeContract): string {
  const match = CODEX_PRESETS.find((p) => contractsEqual(p.contract, contract));
  return match ? match.name : CUSTOM_PRESET;
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @nexus/console typecheck`

```bash
git add apps/console/src/lib/codex-presets.ts
git commit -m "feat(console): Codex theme presets registry"
```

---

## Task 2: The preset dropdown in the editor

**Files:**

- Modify: `apps/console/src/modules/codex/codex-route.tsx`

- [ ] **Step 1: Add the imports**

Add `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` to the `@nexus/react` import, and:

```tsx
import {
  activePresetName,
  CODEX_PRESETS,
  CUSTOM_PRESET,
} from '../../lib/codex-presets';
```

- [ ] **Step 2: Add the apply handler**

Above the `return` (next to the other handlers):

```tsx
const applyPreset = (name: string) => {
  const preset = CODEX_PRESETS.find((p) => p.name === name);
  if (preset) setCodexContract(preset.contract);
};
```

- [ ] **Step 3: Add the Select to the PageHeader (before Import/Copy)**

Replace the existing `<PageHeader …>` children block with:

```tsx
<PageHeader
  title="Appearance"
  description="Edit a few values; the whole console re-themes in real time."
>
  <Select value={activePresetName(contract)} onValueChange={applyPreset}>
    <SelectTrigger className="nx:w-36" aria-label="Theme preset">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {CODEX_PRESETS.map((p) => (
        <SelectItem key={p.name} value={p.name}>
          {p.name}
        </SelectItem>
      ))}
      <SelectItem value={CUSTOM_PRESET} disabled>
        {CUSTOM_PRESET}
      </SelectItem>
    </SelectContent>
  </Select>
  <Button variant="ghost" size="sm" onClick={handleImport}>
    Import
  </Button>
  <Button variant="ghost" size="sm" onClick={handleCopy}>
    Copy theme
  </Button>
</PageHeader>
```

(The `Custom` item is `disabled` — it's reached by editing, not chosen. `SelectValue` still renders its label when active. Choosing it is impossible, so `applyPreset` never needs a `Custom` branch.)

- [ ] **Step 4: Typecheck + lint + commit**

Run: `pnpm --filter @nexus/console typecheck && pnpm --filter @nexus/console exec eslint src/modules/codex/codex-route.tsx`

```bash
git add apps/console/src/modules/codex/codex-route.tsx
git commit -m "feat(console): theme-preset dropdown in the Codex editor"
```

---

## Task 3: Live verification + push

- [ ] **Step 1: Verify**

Run the dev server, open `/design/codex`:

1. The header shows a preset dropdown reading **Codex**.
2. Pick **Paper** → the console snaps to warm light; **Forest** → green dark; **Mono** → high-contrast.
3. Edit any color (e.g. Accent) → the dropdown flips to **Custom**.
4. Pick a preset again → it snaps back and the dropdown shows that preset's name.

- [ ] **Step 2: Push (updates PR #437)**

```bash
git push
git ls-remote origin refs/heads/aishvarya/codex-appearance-theming | cut -f1   # must equal git rev-parse HEAD
```

---

## Self-Review (completed)

**Spec coverage (§9 presets):** registry + matcher = Task 1; the "Codex ▾" dropdown + apply = Task 2. Built-in presets only (user-saved out of scope, stated).

**Placeholder scan:** none.

**Type consistency:** `CodexPreset`/`CODEX_PRESETS`/`CUSTOM_PRESET`/`activePresetName` from Task 1, used in Task 2. `applyPreset` matches by name; `activePresetName` drives the Select value. `contractsEqual` compares all four fields; presets carry full light+dark blocks so a match is exact.

---

## Execution Handoff

Plan complete. Two execution options:

**1. Subagent-Driven (recommended)**
**2. Inline Execution** (as in Phases 1–4)

Which approach?
