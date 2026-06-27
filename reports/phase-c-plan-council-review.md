# Phase C Plan — Council Review

**Plan reviewed:** "Phase C: Appearance First-Paint Bootstrap" (by Codex)
**Method:** 5-agent council (architect / sde2 / tester / omissions-sweep / adversarial refuter), reviewed against the **real Phase B in PR #536** (`codex/phase-b-appearance-package`, OPEN) — not the Phase B plan — plus the authoritative Modern Web Guidance `dark-mode` + `flicker-free` guides. (One agent — the sde2 implementation-feasibility lens — stalled on an API error mid-run; its scope was partially recovered by the architect (bundle/React-19) and tester (style-tag contract) agents, and the gaps it would have owned are flagged below.)

**Verdict:** **The hard parts are right; the plan is under-specified and ships its headline guarantee unverified.** Codex's two riskiest-looking decisions (parser-blocking non-module script; `color-scheme` meta sync) are **correct and backed by primary sources** — I had two findings that the council/MWG **refuted**, reported in §4. The real problems are a dropped SSR-setup deliverable and a scattered design that one refactor would fix.

---

## A note on calibration (read this first — it's the trust point)

Three findings did **not** survive verification — two of my own, one the council raised — and I'm leading with them rather than burying them:

- **"The `color-scheme` meta is wrong for system mode" — REFUTED.** The MWG `dark-mode` guide makes `<meta name="color-scheme" content="light dark">` for system (and `light`/`dark` pinned) **MANDATORY** — it's the no-JS, parse-time FOUC floor (guide L11, L124, L129, L132). Codex's meta sync is the canonical pattern. (One council agent also argued "drop the meta" — it was wrong too; the primary source settles it.)
- **"The provider must read initial state from the DOM" (epic L103) — REFUTED.** The bootstrap stamps only `.dark` + 4 `data-*` axes + an **opaque, one-way-derived** `<style>`. `brandColor`, `surfaceTone`, `contrast`, and all `prefs` are **not reconstructable** from the DOM. So Phase B's `useState(() => readStoredState(...))` (localStorage, client-only via `canUseDOM`) is **CSR-correct**, and omitting the epic's instruction is right, not a defect. The epic contradicts itself here (its own resolver L110 takes the "persisted payload," i.e. localStorage). The remaining nuance is purely about SSR: a client-only initializer read makes the first client render diverge from the server's default render — so an SSR host needs init-to-default + read-storage-in-a-mount-effect + a `mounted` guard for consumers. That's a **documented future requirement** (no in-scope appearance consumer is SSR yet — see C-B1), not a current provider rewrite.

- **"Reduced-motion FOUC at first paint" (council omissions sweep) — CUT.** The claim was that `reduceMotion: 'system'` users would see full-speed animation before the provider mounts. But Nexus components honor `@media (prefers-reduced-motion: reduce)` **natively** (`packages/react/src/index.css` + tabs, drawer, tooltip, navigation-menu, progress, …) — parse-time, zero JS, zero flash. So system mode needs no bootstrap action; the finding was wrong. `appearancePrefsToCss` correctly emits a reduction block only for the explicit `'on'` override.

A review that only piles on isn't trustworthy. These were real candidates that the evidence killed — including one the council surfaced that I vetted rather than forwarded.

---

## 1. Blocking (verified — resolve before implementation)

### C-B1. The no-flash guarantee is **structurally unverifiable** in this phase, and the host-setup Docs deliverable (epic L104) is dropped

This is the load-bearing gap. The whole phase exists to prove "no flash / no hydration mismatch before React," yet **no in-scope consumer of the appearance API is server-rendered**, so nothing exercises it:

- `apps/console` (the Phase D dogfood) is **CSR** — `apps/console/src/main.tsx` uses `createRoot` (Vite SPA), so there is no hydration and a mismatch is structurally invisible.
- `apps/docs` runs Next.js, but it **self-themes with its own bootstrap** (`apps/docs/app/_components/ThemeBootstrap.tsx` → `DOCS_THEME_BOOTSTRAP_SCRIPT`, attribute `data-nexus-theme-bootstrap`) and does **not** consume `@nexus/react/appearance` (verified: no `NexusAppearance*` / `nexus-appearance` refs in `apps/docs`). So it is _not_ the host the appearance bootstrap "should have been wired" into — it's a separate theming workstream.
- **jsdom can't see it either.** The `unit` vitest project is jsdom (no paint timing); Storybook/Playwright play-functions run **after** mount. There is no in-repo first-paint-timing harness (no raw `@playwright/test`, no `renderToString`/`hydrateRoot`). So "bootstrap applies before React" is asserted by a test that cannot observe "before React."
- **The shippable artifact is wrong for SSR.** `NexusAppearanceScript` as a React-tree component gives no first-paint guarantee on Next: React 19 dedupes `<script src>` but **not** inline `dangerouslySetInnerHTML` scripts, and a client-rendered inline script doesn't run parser-blocking. The usable SSR artifact is `createNexusAppearanceBootstrapScript()` injected into the **root-layout `<head>`** — the classic-inline-script-in-head pattern the repo already blesses (docs' own `ThemeBootstrap.tsx` is the live proof). The plan ships both and never says which an SSR host uses.

