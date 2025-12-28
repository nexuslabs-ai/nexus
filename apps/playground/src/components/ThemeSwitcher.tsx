import type { ThemeConfig } from '../hooks/useTheme';

// Color themes
const BASES = ['slate', 'neutral', 'zinc', 'gray', 'stone'] as const;
const BRANDS = ['blue', 'gray', 'neutral', 'slate'] as const;

// Design token modes
const SIZE_MODES = ['vega', 'lyra', 'maia', 'mira', 'nova'] as const;
const TYPOGRAPHY_MODES = ['vega', 'lyra', 'maia', 'mira', 'nova'] as const;
const SHADOW_MODES = ['vega', 'lyra', 'maia', 'mira', 'nova'] as const;
const RADIUS_MODES = ['blunt', 'sharp', 'subtle', 'smooth', 'mellow'] as const;
const BORDERWIDTH_MODES = ['vega', 'lyra', 'maia', 'mira', 'nova'] as const;

type ThemeSwitcherProps = {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
};

function SelectControl({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="nx:flex nx:items-center nx:gap-2">
      <label htmlFor={id} className="nx:text-sm nx:font-medium">
        {label}:
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="nx:border-border-default nx:bg-background nx:rounded nx:border nx:px-2 nx:py-1 nx:text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ThemeSwitcher({ theme, setTheme }: ThemeSwitcherProps) {
  return (
    <div className="nx:border-border-default nx:bg-muted nx:border-b nx:p-4">
      {/* Color Themes Row */}
      <div className="nx:mb-3 nx:flex nx:flex-wrap nx:items-center nx:gap-4">
        <span className="nx:text-muted-foreground nx:text-xs nx:font-semibold nx:uppercase">
          Colors
        </span>
        <SelectControl
          id="base-select"
          label="Base"
          value={theme.base}
          options={BASES}
          onChange={(v) => setTheme((t) => ({ ...t, base: v }))}
        />
        <SelectControl
          id="brand-select"
          label="Brand"
          value={theme.brand}
          options={BRANDS}
          onChange={(v) => setTheme((t) => ({ ...t, brand: v }))}
        />
        <button
          onClick={() => setTheme((t) => ({ ...t, dark: !t.dark }))}
          className="nx:border-border-default nx:bg-background hover:nx:bg-accent nx:rounded nx:border nx:px-3 nx:py-1 nx:text-sm"
        >
          {theme.dark ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* Design Tokens Row */}
      <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
        <span className="nx:text-muted-foreground nx:text-xs nx:font-semibold nx:uppercase">
          Tokens
        </span>
        <SelectControl
          id="size-select"
          label="Size"
          value={theme.size}
          options={SIZE_MODES}
          onChange={(v) => setTheme((t) => ({ ...t, size: v }))}
        />
        <SelectControl
          id="typography-select"
          label="Type"
          value={theme.typography}
          options={TYPOGRAPHY_MODES}
          onChange={(v) => setTheme((t) => ({ ...t, typography: v }))}
        />
        <SelectControl
          id="shadow-select"
          label="Shadow"
          value={theme.shadow}
          options={SHADOW_MODES}
          onChange={(v) => setTheme((t) => ({ ...t, shadow: v }))}
        />
        <SelectControl
          id="radius-select"
          label="Radius"
          value={theme.radius}
          options={RADIUS_MODES}
          onChange={(v) => setTheme((t) => ({ ...t, radius: v }))}
        />
        <SelectControl
          id="borderwidth-select"
          label="Border"
          value={theme.borderWidth}
          options={BORDERWIDTH_MODES}
          onChange={(v) => setTheme((t) => ({ ...t, borderWidth: v }))}
        />
      </div>
    </div>
  );
}
