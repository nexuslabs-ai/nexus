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
function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('nx:w-full', className)}
      {...props}
    />
  );
}

/**
 * AccordionItem
 *
 * Individual accordion section containing a trigger and content.
 */
interface AccordionItemProps extends React.ComponentProps<
  typeof AccordionPrimitive.Item
> {}

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('nx:border-b nx:border-border-default', className)}
      {...props}
    />
  );
}

/**
 * AccordionTrigger
 *
 * Button that toggles the expanded state of an accordion item.
 * Includes a chevron icon that rotates when expanded.
 */
interface AccordionTriggerProps extends React.ComponentProps<
  typeof AccordionPrimitive.Trigger
> {}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="nx:flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          // nexus-allow-numeric: item-tier rhythm
          'nx:flex nx:flex-1 nx:items-center nx:justify-between nx:py-4 nx:text-sm nx:font-medium nx:text-foreground nx:transition-all nx:hover:underline nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:disabled:pointer-events-none nx:disabled:opacity-50 nx:[&[data-state=open]>svg]:rotate-180',
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
  );
}

/**
 * AccordionContent
 *
 * Collapsible content area for an accordion item.
 * Animates open/close with height transition.
 */
interface AccordionContentProps extends React.ComponentProps<
  typeof AccordionPrimitive.Content
> {}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="nx:overflow-hidden nx:text-sm nx:text-muted-foreground nx:transition-all nx:data-[state=closed]:animate-accordion-up nx:data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('nx:pb-4 nx:pt-0', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export {
  Accordion,
  AccordionContent,
  type AccordionContentProps,
  AccordionItem,
  type AccordionItemProps,
  AccordionTrigger,
  type AccordionTriggerProps,
};
