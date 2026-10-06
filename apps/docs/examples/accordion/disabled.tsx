'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/accordion/accordion';

export default function AccordionDisabled() {
  return (
    <Accordion type="single" collapsible className="nx:max-w-md">
      <AccordionItem value="plan">
        <AccordionTrigger>Current plan</AccordionTrigger>
        <AccordionContent>You are on the Team plan.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="enterprise" disabled>
        <AccordionTrigger>Enterprise features</AccordionTrigger>
        <AccordionContent>Available on the Enterprise plan.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
