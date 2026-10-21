---
name: docs-writing
description: Write or rewrite nxds docs prose in the plain nxds voice. Use when adding or editing a docs page (apps/docs/content/**/*.mdx or apps/docs/app/_pages/**), a component or story description in *.stories.tsx, or prop JSDoc that feeds the Props table. Triggers on "write a docs page", "document X", "rewrite this page", "simplify the docs", "add a story description".
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
user-invocable: false
---

# Docs Writing

## Purpose

Turn what a reader needs to do into the shortest page that does it. The voice
rules live in [`docs-voice.md`](../../../.claude/rules/docs-voice.md). This skill adds the
page templates, a self-check, and worked rewrites.

The voice is modelled on shadcn/ui and Base UI, plus Ant Design's fixed page
skeleton. Every page should read like those: one sentence, then code.

## Steps

1. **Pick the page type** from the table below. Its template sets the headings.
2. **List what the reader does**, in order. Each action becomes a step or an
   example. Anything the reader doesn't act on is a candidate to cut.
3. **Sort the rest.** Engine internals go to a Foundations page. Release history
   goes to the changelog. A rule with many exceptions keeps the rule plus the
   one exception a reader will hit.
4. **Write the code first**, then one or two sentences around each block.
5. **Run the self-check** at the end of this file and fix every miss.

## Page types

| Type       | Lives in                                       | Answers                                |
| ---------- | ---------------------------------------------- | -------------------------------------- |
| Guide      | `content/getting-started/`, `content/theming/` | How do I set this up or change it?     |
| Foundation | `app/_pages/foundations/`                      | How does this part of the system work? |
| Pattern    | `app/_pages/patterns/`                         | How do I build this screen?            |
| Component  | generated from `*.stories.tsx` and JSDoc       | What is it, and how do I use it?       |

### Guide

````md
# {Task as a noun phrase: "Install", "Theme setup"}

{One sentence: what the reader has when they finish.}

{Optional: one sentence on who this is for, or what to read first.}

## {Verb phrase: "Install Tailwind 4"}

{One sentence saying what to do.}

```bash
{the command or file}
```

{Optional: one sentence on what it does, or one "If …, …" caveat.}

## Check your setup

- [ ] {Something the reader can see}

## Next steps

- **[Page](/link)**: {what they get there, under 10 words}
````

- Number steps only when order matters.
- Mark optional steps in the heading: "(Optional) Add lint rules".
- Every code block starts with a path comment (`// app/layout.tsx`).
- When a later step edits an earlier file, show the whole file again.

### Foundation

This is where "how it works" lives. The voice rules still apply.

```md
# {Noun: "Color"}

{One sentence: what this part of the system controls.}

## {What you use} ← tokens or utilities, as a table

## How it works ← the engine, in short steps or a numbered pipeline

## {Reference} ← scales, thresholds, mappings as tables
```

- Put the table a reader uses before the explanation of how it was made.
- Write figures (APCA targets, opacity ranges) in tables, not sentences.

### Pattern

```md
# {Screen: "Forms"}

{One sentence: what the pattern builds, and from which components.}

{Live example}

## Choose an approach ← table: if you need … | use …

## {Step per decision} ← verb headings

## What your app owns ← bullets
```

### Component

Component pages are generated. Three sources feed them:

| Source                                         | Shown as                   | Template                               |
| ---------------------------------------------- | -------------------------- | -------------------------------------- |
| `parameters.docs.description.component`        | Page and Storybook summary | What it is, then when to use it        |
| `parameters.docs.description.story`            | Example caption            | One sentence: the scenario and outcome |
| JSDoc on a prop or on the `{Name}Props` member | Props table description    | A fragment of 12 words or fewer        |

**Component description.** Use at most three sentences. The page shows it
under the heading. Wrap code in backticks. Lines starting with `- ` render as a
list.

```
{Name} {does what}. Use it for {situation}. For {other situation}, use {Other}.
```

> Button triggers an action. Use it for short, visible labels. Icon-only
> buttons need an `aria-label`.

When a component has several rules, give it a short bullet list (one rule
per bullet) instead of one long sentence joined by semicolons.

**Story description.** Write one sentence that names the scenario and the
outcome. On a story tagged `docs`, it's the example's caption.

> Keep the footer visible while the content scrolls.

**Prop JSDoc.** Write a fragment that starts with a verb or a noun. The table
already shows the type and default, so don't repeat them.

| Before                                      | After                                |
| ------------------------------------------- | ------------------------------------ |
| `Whether the button is disabled`            | `Prevents interaction.`              |
| `Render as child element (for composition)` | `Renders the child element instead.` |
| `The visual style variant`                  | `Visual style.`                      |

## Readable without the page around it

Agents read docs as plain text, and readers land on one section from search.

- **Don't point at things by position**, like "the button above" or "the example
  below". Name the thing.
- **Make each code block runnable once its imports are copied.** Keep imports
  in the block.
- **Use full paths in links and code**, not "the file from earlier".
- **Repeat the noun at the start of each section**, not "it".

At build time, `apps/docs/scripts/write-markdown.ts` turns every page into
Markdown at `{route}.md` and lists it in `/llms.txt`. The page's first paragraph
becomes its `llms.txt` summary, so make that paragraph say what the page is.
Put `data-md-skip` on a live preview or specimen that means nothing as text.

## Worked rewrites

**Opening of a guide**

> nxds components are copy/own: you paste a component's source into your app
> and it is yours from that moment. Nothing installs it, and no upstream change
> will ever reach it — editing a pasted component means editing your own file,
> and picking up a later fix means pasting the new version over it.

> Set up your app once, then copy in any nxds component. Copied components
> are your files: edit them freely, and paste a newer version to update.

**Mechanism instead of instruction**

> Do not add an `@import "tailwindcss"` of your own. The nxds token CSS
> imports Tailwind itself, as `@import 'tailwindcss' prefix(nx)`, and that
> prefix is where `nx:bg-primary-background` comes from. `prefix()` is a
> property of the build, not of one import, so…

> Remove any `@import "tailwindcss"` from your CSS. `nxds.css` already imports
> Tailwind, with the `nx:` prefix.

**Release notes in reference**

> Preset names are inferred from `brandColor`, so existing saved colors keep
> working without a storage migration.

> {Delete. Put it in the changelog if anyone needs it.}

**Exception list**

> Some components render Button with their own radius class… InputGroupButton
> at sizes `xs`, `icon-xs` (`rounded-sm`) and `sm` (`rounded-md`)… Carousel…
> DatePicker selected days: `rounded-md` at a range start and end…

> The override reaches every element that uses `nx:rounded-base`. A component
> that sets its own radius, such as Carousel's arrows, keeps it.

## Self-check

Run this on an MDX page. It prints sentences over 25 words:

````bash
python3 - apps/docs/content/{section}/{page}.mdx <<'EOF'
import re, sys
t = open(sys.argv[1]).read()
t = re.sub(r'```.*?```', '', t, flags=re.S)
t = re.sub(r'^\s*[|#<].*$', '', t, flags=re.M)
for s in re.split(r'(?<=[.!?])\s+', ' '.join(t.split())):
    if len(s.split()) > 25: print(len(s.split()), s)
EOF
````

Then read the page top to bottom and check:

- [ ] The first sentence says what the page is or does
- [ ] No more than two sentences come before the first code block
- [ ] No sentence goes over 25 words, and none joins clauses with a dash or a semicolon
- [ ] No "you can", "simply", "just", "note that", "it is recommended"
- [ ] No release history ("now", "still", "existing", "no longer", "version N")
- [ ] No engine internals on a guide, pattern or component page
- [ ] Every term is defined the first time it appears
- [ ] Every heading follows its type: a verb for a step, a noun for reference, a scenario for an example
- [ ] No "above" or "below" pointing at content
- [ ] Every code block has a path comment and its imports
