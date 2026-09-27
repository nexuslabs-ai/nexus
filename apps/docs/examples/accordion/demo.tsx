'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/accordion/accordion';

export default function AccordionDemo() {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="shipping"
      className="nx:max-w-md"
    >
      <AccordionItem value="shipping">
        <AccordionTrigger>How long does shipping take?</AccordionTrigger>
        <AccordionContent>
          Orders ship within two business days and arrive in three to five.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Can I return an item?</AccordionTrigger>
        <AccordionContent>
          Unused items can be returned within 30 days for a full refund.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="support">
        <AccordionTrigger>How do I contact support?</AccordionTrigger>
        <AccordionContent>
          Email support@example.com and we reply within one business day.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
