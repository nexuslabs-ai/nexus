import type { ReactNode } from 'react';

import { Label } from '@nexus/react';

interface SettingRowProps {
  label: string;
  description?: string;
  /** Associates the label with the control for a11y. */
  htmlFor?: string;
  children: ReactNode;
}

/** One Codex settings row: label (+ optional description) left, control right. */
export function SettingRow({
  label,
  description,
  htmlFor,
  children,
}: SettingRowProps) {
  return (
    <div className="nx:flex nx:items-center nx:justify-between nx:gap-4 nx:py-3">
      <div className="nx:space-y-0.5">
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
