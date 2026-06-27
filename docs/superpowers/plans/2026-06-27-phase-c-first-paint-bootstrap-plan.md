# Phase C — Appearance First-Paint Bootstrap — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.
>
> **Supersedes** the draft "Phase C: Appearance First-Paint Bootstrap" (by Codex). This version resolves the council review in [`reports/phase-c-plan-council-review.md`](../../../reports/phase-c-plan-council-review.md). Two of the review's findings were **refuted** and are deliberately NOT acted on (see Decisions 3 and 8). Builds on the **real Phase B in PR #536** (`codex/phase-b-appearance-package`) — read the live provider via `git show FETCH_HEAD:packages/react/src/appearance/provider.tsx` after `git fetch origin codex/phase-b-appearance-package`.

**Goal:** Eliminate the appearance theme flash/hydration-mismatch on first paint — a pre-React inline `<head>` script applies the persisted (or default) theme before the browser paints, and the provider becomes SSR-safe by construction.

**Architecture:** A single engine-free **pure resolver** in `@nexus/core` is the keystone: the inline bootstrap script and the React provider's mount-init both apply its output, so they agree by construction. Persisted storage becomes a versioned snapshot carrying pre-derived CSS, so the inline script ships **no** OKLCH/APCA engine. A `createNexusAppearance({storageKey, defaultState})` factory closes the provider and the script over one config so their defaults can't drift.

**Tech Stack:** TypeScript, React 19, classic (non-module) inline `<script>`, Tailwind v4, vitest (jsdom + node env), `@nexus/test-utils`.

## Global Constraints

- **No engine in the inline script.** The bootstrap applies a CSS **snapshot**; it never imports/derives OKLCH/APCA. `culori`/`apca-w3` must not appear in any shipped browser script.
- **Browser floor Safari 15.4 / Firefox 113.** No `light-dark()` in emitted CSS. **No `blocking="render"`** — unsupported across the entire Safari floor (shipped 18.2) and all Firefox; a classic non-module inline `<head>` script is parser-blocking by default, which is the correct cross-browser no-flash mechanism (MWG `dark-mode` guide; repo precedent `apps/docs/app/_components/ThemeBootstrap.tsx`).
- **`color-scheme` is dual-sourced on purpose:** `<meta name="color-scheme" content="…">` is MANDATORY (MWG `dark-mode` L11/L129) as the no-JS parse-time FOUC floor; the inline `style.colorScheme` on `:root` is the post-resolve concrete value. Both are set (Decision 8).
- **Tests:** logic via `*.test.ts(x)` outside `packages/react/src/components/**`, run from root `pnpm test:unit <path>` (the `unit` vitest project is jsdom; SSR tests use `// @vitest-environment node`). jsdom cannot observe "before React" — the no-flash guarantee needs a documented **manual** check (no in-repo first-paint-timing harness exists).
- **Pre-production** (`project-stage.md`): no migration shims, no aliases, change in place.

## Execution Status

- [x] Task 1: core versioned appearance snapshots.
- [x] Task 2: engine-free first-paint resolver.
- [x] Task 3: parser-blocking bootstrap script factory.
- [x] Task 4: SSR-safe provider init, snapshot persistence, and mounted flag.
- [x] Task 5: React script component and `createNexusAppearance` factory.
- [x] Task 6: provider/bootstrap equivalence, stale-cache recovery, default CSS, version recovery, and system-mode coverage.
- [x] Task 7: chose the **document the embed** path for this branch. Static brand-baseline alignment remains an owner-gated product decision.
- [x] Task 8: host setup docs and verification sweep.

## Verification Status

