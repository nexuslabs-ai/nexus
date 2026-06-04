import { useSidebarStore } from '../../app/sidebar-store';
import {
  BASES,
  BRANDS,
  DEFAULT_THEME,
  RADIUS_MODES,
  SPACING_MODES,
  type ThemeConfig,
  TOKEN_MODES,
  TYPOGRAPHY_MODES,
} from '../../hooks/useTheme';

import { type IconLibrary, iconLibraryMeta, useIconStore } from './iconStore';
import { PlaygroundIcon } from './PlaygroundIcon';

const ICON_LIBRARIES = ['tabler', 'lucide', 'phosphor'] as const;

type ThemeSwitcherProps = {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
};

// Reusable components
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="nx:bg-background nx:rounded-lg nx:border nx:border-border-default nx:p-3">
      <h3 className="nx:text-xs nx:font-semibold nx:uppercase nx:tracking-wide nx:text-muted-foreground nx:mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ColorSelect<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: TValue;
  options: readonly { value: TValue; label: string; color: string }[];
  onChange: (value: TValue) => void;
}) {
  const selected = options.find((o) => o.value === value);

  return (
    <div className="nx:flex nx:items-center nx:justify-between">
      <label htmlFor={id} className="nx:text-sm nx:text-foreground">
        {label}
      </label>
      <div className="nx:relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as TValue)}
          className="nx:appearance-none nx:bg-muted nx:border nx:border-border-default nx:rounded-md nx:pl-7 nx:pr-8 nx:py-1.5 nx:text-sm nx:cursor-pointer nx:hover:bg-background-hover nx:transition-colors"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Color indicator */}
        <div
          className="nx:absolute nx:left-2 nx:top-1/2 nx:-translate-y-1/2 nx:w-3 nx:h-3 nx:rounded-full nx:border nx:border-border-default"
          style={{ backgroundColor: selected?.color }}
        />
        {/* Chevron */}
        <PlaygroundIcon
          name="chevron-down"
          size={14}
          className="nx:absolute nx:right-2 nx:top-1/2 nx:-translate-y-1/2 nx:text-muted-foreground nx:pointer-events-none"
        />
      </div>
    </div>
  );
}

function TokenSelect<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: TValue;
  options: readonly TValue[];
  onChange: (value: TValue) => void;
}) {
  return (
    <div className="nx:flex nx:items-center nx:justify-between">
      <label htmlFor={id} className="nx:text-sm nx:text-foreground">
        {label}
      </label>
      <div className="nx:relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as TValue)}
          className="nx:appearance-none nx:bg-muted nx:border nx:border-border-default nx:rounded-md nx:pl-3 nx:pr-8 nx:py-1.5 nx:text-sm nx:cursor-pointer nx:hover:bg-background-hover nx:transition-colors nx:capitalize"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
        <PlaygroundIcon
          name="chevron-down"
          size={14}
          className="nx:absolute nx:right-2 nx:top-1/2 nx:-translate-y-1/2 nx:text-muted-foreground nx:pointer-events-none"
        />
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  labelLeft,
  labelRight,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelLeft: string;
  labelRight: string;
}) {
  return (
    <div className="nx:flex nx:items-center nx:justify-center nx:gap-3">
      <span
        className={`nx:text-sm ${!checked ? 'nx:text-foreground nx:font-medium' : 'nx:text-muted-foreground'}`}
      >
        {labelLeft}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`nx:relative nx:w-11 nx:h-6 nx:rounded-full nx:transition-colors nx:border nx:border-border-default ${
          checked ? 'nx:bg-primary-background' : 'nx:bg-muted'
        }`}
      >
        <span
          className={`nx:absolute nx:top-px nx:left-px nx:w-5 nx:h-5 nx:rounded-full nx:bg-background nx:shadow-sm nx:transition-transform nx:border nx:border-border-default ${
            checked ? 'nx:translate-x-5' : ''
          }`}
        />
      </button>
      <span
        className={`nx:text-sm ${checked ? 'nx:text-foreground nx:font-medium' : 'nx:text-muted-foreground'}`}
      >
        {labelRight}
      </span>
    </div>
  );
}

