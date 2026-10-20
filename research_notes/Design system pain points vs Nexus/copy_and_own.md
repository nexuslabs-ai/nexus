# Copy-and-own (shadcn/ui model): developer complaints, counter-arguments, and whether Nexus answers them

Research date: 2026-10-20. Sources are 2024–2026 unless marked [older].

Source-access caveats, which apply to every section below:
- **Reddit was unreachable.** Direct fetches returned 403, and the search tool refuses reddit.com. No Reddit thread is quoted here. Reddit sentiment is a gap.
- **X posts are known only from search-result snippets.** I could not open x.com pages.
- **GitHub issues were read through web fetches**, because the repo-scoped GitHub API was limited to nexuslabs-ai/nexus. Reaction counts come from the GitHub search API.
- **Hacker News comments were pulled directly** from the HN Algolia API (`hn.algolia.com/api/v1/items/{id}`), so those quotes are verbatim.
- **Two Design Systems Collective (Medium) posts were paywalled (403).** Only their titles and search snippets were used.

---

## 1. How do people update shadcn components after editing them?

### Takeaway
This is the oldest and most persistent complaint (2023–2026). shadcn has never shipped an `update` command or a 3-way merge. Its official answer has moved from "run `diff`, merge by hand" to "`add --diff`, or ask your coding agent to merge" (CLI v4, March 2026). For library-level migrations, shadcn now openly says codemods fail on edited copies, and ships an AI "skill" instead.

