# Composition Over Render Props

> **Enforced by** `@nexus/no-render-prop-types` — props typed as render callbacks (`(...) => ReactNode`) or component references (`ComponentType` / `FC`) fail `pnpm lint`. Genuinely third-party-mandated shapes opt out with a scoped `eslint-disable` + reason.

When a component's internal shape varies by mode, never accept a render-callback or component reference as a prop to inject the varying part. Either compose with `children` (or other `ReactNode` slots), or split into one component per mode.

A `renderItem`, `cardComponent`, or `as` prop hides what the component actually renders. The reader of the consumer sees an opaque closure being passed down; the reader of the implementation sees an opaque thing being called. Both directions lose end-to-end readability, and the indirection earns nothing the language doesn't already give you.

**Anti-pattern (render callback):**

```tsx
function List({ items, renderItem }) {
  return <ul>{items.map(renderItem)}</ul>;
}

<List items={users} renderItem={(u) => <UserRow user={u} />} />
<List items={posts} renderItem={(p) => <PostRow post={p} />} />
```

**Anti-pattern (mode discriminator):**

```tsx
<List mode="users" items={users} />
<List mode="posts" items={posts} />
// inside List: if (mode === 'users') ... else if (mode === 'posts') ...
```

**Correct pattern — composition with `children`:**

```tsx
function List({ children }) {
  return <ul>{children}</ul>;
}

<List>
  {users.map((u) => (
    <UserRow key={u.id} user={u} />
  ))}
</List>;
```

**Correct pattern — per-mode components:**

```tsx
function UserList({ users }) {
  /* renders its own body end-to-end */
}
function PostList({ posts }) {
  /* renders its own body end-to-end */
}
```

## Rules

- Don't accept a prop typed `(...) => ReactNode` or `ComponentType<...>` whose purpose is to inject what the component renders.
- Don't accept a `mode` / `variant` discriminator that gates fundamentally different render branches inside one component. Split it.
- When variants share most structure: accept `children` or named `ReactNode` slots (`header`, `actions`, `footer`). The JSX stays at the call site, where the reader expects to see it.
- When variants share little beyond a few state guards (loading / error / empty / pagination): split into per-mode components. Extract any genuinely shared chunks as their own atomic components, then duplicate the thin wrapper that composes them. Twenty lines of duplicated wrapper beats one layer of render-prop indirection.
- Event handlers (`onClick`, `onSubmit`, `onChange`) are not render props. They return data, not JSX. The rule does not apply to them.
- Third-party library APIs that mandate this shape (form libraries' `<Field render={...} />`, polymorphic `as={...}` from headless component kits) are out of scope. The rule targets product code in this repo.
