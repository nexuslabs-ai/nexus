# Extract Non-Trivial Inline Handlers

Inline event handlers in JSX (`onClick`, `onSubmit`, `onChange`, …) are fine when the body is a one- or two-line call — a single mutation kick-off, a state setter, a router push. Past that, extract a named function above the `return` and pass it by reference.

A multi-line arrow function buried inside a JSX prop pushes business logic into a place the reader does not expect to find it. The JSX should describe **what** is rendered and **which** handler runs, not the body of the handler. When the handler grows guard branches, nested callbacks, or async wiring, the JSX stops being declarative.

## Anti-pattern

```tsx
return (
  <Button
    onClick={() => {
      const win = window.open('about:blank', '_blank');
      mutation.mutate(undefined, {
        onSuccess: ({ url }) => {
          if (win) {
            win.location.assign(url);
          } else {
            window.location.assign(url);
          }
        },
        onError: (err) => {
          win?.close();
          toast.error(err.message);
        },
      });
    }}
    disabled={mutation.isPending}
  >
    Download
  </Button>
);
```

The reader hits `<Button …>` and now has to scan a fourteen-line closure to find the next sibling element. The disabled / label props are visually buried.

## Correct pattern

```tsx
const handleDownload = () => {
  const win = window.open('about:blank', '_blank');
  mutation.mutate(undefined, {
    onSuccess: ({ url }) => {
      if (win) {
        win.location.assign(url);
      } else {
        window.location.assign(url);
      }
    },
    onError: (err) => {
      win?.close();
      toast.error(err.message);
    },
  });
};

return (
  <Button onClick={handleDownload} disabled={mutation.isPending}>
    Download
  </Button>
);
```

The JSX reads top-to-bottom in seconds. The handler logic lives in one place with a name that says what it does.

## When inline is fine

Keep these inline — extracting them adds a name that says less than the body already does:

```tsx
<Button onClick={() => mutation.mutate()}>Generate</Button>
<Button onClick={() => setOpen(true)}>Open</Button>
<Button onClick={() => router.push(`/papers/${id}`)}>View</Button>
<Input onChange={(e) => setQuery(e.target.value)} />
```

One or two lines, one statement, no branching. The closure is a thin adapter, not logic.

## Rules

- **Three or more lines, or any branching/nested callback, in a JSX handler → extract.** Name it `handleX` (or a verb phrase that says what it does) and declare it above the `return`.
- **One- or two-line handlers stay inline.** A single `mutation.mutate()`, `setX(value)`, `router.push(...)`, or one-liner adapter does not need a name.
- **Don't wrap a bare reference in an arrow.** `onClick={() => doThing()}` when `doThing` takes no args is just `onClick={doThing}`. (See also `feedback_no_thin_wrapper_hooks.md` — no pass-through `useCallback`.)
- **Don't extract for memoization alone.** Re-creating a closure on render is not a perf problem. Extract for readability; reach for `useCallback` only when a memoized child actually depends on referential stability.
- The rule applies to all JSX handler-shaped props (`onClick`, `onChange`, `onSubmit`, `onKeyDown`, `onValueChange`, …), not just `onClick`.

**Paired rules:**

- `code-quality.md` — flat over nested, boring over interesting. A multi-line inline handler nests business logic inside a render expression; extraction flattens the read.
- `composition-over-render-props.md` — different smell, same instinct: don't smuggle logic into a place the reader is scanning for structure.
