# Accessibility in component libraries: contrast models (APCA vs WCAG 2), reduced motion, forced colors, and library a11y gaps

Research date: 2026-10-20. Sources fetched in full are marked as such. "(snippet)" means the claim comes from a search-result summary and the page was not opened. GitHub's search API and Reddit were not reachable from this session, so engagement counts (reactions, upvotes) are mostly unavailable. See the Gaps sections.

## Q1. What is APCA's status in WCAG 3 drafts in 2026, and what do accessibility experts say about relying on APCA alone?

### Takeaway
APCA is **not** in the WCAG 3 draft. It was removed in the July 2023 working draft, and the 2026 drafts say "the contrast algorithm used in WCAG 3 is yet to be determined." WCAG 3 itself is years from Recommendation. Leading practitioners (Adrian Roselli, Eric Eggert) say you may *use* APCA, but you must not rely on it alone. They advise picking colours that also pass WCAG 2 ratios. Roselli calls "drop WCAG 2, use APCA" advice a legal risk.

### Cited Findings
**Draft status (facts)**
- The latest dated W3C Working Draft cited in August 2026 is **3 March 2026 (WD-wcag-3.0-20260303)**. It carries the boilerplate "may be updated, replaced, or obsoleted by other documents at any time." It says only that "The contrast algorithm used in WCAG 3 is yet to be determined." The article's claims were verified on 24 Aug 2026. It advises: "Do not write 'WCAG 3' into a deliverable." — [ADA Compliance Pros, Aug 2026 (fetched)](https://www.adacompliancepros.com/blog/wcag-3-draft-status-procurement)
- The April 8, 2026 Editor's Draft says: "The contrast algorithm used in WCAG 3 is yet to be determined." — [Adrian Roselli, "WCAG3 Contrast as of April 2026", 10 Apr 2026, updated 13 Apr (fetched)](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html)
- **History.** Michael Cooper's comment of 30 Jan 2023 said exploratory content without working-group support within six months is "automatically removed." APCA was then dropped from the July 2023 working draft. — [Roselli 2026 (fetched)](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html)
- **Conflict on the newest draft.** One vendor blog cites a **September 2026** WCAG 3 update. I could not verify it, and no source reports any change to APCA's status after it. — [Vervali (snippet)](https://www.vervali.com/blog/wcag-3-0-accessibility-testing-compliance-2026-standards-timeline-tools-and-how-to-prepare-your-stack/); compare [ADA Compliance Pros (fetched)](https://www.adacompliancepros.com/blog/wcag-3-draft-status-procurement), which names March 2026 as the latest.
- **Timeline.** Roselli: "WCAG3 is years away from being done," perhaps 2030 at the earliest. — [Roselli 2026 (fetched)](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html). Other secondary sources say a Candidate Recommendation is targeted around Q4 2027, a Recommendation no earlier than 2028, or Recommendation around late 2029. These are unverified W3C roadmap claims. — [WebAbility (snippet)](https://www.webability.io/blog/wcag-3-0-explained), [Vervali (snippet)](https://www.vervali.com/blog/wcag-3-0-accessibility-testing-compliance-2026-standards-timeline-tools-and-how-to-prepare-your-stack/)

**Expert opinion**
- **Adrian Roselli (Apr 2026).** He has seen "people, teams, products, organizations, and projects" promote APCA as *the* WCAG 3 algorithm, often while suggesting teams dismiss WCAG 2's algorithm.
  - He says advice from earlier in 2025 "would create legal risk for anyone following it."
  - He writes: "You can still use APCA (whatever version)." He also suggests choosing colours that also "conform to WCAG2 contrast requirements."
  - If you ship colours that fail WCAG 2, he says to document the decision and prepare a response for claims from people using automated checkers.
  - "I have no idea if APCA, whatever version, will come back to WCAG3."
  - He filed issues with tool makers asking them to remove APCA, including a May 2024 Chromium issue. He disclaims speaking for the W3C.
  - Source: [Roselli 2026 (fetched)](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html)
- **Andrew Somers (APCA author), in Roselli's comments, 15 Apr 2026.** He promotes **BridgePCA**, which "automatically passes WCAG 2, but extends improved accommodation using APCA." Roselli does not endorse it. — [Roselli 2026 comments (fetched)](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html); [bridge-pca on npm (snippet)](https://www.npmjs.com/package/bridge-pca)
- **Eric Eggert (2021, updated Mar 2023 and Sep 2024, so older).** Public and commercial projects are "probably, through law or policy, required to conform to WCAG 2." He concludes "you cannot rely on APCA for compliance (simply because it does not exist in WCAG 2)."
  - He notes APCA's size and weight dependence makes "requirements documents and design systems more complicated."
  - APCA revisions could make a colour that passes now fail later.
  - Meeting both WCAG 2 and a future standard yields more legible colours.
  - Source: [yatil.net, "WCAG 3 is not ready yet" (fetched)](https://yatil.net/blog/wcag-3-is-not-ready-yet)
- **A compliance-oriented article argues that premature APCA adoption creates legal risk.** Title only, not read. — [accessibility.chat, "The APCA Mirage" (snippet)](https://www.accessibility.chat/articles/the-apca-mirage-why-premature-wcag-3-adoption-creates-legal-risk)
- **Counter-current.** Some 2026 design blogs call APCA "the practical north star" while conceding WCAG 2.2 AA is the legal standard. — [pravinkumar.co (snippet)](https://pravinkumar.co/blog/apca-color-contrast-webflow-design-2026), [66colorful (snippet)](https://66colorful.com/blog/apca-contrast/), [CSS DNA (snippet)](https://cssdna.com/blog/wcag-vs-apca-contrast/)
- **APCA's own docs (Myndex, © 2022).**
  - Lc 90 is the preferred level for body text and Lc 75 is the minimum for body text (18px/400).
  - Lc 60 is the minimum "for content text that is not body, column, or block text." Lc 45 is for "larger, heavier text (36px normal weight or 24px bold)". Lc 30 is for "spot readable" text, and Lc 15 for non-text.
  - The docs say WCAG 2.x "overstates contrast for dark colors to the point that 4.5:1 can be functionally unreadable," so "WCAG 2.x contrast cannot be used for guidance designing 'dark mode'."
  - They give **no** formal Lc↔ratio equivalence.
  - Source: [APCA in a Nutshell (fetched)](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html)
- **Tooling trend.** Despite pushback, **Chrome DevTools 149 (2 June 2026)** says APCA "has officially left its experimental phase" and "is now available as a standard preference setting." It is opt-in via Settings > Preferences > Elements > "Enable APCA contrast guidelines" and "replaces the legacy AAA/AA contrast guidelines" when enabled. — [Chrome for Developers (fetched)](https://developer.chrome.com/blog/new-in-devtools-149)
- **Deque's axe-core.** The `color-contrast` rule checks "WCAG 2 AA minimum contrast ratio thresholds". No APCA support appears in recent release notes. A third-party `apca-check` package adds APCA axe rules and suggests turning off the default WCAG rule. — [axe-core 4.11.1 notes (snippet)](https://docs.deque.com/axe-release-impact/4.11.1/en/release-notes), [apca-check (snippet)](https://npmjs.com/package/apca-check)

### Inferences
- Expert consensus in 2026 is "APCA *in addition to* WCAG 2, never instead of it." I found no recognised practitioner (Roselli, Eggert, Deque docs) endorsing APCA-only checking for products that face legal or procurement scrutiny.
- APCA is *more available* in tooling (Chrome 149) even as its standards status is *weaker* than in 2021–22. Expect more developers to see APCA numbers and assume they count for compliance. That raises the stakes of any marketing that implies APCA equals "accessible."
- APCA's strongest, least-disputed argument is dark-mode readability, where WCAG 2 overstates contrast. A design system can use that to justify APCA as an *extra* gate.

### Gaps
- I could not read the March 2026 W3C draft directly. The September 2026 update claim is unverified.
- I found no statement from WebAIM or TPGi in 2026 specifically on APCA-only checking. Deque's position is inferred from axe docs, not from a published statement.
- Somers's Bluesky replies to Roselli were not retrieved.

## Q2. Does any regulator or standard accept APCA instead of WCAG 2.x 1.4.3 / 1.4.11? Do enterprise buyers require VPATs/ACRs against WCAG 2.1/2.2 AA?

### Takeaway
No regulator or harmonised standard I found accepts APCA. Every legal reference point is a WCAG 2.x version: ADA Title II uses 2.1 AA, Section 508 uses 2.0, and EN 301 549 / EAA uses 2.1 AA, with WCAG 2.2 now ISO/IEC 40500:2025. Enterprise and public-sector procurement asks for ACRs (VPAT 2.4/2.5) against WCAG 2.1 or 2.2 AA. Very few component-library vendors publish an ACR.

### Cited Findings
- **ADA Title II (US public entities).** The rule requires "Level A and Level AA success criteria and conformance requirements specified in WCAG 2.1" (28 CFR 35.200(b)). — [ADA Compliance Pros (fetched)](https://www.adacompliancepros.com/blog/wcag-3-draft-status-procurement)
  - **Deadline change (fact, 2026).** A DOJ interim final rule of **20 April 2026** pushed the deadline for entities serving ≥50,000 people from 24 Apr 2026 to **26 Apr 2027**. Smaller entities and special districts have until **26 Apr 2028**.
  - Archer Law gives 27 Apr 2027 instead, so the sources conflict. The standard stays WCAG 2.1 AA. One source says the extension is being challenged in federal court.
  - Sources: [Clockwork (snippet)](https://clockworkwd.com/ada-title-ii-web-accessibility-deadline-extended-to-april-2027-what-to-know/), [Archer Law PDF (snippet)](https://www.archerlaw.com/print/v2/content/11506/doj-extends-ada-web-accessibility-deadline-to-april-2027.pdf), [JD Supra (snippet)](https://www.jdsupra.com/legalnews/doj-extends-public-entities-compliance-7695347/)
- **Section 508 (US federal).** 36 CFR part 1194 contains 23 occurrences of "WCAG 2.0" and none of "WCAG 2.1" or "WCAG 3." — [ADA Compliance Pros (fetched)](https://www.adacompliancepros.com/blog/wcag-3-draft-status-procurement)
- **EN 301 549 / European Accessibility Act.**
  - EN 301 549's web chapter (Chapter 9) maps to WCAG 2.1 AA. V3.2.1 (March 2021) is the version cited for the Web Accessibility Directive.
  - Conformance with the version referenced in the Official Journal gives a presumption of conformity with the EAA.
  - A WCAG 2.2-aligned revision is in progress. These are secondary sources, not EU text.
  - Sources: [e-include (snippet)](https://e-include.eu/web-accessibility/en-301-549/), [Level Access (snippet)](https://www.levelaccess.com/blog/eu-accessibility-requirements-and-eaa-compliance/), [Acquia (snippet)](https://www.acquia.com/blog/european-accessibility-act-and-en-301-549-your-complete-compliance-guide.md)
  - The EAA has applied since June 2025. That date comes from the assignment brief and was not re-verified in this pass.
- **ISO.** WCAG 2.2 was adopted as **ISO/IEC 40500:2025 (Oct 2025)**, which gives procurement a formal basis to require it. — [Clym (snippet)](https://www.clym.io/blog/wcag-2-2-iso-procurement)
- **Procurement practice.**
  - Commercial SaaS is typically asked for a VPAT/ACR against **WCAG 2.2 AA**. Federal buyers want the 508 edition, EU buyers want EN 301 549, and the INT edition covers all three. Some buyers want an ACR less than two years old that matches the product version. — [accessible.org (snippet)](https://accessible.org/procurement-teams-check-acr/)
  - The University of Arizona prefers VPAT 2.4+ against WCAG 2.1 AA. — [Arizona (snippet)](https://accessibility.arizona.edu/procurement/accessible-procurement-process)
  - VPAT 2.5 covers up to WCAG 2.2. — [Tarleton (snippet)](https://www.tarleton.edu/accessibility/?p=776)
  - A blog reports "new WCAG updates drive surge in VPAT requests." — [ADA Compliance Pros (snippet)](https://www.adacompliancepros.com/blog/new-wcag-updates-drive-surge-in-vpat-requests)
- **Component libraries rarely publish ACRs.** One author who wrote a WCAG 2.2 AA conformance report for their own component library says almost no component vendor does. — [Level Up / gitconnected (snippet)](https://levelup.gitconnected.com/i-wrote-a-wcag-2-2-aa-conformance-report-for-my-own-library-heres-what-a-vpat-actually-requires-1edb6f52a89e)
- **Expert reading of the law.** Eggert: "you cannot rely on APCA for compliance." — [yatil.net (fetched)](https://yatil.net/blog/wcag-3-is-not-ready-yet). Roselli: dropping WCAG 2 creates legal risk. — [Roselli 2026 (fetched)](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html)

### Inferences
- A design system whose only contrast gate is APCA cannot support a WCAG 2.x conformance claim for contrast. A buyer's ACR reviewer, or any axe or Lighthouse scan, will measure WCAG 2 ratios.
- APCA-passing pairs are not automatically non-compliant, because many also pass WCAG 2. Proving it, however, requires a WCAG 2 check.
- Publishing an ACR for the component library itself would be a procurement differentiator, since almost no component vendor publishes one.

### Gaps
- I did not read the Federal Register text of the April 2026 interim final rule, the Official Journal reference for EN 301 549, or the EAA itself.
- I found no source on whether any national regulator has commented on APCA. The absence is consistent across sources, but it is not proven.

## Q3. Which design systems and tools use APCA, and do they also check WCAG 2?

### Takeaway
Little primary evidence surfaced. Tools generally offer APCA *alongside* WCAG 2 rather than replacing it: Leonardo has a formula switch and Chrome DevTools has an opt-in toggle. I found no major design system that checks APCA *only*.

### Cited Findings
- **Radix Colors.** The official docs say steps 11 and 12 "are designed for low-contrast text and high-contrast text respectively." — [Radix docs (snippet)](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette). The claim that Radix *guarantees* APCA contrast for steps 11/12 on step 2 is secondhand, from Unkey's design site. — [design.unkey.com (snippet)](https://design.unkey.com/colors). Another secondary source instead says steps 11/12 pass WCAG AA. — [brainy.ink (snippet)](https://brainy.ink/paper/accessible-color-contrast/de). The sources conflict and the primary source is unconfirmed.
- **Adobe Leonardo.** A `formula: 'wcag3'` theme option returns APCA Lc values. WCAG 2 recipes (ratios 4.5, 7, 3) are the documented default path. — [third-party Leonardo skill page (snippet)](https://skillselion.com/skills/adobe/leonardo/leonardo-colors)
- **Chrome DevTools.** APCA is an opt-in preference since Chrome 149 (June 2026). — [Chrome for Developers (fetched)](https://developer.chrome.com/blog/new-in-devtools-149)
- **axe-core** checks WCAG 2 only. APCA is available through the third-party `apca-check` rules. — [apca-check (snippet)](https://npmjs.com/package/apca-check)
- **BridgePCA** is an APCA-derived method designed to stay "backwards compatible with WCAG_2 contrast (1.4.3)." — [bridge-pca (snippet)](https://www.npmjs.com/package/bridge-pca)
- Data-viz and civic-tech practitioners publish "use both" or "pick the model per task" comparisons. These were titles only, not read. — [Datawrapper (snippet)](https://blog.datawrapper.de/color-contrast-check-data-vis-wcag-apca/), [CivicActions, "All models are wrong…" (snippet)](https://blog.civicactions.com/all-models-are-wrong-but-some-are-useful-choosing-the-right-contrast-model-for-accessibility-905bb31ad032)

### Inferences
- The industry pattern is dual-model or WCAG 2 by default with APCA optional. A design system that *removes* WCAG 2 checks is an outlier, not the norm.

### Gaps
- I could not confirm GitHub Primer's contrast tooling, Radix's exact APCA guarantee text, or Leonardo's official docs from primary pages.

## Q4. How strongly do practitioners expect `prefers-reduced-motion` to be respected by default? Is a user-facing toggle that defaults to off enough?

### Takeaway
WCAG 2.3.3 (motion from interactions) is AAA only. It requires that such motion "can be disabled," which a site toggle satisfies on paper. Practitioner and library norms, though, treat the **OS-level `prefers-reduced-motion` signal as the default to honour**, with a site toggle as an *override*. Mantine, for example, says all its animated components support it by default. A toggle that ignores the OS setting and defaults to off means a vestibular user sees full motion until they find the control. Bug trackers treat "ignores reduced motion" as a defect.

### Cited Findings
- W3C technique **C39** meets 2.3.3 "via the use of the prefers-reduced-motion CSS Media Query." It cites scroll-triggered motion such as parallax as a vestibular trigger. — [W3C C39 (snippet)](https://w3.org/WAI/WCAG22/Techniques/css/C39)
- 2.3.3 is **Level AAA**. Its "essential" exemption is read narrowly. Separately, **2.2.2 Pause, Stop, Hide (Level A)** applies whatever the user's preference. Auto-moving content lasting more than 5 s needs a pause/stop/hide control. — [TestParty guide (snippet)](https://testparty.ai/blog/wcag-animation-interactions-guide), [Disability World (snippet)](https://www.disabilityworld.org/toolkit/standards/wcag/2-3-3-animation-from-interactions/)
- The University of Michigan accessibility KB calls respecting the OS setting "strongly recommended" for vertigo and vestibular disorders. — [UMich (snippet)](https://teamdynamix.umich.edu/TDClient/30/Portal/KB/Article/14019/Accommodating-Vertigo-and-Vestibular-Disorders)
- **Library defaults.** Mantine says "all Mantine components which use animations support it by default." c15t says its built-in components respect it internally. — [Mantine (snippet)](https://v4.mantine.dev/hooks/use-reduced-motion/), [c15t (snippet)](https://c15t.com/docs/frameworks/next/hooks/use-reduced-motion)
- **Bug reports treating non-respect as a defect:**
  - WordPress Customizer animations ignored the setting. The fix adds transitions only under `no-preference`. — [WP Trac #62806 (snippet)](https://core.trac.wordpress.org/ticket/62806)
  - Mapbox GL JS now defaults animation duration to 0 under reduce. — [PR #8494 (snippet)](https://github.com/mapbox/mapbox-gl-js/pull/8494)
  - GitLab: "Honoring prefers-reduced-motion should mean removing the motion, not removing the affordance." — [GitLab 607550 (snippet)](https://gitlab.com/gitlab-org/gitlab/-/work_items/607550)
  - shadcn/ui Carousel autoplay "does not respect the user's reduced motion preference." — [thefrontkit audit (fetched)](https://thefrontkit.com/blogs/shadcn-ui-accessibility-audit-2026)
- **Browsers will not do it for you.** In a CSSWG discussion, Robert Flack said the group doesn't know enough to change effects automatically and prefers authors to make different animations. — [W3C list, Jul 2020 (snippet, older)](https://lists.w3.org/Archives/Public/public-css-archive/2020Jul/0398.html)
- **OS default plus site toggle as override.** Val Head's case study describes a site that follows the OS query automatically and also offers its own switch. — [Val Head, "Reduced Motion In The Wild", May 2020 (snippet, older)](https://valhead.com/2020/05/09/reduced-motion-in-the-wild/)
- **Strong reading of the signal.** A W3C contributor wrote: "if prefers-reduced-motion is set, the safest practice would be to assume there is no safe animation." — [Charles Belov, public-css-archive, Sep 2024 (snippet)](https://lists.w3.org/Archives/Public/public-css-archive/2024Sep/0657.html)
- **Opt-in motion.** Some frameworks recommend opt-in (progressive) motion, so users who never set a preference are also protected. — [Automatic.css reduce-motion docs (snippet)](https://docs.automaticcss.com/accessibility/reduce-motion)

### Inferences
- For a component library, "toggle defaulting to off, OS signal ignored" is below the bar set by Mantine-style peers and by bug-tracker norms. It is defensible only on the letter of AAA 2.3.3, and then only if every host app exposes the toggle.
- The usual critique would be: a vestibular user has already told their OS. Making them find a per-app setting, after the motion has already played, is the failure the media query exists to prevent.

### Gaps
- I found no Reddit or r/accessibility thread with engagement data specifically about library-level toggles versus the OS signal.
- I found no published vestibular-community survey on this question.

## Q5. How common is forced-colors support in component libraries, and how much do practitioners criticise its absence?

### Takeaway
Forced colors / Windows Contrast Themes is used by about 4% of Windows users (Microsoft's figure) and by a large share of low-vision users. The most-cited library failure is **focus rings built with `box-shadow` (Tailwind `ring-*`) disappearing**, because forced colors removes box-shadow. Tailwind v4's `outline-hidden` keeps a transparent outline that becomes visible in forced colors, but `outline-none` no longer does. Basic support (outlines, borders, `currentColor` icons) needs no `@media (forced-colors)` query. Fuller support usually uses the query.

### Cited Findings
- **Usage.**
  - Microsoft reported that 4% of Windows users use high-contrast mode, recorded in 2019 CSSWG minutes. — [CSSWG minutes, Apr 2019 (snippet)](https://lists.w3.org/Archives/Public/www-style/2019Apr/0004.html)
  - Polypane: "You can still assume that one in twenty-five of your visitors will have it enabled." — [Polypane, 2022, updated May 2024 (fetched)](https://polypane.app/blog/forced-colors-explained-a-practical-guide/)
  - The share of low-vision users is uncertain. Polypane says 50% of WebAIM low-vision survey respondents use it and calls the group self-selecting. Smashing estimates about 30% from the same survey, so the two sources conflict. — [Smashing, "Guide To Windows High Contrast Mode", Jun 2022 (snippet)](https://smashingmagazine.com/2022/06/guide-windows-high-contrast-mode/)
- **What breaks.** Forced colors resets `color`, `background-color`, `border-color`, and `outline-color`, and removes `box-shadow`/`text-shadow`.
  - "Resets all background colors to the same color." Anything delineated only by background fill vanishes.
  - Inline SVGs keep their own colours unless they use `currentColor`.
  - Using `outline-color: transparent` instead of `outline: none` makes focus visible in forced colors without any special query.
  - Source: [Polypane (fetched)](https://polypane.app/blog/forced-colors-explained-a-practical-guide/)
- **Tailwind.**
  - Current docs say `outline-hidden` hides the outline but keeps it in forced colors, and `outline-none` "completely removes" it. — [Tailwind docs (snippet)](https://tailwindcss.com/docs/outline-style)
  - In v2/v3, `outline-none` was a transparent outline "to ensure elements are still visibly focused to Windows high contrast mode users". The behaviour moved to `outline-hidden` in v4, which is an upgrade trap. — [Tailwind v3 docs (snippet)](https://v3.tailwindcss.com/docs/outline-style)
  - Rings are box-shadow and vanish in forced colors. — [Steve Kinney (snippet)](https://stevekinney.com/courses/tailwind/border-outline-ring)
- **Practitioner write-ups on the ring problem.** "box-shadow focus ring not visible in high contrast mode". — [azukiazusa (snippet)](https://azukiazusa.dev/en/blog/box-shadow-focus-ring-not-visible-in-high-contrast-mode). "My focus indicators were inaccessible". — [tempertemper (snippet)](https://www.tempertemper.net/blog/windows-high-contrast-mode-and-focus-outlines). Strategy guides also exist. — [cssence 2024 (snippet)](https://cssence.com/2024/forced-colors-mode-strategies)
- **shadcn/ui** focus styling uses `focus-visible:ring-*` (box-shadow). — [thefrontkit audit (fetched)](https://thefrontkit.com/blogs/shadcn-ui-accessibility-audit-2026). That audit, which claims to test every component, **never mentions forced colors**. This suggests forced colors is outside even "a11y audit" scope for shadcn users.

### Inferences
- Forced-colors support is a niche but sharp expectation. Specialists criticise its absence loudly, and mainstream audits often skip it, as the shadcn audit shows.
- The single most visible failure is focus rings. A library with outline-based focus avoids the main complaint.
- Background-only state is the second-tier risk: progress fills, active tabs, selected rows, and the checked fill of a switch or checkbox.

### Gaps
- I could not confirm forced-colors support in MUI, Chakra, Radix Themes, or React Aria/Spectrum from primary docs, and GitHub issue search was blocked. My unverified memory is that React Spectrum documents Windows High Contrast support. I am not citing it.
- I found no quantified "% of libraries supporting forced colors."

## Q6. What do people complain about in the contrast and accessibility of popular libraries' defaults (shadcn/ui, Tailwind palettes, MUI, Chakra)?

### Takeaway
The recurring shadcn/ui complaint is "Radix behaviour is solid, the shadcn styling layer undoes it." The commonly cited failures are a 50%-opacity focus ring (about 2.4:1, below 1.4.11's 3:1), placeholder and muted text under 4.5:1, a few missing ARIA states, and autoplay that ignores reduced motion. Contrast is framed as "your responsibility." I found no sourced, specific complaints about Tailwind palettes, MUI, or Chakra in this pass.

### Cited Findings
- **thefrontkit "shadcn/ui Accessibility Audit 2026"** by Gaurav Guha, 8 Apr 2026. **Conflict of interest:** the author sells UI kits and $499+ audits. Fetched in full.
  - Claims to test 48 components against WCAG 2.2 AA with VoiceOver/Safari and NVDA/Firefox, plus axe, Lighthouse and WAVE.
  - Headline counts: 34 pass, 9 need minor fixes, 5 have "real gaps." The counts don't reconcile internally.
  - Focus visibility is "the most common failure." The Button's `ring-ring/50` gives "2.4:1" on white, below 3:1.
  - Placeholder text is "below 4.5:1 in the default light theme."
  - Real gaps: Combobox is missing `aria-expanded`/`aria-controls`/`aria-haspopup`, and Data Table has no caption, no sort state, and unlabeled checkboxes ("the single most common shadcn audit failure we see"). Chart has no text alternative, and Context Menu displays shortcuts that don't work. The Carousel ignores reduced motion.
  - Its framing: Radix gives correct focus management, then shadcn's default styles undo it.
  - Source: [thefrontkit (fetched)](https://thefrontkit.com/blogs/shadcn-ui-accessibility-audit-2026)
- **Contrast is the developer's job.** Radix leaves styling to you, "so contrast is your responsibility." In one case, a team wrapped a Tooltip trigger in a `div` and broke keyboard access. — [eastondev, 30 Mar 2026 (snippet)](https://eastondev.com/blog/en/posts/dev/20260330-shadcn-radix-accessibility/)
- "Your application still controls names, labels, content structure, color contrast…" — [shadcnstudio (snippet)](https://shadcnstudio.com/blog/making-your-website-accessible-with-shadcn-ui/)
- A tutorial exists on building high-contrast themes for shadcn, which implies the defaults don't provide them. — [newline (snippet)](https://www.newline.co/@eyalcohen/creating-high-contrast-accessible-themes-with-shadcnui--124da688)

### Inferences
- The shadcn complaints map closely onto what a CI contrast gate plus outline focus rings would prevent: weak focus rings and low muted/placeholder contrast. That is the market opening Nexus targets.
- Buyers and auditors will measure these complaints in **WCAG 2 terms** (3:1, 4.5:1), not Lc.

### Gaps
- GitHub issue search for shadcn-ui/ui, radix-ui/primitives, mui/material-ui and chakra-ui returned 403 from this session, so I have no issue numbers or reaction counts.
- I found no Reddit or HN threads with engagement data.
- I found no sourced complaints about Tailwind default palette contrast, MUI, or Chakra.

## Does Nexus answer these?

### Takeaway
Nexus answers the *engineering* complaints well: it has a real CI contrast gate across brands, outline focus rings that survive forced colors, and Radix primitives with axe on every story. It does **not** answer the *compliance* questions. Contrast is checked only in APCA, the axe contrast rule is off, the OS reduced-motion signal is ignored, and there is no forced-colors work beyond outlines and borders. My own WCAG 2 measurement of the shipped default theme finds pairs that pass Nexus's APCA floors but fail WCAG 2 SC 1.4.3.

### Cited Findings (repo evidence, checked 2026-10-20 at commit 61e1776)
- **Tier floors.** `TIER_THRESHOLDS = { body: 75, ui: 60, incidental: 45 }` in `packages/core/src/lib/palette.ts:31`. The pair registry is `packages/core/src/lib/apca-pairs.ts`.
  - `muted-foreground` is tier `ui` (Lc 60), and `muted-foreground-subtle`, `disabled-foreground` and the focus rings are tier `incidental` (Lc 45).
  - Coloured button and badge labels (`{family}-foreground` on `{family}-background`) are tier `ui`.
- **The axe contrast rules are off.** `'color-contrast': { enabled: false }` and `'color-contrast-enhanced': { enabled: false }` are set in `packages/react/.storybook/preview.tsx:276-277`.
- **Reduce motion.** `reduceMotion: false` is the default in `packages/core/src/lib/appearance-model.ts:140`. When the toggle is on, it emits a global `*, *::before, *::after { animation-duration: 0.01ms !important; … transition-duration: 0.01ms !important; … }` (line ~338).
  - There is no `prefers-reduced-motion`, `motion-safe`/`motion-reduce` or `forced-colors` query anywhere in `packages/react/src` or `packages/tailwind`, which I checked with grep.
  - Nine non-story component files use `animate-*` classes.
- **Focus rings.** These use `nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2`, for example in `packages/react/src/components/button/button.tsx:13`.
- **Borders on background-only controls.** Switch, Checkbox, Radio and Slider carry `border-border-default` classes. `progress.tsx` has no border or outline class.
- **My WCAG 2 measurement of the default theme.**
  - Method: a Python script converts the shipped `packages/tailwind/nexus.css` OKLCH tokens to sRGB and computes WCAG 2.x relative-luminance ratios, plus an APCA-W3 Lc estimate as a cross-check.
  - Caveat: this is my approximation. The engine's gamut mapping may differ slightly, and CI-derived non-default brands are not covered.
  - Light theme results:
    - `success-foreground` (white) on `success-background` `oklch(0.62 0.2233 140)` = **3.35:1** (Lc ≈ 66). This passes the `ui` floor and **fails WCAG 2 4.5:1** for normal-size text.
    - `warning-foreground` on `warning-background` = **3.96:1** (Lc ≈ 71). Also fails 4.5:1.
    - Both pairs are used by the Badge `success`/`warning` variants (`badge.tsx:45,50`, a 24px-tall badge, so small text) and appear in Avatar and Sonner. The token values are identical in the dark block.
    - Input/Textarea/Command placeholders use `placeholder:text-disabled-foreground`. That is **4.46:1** on `container` (white) and **3.87:1** on `control-background` (filled variant), both under 4.5:1.
    - These placeholder pairs are **not in `APCA_PAIRS`**, where `disabled-foreground` is checked only on `disabled`. So the APCA gate does not cover them either.
    - `muted-foreground-subtle` (incidental) is 3.24–3.42:1 and is used in `slider.tsx` and `date-picker.tsx`.
    - Passing pairs: `muted-foreground` on background 5.43:1, `error-foreground` on `error-background` 4.67:1, `focus-default` 9.67:1, `focus-error` 3.81:1 (≥3:1 non-text), `chart-categorical-1` 3.99:1 (≥3:1 non-text).
  - Dark theme: the muted and focus pairs are 7–12:1. Dark `foreground`/`background` is 14.0:1 yet only Lc ≈ 83, which illustrates APCA's dark-mode stance.

### Inferences (verdict per issue)
| Issue | Verdict | One-line reasoning |
| --- | --- | --- |
| "Contrast in default themes fails / is eyeballed" (the shadcn complaint) | **Holds up** | A CI gate across brands, surfaces and contrast settings is stronger than shadcn's unchecked defaults. The 2.4:1 50%-opacity ring complaint does not apply: Nexus focus is a solid outline at 9.67:1. |
| Dark-mode readability, where WCAG 2 overstates dark contrast | **Holds up** | APCA's least-disputed advantage. Nexus's dark body text clears Lc 75 where WCAG 2 alone would wave through weaker pairs. |
| Colour-blind distinctness | **Holds up** | It goes beyond what any surveyed library advertises. I found no peer comparison, so this is uncontested rather than validated. |
| APCA-only checking as compliance evidence (ADA Title II 2.1 AA, 508 2.0, EN 301 549 2.1 AA, VPAT 2.5 vs 2.2) | **Doesn't** | No regulator accepts APCA, and Roselli and Eggert say not to rely on it alone. The default theme ships WCAG 2 failures: success/warning badges at 3.35:1 and 3.96:1, placeholders at 4.46:1 and 3.87:1. |
| axe `color-contrast` disabled in Storybook | **Doesn't** | It hides exactly what a buyer's axe or Lighthouse scan will flag. Consumers will see "Nexus fails contrast" reports the CI never shows. A dual gate (APCA tiers plus a WCAG 2 floor) would close this. |
| "Contrast is checked, not eyeballed" marketing | **Partly** | True as stated, but it invites the APCA-instead-of-WCAG 2 reading that Roselli calls legally risky. It needs "checked against APCA; WCAG 2 status: …" next to it. |
| Placeholder/disabled text coverage | **Doesn't** | Placeholder-on-input pairs are outside `APCA_PAIRS`, so the "every pair is gated" claim has a hole exactly where the shadcn audit found failures. |
| Honour `prefers-reduced-motion` by default | **Doesn't** (practitioner bar); **partly** (letter of AAA 2.3.3) | The OS signal is banned and the toggle defaults off. A vestibular user sees motion until a host app exposes and they find the toggle. Mantine-style peers honour the OS signal by default. |
| WCAG 2.2.2 (Level A) pause/stop for auto-moving content | **Partly / unverified** | The toggle kills animations globally when on. I did not check whether any auto-advancing component (carousel, marquee, toast timers) has its own pause control. |
| Forced colors: focus visibility | **Holds up** | Outline-based focus rings survive forced colors. This is the main criticised failure in Tailwind ring and shadcn setups. |
| Forced colors: other components | **Partly** | Switch, Checkbox, Radio and Slider have borders, which survive. Progress has no border, so its fill likely vanishes. The ban on `@media (forced-colors)` rules out the standard fixes beyond transparent-outline/border tricks, and there are no forced-colors stories. This is untested inference. |
| ARIA/keyboard gaps (shadcn Combobox, Data Table, etc.) | **Partly / unverified** | Radix primitives plus axe on every story address most ARIA and keyboard issues. I did not audit Nexus's Combobox or Data Table equivalents against the shadcn audit's specific findings. |
| Publishing an ACR/VPAT for the library | **Doesn't** | There is no ACR, and almost no component vendor publishes one. Without a WCAG 2 contrast check, Nexus could not truthfully complete the 1.4.3/1.4.11 rows today. |

### Gaps
- My WCAG 2 numbers cover only the default brand in `nexus.css`. CI-derived brand, surface and contrast combinations could do better or worse. Running WCAG 2 ratios inside the existing CI matrix would answer this.
- I did not test Nexus in an actual forced-colors or Windows Contrast Theme session, and I did not inspect SVG icons for `currentColor`.
- I did not verify whether `tw-animate-css` (used for enter/exit animations) honours reduced motion on its own. `node_modules` is not installed in this checkout.
