import type { HTMLAttributes, ReactNode } from 'react';

import {
  visibilityClassName,
  type VisibilityProps,
} from '../../lib/responsive-visibility';
import { cn } from '../../lib/utils';

/**
 * Props for Hide.
 */
type HideProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
} & VisibilityProps;

/**
 * Hides its children while a width condition matches. The opposite of `<Show>`.
 * Children stay mounted, and only their CSS `display` changes.
 *
 * Set exactly one of these props:
 * - `above` / `below`: viewport min or max width (`sm` 40rem to `2xl` 96rem).
 * - `containerAbove` / `containerBelow`: min or max width of the nearest
 *   container (`sm` 24rem to `2xl` 42rem).
 *
 * Container props need an unnamed container ancestor, such as a parent with
 * `nx:@container`. For a named container, use `nx:@container/{name}/{bp}:`
 * utilities.
 *
 * @experimental Inferred from Atlassian's `<Show>` / `<Hide>`; the API may change before stable.
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
}: HideProps) {
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

export { Hide, type HideProps };
