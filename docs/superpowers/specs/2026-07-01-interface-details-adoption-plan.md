# Interface Details — Full Adoption Plan

**Date:** 2026-07-01
**Status:** Design — pending user review
**Source:** `make-interfaces-feel-better` skill (Jakub Krehel / interfaces.dev) — 16 principles.
**Method:** three parallel read-only audits (Typography, Surfaces, Motion/Performance)
across all 58 components + base CSS. Findings verified to `file:line`.

## Goal

Absorb the whole "details that make interfaces feel better" checklist into Nexus —
through Nexus conventions, semantic tokens, the browser floor (Safari 15.4+), and
`polish.md` — deciding for _each_ of the 16 principles whether to adopt, decline,
or route to the motion backlog. Not a blind sweep: the audit shows most of the
list is already handled, deliberately declined, or already owned by #159/#181.

## Master matrix

| #   | Principle                | Status          | Verdict                                                                                                           |
| --- | ------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------- |
| 8   | Font smoothing           | ✅ already done | correct placement (appearance model → `<html>`); add `-moz-` twin only                                            |
| 9   | Tabular numbers          | 🟢 small gaps   | chart axis + Progress %; table correctly opt-in                                                                   |
| 10  | text-wrap balance/pretty | 🟢 one fix      | `balance` → 4 heading utilities; `pretty` already systemic                                                        |
| 1   | Concentric radius        | 🟡 backlog      | 2px lever in rounded brands only; moot under `square` default                                                     |
| 2   | Optical alignment        | ✅ N/A          | no asymmetric glyphs; symmetric chevrons need no offset                                                           |
| 3   | Shadows over borders     | 🔴 / 🔬         | declined; resolved → KEEP border — already an accessible theme-adaptive hairline, shadow supplements not replaces |
| 11  | Image outlines           | 🟢 systemic gap | 0 adoption; fix via Root `::after`, pure black/white @10%                                                         |
| 16  | Hit area (~44px)         | 🟢 mixed        | 3 top-tier gaps + a gating inconsistency; many already correct                                                    |
| 4   | Interruptible anims      | ✅/🟡           | loading/height keyframes correct; overlay open/close → #159                                                       |
| 5   | Split & stagger enter    | 🟡 backlog      | all menus/command/toasts → #181                                                                                   |
| 6   | Subtle exit              | ✅              | sheet/drawer full-slide is the legit full-exit case                                                               |
| 7   | Contextual icon anim     | 🟡 backlog      | checkbox/radio/select/dropdown indicators → #181                                                                  |
| 12  | Scale on press           | 🟢 adopt        | Button, default-on (user decision)                                                                                |
| 13  | Skip anim on load        | 🟡 backlog      | mechanism N/A (no Framer); avatar mount fade → #181                                                               |
| 14  | Never `transition: all`  | 🟢 one fix      | `input-otp.tsx:123` (repo already asserts against it)                                                             |
| 15  | `will-change` discipline | ✅              | clean repo-wide                                                                                                   |

## Actionable roadmap (prioritized)

> **⚠️ Standalone correctness fix — do regardless of this checklist.** The
> hit-area **gating inconsistency** (viewport-gated `lg:after:hidden` vs
> `pointer-coarse:`, detailed in Workstream C) means interactive hit areas
> collapse to ~24px on large touchscreens — a real touch-a11y regression that
> stands on its own merit, independent of "feel better." Arguably the
> highest-value single fix the audit surfaced; ship it even if nothing else here
> is adopted.

### Workstream A — Typography base layer (tiny, systemic, near-zero risk) — DO FIRST

- **#10 balance:** add `text-wrap: balance;` to the four `@utility typography-heading-*`
  in `packages/tailwind/typography-utilities.css:3,11,19,27`. Fixes Card, Dialog,
  AlertDialog, Sheet, Drawer, EmptyState, Field titles in one edit. Degrades
  gracefully below Safari 17.5.
- **#8 -moz twin:** add `-moz-osx-font-smoothing: grayscale|auto` beside the
  `-webkit-` line at `packages/core/src/lib/appearance-model.ts:344`.
- **#9 tabular-nums:** `chart.tsx:75` axis ticks (extend the existing recharts
  selector with `tabular-nums`); Progress `%` readout; optional polish on
  date-picker day grid / input-otp / pagination / avatar `+N`. Do **not** bake into
  `TableCell` (correct opt-in).
- **#14 hygiene:** replace `input-otp.tsx:123` `nx:transition-all` with
  `nx:transition-[color,background-color,border-color]`.

### Workstream B — Image outlines (surface polish) — #11

- Add a hairline via a Root **`::after`** pseudo-element (NOT the `<img>` — see
  Rejected Approaches):
  - Avatar root (`avatar.tsx:8` variants): `nx:after:absolute nx:after:inset-0
nx:after:rounded-[inherit] nx:after:outline nx:after:outline-1
nx:after:-outline-offset-1 nx:after:outline-<color>`, scoped to the
    image-shown `data-state` (so it doesn't ring the fallback tile — or accept the
    medallion ring).
  - ItemMedia image wrapper (`item.tsx:134`, already `overflow-hidden rounded-sm`).
  - Documented utility/example for consumer `<img>` (AspectRatio, card media,
    carousel are consumer-composed — guidance, not a component fix).
