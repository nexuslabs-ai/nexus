import * as React from 'react';

import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../../components/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/dialog';

/**
 * Changes a story harness's props without any pointer or focus event. An
 * outside click would already dismiss an open editor, so tests that use one
 * cannot tell whether the prop change itself closed it.
 */
export function useStoryEvent(name: string, onEvent: () => void) {
  React.useEffect(() => {
    window.addEventListener(name, onEvent);
    return () => window.removeEventListener(name, onEvent);
  }, [name, onEvent]);
}

export function dispatchStoryEvent(name: string) {
  window.dispatchEvent(new Event(name));
}

/** A search form around a filter; counts real submissions of the parent. */
export function ParentForm({ children }: { children: React.ReactNode }) {
  const [submissions, setSubmissions] = React.useState(0);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmissions((count) => count + 1);
  }
  return (
    <form
      aria-label="Search form"
      onSubmit={submit}
      className="nx:grid nx:justify-items-start nx:gap-4 nx:p-4"
    >
      {children}
      <Button type="submit">Submit search</Button>
      <output aria-label="Parent submissions">{submissions}</output>
    </form>
  );
}

/** A filter placed inside a modal Dialog. */
export function DialogHost({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open filter settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter settings</DialogTitle>
          <DialogDescription>
            Edit the filter without leaving this dialog.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export async function expectEditorClosed(
  canvasElement: HTMLElement,
  name: string
) {
  const page = within(canvasElement.ownerDocument.body);
  await waitFor(() =>
    expect(page.queryByRole('dialog', { name })).not.toBeInTheDocument()
  );
}

export async function expectFocus(element: HTMLElement) {
  await waitFor(() => expect(element).toHaveFocus());
}

/** Waits for a modal menu to finish closing so the next story starts clean. */
export async function expectMenuClosed(canvasElement: HTMLElement) {
  const page = within(canvasElement.ownerDocument.body);
  await waitFor(() => expect(page.queryByRole('menu')).not.toBeInTheDocument());
}
