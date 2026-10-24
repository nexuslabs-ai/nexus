import { useId } from 'react';

import { NxdsAppearanceColorField } from '@nexus-dock/color-field';
import { PropertySlider } from '@nexus-dock/property-slider';
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
  Switch,
} from '@nxds/react';

const rowClass =
  'nx:min-h-10 nx:flex-row nx:items-center nx:gap-2 nx:rounded-md nx:bg-container nx:px-3 nx:py-1';
const labelClass =
  'nx:min-w-0 nx:flex-1 nx:typography-label-small nx:text-muted-foreground';
const descriptionClass = 'nx:typography-body-small';

function AppearanceSelect({ label, value, options, onChange, description }) {
  const id = useId();
  return (
    <div className="nx:flex nx:min-w-0 nx:flex-col nx:gap-2">
      <Field orientation="horizontal" className={rowClass}>
        <div className="nx:shrink-0">
          <FieldLabel htmlFor={id} className={labelClass}>
            {label}
          </FieldLabel>
        </div>
        <div className="nx:min-w-0 nx:flex-1">
          <NativeSelect
            size="sm"
            variant="borderless"
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-describedby={description ? `${id}-help` : undefined}
            className="nx:bg-transparent nx:autofill-bg-transparent nx:pl-0 nx:text-right nx:typography-label-small nx:enabled:hover:bg-transparent nx:enabled:hover:autofill-bg-transparent"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </Field>
      {description && (
        <FieldDescription id={`${id}-help`} className={descriptionClass}>
          {description}
        </FieldDescription>
      )}
    </div>
  );
}

function AppearanceRange({ onChange, ...props }) {
  return <PropertySlider {...props} onValueChange={onChange} />;
}

export function NexusPropertyControls({
  tool,
  appearance,
  onChange,
  onReset,
  scopeDescription = 'Applies to the component preview.',
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
    <div
      data-slot="nexus-property-controls"
      className="nx:min-w-0 nx:overflow-y-auto nx:p-0.5"
    >
      <FieldGroup className="nx:gap-2">
        {tool === 'Theme' && (
          <>
            <Field orientation="horizontal" className={rowClass}>
              <FieldLabel htmlFor={id} className={labelClass}>
                Dark mode
              </FieldLabel>
              <Switch
                id={id}
                checked={appearance.mode === 'dark'}
                onCheckedChange={(checked) =>
                  update('mode', checked ? 'dark' : 'light')
                }
              />
            </Field>
            <FieldDescription className={descriptionClass}>
              {scopeDescription}
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
            <Field orientation="horizontal" className={rowClass}>
              <FieldLabel asChild className={labelClass}>
                <span>Brand color</span>
              </FieldLabel>
              <NxdsAppearanceColorField
                variant="compact"
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
            label="Density"
            value={appearance.density}
            options={DENSITY_OPTIONS}
            onChange={(value) => update('density', value)}
            description="Changes component spacing. The grid stays in place."
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
