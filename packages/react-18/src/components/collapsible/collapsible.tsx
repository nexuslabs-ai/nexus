import * as React from 'react';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

import { cn } from '../../lib/utils';

/**
 * CollapsibleProps
 *
 * Props for the Collapsible root.
 */
type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>;

/**
 * Shows and hides one content region. The trigger toggles the content open
 * and closed.
 */
const Collapsible = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CollapsibleProps>
>(function Collapsible(propsWithoutRef, forwardedRef) {
  const props: React.PropsWithoutRef<CollapsibleProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
});

/**
 * CollapsibleTriggerProps
 *
 * Props for the CollapsibleTrigger.
 */
type CollapsibleTriggerProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleTrigger
>;

/**
 * Toggles the collapsible. It has no styles, so wrap a `Button` with
 * `asChild` to give it an appearance.
 */
const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<CollapsibleTriggerProps>
>(function CollapsibleTrigger(propsWithoutRef, forwardedRef) {
  const props: React.PropsWithoutRef<CollapsibleTriggerProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
});

/**
 * CollapsibleContentProps
 *
 * Props for the CollapsibleContent.
 */
type CollapsibleContentProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleContent
>;

/**
 * The region shown while the collapsible is open. Its height animates open and
 * closed.
 *
 * Put spacing from the trigger inside this element, such as an inner `nx:mt-2`
 * wrapper. A flex `gap` on the parent snaps when the content closes.
 */
const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CollapsibleContentProps>
>(function CollapsibleContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CollapsibleContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

export {
  Collapsible,
  CollapsibleContent,
  type CollapsibleContentProps,
  type CollapsibleProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
};
