import * as React from 'react';

import * as AccordionPrimitive from '@radix-ui/react-accordion';

import { IconChevronDown } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * Accordion Root
 *
 * Container for accordion items. Supports single or multiple expanded items.
 *
 * @example
 * ```tsx
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Section 1</AccordionTrigger>
 *     <AccordionContent>Content for section 1</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
const Accordion = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Root>,
  React.ComponentProps<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    data-slot="accordion"
    className={cn('nx:w-full', className)}
    {...props}
  />
));
Accordion.displayName = 'Accordion';

/**
 * AccordionItem
 *
 * Individual accordion section containing a trigger and content.
 */
type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>;

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    data-slot="accordion-item"
    className={cn('nx:border-b nx:border-border-default', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

/**
 * AccordionTrigger
 *
 * Button that toggles the expanded state of an accordion item.
 * Includes a chevron icon that rotates when expanded.
 */
type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
>;

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="nx:flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      data-slot="accordion-trigger"
      className={cn(
        'nx:flex nx:flex-1 nx:items-center nx:justify-between nx:py-4 nx:text-sm nx:font-medium nx:text-foreground nx:transition-all nx:hover:underline nx:focus-visible:outline-none nx:focus-visible:shadow-focus-default nx:disabled:pointer-events-none nx:disabled:opacity-50 nx:[&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}
      <IconChevronDown
        className="nx:size-4 nx:shrink-0 nx:text-muted-foreground nx:transition-transform nx:duration-200"
        aria-hidden="true"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

/**
 * AccordionContent
 *
 * Collapsible content area for an accordion item.
 * Animates open/close with height transition.
 */
type AccordionContentProps = React.ComponentProps<
  typeof AccordionPrimitive.Content
>;

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    data-slot="accordion-content"
    className="nx:overflow-hidden nx:text-sm nx:text-muted-foreground nx:transition-all nx:data-[state=closed]:animate-accordion-up nx:data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('nx:pb-4 nx:pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export {
  Accordion,
  AccordionContent,
  type AccordionContentProps,
  AccordionItem,
  type AccordionItemProps,
  AccordionTrigger,
  type AccordionTriggerProps,
};
