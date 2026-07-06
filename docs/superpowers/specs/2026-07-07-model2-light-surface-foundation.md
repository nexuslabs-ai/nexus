# Model 2 Light Surface Hierarchy — Foundation (engine + 5-tone reconciliation)

> **Status:** in progress. Stone static-token slice landed in `104909ee8`. This
> doc specs the remaining Foundation work. Adoption (components) is a **separate
> later PR** — do not start it here.

## Why this exists

Light mode ships "flat paper everywhere": `background`, `container`, and
`popover` all resolve to the same near-white value, so cards/panels/menus don't
separate from the page. The chosen fix is **Model 2 — white cards on tinted
paper** (Notion/Linear): the page `background` is a tinted canvas, cards/popovers
lift toward white, and recessed surfaces (muted / control / nav) step down.

There are **two independent renderers that must tell the same story:**

- **Static tokens** → `packages/core/tokens/semantic/base-*-light.json` →
  `generate-tailwind-package.js` → the shipped default `nexus.css`.
- **Runtime engine** → `deriveSurfaces()` / `deriveTheme()` in
  `packages/core/src/lib/derive-theme.ts` → the appearance-theming runtime path.

They are **not** coupled by any existing test on the light side: `tone-parity`
compares the engine to `light-tone.fixture.json` (a snapshot of the engine
itself), and `derive-theme.parity` compares **keys only**. The proof they can
drift: static `muted` ships at L 0.986 while the engine computes 0.931 today, and
every gate is green. **Closing that gap is the point of this Foundation.**

## The validated target ladder (stone light, canonical contrast 60 → `delta = 0.056`)

Do not invent new numbers. These L values were validated against
`audit:contrast` (828/828) and `audit:colorblind` (0 findings) in the stone
static slice:

| Token(s)                                                                      | Target L | Static primitive  |
| ----------------------------------------------------------------------------- | -------- | ----------------- |
| `container`, `popover`                                                        | 1.000    | `white.base`      |
| `container-hover`, `popover-hover`                                            | 0.985    | `stone.50`        |
| `background` (page anchor)                                                    | 0.970    | `stone.75` (new)  |
| `muted`, `background-hover`, `container-active`, `popover-active`, `disabled` | 0.946    | `stone.100`       |
| `background-active`, `control-background`, `nav-background`                   | 0.923    | `stone.150` (new) |
| `control-background-hover`, `nav-item-hover`, `nav-item-active`, `nav-border` | 0.871    | `stone.200`       |
| `border-active`                                                               | 0.662    | `stone.400`       |

Three collapsed elevation anchors now separate: **card 1.000 → page 0.970 (ΔL
0.030) → recessed 0.946 → inset 0.923**. Card and popover are intentionally
_equal_ (both white) — their separation comes from shadow / blur / `popover-alpha`,
not fill lightness.

## Scope guards

- ❌ **Dark mode is unchanged.** Do not touch `DARK_SURFACE_STEPS`,
  `DARK_NAV_SURFACES`, or dark tolerances. Dark already elevates correctly.
