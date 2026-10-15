---
'@nexus_ds/react': minor
---

Breaking for copied source: component folders have no `index.ts`. Import each
component by its file.

| Before                                         | After                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| `import { Button } from '@/components/button'` | `import { Button } from '@/components/button/button'`                   |
| Each component page lists every file to copy   | It links the components to install first, then lists only its own files |

`@nexus_ds/react` exports the same names. `@/components/appearance/provider`
keeps its `index.ts`.
