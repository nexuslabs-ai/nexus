'use client';

import { Badge, type BadgeProps } from '@/components/badge/badge';

const variants = [
  'default',
  'secondary',
  'success',
  'warning',
  'error',
  'information',
] as const satisfies BadgeProps['variant'][];

const fills = [
  'solid',
  'light',
  'outline',
] as const satisfies BadgeProps['fill'][];

export default function BadgeFills() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      {fills.map((fill) => (
        <div
          key={fill}
          className="nx:flex nx:flex-wrap nx:items-center nx:gap-2"
        >
          {variants.map((variant) => (
            <Badge key={variant} variant={variant} fill={fill}>
              {variant}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
}