Completed on `codex/phase-c-appearance-first-paint`:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test:unit`
- `pnpm --filter @nexus/core build`
- `pnpm --filter @nexus/react build`
- `pnpm size-limit`
- `pnpm audit:browser-support`
- tracked-file Prettier check via `git ls-files ... | xargs pnpm exec prettier --check`
- generated bootstrap script scan for engine references and unsafe script markers

Local `pnpm format:check` sees unrelated untracked scratch markdown already
present in this checkout, so the tracked-file Prettier check is the relevant PR
gate until those scratch files are cleaned separately.

---

## Decisions locked (resolving the council review)

1. **Pure resolver is the keystone (NEW-1).** Add `resolveFirstPaint(snapshot, systemPrefersDark) → { className: 'dark'|''; dataAttrs: Record<string,string>; colorScheme: 'light'|'dark'; metaColorScheme: 'light'|'dark'|'light dark'; themeCss: string; prefsCss: string }` to `@nexus/core`, engine-free (CSS comes from the snapshot). The inline script and the provider's mount-init both apply it → identical output → no drift, no hydration-time repaint.
2. **Provider becomes SSR-safe by construction.** Render inits to `defaultState` deterministically (server == client first render); a mount `useEffect` reads the snapshot and `setState`s the real value; expose a `mounted` flag so consumers can render neutral-until-mounted. The provider's apply-effects re-apply the **same** values the bootstrap already set (idempotent — no visual flash because identical). This captures the epic L103 _intent_ (SSR-safe init) without its impossible mechanism ("read full state from the DOM" — refuted: the DOM can't carry brandColor/contrast/tone/prefs).
3. **REFUTED — keep reading storage, not the DOM.** The provider keeps localStorage as the source of truth for `state` (the DOM only carries the no-flash _pixels_). Do not attempt DOM-state reconstruction.
4. **`version` gates the CSS cache, never the state (C3).** Snapshot = `{ version, state, themeCss, prefsCss }`. On any readable payload the provider recovers `state` via `sanitizeNexusAppearance` and **re-derives** CSS (it has the engine) — never resets. The cached `themeCss`/`prefsCss` are a disposable cache for the _next_ load's engine-free script; the script falls back to the embedded default on version mismatch (one-paint default flash, self-heals when the provider re-writes a current snapshot).
5. **Snapshot is the ONLY storage format (C5).** Drop the "read both snapshot and raw Phase B state" shim — #536 is unmerged (zero persisted users), pre-prod + epic L134 make reset-to-default acceptable. `sanitizeNexusAppearance` resets anything unreadable.
6. **`createNexusAppearanceSnapshot(state, themeCss, prefsCss)` takes pre-derived CSS (NEW-3)** — the provider already memoizes both; never derive twice.
7. **One config, two artifacts (C12).** `createNexusAppearance({ storageKey, defaultState }) → { NexusAppearanceProvider, NexusAppearanceScript }`, both closed over the same config. The bootstrap `<style>` tags MUST carry the exact attributes the provider's `upsertStyle` queries — `data-nexus-appearance-theme` / `data-nexus-appearance-prefs` — so the provider reuses them instead of stacking a second tag.
8. **REFUTED — keep the `color-scheme` meta.** The plan's meta sync (system→`light dark`, pinned→`light`/`dark`) is MWG-MANDATORY and the no-JS floor — it is NOT wrong. Keep it; coordinate it with Phase B's existing concrete `style.colorScheme` (Decision/Global-constraint above).
9. **First-visit default CSS source must be explicit (C-B2).** The appearance default (`brandColor #339cff`, blue) ≠ the shipped `nexus.css` light `:root` primary (`var(--nx-color-black-base)`, achromatic — the `--brand=black` build default). **Preferred fix (precursor, Task 7):** align the shipped brand default to the appearance default so first-visit needs zero embedded CSS (owner decision — only `brandColor` diverges; `surfaceTone=stone` already agrees). **Chosen for this branch:** document the fallback and keep the script embedding the default snapshot CSS (~12 KB raw / ~1.7 KB gzip). The plan must not silently rely on `nexus.css` (achromatic).
10. **Drop "reject unsafe CSS" (C10).** Same-origin localStorage is writable only by your own code or an XSS that already won. Rely on `sanitizeNexusAppearance(state)` + `textContent` (never `innerHTML`). Keep the `</script>`/`light-dark(` absence assertions on the _generated_ script.
11. **MWG gate (process).** This phase's plan PR must include the Modern Web Guidance section: searched `dark-mode` + `flicker-free-client-side-ab-testing`; documented the parser-blocking rationale; browser-floor decision (no `blocking="render"`).

