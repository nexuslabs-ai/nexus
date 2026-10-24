'use client';

import { useState } from 'react';

import {
  BASE_TONE_OPTIONS,
  type NxdsAppearanceMode,
  type NxdsSurfaceTone,
} from '@nxds/core';
import { IconPalette } from '@tabler/icons-react';

import { cn } from '../../../lib/utils';
import { Button } from '../../button/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../popover/popover';
import { Separator } from '../../separator/separator';
import { ToggleGroup, ToggleGroupItem } from '../../toggle-group/toggle-group';
import { NxdsAppearanceColorField } from '../color-field/color-field';
import { useNxdsAppearance } from '../provider';

interface SwatchRowProps {
  label: string;
  value: NxdsSurfaceTone;
  onSelect: (value: NxdsSurfaceTone) => void;
}

export interface NxdsThemeQuickControlProps {
  onCustomize?: () => void;
}

const MODE_OPTIONS: ReadonlyArray<{
  value: NxdsAppearanceMode;
  label: string;
}> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

function SwatchRow({ label, value, onSelect }: SwatchRowProps) {
  return (
    <div className="nx:space-y-1.5">
      <p className="nx:m-0 nx:typography-label-small nx:text-muted-foreground">
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
              className="nx:hover:bg-background-hover nx:focus-visible:outline-focus-default nx:relative nx:flex nx:size-9 nx:border-0 nx:bg-transparent nx:p-0 nx:items-center nx:justify-center nx:rounded-full nx:transition-control nx:after:absolute nx:after:-inset-1 nx:focus-visible:outline-2"
            >
              <span
                className={cn(
                  'nx:size-5 nx:rounded-full nx:border-thick nx:transition-colors',
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

export function NxdsThemeQuickControl({
  onCustomize,
}: NxdsThemeQuickControlProps) {
  const { state, setState } = useNxdsAppearance();
  const [open, setOpen] = useState(false);

  const openCustomize = () => {
    if (!onCustomize) return;
    setOpen(false);
    onCustomize();
  };

  // The mode group registers its items in an effect, so on React 18 it isn't
  // tabbable yet when the popover moves focus in. Focus the chosen mode directly.
  const focusChosenMode = (event: Event) => {
    const chosen = (
      event.currentTarget as HTMLElement
    ).querySelector<HTMLElement>(
      '[data-slot="toggle-group-item"][data-state="on"]'
    );
    if (!chosen) return;
    event.preventDefault();
    chosen.focus();
  };

  const handleModeChange = (mode: string) => {
    if (!mode) return;
    setState((current) => ({ ...current, mode: mode as NxdsAppearanceMode }));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Theme"
          data-slot="theme-quick-control-trigger"
        >
          <IconPalette />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label="Theme quick control"
        className="nx:w-72 nx:space-y-3"
        onOpenAutoFocus={focusChosenMode}
      >
        <div className="nx:space-y-1.5">
          <p className="nx:m-0 nx:typography-label-small nx:text-muted-foreground">
            Mode
          </p>
          <ToggleGroup
            type="single"
            value={state.mode}
            variant="outline"
            size="sm"
            aria-label="Theme mode"
            className="nx:grid nx:w-full nx:grid-cols-3"
            onValueChange={handleModeChange}
          >
            {MODE_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={option.label}
                className="nx:w-full"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <SwatchRow
          label="Surface tone"
          value={state.surfaceTone}
          onSelect={(surfaceTone) =>
            setState((current) => ({ ...current, surfaceTone }))
          }
        />
        <div className="nx:space-y-1.5">
          <p className="nx:m-0 nx:typography-label-small nx:text-muted-foreground">
            Brand color
          </p>
          <NxdsAppearanceColorField
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