**Fix:** build the provider **SSR-safe by construction** (init-to-default + read-storage-in-a-mount-effect + a `mounted` guard for consumers — paralleling how the epic deferred console dogfood to D) and **restore the epic-L104 Docs deliverable**: `<head>` injection of the string factory + `suppressHydrationWarning` on `<html>` + the manual no-flash check. The point isn't that an existing SSR host was dropped — it's that the guarantee is **unbuilt and unverifiable** until an SSR consumer exists, so it must be made correct by construction and documented, not asserted by a jsdom test.

### C-B2. First-visit default has no specified source, and the static baseline ≠ the runtime default (C4, recalibrated)

On first visit (empty storage) the appearance default derives a **blue** primary (`brandColor #339cff` → `oklch(0.46 0.16 251)`), but the shipped `nexus.css` `:root` light primary is `var(--nx-color-black-base)` — **achromatic** (`nexus.css:106`; the `--brand=black` build default). Empirically confirmed in the compiled `apps/docs` CSS: light `:root` primary = black-base, `.dark` = white-base. So first paint flips **near-black → blue** unless the script materializes the default theme CSS before paint — and it **cannot** lean on `nexus.css`, which is achromatic.

Recalibration (the council corrected my framing): the embedded default CSS is **12,228 bytes raw but ~1,666 bytes gzipped**, and **returning users self-carry `themeCss` in their own snapshot**, so "too big for a small script" is **not** the real issue. The real issue is two-fold and unspecified:

1. The plan asserts "default snapshot applied before React" but never says **where the first-visit default `themeCss` comes from** — a script-embedded constant, a server-rendered `<style data-nexus-appearance-theme>`, or an aligned baseline.
2. The static baseline (`--brand=black`) and the runtime default (`#339cff`) **must be generated from one canonical state** and currently diverge. Reject "embed ~full default CSS into every page" — pay a build-time fix, not a perpetual runtime cost. **Align `nexus.css :root` with `themeToCss(deriveTheme(createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE)))`** as a small precursor (only `brandColor` diverges — `surfaceTone` already agrees at `stone`; `--brand=black` looks like a stale `build:tailwind` placeholder predating the blue-locked decision). Then first-visit needs **zero** per-user CSS and "small script" holds. The blue-vs-achromatic brand identity call is the owner's, but "one canonical source" is not optional.

---

## 2. Should-fix

**Extract the pure resolver — the keystone the epic mandates and the plan omits (NEW, architect).** Epic L110 requires a unit-tested pure resolver; the plan never names it. Make one engine-free `resolveFirstPaint(snapshot, systemPrefersDark) → { className, dataAttrs, colorScheme, themeCss, prefsCss }` (CSS read **from the stored snapshot**, no engine). Build the bootstrap **script** as a thin DOM-applier over it, and the **provider's mount-init** on the same function. Then: script and provider agree **by construction** (kills the dual-`defaultState` drift), stored CSS == applied CSS (kills the hydration-time repaint), and snapshot parse/sanitize/version-gate live in one place. This single refactor collapses three separate findings.

**`version` must gate the CSS cache, never the state (C3).** The snapshot's `themeCss`/`prefsCss` are a **derived cache** for the next load's engine-free script; `state` is the source of truth and the provider already re-derives via `useMemo` (it never reads stored CSS). So on version mismatch: **recover + `sanitizeNexusAppearance(state)`** (one correcting paint), discard only the cached CSS — **never** reset state. The plan's "wrong version → fall back to the default snapshot" **permanently loses the user's theme** on any engine bump. (`sanitizeNexusAppearance` already does field-by-field recovery, so `version` is semantically an _engine/CSS-cache_ token, not a state-schema token.)

**Drop the dual-read backcompat shim (C5).** "Read both snapshot and raw Phase B state" is a migration shim. #536 is **unmerged** → the raw format has **zero** persisted users; pre-prod (`project-stage.md`) + epic L134 make reset-to-default explicitly acceptable. Snapshot is the only format; `sanitizeNexusAppearance` resets anything else.

**Don't re-derive CSS the provider already holds (NEW, architect).** The provider memoizes `themeCss`/`prefsCss` for its live `<style>` tags; a separate `createNexusAppearanceSnapshot(state)` that calls `themeToCss(deriveTheme(...))` **again** does two derivations per change that must stay byte-identical. Pass the memoized CSS in: `createNexusAppearanceSnapshot(state, themeCss, prefsCss)`.

