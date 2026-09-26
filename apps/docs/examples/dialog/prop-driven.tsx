'use client';

import { Button } from '@/components/button/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/dialog/dialog';

export default function DialogPropDriven() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Invite teammate</Button>
      </DialogTrigger>
      <DialogContent
        title="Invite teammate"
        description="Send an invitation and assign their first workspace role."
        body={
          <p className="nx:typography-body-default nx:text-foreground">
            The invitation expires in seven days and can be revoked from team
            settings.
          </p>
        }
      >
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Send invite</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
