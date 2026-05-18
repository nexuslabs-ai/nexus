# Push State Down, Not Props Across

A component's props should describe **decisions made by its parent** — not state the parent happened to derive. When a child takes 4+ props that all originate from one parent's data + state, the seam is in the wrong place.

Fix it one of two ways:

1. **Push the data down.** The child owns its own data fetch / state derivation; the parent passes only the decisions (selected filter, search input, callback to flip a setting).
2. **Inline the child.** The "component" was just a state-machine renderer for upstream data — it isn't a real concern of its own.

## Anti-pattern: thin pass-through child

```tsx
const { data, isPending, isError, refetch } = useAssignedSections();
const visibleRows = useMemo(
  () =>
    data ? data.items.filter((row) => matchesFilter(row.state, filter)) : null,
  [data, filter]
);

return (
  <SectionsList
    visibleRows={visibleRows}
    isPending={isPending}
    isError={isError}
    onRetry={refetch}
    hasFilter={filter !== 'all'}
    onClearFilter={() => setFilter('all')}
  />
);
```

The child owns nothing. Its prop list is the parent's locals re-exported. That is not a component boundary — it is a remote-controlled renderer.

## Anti-pattern: local `renderBody` helper

```tsx
function Page() {
  const { data, isPending, isError, refetch } = useAssignedSections();
  const visibleRows = useMemo(...);

  function renderBody() {
    if (isPending) return <Skeleton />;
    if (isError) return <Error onRetry={() => refetch()} />;
    // ...
  }

  return (
    <div>
      {header}
      {renderBody()}
    </div>
  );
}
```

`renderBody` is a sub-component without a name. If the body has a state machine worth a function, it has one worth a component — extract it.

## Correct pattern

```tsx
function Page() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const { data } = useAssignedSections();
  const visibleCount = data
    ? data.items.filter((row) => matchesFilter(row.state, filter)).length
    : null;

  return (
    <div>
      <header>{visibleCount} sections…</header>
      <Filters active={filter} onChange={setFilter} />
      <Content filter={filter} onClearFilter={() => setFilter('all')} />
    </div>
  );
}

function Content({ filter, onClearFilter }: ContentProps) {
  const { data, isPending, isError, refetch } = useAssignedSections();
  if (isPending) return <Skeleton />;
  if (isError || !data) return <Error onRetry={() => refetch()} />;

  const visibleRows = data.items.filter((row) =>
    matchesFilter(row.state, filter)
  );
  // ...
}
```

Both `Page` and `Content` call `useAssignedSections`. TanStack Query serves them from cache — one network request. The filter expression appears in two places, but each is a one-line derivation over an in-memory array; the duplication that matters is logic that can drift, not a `.filter(...)` call.

## Litmus test

Read the prop interface aloud. If it sounds like _"here is everything I derived, please render it"_ — push the state down. If it sounds like _"here is what the user chose"_ — it is right.

## Rules

- Props describe **parent decisions**, not **parent-derived state**. `filter: FilterKey` is a decision; `visibleRows: Row[]` is derived state.
- If a child takes more than ~3 props that all originate from one parent's data + state, push the data down (child owns the query) or inline the child.
- A local `renderBody()` / `renderContent()` inside a parent component is a sub-component without a name. Extract a real component, or inline it directly into JSX if it is small.
- When two siblings both need the same query data, let both call the query hook. The cache (TanStack Query, useSWR) deduplicates the network request. Do not lift data up just to thread it through props.
- Cheap derivations (one-line filter / count / group) running in two siblings is fine. Drift-prone _logic_ duplication is the smell — a single `.filter(...)` call is not.

**Exception:** transient state genuinely owned by the parent — selection, hover, drag, optimistic UI — must be passed down. The rule targets data-derived state the child could fetch itself.

**Paired rule:** `composition-over-render-props.md` — variants use `children` or per-mode split, never callback / discriminator props. This rule covers a different smell: even a normal `data` prop bloats when the child could fetch it itself.
