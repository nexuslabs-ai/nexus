'use client';

import * as React from 'react';

import { cn } from '@nexus_ds/react/utils';

import { Button } from './nexus';

/** Blocks this short show whole; `nx:max-h-32` clips longer ones to about three lines. */
const COLLAPSE_AFTER_LINES = 6;

/**
 * Clips a code block to its first few lines behind a fade, with a centred
 * toggle that reveals the rest and hides it again. The caller's frame owns the
 * border and the `bg-container` surface the fade blends into.
 */
export function CodeCollapsible({
  lines,
  children,
}: {
  /** Line count of the code inside, which decides whether it collapses at all. */
  lines: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const regionId = React.useId();

  if (lines <= COLLAPSE_AFTER_LINES) return children;

  const handleToggle = () => {
    const collapsing = open;
    setOpen(!collapsing);
    if (collapsing) returnToCard(rootRef.current);
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

/**
 * Collapsing a long block from below would leave the reader past its end, so
 * bring the framing card back under the sticky header when its top is hidden.
 */
function returnToCard(root: HTMLElement | null) {
  const card = root?.parentElement;
  if (!card) return;

  const headerOffset =
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
    0;
  if (card.getBoundingClientRect().top < headerOffset) {
    card.scrollIntoView({ block: 'start' });
  }
}
