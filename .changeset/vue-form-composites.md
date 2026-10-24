---
'@nxds/vue': minor
---

Add form composites that match their React counterparts.

| Component   | Parts                                                    | Notes                                                        |
| ----------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| ButtonGroup | `ButtonGroup`, `ButtonGroupText`, `ButtonGroupSeparator` | `size` reaches every Button and ButtonGroupText in the group |

A `Button` without its own `size` now takes the size of the `ButtonGroup` around it, even when another element wraps it.
