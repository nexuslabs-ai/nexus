/**
 * Accordion Component Fixture
 *
 * Radix-based compound component with collapsible sections.
 * Used for testing extraction of:
 * - Radix primitive patterns
 * - Compound component relationships
 * - forwardRef with Radix components
 * - chevron/icon handling
 */

import * as React from 'react';

import * as AccordionPrimitive from '@radix-ui/react-accordion';

const Accordion = AccordionPrimitive.Root;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Fixture intentionally extends Radix props without additions
interface AccordionItemProps extends React.ComponentProps<
  typeof AccordionPrimitive.Item
> {}

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    data-slot="accordion-item"
    className={`border-b ${className}`}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

interface AccordionTriggerProps extends React.ComponentProps<
  typeof AccordionPrimitive.Trigger
> {
  /**
   * Whether to show the chevron icon.
   * @default true
   */
  showChevron?: boolean;
}

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, showChevron = true, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      data-slot="accordion-trigger"
      className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 ${className}`}
      {...props}
    >
      {children}
      {showChevron && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 transition-transform duration-200"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Fixture intentionally extends Radix props without additions
interface AccordionContentProps extends React.ComponentProps<
  typeof AccordionPrimitive.Content
> {}

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    data-slot="accordion-content"
    className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all"
    {...props}
  >
    <div className={`pt-0 pb-4 ${className}`}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };

export type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionTriggerProps,
};
