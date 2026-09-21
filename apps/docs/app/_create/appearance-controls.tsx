import { useId } from 'react';

import type {
  NexusAppearancePrefs,
  NexusAppearanceState,
} from '@nexus_ds/core';
import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  STROKE_OPTIONS,
} from '@nexus_ds/core';
import {
  Input,
  NativeSelect,
  NativeSelectOption,
  NexusAppearanceBrandColorField,
  Switch,
} from '@nexus_ds/react';

interface ControlsProps {
  state: NexusAppearanceState;
  onChange: (patch: Partial<NexusAppearanceState>) => void;
}
interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}
export function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  const id = useId();
  return (
    <div className="nx:flex nx:flex-col nx:gap-2">
      <label htmlFor={id} className="nx:typography-label-small">
        {label}
      </label>
      <NativeSelect
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
export function AppearanceControls({ state, onChange }: ControlsProps) {
  function changePrefs(patch: Partial<NexusAppearancePrefs>) {
    onChange({ prefs: { ...state.prefs, ...patch } });
  }
  return (
    <section
      aria-label="Appearance controls"
      className="nx:space-y-6"
      data-slot="create-controls"
    >
      <div className="nx:space-y-2">
        <h2 className="nx:typography-heading-small">Make it yours</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          One theme. Every component.
        </p>
      </div>
      <div className="nx:space-y-2">
        <p className="nx:typography-label-small">Brand color</p>
        <NexusAppearanceBrandColorField
          label="Brand color"
          value={state.brandColor}
          onChange={(brandColor) => onChange({ brandColor })}
        />
      </div>
      <SelectField
        label="Appearance"
        value={state.mode}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
        onChange={(mode) =>
          onChange({ mode: mode === 'dark' ? 'dark' : 'light' })
        }
      />
      <SelectField
        label="Density"
        value={state.density}
        options={DENSITY_OPTIONS}
        onChange={(density) =>
          onChange({ density: density as NexusAppearanceState['density'] })
        }
      />
      <SelectField
        label="Corners"
        value={state.corners}
        options={CORNER_OPTIONS}
        onChange={(corners) =>
          onChange({ corners: corners as NexusAppearanceState['corners'] })
        }
      />
      <SelectField
        label="Surface tone"
        value={state.surfaceTone}
        options={BASE_TONE_OPTIONS}
        onChange={(surfaceTone) =>
          onChange({
            surfaceTone: surfaceTone as NexusAppearanceState['surfaceTone'],
          })
        }
      />
      {(['lightContrast', 'darkContrast'] as const).map((name) => (
        <label
          key={name}
          htmlFor={name}
          className="nx:flex nx:flex-col nx:gap-2"
        >
          <span className="nx:typography-label-small">
            {name === 'lightContrast' ? 'Light contrast' : 'Dark contrast'}
          </span>
          <Input
            id={name}
            type="number"
            min={0}
            max={100}
            value={state[name]}
            onChange={(event) => {
              if (event.target.value !== '')
                onChange({
                  [name]: Math.max(
                    0,
                    Math.min(100, Number(event.target.value))
                  ),
                });
            }}
          />
        </label>
      ))}
      <SelectField
        label="Elevation"
        value={state.elevation}
        options={ELEVATION_OPTIONS}
        onChange={(elevation) =>
          onChange({
            elevation: elevation as NexusAppearanceState['elevation'],
          })
        }
      />
      <SelectField
        label="Stroke"
        value={state.stroke}
        options={STROKE_OPTIONS}
        onChange={(stroke) =>
          onChange({ stroke: stroke as NexusAppearanceState['stroke'] })
        }
      />
      {(['uiFontSize', 'codeFontSize'] as const).map((name) => (
        <label
          key={name}
          htmlFor={name}
          className="nx:flex nx:flex-col nx:gap-2"
        >
          <span className="nx:typography-label-small">
            {name === 'uiFontSize' ? 'UI font size' : 'Code font size'}
          </span>
          <Input
            id={name}
            type="number"
            min={8}
            max={32}
            value={state.prefs[name]}
            onChange={(event) => {
              if (event.target.value !== '')
                changePrefs({
                  [name]: Math.max(8, Math.min(32, Number(event.target.value))),
                });
            }}
          />
        </label>
      ))}
      <SelectField
        label="Reduced motion"
        value={state.prefs.reduceMotion}
        options={[
          { value: 'system', label: 'Follow device' },
          { value: 'on', label: 'Reduce motion' },
          { value: 'off', label: 'Full motion' },
        ]}
        onChange={(reduceMotion) =>
          changePrefs({
            reduceMotion: reduceMotion as NexusAppearancePrefs['reduceMotion'],
          })
        }
      />
      <label
        htmlFor="pointer-preference"
        className="nx:flex nx:items-center nx:justify-between nx:gap-2"
      >
        Pointer cursors
        <Switch
          id="pointer-preference"
          checked={state.prefs.pointerCursors}
          onCheckedChange={(pointerCursors) => changePrefs({ pointerCursors })}
        />
      </label>
      <label
        htmlFor="smoothing-preference"
        className="nx:flex nx:items-center nx:justify-between nx:gap-2"
      >
        Font smoothing
        <Switch
          id="smoothing-preference"
          checked={state.prefs.fontSmoothing}
          onCheckedChange={(fontSmoothing) => changePrefs({ fontSmoothing })}
        />
      </label>
      <p className="nx:typography-body-small nx:text-muted-foreground">
        Changes apply to the canvas. Your docs preferences stay separate.
      </p>
    </section>
  );
}
