import { Suspense, useEffect, useState } from 'react';

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
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  TooltipProvider,
} from '@nexus_ds/react';

import { GalleryDemo } from '../demos/gallery-demo';
import { type ComponentId, GALLERY } from '../gallery';

import type { PreviewResult } from './protocol';

function Sampler({ onInspect }: { onInspect: (id: ComponentId) => void }) {
  const [saved, setSaved] = useState(false);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }
  return (
    <div className="nx:grid nx:grid-cols-1 nx:@lg:grid-cols-2 nx:gap-6">
      <Card>
        <CardHeader>
          <div className="nx:flex nx:items-center nx:justify-between nx:gap-2">
            <CardTitle>A fresh start</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onInspect('input')}
            >
              Inspect Input
            </Button>
          </div>
          <CardDescription>Give your next idea a name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="nx:space-y-5">
            <label
              htmlFor="project-name"
              className="nx:flex nx:flex-col nx:gap-2"
            >
              Project name
              <Input
                id="project-name"
                required
                placeholder="A little side project"
              />
            </label>
            <div className="nx:flex nx:flex-col nx:gap-2">
              <label id="visibility-label" htmlFor="project-visibility">
                Visibility
              </label>
              <Select defaultValue="private">
                <SelectTrigger
                  id="project-visibility"
                  aria-labelledby="visibility-label"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Only me</SelectItem>
                  <SelectItem value="team">My team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label
              htmlFor="project-updates"
              className="nx:flex nx:items-center nx:justify-between nx:gap-2"
            >
              Email updates
              <Switch id="project-updates" defaultChecked />
            </label>
            <Button className="nx:w-full" type="submit">
              Create project
            </Button>
            <p
              role="status"
              className="nx:typography-body-small nx:text-muted-foreground"
            >
              {saved
                ? 'Project created in this demo.'
                : 'Nothing is sent to a server.'}
            </p>
          </form>
        </CardContent>
      </Card>
      <div className="nx:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>A button for every moment</CardTitle>
            <CardDescription>
              Emphasis, restraint, and everything between.
            </CardDescription>
          </CardHeader>
          <CardContent className="nx:flex nx:flex-wrap nx:gap-3">
            <Button onClick={() => setSaved(true)}>Continue</Button>
            <Button variant="outline" onClick={() => setSaved(false)}>
              Go back
            </Button>
            <Button disabled>Unavailable</Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onInspect('button')}
            >
              Inspect Button
            </Button>
          </CardContent>
        </Card>
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
                  <DialogDescription>
                    This layer belongs to your preview.
                  </DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <label
                    htmlFor="dialog-project"
                    className="nx:flex nx:flex-col nx:gap-2"
                  >
                    Project name
                    <Input id="dialog-project" defaultValue="Something good" />
                  </label>
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
      </div>
    </div>
  );
}
function DemoFeedback({ children }: { children: React.ReactNode }) {
  const [activity, setActivity] = useState(
    'Try a control. Actions stay in this demo.'
  );
  function activate(event: React.MouseEvent<HTMLDivElement>) {
    if (!(event.target instanceof Element)) return;
    const control = event.target.closest('button, a, [role="menuitem"]');
    if (!control || control.getAttribute('aria-disabled') === 'true') return;
    // Demo links report their destination locally instead of replacing the frame.
    if (control instanceof HTMLAnchorElement) event.preventDefault();
    const label =
      control.getAttribute('aria-label') || control.textContent?.trim();
    if (label) setActivity('Activated: ' + label);
  }
  function submit(event: React.FormEvent<HTMLDivElement>) {
    event.preventDefault();
    setActivity('Submitted locally. No data was sent.');
  }
  return (
    <div className="nx:space-y-6" onClickCapture={activate} onSubmit={submit}>
      {children}
      <p
        role="status"
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        {activity}
      </p>
    </div>
  );
}

function Applied({ onApplied }: { onApplied: () => void }) {
  useEffect(onApplied, [onApplied]);
  return null;
}
export function PreviewScene({
  scene,
  onExit,
  onInspect,
  onApplied,
}: {
  scene: PreviewResult['scene'];
  onExit: () => void;
  onInspect: (id: ComponentId) => void;
  onApplied: () => void;
}) {
  const id = scene?.component ?? 'button';
  const item = GALLERY.find((entry) => entry.id === id) ?? GALLERY[0];
  const components = scene?.view === 'components';
  return (
    <TooltipProvider>
      <main
        key={scene?.reset ?? 0}
        className="nx:@container nx:space-y-8 nx:p-6"
        data-slot="preview-scene"
      >
        <header className="nx:space-y-2">
          <p className="nx:typography-label-small nx:text-muted-foreground">
            {components
              ? 'COMPONENTS / ' + item.label.toUpperCase()
              : 'YOUR NEXUS, IN ACTION'}
          </p>
          <h1 className="nx:typography-heading-large">
            {components ? item.label : 'Small details. One system.'}
          </h1>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            Try it. Change the theme. See what responds.
          </p>
        </header>
        <Suspense fallback={<p role="status">Loading example…</p>}>
          {components ? (
            <>
              <Button variant="outline" onClick={() => onInspect(id)}>
                Inspect {item.label}
              </Button>
              <DemoFeedback key={id}>
                <GalleryDemo id={id} />
              </DemoFeedback>
            </>
          ) : (
            <Sampler onInspect={onInspect} />
          )}
          <Applied onApplied={onApplied} />
        </Suspense>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Return to controls
        </Button>
      </main>
    </TooltipProvider>
  );
}
