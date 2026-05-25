---
name: shadcn-adapt-guide
description: Adapt a shadcn/ui component into a first-class Nexus component. Use when porting, adapting, converting, or translating a shadcn (or shadcn/ui) component to Nexus — mapping tokens via shadcn-divergences.md, applying the nx: prefix, data attributes, padding-based sizing, the focus-ring pattern, and Storybook play-fn tests. Triggers on "adapt X to Nexus", "port shadcn X", "add the X component" for the Component library epic, or a shadcn source URL/issue asking to bring a component into the design system.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
  - WebSearch
  - WebFetch
user-invocable: false
---

# Shadcn Adapt Guide

## Purpose

Deterministically turn one shadcn/ui component into a first-class Nexus component that meets the full component bar. The mapping is **known**, so this is a recipe, not open-ended implementation: orient → transform → verify. Do not write a multi-phase plan or wait for approval — the steps below are the plan.

## Rules are the spec — reference, never duplicate

The authoritative rules live in `.claude/rules/*.md`. This guide orchestrates them; it never copies the token tables inline (that would drift from the source). Open a rule file when the Reflex Check points you at it.

| Rule                                                                                                                                                                                                     | What it owns                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `shadcn-divergences.md`                                                                                                                                                                                  | **THE** shadcn→Nexus token mapping, sizing, data-attrs, focus, checklist    |
| `components.md`                                                                                                                                                                                          | Component architecture: CVA, data-slot, `nx:` prefix order, focus, layering |
| `surfaces.md`                                                                                                                                                                                            | Surface/elevation tokens (container/popover/overlay), the `nav-*` namespace |
| `storybook.md` / `testing-react.md`                                                                                                                                                                      | Required stories, play-fns, a11y, the base-variants generator               |
| `tokens.md` / `color-shades.md`                                                                                                                                                                          | Token names — verify a token exists before using it                         |
| `code-quality.md`, `composition-over-render-props.md`, `extract-inline-handlers.md`, `guard-clauses.md`, `useeffect-escape-hatch.md`, `code-comments.md`, `no-follow-up-deferral.md`, `project-stage.md` | General code discipline                                                     |

## Input

