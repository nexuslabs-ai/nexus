import * as React from 'react';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconChevronDown } from '../../lib/icons';
import { cn } from '../../lib/utils';

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
 * Stacks sections that expand and collapse. `type` sets whether one or several open at once.
 */
const Accordion = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AccordionProps>
>(function Accordion(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'stacked',
    ...props
  }: React.PropsWithoutRef<AccordionProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-variant={variant}
      className={cn(accordionVariants({ variant }), className)}
      {...props}
    />
  );
});

/**
 * One section, holding an AccordionTrigger and an AccordionContent.
 */
type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>;

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AccordionItemProps>
>(function AccordionItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<AccordionItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        'nx:border-color-default nx:bg-container nx:px-4 nx:transition-colors nx:duration-fast nx:hover:bg-container-hover nx:data-disabled:border-color-disabled nx:data-disabled:text-disabled-foreground nx:data-disabled:hover:bg-container nx:data-[state=open]:pb-4',
        'nx:group-data-[variant=stacked]/accordion:border-b-default nx:group-data-[variant=stacked]/accordion:last:border-b-0',
        'nx:group-data-[variant=floating]/accordion:rounded-md nx:group-data-[variant=floating]/accordion:border-width-default',
        className
      )}
      {...props}
    />
  );
});

/**
 * Button that opens and closes its item. Its chevron flips when the item is open.
 */
type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
>;

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<AccordionTriggerProps>
>(function AccordionTrigger(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    ...props
  }: React.PropsWithoutRef<AccordionTriggerProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <AccordionPrimitive.Header className="nx:m-0 nx:flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'nx:flex nx:w-full nx:flex-1 nx:items-start nx:gap-4 nx:border-0 nx:bg-transparent nx:px-0 nx:py-4 nx:typography-label-default nx:text-foreground nx:transition-control nx:duration-fast nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:disabled:[&>svg]:text-disabled-foreground nx:[&[data-state=open]>svg]:rotate-180',
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
          className="nx:size-4 nx:shrink-0 nx:text-muted-foreground nx:transition-transform nx:duration-default"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

/**
 * Content of an item. Its height animates as the item opens and closes.
 */
type AccordionContentProps = React.ComponentProps<
  typeof AccordionPrimitive.Content
>;

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AccordionContentProps>
>(function AccordionContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    ...props
  }: React.PropsWithoutRef<AccordionContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="nx:overflow-hidden nx:typography-body-default nx:text-muted-foreground nx:duration-default nx:data-[state=closed]:animate-accordion-up nx:data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={className}>{children}</div>
    </AccordionPrimitive.Content>
  );
});

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
