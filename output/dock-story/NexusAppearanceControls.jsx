import { useId, useState } from 'react';

import {
  BASE_TONE_OPTIONS,
  BRAND_COLOR_PRESETS,
  CORNER_OPTIONS,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  STROKE_OPTIONS,
} from '@nxds/core';
import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  NativeSelect,
  NxdsAppearanceColorField,
  Slider,
  Switch,
} from '@nxds/react';

import './nexus-appearance-controls.css';

function AppearanceSelect({
  label,
  value,
  options,
  onChange,
  description,
  compact,
}) {
  const id = useId();
  return (
    <Field className={compact ? 'compact-property-select' : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <NativeSelect
        size={compact ? 'sm' : 'default'}
        variant={compact ? 'borderless' : 'bordered'}
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={description ? `${id}-help` : undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect>
      {description && (
        <FieldDescription id={`${id}-help`}>{description}</FieldDescription>
      )}
    </Field>
  );
}

function RangeValue({ label, value, min, max, unit, onChange }) {
  const [draft, setDraft] = useState(String(value));
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(String(value));
  }
  function commit(event) {
    const text = event.currentTarget.value.trim();
    const number = Number(text);
    const next =
      text && Number.isFinite(number)
        ? Math.min(max, Math.max(min, Math.round(number)))
        : value;
    setDraft(String(next));
    onChange(next);
  }
  function handleKeyDown(event) {
    if (event.key === 'Enter') event.currentTarget.blur();
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setDraft(String(value));
    }
  }
  return (
    <span className="compact-property-value">
      <Input
        size="sm"
        variant="ghost"
        inputMode="numeric"
        aria-label={`${label} value${unit ? ` in ${unit}` : ''}`}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
      />
      {unit && <span aria-hidden="true">{unit}</span>}
    </span>
  );
}

function AppearanceRange({
  label,
  value,
  min,
  max,
  unit = '',
  onChange,
  compact,
}) {
  const id = useId();
  return (
    <Field>
      <div
        className={compact ? 'compact-property-range' : 'appearance-range-body'}
      >
        <FieldLabel id={id}>
          {label}
          {!compact && ` · ${value}${unit}`}
        </FieldLabel>
        <Slider
          aria-labelledby={id}
          min={min}
          max={max}
          step={1}
          value={[value]}
          onValueChange={([next]) => onChange(next)}
        />
        {compact && (
          <RangeValue
            label={label}
            value={value}
            min={min}
            max={max}
            unit={unit}
            onChange={onChange}
          />
        )}
      </div>
    </Field>
  );
}

export function NexusAppearanceControls({
  tool,
  appearance,
  onChange,
  onReset,
  scopeDescription = 'Applies to the component preview.',
  surfaceToneControl,
  cornersControl,
  compact = false,
}) {
  const id = useId();
  const contrastKey =
    appearance.mode === 'dark' ? 'darkContrast' : 'lightContrast';
  function update(name, value) {
    onChange({ ...appearance, [name]: value });
  }
  function updatePrefs(name, value) {
    onChange({ ...appearance, prefs: { ...appearance.prefs, [name]: value } });
  }
  return (
    <div
      className={`nexus-appearance-controls${compact ? ' compact-property-controls' : ''}`}
    >
      <FieldGroup className={compact ? 'nx:gap-2' : 'nx:gap-4'}>
        {tool === 'Theme' && (
          <>
            <Field
              orientation="horizontal"
              className={compact ? 'compact-property-toggle' : undefined}
            >
              <FieldLabel htmlFor={id}>
                {compact ? 'Dark mode' : 'Dark preview'}
              </FieldLabel>
              <Switch
                id={id}
                checked={appearance.mode === 'dark'}
                onCheckedChange={(checked) =>
                  update('mode', checked ? 'dark' : 'light')
                }
              />
            </Field>
            <FieldDescription>{scopeDescription}</FieldDescription>
            <AppearanceRange
              compact={compact}
              label="Contrast"
              value={appearance[contrastKey]}
              min={0}
              max={100}
              onChange={(value) => update(contrastKey, value)}
            />
          </>
        )}
        {tool === 'Colors' && (
          <>
            <AppearanceSelect
              compact={compact}
              label="Brand preset"
              value={appearance.brandColor}
              options={[
                ...BRAND_COLOR_PRESETS.map((preset) => ({
                  value: preset.color,
                  label: preset.label,
                })),
                ...(!BRAND_COLOR_PRESETS.some(
                  (preset) => preset.color === appearance.brandColor
                )
                  ? [{ value: appearance.brandColor, label: 'Custom' }]
                  : []),
              ]}
              onChange={(value) => update('brandColor', value)}
            />
            <Field className="nexus-color-control">
              <FieldLabel asChild>
                <span>Brand color</span>
              </FieldLabel>
              <NxdsAppearanceColorField
                label="Brand color"
                value={appearance.brandColor}
                onChange={(value) => update('brandColor', value)}
              />
            </Field>
            {surfaceToneControl ?? (
              <AppearanceSelect
                compact={compact}
                label="Surface tone"
                value={appearance.surfaceTone}
                options={BASE_TONE_OPTIONS}
                onChange={(value) => update('surfaceTone', value)}
              />
            )}
          </>
        )}
        {tool === 'Typography' && (
          <>
            <AppearanceSelect
              compact={compact}
              label="UI font"
              value={appearance.prefs.uiFont}
              options={[
                { value: 'DM Sans, Arial, sans-serif', label: 'DM Sans' },
                { value: DEFAULT_SYSTEM_FONT, label: 'System sans' },
                { value: 'ui-monospace, monospace', label: 'Monospace' },
              ]}
              onChange={(value) => updatePrefs('uiFont', value)}
            />
            <AppearanceRange
              compact={compact}
              label="UI size"
              value={appearance.prefs.uiFontSize}
              min={12}
              max={20}
              unit="px"
              onChange={(value) => updatePrefs('uiFontSize', value)}
            />
          </>
        )}
        {tool === 'Spacing' && (
          <AppearanceSelect
            compact={compact}
            label={compact ? 'Density' : 'Component density'}
            value={appearance.density}
            options={DENSITY_OPTIONS}
            onChange={(value) => update('density', value)}
            description="Changes component spacing. The grid stays in place."
          />
        )}
        {tool === 'Radius' &&
          (cornersControl ?? (
            <AppearanceSelect
              compact={compact}
              label="Corners"
              value={appearance.corners}
              options={CORNER_OPTIONS}
              onChange={(value) => update('corners', value)}
            />
          ))}
        {tool === 'More' && (
          <>
            <AppearanceSelect
              compact={compact}
              label="Elevation"
              value={appearance.elevation}
              options={ELEVATION_OPTIONS}
              onChange={(value) => update('elevation', value)}
            />
            <AppearanceSelect
              compact={compact}
              label="Stroke"
              value={appearance.stroke}
              options={STROKE_OPTIONS}
              onChange={(value) => update('stroke', value)}
            />
          </>
        )}
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset preview
        </Button>
      </FieldGroup>
    </div>
  );
}

const DEFAULT_SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