- ❌ **No shim / tone gate in the engine.** Per `project-stage.md` ("no feature
  flags or shims"), do **not** write `if (tone === 'stone') …`. The engine change
  is global to all tones by design; the static side must move in the same PR.
- ❌ **No component edits.** Fields / table / menubar / overlay hover / stories
  are the Adoption PR.

## Why "stone only" is a checkpoint, not a merge boundary

`deriveSurfaces()` has no per-tone branch. The moment the light model changes,
**all 5 tones' runtime output flips to Model 2** while only stone's static tokens
are migrated — leaving neutral/slate/zinc/gray in exactly the static↔runtime
divergence this work exists to remove. So the engine rework and the 4 remaining
static-base mirrors are **one coupled unit**. Build/verify stone first; merge only
when all 5 tones reconcile.

---

## Step A — Engine rework (`packages/core/src/lib/derive-theme.ts`)

Today light anchors at `PAPER_L = 0.987` and steps everything **down**
(`dir = -1`), with `FLAT_IN_LIGHT` pinning container/popover to the anchor. Model
2 makes `background` a **mid-anchor** and fans surfaces both ways.

1. Add `const PAGE_L_LIGHT = 0.970;` (tinted page anchor). **Delete `PAPER_L`** —
   its only use is the old anchor (line 201), which step 4 replaces.
2. **Delete `FLAT_IN_LIGHT`** and the `dir` variable.
3. Add the signed light step map (verified — each entry lands on its target L at
   `delta 0.056`; the engine applies `anchor + step*delta` so they scale with the
   contrast slider):

```js
const LIGHT_M2_STEPS = {
  background: 0,
  container: 0.54, // clamps to white at contrast 60 — tune to hit 1.0
  popover: 0.54,
  'container-hover': 0.27,
  'popover-hover': 0.27,
  muted: -0.43,
  'background-hover': -0.43,
  'container-active': -0.43,
  'popover-active': -0.43,
  disabled: -0.43,
  'background-active': -0.84,
  'control-background': -0.84,
  'nav-background': -0.84,
  'control-background-hover': -1.77,
  'nav-item-hover': -1.77,
  'nav-item-active': -1.77,
  'nav-border': -1.77,
  'border-active': -5.5, // matches static stone.400 (0.66) at contrast 60
};
```

4. Unify the L formula — dark steps are positive, light M2 steps are signed, so
   both collapse to one expression (no `dir`):

```js
const anchorL = dark ? (bg.l ?? 0) : PAGE_L_LIGHT; // ALL light tones share the tinted page anchor
const step = dark
  ? (DARK_SURFACE_STEPS[token] ?? rawStep)
  : (LIGHT_M2_STEPS[token] ?? -rawStep); // signed; receding fallback = old behavior
const l = clamp01(anchorL + step * delta);
```

> **Do NOT branch the light anchor on `tone.lightC`.** Neutral (`lightC = 0`) must
> sit on the _same_ tinted page (L 0.970) — only its **chroma** is 0 (via the
> unchanged `baseC = tone.lightC`). The old `tone.lightC > 0 ? … : bg.l` branch
> would keep neutral's runtime page at white while static neutral moves to
> `{neutral.75}` → static-parity fails for neutral. This was the one blocking bug
> in the first draft.

5. **Force chroma to 0 at the white clamp.** When `l` clamps to `1.0` (container /
   popover), set `c = 0` so the engine matches static pure `white.base` exactly —
   otherwise it emits `oklch(1 0.008 70)` and fails reconciliation. Leave the
   existing `LIGHT_CHROMA_DEPTH_MULTIPLIER` chroma for non-clamped surfaces.

**Verify-first checkpoint:** with only stone static migrated, confirm the engine's
stone-light output hits the target ladder before mirroring the other bases.

---

## Step B — Static-parity test (the load-bearing gate)

`tone-parity` regenerated from the engine passes _by construction_ and proves
nothing about static↔engine agreement. Add the real gate.

Create `packages/core/src/lib/derive-theme.static-parity.test.ts`. **Iterate all
5 tones** (stone/neutral/slate/zinc/gray), light only, at contrast 60. Reuse the
canonical seeds `tone-parity.test.ts` already uses to call the engine. For each
surface token:

1. **Direction invariant (non-negotiable):**
   `sign(engineL[token] − engineL.background) === sign(staticL[token] − staticL.background)`.
   Cards lighter than the page in both paths; recessed surfaces darker in both.
2. **Magnitude:** `|engineL[token] − staticL[token]| ≤ 0.006`.

This is **green for stone, red for the other four until Step D migrates them** —
the red list _is_ the migration checklist.

**Resolver caution — do NOT reuse `tone-parity`'s `primitiveOklch`.** It snaps to a
pinned-L grid (`derive-theme.ts` line ~171, `(hueCurves[palette] ?? lGrid)[shade]`)
that only holds the 11 standard shades, so `{tone.75}` / `{tone.150}` resolve to an
`undefined` L. The static-parity resolver must read the `75` / `150` **hex directly
from `color.json`** and convert to OKLCH mechanically (culori). And keep `75` / `150`
**out** of the pinned grid, the `Shade` type, and the colorblind `SHADES` list —
registering them there is a larger, unwanted ripple (and would trip the adjacent-
shade ΔE collapse check).

If `border-active`'s large contrast-sensitivity causes noise, scope the assertion to
the surface-fill tokens and handle borders separately — but prefer including it (it
fixes a latent divergence).

---

## Step C — Fixture generator + regenerate

`light-tone.fixture.json` is hand-maintained (no generator today). Create
`packages/core/scripts/generate-light-fixture.mjs` that calls the engine with the
canonical seeds for all 5 tones and writes the fixture. Run it to refresh from the
reworked engine (keeps `tone-parity` green). This depends only on the engine, not
on the static mirror — it can run right after Step A. **Note in the PR:** the
light fixture is a change-detector; **Step B is the correctness gate.**

**Fix the stale metadata.** The fixture header currently carries `"paperL": 0.987`
(line 4) — that value no longer drives light surfaces. The generator must write the
new anchor as `"pageL": 0.970` (rename, don't leave both), so future readers don't
think `PAPER_L` still governs the light page.

---

## Step D — Mirror the ladder to neutral / slate / zinc / gray

For each of the 4 remaining tones:

1. **Add 2 hue-matched primitives** to `packages/core/tokens/primitives/color.json`
   — a `75` (target L ≈ 0.970) and a `150` (target L ≈ 0.923), computed the same
   way stone's were (interpolate within that ramp, preserving its hue/chroma
   trend). Neutral is pure grey (chroma 0): `75 ≈ L 0.970`, `150 ≈ L 0.923`.
2. **Apply the same 8 semantic remaps** to `base-${tone}-light.json` (see the
   stone diff in `104909ee8`): `background → {tone.75}`; `muted`,
   `background-hover`, `popover-active`, `disabled → {tone.100}`;
   `background-active`, `control-background`, `nav-background → {tone.150}`.
3. **Do not touch `base-${tone}-dark.json`.**

Static-parity (Step B) goes fully green when all 4 are done.

> Adding new primitive shades ripples: watch for any `Shade`-type or "11 shades"
> enumeration test tripping on `75`/`150`, and **verify `build:tokens:modular` /
> `build:tailwind` emit the new shades from their raw hex** — if the build snaps
> semantic refs to the pinned perceptual grid (which lacks `75`/`150`), it would
> drop or NaN them. The stone spike proved the _audits_ resolve raw hex; the build
> is verified in the gates. No alpha rebase is needed (existing shades unchanged).
> See `changing-palette-primitive-ripple` guidance.

---

## Step E — Update `derive-theme.test.ts` (author, don't just run)

There is **no** light container-vs-background assertion today (only a dark one).
Add one asserting the new direction with a magnitude floor:

```js
it('elevates container lighter than the tinted page in light mode', () => {
  const s = deriveSurfaces('#ffffff', 'stone', 'light', 0.056);
  const d = lOf(s['--nx-color-container']) - lOf(s['--nx-color-background']);
  expect(d).toBeGreaterThan(0.015); // meaningful lift, not just !==
});
```

Keep the existing dark assertions untouched.

---

## Foundation gates (all green before PR)

```bash
pnpm test:unit                                   # ROOT (vitest --project=unit) — packages/core has NO test:unit
pnpm --filter @nexus_ds/core audit:contrast       # expect 828/828
pnpm --filter @nexus_ds/core audit:colorblind     # expect 0 findings
pnpm --filter @nexus_ds/core build:tokens:modular
pnpm --filter @nexus_ds/core build:tailwind        # token gen builds clean with the new primitives
pnpm format:check
```

`test:unit` covers: the new `derive-theme.static-parity` (all 5 tones green),
`derive-theme.test` (new light assertion), `tone-parity` (regenerated fixture),
and `derive-theme.parity` (keys).

## Known tuning points (the gate will surface these)

- **White-clamp chroma:** decided — force `c = 0` when `l` clamps to 1.0 (Step A.5).
- **Container clamp vs contrast:** `+0.54` clamps to white at contrast 60; below
  ~48 it lands slightly off-white. That is correct runtime behavior; the gate runs
  at the canonical 60.
- **`border-active` at −5.5** swings L 0.53–0.86 across the contrast range (fixed
  0.66 in static). Matches at canonical contrast; confirm that sensitivity is
  desirable for a border or give it a dedicated treatment.

## Definition of done

- Engine light output hits the validated ladder within tolerance for **all 5
  tones**.
- `derive-theme.static-parity` (direction invariant + magnitude, 5 tones) is green.
- Fixture regenerated via the committed script.
- `derive-theme.test` asserts the new light direction.
- All Foundation gates green; **dark untouched; no component edits.**

## Follow-ups (tracked, out of scope here)

- **#624** — darken the categorical light palette (series 1 clears the APCA UI
  floor on white by only +1.5 Lc; surfaced when the page tint pushed chart-on-
  `background` below floor, resolved by validating charts on `container` only).
