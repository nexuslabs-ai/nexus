# Incremental adoption, two-systems-on-one-page, and Tailwind prefix ergonomics

Scope note: research date 2026-10-20. Sources are mostly GitHub issues and discussions, official docs, and dev.to/Medium write-ups. Reddit and Hacker News did not show up in search: `site:reddit.com` returned no threads, and one Reddit mirror returned 502. Reddit-flavoured evidence below comes only from search snippets and is marked. Items marked **[older]** predate 2024. Items marked **[snippet]** come from search-result summaries, not a page I read. Items marked **[recurring]** turned up in 3+ independent sources. **[one-off]** means a single report.

## 1. What breaks when two UI systems coexist on one page

### Takeaway
The most reported breakage is Tailwind's Preflight reset overriding another library's element styles: transparent MUI/AntD buttons, Material icon misalignment, and resets leaking out of micro-frontends. Next come cascade-order fights with runtime CSS-in-JS (Emotion injects after Tailwind) and overlay problems: portal z-index and focus traps fighting across libraries. Dark-mode sync and duplicated toasts appear in docs and examples but drew almost no public complaints I could find.

### Cited Findings

**Preflight / reset clobbering [recurring]**
- Tailwind Discussion #11290 (May 25, 2023, **[older]** but still the canonical thread). MUI inside a Tailwind template: "when I tried adding a button I get the transparent button." Disabling Preflight "breaks the template's layout." The top answer (Dec 7, 2023) disables Preflight, sets `important: "#__next"`, and copies Preflight minus the `button` rules into a custom reset. It has 8 votes and 👍9 🎉4 🚀5, and no Tailwind maintainer replied. — [tailwindlabs/tailwindcss#11290](https://github.com/tailwindlabs/tailwindcss/discussions/11290)
- MUI issue #44333 (Nov 6, 2024). Next.js 14 + MUI, planning a Tailwind/shadcn migration: "Everything was fine until we discovered a conflict of styles." Turning Preflight off "seems to solve conflicts, but then the styles with tailwind crash." The reporter asked: "I will have to put the prefix tv on each style?" They self-resolved with "Using @tailwind base only for some components." No maintainer reply. — [mui/material-ui#44333](https://github.com/mui/material-ui/issues/44333)
- Ant Design: Preflight sets `background-color: transparent` on buttons, so AntD Modal footer buttons lose their blue fill. The fixes offered are AntD `StyleProvider hashPriority='high'` or disabling Preflight. **[snippet, undated]** — [dev.to/fabiobiondi](https://dev.to/fabiobiondi/react-antd-and-tailwind-fix-css-conflicts-5542). A whole npm package, `postcss-style-fixes`, exists to rewrite Preflight's button rule so it skips `.ant*` elements. — [npm postcss-style-fixes](https://npmjs.com/package/postcss-style-fixes)
- Semi Design's docs make the same point: when Tailwind's styles have higher priority, Preflight overrides the library's button background. **[snippet]** — [semi.design](https://semi.design/en-US/start/tailwind)
- Angular Material: angular/components #31304 reports that Preflight's button resets (letter-spacing) break `<mat-icon>` centering in `mat-icon-button`. The workaround is `display:block` on `.mdc-icon-button .mat-icon`. **[snippet]** — [angular/components#31304](https://github.com/angular/components/issues/31304)
- Tailwind lowered Preflight's button selector specificity in Jan 2024 (PR #12735). Maintainers said the next major would use real cascade layers, "making rule specificity in Preflight irrelevant." **[snippet]** — [tailwindcss PR #12735](https://redirect.github.com/tailwindlabs/tailwindcss/pull/12735)
- A troubleshooting guide (Apr 2, 2026): Preflight "resets all browser default styles, and MUI's styles get reset too". Disabling it means "Tailwind's styles are also affected." **[snippet]** — [eastondev.com](https://eastondev.com/blog/en/posts/dev/20260402-shadcn-ui-troubleshooting/)
- A Bryntum guide needs `!important` overrides "because Preflight targets all img elements." **[snippet]** — [bryntum.com](https://bryntum.com/blog/using-bryntum-with-tailwind-css-shadcn-ui-and-material-ui/)
- A community plugin exists only to scope Preflight to a selector: `tailwindcss-scoped-preflight`. — [GitHub Roman86/tailwindcss-scoped-preflight](https://github.com/Roman86/tailwindcss-scoped-preflight)

**Micro-frontend bleed in both directions [recurring]**
- Tailwind Discussion #19578 (Jan 19, 2026). The poster quotes:
  - "My MFE's Tailwind `Preflight` (reset) is leaking out."
  - "Tailwind resets `button` styles globally, which strips the styling from the Laravel host's buttons."
  - Inbound: "The Laravel host has aggressive global styles (e.g., `div { border: none; }` or specific `h1` styles)."
  - Shadow DOM is ruled out: "We cannot use Shadow DOM because we rely on several external libraries" (their popups and modals break).
  - The codebase has 500+ files, so renaming classes by hand was rejected.

  The only reply (Feb 3, 2026) suggests turning off Preflight, adding an `important` root selector, wrapping the import in `@layer mfe { @import "tailwindcss"; }`, or adding a prefix. Engagement is low (1 vote each). — [tailwindlabs/tailwindcss#19578](https://github.com/tailwindlabs/tailwindcss/discussions/19578)
- "Tailwind in Micro-Frontends" advises keeping Preflight in the shell only, prefixing remotes, and turning Preflight off in remotes. It notes Shadow-DOM remotes don't inherit document CSS variables, so tokens must be re-injected. **[snippet]** — [dev.to/asmaa-almadhoun](https://dev.to/asmaa-almadhoun/tailwind-in-micro-frontends-5512)
- A Tailwind v4 issue (Discussion #16046, Jul 7, 2025): t0dorakis wants a prefix because of "micro-frontend scoping issues across Tailwind versions." — [tailwindlabs/tailwindcss#16046](https://github.com/tailwindlabs/tailwindcss/discussions/16046)

**Specificity / injection-order wars with runtime CSS-in-JS [recurring]**
- MUI's official Tailwind v4 guide requires `enableCssLayer` on the Emotion cache plus `@layer theme, base, mui, components, utilities;`. Its troubleshooting reads: "If Tailwind classes don't override Material UI, confirm you're on Tailwind v4 or later. Also check in DevTools that the `mui` layer comes before `utilities`." Interior slots need `slotProps.{slot}.className`. VS Code IntelliSense needs an extra `classRegex` to see those classes. — [mui.com Tailwind v4 integration](https://mui.com/material-ui/integrations/tailwindcss/tailwindcss-v4/)
- An undated guide says Emotion injects at runtime after Tailwind, so MUI overrides utilities. It recommends `StyledEngineProvider injectFirst`. **[snippet]** — [codestudy.net](https://www.codestudy.net/blog/can-i-use-tailwind-css-and-material-ui-in-the-same-next-js-project/)
- Per MDN, "Styles that are not defined in a layer always override styles declared in named and anonymous layers." For normal declarations, everything inside a layer loses to unlayered declarations. — [MDN @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

**Overlays: z-index/portal stacking and focus traps across libraries [recurring for focus traps; z-index mostly intra-Radix]**
- MUI TrapFocus: "focusable elements within its React hierarchy but outside its DOM hierarchy (e.g. inside of a Popper or a portal) can't be focused". This is the mechanism by which an MUI Dialog blocks a foreign library's portaled popover. **[snippet of a mirrored MUI issue]** — [lightrun mirror of mui issue](https://lightrun.com/answers/mui-material-ui-trapfocus-steals-focus-from-nested-portal)
- The same class of bug shows up elsewhere:
  - Bootstrap modal + select2: "the modal outer component steals it away." **[older]** — [twbs/bootstrap#19971](https://github.com/twbs/bootstrap/issues/19971)
  - Mobiscroll's fix is to render the popup inside the modal "so there will be no war for the focus." **[snippet]** — [forum.mobiscroll.com](https://forum.mobiscroll.com/t/add-edit-event-popup-does-not-let-you-type-in-input-fields-when-calendar-initialized-in-bootstrap-modal/1195)
- Radix-family stacking:
  - "Z-index issues when combining Dialog.Portal with Popover, Dropdown." — [radix-ui/primitives#1317](https://github.com/radix-ui/primitives/issues/1317)
  - Base UI components inside a Radix Dialog stack behind its overlay. Radix sets `pointer-events:none` on body, so the foreign popup isn't clickable. **[snippet]** — [mui/base-ui#2854](https://github.com/mui/base-ui/issues/2854)
  - Duplicate `@radix-ui/react-focus-scope` copies break nested focus. **[snippet]** — [radix-ui/primitives#2815](https://github.com/radix-ui/primitives/issues/2815); [Medium: Radix version mismatch](https://medium.com/@sibteali786/how-i-fixed-the-multiselect-not-working-inside-dialog-a-radix-ui-version-mismatch-3158104d994a)
- MUI→shadcn post-mortem, "7 pitfalls" (Ashish Patel; dated Aug 8, year not shown):
  - "With Radix, focus landed on the dialog body and stayed there."
  - A Select inside a Dialog "scrolled the page underneath it" because of a stray `transform`.
  - A React 19 StrictMode double-mount crashed a third-party portal.
  - Radix exit animations were swallowed on route unmount.
  - MUI Drawer ≠ shadcn Drawer ("`Drawer` is for mobile-first bottom sheets").
  — [dev.to/ashishxcode](https://dev.to/ashishxcode/mui-to-shadcn-7-pitfalls-we-hit-and-the-fix-for-each-3eh)

**Two versions of the same system on one page [recurring for Chakra]**
- Chakra v2 + v3 with two providers: "the ones from v3 don't - they come with no styles at all" (hardfi, May 12, 2025). — [chakra-ui#9853](https://github.com/chakra-ui/chakra-ui/discussions/9853)
- Chakra v3 and Emotion's `css` prop can't be used together (anilanar, Dec 16, 2024). Package aliasing "really screws things up" because of shared `@chakra-ui` utilities (spjpgrd, Apr 5, 2025). — [chakra-ui#9184](https://github.com/chakra-ui/chakra-ui/discussions/9184)
- Tailwind v3 + v4 in one build: a v3 dependency pulled in by the typography plugin caused a deploy failure through "conflicting PostCSS transforms, duplicate utility generation." **[snippet, one-off]** — [dev.to/wishot_cipher](https://dev.to/wishot_cipher/the-hidden-pitfall-mixing-tailwind-css-v3-and-v4-in-production-3m4i)

**Bundle size**
- After the MUI→shadcn move: "Some routes lost 90KB+ of MUI internals." — [dev.to/ashishxcode](https://dev.to/ashishxcode/mui-to-shadcn-7-pitfalls-we-hit-and-the-fix-for-each-3eh)
- Running Bootstrap + Tailwind together is "not recommended for production due to class conflicts and bundle bloat." **[snippet]** — [srafsan.hashnode.dev](https://srafsan.hashnode.dev/why-you-should-avoid-using-bootstrap-and-tailwind-css-together-on-the-same-project)

### Inferences
- The fixes people reach for (scoped Preflight, `important: '#root'`, a hand-copied reset without button rules, a prefix, `@layer` wrapping) all try to make one system emit nothing outside its own namespace. That is a strong signal that "namespaced output, no global reset" is the property teams actually want.
- Focus-trap conflicts come from the architecture: each library's trap treats the other's body-level portal as "outside". Every documented fix either renders the popup inside the modal's DOM (`disablePortal` / `container`) or turns off the trap.

### Gaps
- **Dark-mode class conflicts between libraries.** I found no public complaint threads, only generic Tailwind `.dark` setup guides ([themewagon](https://themewagon.com/blog/dark-mode-ui-in-tailwind-css-and-mui/)). I did not verify MUI's `colorSchemeSelector` behaviour from MUI docs.
- **Duplicated toasts** (two toast systems, two stacks). I found no public complaint threads.
- **Reddit/HN sentiment.** It could not be gathered directly because search returned no Reddit threads and HN threads weren't surfaced.

## 2. How teams migrate page by page, and what they wish existed

### Takeaway
Teams run old and new side by side. They migrate leaf components first, then pages. They contain the new system's CSS with scoping tricks. Several build a theme bridge so old and new read from the same tokens. The loudest wish is a supported coexistence path: Chakra users explicitly leave over its absence. Second is visual and token parity during the transition, which teams currently hand-build.

### Cited Findings
- Theme bridge, built by hand: in Ashish Patel's MUI→shadcn migration, "Theme tokens didn't map 1:1" (spacing, shadows, color state). They added a bridge: "This let us migrate components incrementally without touching every consumer of `theme.palette` in one go." They also built a wrapper, `<CxSelect/>`, and kept react-select for hard cases: "A consistent design system has 95% coverage and a clear escape hatch." — [dev.to/ashishxcode](https://dev.to/ashishxcode/mui-to-shadcn-7-pitfalls-we-hit-and-the-fix-for-each-3eh)
- Scoping the new system during migration:
  - A case study used Tailwind's `important` with an app-root selector "to prevent Tailwind from affecting MUI components during migration." It chose "an incremental, page-by-page migration that kept the application deployable." **[snippet]** — [metadesignsolutions.com](https://metadesignsolutions.com/blog/migrating-react-app-from-mui-to-shadcn-ui-design-system-case-study)
  - A Brazilian MUI→Tailwind+shadcn PR applied Preflight scoped to `.tw` on migrated subtrees only. **[snippet]** — [Business-Docs-AI/frontend_bDocsAi#5](https://github.com/Business-Docs-AI/frontend_bDocsAi/pull/5)
- Open-source projects tracking MUI→shadcn (and Emotion→Tailwind) as multi-step plans (titles only):
  - [coder/coder#18993](https://github.com/coder/coder/issues/18993)
  - [opentargets#4537](https://github.com/opentargets/issues/issues/4537)
  - [RedditHarbor#177 "Incremental migration from MUI to shadcn/ui"](https://github.com/socius-org/RedditHarbor/issues/177)
- Bootstrap→Tailwind playbooks run both frameworks in parallel, migrating page by page:
  - Prefix Tailwind. Bootstrap's own classes can't be prefixed.
  - Start with tokens (brand colors, radii, font scale) "so the visual identity carries over."
  - Replace Bootstrap JS widgets with Headless UI/Radix.
  - Remove Bootstrap and the prefix at the end.

  **[snippet]** — [omid.dev (May 22, 2024)](https://omid.dev/2024/05/22/migrate-css-bootstrap-to-tailwind/); [st6.io part 2](https://st6.io/blog/migrating-from-bootstrap-to-tailwind-part-2/); [dev.to/kachkolasa](https://dev.to/kachkolasa/how-to-use-tailwindcss-bootstrap-in-the-same-project-5ho)
- Wish for gradual adoption (Chakra):
  - noidar's team picked MUI because it "supports gradual adoption" (Jun 9, 2025).
  - strongpauly: "Without a gradual upgrade path I imagine either never upgrading or migrating to a different library" (Oct 3, 2025).
  - rjmccluskey's team is weighing "migrating to a new library without a supported path to incremental adoption of v3" (Oct 30, 2025).

  — [chakra-ui#9853](https://github.com/chakra-ui/chakra-ui/discussions/9853)
- Wish for incremental prefix migration (Tailwind):
  - Bitwarden (willmartian, Mar 17, 2026) asked whether a configurable prefix "would allow us to tackle the migration incrementally?"
  - GitLab has "20,000+ CSS classes with a `gl-` prefix" that can't be migrated in one MR (Jun 19, 2026).

  — [tailwindlabs/tailwindcss#16046](https://github.com/tailwindlabs/tailwindcss/discussions/16046)
- Vendors are productizing progressive migration. shadcn's skill for its Radix→Base UI move: "migrate one component at a time while your project stays green. Stop halfway, ship, come back next week." (undated X post) — [x.com/shadcn](https://x.com/shadcn/status/2073021599167488153)
- MUI v4→v5 (**[older]** context): the official path keeps the deprecated JSS `@mui/styles` while you upgrade and migrates styles later. The codemod to `styled` "increases the CSS specificity." **[snippet]** — [mui.com migrating-from-jss](https://mui.com/material-ui/migration/migrating-from-jss/)
- Advice from one post-mortem: freeze concurrent migrations (UI library, React version, monorepo) "for two weeks while the others stabilize." **[snippet; I could not confirm which of the MUI→shadcn write-ups it came from]**

### Inferences
- "Visual parity while both are live" is solved today by hand-written bridges: theme objects mapped to CSS variables, or wrapper components. No library ships a bridge that would make an old MUI page and a new page look like one product. This is an open need.
- Teams value "the app stays deployable at every step" above speed. A system that can be dropped in without touching host styles fits this workflow directly.

### Gaps
- No quantitative data on how long page-by-page migrations take, or how often they stall.
- No public tool that maps MUI theme tokens ↔ Tailwind/shadcn tokens automatically. I didn't find one, which is different from proving none exists.

## 3. Chakra v2→v3, MUI major versions, and runtime CSS-in-JS / RSC pressure

### Takeaway
Chakra v3 is a rewrite with no supported coexistence. Users report incomplete docs, silent prop behaviour changes, and a stated intent to leave, some for shadcn. MUI users are frustrated that Pigment CSS, the RSC-compatible zero-runtime engine, stalled ("on hold") while v7 kept Emotion. With styled-components in maintenance mode (Mar 2025), this is pushing greenfield work toward Tailwind/shadcn.

### Cited Findings

**Chakra v2→v3 [recurring]**
- Discussion #9853 (opened Mar 27, 2025; 👍12). The question calls migration "a tremendous amount of work" with "numerous hidden issues." The maintainer answer (Aug 22, 2026) reads: "We do not support a gradual v2 plus v3 install. Migrate fully to v3. v2 is in maintenance." IvanCoronado (👍7): "It's easier migrate from Chakra v2 to shadcn than v3." — [chakra-ui#9853](https://github.com/chakra-ui/chakra-ui/discussions/9853)
- Discussion #9184 (Nov 17, 2024): "How to upgrade to v3 incrementally?" Top reply (8 votes): "You can't." Their team postponed because of "the many breaking changes and different ways of doing things." Another commenter: "it's too much work for the team." — [chakra-ui#9184](https://github.com/chakra-ui/chakra-ui/discussions/9184)
- The migration guide "is not complete," with component names and structures changed and no codemods. **[snippet]** — [dev.to/theoforger](https://dev.to/theoforger/sprint-5-chakra-ui-v3-migration-4pfi)
- Silent breakages found in a migration PR. **[snippet]** — [attendanceTracker_FE PR #85](https://github.com/chineduknight/attendanceTracker_FE/pull/85)
  - `colorScheme` is read as the CSS `color-scheme` property, so the palette is silently dropped.
  - Menu items ignore `icon`.
- Counterpoint: a 2024 feedback thread includes a user "overall just so happy with it" after updating. — [chakra-ui#8518](https://github.com/chakra-ui/chakra-ui/discussions/8518)

**MUI styling direction / Pigment CSS [recurring]**
- MUI issue #45759 (Mar 30, 2025, still open with a label added Apr 16, 2026):
  - "The whole pigment css saga has been disappointing"
  - v7 "is still sticking with emotion"
  - "no proper release / upgrade path yet"
  - Asks whether Pigment is "THE future at MUI?" given React 19, RSCs, shadcn and Tailwind.

  Maintainer oliviertassinari (Mar 31, 2025):
  - Pigment is "currently experimental" and has slow builds, unstable Next.js/Vite integration, and no story for other bundlers.
  - "it feels like we would need a miracle to fix 1., 2., 3. soon enough"
  - "we have to let go of the 'no breaking changes' constraint"
  - Raw CSS output is "also now on the table."

  Users in the thread:
  - aarjithn: "Shadcn + Tailwind sort of becoming defacto standard," and "every app looks shadcn."
  - JanStevens: they can no longer justify MUI for greenfield.
  - francescovenica: Pigment gave faster builds but worse stability.
  - shorn (👍12): don't forget users who "don't need RSC."

  — [mui/material-ui#45759](https://github.com/mui/material-ui/issues/45759)
- The Pigment CSS repo is labelled "Alpha phase, currently, on hold." — [github.com/mui/pigment-css](https://github.com/mui/pigment-css). MUI's migration doc says it "is currently in the early alpha stage" and that Emotion remains the default engine. — [mui.com migrating-to-pigment-css](https://mui.com/material-ui/migration/migrating-to-pigment-css/)
- MUI's 2024 launch messaging pitched Pigment as RSC-compatible. — [MUI on X, Sep 2024](https://x.com/MUI_hq/status/1833938382231380241); [Material UI v6 blog](https://mui.com/blog/material-ui-v6-is-out/)

**styled-components / CSS-in-JS deprecation pressure [recurring]**
- styled-components entered maintenance mode Mar 17, 2025. The maintainer cancelled recurring donation tiers and said he no longer runs it in his own larger production apps. It doesn't work in React Server Components without `'use client'`. **[secondary sources]** — [buildmvpfast.com](https://www.buildmvpfast.com/blog/styled-components-maintenance-css-in-js-migration-2026); [Sanity engineering](https://www.sanity.io/blog/cut-styled-components-into-pieces-this-is-our-last-resort)
- Conflicting signal: a maintainer reply in GitHub discussion #5657 says the project is "not abandonware" and is seeking co-maintainers. **[snippet]** — [styled-components#5657](https://github.com/orgs/styled-components/discussions/5657)
- A 2026 guide claims "CSS-in-JS isn't dead — but the runtime model is." Its download figures are unverified and vendor-ish. — [pkgpulse](https://www.pkgpulse.com/guides/state-of-css-in-js-2026)
- HackerNoon moved from styled-components to Tailwind one component at a time, with AI tooling. **[snippet]** — [hackernoon](https://hackernoon.com/from-styled-components-to-tailwind-css-a-hackernoon-migration-story)
- A Reddit r/reactjs thread from Mar 28, 2025 exists. The snippet quote is "if styled-componetns died you were just writing CSS the whole time." **[snippet; page 502'd]** — [redlib mirror](https://redlib.hbubli.cc/r/reactjs/s/JjuYZJINkh)

### Inferences
- Upgrade-forced rewrites (Chakra v3) and stalled engine roadmaps (MUI Pigment) are pushing some teams to a copy-and-own Tailwind system they control. That is the shadcn pitch. Their remaining problem is getting there incrementally from a live MUI/Chakra app.
- RSC pressure is specifically about runtime style injection. Any static-CSS system avoids it. Radix-based interactive components still need `'use client'` anyway.

### Gaps
- No survey data quantifying how many teams left Chakra/MUI over these issues; evidence is thread-level.
- I did not find MUI v6→v7 or v7→v9 migration complaint threads beyond #45759.

## 4. Tailwind `prefix` complaints and class-name ergonomics

### Takeaway
Tailwind v4 moved the prefix into variant position: `tw:hover:bg-x`, no longer `tw-bg-x`. Users call it harder to read. Large enterprise codebases (GitLab, Bitwarden) say it blocks or stalls their v4 upgrade, and the maintainers' only reply was a clarifying question. Merge tooling (tailwind-merge) needs explicit configuration for prefixes and custom token names. Long class strings ("class soup") are a recurring readability complaint. I found almost no direct discussion of long semantic token names specifically.

### Cited Findings
- Discussion #15807 (Jan 24, 2025):
  - "That is a significant change to roll through the code base..."
  - "burned 2 hours until I found this discussion" (👍4), because prefix was missing from the v4 docs.
  - chriswoodie (Feb 7, 2025): "I don't like this change." The prefix now looks like a modifier, which is "confusing, harder to read and lessens the usability of it." Asked "What was the reasoning?" No answer.
  - Collaborator wongjn: "Prefixes work a little differently than in v3," with the example `tw:flex tw:bg-red-500 tw:hover:bg-red-600`.

  — [tailwindlabs/tailwindcss#15807](https://github.com/tailwindlabs/tailwindcss/discussions/15807)
- Discussion #16046 (Jan 30, 2025 → Oct 13, 2026; 25 votes on the OP):
  - OP: "the readability of the 'tw:' is worse than the 'tw-' prefix."
  - phegman (GitLab, Aug 12, 2025; 31 votes, 👍18 ❤️9): the change is a "bummer." Later, GitLab is still on v3 with "20,000+ CSS classes with a `gl-` prefix."
  - Bitwarden is considering staying on v3.
  - gianluca-vedovato-24 (Jul 14, 2026): "Upgrading to v4 is currently a blocker for us."
  - ethan2328 (Jul 16, 2026): the separator "introduces unnecessary friction for existing codebases." Configurability would "drastically increase v4 adoption rates for enterprise projects."
  - trongithust (Sep 17, 2026): "ridiculous."
  - Community member rozsazoltan: "The prefix became a variant starting from v4" (👎5).
  - Maintainer RobinMalfait (Jun 18, 2026) only asked: "What kind of issues are you running into right now?"
  - A third-party `tailwind-prefix-migrator` appeared (Oct 13, 2026).

  — [tailwindlabs/tailwindcss#16046](https://github.com/tailwindlabs/tailwindcss/discussions/16046)
- Related v4 prefix friction threads (titles only): custom-variant + prefix issue [#17062](https://github.com/tailwindlabs/tailwindcss/discussions/17062); prefix + `@source` [#16460](https://github.com/tailwindlabs/tailwindcss/discussions/16460); prefix via Play CDN [#15749](https://github.com/tailwindlabs/tailwindcss/discussions/15749).
- tailwind-merge (v2 docs):
  - "If you're using Tailwind CSS without any extra config, you can use twMerge right away."
  - "If you're using a custom Tailwind config, you may need to configure tailwind-merge as well to merge classes properly."
  - Its no-config conditions include "Only using color names which don't clash with other Tailwind class names."
  - The prefix is a separate config key.

  — [tailwind-merge configuration (v2.0.0)](https://github.com/dcastil/tailwind-merge/blob/v2.0.0/docs/configuration.md). Nuxt UI likewise tells users to extend tailwind-merge for custom theme values. **[snippet]** — [ui2.nuxt.com theming](https://ui2.nuxt.com/getting-started/theming)
- IntelliSense in v4 must be pointed at the CSS entry file, and monorepos "often" go undetected. **[snippet]** — [technetexperts](https://www.technetexperts.com/tailwind-intellisense-v4-issue-fix/amp/). MUI's docs need a custom `classRegex` for Tailwind classes in `slotProps`. — [mui.com Tailwind v4](https://mui.com/material-ui/integrations/tailwindcss/tailwindcss-v4/)
- shadcn supports `tailwind.prefix` in `components.json`. Removing it later meant hand-deleting every `tw-` prefix (2024). — [ui.shadcn.com components.json](https://ui.shadcn.com/docs/components-json); [shadcn-ui#2924](https://github.com/shadcn-ui/ui/discussions/2924)
- "Class soup" readability:
  - Algolia found a long prefixed class string "not easy to read." They built a tagged template literal that strips the prefix.
  - Reddit r/Angular2 (Feb 2025) snippet: elements with 25 classes, called "Tailwind soup."
  - eslint-plugin-readable-tailwind exists to break and sort long strings.

  **[mostly snippets]** — [Algolia engineering](https://www.algolia.com/blog/engineering/simplifying-tailwind-css-with-eslint-tools-tagged-template-literals-and-a-lot-more/); [r/Angular2 mirror](https://redlib.hackliberty.org/r/Angular2/comments/1izd4ko/your_thoughts_on_tailwind_css); [eslint-plugin-readable-tailwind](https://github.com/schoero/eslint-plugin-readable-tailwind/blob/main/README.md)
- Long names, for and against:
  - A critic says prefixed classes make markup hard to scan. — [aleksandrhovhannisyan.com](https://www.aleksandrhovhannisyan.com/blog/why-i-dont-like-tailwind-css/)
  - A defender would rather read explicit names than guess what "paragraph-container" means. **[snippet]** — [dev.to/theranbrig](https://dev.to/theranbrig/tailwind-css-the-awesome-and-annoying-1dm4)

### Inferences
- The `tw:` complaints come mostly from teams who must prefix their **own** existing codebase: thousands of host classes. A library that prefixes only its own classes avoids that migration cost, but its contributors and copy-and-own consumers still pay the readability cost.
- A long semantic name plus a variant prefix (`nx:hover:bg-primary-background-hover`) compounds two things critics already dislike: class-string length and prefix-as-variant. No direct complaint about this exact pattern was found.

### Gaps
- No direct public sentiment found on long semantic token class names (e.g., shadcn's `bg-primary-foreground`, or role-suffixed names).
- No found report on IntelliSense behaviour with **two** Tailwind entries (one prefixed, one not) in one project.

## 5. Using shadcn/Tailwind inside a non-Tailwind app (MUI, Bootstrap, micro-frontends)

### Takeaway
The core problem is that adding Tailwind to a non-Tailwind app adds a global reset and an unlayered-vs-layered cascade fight with the host. shadcn components also assume Preflight. Fixes are a stack of partial workarounds: drop or scope Preflight, `important` root, `@layer`, prefix, `enableCssLayer`. Each has side effects. Bootstrap classes can't be prefixed, and Shadow DOM breaks third-party popups.

### Cited Findings
- MUI official: Tailwind v4 coexistence requires `enableCssLayer` and the explicit `@layer theme, base, mui, components, utilities;` order. — [mui.com Tailwind v4](https://mui.com/material-ui/integrations/tailwindcss/tailwindcss-v4/)
- MUI + Tailwind/shadcn conflicts. Turning Preflight off "seems to solve conflicts, but then the styles with tailwind crash" (Nov 2024). — [mui/material-ui#44333](https://github.com/mui/material-ui/issues/44333)
- Tailwind template + MUI buttons go transparent. The recommended fix is a hand-curated reset (2023, **[older]**). — [tailwindlabs/tailwindcss#11290](https://github.com/tailwindlabs/tailwindcss/discussions/11290)
- A Russian Habr Q&A commenter claims "mui does not work well with tailwind." **[snippet, opinion]** — [qna.habr.com](https://qna.habr.com/q/1364260)
- A troubleshooting guide warns that `shadcn init` overwrites the Tailwind config/globals, so back them up first. **[snippet; I could not confirm which of these two guides said it]** — [eastondev.com](https://eastondev.com/blog/en/posts/dev/20260402-shadcn-ui-troubleshooting/); [fixdevs.com](https://fixdevs.com/blog/shadcn-ui-not-working/)
- Bootstrap: utility names overlap and Bootstrap's classes can't be prefixed. Coexistence is treated as temporary. **[snippet]** — [srafsan.hashnode.dev](https://srafsan.hashnode.dev/why-you-should-avoid-using-bootstrap-and-tailwind-css-together-on-the-same-project); [dev.to/kachkolasa](https://dev.to/kachkolasa/how-to-use-tailwindcss-bootstrap-in-the-same-project-5ho)
- Micro-frontends: Preflight leaks out, and host globals (`div { border: none; }`) leak in. Shadow DOM is ruled out because "we rely on several external libraries" (Jan 2026). — [tailwindlabs/tailwindcss#19578](https://github.com/tailwindlabs/tailwindcss/discussions/19578)
- Cascade rule: unlayered declarations override all layered normal declarations. — [MDN @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

### Inferences
- Tailwind v4 places utilities in `@layer utilities`. So any unlayered host element rule that sets the same property wins over a utility on that element, whatever the specificity. This covers Bootstrap Reboot, Emotion-injected CssBaseline without `enableCssLayer`, and legacy global CSS. It is the "incoming bleed" the MFE poster describes. (Inference from MDN plus Tailwind v4's layered output. Not tested against a specific Bootstrap build.)

### Gaps
- No found write-up of shadcn inside Angular Material or inside an Ant Design v5 app specifically. AntD evidence is about Tailwind Preflight generally.

## Does Nexus answer these?

### Takeaway
Nexus answers the outbound side of coexistence head-on: no reset, nothing emitted outside `nx:` classes and `--nx-*` variables, CI-enforced, and 0 host style changes measured in its MUI and shadcn examples. It also answers the "can't adopt gradually" and runtime-CSS-in-JS/RSC complaints. It only partly answers overlay interop (z-index variables, plus manual `disablePortal`), inbound host bleed, and tooling. It doesn't answer visual parity or a theme bridge during migration, install friction, or the `tw:`-style readability complaint. Nexus actually leans into the variant-position prefix that users dislike.

### Cited Findings (Nexus facts from this repo)
- The theme CSS imports Tailwind's theme and utilities with `prefix(nx)` into `@layer theme` / `@layer utilities`, with no Preflight import. — `/home/user/nexus/packages/tailwind/nexus.css` (lines 10–12)
- A CI test fails on any rule that selects outside `nx:` classes or variable scopes, on any global declaration that isn't `--nx-*`, and on unprefixed keyframes other than Tailwind's and tw-animate-css's own. — `/home/user/nexus/packages/core/src/lib/generated-css-scope.test.ts`; `/home/user/nexus/.claude/rules/component-owned-styling.md`
- The examples report "Adding Nexus changes **0** of the host app's own styles" for `shadcn-app`, `mui-app`, `shadcn-package/app-via-package` and `app-direct`, measured by `scripts/check.mjs`. — `/home/user/nexus/examples/README.md`
- The MUI example raises Nexus layers to `--nx-z-index-modal: 1600; --nx-z-index-popover: 1700; --nx-z-index-toast: 1800`. MUI popups inside a Nexus dialog use `disablePortal` per component (Select `MenuProps`, Menu, Tooltip `popper`). A Nexus Select, Popover and DropdownMenu sit inside an MUI Dialog with no `disableEnforceFocus`. — `/home/user/nexus/examples/mui-app/src/nexus.css`; `/home/user/nexus/examples/mui-app/src/pages/OverlaysPage.tsx`
- Default layers are modal 50, popover 70 (above modal so nested popups work), toast 100, max 9999. — `/home/user/nexus/packages/core/tokens/semantic/z-index.json`
- MUI is set to `cssVariables: { colorSchemeSelector: 'class' }`, sharing `.dark`. The host still mounts `CssBaseline`, and the example sets no `enableCssLayer`. — `/home/user/nexus/examples/mui-app/src/main.tsx`
- Two Toasters (MUI Snackbar and Nexus sonner): "Each Toaster shows only its own system's toasts." — `/home/user/nexus/examples/README.md`; `/home/user/nexus/examples/mui-app/src/App.tsx`
- `cn()` ships tailwind-merge preconfigured with `prefix: 'nx'` plus hand-registered Nexus class groups. A test fails when a new `@utility` isn't registered. — `/home/user/nexus/packages/react/src/lib/utils.ts`; `/home/user/nexus/.claude/rules/component-owned-styling.md`
- Install is a manual copy; registry delivery is tracked in #798. Reduce-motion, cursor and font-smoothing toggles apply page-wide when a user turns them on. — `/home/user/nexus/examples/README.md`
- Every example host is on Tailwind `^4` (or has no Tailwind). No Tailwind v3 host is covered. — `/home/user/nexus/examples/*/package.json`

### Complaint-by-complaint mapping

| # | Complaint (source section) | Verdict | One-line reasoning |
|---|---|---|---|
| 1 | Preflight/reset clobbers host components (MUI/AntD transparent buttons, mat-icon misalignment) (§1, §5) | **Answers it** | Nexus ships no reset, a CI test blocks any non-`nx:` selector, and the MUI and shadcn examples measure 0 host style changes. The host must already have `box-sizing: border-box`. |
| 2 | MFE/library CSS leaks **out** into the host without Shadow DOM (#19578) | **Answers it** | Namespaced-only output is exactly the build-time isolation the #19578 poster asked for, with no Shadow DOM or class mangling. |
| 3 | Host global CSS bleeds **in** (`div{border:none}`, Bootstrap Reboot, CssBaseline) | **Partly** | Components reset their own element defaults with `nx:` classes. But those utilities sit in `@layer utilities`, so any unlayered host element rule on the same property still wins (MDN), and `check.mjs` measures only outbound changes. |
| 4 | Specificity / injection-order wars with Emotion | **Partly** | Nexus components never share an element with Emotion styles, so there is no fight by default. Putting `nx:` classes on MUI components still needs MUI's `enableCssLayer`, which the example doesn't set. |
| 5 | z-index / portal stacking between libraries (MUI 1300-range vs Radix) | **Partly → mostly** | Layers are `--nx-*` variables you raise above MUI, demonstrated at 1600–1800. Still a manual per-host step. |
| 6 | Focus traps fighting across libraries | **Partly** | The example shows MUI popups in a Nexus dialog working only via per-component `disablePortal`. Nexus popovers inside an MUI Dialog are demoed without `disableEnforceFocus`. I did not verify that MUI TrapFocus (documented to block out-of-DOM portals) leaves them usable. |
| 7 | Duplicated toasts | **Partly** | Two Toasters coexist without double-showing, but the app still has two toast stacks and two APIs. Nothing unifies them. |
| 8 | Dark-mode class conflicts | **Answers it (for class-based hosts)** | One `.dark` class drives both systems, and MUI is configured with `colorSchemeSelector: 'class'`. Hosts on `data-theme` or media-only dark mode must adapt. |
| 9 | Bundle size of two systems during migration | **Doesn't** | Coexistence means shipping both, plus a second Tailwind build, Radix and tw-animate-css. Copy-and-own trims only unused components. |
| 10 | Visual parity between old and new components during migration | **Doesn't** | Old and new share only `.dark`, not brand colors, radii or type, so migrated pages look different until the brand is re-themed by hand. |
| 11 | Theme bridge mapping one system's tokens to the other | **Doesn't** | No MUI-theme or shadcn-variable → `--nx-*` mapping ships. Teams like Ashish Patel's build this by hand today. |
| 12 | No supported gradual path (Chakra v2/v3 "no styles at all" with two providers) | **Answers it** | Nexus is built to sit beside any host system indefinitely, per component, with no shared provider or global CSS to conflict. |
| 13 | Major-version upgrade churn and silent prop changes (Chakra v3, MUI) | **Partly** | Copy-and-own means no forced upstream upgrade, but also no upstream fixes. Pulling later Nexus changes is a manual re-copy until the registry (#798) ships. |
| 14 | Runtime CSS-in-JS deprecated / not RSC-compatible (Pigment stalled, styled-components maintenance) | **Answers it** | Styling is static Tailwind CSS plus CVA with no runtime injection. Radix-based interactive components still need `'use client'`, as shadcn's do. |
| 15 | Tailwind v4 `tw:` prefix readability ("harder to read", "ridiculous") | **Doesn't** | Nexus requires exactly the variant-position prefix users dislike, on every class, and stacks long semantic names on it (`nx:hover:bg-primary-background-hover`). |
| 16 | Prefix migration cost for the host's own classes (GitLab 20k `gl-`, Bitwarden) | **Answers it** | Only Nexus's own classes carry `nx:`. The host keeps its unprefixed Tailwind (or none), so no host-wide rename is needed. |
| 17 | Merge tooling with prefixes and custom tokens (tailwind-merge config) | **Mostly answers** | `cn()` ships pre-configured for `nx` plus custom groups, with a test guarding registration. A host's own `cn` used on mixed classes would need separate config. |
| 18 | IntelliSense / editor tooling with prefixes and two Tailwind entries | **Unknown / likely partly** | Not documented or tested in the repo. Public reports show v4 IntelliSense needs entry-file config and struggles in monorepos. |
| 19 | shadcn components assume Preflight, so they break in a non-Tailwind host | **Answers it** | Each Nexus component neutralizes its own native element defaults. Storybook loads no Preflight, so a missing reset shows up there, and the MUI no-Tailwind example works. |
| 20 | Two Tailwind versions/builds in one app (v3 host + v4 library) | **Partly** | The two-build model is demonstrated only with Tailwind 4 hosts or a no-Tailwind host. A v3 host, the GitLab/Bitwarden case, is untested. |
| 21 | Install friction (`shadcn init` overwriting config, manual setup) | **Doesn't (yet)** | Install means hand-copying 7 CSS files, a provider folder, utils and per-component files. The registry/CLI is not shipped (#798). It does avoid overwriting host config. |
| 22 | Library styles affecting the whole page unexpectedly | **Mostly answers** | Off by default, but the reduce-motion, cursor and font-smoothing toggles hit the whole page when a user enables them. tw-animate-css keyframe names are unprefixed (allowed by the CI test). |

### Inferences
- Nexus's strongest positioning against this evidence: "add a design system to a live MUI/shadcn/Bootstrap app without touching a single host style." That speaks directly to the #11290, #44333, #19578, AntD and Angular Material threads, and to Chakra's no-gradual-path complaint.
- Its weakest points against the same evidence:
  - The migration *experience*: no visual parity, no theme bridge, manual install.
  - Ergonomics: the `nx:` variant prefix is the exact syntax drawing "harder to read" complaints in #15807 and #16046.
- Inbound bleed (#3) is a likely real-world failure for Bootstrap hosts (Reboot is unlayered) and MUI hosts without `enableCssLayer`. The current `check.mjs` measures only host changes, not Nexus components being changed by the host.

### Gaps
- I did not run the examples. Verdicts #6 (focus inside an MUI Dialog) and #3 (inbound bleed) rest on code reading plus MUI/MDN documentation, not observed behaviour.
- No Bootstrap host example exists in `examples/`, so Bootstrap coexistence is unverified.
