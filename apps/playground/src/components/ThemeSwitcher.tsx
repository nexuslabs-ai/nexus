import type { ThemeConfig } from '../hooks/useTheme';

const BASES = ['slate', 'neutral', 'zinc', 'gray', 'stone'] as const;
const BRANDS = ['blue', 'gray', 'neutral', 'slate'] as const;

type ThemeSwitcherProps = {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
};

export function ThemeSwitcher({ theme, setTheme }: ThemeSwitcherProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border-default bg-muted p-4">
      <div className="flex items-center gap-2">
        <label htmlFor="base-select" className="text-sm font-medium">
          Base:
        </label>
        <select
          id="base-select"
          value={theme.base}
          onChange={(e) => setTheme((t) => ({ ...t, base: e.target.value }))}
          className="rounded border border-border-default bg-background px-3 py-1.5 text-sm"
        >
          {BASES.map((b) => (
            <option key={b} value={b}>
              {b.charAt(0).toUpperCase() + b.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="brand-select" className="text-sm font-medium">
          Brand:
        </label>
        <select
          id="brand-select"
          value={theme.brand}
          onChange={(e) => setTheme((t) => ({ ...t, brand: e.target.value }))}
          className="rounded border border-border-default bg-background px-3 py-1.5 text-sm"
        >
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b.charAt(0).toUpperCase() + b.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setTheme((t) => ({ ...t, dark: !t.dark }))}
        className="rounded border border-border-default bg-background px-3 py-1.5 text-sm hover:bg-accent"
      >
        {theme.dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="ml-auto text-sm text-muted-foreground">
        Theme: {theme.base} / {theme.brand} / {theme.dark ? 'dark' : 'light'}
      </div>
    </div>
  );
}
