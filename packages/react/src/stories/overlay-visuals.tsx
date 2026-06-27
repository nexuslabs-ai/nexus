import type { CSSProperties, ReactNode } from 'react';

import { cn } from '../lib/utils';

const BUSY_OVERLAY_BACKDROP_STYLE = {
  backgroundColor: 'var(--nx-color-background)',
  backgroundImage:
    'linear-gradient(135deg, #ef4444 0 14%, transparent 14% 100%), repeating-linear-gradient(45deg, #3b82f6 0 24px, #22c55e 24px 48px, #eab308 48px 72px, #a855f7 72px 96px)',
} satisfies CSSProperties;

export function BusyOverlayStage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'nx:min-h-screen nx:overflow-hidden nx:p-10 nx:text-foreground',
        className
      )}
      style={BUSY_OVERLAY_BACKDROP_STYLE}
    >
      <div className="nx:flex nx:min-h-[480px] nx:items-center nx:justify-center">
        {children}
      </div>
    </div>
  );
}
