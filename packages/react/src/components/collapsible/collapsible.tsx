import * as React from 'react';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

import { cn } from '../../lib/utils';

/**
 * CollapsibleProps
 *
 * Props for the Collapsible root.
 */
interface CollapsibleProps extends React.ComponentProps<
  typeof CollapsiblePrimitive.Root
> {}

/**
 * Collapsible
 *
 * Shows and hides one content region. The trigger toggles the content open
 * and closed.
 *
 * @example
 * ```tsx
 * <Collapsible>
 *   <CollapsibleTrigger asChild>
 *     <Button variant="ghost">Toggle details</Button>
 *   </CollapsibleTrigger>
 *   <CollapsibleContent>Hidden details…</CollapsibleContent>
 * </Collapsible>
 * ```
 */
function Collapsible(props: CollapsibleProps) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

/**
 * CollapsibleTriggerProps
 *
 * Props for the CollapsibleTrigger.
 */
interface CollapsibleTriggerProps extends React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleTrigger
> {}

/**
 * CollapsibleTrigger
 *
 * Toggles the collapsible. It has no styles, so wrap a `Button` with
 * `asChild` to give it an appearance.
 */
function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

/**
 * CollapsibleContentProps
 *
 * Props for the CollapsibleContent.
 */
interface CollapsibleContentProps extends React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleContent
> {}

/**
 * CollapsibleContent
 *
 * The region shown while the collapsible is open. Its height animates open and
 * closed.
 *
 * Put spacing from the trigger inside this element, such as an inner `nx:mt-2`
 * wrapper. A flex `gap` on the parent snaps when the content closes.
 */
function CollapsibleContent({ className, ...props }: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        'nx:overflow-hidden nx:duration-default nx:data-[state=closed]:animate-collapsible-up nx:data-[state=open]:animate-collapsible-down',
        className
      )}
      {...props}
    />
  );
}

export {
  Collapsible,
  CollapsibleContent,
  type CollapsibleContentProps,
  type CollapsibleProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
};
