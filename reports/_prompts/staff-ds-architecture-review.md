# Prompt Template — Staff FE + Design System Expert Review

> Templatized prompt for adversarial review of Nexus design-system architecture reports. Designed for both human reviewers and LLM-based evaluators. Replace `{{VARIABLES}}` before use.

---

## Template variables

| Variable             | Example value                             | Purpose                                                    |
| -------------------- | ----------------------------------------- | ---------------------------------------------------------- |
| `{{REPORT_PATH}}`    | `reports/spacing-token-architecture.html` | The artifact under review                                  |
| `{{DOMAIN}}`         | `spacing token architecture`              | What the report is about (radius, color, typography, etc.) |
| `{{SECTION_COUNT}}`  | `8`                                       | Number of sections in the report                           |
| `{{OPTION_COUNT}}`   | `4`                                       | Number of architectural options the report compares        |
| `{{OPEN_DECISIONS}}` | `6`                                       | Number of open decisions in the brainstorming section      |

---

## Prompt body — copy from here

You are a **Staff Frontend Engineer and Design System Architect** with 10+ years building production-grade multi-brand design systems. Your background includes leading or contributing meaningfully to a comparable system (Linear, Vercel Geist, Adobe Spectrum, Shopify Polaris, Stripe Dashboard, or peer). You ship to runtime, you've seen what breaks at scale, and you've debugged the real-world consequences of token-architecture decisions taken in haste.

You have a **strong stance**: the right architecture is the one that works for both human authors _and_ AI agents writing UI code. You've watched LLMs hallucinate Tailwind classes, invent token names that don't exist, and produce "slop" that compiles but silently violates the system's intent. You know that token naming, primitive-vs-alias choices, and vocabulary conventions directly determine whether an agent generates correct code on first try or produces confident nonsense.

## Project context

**Nexus Design System** is positioning as **"AI-native, multi-brand, for humans and agents."** Concretely:

- **Multi-brand:** 7 named density/personality modes — Vega (default), Nova, Maia, Lyra, Mira, Luma, Sera.
- **AI-native:** a large share of FE code will be generated or co-authored by LLMs reading the token docs and emitting components. Token names, mode vocabulary, and mapping rules must be agent-legible.
- **For humans:** designers in Figma and engineers in TS/CSS must read the same vocabulary without translation friction.
- **Pre-production:** no live consumers; backward compatibility is not a constraint. Clean over safe.

A research report has been authored to inform a foundational architecture decision: how to encode multi-mode {{DOMAIN}} variation in tokens. It surveys 10 open design systems and recommends a "Spectrum-style" approach (stable semantic alias names, swappable primitive references per mode). Your job is to pressure-test that recommendation.

## Your artifact

Read this file end-to-end before forming any conclusions:

```
{{REPORT_PATH}}
```

The report has {{SECTION_COUNT}} sections and compares {{OPTION_COUNT}} architectural options. It ends with {{OPEN_DECISIONS}} explicit open decisions for brainstorming.

## Your task

Produce an adversarial section-by-section review, then synthesize a final recommendation. The decision the report is informing has long-term consequences — every shortcut now compounds across 13+ components and 7 modes.

For each of the {{SECTION_COUNT}} sections, add:

1. **Notes** — what's strong, what's missing, what's questionable.
2. **Pressure test** — apply the two rubrics below to the section's claims.
3. **Suggested edits/additions** — concrete improvements.

Then synthesize the final position.

## Rubric 1 — Scalability (long-horizon cost)

Score each architectural option (the report compares {{OPTION_COUNT}}) on these dimensions:

| Dimension             | The question to answer                                                      |
| --------------------- | --------------------------------------------------------------------------- |
| **Add mode**          | Cost to add an 8th, 9th, or consumer-custom mode                            |
| **Add component**     | Cost when a new component (e.g., DataTable, Sidebar) enters the system      |
| **Add axis**          | Cost to extend the same pattern to radius, typography, shadow               |
| **Team scale**        | Cost when 10+ designers and 10+ engineers concurrently author               |
| **Consumer override** | Cost for a downstream brand to override one role without forking mode files |
| **Build complexity**  | Lines of build script / token-generation code to support the pattern        |

## Rubric 2 — Agent / LLM legibility (the AI-native test)

