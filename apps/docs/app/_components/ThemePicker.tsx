'use client';

import { useState } from 'react';

import { useNexusAppearance } from '@nexus_ds/react/appearance';
import { usePathname } from 'next/navigation';

import {
  getThemeModeOptions,
  getThemeModeValue,
  type ThemeMode,
  updateThemeMode,
} from '../_lib/appearance-controls';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './nexus';

export function ThemePicker() {
  const { state, setState } = useNexusAppearance();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // The landing page ships its own in-page theme swapper; the global corner
  // picker would overlap it and duplicate its controls, so hide it there.
  if (pathname === '/') return null;

  const onChange = (mode: ThemeMode) => (value: string) => {
    setState((current) => updateThemeMode(current, mode, value));
  };

  return (
    <aside className="nx:fixed nx:bottom-6 nx:right-6 nx:z-popover nx:w-[300px] nx:bg-popover nx:text-popover-foreground nx:border nx:border-border-default nx:rounded-lg nx:shadow-lg">
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
            <Row label="Scheme">
              <ModeSelect
                mode="mode"
                value={getThemeModeValue(state, 'mode')}
                onChange={onChange('mode')}
              />
            </Row>
            <Row label="Base">
              <ModeSelect
                mode="base"
                value={getThemeModeValue(state, 'base')}
                onChange={onChange('base')}
              />
            </Row>
          </Section>
          <Section title="Design Tokens">
            <Row label="Size">
              <ModeSelect
                mode="spacing"
                value={getThemeModeValue(state, 'spacing')}
                onChange={onChange('spacing')}
              />
            </Row>
            <Row label="Shadow">
              <ModeSelect
                mode="shadow"
                value={getThemeModeValue(state, 'shadow')}
                onChange={onChange('shadow')}
              />
            </Row>
            <Row label="Radius">
              <ModeSelect
                mode="radius"
                value={getThemeModeValue(state, 'radius')}
                onChange={onChange('radius')}
              />
            </Row>
            <Row label="Border Width">
              <ModeSelect
                mode="borderwidth"
                value={getThemeModeValue(state, 'borderwidth')}
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
      <label className="nx:typography-label-default">{label}</label>
      {children}
    </div>
  );
}

function ModeSelect({
  mode,
  value,
  onChange,
}: {
  mode: ThemeMode;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="nx:w-[120px] nx:h-8 nx:typography-label-small nx:capitalize">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {getThemeModeOptions(mode).map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
