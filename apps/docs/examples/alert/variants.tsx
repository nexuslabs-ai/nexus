'use client';

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconTerminal2,
} from '@tabler/icons-react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/components/alert/alert';

export default function AlertVariants() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-md nx:flex-col nx:gap-4">
      <Alert variant="default">
        <AlertIcon>
          <IconTerminal2 />
        </AlertIcon>
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>A new version of the CLI is ready.</AlertDescription>
      </Alert>
      <Alert variant="information">
        <AlertIcon>
          <IconInfoCircle />
        </AlertIcon>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Maintenance is scheduled for Sunday.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertIcon>
          <IconCircleCheck />
        </AlertIcon>
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Your changes have been saved.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertIcon>
          <IconAlertTriangle />
        </AlertIcon>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Your trial ends in three days.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertIcon>
          <IconAlertCircle />
        </AlertIcon>
        <AlertTitle>Destructive</AlertTitle>
        <AlertDescription>The payment could not be processed.</AlertDescription>
      </Alert>
    </div>
  );
}
