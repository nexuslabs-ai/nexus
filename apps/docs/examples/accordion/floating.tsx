'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/accordion/accordion';

export default function AccordionFloating() {
  return (
    <Accordion
      type="single"
      collapsible
      variant="floating"
      className="nx:max-w-md"
    >
      <AccordionItem value="billing">
        <AccordionTrigger>Billing</AccordionTrigger>
        <AccordionContent>
          Invoices are issued on the first of each month.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="seats">
        <AccordionTrigger>Seats</AccordionTrigger>
        <AccordionContent>
          Add or remove seats at any time; changes are prorated.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="security">
        <AccordionTrigger>Security</AccordionTrigger>
        <AccordionContent>
          Enforce single sign-on and two-factor authentication for everyone.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
