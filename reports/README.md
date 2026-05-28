# Reports

One-off explainers, design-decision records, and architecture briefs produced during spec/design work. **These are a historical trail, not living documentation.** The canonical specs live in [`.claude/rules/`](../.claude/rules/) and [`packages/core/docs/`](../packages/core/docs/); when a report disagrees with a rule, the rule wins.

## Status legend

- **Current** — still an authoritative reference.
- **Historical** — an accurate record of work that has since shipped (tied to a merged PR / closed issue). Kept for context.

## Index

| Report                                                                 | What it is                                                                               | Status                                                                       |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`configurability-vs-discipline.md`](configurability-vs-discipline.md) | "Configurable like Material or disciplined like Linear?" — the Scenario C recommendation | **Current** — cited as source-of-truth in live milestone descriptions        |
| [`pr-133-explainer.html`](pr-133-explainer.html)                       | Model 2 surface-contract explainer                                                       | Historical — PR #133 merged                                                  |
| [`pr-133-nav-tokens.html`](pr-133-nav-tokens.html)                     | `nav-*` token visuals (light/dark)                                                       | Historical — PR #133 merged                                                  |
| [`surface-options.html`](surface-options.html)                         | Surface-stack / nav-contrast design options                                              | Historical — decisions landed in PR #133                                     |
| [`issue-81-rationale.html`](issue-81-rationale.html)                   | Why alpha-variant tokens                                                                 | Historical — issue #81 closed (impl #135)                                    |
| [`issue-86-p3-gamut-explainer.html`](issue-86-p3-gamut-explainer.html) | P3 wide-gamut OKLCH delivery explainer                                                   | Historical — issue #86 closed (impl #138)                                    |
| [`focus-ring-comparison.html`](focus-ring-comparison.html)             | Focus-ring policy options A/B/C                                                          | Historical — focus color shipped (#55); the pattern is being reworked in #92 |
| [`phase-1-preview.html`](phase-1-preview.html)                         | Phase 1 (C-bases polish) preview                                                         | Historical — planning preview; shipped via #133/#135                         |
| [`phase-2-token-decisions.html`](phase-2-token-decisions.html)         | Phase 2 token decisions (focus, z-index, tabs, menu)                                     | Historical — planning preview (#129)                                         |
| [`nexus-ds-intelligence.html`](nexus-ds-intelligence.html)             | Design-system competitive / benchmark dashboard                                          | Historical — snapshot (#55)                                                  |

`deps/` — output directory for `analyze-deps`; kept empty via `.gitkeep`.
