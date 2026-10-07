'use client';

import * as React from 'react';

import { cn } from '@nexus_ds/react/utils';

import { getScrollOffset } from '../_lib/scroll-offset';

import { Button } from './nexus';

/** Blocks this short show whole; `nx:max-h-32` clips longer ones to about three lines. */
const COLLAPSE_AFTER_LINES = 6;

/**
 * A bordered `bg-container` card: `header` on top, a code block attached flush
 * beneath it. A long block is clipped to its first few lines behind a fade,
 * with a centred toggle that reveals the rest and hides it again.
 */
export function CodeCard({
  lines,
  header,
  className,
  children,
  ...props
}: React.ComponentProps<'figure'> & {
  /** Line count of the code inside, which decides whether it collapses at all. */
  lines: number;
  header: React.ReactNode;
}) {
  const cardRef = React.useRef<HTMLElement>(null);

  const returnToCard = () => {
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < getScrollOffset()) {
      card.scrollIntoView({ block: 'start' });
    }
  };

  return (
    <figure
      ref={cardRef}
      {...props}
      className={cn(
        'nx:overflow-hidden nx:rounded-md nx:border nx:border-border-default nx:bg-container',
        className
      )}
    >
      {header}
      {lines > COLLAPSE_AFTER_LINES ? (
        <CodeCollapsible onCollapse={returnToCard}>{children}</CodeCollapsible>
      ) : (
        children
      )}
    </figure>
  );
}

function CodeCollapsible({
  onCollapse,
  children,
}: {
  /** Collapsing a long block from below would leave the reader past its end. */
  onCollapse: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const regionId = React.useId();

  const handleToggle = () => {
    setOpen(!open);
    if (open) onCollapse();
  };

  return (
    <div
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
