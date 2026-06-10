# Codex Appearance Preferences + Import/Copy — Implementation Plan (Phase 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the pixel-faithful Codex Appearance screen — add the app-preference rows (fonts, sizes, translucent sidebar, pointer cursors, reduce motion, diff markers, font smoothing) and Import/Copy theme — so the editor matches the screenshot end-to-end and themes are shareable as data.

**Architecture:** The app-preferences are **not** derivation inputs, so they live in a console-side `CodexPrefs` state held by `ThemeProvider` alongside the existing `codexContract`. A `useAppearancePrefs(prefs)` hook injects a single `<style id="nexus-appearance-prefs">` generated from the prefs (font-family vars, font sizes, `-webkit-font-smoothing`, a reduce-motion override, a pointer-cursor rule, a translucent-sidebar blur) — parallel to `useDerivedTheme`. The editor edits both `codexContract` (colors, Phase 3) and `codexPrefs` (these rows). Import/Copy serializes the combined `{ ...contract, ...prefs }` as one theme JSON.

**Tech Stack:** React 19, `@nexus/react` (Select, Input, Switch, ToggleGroup, Button), the Clipboard API. No console unit runner — gated by `tsc` + a live dev-server check.

**Scope note:** Phase 4 = the app-preference rows + Import/Copy. **Deferred to Phase 5:** the named **presets registry** (the "Codex ▾" dropdown of saved themes). **Honest limitations** (called out in the rows): `uiFontSize` sets the root `font-size` (scales rem-based elements; the typographic scale is absolute, so it won't rescale every label) and `translucentSidebar` applies a backdrop-blur (a full frosted effect also needs an alpha nav surface — a later token change). The controls always update the config and round-trip through Import/Copy. Spec: `…/2026-06-09-codex-appearance-theming-design.md` §5, §9.

---

## File Structure

| File                                                   | Responsibility                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `apps/console/src/lib/codex-prefs.ts`                  | Create: `CodexPrefs` type, `DEFAULT_CODEX_PREFS`, sanitize, load/save, `prefsToCss`. |
| `apps/console/src/hooks/use-appearance-prefs.ts`       | Create: inject/remove the prefs `<style>`.                                           |
| `apps/console/src/app/theme-provider.tsx`              | Modify: hold `codexPrefs`, persist, mount `useAppearancePrefs`, expose on context.   |
| `apps/console/src/modules/codex/theme-config-diff.tsx` | Modify: accept a `markers: 'color' \| 'symbols'` prop.                               |
| `apps/console/src/modules/codex/codex-route.tsx`       | Modify: add the preference rows + the Import/Copy buttons.                           |

**Verify typecheck:** `pnpm --filter @nexus/console typecheck`

---

## Task 1: `CodexPrefs` + `prefsToCss`

**Files:**

- Create: `apps/console/src/lib/codex-prefs.ts`

- [ ] **Step 1: Write the file**

```ts
// apps/console/src/lib/codex-prefs.ts
export interface CodexPrefs {
  uiFont: string;
  codeFont: string;
  uiFontSize: number; // px
  codeFontSize: number; // px
  translucentSidebar: boolean;
  pointerCursors: boolean;
  reduceMotion: 'system' | 'on' | 'off';
  diffMarkers: 'color' | 'symbols';
  fontSmoothing: boolean;
}

export const DEFAULT_CODEX_PREFS: CodexPrefs = {
  uiFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  codeFont: 'ui-monospace, "SF Mono", Menlo, monospace',
  uiFontSize: 14,
  codeFontSize: 12,
  translucentSidebar: true,
  pointerCursors: false,
  reduceMotion: 'system',
  diffMarkers: 'color',
  fontSmoothing: true,
};

const STORAGE_KEY = 'nexus-console-codex-prefs';
const clampPx = (n: unknown, fallback: number) =>
  typeof n === 'number' && n >= 8 && n <= 32 ? n : fallback;

/** Coerce an unknown payload into valid prefs, field by field. */
export function sanitizePrefs(raw: unknown): CodexPrefs {
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<
    string,
    unknown
  >;
  const d = DEFAULT_CODEX_PREFS;
  return {
    uiFont: typeof o.uiFont === 'string' ? o.uiFont : d.uiFont,
    codeFont: typeof o.codeFont === 'string' ? o.codeFont : d.codeFont,
    uiFontSize: clampPx(o.uiFontSize, d.uiFontSize),
    codeFontSize: clampPx(o.codeFontSize, d.codeFontSize),
    translucentSidebar:
      typeof o.translucentSidebar === 'boolean'
        ? o.translucentSidebar
        : d.translucentSidebar,
    pointerCursors:
      typeof o.pointerCursors === 'boolean'
        ? o.pointerCursors
        : d.pointerCursors,
    reduceMotion:
      o.reduceMotion === 'on' || o.reduceMotion === 'off'
        ? o.reduceMotion
        : 'system',
    diffMarkers: o.diffMarkers === 'symbols' ? 'symbols' : 'color',
    fontSmoothing:
      typeof o.fontSmoothing === 'boolean' ? o.fontSmoothing : d.fontSmoothing,
  };
}

export function loadCodexPrefs(): CodexPrefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizePrefs(JSON.parse(raw)) : DEFAULT_CODEX_PREFS;
  } catch {
    return DEFAULT_CODEX_PREFS;
  }
}

export function saveCodexPrefs(prefs: CodexPrefs): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore storage failures
  }
}

/** Concrete CSS for the prefs — injected as one <style>, parallel to themeToCss. */
export function prefsToCss(prefs: CodexPrefs): string {
  const blocks: string[] = [
    `:root {
  --nx-typography-family-font-sans: ${prefs.uiFont};
  --nx-typography-family-font-mono: ${prefs.codeFont};
  font-size: ${prefs.uiFontSize}px;
}`,
    `code, pre, .nx\\:font-mono { font-size: ${prefs.codeFontSize}px; }`,
    `html { -webkit-font-smoothing: ${prefs.fontSmoothing ? 'antialiased' : 'auto'}; }`,
  ];
  if (prefs.pointerCursors) {
    blocks.push(
      `button:not(:disabled), [role="button"], [role="tab"], [role="radio"], a[href], summary { cursor: pointer; }`
    );
  }
  if (prefs.reduceMotion === 'on') {
    blocks.push(
      `*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }`
    );
  }
  if (prefs.translucentSidebar) {
    blocks.push(
      `[data-slot="sidebar-container"] { backdrop-filter: blur(12px); }`
    );
  }
  return blocks.join('\n');
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @nexus/console typecheck`

