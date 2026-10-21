---
'@nxds/react': patch
---

Copied components now pass the default lint and type settings of a fresh
create-next-app or Vite app:

- Props declared as empty interfaces are type aliases now.
- `Show` and `Hide` no longer import an unused `React`.
- Components no longer carry `eslint-disable` comments for rules a host app may
  not have.