---

## File Structure

**Create:**

- `packages/core/src/lib/appearance-snapshot.ts` — `NexusAppearanceSnapshot`, `SNAPSHOT_VERSION`, `createNexusAppearanceSnapshot`, `sanitizeNexusAppearanceSnapshot`, `resolveFirstPaint`, `createNexusAppearanceBootstrapScript`.
- `packages/core/src/lib/appearance-snapshot.test.ts`.
- `packages/react/src/appearance/script.tsx` — `NexusAppearanceScript` + `createNexusAppearance` factory.
- `packages/react/src/appearance/provider.test.tsx` additions + `packages/react/src/appearance/provider.ssr.test.tsx` (node env).
- `docs/superpowers/specs/2026-06-27-appearance-host-setup.md` — host-app `<head>` setup.

**Modify:**

- `packages/core/src/index.ts` — export the snapshot module.
- `packages/react/src/appearance/provider.tsx` — SSR-safe init + `mounted` + snapshot write + reuse the resolver.
- `packages/react/src/appearance/index.ts` — export `NexusAppearanceScript`, `createNexusAppearance`.
- (Task 7, owner-gated) `packages/core/package.json` `build:tailwind` brand default + regenerate `packages/tailwind/*.css`.

---

## Task 1: Core — snapshot type, factory, sanitizer (version gates CSS cache)

**Files:** Create `packages/core/src/lib/appearance-snapshot.ts`, `appearance-snapshot.test.ts`.

**Interfaces:**

- Produces: `SNAPSHOT_VERSION` (const `1`), `NexusAppearanceSnapshot = { version: number; state: NexusAppearanceState; themeCss: string; prefsCss: string }`, `createNexusAppearanceSnapshot(state, themeCss, prefsCss): NexusAppearanceSnapshot`, `sanitizeNexusAppearanceSnapshot(raw): NexusAppearanceSnapshot`. Consumes `NexusAppearanceState`, `sanitizeNexusAppearance`, `createNexusThemeContract`, `deriveTheme`, `themeToCss`, `appearancePrefsToCss` from `./appearance-model` / `./derive-theme`.

- [ ] **Step 1: Failing tests.**

```ts
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_NEXUS_APPEARANCE,
  createNexusThemeContract,
  deriveTheme,
  themeToCss,
  appearancePrefsToCss,
} from '../index';
import {
  SNAPSHOT_VERSION,
  createNexusAppearanceSnapshot,
  sanitizeNexusAppearanceSnapshot,
} from './appearance-snapshot';

const css = (s = DEFAULT_NEXUS_APPEARANCE) =>
  themeToCss(deriveTheme(createNexusThemeContract(s)));
const prefs = (s = DEFAULT_NEXUS_APPEARANCE) => appearancePrefsToCss(s.prefs);

it('createNexusAppearanceSnapshot stores pre-derived CSS verbatim (no re-derivation)', () => {
  const snap = createNexusAppearanceSnapshot(
    DEFAULT_NEXUS_APPEARANCE,
    css(),
    prefs()
  );
  expect(snap.version).toBe(SNAPSHOT_VERSION);
  expect(snap.themeCss).toBe(css()); // byte-identical — not recomputed
  expect(snap.state.brandColor).toBe('#339cff');
});

it('sanitize recovers state on version mismatch (never resets) but drops the stale CSS cache', () => {
  const dark = {
    ...DEFAULT_NEXUS_APPEARANCE,
    mode: 'dark' as const,
    brandColor: '#ff0000',
  };
  const raw = {
    version: 999,
    state: dark,
    themeCss: 'STALE',
    prefsCss: 'STALE',
  };
  const out = sanitizeNexusAppearanceSnapshot(raw);
  expect(out.state).toEqual(dark); // state recovered, not DEFAULT
  expect(out.themeCss).not.toBe('STALE'); // cache discarded → re-derived current CSS
  expect(out.themeCss).toBe(css(dark));
});

it('sanitize resets to default snapshot on unreadable payload', () => {
  expect(sanitizeNexusAppearanceSnapshot('garbage').state).toEqual(
    DEFAULT_NEXUS_APPEARANCE
  );
  expect(sanitizeNexusAppearanceSnapshot(null).themeCss).toBe(css());
});
```