```bash
git add apps/console/src/lib/codex-prefs.ts
git commit -m "feat(console): CodexPrefs type + prefsToCss"
```

---

## Task 2: `useAppearancePrefs` hook

**Files:**

- Create: `apps/console/src/hooks/use-appearance-prefs.ts`

- [ ] **Step 1: Write the hook**

```ts
// apps/console/src/hooks/use-appearance-prefs.ts
import { useEffect } from 'react';

import { type CodexPrefs, prefsToCss } from '../lib/codex-prefs';

const STYLE_ID = 'nexus-appearance-prefs';

/**
 * Apply the app-preference CSS at runtime. Injects a single <style> (after the
 * derived-theme <style>) generated from the prefs. Passing `null` removes it.
 */
export function useAppearancePrefs(prefs: CodexPrefs | null): void {
  useEffect(() => {
    const existing = document.getElementById(STYLE_ID);
    if (!prefs) {
      existing?.remove();
      return;
    }
    const style =
      existing instanceof HTMLStyleElement
        ? existing
        : document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = prefsToCss(prefs);
    document.head.appendChild(style);
  }, [prefs]);
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @nexus/console typecheck`

```bash
git add apps/console/src/hooks/use-appearance-prefs.ts
git commit -m "feat(console): useAppearancePrefs — inject the prefs <style>"
```

---

## Task 3: Wire prefs into `ThemeProvider`

**Files:**

- Modify: `apps/console/src/app/theme-provider.tsx`

- [ ] **Step 1: Add the prefs state**

Add imports:

```tsx
import {
  type CodexPrefs,
  loadCodexPrefs,
  saveCodexPrefs,
} from '../lib/codex-prefs';
import { useAppearancePrefs } from '../hooks/use-appearance-prefs';
```

Extend `ThemeContextValue` with:

```tsx
codexPrefs: CodexPrefs;
setCodexPrefs: React.Dispatch<React.SetStateAction<CodexPrefs>>;
```

In `ThemeProvider`, add state + effects (prefs apply only when a derived contract is active — otherwise the preset path owns appearance):

```tsx
const [codexPrefs, setCodexPrefs] = useState<CodexPrefs>(loadCodexPrefs);

useEffect(() => {
  saveCodexPrefs(codexPrefs);
}, [codexPrefs]);

useDerivedTheme(codexContract);
useAppearancePrefs(codexContract ? codexPrefs : null);
```

