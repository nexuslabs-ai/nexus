import * as React from 'react';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconChevronDown } from '@/lib/icons';
import { cn } from '@/lib/utils';

const accordionVariants = cva(
  'nx:group/accordion nx:flex nx:w-full nx:flex-col',
  {
    variants: {
      variant: {
        stacked: '',
        floating: 'nx:gap-2',
      },
    },
    defaultVariants: {
      variant: 'stacked',
    },
  }
);

type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root> &
  VariantProps<typeof accordionVariants>;

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
  variant = 'stacked',
  ...props
}: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-variant={variant}
      className={cn(accordionVariants({ variant }), className)}
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
      className={cn(
        'nx:border-b nx:border-border-default nx:px-4 nx:transition-colors nx:hover:bg-background-hover nx:data-[disabled]:border-border-disabled nx:data-[disabled]:text-disabled-foreground nx:data-[disabled]:hover:bg-transparent nx:data-[state=open]:pb-4',
        'nx:group-data-[variant=stacked]/accordion:last:border-b-0',
        'nx:group-data-[variant=floating]/accordion:rounded-md nx:group-data-[variant=floating]/accordion:border',
        className
      )}
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
          'nx:flex nx:w-full nx:flex-1 nx:items-start nx:gap-4 nx:py-4 nx:typography-label-default nx:text-foreground nx:transition-all nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:disabled:opacity-50 nx:disabled:[&>svg]:text-disabled-foreground nx:[&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...props}
      >
        <span
          data-slot="accordion-trigger-label"
          className="nx:min-w-0 nx:flex-1 nx:truncate nx:text-left"
        >
          {children}
        </span>
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
      className="nx:overflow-hidden nx:typography-body-small nx:text-muted-foreground nx:transition-all nx:data-[state=closed]:animate-accordion-up nx:data-[state=open]:animate-accordion-down nx:motion-reduce:data-[state=closed]:animate-none nx:motion-reduce:data-[state=open]:animate-none"
      {...props}
    >
      <div className={className}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export {
  Accordion,
  AccordionContent,
  type AccordionContentProps,
  AccordionItem,
  type AccordionItemProps,
  type AccordionProps,
  AccordionTrigger,
  type AccordionTriggerProps,
};
