'use client';

import { type KeyboardEvent, useState } from 'react';

import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  type NxdsAppearanceMode,
  type NxdsAppearancePrefs,
  type NxdsCorners,
  type NxdsDensity,
  type NxdsElevation,
  type NxdsStroke,
  type NxdsSurfaceTone,
  STROKE_OPTIONS,
} from '@nxds/core';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../card/card';
import { Input } from '../../input/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../select/select';
import { Slider } from '../../slider/slider';
import { Switch } from '../../switch/switch';
import { ToggleGroup, ToggleGroupItem } from '../../toggle-group/toggle-group';
import { NxdsAppearanceBrandColorField } from '../brand-color-field/brand-color-field';
import { NxdsAppearanceConfigPreview } from '../config-preview/config-preview';
import { useNxdsAppearance } from '../provider';
import { NxdsAppearanceSettingRow } from '../setting-row/setting-row';

const APPEARANCE_MODES: NxdsAppearanceMode[] = ['light', 'dark', 'system'];
const FONT_SIZE_MIN = 8;
const FONT_SIZE_MAX = 32;

function isAppearanceMode(value: string): value is NxdsAppearanceMode {
  return APPEARANCE_MODES.includes(value as NxdsAppearanceMode);
}

function AxisSelect<TValue extends string>({
  value,
  options,
  onValueChange,
  ariaLabel,
}: {
  value: TValue;
  options: readonly { value: TValue; label: string }[];
  onValueChange: (value: TValue) => void;
  ariaLabel: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as TValue)}
    >
      <SelectTrigger className="nx:w-44" aria-label={ariaLabel}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function parseFontSize(value: string) {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(parsed)));
}

function FontSizeInput({
  value,
  onCommit,
  ariaLabel,
}: {
  value: number;
  onCommit: (value: number) => void;
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState(String(value));
  // Re-sync the draft when the committed value changes, during render (no effect).
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(String(value));
  }

  const commitDraft = () => {
    const parsed = parseFontSize(draft);
    if (parsed === null) {
      setDraft(String(value));
      return;
    }

    setDraft(String(parsed));
    onCommit(parsed);
  };

  const resetDraft = () => setDraft(String(value));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
      return;
    }

    if (event.key === 'Escape') {
      resetDraft();
      event.currentTarget.blur();
    }
  };

  return (
    <Input
      type="number"
      min={FONT_SIZE_MIN}
      max={FONT_SIZE_MAX}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commitDraft}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      className="nx:w-20"
    />
  );
}