Add `codexPrefs`/`setCodexPrefs` to the context `value`.

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @nexus/console typecheck`

```bash
git add apps/console/src/app/theme-provider.tsx
git commit -m "feat(console): hold + apply Codex prefs in ThemeProvider"
```

---

## Task 4: `diffMarkers` prop on `ThemeConfigDiff`

**Files:**

- Modify: `apps/console/src/modules/codex/theme-config-diff.tsx`

- [ ] **Step 1: Add the prop**

Change the props + the changed-line rendering so `markers="symbols"` shows only `+`/`-` (no color background) and `markers="color"` keeps the tinted background:

```tsx
interface ThemeConfigDiffProps {
  contract: CodexThemeContract;
  markers?: 'color' | 'symbols';
}

export function ThemeConfigDiff({
  contract,
  markers = 'color',
}: ThemeConfigDiffProps) {
```

In the changed-line branch, gate the background classes on `markers === 'color'`:

```tsx
{
  changed ? (
    <div
      className={
        markers === 'color'
          ? 'nx:bg-error-subtle nx:text-error-subtle-foreground'
          : 'nx:text-error-subtle-foreground'
      }
    >{`  - ${before}`}</div>
  ) : null;
}
<div
  className={
    changed && markers === 'color'
      ? 'nx:bg-success-subtle nx:text-success-subtle-foreground'
      : undefined
  }
>
  {changed ? `  + ${line.text}` : `  ${line.text}`}
</div>;
```

- [ ] **Step 2: Typecheck + commit**

```bash
git add apps/console/src/modules/codex/theme-config-diff.tsx
git commit -m "feat(console): ThemeConfigDiff honors the diffMarkers pref"
```

---

## Task 5: Preference rows + Import/Copy in the editor

**Files:**

- Modify: `apps/console/src/modules/codex/codex-route.tsx`

- [ ] **Step 1: Pull prefs from context + add the handlers**

Add to the `useThemeContext()` destructure: `codexPrefs, setCodexPrefs`. Add imports for `Button`, `Input`, `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem`, `Switch` from `@nexus/react`, and `DEFAULT_CODEX_PREFS` from `../../lib/codex-prefs`. Above the `return`, add a one-field updater and the Import/Copy handlers:

```tsx
const setPref = <K extends keyof typeof codexPrefs>(
  key: K,
  value: (typeof codexPrefs)[K]
) => setCodexPrefs((p) => ({ ...p, [key]: value }));

const handleCopy = () => {
  void navigator.clipboard.writeText(
    JSON.stringify({ ...contract, prefs: codexPrefs }, null, 2)
  );
};

const handleImport = () => {
  const text = window.prompt('Paste a theme JSON');
  if (!text) return;
  try {
    const parsed = JSON.parse(text);
    setCodexContract({
      appearance: parsed.appearance ?? contract.appearance,
      light: parsed.light ?? contract.light,
      dark: parsed.dark ?? contract.dark,
      contrast: parsed.contrast ?? contract.contrast,
    });
    if (parsed.prefs) setCodexPrefs((p) => ({ ...p, ...parsed.prefs }));
  } catch {
    window.alert('That was not valid theme JSON.');
  }
};
```

- [ ] **Step 2: Add the Import/Copy buttons to the PageHeader**

```tsx
<PageHeader
  title="Appearance"
  description="Edit a few values; the whole console re-themes in real time."
>
  <Button variant="ghost" size="sm" onClick={handleImport}>
    Import
  </Button>
  <Button variant="ghost" size="sm" onClick={handleCopy}>
    Copy theme
  </Button>
</PageHeader>
```

- [ ] **Step 3: Pass the diffMarkers pref to the preview**

```tsx
<ThemeConfigDiff contract={contract} markers={codexPrefs.diffMarkers} />
```

- [ ] **Step 4: Add a "Preferences" card after the theme card**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Preferences</CardTitle>
  </CardHeader>
  <CardContent>
    <SettingRow label="UI font size" description="Base size for the Codex UI">
      <Input
        type="number"
        min={8}
        max={32}
        value={codexPrefs.uiFontSize}
        onChange={(e) => setPref('uiFontSize', Number(e.target.value))}
        className="nx:w-20"
      />
    </SettingRow>
    <SettingRow label="Code font size" description="Base size for code & diffs">
      <Input
        type="number"
        min={8}
        max={32}
        value={codexPrefs.codeFontSize}
        onChange={(e) => setPref('codeFontSize', Number(e.target.value))}
        className="nx:w-20"
      />
    </SettingRow>
    <SettingRow label="Translucent sidebar">
      <Switch
        checked={codexPrefs.translucentSidebar}
        onCheckedChange={(v) => setPref('translucentSidebar', v)}
      />
    </SettingRow>
    <SettingRow
      label="Use pointer cursors"
      description="Pointer cursor on interactive elements"
    >
      <Switch
        checked={codexPrefs.pointerCursors}
        onCheckedChange={(v) => setPref('pointerCursors', v)}
      />
    </SettingRow>
    <SettingRow label="Reduce motion">
      <ToggleGroup
        type="single"
        value={codexPrefs.reduceMotion}
        onValueChange={(v) => {
          if (v === 'system' || v === 'on' || v === 'off')
            setPref('reduceMotion', v);
        }}
        variant="outline"
      >
        <ToggleGroupItem value="system">System</ToggleGroupItem>
        <ToggleGroupItem value="on">On</ToggleGroupItem>
        <ToggleGroupItem value="off">Off</ToggleGroupItem>
      </ToggleGroup>
    </SettingRow>
    <SettingRow label="Diff markers">
      <ToggleGroup
        type="single"
        value={codexPrefs.diffMarkers}
        onValueChange={(v) => {
          if (v === 'color' || v === 'symbols') setPref('diffMarkers', v);
        }}
        variant="outline"
      >
        <ToggleGroupItem value="color">Color</ToggleGroupItem>
        <ToggleGroupItem value="symbols">+ / -</ToggleGroupItem>
      </ToggleGroup>
    </SettingRow>
    <SettingRow label="Font smoothing" description="Native macOS anti-aliasing">
      <Switch
        checked={codexPrefs.fontSmoothing}
        onCheckedChange={(v) => setPref('fontSmoothing', v)}
      />
    </SettingRow>
  </CardContent>
</Card>
```

- [ ] **Step 5: Typecheck + commit**

Run: `pnpm --filter @nexus/console typecheck && pnpm --filter @nexus/console exec eslint src/modules/codex/codex-route.tsx`

```bash
git add apps/console/src/modules/codex/codex-route.tsx
git commit -m "feat(console): preference rows + Import/Copy in the Codex editor"
```

---

## Task 6: Live verification

- [ ] **Step 1: Run + verify**

Run: `pnpm --filter @nexus/console dev`, open `/design/codex`:

1. Change **UI font size** → the UI rescales (rem-based elements). Change **Code font size** → the diff preview's text resizes.
2. Toggle **Font smoothing**, **Use pointer cursors** (hover a button → pointer), **Reduce motion = On** (transitions stop).
3. Toggle **Diff markers** to `+ / -` → the diff preview drops the color background, keeps the symbols.
4. Click **Copy theme** → a JSON theme is on the clipboard; edit some values, click **Import**, paste it back → the theme restores.
5. Confirm the color editor (Phase 3) still re-themes live.

- [ ] **Step 2: Confirm the prefs `<style>` is present**

In DevTools console: `document.getElementById('nexus-appearance-prefs')?.textContent` — shows the generated rules.

---

## Self-Review (completed)

**Spec coverage (§5, §9):** prefs type + persistence = Task 1; runtime application = Tasks 2–3; the rows (fonts/sizes/translucent/pointer/motion/diff-markers/smoothing) = Task 5; `diffMarkers` honored = Task 4 + Task 5 Step 3; Import/Copy = Task 5. **Deferred (Phase 5):** the named presets registry.

**Placeholder scan:** none — complete code or exact commands throughout. The two honest limitations (font-size scaling, translucent depth) are documented in the scope note, not silent gaps.

**Type consistency:** `CodexPrefs` from Task 1 used in 2–5; `codexPrefs`/`setCodexPrefs` defined Task 3, consumed Task 5; `prefsToCss` Task 1 → Task 2; `markers` prop Task 4 → Task 5. `setPref<K>` is generically typed against `CodexPrefs`. ToggleGroup `onValueChange` is narrowed (`===`) before `setPref`, matching the Phase 3 pattern.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-10-codex-appearance-prefs.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task.

**2. Inline Execution** — execute here with checkpoints, as in Phases 1–3.

Which approach? (This is the last screen-completing phase; the named-presets registry is the only Phase 5 remainder.)