- [ ] **Step 2: Run — expect FAIL.** `pnpm test:unit packages/core/src/lib/appearance-snapshot.test.ts`
- [ ] **Step 3: Implement.** `createNexusAppearanceSnapshot` = `{ version: SNAPSHOT_VERSION, state, themeCss, prefsCss }` (verbatim). `sanitizeNexusAppearanceSnapshot(raw)`: parse object; if there is no readable `raw.state`, reset to the default snapshot (Decision 5: no raw Phase B state shim); otherwise `state = sanitizeNexusAppearance(raw.state)`. If `raw.version === SNAPSHOT_VERSION` and `themeCss`/`prefsCss` are strings, trust them; **else re-derive** `themeCss = themeToCss(deriveTheme(createNexusThemeContract(state)))`, `prefsCss = appearancePrefsToCss(state.prefs)`. Return the current-version snapshot. (This is the engine-bearing path — the provider uses it; the engine-free script uses `resolveFirstPaint`, Task 2.)
- [ ] **Step 4: Run — expect PASS.**
- [ ] **Step 5: Commit.** `git commit -m "feat(core): NexusAppearance snapshot (version gates CSS cache, recovers state)"`

---

## Task 2: Core — the pure resolver (engine-free)

**Files:** Modify `appearance-snapshot.ts`, `appearance-snapshot.test.ts`.

**Interfaces:** Produces `resolveFirstPaint(snapshot: NexusAppearanceSnapshot, systemPrefersDark: boolean) → { className: ''|'dark'; dataAttrs: { 'data-style','data-radius','data-shadow','data-borderwidth' }; colorScheme: 'light'|'dark'; metaColorScheme: 'light'|'dark'|'light dark'; themeCss: string; prefsCss: string }`. **Engine-free** — reads only `snapshot.state` + `snapshot.{themeCss,prefsCss}`.

- [ ] **Step 1: Failing tests.**

```ts
import {
  resolveFirstPaint,
  createNexusAppearanceSnapshot,
} from './appearance-snapshot';
import { DEFAULT_NEXUS_APPEARANCE } from '../index';
const snap = (s) => createNexusAppearanceSnapshot(s, 'THEME', 'PREFS');

it('pinned dark resolves concretely; meta is pinned', () => {
  const r = resolveFirstPaint(
    snap({ ...DEFAULT_NEXUS_APPEARANCE, mode: 'dark' }),
    false
  );
  expect(r.className).toBe('dark');
  expect(r.colorScheme).toBe('dark');
  expect(r.metaColorScheme).toBe('dark');
  expect(r.dataAttrs['data-style']).toBe('mira'); // density default
});
it('system mode uses the OS pref for class/colorScheme but emits meta "light dark"', () => {
  const r = resolveFirstPaint(
    snap({ ...DEFAULT_NEXUS_APPEARANCE, mode: 'system' }),
    true
  );
  expect(r.className).toBe('dark'); // OS prefers dark
  expect(r.colorScheme).toBe('dark');
  expect(r.metaColorScheme).toBe('light dark'); // no-JS floor (MWG)
});
it('passes snapshot CSS through untouched (no engine)', () => {
  expect(
    resolveFirstPaint(snap(DEFAULT_NEXUS_APPEARANCE), false).themeCss
  ).toBe('THEME');
});
```