- **OPEN DECISION — color:** pure black/white @10% is non-negotiable (a tinted
  token reads as dirt). Two ways:
  - **(rec) Pilot-style raw** `rgb(0 0 0 / 0.1)` / `rgb(255 255 255 / 0.1)`
    theme-split, scoped `eslint-disable` + reason. Small, reversible.
  - **Token** `image-outline` semantic token — correct long-term but ripples
    through `deriveTheme`, tone-parity oracle, tailwind regen, audits. Promote
    later if it proves out.

### Workstream C — Hit-area hardening (touch a11y) — #16

- **Top-tier (add `pointer-coarse:after` extension to ~44px):** Slider thumb
  (`slider.tsx:80`, **cap the inset ~`-inset-2` per the collision rule** — a full
  44px overlaps adjacent range thumbs), Breadcrumb ellipsis (`breadcrumb.tsx:191`),
  Alert close (`alert.tsx:332`).
- **Gating consistency (real inconsistency):** Dialog/Sheet close
  (`overlay-layout.ts:106`) and sidebar actions (`sidebar.tsx:700,934`) gate the
  hit-area `::after` by **viewport** (`lg:after:hidden`) — on a large touchscreen
  they collapse to ~24px. Switch to **`pointer-coarse:`** modality gating (as
  Button already does).
- **Opt-in coarse extension:** checkbox/radio/switch (`checkbox.tsx:57`,
  `radio-group.tsx:69`, `switch.tsx:23`) so a _bare_ control (no label row) clears
  ~44px.

### Workstream D — Button — #12 (+ optional #2)

- **Scale on press (default-on):** add `nx:active:scale-[0.96]` to `buttonVariants`
  base (exclude `link`), extend the transition to include `scale` (never
  `transition: all`), and add `nx:motion-reduce:active:scale-100` (no global motion
  reset exists). Layer on top of the existing `active:bg-*` cue. Document the
  duration/easing-token relationship for #159.
- **(optional, low-pri #2):** tighten Button icon-side padding by ~2px via a
  `data-[has-start-icon]`/`[has-end-icon]` hook — trades against the documented
  symmetric sizing contract, so likely defer.

## Backlog filings (route, don't hand-roll) — Workstream E

- **#4** overlay open/close animate-in/out → **#159** (decide interruptible transitions)
- **#5** stagger menus/command/toasts → **#181**
- **#7** icon cross-fade for checkbox/radio/select/dropdown indicators → **#181**
- **#13** avatar mount-fade first-render guard → **#181** (optional)
- **#1** concentric radius popover-family 2px lever (rounded brands) → **#181** (low-pri)

## Declined (with reason)

- **#3 Shadows over borders** — **declined; investigation resolved → KEEP the
  border.** Blanket border→shadow swaps and any swap on focusable controls are out
  (box-shadows are stripped under `forced-colors: active`; the "no shadow on
  focusable elements" rule covers Input / Switch / `outline`-Button / Badge). The
  non-focusable decorative surfaces (Card, Dialog, popover family, Sheet, Drawer)
  were investigated separately: `border-border-default` is already a theme-adaptive
  low-alpha hairline (~9.4% black light / ~18.8% white dark) that flips polarity and
  survives `forced-colors` — the premium shadow-hairline look, done more accessibly.
  A shadow-hairline can only **supplement** (stripped under `forced-colors` → breaks
  Sheet/Drawer free edges; couples the boundary to the `--shadow` build axis, weakest
  in the default `quiet`), never replace. Optional future-only: dark overlays lean on
  the border since the black drop-shadow washes out; the theme-split shadow tokens can
  carry a dark hairline layer if more lift is ever wanted.
- **#2 Optical alignment (mostly)** — N/A: the library uses only symmetric
  chevrons/arrows/dots; the skill's optical hazards (play triangles, carets) are
  absent by icon choice.

## polish.md gate

- **MWG findings:** searched button-press, `prefers-reduced-motion`, text-wrap;
  retrieved `improve-text-layout-and-legibility` (confirms balance→headings + the
  floor + graceful degradation). Reduced-motion via the `accessibility` guide;
  transform/opacity are GPU-composited (safe) per the `css` guide.
- **Browser-floor decision:** all adopt-now items are floor-safe — `transform`
  scale (universal), Root `::after` inset ring (universal, radius-following),
  `text-wrap: balance` (progressive-enhancement no-op below Safari 17.5),
  tabular-nums (universal).
- **Fallback / progressive enhancement:** headings degrade to normal wrap;
  reduced-motion suppresses the button scale; no feature used below floor without
  graceful degradation.
- **Rejected approaches:** Avatar `outline` on the element (rectangular < Safari
  16.4) and inset `box-shadow` on the replaced `<img>` (often non-painting) — hence
  Root `::after`; opt-in scale prop (API-for-taste, a polish.md DON'T); new
  `image-outline` token in-plan (audit/tone-parity ripple — deferred).
- **Validation evidence:** Storybook stories + play-fns per workstream — Button
  press incl. reduced-motion; Avatar/Item hairline light/dark + circle/rounded,
  verified across Chromium/Firefox/Safari-floor; hit-area coarse-pointer stories;
  `pnpm lint`, `pnpm test:storybook`, token audits green.

## Housekeeping

- The `make-interfaces-feel-better` install wrote to `.agents/skills/` + a Claude
  Code symlink **inside the repo**. Keep out of commits (gitignore or install
  globally); confirm `pnpm audit:agent-drift` isn't tripped.

## Suggested sequencing

A (typography base, 1 small PR) → C (hit-area, real a11y) → B (image outlines) →
D (Button scale) → E (file backlog issues). A/B/C/D are independent PRs.

## Next

On approval → `writing-plans` for the first workstream(s) → implement per PR.
