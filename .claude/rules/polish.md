# Component Polish Playbook

> Tier-A polish is a product-quality bar, not a vibes pass. It is the written
> rubric for deciding whether a component feels finished next to a
> Linear/Stripe-caliber interface.

## Tier-A Philosophy

Tier-A components should feel calm, precise, and inevitable. A user should not
notice the system working hard: spacing should settle into an optical rhythm,
state changes should answer input without shouting, and edge states should look
as considered as the happy path.

Polish is not decoration. It is the last layer of product trust: the component
does what accessibility, implementation, and tests already promised, then proves
that the result feels stable across real density, theme, motion, and composition
contexts.

## Two-Phase Contract

Component work has two gates:

1. **Build and accessibility gate:** the component API, semantic tokens, data
   attributes, keyboard support, WCAG/APG expectations, and Storybook coverage
   are correct. This work can be merged when it is technically sound.
2. **Polish gate:** optical rhythm, interaction feel, density behavior, motion,
   empty/loading/error states, and composed-scene fit are reviewed against this
   playbook. This gate blocks calling the component "done."

Passing the first gate means the work is shippable. Passing the second gate means
it clears the Nexus Tier-A bar.

## Mandatory Modern Web Guidance Gate

Before making UI, layout, browser-platform, accessibility, forms, overlays,
motion, or component-state decisions, search Modern Web Guidance first:

```bash
npx -y modern-web-guidance@latest search "<component or surface decision>" --skill-version 2026_05_16-c5e7870
```

Retrieve any relevant guide before implementing or approving the polish plan:

```bash
npx -y modern-web-guidance@latest retrieve "<guide-id>"
```

If NPX is unavailable, blocked by sandbox policy, offline, or otherwise fails,
do not pretend the gate passed. Record the attempted command and failure in the
PR, then fall back to the local Modern Web Guidance skill/docs:

- [`../../.agents/skills/modern-web-guidance/SKILL.md`](../../.agents/skills/modern-web-guidance/SKILL.md)
- the active Codex Modern Web Guidance skill, if the repo-local copy is missing

If neither NPX nor local Modern Web Guidance is available, the plan must say:
`Modern Web Guidance unavailable; proceeding with documented fallback sources.`
Use primary sources for the fallback, such as MDN, W3C WCAG/APG, Storybook docs,
and browser compatibility references, and cite them in the PR.

Apply the guidance through Nexus conventions, not as a blind copy-paste. Radix
composition, generated stories, token emission, and repo-specific browser policy
still control the final implementation.

Every polish plan must include:

- **Modern Web Guidance Findings:** the search query, retrieved guide IDs, or
  the explicit fallback path used.
- **Browser-Floor Decision:** whether the feature is safe for the Nexus browser
  floor.
- **Fallback / Progressive Enhancement:** what happens when the feature falls
  outside the floor.
- **Rejected Approaches:** why heavier or less compatible approaches were not
  used.
- **Validation Evidence:** Storybook, accessibility, visual/manual, and command
  evidence required for review.

## Browser Floor

Nexus supports:

- Chrome 111+
- Edge 111+
- Firefox 113+
- Safari 15.4+
- Samsung Internet 22+

Treat OKLCH as the browser-floor feature. Do not assume every Baseline 2023
feature is safe. Check each feature against this browser floor and use
progressive enhancement or fallbacks when support falls outside it. Run
`pnpm audit:browser-support` when adopting or reclassifying browser-platform
features.

## Research Anchors

Use these anchors to keep polish decisions grounded:

