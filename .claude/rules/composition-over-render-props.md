# Composition Over Render Props

Never accept a prop whose purpose is to inject what a component renders. Use
`children` or named `ReactNode` slots when variants share structure; split into
per-mode components when they don't.

**Enforced by `@nxds/no-render-prop-types`** — props typed as render
callbacks (`(...) => ReactNode`) or component references (`ComponentType` /
`FC` / `ElementType`) fail `pnpm lint` and the pre-commit hook. Event-handler
props (`on*`) are exempt; they return data, not JSX.

Third-party APIs that mandate the shape opt out with a `@thirdPartyShape`
JSDoc tag and a reason on the prop. Don't use `eslint-disable` for it: copied
source has to lint clean in apps without the nxds plugin.
