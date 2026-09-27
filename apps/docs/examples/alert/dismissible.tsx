'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { IconCircleCheck } from '@tabler/icons-react';

import {
  Alert,
  AlertActions,
  AlertClose,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/components/alert/alert';
import { Button } from '@/components/button/button';

export default function AlertDismissible() {
  const [open, setOpen] = useState(true);
  const showRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  function dismiss() {
    flushSync(() => setOpen(false));
    showRef.current?.focus();
  }

  function show() {
    flushSync(() => setOpen(true));
    closeRef.current?.focus();
  }

  if (!open) {
    return (
      <Button ref={showRef} variant="outline" onClick={show}>
        Show alert
      </Button>
    );
  }

  return (
    <Alert variant="success" layout="inline" className="nx:max-w-xl">
      <AlertIcon>
        <IconCircleCheck />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Import completed</AlertTitle>
        <AlertDescription>
          Review the imported contacts before publishing them.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">Review</Button>
        <AlertClose ref={closeRef} onClick={dismiss} />
      </AlertActions>
    </Alert>
  );
}
