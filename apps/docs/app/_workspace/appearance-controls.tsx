'use client';

import { type ChangeEvent, type ReactNode, useId, useState } from 'react';

import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  type NexusAppearanceMode,
  type NexusAppearancePrefs,
  type NexusAppearanceState,
  STROKE_OPTIONS,
} from '@nexus_ds/core';
import {
  Input,
  Label,
  NativeSelect,
  NativeSelectOption,
  NexusAppearanceBrandColorField,
  Slider,
  Switch,
} from '@nexus_ds/react';
import type { NexusResolvedAppearanceMode } from '@nexus_ds/react/appearance';

const MODE_OPTIONS = [
  { value: 'system', label: 'Follow device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const satisfies readonly { value: NexusAppearanceMode; label: string }[];

const CONTRAST_MIN = 0;
const CONTRAST_MAX = 100;
const FONT_SIZE_MIN = 8;
const FONT_SIZE_MAX = 32;

const LABEL_CLASS = 'nx:typography-label-default';
const FIELD_CLASS = 'nx:flex nx:flex-col nx:gap-2';

function ControlGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="nx:space-y-4">
      <h2 className="nx:typography-label-default nx:text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className={FIELD_CLASS}>
      <Label htmlFor={id}>{label}</Label>
      <NativeSelect
        id={id}
        value={value}
        // The options are exactly `options`, so the selected value is a `T`.
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

/** Moves freely while dragged and commits once the thumb is released. */
function ContrastField({
  mode,
  value,
  onChange,
}: {
  mode: NexusResolvedAppearanceMode;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  // Only a pointer drag holds a draft; keyboard steps commit straight to `value`.
  const [draft, setDraft] = useState<number | null>(null);
  const shown = draft ?? value;

  function moveDraft([next]: number[]) {
    if (next === undefined) return;
    setDraft((current) => (current === null ? null : next));
  }

  function commit([next]: number[]) {
    if (next !== undefined && next !== value) onChange(next);
  }

  return (
    <div className={FIELD_CLASS}>
      <div className="nx:flex nx:items-center nx:justify-between nx:gap-2">
        <span id={id} className={LABEL_CLASS}>
          Contrast
        </span>
        <span className="nx:typography-label-default nx:tabular-nums nx:text-muted-foreground">
          {shown}
        </span>
      </div>
      <Slider
        aria-labelledby={id}
        min={CONTRAST_MIN}
        max={CONTRAST_MAX}
        step={1}
        value={[shown]}
        onPointerDown={() => setDraft(value)}
        onPointerUp={() => setDraft(null)}
        onValueChange={moveDraft}
        onValueCommit={commit}
      />
      <p className="nx:typography-body-small nx:text-muted-foreground">
        Adjusts {mode} mode
      </p>
    </div>
  );
}

/** Commits every in-range entry; anything else waits in the field until blur. */
function FontSizeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    setDraft(text);
    const next = Number(text);
    if (text === '' || !Number.isInteger(next) || next === value) return;
    if (next < FONT_SIZE_MIN || next > FONT_SIZE_MAX) return;
    onChange(next);
  }

  return (
    <div className={FIELD_CLASS}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={FONT_SIZE_MIN}
        max={FONT_SIZE_MAX}
        value={draft ?? value}
        onChange={handleChange}
        onBlur={() => setDraft(null)}
      />
    </div>
  );
}

function SwitchField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="nx:flex nx:items-center nx:justify-between nx:gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/**
 * A preset pick, picker session, or hex edit always begins with a focus or a
 * click inside the field, so either one starts a new undo step.
 */
function BrandColorField({
  value,
  onChange,
  onGestureStart,
}: {
  value: string;
  onChange: (value: string) => void;
  onGestureStart: () => void;
}) {
  const id = useId();
  return (
    <div
      role="group"
      aria-labelledby={id}
      className={FIELD_CLASS}
      onFocusCapture={onGestureStart}
      onClickCapture={onGestureStart}
    >
      <span id={id} className={LABEL_CLASS}>
        Brand color
      </span>
      <NexusAppearanceBrandColorField
        label="Brand color"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export function AppearanceControls({
  state,
  resolvedMode,
  onChange,
  onGestureStart,
}: {
  state: NexusAppearanceState;
  resolvedMode: NexusResolvedAppearanceMode;
  onChange: (
    patch: Partial<NexusAppearanceState>,
    group?: keyof NexusAppearanceState
  ) => void;
  onGestureStart: () => void;
}) {
  const contrastKey =
    resolvedMode === 'dark' ? 'darkContrast' : 'lightContrast';

  function changePrefs(patch: Partial<NexusAppearancePrefs>) {
    onChange({ prefs: { ...state.prefs, ...patch } });
  }

  return (
    <div data-slot="appearance-controls" className="nx:space-y-8">
      <ControlGroup title="Color">
        <BrandColorField
          value={state.brandColor}
          onChange={(brandColor) => onChange({ brandColor }, 'brandColor')}
          onGestureStart={onGestureStart}
        />
        <SelectField
          label="Mode"
          value={state.mode}
          options={MODE_OPTIONS}
          onChange={(mode) => onChange({ mode })}
        />
        <SelectField
          label="Surface tone"
          value={state.surfaceTone}
          options={BASE_TONE_OPTIONS}
          onChange={(surfaceTone) => onChange({ surfaceTone })}
        />
        <ContrastField
          mode={resolvedMode}
          value={state[contrastKey]}
          onChange={(contrast) => onChange({ [contrastKey]: contrast })}
        />
      </ControlGroup>
      <ControlGroup title="Shape">
        <SelectField
          label="Density"
          value={state.density}
          options={DENSITY_OPTIONS}
          onChange={(density) => onChange({ density })}
        />
        <SelectField
          label="Corners"
          value={state.corners}
          options={CORNER_OPTIONS}
          onChange={(corners) => onChange({ corners })}
        />
        <SelectField
          label="Elevation"
          value={state.elevation}
          options={ELEVATION_OPTIONS}
          onChange={(elevation) => onChange({ elevation })}
        />
        <SelectField
          label="Stroke"
          value={state.stroke}
          options={STROKE_OPTIONS}
          onChange={(stroke) => onChange({ stroke })}
        />
      </ControlGroup>
      <ControlGroup title="Preferences">
        <FontSizeField
          label="UI font size"
          value={state.prefs.uiFontSize}
          onChange={(uiFontSize) => changePrefs({ uiFontSize })}
        />
        <FontSizeField
          label="Code font size"
          value={state.prefs.codeFontSize}
          onChange={(codeFontSize) => changePrefs({ codeFontSize })}
        />
        <SwitchField
          label="Reduce motion"
          checked={state.prefs.reduceMotion}
          onChange={(reduceMotion) => changePrefs({ reduceMotion })}
        />
        <SwitchField
          label="Pointer cursors"
          checked={state.prefs.pointerCursors}
          onChange={(pointerCursors) => changePrefs({ pointerCursors })}
        />
        <SwitchField
          label="Font smoothing"
          checked={state.prefs.fontSmoothing}
          onChange={(fontSmoothing) => changePrefs({ fontSmoothing })}
        />
      </ControlGroup>
    </div>
  );
}
