'use client';

/**
 * Leading doc comment: does the CLI keep it?
 */
import { IconCheck } from '@tabler/icons-react';

import { cn } from '@/lib/utils';

import { Button } from '../components/button';

export const PROBE_ALIAS_STRING = '@/components/ui/button';

export function TransformProbe({ className }: { className?: string }) {
  return (
    <Button className={cn('nx:gap-2', className)}>
      <IconCheck />
      Probe
    </Button>
  );
}
