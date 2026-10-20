# Nexus UI fact sheet: what it ships, what it claims, how it is perceived (as of 2026-10-20)

Snapshot: local repo `/home/user/nexus` at commit `61e1776` (2026-10-20). That commit is `main` HEAD, and CI and Release are green on it ([GitHub Actions run list via `gh run list`](https://github.com/nexuslabs-ai/nexus/actions)). File links below point at that commit, so `path:Lx-Ly` is the local file and the URL is the same file on GitHub. The local clone is shallow (50 commits back to 2026-09-25), so older history comes from GitHub and the CHANGELOGs. Tests were not run locally because `node_modules` is not installed. "Verified" below means I read the code or test, and CI on `main` passes.

Labels used: **SHIPPED** = in code and verified. **CLAIMED** = docs say it, and the code supports it only partly or not at all. **PLANNED** = an open issue or a "coming soon" note.

## 1. What Nexus claims in its docs

### Takeaway
Nexus markets itself as "a framework-agnostic theme engine that ships components". The headline claims are: copy-and-own React components, one appearance object for every axis, APCA contrast checked in CI, CSS that stays out of the host app, ESLint-enforced conventions and AI-readable docs. The home page calls it an "AI-native design system" with the tagline "Design once. Ship every brand."

### Cited Findings
- Home hero: "AI-native design system", "Design once. Ship every brand.", "A framework-agnostic theme engine with components you copy into your app and own. Set your brand once, and every component follows it." — [apps/docs/app/(docs)/page.tsx:L118-125](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/app/(docs)/page.tsx#L118-L125)
- "Nexus is a framework-agnostic theme engine that ships components, not a component library with a theme added on." — [introduction.mdx:L6](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/introduction.mdx#L6)
- The six "philosophy" claims, near-verbatim — [introduction.mdx:L14-51](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/introduction.mdx#L14-L51):
  1. "You own the components… To update one, paste the newer version over yours."
  2. "One engine makes every token… One function builds every color, hover shade and dark-mode value… so light and dark can't drift apart."
  3. "Every axis is a setting. Density, corners, shadows, border width, type and motion are settings, just like color. 'Make this product denser' is a one-field change, not a refactor."
  4. "Contrast is checked, not eyeballed. Every text and background pair has a minimum contrast score, and CI fails the build when one drops below it."
  5. "Nexus fits next to your app. Nexus CSS defines only `nx:` classes and `--nx-` variables, so your own styles stay as they are."
  6. "Conventions are enforced, for people and agents. ESLint rules turn Nexus conventions into build errors." Every docs page is also available as Markdown.
- shadcn/ui comparison table. Nexus claims: its own CSS entry beside yours; tokens written "by the engine, from one appearance object"; themeable "Color, density, corners, shadows, border width, type, motion"; contrast "Checked in CI for every pair"; conventions enforced by "ESLint rules that fail the build" — [introduction.mdx:L59-68](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/introduction.mdx#L59-L68)
- The docs admit fit limits: "One app, one theme… Use shadcn/ui"; "You want a large ecosystem. Most community blocks and registries target shadcn/ui's token names"; "You need a screen today. Nexus asks you to adopt its token conventions first." — [introduction.mdx:L72-76](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/introduction.mdx#L72-L76)
- FAQ: "The part you install from npm is the theme engine." Tailwind 4 plus a `box-sizing` reset are required. "The components are React only today. Vue, Svelte, Angular and React Native bindings are planned." "Live theme changes on native need a port of the engine." — [introduction.mdx:L80-93](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/introduction.mdx#L80-L93)
- Appearance: "Every option ships in the stylesheet… Switching an option needs no rebuild." "Reduced motion, pointer cursors and font smoothing apply to the whole page. All three are off until a user turns them on." — [appearance.mdx:L19-37](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/theming/appearance.mdx#L19-L37)
- Contrast setting: "Lower it for a softer look. Text stays readable at `0`." — [appearance.mdx:L152-159](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/theming/appearance.mdx#L152-L159)
- Tokens: "Same function, same inputs, same output. The page looks right with JavaScript off, and a live theme change needs no rebuild." "Light and dark come from the same call, so dark mode can't drift from light." — [tokens.mdx:L67-81](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/foundations/tokens.mdx#L67-L81)
- Color page: "Nexus checks contrast with APCA… not WCAG 2 ratios. WCAG 2 ratios misjudge the mid-tone pairs a token system produces all the time." "CI derives themes across many brand colors, surface tones and contrast settings, then checks every pair in each one." "CI also checks that the palettes stay distinct for color-blind users." — [color.tsx:L299-321](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/app/_pages/foundations/color.tsx#L299-L321)
- The same page carries a qualifier: "Each foreground is checked against the surfaces Nexus pairs it with. On any other surface, check the contrast yourself." — [color.tsx:L207-208](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/app/_pages/foundations/color.tsx#L207-L208)
- Examples page: "Adding Nexus changes none of the host app's own styles in any example." — [examples.mdx:L18](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/examples.mdx#L18)
- AI agents page: "/llms.txt" indexes every page, ".md" can be added to any URL, and "/llms-full.txt… is about 2 MB" — [ai-agents.mdx:L6-36](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/ai-agents.mdx#L6-L36)
- Root README: "Nexus UI is a framework-agnostic theme engine and design system. Set one appearance object, and every component follows your brand, density and corners." — [README.md:L3](https://github.com/nexuslabs-ai/nexus/blob/61e1776/README.md#L3)

### Inferences
- The positioning is "theme engine first, components second". The direct comparison target is shadcn/ui. The docs openly point small single-brand projects to shadcn/ui, which is unusually candid and lowers the risk of over-claiming.

### Gaps
- The "Why Nexus" page added in PR #856 is no longer in `apps/docs/content`. It appears to have been folded into the Introduction by "docs: simplify the docs IA (#866)" ([git log, commit list](https://github.com/nexuslabs-ai/nexus/commits/main)). I did not recover its old wording.

## 2. Claim vs code: what actually ships

### Takeaway
Most core claims hold up in code: the single derivation engine, APCA pairs gated in CI, the `nx:` CSS isolation test, runtime theme switching and the lint rules. The main gaps are four. "Motion" is not a runtime axis beyond a reduce-motion toggle. "Every text and background pair" means 116 registered pairs per mode, not every pair. Borders and disabled fills are not gated, and an open bug shows invisible disabled buttons in dark mode. The "0 host styles changed" proof runs by hand, not in CI.

### Cited Findings
**Components (SHIPPED)**
- There are 72 folders under `packages/react/src/components`. 71 are exported from `packages/react/src/index.ts`, and `overlay-layout` is internal. The `appearance` folder holds 7 sub-parts (provider, settings, brand-color-field, color-field, config-preview, setting-row, theme-quick-control) — local listing of [packages/react/src/components](https://github.com/nexuslabs-ai/nexus/tree/61e1776/packages/react/src/components) and [packages/react/src/index.ts](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/react/src/index.ts)
- The live docs list the same 71 component pages, plus 7 blocks (1 editing, 6 filtering) and 2 patterns (Filtering, Forms) — [nexusui.so/llms.txt](https://nexusui.so/llms.txt) (fetched 2026-10-20) and [packages/react/src/blocks](https://github.com/nexuslabs-ai/nexus/tree/61e1776/packages/react/src/blocks)
- The component list: accordion, alert, alert-dialog, appearance, aspect-ratio, attachment, avatar, badge, breadcrumb, bubble, button, button-group, card, carousel, chart, checkbox, choice-card, choice-row, collapsible, combobox, command, context-menu, date-picker, description-list, dialog, drawer, dropdown-menu, empty-state, field, filter-builder, filter-chip, filter-condition, hide, hover-card, input, input-group, input-otp, item, kbd, label, marker, menubar, message, message-scroller, multi-select, native-select, navigation-menu, page-header, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, show, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toggle, toggle-group, toolbar, tooltip — [packages/react/src/components](https://github.com/nexuslabs-ai/nexus/tree/61e1776/packages/react/src/components)
- The stack is React 19 only (peer `react ^19.0.0`), with ~30 `@radix-ui/*` primitives, CVA, cmdk, input-otp and Tabler icons. Optional peers are vaul, recharts, sonner, react-day-picker, embla-carousel-react and react-resizable-panels — [packages/react/package.json](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/react/package.json)
- There are 77 `*.stories.tsx` files under components. Every story runs axe with `test: 'error'` — [packages/react/.storybook/preview.tsx:L265-280](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/react/.storybook/preview.tsx#L265-L280). CI runs `pnpm test:storybook` — [ci.yml:L362](https://github.com/nexuslabs-ai/nexus/blob/61e1776/.github/workflows/ci.yml#L362)
- A size budget is enforced in CI with `size-limit`, main bundle limit "102 kB" — [package.json:L50-63](https://github.com/nexuslabs-ai/nexus/blob/61e1776/package.json#L50-L63), [ci.yml:L408](https://github.com/nexuslabs-ai/nexus/blob/61e1776/.github/workflows/ci.yml#L408)
- No Figma library ships. "docs: remove Figma mentions" (#832) removed the references — [commit 7d2262e](https://github.com/nexuslabs-ai/nexus/commit/7d2262e). No visual-regression service (Chromatic or Percy) is configured in CI — [ci.yml](https://github.com/nexuslabs-ai/nexus/blob/61e1776/.github/workflows/ci.yml)

**"One engine makes every token" (SHIPPED)**
- `@nexus_ds/core` exports `deriveTheme` and `themeToCss` ([index.ts:L18](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/index.ts#L18)). It also exports `createNexusThemeContract`, which maps appearance state to engine input with both light and dark seeds ([appearance-model.ts:L295-305](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/appearance-model.ts#L295-L305)). `themeToCss` emits `:root` and `:root.dark` blocks — [derive-theme.ts:L464](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/derive-theme.ts#L464)
- The first-paint bootstrap script toggles `.dark` and sets `data-density`, `data-radius`, `data-shadow` and `data-borderwidth` on `<html>`. It also upserts two `<style>` tags holding the theme CSS and prefs CSS, read from localStorage — [appearance-snapshot.ts:L254](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/appearance-snapshot.ts#L254)
- Non-color tokens (spacing, radius, shadow, border width, motion, typography) are DTCG JSON in `packages/core/tokens/` — [packages/core/tokens](https://github.com/nexuslabs-ai/nexus/tree/61e1776/packages/core/tokens)

**"Every axis is a setting" (mostly SHIPPED, motion only partly)**
- The appearance state has these fields: `mode`, `brandColor`, `surfaceTone`, `lightContrast`, `darkContrast`, `density` (6 options), `corners` (5), `elevation` (5), `stroke` (3) and `prefs`. `prefs` holds `uiFont`, `codeFont`, `uiFontSize`, `codeFontSize`, `reduceMotion`, `pointerCursors` and `fontSmoothing` — [appearance-model.ts:L28-50, L125-144](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/appearance-model.ts#L28-L144)
- The defaults are `mode: 'light'`, `brandColor: '#0a0a0a'`, `surfaceTone: 'zinc'`, contrast 50/50, `density: 'default'`, `corners: 'subtle'`, `elevation: 'quiet'`, `stroke: 'normal'`, and `reduceMotion`, `pointerCursors` and `fontSmoothing` all `false` — [appearance-model.ts:L125-144](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/appearance-model.ts#L125-L144)
- Motion has one token mode only, `tokens/primitives/motion/motion-snappy.json`. That mode supplies duration tokens 0 to 500 ms and 4 easings ([variables.css:L345-356](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/tailwind/variables.css#L345-L356)). `nexus.css` has no `[data-motion]` selector, and the appearance model has no motion field except `prefs.reduceMotion` — local grep of [packages/tailwind/nexus.css](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/tailwind/nexus.css) and [appearance-model.ts](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/appearance-model.ts)
- Density, radius, shadow and border width have per-mode blocks keyed on `[data-density]`, `[data-radius]`, `[data-shadow]` and `[data-borderwidth]` in `nexus.css` — [packages/tailwind/nexus.css](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/tailwind/nexus.css). They can be scoped to any element, but colors and brand cannot: "The other fields apply to the whole app." — [overrides.mdx:L29-36](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/theming/overrides.mdx#L29-L36)

**"Contrast is checked… CI fails the build" (SHIPPED, narrower than worded)**
- 116 foreground/background pairs are registered per mode (my manual count of `APCA_PAIRS`). They cover text on surfaces, labels on all 6 family fills (base, hover, active), subtle fills, 5 chart series, focus rings on 7 surfaces, and translucent popovers — [apca-pairs.ts:L73-145](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/apca-pairs.ts#L73-L145)
- The tier floors are body Lc 75, ui Lc 60, incidental Lc 45 — [palette.ts:L31-35](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/palette.ts#L31-L35)
- One CI sweep covers 5 surface tones × 7 brand colors (#000, #fff, #808080, #ffff00, #7656cc, #00ff00, #ff0000) × all 101 contrast stops × both modes. It asserts every pair clears its floor — [contrast.test.ts:L18-73](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/contrast.test.ts#L18-L73). A second sweep covers seed sets × tones × contrast 0/50/100 — [derive-theme.test.ts:L953-984](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/derive-theme.test.ts#L953-L984). CI runs both as `audit:contrast` — [ci.yml:L305-307](https://github.com/nexuslabs-ai/nexus/blob/61e1776/.github/workflows/ci.yml#L305-L307)
- No border or non-text pair is registered. Fields use `nx:border-border-default` ([input.tsx:L23](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/react/src/components/input/input.tsx#L23)), which in light mode is `oklch(0.1448 0 0 / 0.0884)`, a near-black at 8.84% alpha ([nexus.css:L325](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/tailwind/nexus.css#L325)). The docs list light-mode border opacity running "6%" to "11.68%" across the contrast range — [color.tsx:L158](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/app/_pages/foundations/color.tsx#L158)
- An open bug says "disabled and loading primary Buttons are nearly invisible in dark mode". `primary-disabled` is not an APCA-gated pair — [issue #857](https://github.com/nexuslabs-ai/nexus/issues/857), [apca-pairs.ts](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/apca-pairs.ts)
- The docs say the checks gate token values, not rendered components: "The CI checks prove the values, not the components" — [tokens.mdx:L100](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/foundations/tokens.mdx#L100)
- Consumers get a runtime contrast report: `measureThemeContrast(theme)` returns pass/fail per pair — [theme-contrast.ts:L28-53](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/theme-contrast.ts#L28-L53), [core README](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/README.md)
- The color-blind audit runs in CI ([ci.yml:L311](https://github.com/nexuslabs-ai/nexus/blob/61e1776/.github/workflows/ci.yml#L311)). It has one accepted limitation: "Under deuteranopia the Success (Green) and Warning (Orange) 600 shades are hard to tell apart, so status UI must pair color with an icon and label." — [packages/core/README.md:L60](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/README.md#L60)

**"Conventions are enforced" (SHIPPED)**
- `@nexus_ds/eslint-plugin` has 4 rules: `nx-class-conventions`, `no-render-prop-types`, `no-multi-statement-jsx-handler` and `canonical-spacing-steps` — [eslint-plugin src/index.js:L14-19](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/eslint-plugin-nexus/src/index.js#L14-L19). `nexusComponentConfig()` turns on the first three as errors. `nexusSpacingTokenConfig()` turns on the fourth. A separate `nexusTailwindClassesConfig` wraps `better-tailwindcss/no-unknown-classes` — [config.js:L3-42](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/eslint-plugin-nexus/src/config.js#L3-L42), [tailwind.js](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/eslint-plugin-nexus/src/tailwind.js)

**AI-readable docs (SHIPPED)**
- Live `https://nexusui.so/llms.txt` lists 94 page links. `/llms-full.txt` returned HTTP 200 with 1,797,125 bytes, and per-page `.md` works (for example `/components/button.md`) — [nexusui.so/llms.txt](https://nexusui.so/llms.txt), [nexusui.so/llms-full.txt](https://nexusui.so/llms-full.txt), [nexusui.so/components/button.md](https://nexusui.so/components/button.md). The build script is [apps/docs/scripts/write-markdown.mjs:L175-232](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/scripts/write-markdown.mjs#L175-L232)
- No consumer-facing MCP server ships. The repo's `docs-mcp/` is a contributor Docker image for third-party docs — [docs-mcp/](https://github.com/nexuslabs-ai/nexus/tree/61e1776/docs-mcp), [README.md Prerequisites](https://github.com/nexuslabs-ai/nexus/blob/61e1776/README.md)

**Stale or contradictory docs (CLAIMED vs reality)**
- The root README says `packages/core` is "Internal design tokens and theme definitions (not published)" ([README.md:L32](https://github.com/nexuslabs-ai/nexus/blob/61e1776/README.md#L32)). In fact it is published as `@nexus_ds/core` 0.7.1 ([npm registry](https://registry.npmjs.org/@nexus_ds/core)).
- The core README tells React users to use it "via `@nexus_ds/react/appearance`" ([packages/core/README.md:L3](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/README.md#L3)). That package is private and not on npm ([npm registry 404](https://registry.npmjs.org/@nexus_ds/react)).
- CONTRIBUTING says `@nexus_ds/react` is "delivered by the export tool (#541)" ([CONTRIBUTING.md:L154](https://github.com/nexuslabs-ai/nexus/blob/61e1776/CONTRIBUTING.md#L154)). Epic #794 lists #541 as closed and replaced — [issue #794](https://github.com/nexuslabs-ai/nexus/issues/794)
- The polish rule says "Use motion tokens once #159 lands" ([.claude/rules/polish.md:L98-102](https://github.com/nexuslabs-ai/nexus/blob/61e1776/.claude/rules/polish.md#L98-L102)). But #159 was closed "not_planned" on 2026-06-25 ([issue #159](https://github.com/nexuslabs-ai/nexus/issues/159)), and motion tokens exist anyway ([variables.css:L345-356](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/tailwind/variables.css#L345-L356)).

### Inferences
- The engine and contrast pipeline are real, well-tested and CI-gated. That is the strongest evidence-backed differentiator.
- "Every text and background pair" overstates coverage. The gate covers a curated registry of 116 pairs per mode. It skips non-text UI boundaries (input borders) and disabled fills, and #857 shows a real failure in that blind spot.
- "Motion is a setting" is weak. Users can only turn motion off through the reduce-motion toggle. There is no motion personality axis to match density or corners.

### Gaps
- I could not run the test suite locally (no `node_modules`). Pass status rests on the green CI run on `main` for `61e1776`.
- I did not render components to check their real contrast in a browser.

## 3. Install and update path, package versions, published vs private

### Takeaway
Installation today is manual copy-paste from the GitHub repo, plus one npm dependency, `@nexus_ds/core`. A shadcn-compatible registry is planned in #798, and the docs "Command" tab says "Coming soon." Updates mean pasting a newer copy over your own, with no diff, merge or CLI. Only `@nexus_ds/core` 0.7.1 and `@nexus_ds/eslint-plugin` 0.3.2 are on npm. Both are pre-1.0, and breaking changes ship as minor bumps.

### Cited Findings
- Package versions: `@nexus_ds/core` 0.7.1 (public), `@nexus_ds/eslint-plugin` 0.3.2 (public), `@nexus_ds/react` 0.4.2 (`private: true`), `@nexus_ds/tailwind` 0.1.0 (`private: true`), `@nexus_ds/docs` 0.0.11 (private) — [packages/core/package.json](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/package.json), [packages/eslint-plugin-nexus/package.json](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/eslint-plugin-nexus/package.json), [packages/react/package.json](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/react/package.json), [packages/tailwind/package.json](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/tailwind/package.json)
- "Only the two runtime packages publish to npm; everything else is either internal or copy/own." — [CONTRIBUTING.md:L145-155](https://github.com/nexuslabs-ai/nexus/blob/61e1776/CONTRIBUTING.md#L145-L155). Publishing runs through changesets and npm trusted publishing (OIDC) with provenance — [release.yml:L3-33](https://github.com/nexuslabs-ai/nexus/blob/61e1776/.github/workflows/release.yml#L3-L33)
- On npm, `@nexus_ds/core` has 10 versions, first published 2026-07-01. `@nexus_ds/eslint-plugin` has 6 versions. `@nexus_ds/react` and `@nexus_ds/tailwind` return "Not found" — [registry.npmjs.org/@nexus_ds/core](https://registry.npmjs.org/@nexus_ds/core), [registry.npmjs.org/@nexus_ds/eslint-plugin](https://registry.npmjs.org/@nexus_ds/eslint-plugin), [registry.npmjs.org/@nexus_ds/react](https://registry.npmjs.org/@nexus_ds/react)
- `@nexus_ds/core` runtime dependencies are only `apca-w3` and `culori`. It requires Node >=20.19.0 — [packages/core/package.json](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/package.json)
- The manual install has four setup steps before the first component — [install.mdx:L11-184](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/install.mdx#L11-L184):
  1. Install Tailwind 4.
  2. Copy 7 CSS files from `packages/tailwind/`, install `tw-animate-css` and import Preflight.
  3. `npm install @nexus_ds/core`, copy the 5-file provider folder, create the appearance state, then add the script and provider to the layout.
  4. Install `clsx` and `tailwind-merge`, and copy `lib/utils.ts`.
- Each component then lists its prerequisite components, npm packages and files. Button, for example, needs Spinner first, plus `@radix-ui/react-slot` and `class-variance-authority`, plus `button.tsx` (218 lines) and `button-group-context.ts` — [nexusui.so/components/button.md](https://nexusui.so/components/button.md)
- In a new app, the `nx:` prefix applies to every Tailwind class, and Tailwind's default colors are removed: "`nx:flex` works, `flex` does not… Tailwind's default colors are gone." — [install.mdx:L70-74](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/install.mdx#L70-L74)
- Registry is PLANNED. The docs code has `{/* TODO(#798): replace with the registry install command. */}` above a "Command" tab that reads "Coming soon." — [ComponentInstallation.tsx:L61-72](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/app/_components/ComponentInstallation.tsx#L61-L72). The live component pages render the same "Coming soon." — [nexusui.so/components/button](https://nexusui.so/components/button)
- The examples copy by hand. "Delivery through a shadcn registry, and running these examples in CI, are tracked in #798." — [examples/README.md:L20-21](https://github.com/nexuslabs-ai/nexus/blob/61e1776/examples/README.md#L20-L21)
- The update path: "To update one, paste the newer version over yours." ([introduction.mdx:L16-18](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/introduction.mdx#L16-L18)) "Don't edit `nexus.css`, because pasting a newer copy replaces it." ([install.mdx:L76-77](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/install.mdx#L76-L77))
- Issue #798 scope says the registry will carry "guidance to review updates as diffs. No automatic overwrite and no 3-way merge." Epic #794 lists "a custom CLI, automatic source merging / 3-way merge" as out of scope — [issue #798](https://github.com/nexuslabs-ai/nexus/issues/798), [issue #794](https://github.com/nexuslabs-ai/nexus/issues/794)
- To fork the whole system, run `pnpm export --name=your-design-system` ([install.mdx:L485-489](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/install.mdx#L485-L489)). The script calls itself an "Interim stopgap ahead of the CLI (registry + 3-way merge). See issue #541." ([scripts/export.mjs:L1-12](https://github.com/nexuslabs-ai/nexus/blob/61e1776/scripts/export.mjs#L1-L12)). #798 plans to retire `pnpm export` — [issue #798](https://github.com/nexuslabs-ai/nexus/issues/798)
- Versioning policy: "stay on 0.x. A breaking change ships as a `minor` changeset, never `major`. `1.0` waits until Nexus can promise stability." — [issue #794](https://github.com/nexuslabs-ai/nexus/issues/794). Recent minors were breaking or default-changing. 0.6.0 is marked "Breaking: Nexus CSS now emits only `nx:` utilities…". 0.7.0 changed the default `surfaceTone` and `corners` — [packages/core/CHANGELOG.md](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/CHANGELOG.md). The core README says advanced exports carry "Stability is not guaranteed pre-1.0." — [packages/core/README.md](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/README.md)
- A finding recorded in #798: "Optional peers are all-or-nothing… An app that uses none of them still fails to build without them" (about the old single-entry export route). It also says "Fixtures must run in CI… breakages… sat on `main` undetected." — [issue #798](https://github.com/nexuslabs-ai/nexus/issues/798)

### Inferences
- For "update hell" and "upstream drift" complaints, Nexus does not yet do better than shadcn/ui. It has no registry, no CLI and no diff tooling, and the plan explicitly rules out 3-way merge. Its answer is the split between a versioned npm engine and copied components: token, color and contrast fixes arrive through `npm update @nexus_ds/core`, while component fixes need manual re-pasting.
- Setup cost is high compared with `npx shadcn add`: four setup steps and about 13 copied files before the first component.

### Gaps
- No published timeline for #798 or the registry. #798 says it is "Blocked by: #797" — [issue #798](https://github.com/nexuslabs-ai/nexus/issues/798)

## 4. Accessibility specifics

### Takeaway
Contrast is gated only with APCA (Lc 75/60/45 tiers). The codebase has no WCAG 2 ratio check anywhere. axe's two color-contrast rules are deliberately disabled in Storybook, while every other axe rule fails tests. Under the repo's no-environment-branching rule, Nexus ignores OS-level reduced motion, forced colors (Windows High Contrast) and prefers-contrast. Reduced motion is a user toggle that defaults to off.

### Cited Findings
- APCA tier floors: body 75, ui 60, incidental 45 — [palette.ts:L31-35](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/palette.ts#L31-L35). Docs tier table: foreground on background ≥ Lc 75. Brand and status labels, subtle labels, nav text and chart marks ≥ 60. Muted, disabled and focus ring ≥ 45 — [color.tsx:L118-155](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/app/_pages/foundations/color.tsx#L118-L155)
- The contrast slider raises the targets: body Lc 75 to 90, UI 60 to 75, incidental 45 to 60. "When a target can't be reached, Nexus uses the highest contrast possible. The minimums at `0` always apply." — [color.tsx:L154-158, L358-366](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/app/_pages/foundations/color.tsx#L154-L366)
- There is no WCAG 2 ratio check. A grep for "wcag" across `packages/` finds only comments: the axe-disable note in `preview.tsx`, plus WCAG 2.1.1 and 1.4.1 notes in attachment, breadcrumb, table, scroll-area and Avatar stories. No `contrast ratio` or 4.5:1 logic exists — local grep, for example [preview.tsx:L266-268](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/react/.storybook/preview.tsx#L266-L268), [breadcrumb.tsx:L54](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/react/src/components/breadcrumb/breadcrumb.tsx#L54)
- The docs justify APCA over WCAG: "WCAG 2 ratios misjudge the mid-tone pairs a token system produces all the time." — [color.tsx:L300-303](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/app/_pages/foundations/color.tsx#L300-L303)
- axe `color-contrast` and `color-contrast-enhanced` are set to `{ enabled: false }` globally. The stated reason: "Color-contrast is APCA-gated via `pnpm audit:contrast`… not WCAG 2 — disable axe-core's WCAG-based contrast rules so the two gates don't conflict." All other axe rules fail stories (`test: 'error'`) — [packages/react/.storybook/preview.tsx:L265-280](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/react/.storybook/preview.tsx#L265-L280)
- The no-environment-branching rule bans `@media (forced-colors)`, `@supports` fallbacks, `prefers-reduced-motion`/`prefers-reduced-*`, `prefers-contrast`/`inverted-colors` and hand-written pointer/hover queries. `prefers-color-scheme` is the only exception. "A component has one appearance per variant × size × theme." Enforcement is review only — [.claude/rules/no-environment-branching.md](https://github.com/nexuslabs-ai/nexus/blob/61e1776/.claude/rules/no-environment-branching.md)
- A grep of `packages/react/src`, `packages/tailwind`, `packages/core` and `apps/docs/app` finds zero `prefers-reduced-motion`, `motion-safe`, `motion-reduce`, `forced-colors`, `prefers-contrast` or `@supports` — local grep of [packages/](https://github.com/nexuslabs-ai/nexus/tree/61e1776/packages)
- `reduceMotion` defaults to `false` ([appearance-model.ts:L140](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/appearance-model.ts#L140)). When a user turns it on, it injects a page-wide `*, *::before, *::after { animation-duration: 0.01ms !important; … transition-duration: 0.01ms !important; scroll-behavior: auto !important; }` — [appearance-model.ts:L336-340](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/appearance-model.ts#L336-L340)
- The rule treats the in-product `reduceMotion` toggle as allowed because "The user picks them in the product; Nexus does not detect them from the environment." — [no-environment-branching.md](https://github.com/nexuslabs-ai/nexus/blob/61e1776/.claude/rules/no-environment-branching.md)
- Closed issue #159 had planned to "Respect `prefers-reduced-motion`" for the Tabs indicator. It was closed as not planned — [issue #159](https://github.com/nexuslabs-ai/nexus/issues/159)
- The color-blind limitation is that Success and Warning look alike under deuteranopia. Docs require an icon plus a label — [packages/core/README.md:L60](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/README.md#L60). The Badge docs: "Pair a status color with text or an icon, because color alone doesn't carry meaning." — [nexusui.so/llms.txt](https://nexusui.so/llms.txt)
- Open a11y issues: #857 (dark-mode disabled buttons nearly invisible), #634 (MultiSelect `aria-multiselectable` and chip keyboard removal) and #624 (harden chart mark contrast) — [issue #857](https://github.com/nexuslabs-ai/nexus/issues/857), [issue #634](https://github.com/nexuslabs-ai/nexus/issues/634), [issue #624](https://github.com/nexuslabs-ai/nexus/issues/624)

### Inferences
- My calculation, not sourced: black at 6% to 11.68% alpha over white gives roughly 1.14:1 to 1.31:1 under the WCAG 2 formula. That is far below WCAG 2.1 SC 1.4.11's 3:1 for component boundaries. The default `border-default` at 8.84% alpha gives about 1.22:1. Whether this fails 1.4.11 depends on whether the border alone identifies the control. Teams with a WCAG 2.x AA procurement requirement would have to audit this themselves, because Nexus gates neither borders nor WCAG ratios.
- Choosing APCA, the WCAG 3 draft candidate, over WCAG 2 is defensible technically. But legal and procurement standards (ADA guidance, EN 301 549, Section 508) still reference WCAG 2.x. "APCA-checked" is therefore not the same as "WCAG AA-conformant", and the docs never claim WCAG conformance.
- Ignoring `prefers-reduced-motion` and `forced-colors` trades OS-level accessibility signals for a single deterministic appearance. Users with vestibular disorders who set the OS preference still get motion unless the app exposes the Nexus toggle. Windows High Contrast users get no tuned styles. Accessibility-minded reviewers may criticize this.

### Gaps
- I found no published accessibility conformance statement (VPAT or ACR) for Nexus.
- I did not test focus-ring and border contrast in rendered components.

## 5. Multi-framework support

### Takeaway
The engine (`@nexus_ds/core`) has no framework or DOM dependencies and exposes `createNexusThemeContract`, `deriveTheme`, `themeToCss`, snapshot helpers and the first-paint script, so other frameworks can call it. Only React components exist. Vue, Svelte, Angular and React Native bindings are "planned" in the FAQ, but I found no tracked issue for them, and the React Native strategy issue says "Do not pursue cross-platform now."

### Cited Findings
- The docs recipe for other frameworks: "Another framework needs three functions: `createNexusThemeContract()`… `deriveTheme()`… `themeToCss()`." Native apps read "the color token map and the DTCG files directly." State binding and components must be "Built per framework" — [tokens.mdx:L83-106](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/foundations/tokens.mdx#L83-L106)
- Engine exports: `deriveTheme` and `themeToCss` ([index.ts:L18](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/index.ts#L18)); everything in `appearance-model` and `appearance-snapshot` ([index.ts:L8-9](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/index.ts#L8-L9)); `measureThemeContrast` ([index.ts:L24](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/index.ts#L24)); and subpath entries `./palette` and `./catalogue` ([packages/core/package.json](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/package.json))
- FAQ: "The components are React only today. Vue, Svelte, Angular and React Native bindings are planned." "The tokens are DTCG JSON… so Style Dictionary can build Swift and Kotlin output. Live theme changes on native need a port of the engine." — [introduction.mdx:L86-90](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/introduction.mdx#L86-L90)
- The core README "Future Platform Support" section says Style Dictionary "can be added" — [packages/core/README.md:L183-192](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/README.md#L183-L192). The repo has no Style Dictionary config or dependency, and no `.vue` or `.svelte` files — local grep of the repo ([repo root](https://github.com/nexuslabs-ai/nexus/tree/61e1776))
- React Native strategy issue #218 (open, milestone "06 · Docs / policy backlog"): "Do not pursue cross-platform now. Two implementations of a barely-stable design system would slow us down ~3×." It recommends shared tokens plus separate RN components with NativeWind later. It also concedes "Linear's stack ports to RN with less friction than ours will." — [issue #218](https://github.com/nexuslabs-ai/nexus/issues/218)
- A semantic search of nexuslabs-ai/nexus issues for "Vue Svelte Angular framework bindings" returned 0 results — [GitHub issues search](https://github.com/nexuslabs-ai/nexus/issues)

### Inferences
- "Framework-agnostic" is accurate for the theme engine but not for the design system as a product. A Vue or Svelte team gets tokens, the theme CSS and the contrast guarantees, but must build every component and the provider itself.

### Gaps
- No timeline or issue exists for the "planned" Vue, Svelte or Angular bindings. Search may have missed an issue worded differently.

## 6. Coexistence with an existing app (shadcn, MUI, a company package)

### Takeaway
Coexistence is the most rigorously engineered claim. A unit test compiles the consumer CSS entry with every `nx:` class the components use. It fails on any selector outside `nx:` classes or variable scopes and on any non-`--nx-*` global declaration. A few global effects remain by design: `.dark { color-scheme: dark }`, a shared `.dark` class, Tailwind and tw-animate keyframes and `--tw-*` properties, opt-in page-wide preference toggles, and attributes set on `<html>`. The "0 host styles changed" example result is a manual check, not a CI one.

### Cited Findings
- What the CSS scope test enforces — [generated-css-scope.test.ts:L5-33, L134-177](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/generated-css-scope.test.ts#L5-L177):
  - It compiles `nexus.css`, `tw-animate-css` and `progress.css` with every `nx:` candidate found in `packages/react/src`.
  - Selectors may only be `.nx\:` classes, variable scopes (`:root`, `:host`, `.dark`, `[data-*=…]`) or Tailwind's `*, ::before, ::after, ::backdrop` properties rule.
  - Declarations outside `nx:` classes must be `--nx-*`. The exceptions are `.dark { color-scheme: dark }` and `--tw-*` in Tailwind's rule.
  - Keyframes must be prefixed `nx-`, except Tailwind's spin, ping, pulse and bounce and tw-animate's enter, exit, accordion-*, collapsible-* and caret-blink.
  - `@property` may register only `--tw-*`.
- Provider prefs CSS: a test asserts that the default prefs CSS touches only `@layer nx-runtime`, `:root` or `.nx\:` selectors — [appearance-model.test.ts:L432-440](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/appearance-model.test.ts#L432-L440). The toggles, when on, target `html`, `button`, `[role=…]`, `a[href]` and `*` page-wide — [appearance-model.ts:L326-340](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/appearance-model.ts#L326-L340)
- The docs list three global effects: `.dark` → `color-scheme: dark`; tw-animate keyframes; Tailwind's keyframes and `--tw-*` properties — [install.mdx:L403-409](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/install.mdx#L403-L409). `nexus.css` defines `@custom-variant dark (&:is(.dark *))` and `.dark { color-scheme: dark; }` — [nexus.css:L20, L1591-1596](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/tailwind/nexus.css#L20)
- `.dark` is shared: "Nexus and your theme share the `.dark` class on `<html>`." — [install.mdx:L400-401](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/install.mdx#L400-L401). The examples wire one switch to both systems (next-themes or MUI `colorSchemeSelector: 'class'`) — [examples/README.md:L54-63](https://github.com/nexuslabs-ai/nexus/blob/61e1776/examples/README.md#L54-L63), [examples/mui-app/README.md](https://github.com/nexuslabs-ai/nexus/blob/61e1776/examples/mui-app/README.md)
- The bootstrap script also writes `data-density`, `data-radius`, `data-shadow` and `data-borderwidth` on `<html>` and injects `<style data-nexus-appearance-theme>` and `<style data-nexus-appearance-prefs>` into `<head>` — [appearance-snapshot.ts:L254](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/appearance-snapshot.ts#L254)
- Z-index: six tokens, `--nx-z-index-overlay` 10, `sticky` 30, `modal` 50, `popover` 70, `toast` 100 and `max` 9999 — [nexus.css:L291-296](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/tailwind/nexus.css#L291-L296). The docs advise raising them on `:root` when the host sits higher, "like MUI's dialogs at 1300" — [install.mdx:L421-430](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/install.mdx#L421-L430)
- Known integration constraints in the docs:
  - "An open Nexus dialog blocks pointer events outside itself", so host popups need `disablePortal` — [install.mdx:L432-433](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/install.mdx#L432-L433)
  - "An unprefixed class loses to the component's own `nx:` class" — [install.mdx:L411-412](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/install.mdx#L411-L412)
  - Two CSS entries make "two Tailwind builds, one prefixed and one not" — [install.mdx:L394-395](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/getting-started/install.mdx#L394-L395)
  - Portalled popovers don't receive scoped overrides — [overrides.mdx:L102-103](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/content/theming/overrides.mdx#L102-L103)
- Toasts are separated: Nexus uses a `nexus` toaster id, "so a host Toaster never shows Nexus toasts" (0.6.0) — [packages/core/CHANGELOG.md](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/CHANGELOG.md)
- The examples claim "Adding Nexus changes **0** of the host app's own styles" for shadcn-app, mui-app and both shadcn-package apps, measured by `scripts/check.mjs`, which "Builds an app with and without Nexus and lists every host style that adding Nexus changed" — [examples/README.md:L23-48](https://github.com/nexuslabs-ai/nexus/blob/61e1776/examples/README.md#L23-L48). But "The examples run by hand. Wiring them into CI stays with this issue." — [issue #798](https://github.com/nexuslabs-ai/nexus/issues/798)
- History: before #814, adding Nexus "changed 27 host styles" in the practice app, because the old `nexus.css` shipped Preflight, `*`/`body` rules and 107 unprefixed `--color-*` aliases — [issue #794](https://github.com/nexuslabs-ai/nexus/issues/794), [packages/core/CHANGELOG.md 0.6.0](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/CHANGELOG.md)
- There is no per-subtree theme root. "There is no `[data-nexus-root]` scope (#796 closed)" — [issue #798](https://github.com/nexuslabs-ai/nexus/issues/798). A stale `TODO(#796)` still references scoping appearance to `[data-nexus-root]` — [apps/docs/scripts/docs-stories.mjs:L24](https://github.com/nexuslabs-ai/nexus/blob/61e1776/apps/docs/scripts/docs-stories.mjs#L24). `themeToCss` writes to `:root`/`:root.dark` — [derive-theme.ts:L464](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/core/src/lib/derive-theme.ts#L464)
- Nexus needs Tailwind 4 even in a non-Tailwind app: "MUI… has no Tailwind, so adding Nexus brings Tailwind into the app for the first time." — [examples/mui-app/README.md](https://github.com/nexuslabs-ai/nexus/blob/61e1776/examples/mui-app/README.md)

### Inferences
- For "a design system takes over my global styles" complaints, Nexus has a concrete, test-enforced answer that is rare among Tailwind-based kits.
- Two limits remain. First, brand and color theming is page-global, so you cannot run two brands side by side in one document. Only density, radius, shadow and border width scope to an element. Second, the shared `.dark` class means dark mode is coupled to the host's switch.

### Gaps
- I did not run `examples/scripts/check.mjs`, so the "0 host styles" figures are the repo's own claim, run by hand.

## 7. Public footprint and perception

### Takeaway
There is essentially no public discussion of Nexus UI. On 2026-10-20 the GitHub repo had 2 stars and 1 fork. npm downloads are tiny: `@nexus_ds/core` had 18 last week and 1,587 in the past year. Searches found no Reddit, Hacker News, Product Hunt, X or LinkedIn mentions. The team's own SEO issue confirms the name is crowded by older unrelated "Nexus" projects, and that the Show HN, Reddit and Product Hunt launches are still to-dos.

### Cited Findings
- GitHub: `nexuslabs-ai/nexus`, created 2025-12-18, 2 stars, 2 watchers, 1 fork, MIT, TypeScript. Topics: component-library, design-system, design-tokens, radix-ui, react, storybook, tailwindcss. Homepage nexusui.so — [GitHub API repo data via MCP search, 2026-10-20](https://github.com/nexuslabs-ai/nexus). 54 open issues (`totalCount` from the issues listing) — [github.com/nexuslabs-ai/nexus/issues](https://github.com/nexuslabs-ai/nexus/issues)
- A search engine indexed the repo under an older title, "GitHub - nexuslabs-ai/nexus: Design system starting code". The current repo description is "Nexus UI: a framework-agnostic theme engine and design system…" — [github.com/nexuslabs-ai/nexus](https://github.com/nexuslabs-ai/nexus)
- npm downloads, measured 2026-10-18:
  - `@nexus_ds/core`: 18 last week (2026-10-12 to 18), 431 last month, 1,587 last year — [api.npmjs.org last-week](https://api.npmjs.org/downloads/point/last-week/@nexus_ds/core), [last-month](https://api.npmjs.org/downloads/point/last-month/@nexus_ds/core), [last-year](https://api.npmjs.org/downloads/point/last-year/@nexus_ds/core)
  - `@nexus_ds/eslint-plugin`: 7 last week, 376 last month, 1,172 last year — [api.npmjs.org last-week](https://api.npmjs.org/downloads/point/last-week/@nexus_ds/eslint-plugin), [last-year](https://api.npmjs.org/downloads/point/last-year/@nexus_ds/eslint-plugin)
- Docs site `https://nexusui.so/` returned HTTP 200, and `https://storybook.nexusui.so/` returned HTTP 200 (curl, 2026-10-20) — [nexusui.so](https://nexusui.so), [storybook.nexusui.so](https://storybook.nexusui.so)
- A web search for `"nexusui.so"` returned no results from that domain. A search for `"@nexus_ds/core" npm` returned no matching package. Searches combining "Nexus UI" with reddit, Show HN, Product Hunt, LinkedIn or x.com returned nothing about this project — [WebSearch results, 2026-10-20; e.g. nime.org NexusUI](https://nime.org/proc/btaylor2014)
- An extended search for `"nexus_ds" OR "nexusui.so" OR "nexuslabs-ai"` found only the project's own GitHub pages: the repo, issue #796, the core 0.6.0 release, and PRs #856, #858 and #861 — [github.com/nexuslabs-ai/nexus/releases/tag/@nexus_ds/core@0.6.0](https://github.com/nexuslabs-ai/nexus/releases/tag/%40nexus_ds/core%400.6.0), [PR #856](https://github.com/nexuslabs-ai/nexus/pull/856)
- The team's own assessment (issue #868, opened 2026-10-19): "Nexus has almost no backlinks today, so older projects with the same name rank above it for 'nexus ui' and 'nexus design system'. Examples are Hexagon's Nexus design system and the 2014 NexusUI toolkit." Its unchecked launch items include "Show HN post", "r/reactjs, r/tailwindcss and r/webdev posts", "Product Hunt launch" and "PR to awesome-shadcn-ui" — [issue #868](https://github.com/nexuslabs-ai/nexus/issues/868)
- Unrelated namesakes to exclude from any perception analysis:
  - NexusUI (2014): a JavaScript web-audio interface toolkit from LSU, published at NIME — [nime.org/proc/btaylor2014](https://nime.org/proc/btaylor2014)
  - `@nexusui/theme`: an MUI theme for the Hexagon / manufacturing-intelligence "NexusUI Design system" — [jsdelivr @nexusui/theme](https://www.jsdelivr.com/package/npm/@nexusui/theme)
  - "Nexus Design System" by Euclid Labs @KJSCE: npm `@nexus-ds/react` (hyphen, not underscore), built on React Aria, with a `nexusui` Tailwind plugin — [nexus-design-system.vercel.app](https://nexus-design-system.vercel.app/)
  - NexusUI World of Warcraft addon — [curseforge.com/wow/addons/nexusui](https://www.curseforge.com/wow/addons/nexusui)
  - "NEXUS UI-Kit" design kit on Gumroad — [goodui.gumroad.com/l/nexus-ui](https://goodui.gumroad.com/l/nexus-ui)
  - A 21st.dev "Nexus UI" library linking to nexus-ui.com, which I did not verify — [21st.dev/@nexus-ui/library/nexus-ui.md](https://21st.dev/@nexus-ui/library/nexus-ui.md)
  - `victorcodess/nexus-ui`, listed on ecosyste.ms, appears unrelated — [awesome.ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Fvictorcodess%2Fnexus-ui)

### Inferences
- No public sentiment about Nexus UI exists to report. Any perception claim would be speculation. The download numbers, about 18 a week for the engine, suggest usage mostly by the team, CI and the examples. That is my inference from the low absolute counts, not something npm reports.
- The name collision ("Nexus UI", `@nexus-ds/react` vs `@nexus_ds/*`) is a discoverability risk, and the team recognizes it in #868.

### Gaps
- Web search rarely indexes X and LinkedIn posts, and Reddit and Hacker News may not have surfaced through generic search. Absence there is likely but not proven.
- npm download counts include CI and bot installs, and npm does not separate them.

## 8. Roadmap from open GitHub issues

### Takeaway
The open roadmap centers on four areas. Distribution comes first: a catalog manifest plus a shadcn registry (#798, under epic #794) and a core release (#797). Then a large "AI Elements" component catalogue (#835 to #852), quality and reference implementations (#799, #806, #807), and polish and accessibility bugs. Cross-platform work is explicitly deferred (#218). The motion-token issue #159 was closed "not planned", though basic motion tokens now exist.

### Cited Findings
- Distribution:
  - Epic #794 (open): "Copy-and-own delivery through manual copying **and** a shadcn-compatible registry, generated from one catalog, into new and existing React 19 apps (Vite, Next App Router, Tailwind 4)" — [issue #794](https://github.com/nexuslabs-ai/nexus/issues/794)
  - #798 (open): catalog manifest, registry, retiring `pnpm export`, external fixtures in CI. Registry items will declare `registryDependencies: ["@nexus/styles"]`, and `shadcn` becomes a pinned root devDependency — [issue #798](https://github.com/nexuslabs-ai/nexus/issues/798)
  - #797 (open): "publish the scoped-appearance @nexus_ds/core release" — [issues list](https://github.com/nexuslabs-ai/nexus/issues/797)
  - #799 (open): roll the quality standard out to every family, then verify installs and label readiness — [issue #799](https://github.com/nexuslabs-ai/nexus/issues/799)
- AI Elements: #835 "Bring the complete AI Elements catalogue into Nexus", plus sub-issues #837 to #852 (conversation, streaming, citations, tool interaction, voice, workflow canvas and more), all opened 2026-10-09 and open — [issue #835](https://github.com/nexuslabs-ai/nexus/issues/835)
- Documentation: #804 (P1, open), "document the remaining 54 components from the page template". The live site already has 71 generated component pages, so this issue may be partly stale — [issue #804](https://github.com/nexuslabs-ai/nexus/issues/804), [nexusui.so/llms.txt](https://nexusui.so/llms.txt)
- Bugs and accessibility: #857 (dark-mode disabled buttons), #800 (FilterBuilder trigger 40px instead of 32px), #634 (MultiSelect a11y), #624 (chart contrast) — [issue #857](https://github.com/nexuslabs-ai/nexus/issues/857), [issue #800](https://github.com/nexuslabs-ai/nexus/issues/800), [issue #634](https://github.com/nexuslabs-ai/nexus/issues/634), [issue #624](https://github.com/nexuslabs-ai/nexus/issues/624)
- Engine and tokens features:
  - #810: scale control heights with `uiFontSize` — [issue #810](https://github.com/nexuslabs-ai/nexus/issues/810)
  - #556: nested surface and elevation context — [issue #556](https://github.com/nexuslabs-ai/nexus/issues/556)
  - #764: explicit border interaction roles — [issue #764](https://github.com/nexuslabs-ai/nexus/issues/764)
  - #104: `clamp()` fluid scaling — [issue #104](https://github.com/nexuslabs-ai/nexus/issues/104)
  - #305: data visualization system — [issue #305](https://github.com/nexuslabs-ai/nexus/issues/305)
  - #627: Chip primitive — [issue #627](https://github.com/nexuslabs-ai/nexus/issues/627)
- Cross-platform: #218 (open, policy backlog) says "Do not pursue cross-platform now." No Vue, Svelte or Angular issue was found — [issue #218](https://github.com/nexuslabs-ai/nexus/issues/218)
- Motion: #159, "animated sliding active indicator + motion-token foundation", was closed `not_planned` on 2026-06-25. Duration and easing tokens nonetheless ship in `variables.css` — [issue #159](https://github.com/nexuslabs-ai/nexus/issues/159), [variables.css:L345-356](https://github.com/nexuslabs-ai/nexus/blob/61e1776/packages/tailwind/variables.css#L345-L356)
- Growth: #868 covers SEO backlinks and launch posts — [issue #868](https://github.com/nexuslabs-ai/nexus/issues/868)
- Activity: the repo is under very active development, with 50 commits between 2026-09-25 and 2026-10-20 in the shallow clone and PR numbers above 860 — [commits on main](https://github.com/nexuslabs-ai/nexus/commits/main)

### Inferences
- The project is pre-1.0, moving fast and small-team. The roadmap spends more on catalog breadth (AI Elements) and distribution plumbing than on framework breadth.
- For a report judging whether Nexus solves common design-system complaints: theming, contrast and CSS isolation are shipped and verified. Distribution and updates are planned, and the plan deliberately excludes merge tooling. Multi-framework support is engine-only. Community and ecosystem are effectively nonexistent today.

### Gaps
- No public dates or milestones exist for #798 or #797, or for the AI Elements work.
- Closed issues were not fully surveyed. Only #159, and the #541/#604/#796 references inside #794 and #798, were checked.
