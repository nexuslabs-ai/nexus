import * as React from 'react';

import {
  type ResponsiveVisibilityProps,
  visibilityClassName,
} from '../../lib/responsive-visibility';
import { cn } from '../../lib/utils';

/**
 * The inverse of `<Show>`: renders its children only when a responsive condition
 * is **not** met, via a CSS `display` toggle (`contents` ↔ `none`). Children
 * always render to the DOM; only their visibility changes (no mount / unmount).
 *
 * Provide **exactly one** axis (enforced at compile time):
 * - `above` / `below` — viewport min / max width (scale: `sm` 40rem … `2xl` 96rem).
 * - `containerAbove` / `containerBelow` — the nearest `@container` ancestor's
 *   min / max width (Tailwind's container scale: `sm` 24rem … `2xl` 42rem —
 *   smaller than the viewport scale for the same name).
 *
 * Container axes require an ancestor with `container-type` (e.g. a parent
 * carrying the `nx:@container` utility). v1 queries the nearest *unnamed*
 * container only; for a specific named container, fall back to raw
 * `nx:@container/{name}/{bp}:` utilities.
 *
 * @experimental Inferred from Atlassian's `<Show>` / `<Hide>`; the API may change before stable.
 * @example
 * ```tsx
 * <Hide below="md"><span>Tablet-and-up context</span></Hide>
 * <Hide containerBelow="sm"><Avatar /></Hide>
 * ```
 */
function Hide({
  as: Comp = 'span',
  className,
  children,
  above,
  below,
  containerAbove,
  containerBelow,
  ...props
}: ResponsiveVisibilityProps) {
  return (
    <Comp
      data-slot="hide"
      className={cn(
        className,
        visibilityClassName(
          { above, below, containerAbove, containerBelow },
          true
        )
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Hide, type ResponsiveVisibilityProps as HideProps };
