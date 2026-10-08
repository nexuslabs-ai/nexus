import type * as React from 'react';

import { cn } from '@nexus_ds/react/utils';

export function InlineCode({
  className,
  ...props
}: React.ComponentProps<'code'>) {
  return (
    <code
      className={cn(
        'nx:font-mono nx:typography-code-inline nx:bg-muted nx:px-1 nx:py-0.5 nx:rounded-sm',
        className
      )}
      {...props}
    />
  );
}
