'use client';

import { useState } from 'react';

import { useThemeStore } from '../_stores/use-theme-store';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './nexus';

type ModeKey =
  | 'base'
  | 'brand'
  | 'spacing'
  | 'typography'
  | 'shadow'
  | 'radius'
  | 'borderwidth';

const PREFIX: Record<Exclude<ModeKey, 'spacing'>, string> = {
  base: 'base-',
  brand: 'brands-',
  typography: 'typography-',
  shadow: 'shadow-',
  radius: 'radius-',
  borderwidth: 'borderwidth-',
};

const OPTIONS: Record<ModeKey, { value: string; label: string }[]> = {
  base: [
    { value: 'slate', label: 'Slate' },
    { value: 'stone', label: 'Stone' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'gray', label: 'Gray' },
    { value: 'zinc', label: 'Zinc' },
  ],
  brand: [
    { value: 'blue', label: 'Blue' },
    { value: 'gray', label: 'Gray' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'slate', label: 'Slate' },
    { value: 'stone', label: 'Stone' },
  ],
  spacing: [
    { value: 'vega', label: 'Vega' },
    { value: 'lyra', label: 'Lyra' },
    { value: 'maia', label: 'Maia' },
    { value: 'mira', label: 'Mira' },
    { value: 'nova', label: 'Nova' },
    { value: 'luma', label: 'Luma' },
    { value: 'sera', label: 'Sera' },
  ],
  typography: [
    { value: 'vega', label: 'Vega' },
    { value: 'nova', label: 'Nova' },
    { value: 'maia', label: 'Maia' },
  ],
  shadow: [
    { value: 'vega', label: 'Vega' },
    { value: 'lyra', label: 'Lyra' },
    { value: 'maia', label: 'Maia' },
    { value: 'mira', label: 'Mira' },
    { value: 'nova', label: 'Nova' },
  ],
  radius: [
    { value: 'sharp', label: 'Sharp' },
    { value: 'subtle', label: 'Subtle' },
    { value: 'smooth', label: 'Smooth' },
    { value: 'mellow', label: 'Mellow' },
    { value: 'blunt', label: 'Blunt' },
  ],
  borderwidth: [
    { value: 'vega', label: 'Vega' },
    { value: 'lyra', label: 'Lyra' },
    { value: 'maia', label: 'Maia' },
    { value: 'mira', label: 'Mira' },
    { value: 'nova', label: 'Nova' },
  ],
};

function applyMode(mode: ModeKey, value: string) {
  if (mode === 'spacing') {
    document.documentElement.setAttribute('data-style', value);
    return;
  }
  const link = document.querySelector<HTMLLinkElement>(
    `link[data-theme="${mode}"]`
  );
  if (link) link.href = '/themes/' + PREFIX[mode] + value + '.css';
}

export function ThemePicker() {
  const base = useThemeStore((s) => s.base);
  const brand = useThemeStore((s) => s.brand);
  const spacing = useThemeStore((s) => s.spacing);
  const typography = useThemeStore((s) => s.typography);
  const shadow = useThemeStore((s) => s.shadow);
  const radius = useThemeStore((s) => s.radius);
  const borderwidth = useThemeStore((s) => s.borderwidth);
  const update = useThemeStore((s) => s.update);
  const [collapsed, setCollapsed] = useState(false);

  const onChange = (mode: ModeKey) => (value: string) => {
    update(mode, value);
    applyMode(mode, value);
  };

  return (
    <aside className="nx:fixed nx:bottom-6 nx:right-6 nx:z-[70] nx:w-[300px] nx:bg-popover nx:text-popover-foreground nx:border nx:border-border-default nx:rounded-lg nx:shadow-lg">
      <Button
        variant="ghost"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        className="nx:w-full nx:justify-between nx:rounded-lg"
      >
        <span>⚙ Theme</span>
        <span
          className={
            collapsed
              ? 'nx:text-muted-foreground nx:transition-transform'
              : 'nx:text-muted-foreground nx:transition-transform nx:rotate-180'
          }
        >
          ▼
        </span>
      </Button>
      {!collapsed && (
        <div className="nx:px-4 nx:pb-4 nx:border-t nx:border-border-default">
          <Section title="Colors">
            <Row label="Base">
              <ModeSelect
                mode="base"
                value={base}
                onChange={onChange('base')}
              />
            </Row>
            <Row label="Brand">
              <ModeSelect
                mode="brand"
                value={brand}
                onChange={onChange('brand')}
              />
            </Row>
          </Section>
          <Section title="Design Tokens">
            <Row label="Size">
              <ModeSelect
                mode="spacing"
                value={spacing}
                onChange={onChange('spacing')}
              />
            </Row>
            <Row label="Typography">
              <ModeSelect
                mode="typography"
                value={typography}
                onChange={onChange('typography')}
              />
            </Row>
            <Row label="Shadow">
              <ModeSelect
                mode="shadow"
                value={shadow}
                onChange={onChange('shadow')}
              />
            </Row>
            <Row label="Radius">
              <ModeSelect
                mode="radius"
                value={radius}
                onChange={onChange('radius')}
              />
            </Row>
            <Row label="Border Width">
              <ModeSelect
                mode="borderwidth"
                value={borderwidth}
                onChange={onChange('borderwidth')}
              />
            </Row>
          </Section>
        </div>
      )}
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="nx:pt-4">
      <h4 className="nx:text-[10px] nx:font-semibold nx:uppercase nx:tracking-wider nx:text-muted-foreground nx:mb-3">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="nx:grid nx:grid-cols-[1fr_auto] nx:items-center nx:gap-3 nx:py-1">
      <label className="nx:text-sm">{label}</label>
      {children}
    </div>
  );
}

function ModeSelect({
  mode,
  value,
  onChange,
}: {
  mode: ModeKey;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="nx:w-[120px] nx:h-8 nx:text-xs nx:capitalize">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS[mode].map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