### Cited Findings
**The shadcn CLI as of Oct 2026**
- The current CLI reference lists `init, add, apply, preset, view, search, build, docs, info, migrate (cn|icons|base-color|rtl|radix), eject`. It has no `update` or `upgrade` command, and no standalone `diff` command. `add` has `-o, --overwrite`, `--dry-run`, `--diff [path]` and `--view [path]`. — [shadcn CLI docs](https://ui.shadcn.com/docs/cli)
- The CLI v4 changelog (March 2026) has a section titled "Updating primitives": "You can use the --diff flag to check for registry updates. Or ask your agent: 'check for updates from @shadcn and merge with my local changes'." — [shadcn changelog, CLI v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4)
- Vercel Academy's lesson (last_updated 2025-10-17) still teaches `npx shadcn@latest diff button`, then "apply the new updates manually" or `add --overwrite`.
  - It concedes that customizing "breaks upstream updates".
  - It says the wrap/proxy workaround "effectively doubles the component design system size and makes the ownership concept redundant".
  - It says you are "responsible for keeping them secure, functional, and up-to-date". — [Vercel Academy: Updating and maintaining components](https://vercel.com/academy/shadcn-ui/updating-and-maintaining-components)

**GitHub issues (recurring, with low maintainer engagement)**
- **#2121 "diff command and 3-way merge problem"** (Dec 16 2023) [older].
  - `diff` only shows how your file differs from upstream, not what upstream changed between versions. The reporter had to filter out their own edits by eye, and asked for a merge against the originally installed version.
  - A commenter (Dec 27 2023) said a different Prettier/ESLint config makes CLI `diff` "basically useless". They proposed a versioned registry with local tracking.
  - No maintainer reply. The issue was auto-closed as stale on Feb 28 2024. 3 👍. — [shadcn-ui/ui#2121](https://github.com/shadcn-ui/ui/issues/2121)
- **#5427 "[bug]: shadcn cli - diff command not working"** (Oct 18 2024).
  - `npx shadcn@latest diff` printed "No updates found." for an edited component on v2.1.0. The old `shadcn-ui@0.8.0` diff still worked.
  - A Feb 2025 commenter: "Latest version of shadcn is not finding updates."
  - A community PR (#8658) was linked on Oct 30 2025. No maintainer comment. Still open. 13 👍. — [shadcn-ui/ui#5427](https://github.com/shadcn-ui/ui/issues/5427)
- **#376 "Long term maintainability"** (May 2023, 7 reactions, closed) and **#2375 "How can the customised props be kept after updating components from shadcn"** (Jan 2024) [older]. Titles and counts only; I did not read the bodies. — [GitHub search results: #376](https://github.com/shadcn-ui/ui/issues/376), [#2375](https://github.com/shadcn-ui/ui/issues/2375)
- **#2001 "Add a 'remove' command to CLI"** (Nov 2023): 37 👍, the top-reacted CLI issue found. This is a lifecycle-tooling gap next to update. — [shadcn-ui/ui#2001](https://github.com/shadcn-ui/ui/issues/2001)

**Migrations of copied code**
- **Radix → Base UI (July 2026).** shadcn explains why it ships a skill and not a codemod: "Because you own the code. You've added variants, changed classes, threaded new props. A codemod handles the components you never touched and breaks on the ones you did."
  - The skill writes a `.migration/` report per component and one commit per component.
  - shadcn claims it tested this on "60+ components, 36 of them on Radix … about 25 minutes at roughly 10k tokens per component." — [shadcn changelog, Base UI as the Default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)
- **`@radix-ui/react-*` → `radix-ui` package.** `shadcn migrate radix` rewrites imports (June 2025). The changelog warns: "To update imports for newly added components, run the migration command again." — [changelog, radix-ui Migration](https://ui.shadcn.com/docs/changelog/2025-06-radix-ui)
  - The new-york style switched to the unified package in Feb 2026. — [changelog, Unified Radix UI Package](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui)
- **`cn` moved into an npm package (Sept 2026).** `migrate cn` "rewrites imports, replaces twMerge(clsx(...)) calls and removes the old packages". — [changelog, cn](https://ui.shadcn.com/docs/changelog/2026-09-cn)
- **Tailwind v4 (Feb 2025).** This was one release combining: removing forwardRef, adding `data-slot`, "fixed and cleaned up the style of the components", deprecating toast for sonner, changing the default button cursor, deprecating the default style, and converting HSL to OKLCH. — [changelog, Tailwind v4](https://ui.shadcn.com/docs/changelog/2025-02-tailwind-v4)
  - The official upgrade path re-adds components with `--overwrite` and re-applies customizations by hand. This is per search-result summaries of the [Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4).
  - **Discussion #6714** (Feb 6 2025, 135 comments) — [shadcn-ui/ui discussion #6714](https://github.com/shadcn-ui/ui/discussions/6714):
    - jonkwheeler: "All the animations for the open and closing states of popovers broke." He also said the guide "reads like you just need to run the codemod".
    - jkinley: "it's confusing that we are changing the design AND updating to TW 4".
    - androidStern: Select dropdowns "started rendering fully transparent".
    - Kamahl19: "tw4 removed default cursor on buttons (no idea why though)".
- **`shadcn apply` (April 2026)** switches presets and will "reinstall your existing components". Its docs don't say whether local edits survive. — [changelog, shadcn apply](https://ui.shadcn.com/docs/changelog/2026-04-shadcn-apply)

**Practitioner voices (HN, July 2026 Base UI thread: 282 points, 165 comments)** — [HN 48791328](https://news.ycombinator.com/item?id=48791328)
- chvid: "The copy paste approach may be easily modifiable but creates new problems - ie now there is an upgrade ai agent for something that should just be ticking up a version number." — [comment](https://news.ycombinator.com/item?id=48791684)
- notpushkin: an off-the-shelf library is "hard to tweak … and when you do decide to upgrade it, all your tweaks break in subtle ways". This is an argument for vendoring. — [comment](https://news.ycombinator.com/item?id=48791788)
- lucumo: people "bolt on extra CSS" to library components. "Do those two line fixes a lot, and upgrading becomes A Project." — [comment](https://news.ycombinator.com/item?id=48792378)
- stevepotter (Jan 2026 radio-button thread): "Suddenly you increase your maintenance burden, lose updates, etc." — [HN 46691756](https://news.ycombinator.com/item?id=46691756)
- dyllon noted the move "away from codemods and towards LLMs doing migration work". xyzzy_plugh replied: "Just write docs for humans. Write a migration guide, for humans." — [HN 48791566](https://news.ycombinator.com/item?id=48791566), [HN 48794196](https://news.ycombinator.com/item?id=48794196)
- A 2026 post: copied source means "Upstream fixes do not arrive on their own". Two registries can overwrite each other's `button.tsx`. Unversioned components are "either freedom or a governance problem" depending on team size. — [21st.dev: Radix, Base UI and shadcn](https://21st.dev/blog/radix-base-ui-shadcn) (2026-08-20)

### Inferences
- **Recurring pain, not a one-off.** The same complaint shows up in 2023 issues, 2024–25 CLI bugs, the 2025 Tailwind v4 thread and 2026 HN threads. shadcn's own copy now admits that mechanical tooling breaks on edited code.
- **The state of the art in Oct 2026 is "diff + AI agent merge", not deterministic tooling.** A competitor whose update story is "paste the newer version over yours" is behind shadcn on this axis, not level with it.
- **Visual changes multiply the pain.** Tailwind v4 bundled design changes with the framework migration, which made upgrades harder to review. A system that moves look-and-feel into tokens, out of component code, cuts the surface that an update touches.

### Gaps
- No data on how often teams actually update shadcn components, for example the share running stale copies.
- I could not confirm when the standalone `shadcn diff` command was dropped. Vercel's Oct 2025 lesson still documents it, and the Oct 2026 CLI reference does not list it.
- Whether `shadcn apply` preserves local edits is undocumented.

---

## 2. Maintenance in monorepos and across multiple apps

### Takeaway
Teams that run several apps converge on one shared internal UI package, often with a private registry. The pains are drift between per-app copies, the CLI defaulting to the wrong target, Tailwind not scanning the shared package, and deciding where per-app theme tokens live. shadcn calls itself a starting point, not a design system, so governance falls to the team.

### Cited Findings
- shadcn's own Dec 2024 changelog: "Until now, using shadcn/ui in a monorepo was a bit of a pain. You could add components using the CLI, but you had to manage where the components were installed and manually fix import paths." — [changelog, Monorepo Support](https://ui.shadcn.com/docs/changelog/2024-12-monorepo)
- The shadcn monorepo docs require matching `style`, `iconLibrary` and `baseColor` across the `components.json` files. Per search snippets, the shared package must export every path that another workspace references. — [shadcn monorepo docs](https://ui.shadcn.com/docs/monorepo)
- Later additions were package imports and target aliases (May 2026, shadcn@4.7.0), and private GitHub registries (Aug 2026). — [changelog, Package Imports](https://ui.shadcn.com/docs/changelog/2026-05-package-imports-target-aliases), [changelog index](https://ui.shadcn.com/docs/changelog)
- 21st.dev "shadcn in a Monorepo: One Button, One Place" (2026-08-20) — [21st.dev](https://21st.dev/blog/shadcn-monorepo-setup):
  - "the fourth button arrives within a month" when each app keeps its own `components/ui`.
  - The CLI can't tell which package owns the UI, so teams end up with a shared package plus app-level copies.
  - "the component works in isolation and looks broken in the app" when Tailwind doesn't scan the shared package. The fix is `@source`.
  - Putting tokens in the shared package means "every app gets the same theme whether it wants it or not".
  - Duplicate React copies break hooks.
- Tailwind v4 thread: "Tailwind v4's automatic detection doesn't really work that well out of the box in Monorepos" (sp88011, Apr 2025). — [discussion #6714](https://github.com/shadcn-ui/ui/discussions/6714)
- Dev.to Turborepo starter: "Then a subtle bug is found in the Button. Now you're patching it in three places." Copy-paste causes "drift and duplication immediately". The fix is one `@repo/ui` package. — [dev.to, sharathmohan007](https://dev.to/sharathmohan007/stop-copying-shadcn-components-across-projects-use-this-turborepo-starter-instead-3ma1) (year not shown)
- **A concrete drift case.** Four apps copied the same shadcn files and "have drifted: 17, 14, 15, and 11 primitives". The author centralised them: shared `tokens/base.css`, per-app `palettes/`, and a `@design` namespace registry. — [github.com/daniel-miller/design](https://github.com/daniel-miller/design)
- Codexical (2026-06-10):
  - "Two teams using shadcn and each making independent modifications end up with different visual outputs."
  - "The engineer owns the code. The designer owns the token values."
  - "Token management across large organizations is its own discipline."
  - "Large organizations with strict brand requirements … will likely keep centralized systems." — [Codexical](https://www.codexical.com/posts/2026-06-10-developer-owned-design-system-authority)
- Design Systems Collective ran a paywalled post titled "Why shadcn/ui Struggles at Enterprise Scale". Only the title was seen (403). — [designsystemscollective.com](https://www.designsystemscollective.com/why-shadcn-ui-struggles-at-enterprise-scale-9f7416f3af3f)
- HN dsego: building your own UI library "is one more thing to maintain, and it's also difficult to push back on things". With an off-the-shelf library you can "point to the mature well known community owned UI library … and make it authoritative." — [HN 48792695](https://news.ycombinator.com/item?id=48792695)

### Inferences
- **The recurring enterprise pattern** is: one internal package (or private registry), shared tokens, per-app brand palettes, and a named owner. Every source describes teams building this themselves on top of shadcn.
- **Token-level drift and component-level drift are separate problems.** Shared CSS-variable tokens fix the first. Only one source of component code fixes the second.

### Gaps
- No quantitative data on how many enterprises wrap shadcn in an internal package.
- No first-hand Reddit or LinkedIn enterprise accounts, because those sites were inaccessible.

---

## 3. Registries, blocks, third-party registry quality, and lock-in to shadcn token names

### Takeaway
The registry has become shadcn's distribution and network-effect moat. It has grown from blocks (Mar 2024) to namespaced and private registries (Aug 2025) to any GitHub repo (June 2026). Complaints focus on unversioned items, registries overwriting each other, and remote code and text reaching the project and the agent. The ecosystem assumes shadcn's token names, which locks consumers in through the ecosystem rather than through code.

### Cited Findings
- CLI 3.0 (Aug 2025) added namespaced registries (`@acme/button`), auth headers, and cross-registry dependencies. "It's completely decentralized. There's no central registrar." It shipped with "no breaking changes for users". — [changelog, CLI 3.0](https://ui.shadcn.com/docs/changelog/2025-08-cli-3-mcp)
- GitHub registries (June 2026): any public repo with `registry.json` is installable. Items can be "components, hooks, utilities, design tokens … agent instructions, CI workflows … codemods". — [changelog, GitHub Registries](https://ui.shadcn.com/docs/changelog/2026-06-github-registries)
- Registry Directory (Oct 2025), Registry Index (Sept 2025), and "Registry Health" in the docs navigation. — [changelog index](https://ui.shadcn.com/docs/changelog)
- Two registries "can overwrite each other's files, such as `button.tsx`". Components have no version. — [21st.dev](https://21st.dev/blog/radix-base-ui-shadcn)
- **Security, a one-off source type.** Snyk audits on skills.sh flag shadcn-related agent skills (MEDIUM) because the CLI fetches "registry item JSON from a potentially outsider-controlled URL template". Also, "remote content directly controls the code written into the project". Based on search snippets of [skills.sh audit](https://www.skills.sh/fusengine/codex-agent/shadcn-registries/security/snyk) and [another](https://www.skills.sh/openaec-foundation/shadcn-ui-claude-skill-package/shadcn-core-registry/security/snyk).
- **Ecosystem pull.** An HN commenter credits shadcn, not AI, for Tailwind UI's sales decline: "I can simply pull fr[om registries]". This is snippet-truncated. — from HN Algolia search hit (thread on premium kits, 2026). The quote is truncated, so use it with care.
- Nexus's own docs concede the point: "Most community blocks and registries target shadcn/ui's token names." — [Nexus introduction.mdx](https://github.com/nexuslabs-ai/nexus/blob/main/apps/docs/content/getting-started/introduction.mdx)

### Inferences
- **"Lock-in to shadcn token names" is less a complaint people voice than a structural fact.** I found no developer complaining about it directly. It surfaces as the price of leaving: blocks, AI output and tutorials all assume `bg-primary` / `destructive` / `card`.
- **Registry quality complaints are thin in what I could reach.** The concrete risks are overwrite collisions, no versions, and supply-chain or prompt-injection exposure.

### Gaps
- No sourced data on third-party block quality (accessibility, maintenance, licensing). Reddit was the likeliest source.
- No developer quotes complaining about token-name lock-in specifically.

---

## 4. Radix UI maintenance concerns and the move to Base UI / React Aria

### Takeaway
The concern is well corroborated and was effectively validated in July 2026, when shadcn made Base UI the default. Radix's co-creator publicly called Radix "a liability" (June 2025). shadcn now supports three bases: Base UI (default), Radix, and React Aria. It says Radix is not deprecated.

### Cited Findings
- **Colm Tuite** (Radix co-creator, now at MUI / Base UI), June 2025 on X: "cool to see so many of you recommending @base_ui in this thread. fwiw, i agree that radix is a liability. off all of the headless ui libs, it's the last option i'd consider for any serious project." Known from a search-result snippet only. He is not neutral: he works on Base UI, and in a follow-up he said "my opinion is obv biased". — [x.com/colmtuite/status/1935629877069172861](https://x.com/colmtuite/status/1935629877069172861), [follow-up](https://x.com/colmtuite/status/1935733171787563432)
- **HN, Jan 2026:** Radix "was built by a team on a Modulz paycheck, then acquired and (more or less) abandoned by WorkOS." — [HN 46693169](https://news.ycombinator.com/item?id=46693169)
- **Dev.to (2025-06-30):**
  - Original maintainers left after the WorkOS acquisition, and contributions slowed, leaving a "concerning number" of open issues and PRs (no counts given).
  - It cites an unlinked "update depth exceeded" setState bug.
  - It says WorkOS is now re-investing, with a developer named Chance triaging.
  - Its advice: keep Radix in existing production apps, and consider React Aria, Ariakit or Base UI for new ones. — [dev.to, mashuktamim](https://dev.to/mashuktamim/is-your-shadcn-ui-project-at-risk-a-deep-dive-into-radixs-future-45ei). Secondary, with weakly sourced claims.
- **Radix issue signals (GitHub search API):**
  - "migrate components to react 19" (#3248, Nov 2024): 36 👍.
  - "TypeScript Error: Slot Component Incompatibility with Next.js 15/React 19" (#3199): 19 👍.
  - "radix-ui package exports map prevents resolving package.json" (#3818, Feb 2026): 19 👍.
  - "Dialog: Focus trap and scrolling issues within Shadow DOM" (#3353, Jan 2025): open, 16 👍. — [radix-ui/primitives issues](https://github.com/radix-ui/primitives/issues)
- **Radix is still maintained, but at reduced capacity.** A search summary reports the repo still "Maintained by @workos", with 2025–26 commits and discussion replies. — [radix-ui/primitives](https://github.com/radix-ui/primitives)
- **shadcn's July 2026 changelog:** "Base UI is stable. It's at 1.6.0 with 6M+ weekly downloads." It also says "Projects created on shadcn/create now pick Base UI over Radix 2 to 1." and "Radix is not being deprecated … every update and new component will ship for both libraries". — [changelog, Base UI as the Default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)
- **React Aria** became a "first-class component base" (July 2026), across all eight styles. — [changelog, React Aria](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)
- **Migration friction.** A GitHub discussion notes Base UI and Radix implement Select differently enough that it is "more than a simple refactor". A Dev.to write-up lists build-breaking changes (`onOpenChange` second argument, `asChild` → `render`) and behaviour changes (Tabs manual activation). Both are per search-result summaries. — [shadcn-ui/ui discussion #6248](https://github.com/shadcn-ui/ui/discussions/6248), [dev.to, preetsuthar17](https://dev.to/preetsuthar17/shadcnui-switched-to-base-ui-here-is-what-actually-changes-in-your-code-18li)
- **HN reaction to the switch:**
  - stefan_: "Nothing says braindead web frontend churn like this post". — [HN 48794216](https://news.ycombinator.com/item?id=48794216)
  - slowjames: "We have customized UI components we got from shadcn and now some use radix and some use base ui." — [HN 48792889](https://news.ycombinator.com/item?id=48792889)

### Inferences
- **The market has moved.** For new projects the default primitive layer is now Base UI (or React Aria), not Radix. A copy-and-own system that is Radix-only now reads as "on the legacy base", even though Radix still works.
- **Copy-and-own softens a primitive-library risk but doesn't remove it.** Owners can migrate one component at a time, but every edited copy has to be migrated by hand or by an agent.

### Gaps
- No primary statement from WorkOS on Radix staffing or roadmap.
- No hard numbers on Radix release cadence or issue backlog. The "126 open issues" figure came from an aggregator snippet and is unverified.

---

## 5. "shadcn sameness": every app looks alike

### Takeaway
This is widely voiced and was conceded by shadcn itself in Dec 2025 ("all apps started looking the same … My bad"). Sources blame defaults and effort more than capability. AI tools that default to shadcn make it worse. shadcn's fix was presets and eight visual styles, which rewrite component code.

### Cited Findings
- **shadcn, Dec 2025:** "somewhere along the way, all apps started looking the same. I guess the defaults were a little too good. My bad."
  - It introduced `npx shadcn create` with Vega, Nova, Maia, Lyra and Mira.
  - "Your config doesn't just change colors, it rewrites the component code to match your setup." — [changelog, npx shadcn create](https://ui.shadcn.com/docs/changelog/2025-12-shadcn-create)
  - Later styles: Luma (Mar 2026), Sera (Apr 2026), Rhea (May 2026), for "eight styles". — [changelog index](https://ui.shadcn.com/docs/changelog), [React Aria entry](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)
- **HN:**
  - sreekanth850 (July 2026): "every app that use shadcn use 100% same. I still have to figure how people differentiate their brand using shadcn." — [HN 48792287](https://news.ycombinator.com/item?id=48792287)
  - nullbio: "All of these component libraries look the same." — [HN 48791947](https://news.ycombinator.com/item?id=48791947)
  - bbg2401 (May 2026): a shadcn project "is nearly immediately identifiable as such because most do not deviate from the defaults". "A UI for toggling border radius and colour palettes isn't going to help this." — [HN 47985939](https://news.ycombinator.com/item?id=47985939)
  - pgisapedo: blames "the homogenization of component libraries like shadcn daisyui etc. all remarkably boring". — [HN thread 48791328](https://news.ycombinator.com/item?id=48791328)
  - A 2025 HN comment: "Figma Make and Claude Code are really just using the out of the box CSS from shadcn that's why everything looks the same." — from the HN Algolia comment search. The author ID is truncated in my output, so treat this as snippet-level.
  - Another HN comment: a 2026 commenter calls shadcn "pretty terrible unless you already have an entire design system you're planning on replacing the defaults with anyways". — from the HN Algolia search hit (thread 49835604 area). Treat as snippet-level.
- **Blogs:**
  - designdotmd (Apr 28 2026): "The defaults are the trap." It points to slate/zinc neutrals, ~0.5rem radius everywhere, Inter, and 1px slate-200 card borders.
  - Its recipe: change the neutral scale and radius, pair fonts, use one saturated accent, and add one "signature token" (shadow, easing, border).
  - It also says "Eventually, tokens are not enough, and you will want to actually customize a few components." — [freedesignmd.com](https://freedesignmd.com/blog/shadcn-looks-generic)
  - The Design Systems Collective post "Is anyone else tired of every Tailwind + shadcn app looking the same" says apps look built "by the same person or worse, the same AI model". Snippet only, paywalled. — [designsystemscollective.com](https://www.designsystemscollective.com/is-anyone-else-tired-of-every-tailwind-shadcn-app-looking-the-same-69c545e73114)
  - LogRocket calls visual sameness one of the most common criticisms. Search snippet. — [LogRocket adoption guide](https://blog.logrocket.com/shadcn-ui-adoption-guide/)

### Inferences
- **Sameness is a recurring complaint**, raised by the vendor, HN and blogs across 2025–26.
- **The fixes people propose are all about tokens across more axes than color and radius:** density, type, shadow, motion, border. In shadcn those other axes live in component code, so they need code rewrites through styles or presets.
- **AI generation is now a main driver of sameness.** A system's defaults and agent guidance matter as much as its theming range.

### Gaps
- No measured data on sameness. All evidence is opinion.
- I don't know whether shadcn's eight styles have reduced the complaint since Dec 2025.

---

## 6. Counter-arguments for copy-and-own

### Takeaway
Defenders argue that copy-and-own avoids all-or-nothing library major versions and transitive upgrade lock. It lets you upgrade one component at a time, and it treats upstream as optional input rather than an obligation. shadcn itself has quietly moved shared plumbing back into npm packages (`shadcn/tailwind.css`, `cn`, `@shadcn/helpers`). That move matches a hybrid "small installed core + copied components" model.

### Cited Findings
- oneneptune (HN, July 2026): with Material UI, "each major version update was a tedious process because they completely upended many APIs". After moving to shadcn, "upgrades are now easy; we can upgrade a single component … With shadcn we can be selective." — [HN 48794963](https://news.ycombinator.com/item?id=48794963)
- slowjames: an MUI v4→v5 migration was forced before a React 18 upgrade. "With shadcn / the copy paste format, you'll almost never see that happen." — [HN 48792889](https://news.ycombinator.com/item?id=48792889), [follow-up 48803396](https://news.ycombinator.com/item?id=48803396)
- jvorick: "it's nothing more than a tool to bootstrap your own UI library … I see Shadcn 'upgrades' as nothing more than a stranger's PR to my UI kit." — [HN 48796142](https://news.ycombinator.com/item?id=48796142)
- victorbjorklund: "If you don't need to make any changes, it should be very simple to just upgrade by replacing the components." — [HN 48791993](https://news.ycombinator.com/item?id=48791993)
- IceDane: "Vendoring your components gives you the best of both worlds." sevenzero: "The less npm installs the better." — [HN 48791722](https://news.ycombinator.com/item?id=48791722), [HN 48791794](https://news.ycombinator.com/item?id=48791794)
- notpushkin wants "a kinda unified component API spec that you can implement however you like, which both humans and AI can pick up". — [HN 48869486](https://news.ycombinator.com/item?id=48869486)
- **Opposing views in the same threads:**
  - rzmmm: "I don't like the copy paste." — [HN 48792149](https://news.ycombinator.com/item?id=48792149)
  - scoot: "everything lives in your own code base" is "A common misconception … Shadcn is a thin wrapper around libraries such as Radix, recharts". — [HN 46689276](https://news.ycombinator.com/item?id=46689276)
  - shubhamjain: "The number of dependencies and files you introduce for trivial components is insane." — [HN 46689332](https://news.ycombinator.com/item?id=46689332)
  - Context: "The Overcomplexity of the Shadcn Radio Button" scored 528 points and 326 comments (Jan 20 2026). — [HN 46688971](https://news.ycombinator.com/item?id=46688971)
- **shadcn re-packaging plumbing:**
  - `init` adds `@import "shadcn/tailwind.css"`, and `shadcn eject` exists to inline it. "This action is irreversible. After ejecting, future shadcn CLI updates to shadcn/tailwind.css will not apply automatically." — [CLI docs](https://ui.shadcn.com/docs/cli), [changelog, eject](https://ui.shadcn.com/docs/changelog/2026-05-shadcn-eject)
  - `cn` moved to a package: "a helper you had to copy into every project and every registry. We have moved that into a package." — [changelog, cn](https://ui.shadcn.com/docs/changelog/2026-09-cn)

### Inferences
- **The strongest pro argument is selective, per-component upgrading** and no forced framework-wide majors. This holds only if you rarely need upstream changes.
- **shadcn's 2026 moves validate a hybrid model.** Putting shared CSS and helpers in npm packages while keeping components copied concedes that some layers should update centrally.

### Gaps
- Reddit's pro and con sentiment could not be sampled.

---

## 7. What do people say a "better shadcn" would need?

### Takeaway
Pulled together from the complaints, people want:
1. **Real update tooling:** versioned installs, base-version tracking, 3-way merge.
2. **A central token layer with per-app brands.**
3. **Design axes beyond color and radius**, configured as tokens rather than component rewrites.
4. **Enforced conventions** so teams and agents don't drift.
5. **A primitive-library choice or migration path.**
6. **Fewer dependencies and less complexity.**
7. **A governance owner** for multi-app use.

### Cited Findings
- **Versioned registry with local tracking** of the installed version, so diffs show upstream changes only. — [#2121 comment, Kamahl19](https://github.com/shadcn-ui/ui/issues/2121) [older, 2023]
- **One shared package or registry, per-app palettes, and shared tokens.** — [daniel-miller/design](https://github.com/daniel-miller/design), [21st.dev monorepo](https://21st.dev/blog/shadcn-monorepo-setup), [dev.to Turborepo starter](https://dev.to/sharathmohan007/stop-copying-shadcn-components-across-projects-use-this-turborepo-starter-instead-3ma1)
- **Tokens as the designer–engineer contract.** "The engineer owns the code. The designer owns the token values." — [Codexical](https://www.codexical.com/posts/2026-06-10-developer-owned-design-system-authority)
- **Hard rules in linters, soft rules in agent files.** kristiandupont: "I keep writing AGENTS.md files for soft rules and custom linter rules for hard ones which IMO is the best of both worlds." — [HN 48791607](https://news.ycombinator.com/item?id=48791607)
- **Deterministic codemods**, possibly LLM-authored, over LLM-run migrations, plus human-readable migration guides. — [HN 48791742](https://news.ycombinator.com/item?id=48791742), [HN 48794196](https://news.ycombinator.com/item?id=48794196)
- **More axes than color and radius**, and a "signature token". — [freedesignmd.com](https://freedesignmd.com/blog/shadcn-looks-generic), [HN 47985939](https://news.ycombinator.com/item?id=47985939)
- **Lint against cross-app imports**, and a single owner package. — [21st.dev monorepo](https://21st.dev/blog/shadcn-monorepo-setup)
- **Less markup and dependency weight.** — [HN 46689332](https://news.ycombinator.com/item?id=46689332), [HN 48796056](https://news.ycombinator.com/item?id=48796056)
- **shadcn's own answer set:** presets and styles, an MCP server, skills, `--diff`/`--dry-run`, three primitive bases, GitHub and private registries. — [changelog index](https://ui.shadcn.com/docs/changelog)

### Inferences
- **Several "better shadcn" asks are now partly met by shadcn itself:** styles and presets, multiple bases, dry-run and diff, agent skills.
- **The asks still unmet** are deterministic versioned updates with 3-way merge, a generated multi-brand token engine, and lint-enforced conventions. A challenger has room on those three.

### Gaps
- No survey data ranking these wants. The list is synthesised from scattered comments.

---

## Does Nexus answer these?

### Takeaway
Nexus is strongest where the pain is tokens and theming: multi-app tokens, multi-brand, per-axis theming, sameness levers, and convention drift. Its engine and ESLint plugin target exactly those. It does not answer the oldest complaint, updating edited components. Its "paste over yours" path is now behind shadcn's `--diff` plus agent merge. On ecosystem, primitive-library risk and churn, it is equal to or worse than shadcn.

### Cited Findings (Nexus facts, verified in this checkout)
- **Update path:** "To update one, paste the newer version over yours." — [introduction.mdx](https://github.com/nexuslabs-ai/nexus/blob/main/apps/docs/content/getting-started/introduction.mdx). Also "paste a newer version to update". — [install.mdx](https://github.com/nexuslabs-ai/nexus/blob/main/apps/docs/content/getting-started/install.mdx)
- **Fork path:** `pnpm export --name=your-design-system` scaffolds the whole system into your monorepo. — [install.mdx](https://github.com/nexuslabs-ai/nexus/blob/main/apps/docs/content/getting-started/install.mdx)
- **Engine and theming:** one engine builds every token from one appearance object. Themable axes are "Color, density, corners, shadows, border width, type, motion", against shadcn's "Color and a radius variable". Contrast is "Checked in CI for every pair". Conventions are enforced by "ESLint rules that fail the build". — [introduction.mdx](https://github.com/nexuslabs-ai/nexus/blob/main/apps/docs/content/getting-started/introduction.mdx)
- **Isolation:** Nexus CSS defines only `nx:` classes and `--nx-` variables. It ships its own CSS entry beside the host's. Examples include adding Nexus to a shadcn app and to a shadcn-based package (`@source './'`). — [introduction.mdx](https://github.com/nexuslabs-ai/nexus/blob/main/apps/docs/content/getting-started/introduction.mdx), [examples.mdx](https://github.com/nexuslabs-ai/nexus/blob/main/apps/docs/content/getting-started/examples.mdx)
- **Self-scoping:** the docs say "One app, one theme … Use shadcn/ui" and "Most community blocks and registries target shadcn/ui's token names." — [introduction.mdx](https://github.com/nexuslabs-ai/nexus/blob/main/apps/docs/content/getting-started/introduction.mdx)
- **ESLint rules shipped:** `nx-class-conventions`, `no-render-prop-types`, `no-multi-statement-jsx-handler`, `canonical-spacing-steps`. — `packages/eslint-plugin-nexus/src/rules/` in [the repo](https://github.com/nexuslabs-ai/nexus)
- **Primitive layer:** `packages/react/package.json` depends on 28 individual `@radix-ui/react-*` packages, not the unified `radix-ui` package. It has no Base UI or React Aria option. — [packages/react/package.json](https://github.com/nexuslabs-ai/nexus/blob/main/packages/react/package.json)
- **Maturity:** `@nexus_ds/core` 0.7.1, `@nexus_ds/react` 0.4.2, `@nexus_ds/eslint-plugin` 0.3.2. The repo has 72 component folders. — package.json files in [the repo](https://github.com/nexuslabs-ai/nexus)

### Mapping

| # | Complaint (source section) | Verdict | One-line reasoning |
|---|---|---|---|
| 1 | No `update` command; edits get overwritten on update (§1, recurring) | **Doesn't** | "Paste the newer version over yours" equals shadcn's `add --overwrite`, with no diff, no dry-run and no merge. |
| 2 | `diff` broken or limited; no 3-way merge against the installed base (§1) | **Makes it worse (relative)** | shadcn now has `add --diff`/`--dry-run` and an agent-merge prompt. Nexus has no version stamp or diff tooling at all. |
| 3 | Restyling or switching visual style rewrites component code (shadcn `create`/`apply` "rewrites the component code"), which collides with local edits (§1, §5) | **Answers it** | Density, corners, shadows, border width, type and motion are generated tokens, so a re-theme never touches copied component files. |
| 4 | Tailwind v3→v4 migration of copied code, with design changes mixed in (§1) | **Partly** | Nexus starts on Tailwind 4 and its token CSS is generated by the engine. A future Tailwind major would still hit every copied file, and the `nx:` prefix adds rewrite surface. |
| 5 | `@radix-ui/react-*` → `radix-ui` package migration (§1) | **Doesn't** | Nexus still uses 28 separate `@radix-ui/react-*` packages, so this migration is still ahead for Nexus and its adopters. |
| 6 | Radix maintenance risk; market moving to Base UI / React Aria (§4, recurring) | **Makes it worse (relative)** | Nexus is Radix-only. shadcn offers Base UI (default), Radix and React Aria, plus a migration skill. |
| 7 | Copies drift across apps; one bug patched in N places (§2, recurring) | **Partly** | Tokens can't drift because one engine generates them, and `pnpm export` gives a shared-package fork. Component source is still copied per app with no sync tool. |
| 8 | Monorepo setup pain: CLI targeting, Tailwind `@source`, where per-app theme lives (§2) | **Partly** | Per-app brand is a separate appearance object, and the shadcn-package example covers `@source`. There is no CLI, so installs are manual. |
| 9 | Hand-written CSS-variable tokens per app; light/dark and brand palettes maintained by hand (§2, §7) | **Answers it** | One appearance object generates every token, including hover and dark values, and contrast is CI-checked per pair. |
| 10 | Convention drift between teams and agents; no enforcement (§2, §7) | **Partly** | ESLint fails the build on wrong token names, raw palette colors, render props and long handlers. It does not stop divergent edits inside component internals. |
| 11 | "Every app looks the same" (§5, recurring) | **Partly** | Nexus has more themable axes than shadcn's color and radius, which matches the "tokens across more axes" fix people propose. shadcn's 8 styles narrow the gap, and Nexus's own defaults can still homogenise. |
| 12 | Wants a big ecosystem of blocks and registries (§3) | **Makes it worse** | Distinct token names (`nx:bg-primary-background`, `error`/`success`/…) mean shadcn blocks don't drop in, and Nexus has no registry install yet. |
| 13 | Third-party registry risk: overwrite collisions, unversioned items, remote code and prompt injection (§3) | **Partly (sidesteps)** | There is no registry and so no remote-registry surface. Collisions and versioning stay unsolved because there is no installer at all. |
| 14 | Lock-in to shadcn token names (§3) | **Partly** | `nx:` isolation lets Nexus sit beside a shadcn app, and DTCG JSON tokens are portable. Adopting Nexus swaps shadcn lock-in for Nexus naming lock-in. |
| 15 | Bloat: too many deps and files for trivial components (§6) | **Doesn't** | Nexus uses the same Radix + CVA + `asChild` architecture and 28 Radix packages, so the complexity profile is the same. |
| 16 | Churn; upgrades are "A Project" (§1, §4, §6) | **Makes it worse** | Nexus is pre-1.0 with no backward-compatibility promise, so breaking changes land in source you must re-paste by hand. |
| 17 | shadcn "is a starting point, not a design system"; enterprises need an owner (§2) | **Partly** | `pnpm export` plus engine plus lint gives a design-system team a governed fork. The ongoing ownership burden is unchanged. |
| 18 | Some layers should update centrally, not be copied (§6; shadcn moved `cn` and `shadcn/tailwind.css` into packages) | **Answers it** | Nexus's split puts the engine on npm and the components as copies. That matches the hybrid shadcn itself moved toward in 2026. |

### Inferences
- **Nexus's differentiation matches the token-side complaints**, which are recurring in §2 and §5. It does not match the update-side complaint, which is the most recurring one in §1.
- **The most exposed positions in Oct 2026 are:**
  - (a) update tooling, now behind shadcn's `--diff` plus agent merge;
  - (b) a Radix-only base after shadcn defaulted to Base UI;
  - (c) no registry or install command.
- **Each of these is the kind of gap reviewers of a "better shadcn" will check first.**
- **Item 3 is Nexus's most defensible structural advantage over shadcn's current approach.** shadcn styles and presets rewrite component code. Nexus moves those axes into generated tokens, so theme changes and component edits stay independent.

### Gaps
- I did not test whether Nexus's 72 components can be re-pasted cleanly over edited copies, or how large a typical Nexus release diff is.
- No user feedback on Nexus itself was found in this research.
