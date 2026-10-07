'use client';

import * as React from 'react';

import { cn } from '@nexus_ds/react/utils';

import { Button } from './nexus';

/**
 * Clips a code block to its first few lines behind a fade, with a centred
 * toggle that reveals the rest and hides it again. The caller's frame owns the
 * border and the `bg-container` surface the fade blends into.
 */
export function CodeCollapsible({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const regionId = React.useId();

  const handleToggle = () => {
    setOpen(!open);
    // Collapsing a long block from below would leave the reader past its end.
    const root = rootRef.current;
    if (open && root && root.getBoundingClientRect().top < 0) {
      root.scrollIntoView({ block: 'start' });
    }
  };

  return (
    <div
      ref={rootRef}
      data-slot="code-collapsible"
      data-state={open ? 'open' : 'closed'}
      className="nx:relative"
    >
      <div
        id={regionId}
        className={cn(!open && 'nx:max-h-32 nx:overflow-hidden')}
      >
        {children}
      </div>
      <div
        className={cn(
          'nx:flex nx:justify-center nx:pb-4',
          !open &&
            'nx:absolute nx:inset-x-0 nx:bottom-0 nx:h-20 nx:items-end nx:bg-linear-to-t nx:from-container nx:to-transparent'
        )}
      >
        <Button
          variant="outline"
          size="sm"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={handleToggle}
        >
          {open ? 'Hide Code' : 'View Code'}
        </Button>
      </div>
    </div>
  );
}
