---
'@nxds/core': minor
---

Core now applies and saves the appearance itself, so a provider for any
framework needs only its own state and lifecycle.

| Export                      | What it does                                                           |
| --------------------------- | ---------------------------------------------------------------------- |
| `applyNxdsAppearance`       | Writes the `.dark` class, mode attributes and theme styles to the page |
| `removeNxdsAppearance`      | Undoes `applyNxdsAppearance`                                           |
| `persistNxdsAppearance`     | Saves the appearance to localStorage and, optionally, a cookie         |
| `readStoredNxdsAppearance`  | Reads the saved appearance, or returns a fallback                      |
| `resolveNxdsAppearanceMode` | Resolves `'system'` to `'light'` or `'dark'`                           |
| `prefersDarkColorScheme`    | Reads the OS colour scheme                                             |
| `watchColorScheme`          | Calls back when the OS colour scheme changes                           |

`NxdsResolvedAppearanceMode`, `NxdsAppearanceCookieOptions`,
`NxdsAppearanceCookieSameSite` and `NXDS_APPEARANCE_COOKIE_MAX_AGE_SECONDS`
move here from the React appearance provider. Import them from
`@nxds/core`.
