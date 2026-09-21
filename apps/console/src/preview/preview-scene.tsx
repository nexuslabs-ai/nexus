import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nexus_ds/react';

interface PreviewSceneProps {
  mode: 'light' | 'dark';
  onExit: () => void;
}

export function PreviewScene({ mode, onExit }: PreviewSceneProps) {
  return (
    <main className="nx:space-y-8 nx:p-6" data-slot="preview-scene">
      <div className="nx:space-y-3">
        <p className="nx:typography-label-small nx:text-muted-foreground">
          {mode === 'dark' ? 'DARK PREVIEW' : 'LIGHT PREVIEW'}
        </p>
        <h1 className="nx:typography-heading-small">Nexus components</h1>
        <p className="nx:text-muted-foreground">
          Try a button, a floating surface, and a dialog. They share this
          preview’s theme.
        </p>
      </div>
      <div className="nx:flex nx:flex-wrap nx:gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Continue</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>A layer of the same theme</DialogTitle>
              <DialogDescription>
                The dialog, backdrop, and focus stay inside this preview.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p>
                The surface and its controls use the same Nexus tokens as the
                button you opened it with.
              </p>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Back to the preview</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Look closer</Button>
          </PopoverTrigger>
          <PopoverContent
            className="nx:max-w-full nx:space-y-2"
            aria-label="About this surface"
          >
            <h2 className="nx:typography-label-default">A floating surface</h2>
            <p className="nx:typography-body-small">
              Its background, text, border, and shadow all come from Nexus.
            </p>
          </PopoverContent>
        </Popover>
        <Button disabled>Disabled</Button>
      </div>
      <Button variant="ghost" size="sm" onClick={onExit}>
        Return to Console
      </Button>
    </main>
  );
}
