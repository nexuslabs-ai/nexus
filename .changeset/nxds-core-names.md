---
'@nxds/core': minor
---

Rename every `Nexus` export to `Nxds`. The appearance runtime's DOM and storage names change too, so a saved appearance from an earlier version resets once.

| Before                                                                                        | After                                                               |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `DEFAULT_NEXUS_APPEARANCE`                                                                    | `DEFAULT_NXDS_APPEARANCE`                                           |
| `createNexusThemeContract`, `createNexusAppearanceSnapshot` and the other `*Nexus*` functions | `createNxdsThemeContract`, `createNxdsAppearanceSnapshot` and so on |
| `NexusAppearanceState`, `NexusDensity` and the other `Nexus*` types                           | `NxdsAppearanceState`, `NxdsDensity` and so on                      |
| `data-nexus-appearance-*` attributes                                                          | `data-nxds-appearance-*`                                            |
| `nexus-appearance` storage key and cookie                                                     | `nxds-appearance`                                                   |