| Topic                  | Source                                                                                                                                                                                                                                                      | Nexus rule                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Purposeful motion      | [Carbon Motion](https://carbondesignsystem.com/elements/motion/overview/)                                                                                                                                                                                   | Motion should clarify, guide, or give feedback; decorative motion is not polish.                         |
| Animation performance  | [web.dev high-performance CSS animations](https://web.dev/articles/animations-guide)                                                                                                                                                                        | Prefer `transform` and `opacity`; avoid layout/paint-heavy animation unless the PR explains why.         |
| Reduced motion         | [MDN `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)                                                                                                                                              | Animated polish must reduce, replace, or remove non-essential motion for users who request it.           |
| Accessibility criteria | [WCAG 2.2](https://www.w3.org/TR/WCAG22/)                                                                                                                                                                                                                   | Polish must include focus, motion, pointer, target-size, name/role/value, and error-state behavior.      |
| Component behavior     | [WAI-ARIA APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)                                                                                                                                                                                          | Match the APG pattern for tabs, dialogs, menus, tooltips, sliders, and other composite widgets.          |
| Story evidence         | [Storybook interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing), [a11y tests](https://storybook.js.org/docs/writing-tests/accessibility-testing), [visual tests](https://storybook.js.org/docs/writing-tests/visual-testing) | Prove polish with state stories, play functions, a11y checks, and visual review where relevant.          |
| Usability clarity      | [NN/g usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)                                                                                                                                                                     | Optimize for feedback, consistency, error prevention, recognition over recall, and aesthetic minimalism. |

## Universal Polish Matrix

| Area                       | Tier-A question                                                                                     | Evidence                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Spacing and optical rhythm | Do gaps, padding, borders, and icon/text alignment look intentional at every size and density?      | Size/density Storybook scenes; before/after notes for any visual change.                            |
| State coverage             | Are hover, active, focus, disabled, loading, empty, and error states complete and visually related? | Stories or play assertions for states that can regress.                                             |
| Motion and timing          | Does motion make state change easier to understand without becoming the feature?                    | Motion-token usage or documented #159 dependency; reduced-motion proof.                             |
| Density and responsive fit | Does the component survive compact, default, large, narrow, and composed layouts?                   | Storybook scenes across density modes and container widths.                                         |
| Accessibility              | Does behavior meet WCAG and APG expectations for the component pattern?                             | Keyboard path, focus visibility, roles/states/names, and assistive text checks.                     |
| Theme and browser floor    | Does the component hold up in light/dark themes and the supported browser floor?                    | Semantic-token usage, no unsupported feature without fallback, browser-support audit when relevant. |
| Composed-scene fit         | Does it sit naturally beside benchmark-quality controls such as Linear or Stripe?                   | UI audit screenshots or composed stories, not only isolated variants.                               |

## Component-Family Matrix

Use the family matrix to decide which evidence is mandatory for a polish PR.
Components can belong to more than one family.

| Component family                                           | Polish focus                                                                                                                               |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Buttons, toggles, checkboxes, radios, switches             | Hover, active, pressed/checked, disabled, focus-visible, target size, and tactile feedback.                                                |
| Inputs, select, textarea, form, field                      | Label rhythm, helper/error text, invalid states, disabled/read-only states, density alignment, autofill/mobile behavior, and long content. |
| Menus, popovers, dialogs, sheets, tooltips                 | Entrance/exit motion, focus trap or focus return, keyboard behavior, layering, collision, dismissal, reduced motion, and portal evidence.  |
| Tabs, navigation, sidebar, breadcrumbs                     | Active/current indicator, keyboard navigation, location clarity, responsive overflow, and density behavior.                                |
| Table, pagination, chart, data views                       | Loading/empty/error states, density, scan rhythm, numeric/text alignment, sortable/filter states, and overflow behavior.                   |
| Toast, alert, progress, spinner, skeleton, empty-state     | Status clarity, timing, motion restraint, accessible announcements, and recovery action clarity.                                           |
| Card, separator, resizable, scroll-area, layout primitives | Optical rhythm, drag/focus affordance, spacing consistency, overflow behavior, and composed-scene fit.                                     |

## PR Evidence Checklist

Every Tier-A polish PR should include:

- [ ] Modern Web Guidance search terms, retrieved guide IDs, or the NPX failure
      plus local-skill or primary-source fallback used.
- [ ] Browser-floor decision notes for any browser-platform feature touched.
- [ ] Storybook links, screenshots, or story names that prove the polish states.
- [ ] Keyboard and focus evidence for interactive surfaces.
- [ ] Reduced-motion evidence for animated or transitioning surfaces.
- [ ] Density/theme evidence when spacing, sizing, color, or motion changed.
- [ ] Before/after notes for any visual change that is not obvious from the diff.
- [ ] Validation commands run and any unavailable validation called out plainly.
- [ ] A short note explaining what was deliberately left unpolished.

Use `emil-design-eng` for product-feel review when a component needs taste-level
judgment. Use [`ui-audit`](../../.agents/skills/ui-audit-guide/SKILL.md) on
composed scenes when isolated stories cannot prove the component sits correctly
in product context.

## Motion Policy

Motion belongs to the design system, not to one-off component taste. Tie polish
motion decisions to #159:

- Use motion tokens once #159 lands; do not invent a parallel duration/easing
  scale in component code.
- Until #159 lands, keep new motion conservative and document the desired token
  relationship instead of hard-coding a new system.
- Motion must have a job: guide, clarify, give feedback, or communicate state.
  Avoid expressive moments unless the product moment is genuinely important.
- Prefer opacity, transform, and layout-stable transitions. Avoid layout or
  paint-heavy animation unless the PR explains why it is necessary.
- Use durations/easing that feel responsive and unobtrusive; avoid bounce,
  stretch, or novelty easing in normal component work.
- Always support `prefers-reduced-motion`; reduced motion should remove
  non-essential movement while preserving the state change.
- Exit motion should clarify dismissal, not make overlays feel slow.

## Accessibility Policy

Polish cannot trade away accessibility. Components should satisfy the relevant
WCAG expectations and WAI-ARIA Authoring Practices Guide pattern before visual
refinement is accepted.

Check at least:

- Keyboard reachability and expected key bindings for the pattern.
- Visible focus treatment that follows
  [components.md](components.md#focus-states).
- Focus not obscured by author-created overlays, sticky chrome, or portal layers.
- Accessible names, descriptions, roles, states, and relationships.
- APG-aligned roving focus, selection, disclosure, dialog, menu, tab, and
  composite-widget behavior when those patterns apply.
- Pointer cancellation, dragging alternatives, target size, and coarse-pointer
  usability for touch contexts.
- Reduced-motion behavior for animated surfaces.
- Name/role/value and status/error announcements for controls, feedback, and
  form surfaces.

When Radix provides semantics, preserve them unless the PR explains why the
pattern requires an override.

## Storybook Evidence Requirements

Storybook is the evidence surface for component polish. A polished component
should have enough stories to make regressions obvious:

- Default, variant, size, disabled, loading, empty, and error states where they
  exist.
- Keyboard and pointer interaction stories for interactive components.
- Data-attribute and composition stories when styling hooks or `asChild` matter.
- Density/theme/composed-scene stories for changes that affect rhythm or fit.
- Play-function assertions for behavior and accessibility contracts that are
  easy to regress.
- Accessibility addon or equivalent a11y evidence for roles, names, contrast,
  and manually confirmed incomplete checks.
- Visual review or visual-regression evidence when the PR changes layout,
  spacing, motion, or state appearance.

Generated `AllVariants` stories are useful inventory, but they are not enough for
Tier-A proof. Add focused stories when polish depends on interaction, layout, or
composition.

## Do Not Over-Polish

Polish should make the component clearer, steadier, or more usable. It should not
create churn.

Do not:

- Change public APIs only to satisfy taste-level preferences.
- Add bespoke tokens, durations, shadows, or spacing when an exact existing
  semantic token works.
- Add decorative motion without a state-change reason.
- Replace Radix/APG behavior with custom interaction models unless the component
  genuinely requires it.
- Chase pixel parity with an unrelated product at the cost of Nexus consistency.
- Expand a polish PR into broad refactors, app-consumer edits, or generated
  output changes outside the stated scope.

## Worked Example: Tabs

Tabs is the benchmark for what "Tier-A" looked like in practice:

- #93: the active indicator made selection legible without turning the trigger
  into a heavy button.
- #157: optical sizing tightened trigger rhythm so text, icon, and indicator
  weight felt balanced.
- #160: the segmented-control border made the grouped surface read as one
  control instead of separate adjacent buttons.
- #159: future Tabs motion should use the shared motion-token foundation rather
  than ad hoc durations or easing.

The lesson is not "make every component look like Tabs." The lesson is that each
surface needs the same level of evidence: clear state, optical balance,
accessible behavior, appropriate motion, and composed-scene fit.
