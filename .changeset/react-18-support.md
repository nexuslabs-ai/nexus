---
'nxds-cli': minor
'@nxds/react': minor
---

Add React 18 support. `nxds-cli` reads the React your app uses and installs files for it: React 18.3 apps get components that take `ref` through `forwardRef`, and React 19 apps get the same files as before.

| Command  | On React 18                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------- |
| `init`   | Records `"react": 18` in `nxds.json` and installs the React 18 files                               |
| `add`    | Installs the React 18 files, and stops if the app's React changed since `init`                     |
| `update` | Switches the files to React 19 after you upgrade React, merging nxds's changes into your edits     |
| `diff`   | Compares your files with the React 18 files                                                        |
| `doctor` | Checks that the files match the app's React, and that `react-dom` and `@types/react` match `react` |

The chart now installs `react-is` at your React's major, which recharts needs to read fragments in a chart.
