# Theming beyond color, and multi-brand / white-label runtime theming: developer complaints vs Nexus

Research date: 2026-10-20. Scope: shadcn/ui, MUI, Chakra UI v2/v3 (and Panda), Mantine, Radix Themes, Tailwind-based setups, token tools.

**Source access notes (read first):**
- Reddit could not be read. The search tool rejects `reddit.com` ("domains are not accessible to our user agent"), and a direct request to Reddit's search JSON returned HTTP 403. General searches never surfaced a Reddit thread. **No Reddit quotes appear in these notes.**
- X/Twitter and LinkedIn posts did not appear in any search result. No quotes from them appear here.
- GitHub's search API was rate-limited or blocked in this session, so reaction counts come only from pages I fetched. Many issue pages showed "Reactions are currently unavailable".
- Hacker News pages show relative ages ("5 months ago"). I converted them to approximate months, measured from 2026-10-20, and marked them "≈".
- Items dated before 2024 are marked **(older)**.

---

## 1. What developers complain about when theming shadcn/ui beyond colors, and how theme tools are received

### Takeaway
The most common shadcn complaint is "every shadcn app looks the same". People also say the theming surface stops at CSS color variables plus one `--radius`. Density, per-component shape, spacing and shadows mean editing component source. shadcn's own answer, in 2025–26, was whole regenerated "styles" and preset codes (`shadcn/create`, Rhea), not runtime tokens. Community tools like tweakcn (10.5k stars) are popular, yet critics say a radius-and-palette toggle doesn't fix sameness.

### Cited Findings

