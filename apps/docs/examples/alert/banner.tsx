'use client';

import { IconInfoCircle } from '@tabler/icons-react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/components/alert/alert';

export default function AlertBanner() {
  return (
    <div className="nx:w-full nx:max-w-lg nx:overflow-hidden nx:rounded-md nx:border nx:border-border-default">
      <Alert presentation="banner" variant="information">
        <AlertIcon>
          <IconInfoCircle />
        </AlertIcon>
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>
          The dashboard is read-only on Sunday from 02:00 to 04:00 UTC.
        </AlertDescription>
      </Alert>
      <div className="nx:h-24 nx:bg-background" />
    </div>
  );
}
