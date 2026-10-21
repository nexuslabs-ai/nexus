---
'@nxds/eslint-plugin': minor
---

`no-render-prop-types` skips a prop whose JSDoc has a `@thirdPartyShape <reason>`
tag. A tag without a reason doesn't count. Use it instead of an `eslint-disable` comment when a third-party API
mandates the prop's shape, so the file still lints in apps without this plugin.