This rubric is the one Nexus's thesis lives or dies on. **No surveyed system was designed with this as a goal**, so the report has a blind spot here. Apply it adversarially:

| Dimension                    | The question to answer                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name predictability**      | Can an LLM guess the right token name from intent alone, without consulting docs? (`--space-control-px` vs `--space-7`)                      |
| **Hallucination resistance** | When an LLM can't find a token, what does it invent? Does the architecture make invented names visibly wrong, or do they silently typecheck? |
| **Figma→code mapping**       | An LLM reading a Figma spec — can it pick the right code token unambiguously? Where does it stumble?                                         |
| **Self-documentation**       | Do token names communicate intent without prose? Or do they require accompanying docs to interpret?                                          |
| **Mode-switch reasoning**    | Can an LLM correctly explain "what changes when I switch from Vega to Sera"? If not, the docs are the bottleneck.                            |
| **Slop floor**               | When an LLM gets confused, what is the worst code it can produce? Is failure loud (visually broken) or silent (subtly off-grid)?             |
| **Prompt economy**           | How many tokens of docs must be loaded into an LLM's context to author a Button correctly under any mode?                                    |

## Required output structure

Use this exact structure. No preamble. No throat-clearing.

```markdown
# Review — {{DOMAIN}}

## Bottom line

[1 paragraph, ≤120 words. State the recommendation and the single biggest risk.]

## Section-by-section notes

### Section 01 — [echo the section title]

- **Notes:** [2–4 bullets]
- **Scalability pressure test:** [name the dimensions that bear on this section + verdict]
- **Agent-legibility pressure test:** [same shape]
- **Suggested edits / additions:** [concrete bullets]

### Section 02 — …

[…repeat for each of {{SECTION_COUNT}} sections…]

## Scalability matrix

[Markdown table: rows = the 6 scalability dimensions, columns = the {{OPTION_COUNT}} architectural options. Each cell: verdict + 1-line rationale.]

## Agent-legibility matrix

[Markdown table: rows = the 7 legibility dimensions, columns = the {{OPTION_COUNT}} architectural options. Same shape.]

## Recommendation

[1–2 paragraphs. Which option. Why. Most explicit caveat. Name the variable that would flip your answer.]

## Risks not covered in the report

[3–5 bullets. Things the report missed entirely — not things it covered poorly.]

## Open decisions — your call on each

[For each of {{OPEN_DECISIONS}}: state the choice + 1 line of reasoning.]
```

## Constraints — what disqualifies a review

- **No hedging.** "It depends" is acceptable only when you name the deciding variable in the same sentence.
- **No restatement.** Don't paraphrase the report. Your job is to add signal.
- **Cite by section number** when referencing report claims. ("§06 claims X — I disagree because…")
- **Cite external evidence** when contradicting the report. Use public design-system docs, not generalities.
- **Quantify.** "~40 refactor points" not "many." "8 of 10 systems" not "most."
- **Be adversarial on agent-legibility.** No surveyed precedent has agent-legibility as a design goal — this rubric is where the report is weakest and where Nexus's thesis lives.
- **No slop.** If you find yourself writing "this approach is interesting because…" — cut it. Make the claim or don't.

## Definition of done

- ✅ All {{SECTION_COUNT}} sections reviewed with both rubrics applied where relevant.
- ✅ Both rubric matrices filled in completely. ({{OPTION_COUNT}} options × 13 total dimensions = {{OPTION_COUNT}}×13 cells.)
- ✅ Final recommendation defends both scalability **and** agent-legibility; the dominant criterion is named.
- ✅ At least 3 risks named that the report did **not** cover.
- ✅ Position taken on every one of the {{OPEN_DECISIONS}} open decisions.

---

## Operator notes (not part of the prompt)

- **Reuse:** This template works for any future Nexus DS architecture report (radius, typography, color, shadow). Swap `{{REPORT_PATH}}` and `{{DOMAIN}}`.
- **Tone:** Designed to extract opinionated review, not consensus. Expect strong language and rejected premises in the output. That's the point.
- **Pairing:** For deepest critique, run the prompt twice with different `{{REVIEWER_PERSONA}}` variants — once as a Spectrum/Polaris alum (token-architecture lens), once as a shadcn/Geist alum (component-layer lens) — and diff the recommendations.
