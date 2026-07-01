import * as React from 'react';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

import { cn } from '@/lib/utils';

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
 * A single expand/collapse disclosure region. The trigger toggles a content
 * area that animates open and closed.
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
 * The control that toggles the collapsible. Unstyled by design — compose it
 * with `asChild` around a `Button` (or any control) to give it an appearance.
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
 * The region revealed when the collapsible is open. Animates its height open /
 * closed via the `collapsible-down` / `collapsible-up` keyframes.
 *
 * Put any spacing that separates the content from the trigger **inside** this
 * element (e.g. an inner `nx:mt-2` wrapper), not as a flex `gap` on the parent.
 * A parent `gap` is rendered by the parent's layout, not the animated height, so
 * it snaps when the content collapses to height 0 — causing a visible stutter.
 */
function CollapsibleContent({ className, ...props }: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        'nx:overflow-hidden nx:duration-default nx:data-[state=closed]:animate-collapsible-up nx:data-[state=open]:animate-collapsible-down nx:motion-reduce:data-[state=closed]:animate-none nx:motion-reduce:data-[state=open]:animate-none',
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
