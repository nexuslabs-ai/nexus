import type { ReactNode } from 'react';

import { cn } from '../lib/utils';

export const SPACING_MODES = [
  'tight',
  'relaxed',
  'default',
  'compact',
  'comfortable',
  'spacious',
] as const;

export type SpacingMode = (typeof SPACING_MODES)[number];

/**
 * Outer scaffold for the `AllModes` cascade swatches — a flex-column over a
 * `nx:bg-background` canvas. Consumers map `SPACING_MODES` and emit one
 * `<AllModesRow>` per mode. Composition-shaped (no render callback) so the
 * per-component content stays at the consumer call site.
 */
export function AllModesGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background nx:min-w-fit',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * One row of an `AllModes` swatch — scopes `data-style={mode}` and renders the
 * mode-label gutter before the consumer's content.
 */
export function AllModesRow({
  mode,
  children,
}: {
  mode: SpacingMode;
  children: ReactNode;
}) {
  return (
    <div data-style={mode} className="nx:flex nx:gap-2 nx:items-center">
      <span className="nx:w-[64px] nx:typography-label-default nx:font-mono nx:text-muted-foreground">
        {mode}
      </span>
      {children}
    </div>
  );
}
