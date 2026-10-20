# AI coding agents and design systems: complaints, fixes, and whether Nexus answers them

Research date: 2026-10-20. Scope: 2025–2026 discussion of how Claude Code, Cursor, Copilot, v0, Lovable, Bolt and Figma Make use or misuse design systems.

Method note: Reddit was not reachable. Search never surfaced r/ClaudeAI, r/cursor, r/webdev, r/DesignSystems or r/vibecoding threads, and direct `reddit.com/*.json` fetches returned HTTP 403. X/LinkedIn posts were reachable only as second-hand mentions. The evidence below is therefore weighted toward practitioner blogs, vendor docs, GitHub repos/issues, conference write-ups and Hacker News (via the Algolia API). Items marked "(snippet)" came from search-result summaries I could not open in full; treat their wording as paraphrase, not quotation.

## 1. What are the most common complaints about AI-generated UI and design-system adherence in 2025–2026?

### Takeaway
The dominant, recurring complaint is that agents fall back to training-data defaults (stock Tailwind palette, shadcn-out-of-the-box, indigo/purple, Inter) instead of the team's system, producing values that are "almost right" and drift screen to screen. Rules files alone do not fix it: agents ignore or forget them. Second-tier complaints are invented or misused tokens, agents rebuilding components that already exist, and the cost of wiring up Figma/MCP context.

### Cited Findings

