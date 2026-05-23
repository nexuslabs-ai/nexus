# Configurable like Material, or disciplined like Linear?

> Focused side analysis to inform the Phase 2 research direction.
> Audience: Nexus design system stakeholders.
> Reviewed: May 2026.

## TL;DR

Nexus is **configurable by accident, not by design**: the engineering machinery (~78,000 theoretically valid combinations of base × brand × size × typography × shadow × radius × border-width) was built before any consumer asked for it. The aspirational benchmark set (Linear, Geist, Stripe, Raycast) is uniformly **disciplined**; the technical reference set (Material, Spectrum, IBM Carbon) is uniformly **configurable**. Nexus has been quietly building the _configurable_ engine while pointing at the _disciplined_ heroes. The two are not the same product. Pre-production is the moment to pick.

**My recommendation:** Hybrid leaning disciplined. Keep the configurable _engine_ (it's already built and cheap to maintain). Ship one canonical opinion per axis (one base palette default, one brand default, one size mode default, one density default). Document the engine as "you can if you must" — not as "here is the menu."

---

## Where Nexus actually is — an honest audit

```
Token surface area (counted from disk):
  Base palettes      : 5  (slate, neutral, zinc, gray, stone)  × 2 themes
  Brand palettes     : 5  (blue, gray, neutral, slate, stone)  × 2 themes
  Size modes         : 5  (vega, lyra, maia, mira, nova)
  Typography modes   : 5  (vega, lyra, maia, mira, nova)
  Shadow modes       : 5  × 2 themes
  Radius modes       : 5  (blunt, sharp, subtle, smooth, mellow)
  Border-width modes : 5  (vega, lyra, maia, mira, nova)
  Focus              : 1  (one design)            ← already disciplined

Theoretical combinations: 5 × 5 × 5 × 5 × 5 × 5 × 5  =  78,125
```

Compare against active demand:

- Live consumer count: **0** (pre-production)
- Theme variants exercised in stories/docs: 1 (default)
- Components shipped: **13**

The ratio of _theme combinations shipped_ to _theme combinations consumed_ is ~78,000 : 1. The configurability surface is sized for an enterprise tenant model — Adobe Creative Cloud, Atlassian apps, IBM products — and Nexus has none of those.

This isn't a criticism. It's an observation that informs the strategic question: **was building this surface the goal, or a side effect of the team's engineering tastes?**

## What the aspirational systems independently chose

| System             | Brand palettes            | Density modes               | Size modes | Radius modes | Typography families | Choice                                     |
| ------------------ | ------------------------- | --------------------------- | ---------- | ------------ | ------------------- | ------------------------------------------ |
| **Linear**         | 1 (violet)                | 1                           | 1          | 1            | 1                   | Disciplined                                |
| **Vercel / Geist** | 1 (Vercel) + 8 chromatic  | 1                           | 1          | 1            | 1 (Geist)           | Disciplined                                |
| **Stripe**         | 1 (Stripe blue)           | 1–2 (Dashboard vs Checkout) | 1          | 1            | 1 (Sohne)           | Disciplined                                |
| **Raycast**        | 1                         | 1                           | 1          | 1            | 1 (system)          | Disciplined                                |
| **Notion**         | 1 + 10 highlights         | 1                           | 1          | 1            | 1 (Inter)           | Disciplined                                |
| **Figma**          | 1 (Figma blue)            | 1                           | 1          | 1            | 1                   | Disciplined                                |
| **shadcn/ui**      | configurable              | configurable                | 1          | 1 (--radius) | 1                   | Hybrid (config at install)                 |
| **Material 3**     | unlimited (HCT from seed) | 3 (compact/medium/expanded) | 3          | configurable | configurable        | Configurable                               |
| **Adobe Spectrum** | 1 (Adobe) + alias         | 3 (compact/regular/large)   | 3          | configurable | configurable        | Configurable                               |
| **IBM Carbon**     | 1 (IBM)                   | 4                           | 4          | 1            | configurable        | Configurable                               |
| **Nexus (today)**  | **5 base × 5 brand**      | 0 (not modeled)             | **5**      | **5**        | **5**               | Engine: configurable. Defaults: undefined. |

Pattern: the systems Nexus _aspires to_ are uniformly disciplined. The systems Nexus _resembles in architecture_ are uniformly enterprise. None of the aspirational systems serves a multi-tenant scenario, and none of them needs to.

## Why this matters now and not later

Pre-production is the **only** time when configurability and discipline have symmetric costs. Once Nexus ships to its first consumer:

- **Removing configurability is breaking.** Dropping a base palette means a consumer's compiled CSS no longer matches. Dropping a size mode means typography rolls back. Every consumer becomes a tax on discipline decisions.
- **Adding configurability is additive.** New base palette? Just a new file. New brand? Same. Discipline never blocks future configurability — only the reverse is true.

So the asymmetric move is: **start disciplined, add configurability when a real consumer asks for it.** The current state (configurable by default with no defaults defined) is the worst of both worlds — you carry the configurability tax without the brand discipline gains.

## Three scenarios for Nexus

### Scenario A — Commit to configurable

**Posture:** Nexus is a design system _engine_. Consumers bring their brand; we provide the machinery.

What changes:

- Ship a theme builder UI (like Material's Theme Builder).
- Add 3–5 more base palettes, 3–5 more brand palettes, more density modes (compact / regular / large).
- Build a Figma plugin that round-trips brand selection.
- Documentation focused on "how to make Nexus yours."
- Component opinions kept light (more variants, fewer defaults).

**Who this is for:** A B2B / enterprise tenant model — multiple internal teams or customers building distinct products on shared infrastructure. Or an OEM model.

**Risk:** Without a consumer demanding this, you're building a product for an imagined market. The team eventually burns out maintaining 78,000 combinations that no one exercises.

**Cost to maintain:** High (every component change must work across all mode combinations).

### Scenario B — Commit to disciplined

**Posture:** Nexus has _one_ opinion. It's good. Use it.

What changes:

- Pick one canonical base palette (slate? neutral? — needs a call).
- Pick one canonical brand palette.
- Pick one canonical size, typography, shadow, radius, border-width mode.
- Delete or `@deprecated` the alternates. (Or keep them as "v0 experimental, not part of the public API.")
- Component opinions get sharper (fewer variants, stronger defaults).
- Documentation focused on "Nexus is opinionated — here's why each opinion is good."

**Who this is for:** A single product (or product family) that wants a coherent visual identity — Linear / Geist / Stripe trajectory.

**Risk:** If a second consumer arrives with different needs, you've built yourself into a corner. Less true than it sounds, because configurability can always be added when there's a real demand.

**Cost to maintain:** Low (one combination ships, one is tested, one is documented).

### Scenario C — Hybrid (configurable engine, disciplined defaults)

**Posture:** Nexus has _one_ opinion (the default). The engine supports more. If you need more, you can — but the canonical Nexus experience is the default.

What changes:

- Pick one canonical opinion per axis (the _default_). Document it as _the_ Nexus look.
- The 5×5×5×… engine stays — but the alternates are framed as "advanced override," not "the menu."
- Stories, docs, marketing, and Figma libraries ship the canonical default.
- Component opinions are tuned for the default; alternates inherit but are not separately polished.
- Add a Phase 3+ commitment: if a real consumer needs a 6th base palette, we add it. Until then, no marketing surface for alternates.

**Who this is for:** Pre-production Nexus that wants brand coherence today and optionality for tomorrow, without paying the configurable-system maintenance cost.

**Risk:** "Have your cake and eat it too" is a real trap. Discipline must be enforced in the _defaults_ not the _engine_ — otherwise drift creeps in via story files, Figma files, and component variants. Needs a documented contract.

**Cost to maintain:** Medium (one default polished; alternates work but don't get the polish budget).

## My recommendation: Scenario C, leaning disciplined

The reasoning, in order of importance:

1. **The engine is already built. Throwing it away is a sunk-cost mistake. Disciplining around it is cheap.** The cost of Scenario C over Scenario B is one extra file existing per axis. The cost of Scenario A over Scenario C is a marketing-and-tooling surface (theme builder, plugin, multi-brand stories) that has no consumer asking for it.

2. **Every aspirational system is disciplined. None ships a theme builder. None markets configurability.** If Nexus's goal is to feel like Linear or Geist, the configurability surface must recede into the background, not be the front door.

3. **The differentiation Nexus has already built (OKLCH + perceptual-grid + APCA) is disciplined engineering — not configuration.** It's an opinion: "we picked OKLCH because it's perceptually uniform, we pinned lightness because it makes shades consistent, we gate APCA because we believe in accessibility." That's a disciplined story. Selling it alongside "use any of 5 base palettes" undermines the conviction.

4. **The Tier-A research found three independent pieces of evidence that surface hierarchy, shade use-case mapping, and color credibility documentation matter more than additional configurability.** None of those moves require keeping the configurable surface visible.

5. **Pre-production is the only window.** A year from now, every alternate base palette is a consumer dependency.

### What that means concretely

Action: pick the canonical opinion per axis. Today. Document it.

| Axis              | Canonical choice (to discuss)          | Why                                                                                                           |
| ----------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Base palette      | **neutral**                            | Pure-grey, brand-decoupled. Aligns with the focus-color decision in PR #44 (neutral mid-grey).                |
| Brand palette     | **blue**                               | Most universal accent; matches industry default (Vercel/Geist, Stripe, Figma all blue or near-blue).          |
| Size mode         | **vega**                               | Already the bundled default — make it explicit.                                                               |
| Typography mode   | **vega**                               | Same.                                                                                                         |
| Shadow mode       | **vega**                               | Same.                                                                                                         |
| Radius mode       | **subtle**                             | Mid of the curve; least opinionated.                                                                          |
| Border-width mode | **vega**                               | Same.                                                                                                         |
| Density           | **define this** (it doesn't exist yet) | Linear has compact rows; Nexus has no density token. Add `--nx-density: regular` and ship one mode initially. |

The alternates stay in the engine. They are not on the website. They are not in the Storybook landing page. They are documented under "advanced — overrides" with a one-paragraph caveat: _"Nexus ships one canonical look. These overrides exist for consumers with explicit brand requirements that conflict with the defaults. Default behavior is the supported experience."_

## How to confirm — 5 questions

If you can answer yes to 3+ of these, Scenario C is the right call. If you can't, the configurability machinery is a hint about an unspoken goal that needs to surface.

1. **Is there any specific external consumer who has asked for a non-default mode?**
   If yes → that consumer's needs should drive Scenario A. If no → Scenario C.

2. **If a new consumer arrives tomorrow with a brand that doesn't match neutral + blue, what does "yes" look like?** Is it adding a single new brand file (Scenario C) or building a configuration UI (Scenario A)?
   If single file → C. If UI → A.

3. **Is the long-term Nexus story "infrastructure for many products" or "one cohesive product look that scales"?**
   Infrastructure → A. Cohesive look → B or C.

4. **Does the team have the bandwidth to maintain a theme-builder + plugin + multi-tenant docs surface in addition to component work?**
   Yes → A is viable. No → B or C.

5. **Is the engineering work on OKLCH / perceptual-grid / APCA a marketing surface for Nexus, or an internal implementation detail?**
   Marketing surface → discipline (because discipline is the credibility play). Implementation detail → no signal.

## What changes in Phase 2 of the research depending on this call

**If Scenario A (configurable):**
Phase 2 research should ask "what's missing from Nexus's configurability surface vs Material/Spectrum/Carbon?" Theme builder UI, OEM patterns, multi-tenant doc strategies. Recommendations skew toward additive (more modes, more brand support, more theming primitives).

**If Scenario B (disciplined):**
Phase 2 research should ask "what does Nexus's _single canonical look_ look like at the spacing / radius / typography / shadow level?" Pick one set of opinions per axis, justified against the aspirational benchmark. Recommendations skew toward subtractive (trim alternates, sharpen defaults).

**If Scenario C (hybrid):**
Phase 2 research should ask "for each token sub-category, what is Nexus's canonical default, and what does the override surface look like?" Two columns per section in the HTML: default vs override. Recommendations cover both layers but rank default-related ones higher.

## The next decision

Pick a scenario before Phase 2 launches. The findings will compound or contradict each other depending on the choice. Running Phase 2 without picking is the most expensive option: the agent will spend hours producing tradeoffs that the strategic call would resolve in advance.

A 60-minute synchronous review with whoever owns Nexus's product direction would be cheaper than another autonomous Phase 2 run. Bring this memo, the existing HTML's Tokens > Color section, and answer the 5 confirmation questions above.

---

## Appendix — Evidence pulled from the codebase

```
packages/core/tokens/
├── primitives/
│   ├── color.json                (single file, 10+ palettes × 11 shades)
│   ├── borderwidth/ (5 modes)
│   ├── focus/ (1 mode × 2 themes — already disciplined!)
│   ├── radius/ (5 modes)
│   ├── shadow/ (5 modes × 2 themes)
│   ├── size/ (5 modes)
│   └── typography/ (5 modes)
└── semantic/
    ├── base-{slate,neutral,zinc,gray,stone}-{light,dark}.json   (10 files)
    ├── brands-{blue,gray,neutral,slate,stone}-{light,dark}.json (10 files)
    └── spacing.json
```

Engineering work invested per axis ≈ 5 days of token research and tuning per mode × 6 axes ≈ ~30 person-days of configurability infrastructure already built. That work is _paid_ — there's no recovery argument for tearing it out. The question is whether to _market_ it or _hide_ it.

Hide it. Then come back when a consumer asks.
