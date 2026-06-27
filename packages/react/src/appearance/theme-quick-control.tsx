import { useState } from 'react';

import { BASE_TONE_OPTIONS, type NexusSurfaceTone } from '@nexus/core';
import { IconPalette } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import { NexusAppearanceColorField } from './color-field';
import { useNexusAppearance } from './provider';

interface SwatchRowProps {
  label: string;
  value: NexusSurfaceTone;
  onSelect: (value: NexusSurfaceTone) => void;
}

export interface NexusThemeQuickControlProps {
  onCustomize?: () => void;
}

function SwatchRow({ label, value, onSelect }: SwatchRowProps) {
  return (
    <div className="nx:space-y-1.5">
      <p className="nx:typography-label-small nx:text-muted-foreground">
        {label}
      </p>
      <div className="nx:flex nx:flex-wrap nx:gap-1">
        {BASE_TONE_OPTIONS.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              aria-label={`${label}: ${option.label}`}
              aria-pressed={active}
              title={option.label}
              className="nx:hover:bg-background-hover nx:focus-visible:outline-focus-default nx:relative nx:flex nx:size-9 nx:items-center nx:justify-center nx:rounded-full nx:transition-colors nx:after:absolute nx:after:-inset-1 nx:focus-visible:outline-2 nx:focus-visible:outline-offset-(--focus-offset)"
            >
              <span
                className={cn(
                  'nx:size-5 nx:rounded-full nx:border-2 nx:transition-colors',
                  active ? 'nx:border-foreground' : 'nx:border-border-default'
                )}
                style={{ backgroundColor: option.color }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function NexusThemeQuickControl({
  onCustomize,
}: NexusThemeQuickControlProps) {
  const { state, setState } = useNexusAppearance();
  const [open, setOpen] = useState(false);

  const openCustomize = () => {
    if (!onCustomize) return;
    setOpen(false);
    onCustomize();
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
          label="Surface tone"
          value={state.surfaceTone}
          onSelect={(surfaceTone) =>
            setState((current) => ({ ...current, surfaceTone }))
          }
        />
        <div className="nx:space-y-1.5">
          <p className="nx:typography-label-small nx:text-muted-foreground">
            Brand color
          </p>
          <NexusAppearanceColorField
            label="Brand color"
            value={state.brandColor}
            onChange={(brandColor) =>
              setState((current) => ({ ...current, brandColor }))
            }
          />
        </div>
        {onCustomize ? (
          <>
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="nx:w-full nx:justify-start"
              onClick={openCustomize}
            >
              Customize...
            </Button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