export function ThemeSwitcher({ theme, setTheme }: ThemeSwitcherProps) {
  const iconLibrary = useIconStore((s) => s.library);
  const setIconLibrary = useIconStore((s) => s.setLibrary);
  const sidebarMode = useSidebarStore((s) => s.mode);
  const setSidebarMode = useSidebarStore((s) => s.setMode);

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
    setIconLibrary('tabler');
    setSidebarMode('icon');
  };

  return (
    <div className="nx:h-full nx:flex nx:flex-col nx:bg-muted/50">
      {/* Header */}
      <div className="nx:p-4 nx:border-b nx:border-border-default">
        <h2 className="nx:text-base nx:font-semibold nx:text-foreground">
          Customize Theme
        </h2>
        <p className="nx:text-xs nx:text-muted-foreground nx:mt-0.5">
          Adjust colors, tokens, and icons
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="nx:flex-1 nx:overflow-y-auto nx:p-4 nx:space-y-4">
        {/* Appearance */}
        <Section title="Appearance">
          <ToggleSwitch
            checked={theme.dark}
            onChange={(dark) => setTheme((t) => ({ ...t, dark }))}
            labelLeft="Light"
            labelRight="Dark"
          />
        </Section>

        {/* Sidebar */}
        <Section title="Sidebar">
          <ToggleSwitch
            checked={sidebarMode === 'offcanvas'}
            onChange={(full) => setSidebarMode(full ? 'offcanvas' : 'icon')}
            labelLeft="Icon rail"
            labelRight="Full collapse"
          />
        </Section>

        {/* Colors */}
        <Section title="Colors">
          <div className="nx:space-y-3">
            <ColorSelect
              id="base-select"
              label="Base"
              value={theme.base}
              options={BASES}
              onChange={(v) => setTheme((t) => ({ ...t, base: v }))}
            />
            <ColorSelect
              id="brand-select"
              label="Brand"
              value={theme.brand}
              options={BRANDS}
              onChange={(v) => setTheme((t) => ({ ...t, brand: v }))}
            />
          </div>
        </Section>

        {/* Design Tokens */}
        <Section title="Design Tokens">
          <div className="nx:space-y-3">
            <TokenSelect
              id="spacing-select"
              label="Spacing"
              value={theme.spacing}
              options={SPACING_MODES}
              onChange={(v) => setTheme((t) => ({ ...t, spacing: v }))}
            />
            <TokenSelect
              id="typography-select"
              label="Typography"
              value={theme.typography}
              options={TYPOGRAPHY_MODES}
              onChange={(v) => setTheme((t) => ({ ...t, typography: v }))}
            />
            <TokenSelect
              id="shadow-select"
              label="Shadow"
              value={theme.shadow}
              options={TOKEN_MODES}
              onChange={(v) => setTheme((t) => ({ ...t, shadow: v }))}
            />
            <TokenSelect
              id="radius-select"
              label="Radius"
              value={theme.radius}
              options={RADIUS_MODES}
              onChange={(v) => setTheme((t) => ({ ...t, radius: v }))}
            />
            <TokenSelect
              id="borderwidth-select"
              label="Border Width"
              value={theme.borderWidth}
              options={TOKEN_MODES}
              onChange={(v) => setTheme((t) => ({ ...t, borderWidth: v }))}
            />
          </div>
        </Section>

        {/* Icons */}
        <Section title="Icons">
          <div className="nx:flex nx:items-center nx:justify-between">
            <label
              htmlFor="icon-library-select"
              className="nx:text-sm nx:text-foreground"
            >
              Library
            </label>
            <div className="nx:relative">
              <select
                id="icon-library-select"
                value={iconLibrary}
                onChange={(e) => setIconLibrary(e.target.value as IconLibrary)}
                className="nx:appearance-none nx:bg-muted nx:border nx:border-border-default nx:rounded-md nx:pl-3 nx:pr-8 nx:py-1.5 nx:text-sm nx:cursor-pointer nx:hover:bg-background-hover nx:transition-colors"
              >
                {ICON_LIBRARIES.map((lib) => (
                  <option key={lib} value={lib}>
                    {iconLibraryMeta[lib].label}
                  </option>
                ))}
              </select>
              <PlaygroundIcon
                name="chevron-down"
                size={14}
                className="nx:absolute nx:right-2 nx:top-1/2 nx:-translate-y-1/2 nx:text-muted-foreground nx:pointer-events-none"
              />
            </div>
          </div>
          <p className="nx:text-xs nx:text-muted-foreground nx:mt-2">
            {iconLibraryMeta[iconLibrary].iconCount} icons available
          </p>
        </Section>
      </div>

      {/* Footer */}
      <div className="nx:p-4 nx:border-t nx:border-border-default">
        <button
          onClick={handleReset}
          className="nx:w-full nx:flex nx:items-center nx:justify-center nx:gap-2 nx:bg-background nx:border nx:border-border-default nx:rounded-md nx:px-4 nx:py-2 nx:text-sm nx:font-medium nx:hover:bg-background-hover nx:transition-colors"
        >
          <PlaygroundIcon name="x" size={14} />
          Reset to Default
        </button>
      </div>
    </div>
  );
}
