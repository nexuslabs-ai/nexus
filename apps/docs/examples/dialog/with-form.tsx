'use client';

import { type FormEvent, useState } from 'react';

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
import { Input } from '@/components/input/input';
import { Label } from '@/components/label/label';

export default function DialogWithForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Ada Lovelace');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setName(String(data.get('name')));
    setOpen(false);
  }

  return (
    <div className="nx:flex nx:flex-col nx:items-center nx:gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit profile</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Change how your name appears to teammates.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <form
              id="dialog-with-form"
              className="nx:grid nx:gap-1.5"
              onSubmit={handleSubmit}
            >
              <Label htmlFor="dialog-with-form-name">Display name</Label>
              <Input
                id="dialog-with-form-name"
                name="name"
                defaultValue={name}
                required
              />
            </form>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form="dialog-with-form">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="nx:typography-body-default nx:text-muted-foreground">
        Display name: {name}
      </p>
    </div>
  );
}
