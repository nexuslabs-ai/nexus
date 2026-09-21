'use client';
import type * as React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@nexus_ds/react';

function Example0() {
  const { variant }: Partial<React.ComponentProps<typeof Accordion>> = {
    variant: 'stacked',
  };
  return (
    <Accordion
      type="single"
      collapsible
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that match the Nexus design system.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It has smooth open/close animations built-in.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
function Example1() {
  return (
    <div className="nx:grid nx:gap-8 nx:lg:grid-cols-2">
      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Single Stacked
        </h3>
        <Accordion type="single" collapsible className="nx:w-full nx:max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>First Item</AccordionTrigger>
            <AccordionContent>Content for the first item.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Second Item</AccordionTrigger>
            <AccordionContent>Content for the second item.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Multiple Stacked
        </h3>
        <Accordion
          type="multiple"
          defaultValue={['item-1', 'item-2']}
          className="nx:w-full nx:max-w-md"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>First Item (Open)</AccordionTrigger>
            <AccordionContent>Content for the first item.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Second Item (Open)</AccordionTrigger>
            <AccordionContent>Content for the second item.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Single Floating
        </h3>
        <Accordion
          type="single"
          collapsible
          variant="floating"
          className="nx:w-full nx:max-w-md"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>First Item</AccordionTrigger>
            <AccordionContent>Content for the first item.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Second Item</AccordionTrigger>
            <AccordionContent>Content for the second item.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Multiple Floating
        </h3>
        <Accordion
          type="multiple"
          variant="floating"
          defaultValue={['item-1', 'item-2']}
          className="nx:w-full nx:max-w-md"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Floating First Item (Open)</AccordionTrigger>
            <AccordionContent>This item is open by default.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Floating Second Item (Open)</AccordionTrigger>
            <AccordionContent>
              This item is also open by default.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
function Example2() {
  const { variant }: Partial<React.ComponentProps<typeof Accordion>> = {
    variant: 'stacked',
  };
  return (
    <Accordion
      type="single"
      collapsible
      disabled
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Disabled Item 1</AccordionTrigger>
        <AccordionContent>
          This content cannot be accessed when disabled.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Disabled Item 2</AccordionTrigger>
        <AccordionContent>
          This content cannot be accessed when disabled.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Disabled">
        <h2 className="nx:typography-heading-small">Disabled</h2>
        <Example2 />
      </section>
    </div>
  );
}
