# React 18

`@nxds/react` is written for React 19. `@nxds/react-18` is the same source for
React 18, generated from it and committed. `nxds-cli` installs it in apps on
React 18.

React 18 drops `ref` from a plain function component's props. The generator
wraps every component that takes `ref` in `React.forwardRef` and changes
nothing else.

## The Rule

- Change `packages/react`, then run `pnpm --filter @nxds/react-18 generate`.
  Commit both.
- Never edit `packages/react-18/src` or its copied `.storybook` files by hand.
  `pnpm --filter @nxds/react-18 check` fails on any difference, and CI runs it.
- Don't use what React 18 lacks in `packages/react`. `@nxds/no-react-19-only`
  reports the APIs, and the React 18 story lane catches the rest.
- Write a component that takes `ref` as a function declaration with typed
  props. The generator fails on anything else and says why.

## Hand-maintained files

A file the generator can't produce goes in `packages/react-18/hand-maintained.json`
and is kept by hand. This is a last resort. Prefer a source change that holds on
both versions, or a new generator rule.

```json
{
  "src/components/example/example.tsx": {
    "reason": "Why the generator can't produce this file",
    "syncedWith": "sha256 of packages/react/src/components/example/example.tsx"
  }
}
```

`check` fails when an entry has no reason, when its React 19 file changed since
`syncedWith` (port the change in the same PR, then update the hash), or when the
generator would now write the same file (delete the entry).

## What Is Checked

| Check      | Command                                     | Fails when                                       |
| ---------- | ------------------------------------------- | ------------------------------------------------ |
| Freshness  | `pnpm --filter @nxds/react-18 check`        | Generated files differ from a fresh run          |
| Types      | `pnpm --filter @nxds/react-18 typecheck`    | The source doesn't compile on `@types/react` 18  |
| Stories    | `pnpm test:storybook` (`storybook-react18`) | A story fails, or React logs an error, on 18.3.1 |
| React APIs | `pnpm lint` (`@nxds/no-react-19-only`)      | `packages/react` uses a React 19-only API        |
