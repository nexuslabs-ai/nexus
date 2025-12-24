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
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}:
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border-default bg-background rounded border px-2 py-1 text-sm"
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
    <div className="border-border-default bg-muted border-b p-4">
      {/* Color Themes Row */}
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <span className="text-muted-foreground text-xs font-semibold uppercase">
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
          className="border-border-default bg-background hover:bg-accent rounded border px-3 py-1 text-sm"
        >
          {theme.dark ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* Design Tokens Row */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-muted-foreground text-xs font-semibold uppercase">
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
