# One design system across many frameworks: complaints, approaches, and fit with Nexus

Research date: 2026-10-20. Sources from 2024–2026 unless marked **[older]**.

**Method and coverage caveat.** I couldn't load Reddit. WebSearch refuses reddit.com, and the Reddit JSON API returned HTTP 403. I didn't load X or LinkedIn either, and found no usable snippets from them. The developer voice below comes from Hacker News (pulled through the Algolia API with points and comment counts), GitHub issues (with reaction counts), vendor and DS-team docs and blogs, and one industry survey. Engagement numbers were captured on 2026-10-20.

---

## 1. How big is the real demand for one DS across frameworks, and who has it?

### Takeaway
The need is real but held by a minority. It sits mainly with public-sector design systems, large enterprises (IBM, Adobe, GitHub), teams that ship embeddable widgets, and apps in the middle of a framework migration. React dominates DS work (72%), but about a quarter to a third of DS practitioners also report Angular or web components. Discussion is steady and mid-volume, not a loud, viral demand.

### Cited Findings
- zeroheight's Design Systems Report 2026 (5th edition, n=147 practitioners) gives the web frameworks used: React 72%, web components 36%, Angular 28%, Vue 18%, Stencil 7%, Svelte 4%. Platforms are Web 94%, iOS 35%, Android 34%. For mobile, React Native is 42% (iOS) and 47% (Android). — [zeroheight Design Systems Report 2026](https://report.zeroheight.com/)
- In the same report, 48% maintain one DS for all products, 29% maintain "multiple, entirely different design systems", and 22% run a global parent system with child systems. — [zeroheight 2026](https://report.zeroheight.com/)
- DS teams in the same report are small. 28% have 1–2 people, 33% have 3–5, 25% have 6–10, and only about 14% have more than 10. The average team at companies with 5,000+ employees is 11 people. — [zeroheight 2026](https://report.zeroheight.com/)
- The Web Awesome Kickstarter (Shoelace relaunched as framework-agnostic web components) ran from Mar 26 to Apr 25, 2024 with a $30k goal. Snapshots show about $718k from 6,682 backers, and a later one shows $732,852 from 6,832 backers. It hit its goal in under two hours. — [Kicktraq](https://www.kicktraq.com/projects/fontawesome/web-awesome/); [BackerKit](https://www.backerkit.com/projects/fontawesome/web-awesome); [Font Awesome blog](https://blog.fontawesome.com/web-awesome-kickstarter/)
- HN engagement on framework-agnostic component libraries:
  - "Shoelace: A library of web components" (Jan 2024) had 294 points and 110 comments.
  - "Web awesome: 'Shoelace 3.0'" (Feb 2025) had 50 points and 18 comments.
  - "Web components are okay" (Nolan Lawson, Sep 2024) had 278 points and about 354 comments.
  - Piccalil's "Framework-agnostic design systems" (May 2026) had 2 points and 0 comments.
  - Mitosis "write once, run in React, Vue, Qwik, Solid, Angular, Svelte" (Jan 2026) had 4 points and 1 comment.
  - Sources: [HN 38942847](https://news.ycombinator.com/item?id=38942847), [HN 43092389](https://news.ycombinator.com/item?id=43092389), [HN 41686722](https://news.ycombinator.com/item?id=41686722), [HN 48225529](https://news.ycombinator.com/item?id=48225529), [HN 46817782](https://news.ycombinator.com/item?id=46817782)
- Public-sector systems that ship one core across frameworks:
  - The Government of Alberta builds its core as web components (written in Svelte, compiled to custom elements) with Angular and React wrappers on top. — [Alberta DS technologies](https://design.alberta.ca/get-started/developers/technologies)
  - Ontario ships one web-component package for HTML or any framework, plus an Angular package and a React package. — [Ontario DS](https://designsystem.ontario.ca/docs/documentation/develop/web-components.html)
  - Singapore GovTech's SGDS ships Lit web components with React wrappers. — [SGDS issue #899](https://github.com/GovTechSG/sgds-web-component/issues/899)
  - Hungary's DÁP documents Tailwind plus web components. — [DÁP styling](https://services.gov.hu/design-system-dev/styling)
- IBM Carbon calls `@carbon/react` and `@carbon/web-components` "two flagship offerings for the foreseeable future". In Sep 2024 it moved web components into the main monorepo "to synchronize more closely" with React. — [Carbon's commitment to Web Components, Anna Wen, Sep 2024 (via conffab mirror; Medium returned 403)](https://conffab.com/elsewhere/carbon-design-systems-commitment-to-web-components-by-anna-wen-_carbondesign-sep-2024-medium/)
- Carbon's docs still list Carbon React, Carbon Angular and Carbon Vue as "pure framework counterparts" whose APIs differ from the web components. — [Carbon web components docs](https://carbondesignsystem.com/developing/frameworks/web-components/)
- GitHub Primer splits across stacks. OpenProject, which consumes it, says some components exist only as Rails ViewComponents and others only in React. — [OpenProject DS glossary](https://community.openproject.org/projects/design-system/wiki/glossary?version=2)
- Use cases from practitioners on HN:
  - TalkJS is "betting our entire company" on web components "as a distribution mechanism". — [HN comment, skrebbel, Sep 2024](https://news.ycombinator.com/item?id=41687233)
  - Nolan Lawson: "Sometimes you just need to gradually migrate from Framework A to Framework B." — [Web components are okay, Sep 2024](https://nolanlawson.com/2024/09/28/web-components-are-okay/)
  - "good way to create small 'apps' ... embedded across multiple different websites ... Hard to see web components really competing with Vue/React for large apps." — [HN, crowcroft, Feb 2025](https://news.ycombinator.com/item?id=43093461)
- Advocacy for framework-agnostic DS:
  - Brad Frost: "Creating a technology dependency in order to achieve a specific UI style inherently limits where that UI can go. That might not be an issue if your design system only serves one or two applications that share the same technology stack." — [Brad Frost, Managing technology-agnostic design systems **[older, ~2019]**](https://v9.bradfrost.com/blog/post/managing-technology-agnostic-design-systems)
  - Scott Riley: "Baking framework lock-in into the equation at day one is absolutely baffling." He also notes that "'rewriting our React app in Solid/Svelte' is now a thing". — [Piccalil, 21 May 2026](https://piccalil.li/blog/framework-agnostic-design-systems-part-1/)

### Inferences
- The zeroheight framework shares sum to about 165%. That suggests many teams use more than one framework, but the report doesn't state that answers were multi-select or give a "supports N frameworks" figure. Treat "a large minority is multi-framework" as an inference.
- The demand clusters in four places:
  - Government and public-sector systems, with many vendors and many stacks.
  - Very large enterprises (IBM, Adobe, GitHub), which can fund several implementations.
  - Teams shipping embeddable widgets or SDKs.
  - Apps partway through a migration.
- Small product teams on a single React app rarely voice the need. The React share and the Web Awesome Kickstarter both suggest a real but secondary market: about $730k from about 6.8k backers is strong for an OSS kit, but small next to React-ecosystem adoption.
- On loudness: the topic produces recurring mid-sized HN debates every few months, mostly about web components in general. Threads specifically about "one DS across frameworks" (Piccalil, Mitosis) draw almost no engagement. The need is felt by DS leads, but it's niche as a public conversation.

### Gaps
- I found no sourced data on post-acquisition stack mixing (for example "we acquired a company on Angular"). The brief names it as a likely driver, but no 2024–2026 source I found states it.
- I couldn't access r/DesignSystems, r/Angular2 or r/webdev. Those subreddits likely hold "we have React and Angular apps, what do we do?" threads, but I can't quote or count them.
- I found no survey figure for "% of DS teams supporting 2+ frameworks". zeroheight gives only per-framework shares.
- I didn't find or verify Salesforce or Microsoft Fluent multi-framework strategy material this session.

---

## 2. Complaints about web components in React and Next.js (SSR, forms, shadow DOM styling, React 19, events, FOUC)

### Takeaway
SSR and hydration is the most persistent and best-documented complaint. Even web-component vendors (Ionic/Stencil) call it "one of the biggest barriers". It still produces layout shift in Next.js in October 2026. React 19 fixed property and event interop on the client, but SSR drops non-primitive props, and wrappers, typings and Next.js special-casing remain. Shadow DOM breaks Tailwind-style utility theming, and form participation needs per-component plumbing.

### Cited Findings
**SSR, hydration and layout shift (recurring, strongest signal)**
- From the Stencil team (Ionic, Jun 25, 2025):
  - "The inability to elegantly handle SSR remains one of the biggest barriers to Web Components adoption."
  - "servers don't speak Shadow DOM"
  - The compiler approach is "Still prone to occasional hydration mismatches".
  - The runtime approach needs "dual component wrappers (client + server)", and "Complex children (multiple server components) can fail".
  - Styles repeat per instance: a button used 50 times means "the same styles repeated 50 times".
  - "The overhead, complexity, and edge cases mean that for many applications, traditional framework components still make more sense."
  - Source: [Ionic blog](https://ionic.io/blog/the-quest-for-ssr-with-web-components-a-stencil-developers-journey)
- Singapore GovTech SGDS, opened Oct 15, 2026:
  - "SGDS web components cause Cumulative Layout Shift (CLS ~0.23) in Next.js" because "the browser renders empty custom element shells, then Lit upgrades them with shadow DOM".
  - The fix, `@lit-labs/nextjs`, needs a webpack plugin that patches React internals, "Does not work with Turbopack", and is a Lit Labs experiment that "may receive breaking changes or stop being supported".
  - Measured CLS was 0 with the plugin (production webpack), 0.18 without it, and 0.25 in Turbopack dev.
  - Source: [GitHub issue #899](https://github.com/GovTechSG/sgds-web-component/issues/899)
- Declarative shadow DOM in a Next.js server component **[older, 2023]**: the browser strips the `<template>` before React hydrates, which causes hydration failures. — [vercel/next.js discussion #51717](https://github.com/vercel/next.js/discussions/51717)
- On the Shoelace HN thread (Jan 2024), one developer wrote: "it completely relies on client side rendering ... With disabled Javascript it doesn't show anything at all. ... Even the CSS-in-JS based libraries (like React MUI) allow SSR to some extent." — [HN, andix](https://news.ycombinator.com/item?id=38958929). The "impossible" claim is outdated now that Declarative Shadow DOM exists, but the perception persists.
- Ryan Carniato (SolidJS) wrote on Sep 26, 2024 (123 comments on dev.to):
  - Web components are "a DOM interface in a place with no DOM", so SSR needs wrapper overhead.
  - Upgrade timing is "DOM-based lifecycles that can trigger synchronously or asynchronously depending on when they upgrade", which breaks reactivity and Context.
  - Shadow DOM event retargeting interferes with event delegation and partial hydration.
  - "It's a hidden tax that impacts everyone."
  - Source: [Web Components Are Not the Future](https://dev.to/ryansolid/web-components-are-not-the-future-48bh)
- Pro-web-component voices concede the point. Nolan Lawson: "Web components are bad at a lot of things – Server-Side Rendering, accessibility, even interop in some cases." He also says "maybe you shouldn't build your entire UI out of web components, with shadow DOM and the whole kit-n-kaboodle." — [nolanlawson.com, Sep 28, 2024](https://nolanlawson.com/2024/09/28/web-components-are-okay/)
- On HN: "Web Components have some nice features, some bad features, and no killer feature. Developers have mostly chosen to ignore them for other approaches (React, Vue) where there are better ergonomics and stronger network effects." — [HN, pfraze, Sep 2024](https://news.ycombinator.com/item?id=41688576)

**React 19 custom-element support (partly solved)**
- React 19 (Dec 2024) passes all Custom Elements Everywhere tests. On the client, props become properties when the element has a matching property.
- During SSR, only primitive props render as attributes. Objects, functions, symbols and `false` are omitted from server HTML, so data-heavy components get their data only after hydration.
- Sources: React 19 release notes, reposted at [bradfrost.com link post](https://bradfrost.com/blog/link/react-v19-react/) and [conffab](https://conffab.com/elsewhere/react-19-beta-react/)
- Primer.io's checkout SDK migration guide (a payments company, not GitHub Primer) says:
  - React 19 fixed object props but not attribute naming. camelCase props are lowercased when they fall back to attributes.
  - TypeScript doesn't recognise custom tags without a declaration.
  - Next.js may need client-only loading.
  - Source: [Primer checkout framework migration](https://www.primer.io/docs/checkout/primer-checkout/migration/frameworks)
- Brad Frost (2024) said teams have built React-specific wrapper layers just for event handling, and he hopes to deprecate them. — [Brad Frost, Web component continued progress](https://v9.bradfrost.com/blog/post/web-component-continued-progress)
- Web Awesome's own React docs:
  - React 18 and below have "poor support" for custom elements, so wrappers are still shipped.
  - Importing everything from one entrypoint made "tree-shaking extra Web Awesome components proved to be a challenge".
  - In TypeScript, `event.target` is the raw custom element, so users cast it (for example `as any`).
  - JSDOM lacks `matchMedia`, so Jest tests need mocks.
  - The page says nothing about SSR, Next.js, forms or FOUC.
  - Source: [webawesome.com/docs/frameworks/react](https://webawesome.com/docs/frameworks/react)
- Carbon has a "NextJs example Hydration issue" (#14099) **[older, 2023]** and a "React 19 support ☂️" tracking issue (#16282, Apr 2024). — [carbon #14099](https://github.com/carbon-design-system/carbon/issues/14099); [carbon #16282](https://github.com/carbon-design-system/carbon/issues/16282)

**Shadow DOM styling (recurring)**
- Tailwind utility classes can't cross the shadow boundary. One workaround is a custom Tailwind plugin that adds a `part-[name]:` variant. — [Jake Lazaroff TIL](https://til.jakelazaroff.com/tailwind/style-shadow-trees-from-the-light-dom/)
- Hungary's DÁP design system tells consumers to "use the @apply directive and target the component's CSS parts" to combine Tailwind with its web components. — [DÁP styling docs](https://services.gov.hu/design-system-dev/styling)
- `::part` lets developers style every property of an exposed element, which "means that developers can break your code in unexpected ways". Only parts the author exposes are styleable. — [Go Make Things](https://gomakethings.com/styling-web-component-elements-in-the-shadow-dom-with-parts/)
- A scoped-reset `all: unset` "will strip any styling that is defined before these rules are encountered ... this can be a bit of a gotcha". — [Piccalil, May 2026](https://piccalil.li/blog/framework-agnostic-design-systems-part-1/)
- Carniato's styling complaint: if you only want scoped styles, you are still forced to adopt Shadow DOM. — [dev.to](https://dev.to/ryansolid/web-components-are-not-the-future-48bh)

**Form participation (recurring among DS builders, less discussed by app devs)**
- Form-associated custom elements via `ElementInternals` became Baseline Widely Available in Sep 2025. Without them, shadow-DOM inputs don't appear in `FormData`.
- Sources in this set put the cost at "roughly 80 lines of code" or "about 40 lines of repetitive plumbing per component" to restore native behaviour. They note that `@open-wc/form-control` hasn't released in about three years, and that jsdom no-ops or throws on form association, so tests pass while browsers differ.
- Sources: [OpenReplay](https://blog.openreplay.com/reusable-form-controls-web-components/); [DEV, korial29](https://dev.to/korial29/building-form-associated-custom-elements-with-elementinternals-24f0); [Zühlke](https://software-engineering-corner.zuehlke.com/finally-custom-form-elements-that-dont-suck). These are search-snippet attributions, so the exact number-to-source mapping is unverified.
- Angular Reactive Forms needs a custom integration pattern for web-component inputs. — [Cory Rylan](https://coryrylan.com/blog/using-web-components-in-angular-forms-with-element-internals)

**FOUC and bundle duplication**
- FOUC appears in practice as the CLS from un-upgraded custom elements (SGDS figures above) and as per-instance style duplication in DSD output (Stencil).
- Lit "rendering code size just keeps going up" with component count, unlike React's fixed runtime. That was a counter-argument in the size debate on HN. — [HN, hajile](https://news.ycombinator.com/item?id=41687483)

### Inferences
- In order of how often they appear: SSR/hydration/CLS in Next.js, then React interop (now mostly a React ≤18 and typing problem), then shadow DOM vs utility-CSS theming, then forms.
- SSR is the one complaint still producing new, concrete bug reports in late 2026 (SGDS). The others have known but laborious workarounds.
- React 19 removed the loudest pre-2025 complaint (properties and events). Teams still ship wrappers for SSR, typing, `defaultValue`/controlled-input ergonomics and older React versions, so "no wrappers needed" is true only for client-rendered React 19 apps.

### Gaps
- I found no Web Awesome statement on SSR support status for 2026. Its React docs are silent on it.
- I found no quantitative survey of how many teams abandoned web components because of SSR.
- I didn't verify the current status of `@lit-labs/nextjs` beyond the SGDS issue's description.

---

## 3. Complaints about per-framework ports (shadcn-vue, shadcn-svelte, spartan for Angular, and others)

### Takeaway
Ports reliably lag upstream shadcn/ui by weeks to months on new components and platform shifts. Tailwind 4 support reached shadcn-svelte about 4 months after it was requested. Ports also inherit their own framework churn (Svelte 5, Radix Vue to Reka UI), and they refuse features upstream doesn't have. They aren't abandoned. The big three are active, and spartan reached 1.0. The pain is lag, parity bookkeeping and tooling breakage, not death.

### Cited Findings
**shadcn-svelte (huntabyte)**
- "Tailwind 4 support" (#1643) was opened Jan 24, 2025 and drew 214 reactions and 59 comments. It closed May 21, 2025, about 4 months later. The owner explained the delay: "Juggling major Svelte v5 and Tailwind v4 updates has been a challenge, requiring us to update all the dependent libraries first." In the meantime, `shadcn-svelte init` expected a Tailwind config file that Tailwind 4 no longer generates. — [shadcn-svelte #1643](https://github.com/huntabyte/shadcn-svelte/issues/1643)
- "New Shadcn components" (#2786) asked for upstream's AI components (Attachment, Bubble, Marker, Message, Message Scroller). It was opened Jul 2, 2026 and closed Oct 5, 2026 via PR #2886, about 3 months.
  - The repo has a label named "Request for parity to upstream shadcn/ui".
  - The issue template says: "This feature already exists in shadcn/ui - if not, it won't be considered here".
  - Source: [shadcn-svelte #2786](https://github.com/huntabyte/shadcn-svelte/issues/2786)
- Other recurring "port the new upstream thing" issues:
  - Sidebar (#1333, Oct 2024, 64 reactions)
  - Navigation Menu (#1265, Sep 2024, 28)
  - Input OTP (#1107, May 2024)
  - "Add new Shadcn components" (#2309, Oct 2025)
  - "new shadcn ui create page" (#2463, Dec 2025, 28)
  - Sources: [#1333](https://github.com/huntabyte/shadcn-svelte/issues/1333), [#1265](https://github.com/huntabyte/shadcn-svelte/issues/1265), [#2309](https://github.com/huntabyte/shadcn-svelte/issues/2309), [#2463](https://github.com/huntabyte/shadcn-svelte/issues/2463)
- Port-specific breakage: "Multiple type-checking and linting errors in Svelte 5 components" (#2441, Dec 2025). — [#2441](https://github.com/huntabyte/shadcn-svelte/issues/2441)

**shadcn-vue (unovue)**
- "Shadcn/vue extended" (#1077, Mar 2025, 92 reactions) is still open.
  - Users report charts were dropped. One "ended up not being able to use any chart component", and others asked for a list of features missing relative to shadcn/ui.
  - The maintainer wants to keep the port "as close to main `shadcn` as possible" and push community components to a separate repo.
  - As of Nov 2025 that repo was a work in progress with AutoForm but no Chart.
  - Source: [shadcn-vue #1077](https://github.com/unovue/shadcn-vue/issues/1077)
- Component-request backlog:
  - "Drawer, Carousel, Sonner & Resizable" (#220, Dec 2023 **[older]**, 49 reactions)
  - "Time picker" (#689, Jul 2024, 53)
  - "Port shadcn/ui chat primitives" (#1861, Jun 2026)
  - RTL support (#357, open since Feb 2024)
  - Sources: [#220](https://github.com/unovue/shadcn-vue/issues/220), [#689](https://github.com/unovue/shadcn-vue/issues/689), [#1861](https://github.com/unovue/shadcn-vue/issues/1861), [#357](https://github.com/unovue/shadcn-vue/issues/357)
- Tooling fragility:
  - `shadcn-vue@2.5.0` was "published with uncompiled catalog: protocol" (#1751, Apr 2026).
  - `ERR_MODULE_NOT_FOUND` in 2.5.2/2.6.2 (#1795, May 2026).
  - Vue's SFC compiler failed on TypeScript types in ported components (#207 **[older, 2023]**, #905, Nov 2024).
  - Sources: [#1751](https://github.com/unovue/shadcn-vue/issues/1751), [#1795](https://github.com/unovue/shadcn-vue/issues/1795), [#905](https://github.com/unovue/shadcn-vue/issues/905)
- The highest-reaction recent issue, "Most components have disappeared" (#1702, Feb 2026, 115 reactions), was a docs-site content-pipeline bug (Nuxt Content and D1), not upstream lag. It recurred several times before closing Mar 17, 2026. — [#1702](https://github.com/unovue/shadcn-vue/issues/1702)
- The primitives underneath churn too. Radix Vue was renamed Reka UI in its v2 with breaking changes:
  - imports renamed
  - CSS variable and data-attribute prefixes changed from `radix` to `reka`
  - Combobox refactored
  - `v-model:checked` replaced by `v-model`
  - Source: [Reka UI migration guide](https://reka-ui.com/docs/guides/migration)
- A shadcn-vue skill guide warns not to mix Radix Vue and Reka v2 because the APIs are incompatible. — [skillsmp shadcn-vue](https://skillsmp.com/creators/noartem/skills/skills-shadcn-vue)

**Angular (spartan and others)**
- spartan/ui says it "is 1.0 and stable: production-ready, semantically versioned, and shipping more than 55 components". It has about 3.0k stars and builds on the Angular CDK. It makes no claim of full shadcn parity, and the repo has a `V1-TODO.md`. — [spartan-ng/spartan](https://github.com/spartan-ng/spartan)
- Competing Angular ports split the space. ZardUI's beta offers 35 components "following shadcn/ui's core philosophy". — [ZardUI on DEV](https://dev.to/samuelrizzondev/zardui-beta-bringing-shadcnuis-philosophy-to-angular-where-you-own-every-line-of-code-2a79)
- A commenter asked why anyone would pair Angular Material with Tailwind when spartan gives the shadcn look out of the box. — [DEV comments](https://dev.to/this-is-angular/my-favorite-angular-setup-in-2025-3mbo/comments)

### Inferences
- Lag is structural. Ports explicitly scope themselves to upstream parity and queue every new upstream component, which arrive in roughly 3-month cycles in the examples above. Platform migrations are slower still (Tailwind 4: about 4 months). A cross-framework org adopting the shadcn family gets three similar but differently timed design systems.
- APIs differ by design. Each port follows its framework's primitives (Bits UI, Reka UI, Angular CDK), and those primitives make breaking changes on their own schedules (Reka v2, Svelte 5). Visual parity is approximate, API parity isn't a goal, and only the token vocabulary (CSS variables) is truly shared.
- "Abandoned ports" isn't what the evidence shows for the top three, which are all active. The risk is concentrated maintainers: maintainer names (huntabyte, zernonia) recur in the issue threads I read.

### Gaps
- I couldn't produce a dated, side-by-side component-count diff of shadcn/ui vs shadcn-vue vs shadcn-svelte vs spartan without the registries, which I didn't fetch.
- I found no data on whether companies actually run shadcn React and shadcn-vue side by side as "one DS". That's a likely gap in the evidence, not proof it doesn't happen.
- I couldn't read Reddit threads on spartan or shadcn-vue in production (blocked).

---

## 4. Shared headless logic (Ark UI / Zag, Park UI, Melt UI, Reka UI) and multi-framework maintenance cost at Carbon and Spectrum

### Takeaway
Shared state-machine logic (Zag) cuts duplicated behaviour code. Complaints then shift to the adapters: non-React adapters feel "React-shaped" and collect adapter-only bugs. Adopters ask openly whether the project will stay maintained. Large vendors still pay for parallel implementations: IBM runs two flagships plus framework counterparts, and Adobe's shared-logic layer is React-bound. All of that sits against DS teams that are mostly 10 people or fewer.

### Cited Findings
- Zag models UI patterns as framework-agnostic state machines with adapters for React, Solid and Vue (Svelte added later). When asked "Will the library and ecosystem be well maintained over time?" (May 31, 2024), the maintainer answered "Zag.js will remain maintained over time." (Jun 17, 2024). — [chakra-ui/zag discussion #1547](https://github.com/chakra-ui/zag/discussions/1547)
- Sources disagree on Ark's Svelte status. An Ark intro page said Svelte was planned "later this year", while third-party summaries list Svelte as supported. — [Ark UI Vue intro](https://ark-ui.com/docs/vue/overview/introduction); [DeepWiki chakra-ui/ark](https://deepwiki.com/chakra-ui/ark)
- Ark issue #4202, "[Vue] Non-native API is React-shaped (`useX`/`RootProvider`)" (Oct 10, 2026), said: "That create-then-provide pattern comes from React hooks." It called the getter-based props "the Solid idiom". It was closed as completed the next day with no written reply. — [chakra-ui/ark #4202](https://github.com/chakra-ui/ark/issues/4202)
- Adapter-only bugs in Ark's Vue and Svelte layers (low reactions, but steady):
  - `cleanProps` "fails to unwrap ComputedRef, silently dropping all user props" (#3875, May 2026)
  - Generic SelectRoot TS2883 (#4156, Oct 2026)
  - Highlight not forwarding attrs (#4155, Oct 2026)
  - TreeView props ignored (#4151, Oct 2026)
  - "Problems with Asynchronous Svelte" (#3651, Oct 2025)
  - Sources: [#3875](https://github.com/chakra-ui/ark/issues/3875), [#4156](https://github.com/chakra-ui/ark/issues/4156), [#4155](https://github.com/chakra-ui/ark/issues/4155), [#4151](https://github.com/chakra-ui/ark/issues/4151), [#3651](https://github.com/chakra-ui/ark/issues/3651)
- Engagement on HN is low:
  - Park UI ("beautiful components built on Ark UI that work with any framework", Feb 2024): 1 point.
  - Ark UI launch posts (2023): 1–3 points.
  - Zag.js (2023): 2 points.
  - Sources: [HN 39303853](https://news.ycombinator.com/item?id=39303853), [HN 36492077](https://news.ycombinator.com/item?id=36492077), [HN 36035106](https://news.ycombinator.com/item?id=36035106)
- Adobe React Spectrum splits each component into state, behaviour and rendering. Its docs say this architecture "is made possible by React Hooks", so the shared-logic layer is React-only. Adobe also ships Spectrum Web Components and Spectrum CSS separately. — [React Spectrum architecture](https://react-spectrum.adobe.com/architecture.html); [Introducing React Spectrum](https://react-spectrum.adobe.com/blog/introducing-react-spectrum.html)
- IBM Carbon runs two flagships (React and web components). It moved web components into the main monorepo in Sep 2024 to sync them. An older README promised feature parity "throughout 2023" **[older]**, and docs say the web-component APIs "differ from its pure framework counterparts (Carbon React, Carbon Angular, Carbon Vue)". — [conffab mirror of Carbon post](https://conffab.com/elsewhere/carbon-design-systems-commitment-to-web-components-by-anna-wen-_carbondesign-sep-2024-medium/); [carbon-web-components README v1.21](https://cdn.jsdelivr.net/npm/carbon-web-components@1.21.0/README.md); [Carbon docs](https://carbondesignsystem.com/developing/frameworks/web-components/)
- DS team sizes are small: 86% have 10 or fewer people, and the average at 5,000+ employee companies is 11. — [zeroheight 2026](https://report.zeroheight.com/)
- Compile-to-every-framework (Mitosis) draws little discussion: 4 points and 1 comment in Jan 2026. — [HN 46817782](https://news.ycombinator.com/item?id=46817782)

### Inferences
- Headless shared logic moves the cost from behaviour code to adapters, docs and idiom-fit. Bugs land in the less-used adapters (Vue, Svelte), where fewer users report them. Adopters' main fear is bus factor rather than technical failure.
- Even with shared logic, styled components still need per-framework work. Park UI, Chakra v3 and Ark show you still ship framework-specific styled layers.
- No 2024–2026 source I found quantifies headcount per framework at Carbon or Spectrum. The evidence is structural: two flagships, a monorepo move to "synchronize more closely", and API divergence. Given the typical DS team of 3–10 people, maintaining several first-class implementations is out of reach for nearly all organisations.

### Gaps
- I found no published team sizes or cost figures for Carbon, Spectrum, Fluent or Primer per framework.
- I didn't fetch Melt UI or Bits UI (Svelte 5 rewrite) sources this session, so no claims about their churn.
- Ark and Zag adapter issues have low reaction counts. That could mean low usage outside React or few problems, and I can't tell which.

---

## 5. Is "tokens shared, components per framework" good enough, or does it still drift?

### Takeaway
Practitioners generally consider shared tokens necessary but not enough. Token pipelines (Style Dictionary and similar) stop value drift when governed. Separately built components still drift in behaviour, API, coverage and timing, and only some components exist in each stack. Even IBM accepts API divergence between its implementations.

### Cited Findings
- From a guide for Angular plus React teams: if you build two separate component libraries from scratch, "you will inevitably end up with visual discrepancies, differing APIs, and massive maintenance overhead". Separate per-framework implementations have "high long-term maintenance costs". — [UI Pirate guide](https://uipirate.com/design-systems-for-angular-react-teams-a-practical-guide)
- One common recommendation for mixed React/Angular orgs is a single web-component core with generated wrappers and a shared Storybook for parity testing. — [Ionic DS guide](https://ionic.io/resources/articles/building-design-systems-with-web-components); [UI Pirate](https://uipirate.com/design-systems-for-angular-react-teams-a-practical-guide)
- Microsoft's FAST team **[older]**: "there is also no standard around the structure or naming of design tokens ... no agreements in sight that will enable interoperability across design systems or component frameworks". — [FAST, Evolution of design tokens and component styling](https://medium.com/fast-design/evolution-of-design-tokens-and-component-styling-part-1-f1491ad1120e)
- Drift sources named by practitioners (vendor blogs, so opinion not measurement):
  - values hardcoded in CSS instead of referenced from tokens
  - design updates that must be "manually propagated – and it rarely is, consistently"
  - naming mismatches between design and code
  - "a token pipeline without governance drifts"
  - Sources: [Boldare, Figma to code](https://www.boldare.com/blog/figma-to-code-design-development-sync/); [Boldare, design tokens explained](https://www.boldare.com/blog/design-tokens-explained/)
- zeroheight 2026 respondents name design-to-code parity as a pain: "The fact that design and dev still use different tools", and component updates "often require making updates in multiple tools". — [zeroheight 2026](https://report.zeroheight.com/)
- In GitHub Primer, as used by OpenProject, tokens and visual language are shared, but coverage differs: some components exist only as ViewComponents and some only in React. OpenProject forks the ViewComponents to extend them. — [OpenProject glossary](https://community.openproject.org/projects/design-system/wiki/glossary?version=2)
- In the shadcn family, CSS-variable token names are shared across shadcn/ui, shadcn-vue and shadcn-svelte, yet components still land months apart and APIs follow different primitives (Section 3 sources).
- Carbon keeps one token and theme layer, but its web components' APIs "differ from its pure framework counterparts". — [Carbon docs](https://carbondesignsystem.com/developing/frameworks/web-components/)

### Inferences
- "Tokens shared" solves colour, spacing and radius drift, which is the part users notice first. It doesn't solve behaviour, accessibility, API shape, component coverage or release timing. Those are the complaints that dominate the port and multi-flagship evidence.
- Teams that accept tokens-only usually do so for budget reasons, with small DS teams and per-framework app teams owning their components. The common recommendation in mixed-stack orgs leans toward web-component cores despite their SSR cost.
- Tokens-only works best when the second stack is native (Swift, Kotlin, React Native). Sharing components is impossible there, so tokens are the ceiling anyway. zeroheight shows a sizeable mobile share (iOS 35%, Android 34%; React Native 42–47% of mobile).

### Gaps
- I found no quantitative study of drift rates under a tokens-only strategy. The evidence is practitioner opinion and structural examples.
- I didn't fetch a Style Dictionary-specific post-mortem in 2024–2026, so there are no first-hand Style Dictionary pipeline complaints here.

---

## 6. Does Nexus answer these?

### Takeaway
Nexus covers the token and appearance layer across frameworks well, arguably better than plain Style Dictionary pipelines, because one engine derives the full theme at runtime with CI-checked contrast. It ships no non-React components. Today it is a "tokens shared, components per framework" offering, with the per-framework component work left to the consumer, so it leaves the component-drift, port-lag and maintenance-cost complaints open.

### Cited Findings (Nexus facts, from the repo)
- Nexus describes itself as a "framework-agnostic theme engine and design system". — `/home/user/nexus/README.md`
- The docs FAQ says: "The engine does. It has no framework code, so any app can call it. The components are React only today. Vue, Svelte, Angular and React Native bindings are planned." — `/home/user/nexus/apps/docs/content/getting-started/introduction.mdx` (line 87)
- The "Other frameworks" section says another framework needs three functions: `createNexusThemeContract()`, `deriveTheme()` and `themeToCss()`. It promises "a React app and a Vue app in one product render the same gray". — `/home/user/nexus/apps/docs/content/foundations/tokens.mdx`
- Its table splits the work as follows:

  | Concern | Shared by every framework | Built per framework |
  | --- | --- | --- |
  | Token values | Every axis: color, spacing, radius, shadow, border, motion | Nothing |
  | Contrast | CI checks prove the values | Nothing |
  | Appearance model | State shape, validation, snapshots, first-paint script | Nothing |
  | Token source | DTCG JSON | A build target |
  | State binding | None | A provider or store |
  | Components | Variants, data attributes, sizing and focus rules | "Components built on the framework's headless primitives" |

  It closes with "The Nexus components are React." — same file.
- Tokens are DTCG JSON. "When multi-platform support is needed, tools like Style Dictionary can be added", so no Style Dictionary build ships today. "Live theme changes on native need a port of the engine." — `/home/user/nexus/packages/core/README.md`; `/home/user/nexus/apps/docs/content/getting-started/introduction.mdx`
- A framework-agnostic first-paint, no-flash bootstrap exists: `createNexusAppearanceBootstrapScript` and `resolveFirstPaint`. A non-React shell example in the core README calls `themeToCss(deriveTheme(...))` directly. — `/home/user/nexus/packages/core/README.md`
- Nexus requires Tailwind 4 and emits only `nx:`-prefixed utilities and `--nx-*` variables. — `/home/user/nexus/apps/docs/content/getting-started/introduction.mdx`; `/home/user/nexus/examples/README.md`
- There are 72 React component folders in `/home/user/nexus/packages/react/src/components`. They are copy-and-own (Radix + CVA).
- Every coexistence example is React: `shadcn-app`, `shadcn-package` and `mui-app`. Each shows "0" host style changes, and one `.dark` class drives both systems. There is no Vue, Svelte or Angular example. — `/home/user/nexus/examples/README.md`

### Inferences — complaint-by-complaint mapping

| # | Complaint (section) | Verdict | One-line reasoning |
| --- | --- | --- | --- |
| 1 | Demand: orgs with React + Angular/Vue want one DS (§1) | **Partly** | A Vue or Angular app gets identical theme values and the same appearance model today, but not one component, so the "one DS" promise stops at the visual foundation. |
| 2 | Web components SSR, hydration and CLS in Next.js (§2) | **Answers it, for React only** | Nexus React components are plain React with no shadow DOM, so they SSR normally. The theme bootstrap prevents a theme flash. That applies only to React apps, not the other frameworks it targets. |
| 3 | Shadow DOM blocks Tailwind and utility theming, `::part` limits (§2) | **Answers it** | No shadow DOM. Theming is CSS variables plus Tailwind 4 `nx:` utilities, and the code is copy-and-own, so consumers edit the source directly. |
| 4 | React 19 custom-element interop, event typing, wrappers (§2) | **Answers it, by avoiding it** | No custom elements, so no wrappers or `event.target` casts. Native React props and events. |
| 5 | Form participation / `ElementInternals` plumbing (§2) | **Answers it, for React only** | Components render native form elements in light DOM via Radix, so `FormData` and React form libraries work. Non-React stacks get nothing. |
| 6 | FOUC from un-upgraded custom elements (§2) | **Partly** | There's no custom-element upgrade, and the first-paint script removes theme flash in any framework. Component FOUC in non-React stacks depends on what the consumer builds. |
| 7 | Per-framework ports lag upstream by months (§3) | **Doesn't** | Nexus has no Vue, Svelte or Angular components, so lag is total until the "planned" bindings ship. When they do, Nexus will face the same parity-queue problem as shadcn-vue and shadcn-svelte. |
| 8 | Missing components / inconsistent APIs across ports (§3) | **Doesn't (yet)** | Only one API (React) exists. The "Components" row shares only variants, data attributes, sizing and focus rules as a spec, which could anchor API parity later but isn't enforced in code. |
| 9 | Underlying primitives churn (Radix Vue → Reka, Svelte 5, Tailwind 4) (§3) | **Doesn't** | The per-framework plan is "components built on the framework's headless primitives", so Nexus would inherit Reka, Bits UI and Angular CDK churn. Its own Tailwind 4 dependency is already a platform coupling. |
| 10 | Headless adapters feel "React-shaped" in Vue/Svelte (§4) | **Partly** | The engine is pure functions with no hooks or providers ("State binding: None"), so it can't impose a React idiom. Each framework writes its own provider or store, which is idiomatic but means more per-framework code. |
| 11 | Multi-framework maintenance cost and duplicated work (Carbon, Spectrum) (§4) | **Partly** | Colour derivation, contrast, density, radius and motion logic is written once with CI contrast checks, which removes one duplicated layer. Component implementation and testing per framework is still N× work, and Nexus hasn't shown it can staff it. |
| 12 | Bus-factor fear ("will it stay maintained?") (§4) | **Doesn't** | A pre-1.0 engine (README: "Stability is not guaranteed pre-1.0" for advanced exports) with React-only components and "planned" bindings is exactly the profile adopters worry about. |
| 13 | Tokens-only still drifts in components (§5) | **Partly** | Nexus is stronger than a static Style Dictionary pipeline: runtime derivation guarantees identical values, light and dark can't drift, and contrast is proven in CI. Below the token layer, Vue, Svelte and Angular teams build their own components, which is the drift practitioners describe. |
| 14 | Token naming/structure non-standard across tools (§5) | **Answers it** | Tokens are DTCG JSON, readable by Style Dictionary, Swift and Kotlin tools, with a single `--nx-*` namespace. Style Dictionary output isn't shipped, so native teams must wire the build. |
| 15 | Native / React Native share (§1, §5) | **Partly** | React Native can read the colour token map and the DTCG files. Live theme changes on native "need a port of the engine", and there are no RN components. |
| 16 | Coexistence during migration or acquisition (§1) | **Partly, React only** | The examples show zero host-style changes beside shadcn and MUI, which suits gradual adoption within React. There's no evidence or example for adding it beside an Angular or Vue app. |

- Net positioning: Nexus currently matches the approach practitioners call "necessary but not sufficient" (§5), plus a stronger-than-usual token engine. Its strongest story is "a React DS that avoids every web-component pain, with tokens you can hand to other stacks". It isn't yet "one DS across frameworks".
- The evidence suggests Nexus's credibility with multi-framework buyers depends on shipping at least one non-React binding. In zeroheight, Angular (28%) and then Vue (18%) are the most-used frameworks after React, not counting web components. It also needs a parity mechanism that avoids the shadcn-port lag pattern, such as conformance stories shared across bindings and driven by the "Components" spec row.

### Gaps
- I didn't verify nexusui.so live pages. The assessment uses the repo at `/home/user/nexus` as of 2026-10-20.
- I found no public user feedback on Nexus itself (HN, GitHub issues from outsiders, Reddit), so the mapping is analytical, not evidence of user reception.
- I can't judge whether the planned bindings will reuse Radix-like primitives per framework (Reka UI, Bits UI, spartan/brain, Angular CDK) or another approach. The docs say only "the framework's headless primitives".
