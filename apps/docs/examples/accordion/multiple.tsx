'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/accordion/accordion';

export default function AccordionMultiple() {
  return (
    <Accordion
      type="multiple"
      defaultValue={['profile', 'notifications']}
      className="nx:max-w-md"
    >
      <AccordionItem value="profile">
        <AccordionTrigger>Profile</AccordionTrigger>
        <AccordionContent>
          Your name and photo are visible to everyone in the workspace.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="notifications">
        <AccordionTrigger>Notifications</AccordionTrigger>
        <AccordionContent>
          Choose which activity sends you an email or a push notification.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="privacy">
        <AccordionTrigger>Privacy</AccordionTrigger>
        <AccordionContent>
          Control who can see your status and when you were last active.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
