import { useId } from 'react';

import { BASE_TONE_OPTIONS, CORNER_OPTIONS } from '@nxds/core';
import {
  Field,
  FieldDescription,
  FieldLabel,
  ToggleGroup,
  ToggleGroupItem,
} from '@nxds/react';
import { IconCheck } from '@tabler/icons-react';

import './appearance-choices.css';

export function SurfaceToneChoices({ value, onChange }) {
  const id = useId();
  return (
    <Field className="appearance-choices">
      <FieldLabel id={id} asChild>
        <span>Gray family</span>
      </FieldLabel>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => next && onChange(next)}
        aria-labelledby={id}
        aria-describedby={`${id}-help`}
        spacing={1}
        size="sm"
        className="appearance-tone-options nx:w-full"
      >
        {BASE_TONE_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="nx:flex-col nx:gap-2 nx:px-0 nx:py-2 nx:whitespace-normal"
          >
            <span
              className="appearance-tone-sample"
              style={{ background: option.color }}
              aria-hidden="true"
            >
              {value === option.value && <IconCheck size={16} />}
            </span>
            <span>{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <FieldDescription id={`${id}-help`}>
        Sets the neutral tones in your preview.
      </FieldDescription>
    </Field>
  );
}

export function CornerChoices({ value, onChange }) {
  const id = useId();
  return (
    <Field className="appearance-choices">
      <FieldLabel id={id} asChild>
        <span>Corners</span>
      </FieldLabel>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => next && onChange(next)}
        aria-labelledby={id}
        aria-describedby={`${id}-help`}
        spacing={2}
        size="sm"
        variant="outline-primary"
        className="appearance-corner-options nx:w-full"
      >
        {CORNER_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="nx:relative nx:flex-col nx:gap-2 nx:px-1 nx:py-3 nx:whitespace-normal"
          >
            <span
              className="appearance-corner-sample"
              data-radius={option.value}
              aria-hidden="true"
            />
            <span>{option.label}</span>
            {value === option.value && (
              <IconCheck
                className="nx:absolute nx:top-1 nx:right-1"
                size={16}
                aria-hidden="true"
              />
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <FieldDescription id={`${id}-help`}>
        One preset shapes every component.
      </FieldDescription>
    </Field>
  );
}