**Recurring pain A: the agent ignores the system and falls back to defaults (many independent sources)**
- Storybook's MCP launch post states the problem bluntly: "Agents don't know anything about your components so they make up slop that doesn't match your coding standards," and agents invent new patterns instead of reusing existing components (Kyle Gach, 2026-03-23, updated 2026-09-11) — [Storybook blog](https://storybook.js.org/blog/storybook-mcp-for-react/)
- Dejan Veljanoski (Claude + Cursor user) describes screens that were "almost right": "Slightly different button radius. A shade off on the primary color," and an app that "looked like it was built by five different freelancers who'd never met." He blames missing or stale context (the system was absent from the prompt, or a rules file no longer matched the design). Post dated "Jul 30", year not shown, 0 comments — [DEV Community](https://dev.to/dejan_veljanoski/your-ai-coding-tools-are-ignoring-your-design-system-heres-how-i-fixed-it-161j)
- A Medium author found Claude Code output using `#2563EB` (Tailwind's default `blue-600`) instead of the brand blue, plus recurring wrong border radii and dropped font weights; their diagnosis: "Claude was guessing our brand because our repo gave it nothing to trust" (snippet; page returned 403) — [Medium / Bootcamp](https://medium.com/design-bootcamp/claude-kept-hallucinating-our-brand-so-i-rebuilt-our-design-system-as-tokens-1bf02847e6e1)
- Sil Bormüller (Into Design Systems, 2026-04-10) summarises the AI Design Systems Conference 2026: systems were built for humans who read intent into guidelines, while agents fill gaps with training-data assumptions and produce components that "look right but break the system's foundations" — [Into Design Systems](https://www.intodesignsystems.com/blog/design-system-not-ready-for-ai-agents)
- Luke Wroblewski (2026-10-01): without steering, "Each of their agents will happily implement its own tone and voice, colors, spacing, etc." — [LukeW](https://www.lukew.com/ff/2164/design-systems-for-ai-agents)
- Figma's own Workflow Lab case (fictional team "Radicle"): agent-written code drifted from the design — off icons, uneven modal spacing, a toast missing its failure state — so speed gains were eaten by rework. Radar summary dated 2026-08-28 — [ZURB Radar](https://radar.zurb.com/article/figmas-agent-wrote-off-brand-code-until-the-team-fed-it-the-design-system)

**Recurring pain B: hardcoded and off-scale values (hex, px, default palette, arbitrary radius)**
- OverlayQA test of Figma Make (updated 2026-05-05; vendor promoting an inspector): after generating its own design system, the AI's dashboard invented colours (pastel icon backgrounds, a purple-to-pink chart gradient, four extra donut colours), used hardcoded `#FFFFFF`, used 2px padding outside its own 4px scale, and rendered stat numbers Bold/Semibold although headings were defined as Medium. One "completed" badge had four violations. Their diagnosis: "No enforcement layer: tokens were documentation, not constraints" — [OverlayQA](https://overlayqa.com/blog/ai-design-system-drift/)
- shadcn's linter launch framing: "Your AI coding assistant is a design system's worst nightmare, silently introducing rogue styles and arbitrary values" (article dated 2026-09-21) — [Stork.ai](https://www.stork.ai/blog/the-ai-guardrail-for-tailwind-css)
- A guide notes Tailwind ships a large default palette, so `bg-indigo-500` "always compiles unless you remove it" (snippet) — [Techarion](https://techarion.com/blog/design-tokens-claude-md-rules-stop-generic-ai-ui)

**Recurring pain C: invented or misused tokens**
- OverlayQA: a chart token was reused as a status-badge colour, and a subtitle used the right token but the wrong weight. The AI ignored tokens it had defined itself two prompts earlier — [OverlayQA](https://overlayqa.com/blog/ai-design-system-drift/)
- Into Design Systems (citing Romina Kavcic): docs, tokens and components disagree ("documentation drift"), and agents cannot judge which source is correct — [Into Design Systems](https://www.intodesignsystems.com/blog/design-system-not-ready-for-ai-agents)

**Recurring pain D: the generic "AI look" (shadcn defaults, indigo/purple, Inter, Lucide, three-column features)**
- A builder made the same dashboard in Lovable, Bolt and Base44 and got the same left sidebar, rounded card grid and indigo accent (snippet) — [CodeMySpec](https://codemyspec.com/blog/vibe-coded-websites-look-the-same)
- "The purple gradient is not your tool's default: shadcn ships grey" (snippet) — [Banani](https://www.banani.co/blog/vibe-designing)
- Hacker News, 2026-05-02, on a shadcn/ui front-page story (17 points): user `quadral`: "The epitome of all LLM generated websites." They stopped using shadcn because the default look now reads as AI-generated. User `tyleo` assumed shadcn itself was LLM-generated. Replies pushed back that shadcn is meant to be themed (`franky47`: "People use it like a design system, but it's more like a design system for design systems") — [HN 47985052](https://news.ycombinator.com/item?id=47985052)
- Adam Wathan reportedly posted a semi-apologetic tweet in August 2025 (">1M views") about making Tailwind UI buttons `bg-indigo-500`. Second-hand: the article paraphrases and does not link the tweet. Its training-data causal story is speculation, not measurement — [DEV Community (alanwest)](https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p)

**Recurring pain E: inconsistency across separately generated screens**
- Per-screen prompting creates "local decisions with no shared memory": a card on one day has different padding from a card made days later, and a settings page invents its own button hierarchy (snippet) — [DEV Community (horizonxso)](https://dev.to/horizonxso/why-vibe-coded-apps-start-looking-the-same-and-how-to-fix-it-4cko)
- HN user `threatofrain` (2026-05-02) on shadcn: newly installed components "won't know about your customizations," a mild disincentive to customise — [HN 47985052 thread](https://news.ycombinator.com/item?id=47985052)

**Recurring pain F: rules files (CLAUDE.md, .cursor/rules, AGENTS.md, DESIGN.md) are ignored or forgotten**
- GitHub issue "[BUG] Claude Code ignores CLAUDE.md rules repeatedly despite acknowledgment," closed as not planned (snippet) — [anthropics/claude-code #19635](https://github.com/anthropics/claude-code/issues/19635)
- "I Wrote 200 Lines of Rules for Claude Code. It Ignored Them All." (title; snippet) — [DEV Community](https://dev.to/minatoplanb/i-wrote-200-lines-of-rules-for-claude-code-it-ignored-them-all-4639)
- Anthropic's own docs warn that an over-long CLAUDE.md gets half-ignored because important rules are lost in noise (snippet) — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- Supernova notes Anthropic advises against putting design tokens in CLAUDE.md because they change often; suggests referencing a token source and forbidding raw hex instead (snippet) — [Supernova](https://www.supernova.io/blog/what-to-put-in-claude-md-for-a-design-system)

**Recurring pain G: context plumbing is partial, bloated or expensive**
- Brad Frost's point (as summarised, not quoted): MCP returns only what the prompt asks for, so a "card" request returns component metadata while spacing, typography and colour are left to the model — [Into Design Systems](https://www.intodesignsystems.com/blog/design-system-not-ready-for-ai-agents)
- Diana Wolosin (Indeed) benchmark: 77 components, 8 MCP configurations, 1,056 prompts. Markdown averaged ~30,000 tokens per query with 82% coverage and some hallucinations; structured JSON used ~80% fewer tokens (~$300/yr vs ~$1,500/yr). Quote: "Our docs are written for humans. The new user, AI, needs structured metadata, not documentation prose." — [Into Design Systems](https://www.intodesignsystems.com/blog/design-system-not-ready-for-ai-agents)
- Figma MCP output quality tracks file hygiene. Code Connect is the main accuracy lever but one guide estimates 40–80 hours of setup, and a review calls Code Connect and write-to-canvas less reliable than the read path (snippets; the widely repeated "85–90% inaccuracy without Code Connect" figure traces only to "beta reports") — [baeseokjae](https://baeseokjae.github.io/posts/figma-mcp-design-to-code-2026/); [MCP Verdict](https://mcpverdict.com/mcp/servers/design/figma/); [alexbobes](https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/)
- ZURB Radar estimate: adding Figma's MCP server takes an afternoon, mapping key components with Code Connect takes weeks — [ZURB Radar](https://radar.zurb.com/article/figmas-agent-wrote-off-brand-code-until-the-team-fed-it-the-design-system)

**Lower-frequency / one-off complaints**
- v0: a developer could not get v0 to consistently apply a registry design system to new projects through the SDK; another found syncing a customised registry hard (Vercel community; snippets) — [Vercel community 21674](https://community.vercel.com/t/i-cant-add-create-custom-design-system/21674); [Vercel community 16704](https://community.vercel.com/t/customizing-the-shadcn-vercel-registry-template-from-v0/16704)
- Figma Make: an AI-generated design system shipped only 4 colours, no spacing tokens, no interactive states, and a revision broke its own published palette page — [OverlayQA](https://overlayqa.com/blog/ai-design-system-drift/)
- Compaction: after auto-compaction CLAUDE.md is re-read but "the nuance is gone" (single author; snippet) — [AI Weekender](https://aiweekender.substack.com/p/claude-code-keeps-forgetting-your)

### Inferences
- Pains A, B and F are the core triad: the model guesses, the guess is a stock Tailwind value, and the written rule that should have prevented it was skipped. Almost every fix article is a response to that triad.
- The "generic look" (D) is a consumer-facing symptom of A/B, but it is also aimed at shadcn itself. The HN thread shows a reputational cost to being the LLM default.
- Engagement is concentrated in vendor blogs, conference talks and GitHub, not in big community threads. HN stories explicitly on "design systems for AI agents" drew 1–2 points each (see Q3), which suggests DS-team practitioners, not mass developers, are driving the conversation.

### Gaps
- No first-hand Reddit quotes: reddit.com blocked fetches (403) and search did not index relevant threads. I cannot report Reddit engagement counts.
- No X/LinkedIn post text was retrievable directly. Wathan's tweet is known only second-hand.
- No quantitative survey of how often agents violate design systems. The OverlayQA and Medium cases are single tests.
- Copilot, Lovable and Bolt-specific design-system complaints were not found as distinct threads; they appear only inside "all vibe-coded apps look the same" comparisons.

## 2. What solutions are teams adopting, and what works and what doesn't?

### Takeaway
Teams layer four things: a short always-on rules file, tokens as code (often deleting Tailwind's default palette), on-demand component context via MCP (shadcn, Storybook, Figma), and deterministic enforcement (lint, tests, hooks). The consensus in 2026 is that context alone reduces drift but does not stop it. Lint feedback that tells the agent what to use instead is the piece reported to close the gap, and shadcn shipped exactly that in 2026.

### Cited Findings

**Rules files (CLAUDE.md / AGENTS.md / DESIGN.md / Cursor rules)**
- Widely recommended but weak on their own: guides advise putting resolved token values next to names and declaring that tokens beat hardcoded values in the codebase (snippets) — [DesignxMachine](https://designxmachine.beehiiv.com/p/part-3-how-to-write-a-design-md-that-ai-coding-agents-actually-follow); [buildmvpfast](https://www.buildmvpfast.com/blog/design-md-file-ai-coding-agents-brand-consistency-2026)
- Recommended structure from the 2026 AI DS conference: always-on foundation rules, on-demand MCP for components, and an AGENTS.md orchestration file — [Into Design Systems](https://www.intodesignsystems.com/blog/design-system-not-ready-for-ai-agents)
- Luke Wroblewski's working setup: AGENTS.md telling agents to reuse theme classes and CSS variables, a global token stylesheet, reusable components, and a live design-system page agents can inspect. He does not mention lint or automated validation — [LukeW](https://www.lukew.com/ff/2164/design-systems-for-ai-agents)

**Tokens as code and removing defaults**
- Tailwind v4 projects switch off the default palette, radii and shadows so `rounded-xl` "simply stop[s] existing" (snippet) — [AeroTech PR #1](https://github.com/aliifarhadi/AeroTech.Ibe.Website/pull/1); [Techarion](https://techarion.com/blog/design-tokens-claude-md-rules-stop-generic-ai-ui)
- "When tokens like `bg-bg-primary` or `space-md` exist, AI doesn't need to invent design decisions; it selects from a known vocabulary" (snippet) — [Substack (Shah)](https://ravindrasinghshah.substack.com/p/building-a-token-driven-design-system)

**Lint and deterministic guardrails (the fastest-moving area in 2026)**
- shadcn released `@shadcn/lint`, tagline "Write design system rules that agents can verify." Six rules: `no-restyle`, `no-raw-colors`, `no-arbitrary-values`, `no-inline-styles`, `no-unknown-classes`, `require-static-classes`. ESLint 9.30+ or Oxlint 1.80+; React, Svelte and Vue; does not require shadcn/ui; per-component "contracts" (e.g. CardTitle may change typography but not weight). 3.2k stars when fetched. The README says error messages tell agents what broke, what to use instead and where to find it — [shadcn-ui/lint](https://github.com/shadcn-ui/lint)
- shadcn's own (vendor) results: >150 task runs with coding agents, "almost every task reached zero violations in one correction round," and lint-feedback fixes cost 10–48% less than rules-only in Claude control runs — [shadcn-ui/lint](https://github.com/shadcn-ui/lint). A launch article reports zero violations across eight provocation scenarios — [Stork.ai](https://www.stork.ai/blog/the-ai-guardrail-for-tailwind-css)
- Hand-rolled equivalents: EarningsNerd PR #1047 adds eight `no-restricted-syntax` selectors for raw 6-digit hex, raw palette classes and arbitrary z-index/duration/tracking (snippet) — [GitHub PR](https://github.com/neilmac91/EarningsNerd/pull/1047); a custom ESLint rule banning indigo/violet/purple classes and oversized radii (snippet) — [DEV Community](https://dev.to/alanwest/how-to-fix-the-ai-generated-look-in-your-frontend-1ahh)
- Hooks recommended for never-break rules because they run deterministically instead of relying on model attention (snippet) — [Supernova](https://www.supernova.io/blog/what-to-put-in-claude-md-for-a-design-system)
- "Encoding required children, forbidding bad prop combinations, and using TypeScript and linting catch errors earlier," with benefits that scale as agents produce UI (snippet) — [Design Systems Collective](https://designsystemscollective.substack.com/p/when-design-systems-start-acting)

**MCP servers for component libraries**
- shadcn MCP: lets assistants browse, search and install from any registry that follows the shadcn registry spec; configured in `components.json`; supports private registries with auth headers; clients documented: Claude Code, Cursor, VS Code/Copilot, Codex, OpenCode — [shadcn MCP docs](https://ui.shadcn.com/docs/mcp)
- shadcn skills: `pnpm dlx skills add shadcn/ui` gives agents project context via `shadcn info --json`, CLI reference, theming guidance, registry authoring and "Pattern enforcement" ("The assistant follows shadcn/ui composition rules") — [shadcn skills docs](https://ui.shadcn.com/docs/skills)
- Storybook MCP (Storybook 10.3, React only, preview): component context, story-writing instructions, and tools to run component and accessibility tests so agents fix their own failures. Vendor benchmark on the Reshaped library: 12.8% better component usage, 2.76x faster, 27% fewer tokens. Chromatic can host a published MCP for a team — [Storybook blog](https://storybook.js.org/blog/storybook-mcp-for-react/); [Storybook docs](https://storybook.js.org/docs/ai/mcp/overview)
- Supernova's critique: Storybook MCP covers only code and not tokens, docs or publishing; Figma covers design (snippet; Supernova sells the "all three" alternative) — [Supernova](https://www.supernova.io/blog/design-system-mcp-servers)
- Figma MCP + Code Connect: fixed the Radicle team's drift; the agent caught a stale colour token by itself — [ZURB Radar](https://radar.zurb.com/article/figmas-agent-wrote-off-brand-code-until-the-team-fed-it-the-design-system). Costs above (weeks of Code Connect mapping).

**llms.txt**
- Weak for AI search: Ahrefs' server-log study of 137,210 domains reportedly found 97% of llms.txt files got zero requests in May 2026; John Mueller said Lighthouse's llms.txt check is "not done for search" (secondhand via vendor blogs) — [Agent Experience](https://agentexperience.tech/insights/state-of-llms-txt/)
- Coding agents are the exception: in Ahrefs' logs "Claude Code out-fetched the AI retrieval bots"; benefit is developer experience, not visibility (secondhand) — [prufa.dev](https://prufa.dev/blog/agents/llms-txt-who-actually-reads-it/)
- shadcn's docs list llms.txt in navigation, so the market leader ships one too (page did not describe it) — [shadcn docs](https://ui.shadcn.com/docs)

**Governance**
- Trust levels per action (auto-merge / draft PR / suggest only), not per agent. GitHub's Primer agents can only create issues, not merge code (Jan Six) — [Into Design Systems](https://www.intodesignsystems.com/blog/design-system-not-ready-for-ai-agents)
- Spotify Encore split component definitions into foundation, style and behaviour layers ("smaller context bubbles") — [Into Design Systems](https://www.intodesignsystems.com/blog/design-system-not-ready-for-ai-agents)

### Inferences
- What works: deterministic checks that produce corrective, specific error messages, plus a short always-on rule pointing agents to them. What doesn't: long rules files, docs-as-prose dumps, and MCP alone (partial retrieval).
- shadcn now covers the whole stack for its ecosystem: registry + MCP + skills + llms.txt + lint. Any alternative positioning on "conventions enforced for agents" is now competing with a free shadcn tool that has 3.2k stars and agent benchmarks.
- Structured data (JSON manifests, Storybook manifests) is beating Markdown on token cost in the one published benchmark (Wolosin). Large concatenated Markdown dumps are the expensive end of that spectrum.

### Gaps
- Independent (non-vendor) benchmarks of lint-vs-rules-vs-MCP are missing; shadcn's and Storybook's numbers are self-reported.
- I could not confirm a launch date for `@shadcn/lint` beyond the 2026-09-21 article calling it "recent"; the repo shows no releases.
- No data on how many consumer teams actually wire design-system lint into CI versus only into agent instructions.

## 3. Is "the design system as context/guardrails for AI agents" an emerging buying reason? What are DS leaders saying? Does AI make design systems more or less necessary?

### Takeaway
Yes, as a narrative it is now mainstream among DS leaders and vendors (Figma, Storybook/Chromatic, shadcn, Supernova, Brad Frost, Luke Wroblewski, Nathan Curtis). They frame the design system as the "steering layer" or "productivity coefficient" for agents, which argues it is more necessary, not less. I found no survey proving it drives purchase decisions; the evidence is vendor repositioning and conference agendas.

### Cited Findings
- Figma (Ana Boyer, Aug 2025): "Paired with MCP servers, design systems become a productivity coefficient for AI-powered workflows"; the more connected design and code are, "the more useful the MCP server becomes" (snippet) — [Figma blog](https://www.figma.com/blog/design-systems-ai-mcp/)
- Luke Wroblewski (2026-10-01): "a design system for agents is a steering layer for a site's design and front-end code," and "Agents read it every single time." He frames agents as the fix for the old problem of systems drifting from products — [LukeW](https://www.lukew.com/ff/2164/design-systems-for-ai-agents). HN engagement on this post was minimal (1 point, 2 comments) — [HN 49972245](https://news.ycombinator.com/item?id=49972245)
- Brad Frost: "Agentic Design Systems in 2026" session with Chromatic, demoing Storybook MCP; frames coverage (machine-readable patterns, composition rules) and validation (tests, human review) as the two pillars (snippet) — [daily.dev](https://daily.dev/posts/agentic-design-systems-in-2026-with-brad-frost-x3omblytw). His AI & Design Systems course (20+ hours, 200 videos, installable agent SKILLS files; post dated 2026-09-09, price $995 rising to $1,495) (snippet) — [bradfrost.com](https://bradfrost.com/blog/post/our-ai-design-systems-course-is-complete/)
- Nathan Curtis (now Directed Edges): "Components as Data for Humans and Machines" talk at Smashing Amsterdam 2026; in a July 2026 podcast he cautions against using agents where deterministic processes are more precise (snippet; abstract and podcast summary only) — [SmashingConf](https://smashingconf.com/amsterdam-2026/speakers/nathan-curtis/)
- Into Design Systems ran a dedicated AI Design Systems Conference (2026). Data points shared: Indeed produced 4,300 AI prototypes in 4 months; Spotify's Encore has 220,000+ shared style uses with 93% developer satisfaction; Romina Kavcic: 30–40% of DS team time goes to maintenance — [Into Design Systems](https://www.intodesignsystems.com/blog/design-system-not-ready-for-ai-agents)
- Storybook/Chromatic monetise it directly: published, hosted Storybook MCP servers for teams — [Storybook blog](https://storybook.js.org/blog/storybook-mcp-for-react/)
- shadcn lists "AI-Ready: Open code for LLMs to read, understand, and improve" as a core principle — [shadcn docs](https://ui.shadcn.com/docs)
- Figma Config 2026 put agents on the canvas (Agent Skills, shared workflows); one review calls shared skills "table stakes" (snippet) — [Analytics India Mag](https://analyticsindiamag.com/ai-news/figma-unveils-ai-agents-and-code-native-design-tools-at-config-2026); [The Decoder](https://the-decoder.com/figma-bets-on-human-judgment-at-config-2026-while-the-ai-powering-its-canvas-belongs-to-someone-else/)
- Counter-signal: the Figma Make test shows AI can generate a design system, but a thin one (4 colours, no spacing, no states). "AI replaces the design system" is not supported by the evidence I found — [OverlayQA](https://overlayqa.com/blog/ai-design-system-drift/)
- HN signal is thin: "Building design system components with agent teams" (Kaelig) got 2 points — [Kaelig](https://www.kaelig.fr/design-system-components-with-ai-agent-teams/) via [HN Algolia search](https://hn.algolia.com/api/v1/search?query=design%20system%20AI%20agents&tags=story)

### Inferences
- "More necessary" is the near-unanimous position among DS leaders, because agents multiply surface area and need a machine-readable source of truth. The bar has shifted from "documented" to "machine-readable and machine-checked."
- For a buyer, the pitch "your agents will stay on-system" is now table stakes in vendor messaging. Differentiation has moved to how strong the enforcement is and how low the setup cost is.
- Developers (as opposed to DS teams) show low engagement on this topic on HN; their pain shows up as "my app looks AI-generated," not as "I need a design system."

### Gaps
- No survey directly measuring design-system purchase or adoption driven by AI agents.
- Search snippets cited Figma survey figures (90% say design is at least as important; 57% say more important; developers rising from 44% to 65%), but the numbers conflict and I could not tie them to a primary Figma URL. Do not use without verification.
- No direct LinkedIn/X post text from Frost, Curtis, shadcn or Vercel staff was retrievable.

## 4. Does AI favouring shadcn/Tailwind create a moat for shadcn and a hurdle for alternatives with different token names?

### Takeaway
Partly. shadcn's moat is less about training-data weights and more about becoming the distribution protocol (registry spec, MCP, skills, v0 integration) and now the guardrail tool (`@shadcn/lint`). Different token names do cost alternatives an extra correction round, but published evidence shows context plus lint feedback overcomes the bias. The "looks AI-generated" backlash is a real opening for alternatives that look different.

### Cited Findings
- Tony Dinh (TypingMind) called shadcn the "default UI lib of LLMs" (snippet; anecdote) — [Vibe Coder blog](https://blog.vibecoder.me/shadcn-ui-component-library-ai-development)
- HN `nayroclade` (2026-02-27): "AIs love Tailwind, so it makes sense they'd adopt a component library that uses it"; `yokuze`: "There are older and more established component libraries, so why'd this one win?" and says a "scientific answer would be worth a lot" — [HN 47174021](https://news.ycombinator.com/item?id=47174021)
- v0's registry-based design-system workflow "assumes you follow the `shadcn/ui` CSS variables standard"; the registry is the handoff layer from a design system to v0. The page now labels itself legacy in favour of "Design Systems 2.0," whose requirements I could not read — [v0 docs](https://v0.app/docs/design-systems)
- v0 states it is "still capable of generating code using other component libraries, styling tools, and even frameworks" — [v0 docs](https://v0.app/docs/design-systems)
- shadcn MCP works with "any registry that follows the shadcn registry specification"; third-party libraries (Cult UI, 21st.dev Agent Elements, DataRobot) publish shadcn-compatible registries to plug in (search results) — [shadcn MCP docs](https://ui.shadcn.com/docs/mcp); [Agent Elements](https://agent-elements.21st.dev/docs/mcp); [Cult UI](https://cult-ui.com/docs/mcp-server)
- `@shadcn/lint` does not require shadcn/ui and supports React, Svelte and Vue; design-system packages are added via `themeImports` — [shadcn-ui/lint](https://github.com/shadcn-ui/lint)
- shadcn made Base UI the default primitive layer for new projects in July 2026, with Radix still available (snippet) — [shadcn changelog](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)
- Evidence that context overcomes the default: Storybook's benchmark used Reshaped (a non-shadcn library) and still gained 12.8% component usage with MCP — [Storybook blog](https://storybook.js.org/blog/storybook-mcp-for-react/). shadcn reports nearly every agent task reached zero violations after one lint correction round — [shadcn-ui/lint](https://github.com/shadcn-ui/lint)
- Backlash: HN `quadral` stopped using shadcn because "every LLM defaults to" it and their site looked LLM-generated — [HN 47985052](https://news.ycombinator.com/item?id=47985052)

### Inferences
- The training-data advantage is real but shallow: it determines the agent's first guess (`bg-primary`, `bg-accent`, `hover:bg-primary/90`), not whether the agent can comply. A library with different names pays a correction-round tax on every generation unless its lint messages name the replacement.
- The deeper moat is protocol: v0, the shadcn MCP and third-party registries all assume the shadcn registry spec and CSS-variable naming. A library outside that spec cannot be installed by agents through the de facto channel.
- shadcn entering lint narrows the space for "we enforce conventions for agents" as a unique claim. An alternative now has to win on stricter semantics, better messages, or a different look.

### Gaps
- No benchmark compares agent accuracy on shadcn vs MUI, Chakra, Mantine or a custom-token library. No source measured how many extra turns a non-shadcn vocabulary costs.
- Could not confirm whether v0 "Design Systems 2.0" still requires the shadcn registry/CSS-variable standard.

## Does Nexus answer these?

Basis: the product brief, plus a read of the repo at `/home/user/nexus` — `packages/eslint-plugin-nexus/README.md`, `packages/eslint-plugin-nexus/src/rules/nx-class-conventions.js`, `packages/eslint-plugin-nexus/src/config.js`, and `apps/docs/content/getting-started/ai-agents.mdx` ([repo](https://github.com/nexuslabs-ai/nexus)). Facts verified there: `nx-class-conventions` flags wrong prefix order, the banned `accent` token, incomplete semantic paths (`nx:bg-primary` without `-background`/`-foreground`/`-subtle`), raw palette colours on `bg`/`text`/`border`, and raw font-size/weight/line-height/letter-spacing utilities. Its messages name the replacement (e.g. "use `nx:bg-primary-background`, not `nx:bg-blue-500`"). An optional `nexusTailwindClassesConfig` runs `better-tailwindcss/no-unknown-classes` against the theme, reporting typos and classes the theme does not emit. The `canonical-spacing-steps` rule checks Nexus's own spacing token JSON, not app code. Consumers get these via `nexusComponentConfig()`.

| Complaint | Verdict | One-line reasoning |
| --- | --- | --- |
| A. Agent ignores the system, falls back to stock Tailwind/shadcn defaults | Partly | Lint turns the commonest fallbacks (raw palette, `accent`, bare `bg-primary`, raw font sizes) into build errors, but nothing puts Nexus context in front of the agent automatically (no MCP, no skill, no AGENTS.md snippet on the AI agents page). |
| B. Hardcoded colours and off-scale values | Partly | Raw palette classes are caught, but arbitrary values (`nx:bg-[#2563eb]`, `nx:p-[13px]`), inline `style` hex, and palette classes on `ring`/`fill`/`stroke`/`outline` pass. shadcn/lint's `no-arbitrary-values` and `no-inline-styles` cover these. |
| B2. Off-scale spacing in app code | Doesn't | The spacing-step rule lints Nexus's token files only. No rule constrains spacing classes in consumer code. |
| C. Invented or misnamed tokens | Answers (if opted in) | `no-unknown-classes` against the Nexus theme reports any class the theme does not emit, and `incompletePath`/`bannedAccent` catch shadcn-shaped guesses. It needs the optional peer dependency and an absolute `entryPoint`. Misusing a real token (chart colour as status) still passes. |
| D. Generic "AI/shadcn look" | Partly | Nexus has its own semantic token vocabulary and themes, so output is not stock shadcn grey or indigo. Components are shadcn-derived, though, and lint does not shape layout or composition choices. |
| E. Inconsistency across separately generated screens | Partly | A shared semantic vocabulary plus lint narrows drift. No equivalent of shadcn's `no-restyle` stops per-screen `className` overrides on components. |
| F. Rules files ignored or forgotten | Answers | ESLint fails the build whether or not the agent read the rules. This is the deterministic layer practitioners say rules files lack, but the consumer must wire it into CI or tell the agent to run lint. |
| G. Agents rebuild components instead of reusing them | Partly | `/llms.txt` lists every component page, so an agent can discover them. There is no component manifest, MCP or lint rule that pushes reuse (e.g. "use Button, not `<button>`"). |
| G2. Partial or bloated context (MCP returns only what's asked; Markdown too token-heavy) | Partly | `/llms.txt` plus per-page `.md` matches how coding agents actually fetch docs. `/llms-full.txt` (~2 MB) is the expensive Markdown-dump pattern Wolosin's benchmark found worst. There is no structured JSON of components or tokens. |
| Docs drift between docs, tokens and components | Partly | Docs demos are generated from stories and props from JSDoc (per repo rules), which limits drift. This is not exposed as an agent-facing guarantee. |
| No agent install path (`shadcn add` via MCP / registry) | Doesn't | No registry CLI and no MCP server, so agents in v0, Cursor and Claude Code cannot install Nexus components through the de facto channel. |
| Figma-to-code drift (Figma MCP / Code Connect) | Doesn't | Nothing in the brief or docs mentions a Figma library or Code Connect mapping. |
| Training data favours shadcn class names | Partly | Lint messages name the Nexus replacement, the same "agent-first message" approach shadcn reports converges in one round. There is no measured data on correction rounds for the `nx:` vocabulary, and every generation likely starts with the wrong guess. |
| Framework coverage (Storybook MCP is React-only; shadcn/lint covers React, Svelte, Vue) | Doesn't (outside React) | Nexus is React-only. |
| Competitive overlap: shadcn now ships an agent-first linter | Partly | Nexus is stricter on token semantics (suffix paths, no `accent`, typography composites, focus-ring transition check). It is narrower on arbitrary values, inline styles and component restyling, and it publishes no agent benchmark. |

Net for the report writer: Nexus's "Conventions are enforced, for people and agents" claim is substantiated for token-shape errors, the area where agents trained on shadcn will most often go wrong. Three practitioner pains remain open: getting context into the agent (MCP or skill), installing components through an agent, and catching arbitrary values and restyles. `@shadcn/lint` (3.2k stars, React/Svelte/Vue, agent-tested) now competes directly on the enforcement message.
