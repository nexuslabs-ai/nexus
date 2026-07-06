# Notion Form Reference — Non-Field Control Audit

**Date:** 2026-07-06  
**Issue:** #617 — Audit Nexus non-field controls against Notion interaction and visual patterns  
**Reference URL:** https://scrawny-side-0c2.notion.site/30acd7c26eb680739daece25ad50336d  
**Reference surface:** Public Notion Form, dark theme, titled "Post-flight report - How was the ride?"

## Summary

This is the first #617 reference pass. The useful Notion lesson is not that Nexus
should copy Notion's visual system. It is that Notion makes the option **row**
feel like the interaction target while the radio or checkbox remains a quiet
marker. Nexus should preserve its own semantic tokens, focus model, and component
hierarchy, but use this pass to improve row-owned choice patterns, menu density,
and restrained state feedback.

No component implementation changes are included in this audit. Any code change
should be split into a follow-up issue after the broader #617 comparison is
accepted.

## Notion Form Reference

Observed on the supplied public form:

| Area            | Observed Notion behavior                                                                                                                  | Nexus learning                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Surface         | Dark page surface, strong white headings, muted helper text, minimal dividers.                                                            | Keep Nexus token-driven themes, but prefer quiet contrast and clear hierarchy over decorative framing.                           |
| Text fields     | Field surfaces are about 38px tall, with a calm border, muted placeholder, and low visual noise.                                          | Field behavior is already handled by #616; keep this only as context, not a reason to reopen field focus.                        |
| Select popover  | The collapsed "Your answer" control is about 38px tall. Opening it creates a same-width searchable listbox popover with compact rows.     | Treat this as evidence for searchable select composition, not a reason to make the base Nexus Select searchable by default.      |
| Radio rows      | Radio markers are about 18px; each visible option row is about 32px high and reads as the click target.                                   | Improve/document Nexus radio choice rows so the row owns ergonomics and rhythm, while `RadioGroupItem` stays a compact marker.   |
| Checkbox group  | Inline checkbox markers are about 18px; option rows are visually simple, left-aligned, and text-led.                                      | Prefer a row recipe before changing the Checkbox atom size. The marker can stay quiet if the row carries the affordance.         |
| Menu            | Public-page "More actions" menu uses compact rows around 32px tall, small leading icons, rounded menu surface, and a visible focused row. | Nexus menu density is close; compare item height, icon alignment, focus fill, and radius before changing shared menu primitives. |
| Utility buttons | Top-bar icon buttons are compact; "Get Notion free" is a subdued filled button.                                                           | Keep Nexus Button hierarchy and press feedback. Use Notion only as evidence for quiet utility/action variants in chrome.         |
| Submit          | Submit is calm grey, compact, and not visually dominant on this form.                                                                     | Nexus should avoid over-promoting secondary form actions, but Button semantics should stay distinct from form-field styling.     |
| Motion          | No obvious expressive motion was observed in this pass.                                                                                   | Keep state feedback restrained; do not add motion solely to mimic Notion.                                                        |

## Select Open-State Evidence

The "Most Valuable Session" collapsed control opened into a same-width popover
anchored directly to the field:

- Trigger: 600px wide by 38px tall in the captured desktop viewport.
- Popover/dialog: about 601px wide by 423px tall, with a dark `rgb(37 37 37)`
  surface, 6px radius, 1px hairline shadow, and soft elevation.
- Search header: about 39px tall, with a focused input placeholder reading
  "Search for an option...".
- Listbox: about 601px wide by 385px tall.
- Options: about 593px wide by 28px tall, 6px radius, 16px text with 24px line
  height, and no leading marker or check indicator visible for unselected rows.
- Interaction sample: keyboard focus stayed in the search input. A targeted DOM
  read did not expose a separate option highlight attribute or outline for the
  sampled rows, so final hover/highlight guidance should still be visually
  verified before a component change.

This makes the Notion control closer to a searchable combobox/listbox than a
plain closed-set select menu. Nexus already has a dedicated `Command` primitive
for searchable command/listbox experiences, while `Select` is a Radix select
with a trigger, popover, item rows, leading selected indicators, disabled rows,
grouping, and a pinned 40px default trigger height.

## Component Recommendations

