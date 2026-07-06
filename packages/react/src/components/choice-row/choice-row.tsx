import * as React from 'react';

import { cn } from '../../lib/utils';
import { Label } from '../label';

/**
 * ChoiceRowProps
 *
 * Props for the ChoiceRow component.
 */
interface ChoiceRowProps extends React.ComponentProps<typeof Label> {}

/**
 * ChoiceRow
 *
 * A compact label row for checkbox and radio choices. The row owns the
 * click/tap target through native `htmlFor`/`id` wiring, while the nested
 * Checkbox or RadioGroupItem remains the only interactive control and keeps
 * selected/focus semantics.
 *
 * @example
 * ```tsx
 * <ChoiceRow htmlFor="product">
 *   <Checkbox id="product" aria-labelledby="product-title" />
 *   <ChoiceRowTitle id="product-title">Product updates</ChoiceRowTitle>
 * </ChoiceRow>
 * ```
 */
function ChoiceRow({ className, ...props }: ChoiceRowProps) {
  return (
    <Label
      data-slot="choice-row"
      className={cn(
        'nx:group/choice-row nx:box-border nx:flex nx:min-h-8 nx:min-w-0 nx:w-full nx:cursor-pointer nx:items-center nx:justify-start nx:gap-2 nx:rounded-sm nx:px-2 nx:py-1.5 nx:transition-colors nx:pointer-coarse:min-h-11',
        'nx:not-has-[:disabled]:hover:bg-background-hover nx:not-has-[:disabled]:active:bg-background-active',
        'nx:has-[:disabled]:cursor-not-allowed nx:has-[:disabled]:text-disabled-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * ChoiceRowContent
 *
 * Optional vertical wrapper for title + description choice text.
 */
function ChoiceRowContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="choice-row-content"
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-0.5',
        className
      )}
      {...props}
    />
  );
}

/**
 * ChoiceRowTitle
 *
 * Visible choice label text. Use its `id` as the child control's
 * `aria-labelledby` target when the row also includes a description.
 */
function ChoiceRowTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="choice-row-title"
      className={cn(
        'nx:min-w-0 nx:flex-1 nx:typography-label-default nx:text-foreground nx:group-has-[:disabled]/choice-row:text-disabled-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * ChoiceRowDescription
 *
 * Optional helper text for a choice. Pair its `id` with the child control's
 * `aria-describedby`.
 */
function ChoiceRowDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="choice-row-description"
      className={cn(
        'nx:typography-body-default nx:text-muted-foreground nx:group-has-[:disabled]/choice-row:text-disabled-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  ChoiceRow,
  ChoiceRowContent,
  ChoiceRowDescription,
  type ChoiceRowProps,
  ChoiceRowTitle,
};
