import { useState } from 'react';

const colors = [
  ['Lavender', '#c4c9f8'],
  ['Apricot', '#ffc279'],
  ['Coral', '#ffbeb0'],
  ['Cyan', '#79deeb'],
  ['Yellow', '#f8d75c'],
  ['Mint', '#9bddbf'],
  ['Blue', '#78baf6'],
  ['Violet', '#bea6e8'],
  ['Rose', '#eba9d0'],
];

function Choices({ label, options, value, onChange }) {
  return (
    <div className="dock-control">
      <span className="dock-control-label">{label}</span>
      <div className="dock-choice-group" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Range({ label, value, min = 0, max, unit = 'px', onChange }) {
  return (
    <label className="dock-control">
      <span className="dock-control-label">
        {label}
        <output>
          {value}
          {unit}
        </output>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

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
    <div className="dock-source">
      <pre>
        <code>{code}</code>
      </pre>
      <button type="button" onClick={copyCode}>
        {status}
      </button>
    </div>
  );
}

export function DockToolControls({
  tool,
  settings,
  onChange,
  theme,
  onThemeChange,
}) {
  if (tool === 'Theme')
    return (
      <Choices
        label="Appearance"
        options={['Light', 'Dark']}
        value={theme === 'light' ? 'Light' : 'Dark'}
        onChange={(value) => onThemeChange(value.toLowerCase())}
      />
    );
  if (tool === 'Colors')
    return (
      <div className="dock-color-controls">
        <div className="dock-swatches" role="group" aria-label="Accent colors">
          {colors.map(([name, color]) => (
            <button
              key={name}
              type="button"
              title={name}
              aria-label={name}
              aria-pressed={settings.accent === color}
              style={{ '--swatch': color }}
              onClick={() => onChange('accent', color)}
            />
          ))}
        </div>
        <div className="dock-color-values">
          <label className="dock-color-field">
            <span>Accent</span>
            <input
              aria-label="Custom accent color"
              type="color"
              value={settings.accent}
              onChange={(event) => onChange('accent', event.target.value)}
            />
            <output>{settings.accent.toUpperCase()}</output>
          </label>
          <Range
            label="Surface tint"
            value={settings.tint}
            max={30}
            unit="%"
            onChange={(value) => onChange('tint', value)}
          />
        </div>
      </div>
    );
  if (tool === 'Typography')
    return (
      <>
        <Range
          label="Heading size"
          value={settings.titleSize}
          min={30}
          max={64}
          onChange={(value) => onChange('titleSize', value)}
        />
        <Choices
          label="Weight"
          options={['400', '500', '600']}
          value={settings.weight}
          onChange={(value) => onChange('weight', value)}
        />
      </>
    );
  if (tool === 'Spacing')
    return (
      <Range
        label="Grid gap"
        value={settings.gap}
        min={8}
        max={32}
        onChange={(value) => onChange('gap', value)}
      />
    );
  if (tool === 'Radius')
    return (
      <>
        <div className="dock-radius-samples" aria-hidden="true">
          {[0, 8, 16, 24].map((radius) => (
            <span key={radius} style={{ borderRadius: radius }} />
          ))}
        </div>
        <Range
          label="Corner radius"
          value={settings.radius}
          max={32}
          onChange={(value) => onChange('radius', value)}
        />
      </>
    );
  if (tool === 'More')
    return (
      <>
        <Range
          label="Border width"
          value={settings.border}
          min={1}
          max={4}
          onChange={(value) => onChange('border', value)}
        />
        <Range
          label="Shadow"
          value={settings.shadow}
          max={32}
          onChange={(value) => onChange('shadow', value)}
        />
      </>
    );
  if (tool === 'Content')
    return (
      <Choices
        label="Canvas layout"
        options={['Sidebar', 'Grid', 'Columns']}
        value={settings.layout}
        onChange={(value) => onChange('layout', value)}
      />
    );
  if (tool === 'Variants')
    return (
      <Choices
        label="Surface"
        options={['Outline', 'Soft', 'Solid']}
        value={settings.treatment}
        onChange={(value) => onChange('treatment', value)}
      />
    );
  if (tool === 'Composition')
    return (
      <>
        <Choices
          label="Canvas layout"
          options={['Sidebar', 'Grid', 'Columns']}
          value={settings.layout}
          onChange={(value) => onChange('layout', value)}
        />
        <Range
          label="Grid gap"
          value={settings.gap}
          min={8}
          max={32}
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