| Component or family                   | Current Nexus behavior                                                                                                                                                                                               | Recommendation                                                                                                                                                                                                      | Follow-up issue shape                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Checkbox                              | The atom is a 16px marker with a coarse-pointer hit-area overlay, checked/indeterminate color states, and cross-faded indicators.                                                                                    | **Tune toward Notion at recipe level.** Add or document a first-class choice-row composition where the whole label row carries hover/active/focus rhythm and the marker is secondary.                               | "Add Checkbox choice-row recipe and Storybook coverage."                    |
| Radio                                 | The atom is a 16px marker with roving-focus behavior from Radix, coarse-pointer hit-area overlay, and a cross-faded dot.                                                                                             | **Tune toward Notion at recipe level.** Add a radio choice-row recipe with 32px row rhythm, label-led scanning, and clear checked/focused states.                                                                   | "Add RadioGroup choice-row recipe and Storybook coverage."                  |
| Checkbox groups                       | Nexus supports checkbox atoms and Field composition, but #617 should inspect whether the row pattern is discoverable enough.                                                                                         | **Recipe-first decision.** Track compact checkbox and radio choice rows as Storybook recipes first; promote to a component only after repeated product call-sites or growing duplicated overrides.                  | "Add compact Checkbox and RadioGroup choice-row recipes (#618)."            |
| Dropdown menus                        | Menu items already use compact padding, focus fill instead of focus outline, leading icon slots, and staggered item motion.                                                                                          | **Keep Nexus, minor audit.** Compare against Notion's 32px public menu rows and focused-row treatment before changing shared menu density.                                                                          | "Audit menu row density and focus fill against Notion."                     |
| Select-like controls                  | Nexus Select has a 40px field-like trigger, compact popover surface, item rows with leading selected indicators, disabled rows, grouping, and Storybook interaction coverage. Nexus Command covers searchable lists. | **Split the recommendation.** Keep base Select as a non-searchable closed-set primitive; explore a separate searchable select or multi-select recipe that composes Command-like input with select-like option rows. | "Audit searchable select/multi-select composition against Notion."          |
| Button                                | Nexus Button has semantic variants, focus outline, active color state, and tactile scale-on-press except for link.                                                                                                   | **Keep Nexus.** Use Notion only to tune quiet chrome/action examples, not the Button primitive.                                                                                                                     | "Add quiet utility button usage guidance if repeated evidence supports it." |
| Switch, Toggle, Slider, Tabs, Command | Not present on the supplied public Notion Form.                                                                                                                                                                      | **No Notion equivalent in this reference.** Inspect a Notion workspace/editor surface before making recommendations.                                                                                                | "Collect workspace/editor Notion references for non-form controls."         |

## Remaining Notion Inspection

- Selected/chosen option state inside the Notion select popover. The open empty
  state is now captured; the selected state was not changed in the live form.
- Hover, active, focus-visible, and keyboard navigation states on the form controls.
- Light-mode version of the same form.
- Workspace/editor controls: slash menu, block menu, page actions, database property menus, and searchable command-like menus.
- Controls not present on the form: switch, toggle, slider, tabs, and command/searchable menu.
- Disabled, invalid, and error states for non-field controls.

## Acceptance Notes

- This audit intentionally does **not** make Nexus look exactly like Notion.
- The direction to carry forward is: quiet, row-owned interactions with strong readability and restrained state feedback.
- Field-like focus behavior remains owned by #616 and PR #613.
- #617 should stay audit/documentation-first; implementation changes should be approved and tracked separately.
- Supersession note: #618 updates the checkbox/radio direction from
  Storybook-recipe-only to an exported `ChoiceRow` component for compact
  checkbox/radio choices. The #617 audit remains the reference evidence, not the
  implementation log.

## Validation Plan For Follow-Ups

For any later implementation PR derived from this audit:

- Add Storybook examples for row-based radio and checkbox choices.
- Cover rest, hover, active, checked, disabled, focus-visible, dark/light, and keyboard navigation states.
- Keep atom-level markers compact unless a dedicated design decision changes the primitive size.
- Validate menu and select changes against both Notion evidence and Nexus' existing focus model.
- Run focused Storybook tests for the touched component families before broader checks.
