'use client';

import { IconInfoCircle } from '@tabler/icons-react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/components/alert/alert';

export default function AlertDemo() {
  return (
    <Alert className="nx:max-w-md">
      <AlertIcon>
        <IconInfoCircle />
      </AlertIcon>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the CLI.
      </AlertDescription>
    </Alert>
  );
}
