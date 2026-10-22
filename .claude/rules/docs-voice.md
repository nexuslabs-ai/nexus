# Docs Voice

nxds docs tell a reader what to do, in the fewest words that do it. Write for
someone skimming with a terminal open, and for an agent that reads every word
literally.

This covers every sentence a docs reader sees: `apps/docs/content/**/*.mdx`,
the TSX pages under `apps/docs/app/_pages/`, story descriptions in
`*.stories.tsx`, and the prop JSDoc that feeds the Props table.

For page templates and worked rewrites, use the
[`docs-writing`](../skills/docs-writing/SKILL.md) skill.

## Sentences

- **One idea per sentence.** Aim for about 15 words. Split anything over 25.
- **No dashes or semicolons joining clauses.** Each one is two sentences.
- **Imperative for actions, "you" for outcomes.** "Install the provider." "Your
  buttons now use the brand color."
- **Present tense, no hedging.** Cut "you can", "it is recommended", "there
  is", "simply", "just", "note that".
- **Condition first.** "If you use Vite, …" not "… if you use Vite."
- **Name the thing, not "it".** Repeat the noun when a sentence could point at
  two things.

## Paragraphs and pages

- **Open with one sentence that says what it is or does.** No history, no
  philosophy, no "This page covers".
- **Code early.** At most two sentences before the first code block on a guide.
- **Show, then explain.** Code first, then one sentence on what it does.
- **Paragraphs are three sentences or fewer.**
- **Lookups go in tables.** Tokens, props, states and options are rows, not
  prose.

## What to leave out

- **How the engine works.** A setup or usage page says what to do and what the
  reader sees. Internals go on a Foundations page, linked once.
- **Release history.** "Now", "still", "existing", "no longer", "version 6",
  "without a migration" belong in the changelog.
- **Exhaustive exception lists.** Give the rule and the one exception a reader
  will hit. Link to the source for the rest.
- **Issue numbers and repo internals** (`DO NOT EDIT`, barrels, generator
  names) unless the reader acts on them.

## Why and caveats

- **Give the why as one clause the reader can see.** "…so the page doesn't
  flash light on reload." Not the mechanism behind it.
- **Put a caveat next to the step it affects**, as one conditional sentence.
  Use a callout only when getting it wrong breaks the whole app.

## Words

- **Define a term the first time it appears**, in a short parenthesis, or don't
  use it.
- **One name per concept.** Pick the word the API uses and keep it.
- **Headings:** steps are verbs ("Add the provider"), reference sections are
  nouns ("Radius scale"), examples name the scenario ("Sticky footer").
  Sentence case, no end punctuation.

## Before / after

> nxds components are copy/own: you paste a component's source into your app
> and it is yours from that moment. Nothing installs it, and no upstream change
> will ever reach it.

> Copy a component's source into your app, then edit it like any other file.

> `prefix()` is a property of the build, not of one import, so a second
> unprefixed import does not buy you a second, unprefixed utility layer.

> Don't add your own `@import "tailwindcss"`. `nxds.css` already imports it.
