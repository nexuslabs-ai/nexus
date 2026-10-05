'use client';

import { type FormEvent, useId, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@nexus_ds/react';

const FIELD_CLASS = 'nx:flex nx:flex-col nx:gap-2';

function ProjectForm() {
  const id = useId();
  const [created, setCreated] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreated(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>A fresh start</CardTitle>
        <CardDescription>Give your next idea a name.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="nx:space-y-5">
          <div className={FIELD_CLASS}>
            <Label htmlFor={`${id}-name`}>Project name</Label>
            <Input
              id={`${id}-name`}
              required
              placeholder="A little side project"
            />
          </div>
          <div className={FIELD_CLASS}>
            <Label htmlFor={`${id}-visibility`}>Visibility</Label>
            <Select defaultValue="private">
              <SelectTrigger id={`${id}-visibility`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Only me</SelectItem>
                <SelectItem value="team">My team</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="nx:flex nx:items-center nx:justify-between nx:gap-2">
            <Label htmlFor={`${id}-updates`}>Email updates</Label>
            <Switch id={`${id}-updates`} defaultChecked />
          </div>
          <Button className="nx:w-full" type="submit">
            Create project
          </Button>
          <p
            role="status"
            className="nx:typography-body-small nx:text-muted-foreground"
          >
            {created
              ? 'Project created in this example.'
              : 'Nothing is sent to a server.'}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function ButtonShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>A button for every moment</CardTitle>
        <CardDescription>
          Emphasis, restraint, and everything between.
        </CardDescription>
      </CardHeader>
      <CardContent className="nx:flex nx:flex-wrap nx:gap-3">
        <Button>Continue</Button>
        <Button variant="outline">Go back</Button>
        <Button variant="ghost">Skip for now</Button>
        <Button disabled>Unavailable</Button>
      </CardContent>
    </Card>
  );
}

function LayerShowcase() {
  const id = useId();
  return (
    <Card>
      <CardHeader>
        <CardTitle>A closer look</CardTitle>
        <CardDescription>Open a layer. Keep your place.</CardDescription>
      </CardHeader>
      <CardContent className="nx:flex nx:flex-wrap nx:gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>A little space to focus</DialogTitle>
              <DialogDescription>Same theme, one layer up.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className={FIELD_CLASS}>
                <Label htmlFor={`${id}-dialog-name`}>Project name</Label>
                <Input id={`${id}-dialog-name`} defaultValue="Something good" />
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Quick details</Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>Same theme, another layer.</p>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}

/** A small product scene rendered with the appearance the page is showing. */
export function Sampler() {
  return (
    <div data-slot="create-sampler" className="nx:@container">
      <div className="nx:grid nx:grid-cols-1 nx:@2xl:grid-cols-2 nx:gap-6">
        <ProjectForm />
        <div className="nx:space-y-6">
          <ButtonShowcase />
          <LayerShowcase />
        </div>
      </div>
    </div>
  );
}
