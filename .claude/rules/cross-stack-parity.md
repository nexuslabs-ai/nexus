# Cross-Stack Parity

`@nxds/react` is the reference. `@nxds/vue` matches it, and the parity tests in
`parity/` fail when it doesn't. They are the fifth test kind in
[`testing.md`](testing.md#scope).

## The Rule

- A new component lands in both packages, or in React with its slug added to
  `planned` in `parity/parity.ts`.
- A change to a React component changes its Vue port in the same PR.
- No code is shared between the packages. Class recipes, story helpers and
  stories are copied, and the tests prove the copies agree.
- A difference that must stay gets an entry in `parity/parity.ts` with a
  one-line reason. An entry that no longer matches anything fails, so delete it
  when the difference goes.

## What Is Checked

| Check    | Test                       | Fails when                                                                                |
| -------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| Coverage | `coverage.test.ts`         | React exports a component Vue neither ships nor plans, or Vue ships one React lacks       |
| Contract | `props.test.ts`            | A part's props, slots, emits, defaults or prop descriptions differ, or the appearance API |
| Recipes  | `recipes.test.ts`          | A Vue recipe file's `cva` or class constant doesn't print the same as React's             |
| Setup    | `setup.test.ts`            | A copied file, the Storybook previews or a shared dependency range differ                 |
| Stories  | `stories.test.ts`          | Docs stories differ in name or order, or a play story has no twin or takes other steps    |
| Rendered | `browser/rendered.test.ts` | A docs story renders other parts, classes, attributes, roles, names or text               |

## Idioms That Map

These are the same API in each framework's idiom, not differences.

| React                  | Vue                         |
| ---------------------- | --------------------------- |
| `children` prop        | default slot                |
| `ReactNode` prop       | kebab-case slot             |
| own `on*` prop         | own emit                    |
| `asChild` (Radix Slot) | `as-child` (Reka Primitive) |
| `className`            | `class`                     |
| `args.onX` spy in play | `args['onX']` spy in play   |

A Vue docs story renders without args, so a docs story can't spy on an emit.
Assert the emit in an interaction story instead.