One component (e.g. `checkbox`), a shadcn source URL, or a tracked issue (#162–#177 under epic #161). **One component per run → one commit → one PR.**

## Archetype → reference component

Before writing, read the closest **shipped** Nexus component and mirror it exactly — structure, `data-slot`, focus, exports, JSDoc. Don't invent a new shape.

| If the component is…                    | Mirror                            | Examples                          |
| --------------------------------------- | --------------------------------- | --------------------------------- |
| A Radix form control                    | `switch.tsx`                      | checkbox, radio-group, progress   |
| An overlay (portal + overlay + z-index) | `dialog.tsx`                      | alert-dialog, sheet, popover      |
| A menu/list with items                  | `select.tsx`, `dropdown-menu.tsx` | command                           |
| CVA enum/compound variants              | `button.tsx`, `badge.tsx`         | (variant-heavy components)        |
| A styled element + focus/aria-invalid   | `input.tsx`                       | textarea, input-otp slot          |
| Pure markup, no Radix                   | compose primitives + `cn`         | table, skeleton, separator, label |
| Nav / sidebar chrome                    | `nav-*` tokens (`surfaces.md`)    | sidebar                           |

## Process

### Step 1 — Orient (read before write)

1. If a tracked issue exists: `gh issue view {N} --json title,body` — it specifies the exports, dep, remaps, icons, and acceptance for this component.
2. Pick the archetype above and **read that reference file end-to-end**. It is your template.
3. Skim the relevant rows of `shadcn-divergences.md`.

### Step 2 — Get the canonical shadcn source

- Fetch via the `shadcn` skill, the shadcn registry (`https://ui.shadcn.com/r/...`), or WebFetch of the source. Read the **whole** file.
- Research the npm dep you'll add (Radix primitive / `cmdk` / `sonner` / `input-otp` / `react-hook-form`) — don't guess its API: `"{lib} {version} docs"`.

### Step 3 — Transform (deterministic + Reflex Check)

Rewrite the source into the Nexus component, mirroring the archetype and applying the **Reflex Check** below. Preserve the public API shape — prop names, the `asChild` pattern, handler signatures, and the `destructive` variant name.

### Step 4 — Stories

Author `{Name}.stories.tsx` per `storybook.md` + `testing-react.md`: Default, one per variant + size, Disabled, interaction (click/keyboard) with play-fns, WithDataAttributes (play), and a render-based AllVariants. a11y runs automatically. If the render showcase reads well across bases, that's the export base-variants opts into.

### Step 5 — Wire

- Add the dep to `packages/react/package.json` (alphabetical) → `yarn install`.
- Add any new icon to `packages/react/src/lib/icons.ts` (Tabler re-export).
- `export * from '@/components/ui/{name}'` in `packages/react/src/index.ts`.
- If it has a render showcase, add an entry to `packages/react/scripts/base-variants.config.json`.

### Step 6 — Verify (real gates; fix until green)

Run these and fix everything before reporting — no deferral (`no-follow-up-deferral.md`):

- `yarn workspace @nexus/react typecheck`
- `npx eslint packages` — **not** `yarn lint` / `eslint .`; those recurse `.claude/worktrees/` and fail on unrelated pre-existing errors.
- Story tests per `testing-react.md` (`yarn test:storybook`); a11y violations fail the run.

## Reflex Check

Read at the start; re-fire whenever a trigger lights up. The trigger is the thing you're about to type; the arrow is what to do instead.

- _Pasting a shadcn `className`?_ → strip raw Tailwind; put `nx:` **before** every modifier (`nx:hover:…`, not `hover:nx:…`); map each utility to a **semantic** token via `shadcn-divergences.md` — never `bg-primary` (incomplete) or `bg-blue-500` (primitive). (`components.md`, `shadcn-divergences.md`)
- _See a `dark:` modifier?_ → delete it. Semantic tokens already carry their dark value. (`components.md`)
- _See `ring-*` / `focus:ring` / `ring-offset`?_ → use `nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)`; invalid fields add `nx:aria-invalid:focus-visible:outline-focus-error`. (`components.md` § Focus)
- _See a fixed height (`h-10`, `h-9`)?_ → padding-based sizing. Exceptions: progress-bar height, avatar, modal. (`components.md` § Sizing)
- _Adding any element?_ → `data-slot="{name}"` (+ `data-variant`/`data-size` if it has them). (`components.md`)
- _shadcn uses `destructive`?_ → keep the **variant name** `destructive` in the public API; map internals to `error-*` tokens. (`shadcn-divergences.md`)
- _Overlay / portal / floating layer?_ → mirror `dialog.tsx`: `nx:bg-overlay` scrim, `nx:bg-container`/`nx:bg-popover` surface, `nx:z-modal` (dialog/sheet/alert-dialog) or `nx:z-popover` (popover/command), tw-animate-css fade/zoom/slide. (`components.md` § Layering, `surfaces.md`)
- _Nav / sidebar chrome?_ → `nav-*` namespace (`nx:bg-nav-background`, `nx:hover:bg-nav-item-hover`, `nx:border-nav-border`), not the base surface tokens. (`surfaces.md`)
- _Defining a prop typed `(…) => ReactNode` / `ComponentType` / a `mode` discriminator?_ → use `children`/named slots or per-mode components. (`composition-over-render-props.md`)
- _Inline JSX handler 3+ lines or branching?_ → extract a named `handleX` above `return`. (`extract-inline-handlers.md`)
- _Reaching for `useEffect`?_ → external systems only (subscriptions, DOM measurement); never to sync React state. (`useeffect-escape-hatch.md`)
- _Typing `// TODO` / "for now" / "follow-up"?_ → don't. Fix in this PR, or `// TODO(#N):` against a tracked issue. (`code-comments.md`, `no-follow-up-deferral.md`)
- _Tempted by a backcompat shim / deprecation / feature flag?_ → delete or rename in place; this is pre-production. (`project-stage.md`)
- _A semantic token you need doesn't exist?_ → **stop and surface it.** Don't reach for a primitive or invent one; the token set is the contract. (`tokens.md`, `color-shades.md`)

## Definition of done

- [ ] Public API shape preserved; `asChild` where interactive
- [ ] `nx:` prefix before all modifiers; semantic token paths only; no `dark:` on semantic tokens
- [ ] `data-slot` (+ `data-variant`/`data-size`); padding-based sizing (documented exceptions only)
- [ ] Named interface + JSDoc on custom props; focus ring = `outline-focus-default` + tokenised offset
- [ ] Stories with play-fns + AllVariants; a11y clean; base-variants opt-in where it fits
- [ ] Dep added + installed; icons added; exported from `src/index.ts`
- [ ] `typecheck` + `eslint packages` + story tests all green
- [ ] One component, one commit, `Closes #N`

## Notes

- **Spacing (temporary):** until the Spacing tokens · Phase 1 milestone lands role-utilities, use numeric `nx:px-*` / `nx:py-*` / `nx:gap-*`, mirroring the shipped components. Once role-utilities land, `nx:px-control` etc. become the target and #124 sweeps existing components — these adapted ones included. Update this note when that milestone closes.
- **Don't over-plan.** The recipe above _is_ the plan — no planning doc, no approval gate. Orient, transform, verify, report.
