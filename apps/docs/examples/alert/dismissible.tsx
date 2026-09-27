'use client';

import { useState } from 'react';

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

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
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
        <AlertClose onClick={() => setOpen(false)} />
      </AlertActions>
    </Alert>
  );
}
