import { useState } from 'react';

import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@nexus/react';
import { IconPalette } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

import { useThemeContext } from '../app/theme-provider';
import { BASES, BRANDS } from '../hooks/useTheme';

function SwatchRow<T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string; color: string }[];
  onSelect: (value: T) => void;
}) {
  return (
    <div className="nx:space-y-1.5">
      <p className="nx:typography-label-small nx:text-muted-foreground">
        {label}
      </p>
      <div className="nx:flex nx:flex-wrap nx:gap-1">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              aria-label={`${label}: ${opt.label}`}
              aria-pressed={active}
              title={opt.label}
              className="nx:hover:bg-background-hover nx:focus-visible:outline-focus-default nx:relative nx:flex nx:size-9 nx:items-center nx:justify-center nx:rounded-full nx:transition-colors nx:after:absolute nx:after:-inset-1 nx:focus-visible:outline-2 nx:focus-visible:outline-offset-(--focus-offset)"
            >
              <span
                className={cn(
                  'nx:size-5 nx:rounded-full nx:border-2 nx:transition-colors',
                  active ? 'nx:border-foreground' : 'nx:border-border-default'
                )}
                style={{ backgroundColor: opt.color }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Topbar theme quick-control — a Popover to flip the app's base + brand palette
 * from anywhere, turning the live re-theme engine into an instant demo (every
 * surface re-themes on click, the popover included). Dark mode stays a one-click
 * topbar button; the full token axes live behind "Customize…" (Appearance).
 */
export function ThemeQuickControl() {
  const { theme, setTheme } = useThemeContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Close the popover before navigating so it doesn't linger over Appearance.
  const openAppearance = () => {
    setOpen(false);
    navigate({ to: '/design/appearance' });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Theme">
          <IconPalette />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="nx:w-72 nx:space-y-3">
        <SwatchRow
          label="Base"
          value={theme.base}
          options={BASES}
          onSelect={(base) => setTheme((t) => ({ ...t, base }))}
        />
        <SwatchRow
          label="Brand"
          value={theme.brand}
          options={BRANDS}
          onSelect={(brand) => setTheme((t) => ({ ...t, brand }))}
        />
        <Separator />
        <Button
          variant="ghost"
          size="sm"
          className="nx:w-full nx:justify-start"
          onClick={openAppearance}
        >
          Customize…
        </Button>
      </PopoverContent>
    </Popover>
  );
}
