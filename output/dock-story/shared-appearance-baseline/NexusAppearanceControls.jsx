import { useId } from 'react';

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
  NativeSelect,
  NxdsAppearanceColorField,
  Slider,
  Switch,
} from '@nxds/react';

import './nexus-appearance-controls.css';

function AppearanceSelect({ label, value, options, onChange, description }) {
  const id = useId();
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <NativeSelect
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

function AppearanceRange({ label, value, min, max, unit = '', onChange }) {
  const id = useId();
  return (
    <Field>
      <FieldLabel id={id}>
        {label} · {value}
        {unit}
      </FieldLabel>
      <Slider
        aria-labelledby={id}
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
      />
    </Field>
  );
}

export function NexusAppearanceControls({
  tool,
  appearance,
  onChange,
  onReset,
  surfaceToneControl,
  cornersControl,
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
    <div className="nexus-appearance-controls">
      <FieldGroup className="nx:gap-4">
        {tool === 'Theme' && (
          <>
            <Field orientation="horizontal">
              <FieldLabel htmlFor={id}>Dark preview</FieldLabel>
              <Switch
                id={id}
                checked={appearance.mode === 'dark'}
                onCheckedChange={(checked) =>
                  update('mode', checked ? 'dark' : 'light')
                }
              />
            </Field>
            <FieldDescription>
              Applies to the component preview.
            </FieldDescription>
            <AppearanceRange
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
            label="Component density"
            value={appearance.density}
            options={DENSITY_OPTIONS}
            onChange={(value) => update('density', value)}
            description="Changes spacing within cards. The grid stays in place."
          />
        )}
        {tool === 'Radius' &&
          (cornersControl ?? (
            <AppearanceSelect
              label="Corners"
              value={appearance.corners}
              options={CORNER_OPTIONS}
              onChange={(value) => update('corners', value)}
            />
          ))}
        {tool === 'More' && (
          <>
            <AppearanceSelect
              label="Elevation"
              value={appearance.elevation}
              options={ELEVATION_OPTIONS}
              onChange={(value) => update('elevation', value)}
            />
            <AppearanceSelect
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
