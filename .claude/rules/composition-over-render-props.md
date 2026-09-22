# Composition Over Render Props

Never accept a prop whose purpose is to inject what a component renders. Use
`children` or named `ReactNode` slots when variants share structure; split into
per-mode components when they don't.

**Enforced by `@nexus_ds/no-render-prop-types`** — props typed as render
callbacks (`(...) => ReactNode`) or component references (`ComponentType` /
`FC` / `ElementType`) fail `pnpm lint` and the pre-commit hook. Event-handler
props (`on*`) are exempt; they return data, not JSX.

Third-party APIs that mandate the shape opt out with a scoped
`eslint-disable` plus a reason.
