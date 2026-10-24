import { useId, useState } from 'react';

import {
  BRAND_COLOR_PRESETS,
  CORNER_OPTIONS,
  ELEVATION_OPTIONS,
  sanitizeNxdsAppearance,
} from '@nxds/core';
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  NativeSelect,
  NativeSelectOption,
} from '@nxds/react';

import { LiveComparisonChapter } from './LiveComparisonChapter';

function AppearanceChoice({ label, value, options, onChange }) {
  const id = useId();
  return (
    <Field orientation="responsive">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <NativeSelect
        id={id}
        size="sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Field>
  );
}

export function AppearanceComparisonChapter({
  stack,
  appearance,
  split,
  onSplitChange,
  example = 'workspace',
}) {
  const [overrides, setOverrides] = useState({});
  const nexusAppearance = sanitizeNxdsAppearance({
    ...appearance,
    ...overrides,
  });
  const brandOptions = BRAND_COLOR_PRESETS.map((preset) => ({
    value: preset.color,
    label: preset.label,
  }));
  if (
    !brandOptions.some((option) => option.value === nexusAppearance.brandColor)
  )
    brandOptions.push({ value: nexusAppearance.brandColor, label: 'Custom' });

  function update(name, value) {
    setOverrides((current) => ({ ...current, [name]: value }));
    onSplitChange(0);
  }
  function reset() {
    setOverrides({});
    onSplitChange(0);
  }

  return (
    <LiveComparisonChapter
      stack={stack}
      appearance={appearance}
      nexusAppearance={nexusAppearance}
      split={split}
      onSplitChange={onSplitChange}
      example={example}
    >
      <section
        className="coexistence-appearance-controls"
        aria-label="Nexus addition appearance"
      >
        <p className="coexistence-appearance-caption">
          <strong>Nexus appearance</strong>
          <span>
            {example === 'reference'
              ? 'Only Nexus additions change.'
              : 'Only the invite card changes.'}
          </span>
        </p>
        <FieldGroup className="coexistence-appearance-fields">
          <AppearanceChoice
            label="Brand"
            value={nexusAppearance.brandColor}
            options={brandOptions}
            onChange={(value) => update('brandColor', value)}
          />
          <AppearanceChoice
            label="Corners"
            value={nexusAppearance.corners}
            options={CORNER_OPTIONS}
            onChange={(value) => update('corners', value)}
          />
          <AppearanceChoice
            label="Elevation"
            value={nexusAppearance.elevation}
            options={ELEVATION_OPTIONS}
            onChange={(value) => update('elevation', value)}
          />
        </FieldGroup>
        <Button size="sm" variant="ghost" onClick={reset}>
          Reset
        </Button>
      </section>
    </LiveComparisonChapter>
  );
}
