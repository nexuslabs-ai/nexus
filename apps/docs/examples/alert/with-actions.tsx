'use client';

import { IconAlertTriangle } from '@tabler/icons-react';

import {
  Alert,
  AlertActions,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/components/alert/alert';
import { Button } from '@/components/button/button';

export default function AlertWithActions() {
  return (
    <Alert variant="warning" className="nx:max-w-md">
      <AlertIcon>
        <IconAlertTriangle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Plan limit reached</AlertTitle>
        <AlertDescription>
          Upgrade the workspace or remove unused seats before inviting more
          members.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button>Upgrade</Button>
        <Button variant="outline">View usage</Button>
      </AlertActions>
    </Alert>
  );
}
