'use client';

import {
  getThemeStylesheetHref,
  sanitizeMode,
  THEME_MODE_OPTIONS,
  type ThemeStylesheetMode,
} from '../_lib/theme-modes';
import { useThemeStore } from '../_stores/use-theme-store';

import { Button } from './nexus';

/**
 * Landing-page "Highlights" demo. Reuses the global theme store + the same
 * <link data-theme> swap the corner ThemePicker uses, so picking a base or
 * brand re-themes the entire page live (every surface is token-driven) and
 * stays in sync with the picker.
 */

type LiveThemeMode = Extract<ThemeStylesheetMode, 'base' | 'brand'>;

const BASES = THEME_MODE_OPTIONS.base.map((option) => option.value);
const BRANDS = THEME_MODE_OPTIONS.brand.map((option) => option.value);

function applyTheme(mode: LiveThemeMode, value: string) {
  const safeValue = sanitizeMode(mode, value);
  const link = document.querySelector<HTMLLinkElement>(
    `link[data-theme="${mode}"]`
  );
  if (link) link.href = getThemeStylesheetHref(mode, safeValue);
}

export function LiveThemeSwapper() {
  const base = useThemeStore((s) => s.base);
  const brand = useThemeStore((s) => s.brand);
  const update = useThemeStore((s) => s.update);

  const pick = (mode: LiveThemeMode, value: string) => {
    const safeValue = sanitizeMode(mode, value);
    update(mode, safeValue);
    applyTheme(mode, safeValue);
  };

  return (
    <div className="nx:h-full nx:rounded-xl nx:border nx:border-border-default nx:bg-container nx:p-5 nx:flex nx:flex-col nx:gap-4">
      <div className="nx:flex nx:items-center nx:justify-between">
        <span className="nx:font-mono nx:text-[11px] nx:uppercase nx:tracking-wider nx:text-muted-foreground-subtle">
          Live theme
        </span>
        <span className="nx:inline-flex nx:items-center nx:gap-1.5 nx:font-mono nx:text-[11px] nx:text-muted-foreground-subtle">
          <span className="nx:size-1.5 nx:rounded-full nx:bg-primary-background" />
          re-themes the page
        </span>
      </div>

      <ChipRow
        label="Base"
        values={BASES}
        active={base}
        onPick={(v) => pick('base', v)}
      />
      <ChipRow
        label="Brand"
        values={BRANDS}
        active={brand}
        onPick={(v) => pick('brand', v)}
      />

      <div className="nx:mt-auto nx:flex nx:flex-wrap nx:items-center nx:gap-2 nx:border-t nx:border-border-default nx:pt-4">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="secondary">
          Secondary
        </Button>
        <Button size="sm" variant="outline">
          Outline
        </Button>
        <span className="nx:ml-1 nx:flex nx:gap-1">
          <Swatch className="nx:bg-primary-background" />
          <Swatch className="nx:bg-secondary-background" />
          <Swatch className="nx:bg-muted" />
          <Swatch className="nx:bg-foreground" />
        </span>
      </div>
    </div>
  );
}

function ChipRow({
  label,
  values,
  active,
  onPick,
}: {
  label: string;
  values: readonly string[];
  active: string;
  onPick: (value: string) => void;
}) {
  return (
    <div className="nx:grid nx:grid-cols-[3.5rem_1fr] nx:items-center nx:gap-3">
      <span className="nx:typography-label-default nx:text-muted-foreground">
        {label}
      </span>
      <div className="nx:flex nx:flex-wrap nx:gap-1.5">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onPick(v)}
            aria-pressed={v === active}
            data-active={v === active}
            className="nx:capitalize nx:rounded-md nx:border nx:px-2.5 nx:py-1 nx:typography-label-small nx:transition-colors nx:border-border-default nx:text-muted-foreground nx:hover:bg-background-hover nx:data-[active=true]:border-border-primary nx:data-[active=true]:bg-primary-subtle nx:data-[active=true]:text-primary-subtle-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)"
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function Swatch({ className }: { className: string }) {
  return (
    <span
      className={`nx:size-6 nx:rounded-md nx:border nx:border-border-default ${className}`}
    />
  );
}
