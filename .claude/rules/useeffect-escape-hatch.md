# `useEffect` is an Escape Hatch

`useEffect` exists to synchronize with **external systems** — not to orchestrate React state. Before reaching for an effect, identify which category the logic falls into:

| Category                            | Where it belongs                                 |
| ----------------------------------- | ------------------------------------------------ |
| Derived / computed value            | `const` during render, or `useMemo` if expensive |
| Response to user interaction        | Event handler                                    |
| State reset on prop change          | `key` prop to remount                            |
| Shared logic across handlers        | Plain function called from each handler          |
| Data fetching                       | Framework loader, TanStack Query, or useSWR      |
| Subscribing to browser/external API | `useEffect` (or `useSyncExternalStore`)          |

**The litmus test:** if the side effect is caused by a specific user interaction, it belongs in an event handler. If it is caused by the component appearing on screen and needs synchronization with something outside React, it belongs in an effect.

## Rules

- Never use `useEffect` to sync one piece of React state to another — derive it instead.
- Never suppress the `exhaustive-deps` lint rule — fix the dependency, don't silence it.
- One effect per concern — avoid monolithic effects that handle multiple unrelated subscriptions.
- Data fetching in effects is acceptable only as a temporary placeholder (e.g., mocks before API wiring). Production data fetching must use a caching layer (TanStack Query, useSWR, framework loaders).

**Reference:** [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