export function NxdsAppearanceSettings() {
  const { state, setState, resolvedMode } = useNxdsAppearance();

  const updatePrefs = (patch: Partial<NxdsAppearancePrefs>) => {
    setState((current) => ({
      ...current,
      prefs: { ...current.prefs, ...patch },
    }));
  };

  const setMode = (value: string) => {
    if (!isAppearanceMode(value)) return;
    setState((current) => ({ ...current, mode: value }));
  };

  const contrastKey =
    resolvedMode === 'dark' ? 'darkContrast' : 'lightContrast';

  const setContrast = (values: number[]) => {
    const value = values[0];
    if (value === undefined) return;
    setState((current) => ({ ...current, [contrastKey]: value }));
  };

  const setFontSize = (key: 'uiFontSize' | 'codeFontSize', value: number) => {
    if (key === 'uiFontSize') {
      updatePrefs({ uiFontSize: value });
      return;
    }

    updatePrefs({ codeFontSize: value });
  };

  return (
    <div data-slot="appearance-settings" className="nx:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose your mode, brand color, surface tone, and contrast.
          </CardDescription>
        </CardHeader>
        <CardContent className="nx:space-y-4">
          <NxdsAppearanceSettingRow
            label="Mode"
            description={`Resolved as ${resolvedMode}`}
          >
            <ToggleGroup
              type="single"
              value={state.mode}
              onValueChange={setMode}
              variant="outline"
              aria-label="Mode"
            >
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="system">System</ToggleGroupItem>
            </ToggleGroup>
          </NxdsAppearanceSettingRow>

          <NxdsAppearanceSettingRow
            label="Brand color"
            description="Primary actions, selected states, and highlights"
          >
            <NxdsAppearanceBrandColorField
              label="Brand color"
              value={state.brandColor}
              onChange={(brandColor) =>
                setState((current) => ({ ...current, brandColor }))
              }
            />
          </NxdsAppearanceSettingRow>

          <NxdsAppearanceSettingRow
            label="Surface tone"
            description="Neutral surfaces, borders, and muted UI"
          >
            <AxisSelect<NxdsSurfaceTone>
              value={state.surfaceTone}
              options={BASE_TONE_OPTIONS}
              onValueChange={(surfaceTone) =>
                setState((current) => ({ ...current, surfaceTone }))
              }
              ariaLabel="Surface tone"
            />
          </NxdsAppearanceSettingRow>

          <p
            className="nx:m-0 nx:typography-body-small nx:text-muted-foreground"
            role="status"
          >
            Editing {resolvedMode} appearance
          </p>
          <NxdsAppearanceSettingRow
            label="Contrast"
            description={`Text and surface definition · ${state[contrastKey]}`}
          >
            <Slider
              value={[state[contrastKey]]}
              onValueChange={setContrast}
              min={0}
              max={100}
              step={1}
              aria-label="Contrast"
              className="nx:w-48"
            />
          </NxdsAppearanceSettingRow>

          <NxdsAppearanceConfigPreview
            state={state}
            resolvedMode={resolvedMode}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>UI and code font preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <NxdsAppearanceSettingRow label="UI font">
            <Input
              value={state.prefs.uiFont}
              onChange={(event) => updatePrefs({ uiFont: event.target.value })}
              aria-label="UI font"
              className="nx:w-56 nx:font-mono nx:typography-body-small"
            />
          </NxdsAppearanceSettingRow>
          <NxdsAppearanceSettingRow label="Code font">
            <Input
              value={state.prefs.codeFont}
              onChange={(event) =>
                updatePrefs({ codeFont: event.target.value })
              }
              aria-label="Code font"
              className="nx:w-56 nx:font-mono nx:typography-body-small"
            />
          </NxdsAppearanceSettingRow>
          <NxdsAppearanceSettingRow label="UI font size">
            <FontSizeInput
              value={state.prefs.uiFontSize}
              ariaLabel="UI font size"
              onCommit={(value) => setFontSize('uiFontSize', value)}
            />
          </NxdsAppearanceSettingRow>
          <NxdsAppearanceSettingRow label="Code font size">
            <FontSizeInput
              value={state.prefs.codeFontSize}
              ariaLabel="Code font size"
              onCommit={(value) => setFontSize('codeFontSize', value)}
            />
          </NxdsAppearanceSettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout Feel</CardTitle>
          <CardDescription>
            Density, corners, elevation, and stroke use curated token modes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NxdsAppearanceSettingRow label="Density">
            <AxisSelect<NxdsDensity>
              value={state.density}
              options={DENSITY_OPTIONS}
              onValueChange={(density) =>
                setState((current) => ({ ...current, density }))
              }
              ariaLabel="Density"
            />
          </NxdsAppearanceSettingRow>
          <NxdsAppearanceSettingRow label="Corners">
            <AxisSelect<NxdsCorners>
              value={state.corners}
              options={CORNER_OPTIONS}
              onValueChange={(corners) =>
                setState((current) => ({ ...current, corners }))
              }
              ariaLabel="Corners"
            />
          </NxdsAppearanceSettingRow>
          <NxdsAppearanceSettingRow label="Elevation">
            <AxisSelect<NxdsElevation>
              value={state.elevation}
              options={ELEVATION_OPTIONS}
              onValueChange={(elevation) =>
                setState((current) => ({ ...current, elevation }))
              }
              ariaLabel="Elevation"
            />
          </NxdsAppearanceSettingRow>
          <NxdsAppearanceSettingRow label="Stroke">
            <AxisSelect<NxdsStroke>
              value={state.stroke}
              options={STROKE_OPTIONS}
              onValueChange={(stroke) =>
                setState((current) => ({ ...current, stroke }))
              }
              ariaLabel="Stroke"
            />
          </NxdsAppearanceSettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Interaction, motion, and rendering preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NxdsAppearanceSettingRow
            label="Use pointer cursors"
            description="Pointer cursor on interactive elements"
          >
            <Switch
              checked={state.prefs.pointerCursors}
              onCheckedChange={(pointerCursors) =>
                updatePrefs({ pointerCursors })
              }
              aria-label="Use pointer cursors"
            />
          </NxdsAppearanceSettingRow>
          <NxdsAppearanceSettingRow label="Reduce motion">
            <Switch
              checked={state.prefs.reduceMotion}
              onCheckedChange={(reduceMotion) => updatePrefs({ reduceMotion })}
              aria-label="Reduce motion"
            />
          </NxdsAppearanceSettingRow>
          <NxdsAppearanceSettingRow
            label="Font smoothing"
            description="Native macOS anti-aliasing"
          >
            <Switch
              checked={state.prefs.fontSmoothing}
              onCheckedChange={(fontSmoothing) =>
                updatePrefs({ fontSmoothing })
              }
              aria-label="Font smoothing"
            />
          </NxdsAppearanceSettingRow>
        </CardContent>
      </Card>
    </div>
  );
}
