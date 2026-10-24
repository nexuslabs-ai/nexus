import { useState } from 'react';

import {
  ButtonGroup,
  ColorControl,
  SelectControl,
  Slider,
  Toggle,
} from 'dialkit';

const palette = [
  { label: 'Lavender', value: '#c4c9f8' },
  { label: 'Apricot', value: '#ffc279' },
  { label: 'Coral', value: '#ffbeb0' },
  { label: 'Cyan', value: '#79deeb' },
  { label: 'Yellow', value: '#f8d75c' },
  { label: 'Mint', value: '#9bddbf' },
  { label: 'Blue', value: '#78baf6' },
  { label: 'Violet', value: '#bea6e8' },
  { label: 'Rose', value: '#eba9d0' },
];

function SourceControls({ settings }) {
  const [status, setStatus] = useState('Copy CSS');
  const code = `.card {\n  border-radius: ${settings.radius}px;\n  border-width: ${settings.border}px;\n}\n\n.grid {\n  gap: ${settings.gap}px;\n}`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus('Copied');
    } catch {
      setStatus('Select the code to copy');
    }
  }

  return (
    <>
      <pre className="dial-dock-source">
        <code>{code}</code>
      </pre>
      <ButtonGroup buttons={[{ label: status, onClick: copyCode }]} />
      <span className="story-visually-hidden" role="status">
        {status}
      </span>
    </>
  );
}

export function DialKitToolControls({
  tool,
  settings,
  onChange,
  theme,
  onThemeChange,
}) {
  if (tool === 'Theme')
    return (
      <Toggle
        label="Dark mode"
        checked={theme === 'dark'}
        onChange={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      />
    );
  if (tool === 'Colors')
    return (
      <>
        <SelectControl
          label="Palette"
          value={settings.accent}
          options={
            palette.some(({ value }) => value === settings.accent)
              ? palette
              : [...palette, { label: 'Custom', value: settings.accent }]
          }
          onChange={(value) => onChange('accent', value)}
        />
        <ColorControl
          label="Accent"
          value={settings.accent}
          onChange={(value) => onChange('accent', value)}
        />
        <Slider
          label="Surface tint"
          value={settings.tint}
          min={0}
          max={30}
          step={1}
          unit="%"
          onChange={(value) => onChange('tint', value)}
        />
      </>
    );
  if (tool === 'Typography')
    return (
      <>
        <Slider
          label="Heading size"
          value={settings.titleSize}
          min={30}
          max={64}
          step={1}
          unit="px"
          onChange={(value) => onChange('titleSize', value)}
        />
        <SelectControl
          label="Weight"
          value={settings.weight}
          options={['400', '500', '600']}
          onChange={(value) => onChange('weight', value)}
        />
      </>
    );
  if (tool === 'Spacing')
    return (
      <Slider
        label="Grid gap"
        value={settings.gap}
        min={8}
        max={32}
        step={1}
        unit="px"
        onChange={(value) => onChange('gap', value)}
      />
    );
  if (tool === 'Radius')
    return (
      <Slider
        label="Corner radius"
        value={settings.radius}
        min={0}
        max={32}
        step={1}
        unit="px"
        onChange={(value) => onChange('radius', value)}
      />
    );
  if (tool === 'More')
    return (
      <>
        <Slider
          label="Border width"
          value={settings.border}
          min={1}
          max={4}
          step={1}
          unit="px"
          onChange={(value) => onChange('border', value)}
        />
        <Slider
          label="Shadow"
          value={settings.shadow}
          min={0}
          max={32}
          step={1}
          unit="px"
          onChange={(value) => onChange('shadow', value)}
        />
      </>
    );
  if (tool === 'Content')
    return (
      <SelectControl
        label="Canvas layout"
        value={settings.layout}
        options={['Sidebar', 'Grid', 'Columns']}
        onChange={(value) => onChange('layout', value)}
      />
    );
  if (tool === 'Variants')
    return (
      <SelectControl
        label="Surface"
        value={settings.treatment}
        options={['Outline', 'Soft', 'Solid']}
        onChange={(value) => onChange('treatment', value)}
      />
    );
  if (tool === 'Composition')
    return (
      <>
        <SelectControl
          label="Canvas layout"
          value={settings.layout}
          options={['Sidebar', 'Grid', 'Columns']}
          onChange={(value) => onChange('layout', value)}
        />
        <Slider
          label="Grid gap"
          value={settings.gap}
          min={8}
          max={32}
          step={1}
          unit="px"
          onChange={(value) => onChange('gap', value)}
        />
      </>
    );
  if (tool === 'Source')
    return (
      <SourceControls
        key={`${settings.radius}-${settings.border}-${settings.gap}`}
        settings={settings}
      />
    );
  return null;
}