- [ ] **Step 2: Run — FAIL.** **Step 3: Implement** (pure function: `mode==='system' ? systemPrefersDark : mode==='dark'` → concrete; `metaColorScheme = mode==='system' ? 'light dark' : mode`; `dataAttrs` from `state.density/corners/elevation/stroke`; CSS passed through). **Step 4: PASS.** **Step 5: Commit** `feat(core): engine-free resolveFirstPaint`.

---

## Task 3: Core — bootstrap script factory (engine-free, parser-blocking)

**Files:** Modify `appearance-snapshot.ts`, `appearance-snapshot.test.ts`; export all from `packages/core/src/index.ts`.

**Interfaces:** Produces `createNexusAppearanceBootstrapScript(options?: { storageKey?: string; defaultSnapshot?: NexusAppearanceSnapshot; }): string` — a **classic, non-module** JS string for an inline `<head>` `<script>`. At runtime it: reads `localStorage[storageKey]`, parses + version-checks inline, runs the `resolveFirstPaint` logic (inlined — no import), and applies `className`/`dataAttrs`/`colorScheme`/`metaColorScheme` + injects the two `<style data-nexus-appearance-*>` tags. On missing/invalid/version-mismatch storage it applies the **embedded default snapshot** (so first-visit/empty-storage is flash-free — Decision 9).

> **Implementer note:** the generator embeds `JSON.stringify(defaultSnapshot)` (default themeCss/prefsCss baked in at generation time, where the engine is available) so the runtime script needs no engine. ESCAPE the embedded JSON for inline-`<script>` safety: replace `</`→`<\/`, `<!--`→`<\!--`, `<![CDATA[`, U+2028→` `, U+2029→` `. The script must be tiny apart from the embedded default CSS — if Task 7 aligns the baseline, the default CSS can be omitted and the script applies attrs-only on first visit.

- [ ] **Step 1: Failing tests.**

```ts
import { createNexusAppearanceBootstrapScript, createNexusAppearanceSnapshot } from './appearance-snapshot';
import { DEFAULT_NEXUS_APPEARANCE, /* css/prefs helpers */ } from '../index';

const script = createNexusAppearanceBootstrapScript();
it('is engine-free and injection-safe', () => {
  expect(script).not.toMatch(/culori|apca|deriveTheme|themeToCss|rampFromSeed|seedOklch/i); // no engine
  expect(script).not.toContain('</script');
  expect(script).not.toContain('light-dark(');
  expect(script).not.toMatch(/ | /);
});
it('applies a stored dark snapshot to the document (jsdom — mutations, not timing)', () => {
  const dark = createNexusAppearanceSnapshot({ ...DEFAULT_NEXUS_APPEARANCE, mode: 'dark' }, /*themeCss*/'', /*prefsCss*/'');
  localStorage.setItem('nexus-appearance', JSON.stringify(dark));
  new Function(createNexusAppearanceBootstrapScript())(); // execute the classic script body
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(document.documentElement.getAttribute('data-radius')).toBe('sharp');
  expect(document.querySelectorAll('style[data-nexus-appearance-theme]')).toHaveLength(1);
});
it('falls back to the embedded default on empty storage', () => {
  localStorage.clear();
  new Function(createNexusAppearanceBootstrapScript())();
  expect(document.documentElement.getAttribute('data-style')).toBe('mira');
});
```