**Pin the `<style>` reuse contract (C12).** The bootstrap's `<style>` tags **must** carry the exact attributes the provider's `upsertStyle` queries — `data-nexus-appearance-theme` / `data-nexus-appearance-prefs` (`provider.tsx`) — or the provider **stacks a second tag** on mount → two conflicting style tags, source-order paint = flash. Specify and test this.

**Test plan — the headline tests are missing or unrunnable (tester).** Map each epic acceptance (L110-112) to a real vehicle: (a) the **pure resolver** unit (above) — plain vitest, deterministic, no `eval` of a stringified script; (b) **byte-for-byte** equivalence — mount the provider over a seeded snapshot and assert `styleEl.textContent === snapshot.themeCss` (the provider's mount effect overwrites the bootstrap CSS with re-derived CSS off the **sanitized** state, so any drift = repaint), and run it on the **DEFAULT** fixture to pin C-B2; (c) **provider renders without `window`** — a `// @vitest-environment node` + `renderToString` test (epic L111); (d) **no-flash** — an explicit **manual** step (stored-dark → hard refresh → observe), since neither jsdom nor play-functions can see first paint; (e) the **style-tag reuse** test (pre-create the bootstrap's tag, mount, assert exactly one + content stable); (f) **version-mismatch recovery** (valid non-default state at `version:999` → mounts to that state, not default); (g) reuse the existing `matchMedia` override pattern (the shared mock hardcodes `matches:false`). Don't author the "reads raw Phase B state" test — it's deleted with the C5 shim.

**Add the mandated Modern Web Guidance section (process).** The plan has none, despite being a pure browser-platform feature. Its decisions are correct — but document the parser-blocking rationale and cite the gate (`dark-mode`, `flicker-free-client-side-ab-testing`).

---

## 3. Minor

- **"Reject unsafe CSS" is theater (C10).** Same-origin `localStorage` is writable only by your own code or an XSS that already won. Drop the arbitrary-CSS validation; rely on `state` sanitization + `textContent` (already planned). If kept, specify a concrete structural allowlist and test _that_.
- **CSP `nonce` threading unspecified** — does `createNexusAppearanceBootstrapScript({ nonce })` accept it; which tag receives it?
- **Storage quota** — the snapshot is 2-5× the Phase B state (it carries `themeCss`+`prefsCss`); note quota/privacy-mode failure (pre-prod-acceptable if documented).
- **API inconsistency** — `sanitizeNexusAppearanceSnapshot(raw, fallbackState?)` adds a fallback param `sanitizeNexusAppearance(raw)` lacks (the resolver removes the need); branch `codex/…` vs the `{username}/…` convention.
- **sde2 lens gap** — the stalled agent would have owned the generator's full escaping set (beyond `</script>`: `<!--`, `<![CDATA[`, U+2028/U+2029); worth a pass before implementation.

---

## 4. What the plan got RIGHT (primary-source-verified — not faint praise)

- **Parser-blocking, non-module inline `<head>` script, no `blocking="render"`** — exactly correct. MWG `dark-mode` L134 prescribes "an inline script (NOT `type=module`, NOT `defer`)"; `blocking="render"` is unsupported across the **entire** Safari 15.4 floor (Safari shipped it in 18.2) and all Firefox, so the A/B-guide's module+`blocking` pattern would flash on most of the floor. The repo already blesses this exact pattern — `apps/docs/app/_components/ThemeBootstrap.tsx` is a live classic-inline-`dangerouslySetInnerHTML`-script (docs' _own_ bootstrap, not the appearance one, but proof the pattern is the repo's chosen approach).
- **`color-scheme` `<meta>` sync** (system → `light dark`, pinned → `light`/`dark`) — MWG-**mandatory** and the no-JS FOUC floor. Correct.
- **Pre-deriving CSS into the snapshot so the inline script ships no engine** — the right data/applier split; cleanly satisfies "don't inline OKLCH/APCA."
- **`textContent` not `innerHTML`; `</script>` and `light-dark(` absence tests** — sound security and Safari-floor instincts.
- **Controlled mode stays persistence-free; one storage key** — consistent with Phase B, no key sprawl.

---

## 5. Net recommendation

The mechanism choices are right and well-judged — the review's job here was mostly to **verify** them (and to retract two of my own findings that didn't hold). The plan is not yet executable because it (C-B1) drops the SSR host-setup Docs deliverable and therefore ships its headline no-flash guarantee unverified, and (C-B2) leaves the first-visit default CSS source unspecified atop a static-vs-runtime brand-default divergence. Both are closed cleanly by: extract the **pure resolver** (keystone), **align the shipped brand default** with the appearance default (small precursor), restore the **host-setup docs + a manual/SSR no-flash check**, and make `version` gate the CSS cache (recover state, never reset). Do those and Phase C is sound.
