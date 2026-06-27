import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';

interface NexusAppearanceSettingRowProps {
  label: string;
  description?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function NexusAppearanceSettingRow({
  label,
  description,
  htmlFor,
  children,
}: NexusAppearanceSettingRowProps) {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-4 nx:py-3">
      <div className="nx:min-w-44 nx:space-y-0.5">
        <Label htmlFor={htmlFor}>{label}</Label>
        {description ? (
          <p className="nx:typography-body-small nx:text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="nx:shrink-0">{children}</div>
    </div>
  );
}