- [ ] **Step 2: Run — FAIL.** **Step 3: Implement** the factory (build the default snapshot from `DEFAULT_NEXUS_APPEARANCE` via Task 1 at generation time; emit the escaped string; inline the resolver logic + `matchMedia('(prefers-color-scheme: dark)').matches` for system; apply via `setAttribute`/`classList`/`style.colorScheme` + `meta[name=color-scheme]` + upsert `<style data-nexus-appearance-theme>`/`[data-nexus-appearance-prefs]` with `textContent`). **Step 4: PASS.** **Step 5:** add `export * from './lib/appearance-snapshot'` to `packages/core/src/index.ts`; **Commit** `feat(core): createNexusAppearanceBootstrapScript`.

---

## Task 4: Provider — SSR-safe init + mounted + snapshot write

**Files:** Modify `packages/react/src/appearance/provider.tsx`; add cases to `provider.test.tsx`; create `provider.ssr.test.tsx`.

**Interfaces:** `NexusAppearanceContextValue` gains `mounted: boolean`. Behavior changes only — props unchanged.

- [ ] **Step 1: Failing tests** (`provider.test.tsx`, jsdom):

```ts
it('first render is the default state; storage is adopted after mount', async () => {
  localStorage.setItem('nexus-appearance', JSON.stringify(createNexusAppearanceSnapshot({ ...DEFAULT_NEXUS_APPEARANCE, surfaceTone: 'slate' }, '', '')));
  const seen: string[] = [];
  function Probe() { const { state, mounted } = useNexusAppearance(); seen.push(`${mounted}:${state.surfaceTone}`); return null; }
  render(<NexusAppearanceProvider><Probe /></NexusAppearanceProvider>);
  expect(seen[0]).toBe('false:stone');          // deterministic default first (SSR-safe)
  await waitFor(() => expect(seen.at(-1)).toBe('true:slate')); // adopted post-mount
});

it('writes the snapshot format (version + state + css) in uncontrolled mode', async () => {
  const { result } = renderHook(() => useNexusAppearance(), { wrapper: ({ children }) => <NexusAppearanceProvider storageKey="k">{children}</NexusAppearanceProvider> });
  act(() => result.current.setState((s) => ({ ...s, mode: 'dark' })));
  await waitFor(() => {
    const snap = JSON.parse(localStorage.getItem('k')!);
    expect(snap.version).toBe(1);
    expect(snap.state.mode).toBe('dark');
    expect(typeof snap.themeCss).toBe('string'); // pre-derived CSS persisted (Decision 6)
  });
});

it('reuses a bootstrap-created <style> tag instead of stacking a second (C12)', () => {
  const pre = document.createElement('style'); pre.setAttribute('data-nexus-appearance-theme',''); pre.textContent='/*boot*/'; document.head.appendChild(pre);
  render(<NexusAppearanceProvider><div/></NexusAppearanceProvider>);
  expect(document.querySelectorAll('style[data-nexus-appearance-theme]')).toHaveLength(1);
});
```

- [ ] **Step 2: SSR test** (`provider.ssr.test.tsx`, first line `// @vitest-environment node`):

```ts
// @vitest-environment node
import { renderToString } from 'react-dom/server';
it('renders without window (SSR) and does not throw', () => {
  expect(() => renderToString(<NexusAppearanceProvider><span>ok</span></NexusAppearanceProvider>)).not.toThrow();
});
```

- [ ] **Step 3: Run — FAIL.** **Step 4: Implement.** Refactor `provider.tsx` (real source at `FETCH_HEAD`):
  - Replace `useState(() => readStoredState(...))` with `useState(initialState)` (deterministic default → server and client first render are byte-identical) + `const [mounted, setMounted] = useState(false)`.
  - A mount effect reads the snapshot (`sanitizeNexusAppearanceSnapshot`), `setInternalState(snap.state)`, `setMounted(true)`.
  - **The ordering hazard (this is the part that reintroduces the flash if done naively):** the DOM apply-effects must NOT paint the _default_ over the DOM the bootstrap already set, then correct to stored — that is the exact flash this phase kills. The bootstrap owns first-paint pixels; the provider must apply only the **storage-read** values, never the transient default. Gate the four apply-effects so they run only once `mounted` (i.e. after the snapshot read), trusting the bootstrap's pre-paint DOM until then. (If a host runs the provider with no bootstrap script — CSR without `<head>` injection — there is still a one-effect flash; that's why Task 8 docs require the script for no-flash. Do not try to fix that with a render-time storage read — it reintroduces the SSR hydration mismatch.)
  - Change `writeStoredState` to persist `createNexusAppearanceSnapshot(state, themeCss, prefsCss)` (pass the memoized `themeCss`/`prefsCss` — Decision 6, no second derivation).
  - Expose `mounted` in context. Controlled mode unchanged (no storage read/write).
  - **Step 5: Run — PASS** (`pnpm test:unit packages/react/src/appearance/provider`). **Step 6: Commit** `feat(react): SSR-safe provider init + snapshot persistence`.

