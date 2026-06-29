import { type KeyboardEvent, useState } from 'react';

import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  type NexusAppearanceMode,
  type NexusAppearancePrefs,
  type NexusCorners,
  type NexusDensity,
  type NexusElevation,
  type NexusStroke,
  type NexusSurfaceTone,
  STROKE_OPTIONS,
} from '@nexus/core';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
} from '@nexus/react';
import { useNexusAppearance } from '@nexus/react/appearance';

import { NexusAppearanceColorField } from './color-field';
import { NexusAppearanceConfigPreview } from './config-preview';
import { NexusAppearanceSettingRow } from './setting-row';

const APPEARANCE_MODES: NexusAppearanceMode[] = ['light', 'dark', 'system'];
const REDUCE_MOTION_OPTIONS: NexusAppearancePrefs['reduceMotion'][] = [
  'system',
  'on',
  'off',
];
const FONT_SIZE_MIN = 8;
const FONT_SIZE_MAX = 32;

function isAppearanceMode(value: string): value is NexusAppearanceMode {
  return APPEARANCE_MODES.includes(value as NexusAppearanceMode);
}

function isReduceMotion(
  value: string
): value is NexusAppearancePrefs['reduceMotion'] {
  return REDUCE_MOTION_OPTIONS.includes(
    value as NexusAppearancePrefs['reduceMotion']
  );
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

export function NexusAppearanceSettings() {
  const { state, setState, resolvedMode } = useNexusAppearance();

  const updatePrefs = (patch: Partial<NexusAppearancePrefs>) => {
    setState((current) => ({
      ...current,
      prefs: { ...current.prefs, ...patch },
    }));
  };

  const setMode = (value: string) => {
    if (!isAppearanceMode(value)) return;
    setState((current) => ({ ...current, mode: value }));
  };

  const setContrast = (values: number[]) => {
    const contrast = values[0];
    if (contrast === undefined) return;
    setState((current) => ({ ...current, contrast }));
  };

  const setFontSize = (key: 'uiFontSize' | 'codeFontSize', value: number) => {
    if (key === 'uiFontSize') {
      updatePrefs({ uiFontSize: value });
      return;
    }

    updatePrefs({ codeFontSize: value });
  };

  const setReduceMotion = (value: string) => {
    if (!isReduceMotion(value)) return;
    updatePrefs({ reduceMotion: value });
  };

  return (
    <div data-slot="appearance-settings" className="nx:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Brand color, surface tone, and contrast apply live across the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="nx:space-y-4">
          <NexusAppearanceSettingRow
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
          </NexusAppearanceSettingRow>

          <NexusAppearanceSettingRow
            label="Brand color"
            description="Primary actions, selected states, and highlights"
          >
            <NexusAppearanceColorField
              label="Brand color"
              value={state.brandColor}
              onChange={(brandColor) =>
                setState((current) => ({ ...current, brandColor }))
              }
            />
          </NexusAppearanceSettingRow>

          <NexusAppearanceSettingRow
            label="Surface tone"
            description="Neutral surfaces, borders, and muted UI"
          >
            <AxisSelect<NexusSurfaceTone>
              value={state.surfaceTone}
              options={BASE_TONE_OPTIONS}
              onValueChange={(surfaceTone) =>
                setState((current) => ({ ...current, surfaceTone }))
              }
              ariaLabel="Surface tone"
            />
          </NexusAppearanceSettingRow>

          <NexusAppearanceSettingRow
            label="Contrast"
            description={`${state.contrast}`}
          >
            <Slider
              value={[state.contrast]}
              onValueChange={setContrast}
              min={0}
              max={100}
              step={1}
              aria-label="Contrast"
              className="nx:w-48"
            />
          </NexusAppearanceSettingRow>

          <NexusAppearanceConfigPreview
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
          <NexusAppearanceSettingRow label="UI font">
            <Input
              value={state.prefs.uiFont}
              onChange={(event) => updatePrefs({ uiFont: event.target.value })}
              aria-label="UI font"
              className="nx:w-56 nx:font-mono nx:typography-body-small"
            />
          </NexusAppearanceSettingRow>
          <NexusAppearanceSettingRow label="Code font">
            <Input
              value={state.prefs.codeFont}
              onChange={(event) =>
                updatePrefs({ codeFont: event.target.value })
              }
              aria-label="Code font"
              className="nx:w-56 nx:font-mono nx:typography-body-small"
            />
          </NexusAppearanceSettingRow>
          <NexusAppearanceSettingRow label="UI font size">
            <FontSizeInput
              value={state.prefs.uiFontSize}
              ariaLabel="UI font size"
              onCommit={(value) => setFontSize('uiFontSize', value)}
            />
          </NexusAppearanceSettingRow>
          <NexusAppearanceSettingRow label="Code font size">
            <FontSizeInput
              value={state.prefs.codeFontSize}
              ariaLabel="Code font size"
              onCommit={(value) => setFontSize('codeFontSize', value)}
            />
          </NexusAppearanceSettingRow>
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
          <NexusAppearanceSettingRow label="Density">
            <AxisSelect<NexusDensity>
              value={state.density}
              options={DENSITY_OPTIONS}
              onValueChange={(density) =>
                setState((current) => ({ ...current, density }))
              }
              ariaLabel="Density"
            />
          </NexusAppearanceSettingRow>
          <NexusAppearanceSettingRow label="Corners">
            <AxisSelect<NexusCorners>
              value={state.corners}
              options={CORNER_OPTIONS}
              onValueChange={(corners) =>
                setState((current) => ({ ...current, corners }))
              }
              ariaLabel="Corners"
            />
          </NexusAppearanceSettingRow>
          <NexusAppearanceSettingRow label="Elevation">
            <AxisSelect<NexusElevation>
              value={state.elevation}
              options={ELEVATION_OPTIONS}
              onValueChange={(elevation) =>
                setState((current) => ({ ...current, elevation }))
              }
              ariaLabel="Elevation"
            />
          </NexusAppearanceSettingRow>
          <NexusAppearanceSettingRow label="Stroke">
            <AxisSelect<NexusStroke>
              value={state.stroke}
              options={STROKE_OPTIONS}
              onValueChange={(stroke) =>
                setState((current) => ({ ...current, stroke }))
              }
              ariaLabel="Stroke"
            />
          </NexusAppearanceSettingRow>
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
          <NexusAppearanceSettingRow
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
          </NexusAppearanceSettingRow>
          <NexusAppearanceSettingRow label="Reduce motion">
            <ToggleGroup
              type="single"
              value={state.prefs.reduceMotion}
              onValueChange={setReduceMotion}
              variant="outline"
              aria-label="Reduce motion"
            >
              <ToggleGroupItem value="system">System</ToggleGroupItem>
              <ToggleGroupItem value="on">On</ToggleGroupItem>
              <ToggleGroupItem value="off">Off</ToggleGroupItem>
            </ToggleGroup>
          </NexusAppearanceSettingRow>
          <NexusAppearanceSettingRow
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
          </NexusAppearanceSettingRow>
        </CardContent>
      </Card>
    </div>
  );
}