**Recurring: "shadcn sameness", and theming capped at the variables shadcn provides**
- In the official theming docs, the token surface is semantic colors plus one base `--radius`. The smaller and larger radius steps are `calc()` multiples of that one value. Spacing, shadows and typography are not part of shadcn's own theme tokens. — [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) (via search summary)
- A "Show HN: Shadcn/UI theme editor" thread from ≈Nov 2025 drew **136 points and 41 comments**. User jzig said the editor only changes colors. jzig asked about "a different border radius on buttons or margin on labels" and wanted "more variance in the actual shapes and looks of things." The tool's author (miketromba) replied: "you're limited to adjusting the css variables they provide". He said finer control means editing the Tailwind classes inside the components. — [HN 45706487](https://news.ycombinator.com/item?id=45706487)
- In the same thread, programmarchy tried to "derive" a theme from a primary and a secondary color, and found color theory hard to apply reliably. — [HN 45706487](https://news.ycombinator.com/item?id=45706487)
- In a thread from ≈May 2026 on the shadcn homepage, user quadral wrote: "The epitome of all LLM generated websites… I used to use ShadCN but when every LLM defaults to using this UI, it just makes mine look LLM generated." — [HN 47985052](https://news.ycombinator.com/item?id=47985052)
  - bbg2401 replied: "a project using shadcn/ui is nearly immediately identifiable as such because most do not deviate from the defaults… A UI for toggling border radius and colour palettes isn't going to help this."
  - threatofrain said customizing has "some mild disincentive… as you install more components."
  - super256 recommended tweakcn: "You can easily change the theme by changing the css variables." QuantumNomad_ answered: "Ironically that site has a paid AI option."
- The thread "Shadcn/UI now defaults to Base UI instead of Radix" (≈Jul 2026) drew **282 points and 165 comments**. — [HN 48791328](https://news.ycombinator.com/item?id=48791328)
  - sreekanth850: "every app that use shadcn use 100% same". The same user asked how teams "differentiate their brand using shadcn."
  - notpushkin: off-the-shelf libraries are "hard to tweak if/when you want to distinguish your app from the thousand others using the same library".
  - andrewingram: libraries become a bottleneck when you're "running into their limits, or trying to customise them in ways they really aren't design for."
  - notpushkin also wrote: "I'm allergic to Tailwind, and React-only makes it a no-go for me". This is a framework lock-in complaint.
- Third-party guides confirm the gap. One says a theme "covers colors, radius, spacing, and typography" but shadcn's docs list only color and radius. Commercial generators (shadcncraft) sell styling for "the radius scale, the spacing scale, typography, shadows, and paired light and dark". — [shadcncraft theme](https://shadcncraft.com/theme); [zippystarter](https://zippystarter.com/blog/blog-starter/theming-with-shadcn)

**Recurring: density, size and spacing aren't root-CSS controllable in shadcn**
- shadcn-svelte issue #2463 (Dec 16, 2025) asked for density in the create page. martypara replied: "It's not trivial since the size and spacing can't be controlled by the root css." The comment had 1 reaction. — [shadcn-svelte #2463](https://github.com/huntabyte/shadcn-svelte/issues/2463)
- **shadcn's own reasoning (May 2026 changelog):** Rhea is "A more compact Luma. Smaller spacing. Denser surfaces." The team rejected adjusting Luma's spacing because "`--spacing` is a multiplier". Changing it would alter what `p-2` and `w-4` mean across an app. So density ships as a separate style that changes component sizes directly. — [shadcn changelog: Rhea](https://ui.shadcn.com/docs/changelog/2026-05-rhea)
- A community fork, alexgorbatchev/shadcn, exists to add "compact and comfortable densities". It offers 20px vs 28px controls, a provider-level density that "passes through to its portal children", and local per-component overrides. This shows demand that upstream doesn't meet. — [alexgorbatchev/shadcn](https://github.com/alexgorbatchev/shadcn) (via search summary)

**How tools and presets are received**
- **shadcn/create and presets.**
  - It launched with five styles (Vega, Nova, Maia, Lyra, Mira). One write-up frames them as a way to kill "shadcn sameness". — [stow.build](https://www.stow.build/blog/shadcn/shadcn-create)
  - There are now 8 official styles, adding Luma, Sera and Rhea. The guide notes that Lyra ignores your radius setting because it uses square corners. — [shadcnpreset.com](https://shadcnpreset.com/learn/how-to-choose-a-shadcn-style)
  - Presets are short codes. `npx shadcn@latest apply --preset <code>` applies "component styles, fonts and CSS variables". — [shadcnstudio](https://shadcnstudio.com/blog/how-shadcn-ui-presets-work/)
  - The generated component files are *rewritten* to match the chosen font, radius and theme, instead of overriding classes. — [shadcnstudio: how shadcn create works](https://shadcnstudio.com/blog/how-shadcn-create-works)
  - A density request in shadcn-svelte notes the same thing: switching style regenerates the base and variant styles. — [shadcn-svelte #2463](https://github.com/huntabyte/shadcn-svelte/issues/2463) (via search summary)
- **tweakcn.**
  - The repo has 10.5k GitHub stars and 661 forks (as fetched Oct 2026). — [jnsahaj/tweakcn](https://github.com/jnsahaj/tweakcn)
  - A rival tool's author says tweakcn "charges $ users to be able to share and save themes". That claim comes from a competitor. — [HN 45706487](https://news.ycombinator.com/item?id=45706487)
  - A 2026 comparison calls tweakcn free and open-source. Sources conflict on pricing. — [designrevision](https://designrevision.com/alternatives/tweakcn.md)
- **Requests for theme editors** (HN 45706487): a "community-driven hub for sharing, starring, and forking themes", middle-click to compare themes in tabs, and no sign-in wall. — [HN 45706487](https://news.ycombinator.com/item?id=45706487)
- **Demand for theme demos (older).** shadcn issue #751 (Jun 2023), "Feature request: Demo the different themes on the website", got **20 👍**. — [shadcn-ui/ui #751](https://github.com/shadcn-ui/ui/issues/751)

**Recurring: copy-and-own vs global theming at scale**
- shadcn discussion #9756 (Feb 28, 2026) asked: "How do teams handle global theming without breaking future updates?" — [shadcn-ui/ui #9756](https://github.com/shadcn-ui/ui/discussions/9756)
  - The accepted answer: "Since components are copied, future updates won't apply automatically." It recommends wrapping components and extending variants.
  - A later reply (Sep 30, 2026): "the thing that breaks theming at scale is hard-coded colors inside the wrappers themselves". The reply's author also builds a linting tool for this.

### Inferences
- The "sameness" complaint has two parts. One is token range: radius and color only. The other is defaults inertia: most people never change anything. A broader token surface addresses the first part. The second part only moves if the defaults or onboarding push people to change them.
- shadcn chose regenerated styles over a runtime density token. Its stated reason is that changing `--spacing` would redefine every `p-*` / `w-*` utility app-wide. That is a deliberate tradeoff, not an oversight. Any product pitching runtime density has to answer this objection.

### Gaps
- No Reddit evidence because Reddit was blocked. I couldn't measure how often "shadcn theming beyond colors" comes up on r/reactjs, r/nextjs or r/tailwindcss.
- I found no HN or Reddit thread specifically reviewing `shadcn/create` presets after launch. The reception above comes from blogs and the HN side-threads.
- tweakcn's exact editable properties weren't confirmed. The README defers to tweakcn.com/#features, which I didn't load.

---

## 2. White-label, multi-tenant and per-customer runtime theming: pains with MUI, Chakra v3, Mantine, CSS variables and Tailwind 4

### Takeaway
Every mainstream library supports runtime brand color only through a workaround. Mantine needs React state plus a generated palette under a fixed key. MUI's `createTheme` historically rejected `var()`. Chakra v3/Panda is static-first ("not trying to be a hybrid"). Tailwind needs hand-wired CSS variables. Hand-rolled tenant setups usually set one or two shades from the tenant color and leave hover, dark and contrast underived. Scoped (per-subtree) themes break inside portaled overlays.

### Cited Findings

**Mantine**
- Mantine discussion #7420 (Jan 26, 2025) — [mantinedev #7420](https://github.com/orgs/mantinedev/discussions/7420)
  - The question: "I would like to change the primary color of my current theme during runtime… just setting the theme.primaryColor to the color I want does not work."
  - The maintainer (rtivital) replied: "To update values dynamically you need to use state in react, properties assignment won't work."
  - The original poster's workaround: a Zustand store of `MantineThemeOverride`, a custom provider, and a `useLayoutEffect` that sets a `dynamicPrimary` palette and `primaryColor: "dynamicPrimary"`. The poster added: "it would really be nice to have a hook provided in mantine by default."
  - Engagement was low: 1–2 upvotes per post.
- Mantine constraints, from the docs as summarized by search:
  - `theme.primaryColor` must be a key of `theme.colors`, and a raw hex throws.
  - `generateColors` (`@mantine/colors-generator`) returns 10 shades from one hex.
  - — [Mantine colors docs](https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/theming/colors.mdx); [Mantine colors generator](https://v8.mantine.dev/colors-generator/)
- Discussion #2310 (2022, **older**) suggests keeping the theme in state with fallback values while the color loads. — [mantinedev #2310](https://github.com/mantinedev/mantine/discussions/2310)

**MUI**
- Issue #35395 (Dec 8, 2022, **older**; closed May 12, 2025) — [mui/material-ui #35395](https://github.com/mui/material-ui/issues/35395)
  - With `createTheme` "you are forced to use (Typescript) traditional CSS colors". It errors with "MUI: Unsupported `var(--custom-css-var)` color."
  - The maintainer's workaround: after creating the theme, set `theme.colorSchemes.light.palette.primary.main` (and dark) to a CSS variable.
  - There were 8 comments.
- MUI dropped `CssVarsProvider`/`extendTheme` ("We are not moving forward with `CssVarsProvider` and `extendTheme`") and folded CSS variables into `createTheme({ cssVariables: true })` + `ThemeProvider`. A team on the old experimental API had to move. — [mui/material-ui #43033](https://github.com/mui/material-ui/issues/43033); [MUI Theming docs](https://mui.com/material-ui/customization/theming/)

**Chakra v3 / Panda**
- In v3 the config is built once: `createSystem(defaultConfig, config)` → `ChakraProvider`. I found no documented API to swap a system after mount. — [Chakra theming overview](https://chakra-ui.com/docs/theming/overview); [Chakra migration](https://chakra-ui.com/docs/get-started/migration)
- One team's v3 migration PR replaced v2's runtime `colorScheme`-switching JS with static recipes. — [opengovsg camp-design-system PR #1051](https://github.com/opengovsg/camp-design-system/pull/1051) (via search summary)
- Panda discussion #796 (Jun 22, 2023, **older**, 19 replies) asked "Is there a way to dynamically change values similar to ThemeProvider in styled-components?" — [chakra-ui/panda #796](https://github.com/chakra-ui/panda/discussions/796)
  - Maintainer: "light/dark are not themes. They're color modes."
  - Another maintainer said Panda "is not trying to be a hybrid (static+dynamic) solution". They suggested inline `style` for values only known at runtime.
- Chakra discussion #8505: `mergeConfigs` broke on the Next.js edge runtime. It relies on lodash `mergeWith`, which caused a server/client config mismatch and hydration errors. — [chakra-ui #8505](https://github.com/chakra-ui/chakra-ui/discussions/8505) (via search summary)
- Chakra discussion #9016 (v3 era, date not verified):
  - "there only appears to be createSystem which does not seem to work as expected"
  - "overally highly disappointed with v3 so far"
  - — [chakra-ui #9016](https://github.com/chakra-ui/chakra-ui/discussions/9016) (via search summary)
- Chakra issue #418 (Feb 2020, **older**): "(Question) How to store the theme object to support multi tenant application?" The question has been around a long time. — [chakra-ui #418](https://github.com/chakra-ui/chakra-ui/issues/418)

**Tailwind / CSS variables**
- Tailwind discussion #3100 (Dec 15, 2020, **older**): "Recommended way to override primary color per tenant basis". The answer is CSS variables on `<html>`. It "gets a little trickier if you want to support many hues of the primary color", and transparency is also "trickier". — [tailwindlabs #3100](https://github.com/tailwindlabs/tailwindcss/discussions/3100)
- In Tailwind v4, `@theme` tokens compile to CSS variables. — [tailwindlabs #16436](https://github.com/tailwindlabs/tailwindcss/discussions/16436); [tailwindlabs #18560](https://github.com/tailwindlabs/tailwindcss/discussions/18560)
  - A maintainer notes that theme variables are only emitted if used.
  - Runtime variables can't be read in `@media`.
  - `@theme inline` vs `@theme` confuses users about which values become global variables.
- A dev.to article on multi-tenant Tailwind theming (Ugur Aslim, Jun 3, year not shown) — [dev.to](https://dev.to/uaslimcreate/building-a-custom-tailwind-css-theme-system-for-multi-tenant-branding-dynamic-colors-without-6pk)
  - CSS-in-JS led to large per-tenant theme bundles and a flash of unstyled content (FOUC). Per-tenant generated bundles add "deployment complexity, cache invalidation headaches".
  - The fix sets only `--color-primary-500` and `--color-accent-500` from the tenant color. Hover (`600`) and the other shades fall back to global defaults.
  - Dark mode comes from a separate media query.
  - The theme loads in `useEffect` after a client fetch, so it still flashes. A reader comment raised this.
- The common pattern across blogs: tenant tokens in the database, then CSS variables on `:root` or `[data-tenant]`/`[data-theme]`, consumed by Tailwind/shadcn semantic tokens.
  - — [Medium: multi-tenant Next.js + Tailwind](https://medium.com/@aimanfaruk98/multi-tenant-theming-with-nextjs-app-router-tailwind-6a5a4195ed70); [vaibhavt.com](https://www.vaibhavt.com/blog/multi-theme); [shadcndeck](https://www.shadcndeck.com/blog/shadcn-color-palette)
  - A white-label design guide says to store color, radius, font and assets per brand, and to prefer tokens over arbitrary CSS "to keep guardrails and simplify upgrades". — [yeshbe](https://www.yeshbe.com/blog/designing-multi-tenant-white-labeling-themes-domains-branding)
- A build-time alternative is still recommended for separately deployed instances: a different Tailwind preset per tenant via an environment variable. — [dev.to itschrislow](https://dev.to/itschrislow/using-tailwind-presets-for-multiple-tenants-in-nextjs-5gh3)
- A white-labeling monorepo guide advises keeping the global theme narrow (colors, fonts). Brand-specific component behavior should get separate structure. — [iO Digital](https://techhub.iodigital.com/articles/white-labeling-a-frontend-monorepo)
- There is commercial demand for "theme from a company's domain". context.dev sells an API that pulls brand colors and logos and maps them to a theme with contrast checks. This is a vendor page. — [context.dev](https://www.context.dev/use-cases/programmatic-theming)

**Recurring: scoped themes don't reach portaled overlays**
- shadcn dialogs, menus, popovers, selects and tooltips portal to `document.body`. A renderer inside a scoped theme "loses its font and theme variables when an overlay opens". An open PR adds a provider that sends the nearest host-owned element to the Radix portals. — [vercel-labs/json-render PR #397](https://github.com/vercel-labs/json-render/pull/397) (opened Oct 16, 2026; via search summary)
- The Radix Themes docs say to wrap custom portal content in another `<Theme>`. Built-in Dialog and Popover handle this already. — [Radix Themes styling](https://www.radix-ui.com/themes/docs/overview/styling) (via search summary)
- A design-system issue reports Dialog, AlertDialog, Menu, Popover, Select, HoverCard and Tooltip picking up light tokens on a dark page because portaled parts escape a `[data-hds]` scope. The page returned 404 when fetched, so this comes from a search snippet only. — [hirobius/hds #335](https://github.com/hirobius/hds/issues/335)
- shadcn's linter changed precedence so that a variable under `:root`/`html`/`:host`/`@theme` wins over a scoped selector. This reflects friction with scoped overrides. — [shadcn-ui/lint PR #121](https://github.com/shadcn-ui/lint/pull/121) (via search summary)

### Inferences
- The runtime-brand-color pain is recurring across every library examined. Engagement on any single thread is low, though: Mantine #7420 has 1–2 upvotes and Tailwind #3100 has about 4. The signal is breadth across libraries and years, not one viral thread.
- The hidden cost in hand-rolled tenant theming is *derivation*. Teams wire one variable and don't derive hover/pressed, dark or contrast-safe foregrounds. The dev.to example sets only the 500 shade.
- Per-subtree theming (a tenant widget embedded in a host page, a dark panel inside a light page) breaks most often at portals. This is a known, actively worked-on problem as of Oct 2026.

### Gaps
- I found no Reddit or X posts (blocked or not surfaced) from teams describing white-label SaaS theming pain first-hand. The evidence comes from GitHub, HN and blogs.
- I found no first-hand complaint specifically about Tailwind 4 `@theme` blocking runtime tenant theming. The issues found are about confusion over `@theme` vs `@theme inline` and variable emission.
- No quantitative data (surveys, counts) on how many SaaS teams need per-tenant theming.

---

## 3. Generating a full palette (hover, pressed, dark mode) from one brand color, and dark mode drifting from light mode

### Takeaway
Developers want "one brand hex in, full working theme out". The tools that exist either export static CSS once (Radix custom palette, Mantine generator, theme editors) or are general-purpose generators that leave mapping to roles to the team (Material color utilities, Leonardo). Dark mode is a recurring weak spot. A brand color that passes on white can fail on dark surfaces. Hand-derived dark palettes and "accent" aliases don't always follow the mode.

### Cited Findings
- **Radix Themes issue #731 (Jun 5, 2025, no replies visible):** a user expected `accent` to follow both the chosen color and light/dark mode. "`var(--accent-6)` is the same in dark or light mode, is that correct?… How can I use an accent variable that respects the color and the theme… what am I missing?" — [radix-ui/themes #731](https://github.com/radix-ui/themes/issues/731)
- **Radix Themes issue #543 (Jul 10, 2024; closed not planned):** — [radix-ui/themes #543](https://github.com/radix-ui/themes/issues/543)
  - The user praised the custom palette tool ("Extremely easy to use, great defaults, saves so much time").
  - The user was "afraid of not overriding everything in a systematic way". Renaming the generated variables to the accent "doesn't change anything".
  - The root cause was Next.js App Router not guaranteeing CSS import order. 8 comments.
- The Radix custom palette tool generates steps 1–12, alpha variants and wide-gamut values "based just on a couple reference colors". You paste the output after the Themes CSS. There is no runtime API. — [Radix custom palettes](https://www.radix-ui.com/colors/docs/overview/custom-palettes)
- Related Radix requests:
  - #420 (Mar 2024): output OKLCH lightness as percentages. — [radix-ui/themes #420](https://github.com/radix-ui/themes/issues/420)
  - #33 (Aug 2023, **older**, 3 👍): "Add variable accent to color enum". — [radix-ui/themes #33](https://github.com/radix-ui/themes/issues/33)
- On HN, programmarchy tried deriving a shadcn theme from primary and secondary colors and found the color theory hard. — [HN 45706487](https://news.ycombinator.com/item?id=45706487)
- One theme generator states its own premise: most shadcn projects look the same, so derive the full palette from one primary hex. — [shadcndesign theme generator](https://www.shadcndesign.com/blog/introducing-shadcn-ui-theme-generator) (via search summary)
- **Dark-mode drift guidance (practitioners, not complaint threads):**
  - Reusing the light-mode palette for dark mode is a common mistake. — [fourzerothree](https://www.fourzerothree.in/p/scalable-accessible-dark-mode)
  - A color that passes on white may fail on `#1e1e1e`, and white text on a primary button can drop below 4.5:1. — [AdminLTE guide](https://adminlte.io/blog/best-admin-dashboard-color-schemes/)
  - Material raises primary to a lighter tone (200) in dark mode. — [Material Design 2 dark theme](https://m2.material.io/design/color/dark-theme.html)
  - Automated inversion is fine for prototypes but not for shipped dark mode. — search summary of [colorffy](https://colorffy.com/dark-theme-generator) and related guides
- In the multi-tenant dev.to example, only the 500 shade comes from the tenant. Hover uses an underived 600, and dark mode is a separate media query. This is the drift pattern in code. — [dev.to](https://dev.to/uaslimcreate/building-a-custom-tailwind-css-theme-system-for-multi-tenant-branding-dynamic-colors-without-6pk)

### Inferences
- "Dark mode drifting from light mode" shows up mostly as a symptom: an accent alias that ignores the mode, an underived hover, a failed contrast on a dark surface. I found few dedicated complaint threads titled that way.
- The gap people describe is not "generate 10 shades". Many tools do that. The gap is mapping one color to *semantic roles* (hover, pressed, foreground-on-brand, dark equivalents) with contrast guaranteed, at runtime.

### Gaps
- I found no high-engagement complaint thread specifically about dark mode drifting in shadcn, MUI or Chakra. The evidence is practitioner guidance plus one Radix issue.
- I didn't verify how Mantine's `primaryShade` light/dark handling is received by users.

---

## 4. Requests for density / compact-mode toggles

### Takeaway
A global density toggle is a long-running, recurring request. MUI users asked in 2018, 2019 and 2024. MUI's maintainers call today's density support "not really usable" and opened a density RFC in Jun 2026. Ant Design is the mainstream exception, with a built-in compact algorithm. shadcn shipped density as a separate regenerated style (Rhea), not a toggle. Several smaller design systems are converging on "density as a token mode scoped to an element".

### Cited Findings
- MUI #12623 (Aug 2018, **older**): "Compact display like compact gmail". — [mui/material-ui #12623](https://github.com/mui/material-ui/issues/12623)
- MUI #15988 (May 31, 2019, **older**, closed): "Global/Theme 'Dense' option", modeled on Gmail density for desktop-only apps. — [mui/material-ui #15988](https://github.com/mui/material-ui/issues/15988)
- **MUI #41579 (Mar 20, 2024; open; labels "priority: important" and "scope: all components"):** — [mui/material-ui #41579](https://github.com/mui/material-ui/issues/41579)
  - The request: "Feature to globally set size for component variants… I would like to scale all the components and font sizes from a single place". The author adds: "I cannot set the 'small' variant for all components since I would like to keep the default variant on bigger screens."
  - Maintainer oliviertassinari (Jul 14, 2024): "I very much support the introduction of a native support for density." "What we have today feels not really usable." Density "needs to be a constraint from the start in how the theming system works."
  - He cites international users with denser scripts. He proposes a Radix-style scaling factor and says a Toolpad attempt (#2393) was hard to apply.
- **MUI RFC #48746 (Jun 30, 2026; open; 4 maintainer comments):** — [mui/material-ui #48746](https://github.com/mui/material-ui/issues/48746)
  - The RFC describes current density as "a per-component workaround, not a density system". It covers "Only 13 components", and the docs say "you should not apply this theme to your whole application".
  - Maintainers are still debating the API: a `createTheme` density option vs an enhancer, naming, idempotency, and MUI X coverage.
- MUI X:
  - #4225 (2022, **older-ish**) requests DataGrid density CSS classes. — [mui/mui-x #4225](https://github.com/mui/mui-x/issues/4225)
  - #10688: compact density breaks the layout with header filters. — [mui/mui-x #10688](https://github.com/mui/mui-x/issues/10688)
- **Ant Design** has `theme.compactAlgorithm`, which can be combined with the dark algorithm. Since 5.8 it can also be applied per component token. I found no complaints in the results. — [Ant Design customize theme](https://ant.design/docs/react/customize-theme); [preset algorithms demo](https://ant.design/docs/react/demo/preset-algorithm)
- **Radix Themes** exposes `scaling` and `radius` at the theme level. — [WorkOS widgets theme docs](https://workos.com/docs/widgets/styling/theme-customization) (via search summary)
- **shadcn:**
  - Rhea, the compact style (May 2026), uses separate component code rather than a `--spacing` change. — [shadcn changelog: Rhea](https://ui.shadcn.com/docs/changelog/2026-05-rhea)
  - shadcn-svelte asked for density in the create page. — [shadcn-svelte #2463](https://github.com/huntabyte/shadcn-svelte/issues/2463)
  - A community fork adds compact/comfortable densities with portal passthrough. — [alexgorbatchev/shadcn](https://github.com/alexgorbatchev/shadcn)
- Other systems requesting or adopting the same pattern (dates not verified; seen in search results only):
  - MudBlazor #8946, "Create a unified global density system for layout spacing". — [MudBlazor #8946](https://github.com/MudBlazor/MudBlazor/issues/8946)
  - common-origin design system #193, "Decision: density as a token mode scoped to an element". — [common-origin #193](https://github.com/common-origin/common-origin-design-system/issues/193)
  - facebook/astryx PR #6817, "one-prop compact density for dense tools". — [facebook/astryx #6817](https://github.com/facebook/astryx/pull/6817)

### Inferences
- Density is the most clearly *recurring* beyond-color request. It spans at least 8 years of MUI issues, plus shadcn, MudBlazor and others. It lands most often on data-heavy surfaces such as tables and DataGrid, and on "small screens vs big screens".
- The design debate is where density lives. One option is a global spacing multiplier, which shadcn rejected because it redefines utilities. The others are per-component size props (MUI today) or a scoped token mode (the emerging pattern).

### Gaps
- No Ant Design user feedback on `compactAlgorithm` (praise or complaints) surfaced.
- Reaction counts for MUI #41579 and #48746 were not visible ("Reactions are currently unavailable").

---

## 5. Alternatives people recommend (Material 3 dynamic color, Radix palette generator, Leonardo, Style Dictionary, Tokens Studio)

### Takeaway
Recommendations split into color-only generators and token pipelines. The generators are Material color utilities, Leonardo, the Radix custom palette tool, Mantine's generator, tweakcn and shadcn/create. The token pipelines are Style Dictionary and Tokens Studio, which handle multi-brand but bring file sprawl. None of the recommended tools pairs runtime derivation with non-color axes (density, radius, shadow, border) and ready components.

### Cited Findings
- **Material 3 dynamic color on the web.**
  - There is no official React package. Community wrappers exist: `use-material-you`, a hook over material-color-utilities with seed color, variants, dark flag and contrast level. `dynamic-colorscheme` is a framework-agnostic TypeScript package with a contrast range from -1 to 1. — [use-material-you](https://github.com/maiconcarraro/use-material-you); [dynamic-colorscheme](https://cdn.jsdelivr.net/npm/dynamic-colorscheme@1.0.0/README.md)
  - The suggested web pattern: generate roles from a seed, then expose them as CSS custom properties for light and dark. — search summary of a Material Expressive kit at [jsdelivr](https://cdn.jsdelivr.net/npm/@wrongstack/core@0.295.1/design-kits/material-expressive/KIT.md)
- **Adobe Leonardo.**
  - It generates palettes from target contrast ratios and is "the engine that drives the adaptive color theme for Adobe's design system, Spectrum". Its defaults follow WCAG AA (3:1 and 4.5:1).
  - It can adjust brightness, contrast and saturation for dark and other variants. The npm package is `@adobe/leonardo-contrast-colors`.
  - — [uxdesign.cc: contrast-based themes with Leonardo](https://uxdesign.cc/creating-contrast-based-themes-with-leonardo-32b6219a090f); [leonardocolor.io](https://leonardocolor.io/)
  - A secondary listing claims APCA/WCAG 3 targets. That is unverified against Adobe docs. — [skillselion](https://skillselion.com/skills/adobe/leonardo/leonardo-colors)
- **Radix custom palette generator:** two reference colors produce a 12-step scale plus alpha and P3 values. The output is static CSS to paste, and users hit override and import-order friction (see §3). — [Radix custom palettes](https://www.radix-ui.com/colors/docs/overview/custom-palettes); [radix-ui/themes #543](https://github.com/radix-ui/themes/issues/543)
- **Style Dictionary / Tokens Studio (multi-brand).**
  - Teams running multi-brand systems end up managing "dozens or hundreds of token files", which leads to drift and upkeep overhead.
  - The DTCG spec (first stable version, Oct 28, 2025) adds theming and multi-brand support without file duplication. Style Dictionary and Tokens Studio are named as reference implementations.
  - — [W3C Design Tokens CG announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
  - Practitioner pains (via search summary):
    - Style Dictionary aliases need each token declared before reference, and cross-file import order matters. — [didoo on Style Dictionary](https://didoo.medium.com/how-to-manage-your-design-tokens-with-style-dictionary-98c795b938aa)
    - Manual Figma export causes code to drift. — [artofstyleframe](https://artofstyleframe.com/blog/design-tokens-style-dictionary-figma/)
    - Style Dictionary supports a shared default theme with per-brand overrides. — [Style Dictionary tokens](https://styledictionary.com/info/tokens/)
- **Panda CSS multiple themes:** static themes, with CSS-variable overrides for runtime. — [chakra-ui/panda #796](https://github.com/chakra-ui/panda/discussions/796)
- **Ant Design algorithms** (dark, compact, combinable) are an integrated example of non-color theming. — [Ant Design customize theme](https://ant.design/docs/react/customize-theme)
- **Theme editors** for shadcn: tweakcn (10.5k stars), miketromba's editor (Show HN, 136 points), shadcncraft and shadcndesign generators, and shadcn/create presets. — sources in §1

### Inferences
- The recommended alternatives are mostly *inputs* to a theme. A team still has to map the generated scale to semantic roles and per-component styles, then wire runtime delivery. That integration work is where the complaints in §2–§3 pile up.

### Gaps
- No user-reported comparison (Reddit, X or LinkedIn) of Leonardo vs Material color utilities vs Radix for runtime brand theming was found.
- I did not confirm adoption numbers for `use-material-you` or `dynamic-colorscheme`.

---

## Does Nexus answer these?

### Takeaway
Nexus directly targets the most recurring pains. Runtime brand color produces a full palette with hover, pressed and dark values and gated contrast. Non-color axes (density, corners, elevation, stroke) are tokens, with per-subtree overrides. Nexus does **not** fix portaled overlays losing subtree overrides, the copy-and-own upgrade problem, or non-React frameworks. On density it makes the opposite tradeoff to shadcn's Rhea. Density swaps Nexus's own spacing scale per subtree, so the objection "it changes what p-2 means" applies, though only inside `nx:` utilities.

### Cited Findings
Product facts come from the assignment brief. Where noted, I checked them against the repo at `/home/user/nexus`:
- `@nexus_ds/core` is version 0.7.1 (`packages/core/package.json`).
- The appearance model has these fields: `surfaceTone`, `lightContrast`, `darkContrast`, `density`, `corners`, `elevation`, `stroke` (`packages/core/src/lib/appearance-model.ts`).
- `packages/tailwind/nexus.css` defines six density modes: `tight`, `compact`, `default`, `comfortable`, `relaxed`, `spacious`. Each is keyed on `[data-density='…']` "on any ancestor" and swaps `--nx-spacing-*` plus `--nx-container-p`, `--nx-container-gap` and the layout gaps.
- The repo test rules list a "first-paint script" among the core engine tests (`.claude/rules/testing.md`).

| # | Complaint (recurrence) | Nexus | One-line reasoning |
|---|---|---|---|
| 1 | shadcn theming stops at color variables plus one `--radius`; no shadows, border width or density without editing components (recurring: HN ×3, generators, Rhea) | **Answers** | One appearance object covers density (6), corners (5), elevation (5), stroke (3) and fonts as tokens, not component edits. |
| 2 | "Every shadcn app looks the same / LLM look" (recurring, highest engagement: HN 282/165, 136/41) | **Partly** | More axes give more distinct output, but defaults inertia remains. The HN critic's point that "a UI for toggling radius and palettes isn't going to help" still applies, and the components are shadcn-shaped. |
| 3 | Want different shapes per component (pill buttons, square cards) or label spacing, not just one global radius (HN 45706487) | **Partly** | `data-radius` sets corners per subtree, not per component type. Structural or shape changes still mean editing the copied source, which is allowed by copy-and-own. |
| 4 | Density/size can't be set from root CSS; shadcn ships density as a regenerated style (shadcn-svelte #2463, Rhea) | **Answers, with a tradeoff** | Density is a runtime token mode on any ancestor. Unlike Rhea, it rescales `--nx-spacing-*`, so `nx:p-2` means different pixels per density. That is the exact objection shadcn raised, limited here to `nx:` utilities so host Tailwind classes are unaffected. |
| 5 | MUI has no global density switch; current support covers 13 components and docs warn against app-wide use (MUI #15988, #41579, RFC #48746; 2018–2026) | **Answers** | Density is a global appearance setting that every component's spacing reads. Whether all 72 components visibly respond at all six levels was not verified here. |
| 6 | Compact region inside a comfortable page (Gmail/DataGrid case) | **Answers (mostly)** | `data-density` works on any subtree. Overlays opened from that subtree fall back to the root density (see #11). |
| 7 | Change brand color at runtime without rebuild or provider gymnastics (Mantine #7420, MUI #35395, Panda #796, Tailwind #3100, Chakra #418; recurring) | **Answers** | The core re-derives every color token from any CSS color at runtime with no rebuild and no framework code. |
| 8 | Only the base shade comes from the tenant color; hover, pressed and dark are not derived (dev.to tenant example, Tailwind #3100 "many hues… trickier") | **Answers** | brandColor yields the full palette, including hover/pressed and dark values. |
| 9 | Generated brand colors fail contrast, especially on dark surfaces (practitioner guidance; Radix #731) | **Answers, with a caveat** | APCA contrast is gated in CI across many sampled brand colors, and there are light/dark contrast sliders. It is APCA, not WCAG 2.x ratios, and the sampling is not exhaustive. Teams with WCAG 2 compliance obligations may still need their own check. |
| 10 | Dark mode drifts from light mode; accent aliases don't follow the mode (Radix #731) | **Answers** | Light and dark come from the same appearance object in one derivation, with separate `darkContrast`. |
| 11 | Scoped/subtree themes lost in portaled dialogs, menus and popovers (json-render PR #397, Radix docs, hirobius #335; recurring) | **Doesn't** | This is the stated gap: per-subtree overrides don't reach portaled popovers. Nexus has the same problem as shadcn and Radix today. |
| 12 | Tenant theme flashes on load when fetched client-side (dev.to comment) | **Partly** | The repo tests a first-paint script, but whether it handles per-tenant values fetched from a server was not verified. |
| 13 | Copy-and-own means no upstream updates; global theming vs local edits at scale (shadcn #9756) | **Doesn't** | Nexus uses the same copy-and-own model and has no registry CLI yet. Token-driven theming does reduce how many local edits a team needs. |
| 14 | Hard-coded colors in wrappers break theming at scale (shadcn #9756 reply) | **Partly** | Semantic-token components plus a published ESLint plugin (`nx-class-conventions`, per repo rules) push toward role tokens. Nothing stops edits to copied files. |
| 15 | Framework lock-in: "allergic to Tailwind, React-only is a no-go" (HN 48791328) | **Partly** | The core is framework-agnostic, but the components are React-only and require Tailwind 4 with the `nx:` prefix. Vue, Svelte, Angular and React Native are only planned. |
| 16 | Chakra v3 / Panda static-first; config built once; edge-runtime merge bugs (Panda #796, Chakra #8505, #9016) | **Answers** | The same appearance object derives at build time and again at runtime, so there is no separate static vs runtime path. |
| 17 | MUI `createTheme` rejects `var()`; CSS-variable mode API churn (MUI #35395, #43033) | **Answers** | Output is native `--nx-*` CSS variables, and no JS theme object is needed to consume them. |
| 18 | Multi-brand token-file sprawl in Style Dictionary / Tokens Studio pipelines (W3C DTCG note) | **Partly** | One small appearance object per brand replaces many token files. No Figma, Tokens Studio or DTCG import/export is described, so design-tool sync is unaddressed. |
| 19 | Want a visual theme editor with sharing (tweakcn 10.5k stars; Show HN requests for a hub, forks, no sign-in) | **Unknown / not in brief** | The brief describes no visual editor or theme-sharing hub. The appearance object is small enough to be a share code, like shadcn presets, but that is not a shipped feature as described. |
| 20 | Host-app collisions when embedding a themed widget | **Answers** | The `nx:` prefix and `--nx-*` variables keep Nexus from restyling the host. I found no direct complaint thread on this, so it is listed for completeness. |

### Inferences
- Nexus's strongest match is the "white-label SaaS" persona: runtime brand color, derived states, dark mode and contrast safety in one call. That is the combination every library in §2 makes teams assemble by hand.
- The portal gap (#11) sits exactly where scoped theming is most often praised and most often breaks. Competitors and community forks (alexgorbatchev/shadcn passes density "through to its portal children") are already solving it. Closing it would remove the clearest "doesn't" on this list.
- The density design choice (rescale `--nx-spacing-*` per mode) runs against shadcn's published reasoning. Positioning should state up front that this is deliberate and limited to `nx:` utilities.

### Gaps
- I did not test Nexus behavior. The mapping relies on the brief plus a light repo check (appearance fields, six density modes in CSS, core 0.7.1). I did not verify:
  - how many of the 72 components visibly change per density, radius, shadow and border mode
  - first-paint handling for server-provided tenant themes
  - any visual editor on nexusui.so
- I found no community discussion of Nexus itself to weigh against these mappings.
