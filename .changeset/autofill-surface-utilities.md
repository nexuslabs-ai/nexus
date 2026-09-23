---
'@nexus_ds/core': minor
---

Theme autofilled fields and surface-matching rings through utilities instead of
generated component selectors.

- Added `autofill-bg-*`, `autofill-bg-transparent` and `autofill-text-*`. A
  field pairs them with its own `bg-*` / `text-*` classes
  (`nx:bg-container nx:autofill-bg-container`) so the browser's `!important`
  autofill paint cannot override the Nexus surface or text colour.
  `autofill-bg-transparent` clips the browser surface away for controls whose
  parent owns the surface.
- Added `surface-*`, `ring-surface` and `ring-offset-surface`. A wrapper
  declares the surface it paints (`nx:bg-container nx:surface-container`) and
  descendant rings take that colour, falling back to `background`.
- Removed the `accent-color` base rule on native checkbox, radio, range and
  progress elements. Nexus renders none of them; style a native control with
  `nx:accent-*` on the element instead.