---

## Task 5: React — `createNexusAppearance` factory + `NexusAppearanceScript`

**Files:** Create `packages/react/src/appearance/script.tsx`; export from `index.ts`.

**Interfaces:** `createNexusAppearance(config: { storageKey?: string; defaultState?: NexusAppearanceState }) → { NexusAppearanceProvider: FC<Omit<Props,'storageKey'|'defaultState'>>; NexusAppearanceScript: FC<{ nonce?: string }> }`, both closed over `config` (Decision 7). `NexusAppearanceScript` SSR-renders `<script nonce dangerouslySetInnerHTML={{ __html: createNexusAppearanceBootstrapScript({ storageKey, defaultSnapshot }) }} />`.

- [ ] **Step 1: Failing test** — `createNexusAppearance({ storageKey: 'x' })` returns a Provider and Script that both use `'x'`; rendering `<NexusAppearanceScript/>` to string contains the bootstrap body and the `nonce`. (Use `renderToStaticMarkup`.)
- [ ] **Step 2: FAIL. Step 3: Implement** (the factory builds the default snapshot from `config.defaultState ?? DEFAULT_NEXUS_APPEARANCE`; the Script is a server component-safe `<script>`; **document** that it must be SSR'd into `<head>` — a client-rendered inline script does not run parser-blocking and React 19 won't dedupe it). **Step 4: PASS. Step 5: Commit** `feat(react): createNexusAppearance factory + NexusAppearanceScript`.

---

## Task 6: Equivalence + no-flash verification (the load-bearing tests)

**Files:** `appearance-snapshot.test.ts`, `provider.test.tsx`.

- [ ] **Step 1: Byte-equivalence test (C11)** — the snapshot CSS the script applies must equal what the provider re-derives, **byte-for-byte**, off the **sanitized** state (else a hydration repaint). Seed storage with a snapshot for a non-default state that sanitization _alters_ (e.g. `contrast: 999`), mount the provider, after the effect assert `document.querySelector('style[data-nexus-appearance-theme]').textContent === themeToCss(deriveTheme(createNexusThemeContract(sanitizeNexusAppearance(state))))`. Run the same assertion with the **DEFAULT** state (pins C-B2: empty storage applies the default _themeCss_, not just attrs).
- [ ] **Step 2: Version-recovery test (C3)** — snapshot `{version:999, state:<valid non-default>}` → provider mounts to that state (not DEFAULT).
- [ ] **Step 3: System-mode `matchMedia` override** — reuse the existing override pattern (the shared mock at `packages/test-utils/src/setup.ts` hardcodes `matches:false`; restore in `afterEach`); assert system→dark applies `.dark` and the `change` listener flips it.
- [ ] **Step 4: Run + Commit** `test: snapshot/provider equivalence + recovery + system-mode`.

---

## Task 7 (owner-gated precursor): align the shipped brand default — OR document the embed

**Files (if aligning):** `packages/core/package.json` `build:tailwind` `--brand`, regenerate `packages/tailwind/*.css`.

This is the C-B2 owner decision (blue brand identity). Do **one**:

- [ ] **Align (preferred):** change `build:tailwind --brand=black` → the appearance default brand and regenerate, so `nexus.css :root` light/dark primary == `themeToCss(deriveTheme(createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE)))` for the brand tokens. Then Task 3's script can omit the embedded default CSS (attrs-only first visit). Run `pnpm --filter @nexus/core audit:contrast` + `pnpm --filter @nexus/core build:tailwind`. **Likely a separate small precursor PR** (`feedback-precursor-pr-for-arch-fixes`).
- [x] **Or document the embed:** keep `--brand=black`, accept the script embeds the default snapshot CSS (~1.7 KB gzip), and note in the PR that the static `nexus.css` baseline is the non-appearance fallback only.

> Decision owner: confirm blue-vs-achromatic brand default before this task. The plan is correct either way; only Task 3's embed size changes.

---

## Task 8: Host-setup docs + verification sweep

- [ ] **Step 1: Docs (epic L104).** Write host-app setup: Next.js app-router — render `<NexusAppearanceScript/>` inside the root layout `<head>`; add `suppressHydrationWarning` to `<html>`; note consumers should gate theme-dependent UI on `mounted` (from `useNexusAppearance`). Include the `<meta name="color-scheme" content="light dark">` default. Plain-HTML hosts: inline `createNexusAppearanceBootstrapScript()` in `<head>`.
- [ ] **Step 2: Manual no-flash check (epic L110, jsdom can't).** Documented steps: in a Next.js sandbox, set a dark snapshot, hard-refresh, confirm no light flash; toggle OS theme in `system` mode; confirm no hydration warning in console.
- [ ] **Step 3: Full gate.**

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test:unit \
  && pnpm --filter @nexus/core build && pnpm --filter @nexus/react build \
  && pnpm size-limit && pnpm audit:browser-support
```

- [ ] **Step 4:** Confirm no engine in the script: `! rg -qi "culori|apca" packages/core/dist/**/appearance-snapshot*` and the generated script string carries no derivation engine code. Embedded default CSS may contain inert `oklch(` values. **Commit.**

---

## Self-Review (against the council review)

- **C-B1 (SSR unverifiable + docs dropped):** Task 4 makes the provider SSR-safe by construction + Task 8 restores host-setup docs + a manual no-flash step (the only vehicle — jsdom/Playwright can't see first paint). ✔ Honest limit: no in-repo SSR consumer exercises it; verified by unit (SSR-render, equivalence) + manual.
- **C-B2 (first-visit default source):** Decision 9 + Task 7 — align the baseline (preferred) or document the embed. ✔
- **Keystone / C3 / C5 / NEW-3 / C12:** pure resolver (Task 2) consumed by script (Task 3) + provider (Task 4); version gates the CSS cache (Task 1); snapshot-only (Task 1/5); pre-derived CSS persisted (Task 4/6); one config factory + style-attr contract (Task 5/6-Step3). ✔
- **Refuted, deliberately NOT done:** read-from-DOM (Decision 3), drop-the-meta (Decision 8), reduce-motion bootstrap (components honor `prefers-reduced-motion` natively). ✔
- **C10/MWG:** unsafe-CSS validation dropped (Decision 10); MWG section required on the PR (Decision 11). ✔
- **Placeholder scan:** the bootstrap-script internals are specified by interface + escaping rules + tests, not fabricated; all test code is concrete. **Type consistency:** `NexusAppearanceSnapshot` (Task 1) flows through `resolveFirstPaint` (Task 2), the script (Task 3), and the provider (Task 4) unchanged.

---

## Execution Handoff

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between.
2. **Inline Execution** — with checkpoints.

**Dependency order:** Tasks 1→2→3 (core, sequential) → Task 4 (provider) → Task 5 (factory) → Task 6 (equivalence tests) → Task 8 (docs/sweep). Task 7 is an independent owner-gated precursor (ideally a separate PR) and can run in parallel.
