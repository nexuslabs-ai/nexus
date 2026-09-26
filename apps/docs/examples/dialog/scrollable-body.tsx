'use client';

import { Button } from '@/components/button/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog/dialog';

const SECTIONS = [
  'Your workspace data stays in the region you chose at sign-up.',
  'Admins can export or delete workspace data from settings at any time.',
  'Integrations only receive the scopes you approve when connecting them.',
  'Audit logs record every sign-in, permission change and export.',
  'Deleted projects are kept for thirty days before permanent removal.',
  'Billing contacts receive invoices and usage alerts by email.',
  'Single sign-on is enforced for every member once an admin enables it.',
  'Guests can only see the projects they are explicitly invited to.',
];

export default function DialogScrollableBody() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Review terms</Button>
      </DialogTrigger>
      <DialogContent className="nx:h-80">
        <DialogHeader>
          <DialogTitle>Workspace terms</DialogTitle>
          <DialogDescription>
            The body scrolls while the header and footer stay in place.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="nx:space-y-4 nx:typography-body-default nx:text-foreground">
          {SECTIONS.map((section) => (
            <p key={section}>{section}</p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
