import type { ReactNode } from 'react';

interface NexusAppearanceSettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
}

export function NexusAppearanceSettingRow({
  label,
  description,
  children,
}: NexusAppearanceSettingRowProps) {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-4 nx:py-3">
      <div className="nx:min-w-44 nx:space-y-0.5">
        {/* Visual row label; the control itself carries the accessible name via aria-label. */}
        <span className="nx:typography-label-default nx:text-foreground">
          {label}
        </span>
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
