'use client';

import { useEffect, useRef, useState } from 'react';

import { useNexusAppearance } from '@nexus_ds/react/appearance';
import { cn } from '@nexus_ds/react/utils';
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

/**
 * Asks for the *expanded* case so the unmatched value — the one the prerendered
 * HTML and the first client render both use — is the collapsed one.
 */
const EXPAND_QUERY = '(min-width: 64rem)';

export function ThemePicker() {
  const pathname = usePathname();

  // The landing page ships its own theme swapper, which this would overlap.
  if (pathname === '/') return null;

  return <ThemePanel />;
}

function ThemePanel() {
  const { state, setState } = useNexusAppearance();
  const expandedByDefault = useMediaQuery(EXPAND_QUERY);
  const [expandedOverride, setExpandedOverride] = useState<boolean | null>(
    null
  );
  const expanded = expandedOverride ?? expandedByDefault;
  const panelRef = useRef<HTMLElement>(null);

  // Publish the panel's real height so `scroll-pb` clears it and Tab never
  // parks a control underneath (WCAG 2.4.11).
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      const rect = panel.getBoundingClientRect();
      // Reserve the measured bottom gap twice: once below, once above.
      const clearance = rect.height + (window.innerHeight - rect.bottom) * 2;
      root.style.setProperty('--docs-panel-offset', `${clearance}px`);
    });
    observer.observe(panel);

    return () => {
      observer.disconnect();
      root.style.removeProperty('--docs-panel-offset');
    };
  }, []);

  const onChange = (mode: ThemeMode) => (value: string) => {
    setState((current) => updateThemeMode(current, mode, value));
  };

  return (
    <aside
      ref={panelRef}
      className="nx:fixed nx:bottom-6 nx:right-6 nx:z-popover nx:w-[300px] nx:max-h-[calc(100svh_-_2*var(--nx-spacing-6))] nx:overflow-y-auto nx:bg-popover nx:text-popover-foreground nx:border nx:border-border-default nx:rounded-lg nx:shadow-lg"
    >
      <Button
        variant="ghost"
        onClick={() => setExpandedOverride(!expanded)}
        aria-expanded={expanded}
        className="nx:w-full nx:justify-between nx:rounded-lg"
      >
        <span>⚙ Theme</span>
        <span
          className={cn(
            'nx:text-muted-foreground nx:transition-transform',
            expanded && 'nx:rotate-180'
          )}
        >
          ▼
        </span>
      </Button>
      {expanded && (
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

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
