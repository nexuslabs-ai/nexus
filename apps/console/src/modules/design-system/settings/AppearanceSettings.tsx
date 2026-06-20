import { useId } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
} from '@nexus/react';

import { type SidebarMode, useSidebarStore } from '../../../app/sidebar-store';
import {
  BASES,
  BRANDS,
  RADIUS_MODES,
  SPACING_MODES,
  type ThemeConfig,
  TOKEN_MODES,
} from '../../../hooks/useTheme';

type AppearanceSettingsProps = {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
};

const SIDEBAR_MODE_OPTIONS: { value: SidebarMode; label: string }[] = [
  { value: 'icon', label: 'Icon rail' },
  { value: 'offcanvas', label: 'Full collapse' },
];

/** Turn a list of lowercase mode keys into title-cased Select options. */
function modeOptions<T extends string>(
  modes: readonly T[]
): { value: T; label: string }[] {
  return modes.map((m) => ({
    value: m,
    label: m.charAt(0).toUpperCase() + m.slice(1),
  }));
}

/** One labelled axis dropdown, built from the shipped Nexus Select. */
function AxisSelect<T extends string>({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onValueChange: (value: T) => void;
}) {
  const id = useId();

  return (
    <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => onValueChange(v as T)}>
        <SelectTrigger id={id} className="nx:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * The dogfood theme switcher: the same 8 axes the dev sidebar controls, rebuilt
 * from shipped @nexus/react components and driving the shared `setTheme`. Every
 * change applies live, so the whole scene (and the sidebar) re-theme instantly.
 */
export function AppearanceSettings({
  theme,
  setTheme,
}: AppearanceSettingsProps) {
  const sidebarMode = useSidebarStore((s) => s.mode);
  const setSidebarMode = useSidebarStore((s) => s.setMode);

  return (
    <div className="nx:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Color identity — applies live across the whole app.
          </CardDescription>
        </CardHeader>
        <CardContent className="nx:space-y-4">
          <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
            <div className="nx:space-y-0.5">
              <Label htmlFor="appearance-dark">Dark mode</Label>
              <p className="nx:typography-body-default nx:text-muted-foreground">
                Switch between light and dark.
              </p>
            </div>
            <Switch
              id="appearance-dark"
              checked={theme.dark}
              onCheckedChange={(dark) => setTheme((t) => ({ ...t, dark }))}
            />
          </div>
          <Separator />
          <AxisSelect
            label="Base"
            value={theme.base}
            options={BASES}
            onValueChange={(base) => setTheme((t) => ({ ...t, base }))}
          />
          <AxisSelect
            label="Brand"
            value={theme.brand}
            options={BRANDS}
            onValueChange={(brand) => setTheme((t) => ({ ...t, brand }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Density</CardTitle>
          <CardDescription>Spacing rhythm.</CardDescription>
        </CardHeader>
        <CardContent className="nx:space-y-4">
          <AxisSelect
            label="Spacing"
            value={theme.spacing}
            options={modeOptions(SPACING_MODES)}
            onValueChange={(spacing) => setTheme((t) => ({ ...t, spacing }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Surfaces</CardTitle>
          <CardDescription>Elevation depth and edge treatment.</CardDescription>
        </CardHeader>
        <CardContent className="nx:space-y-4">
          <AxisSelect
            label="Shadow"
            value={theme.shadow}
            options={modeOptions(TOKEN_MODES)}
            onValueChange={(shadow) => setTheme((t) => ({ ...t, shadow }))}
          />
          <AxisSelect
            label="Radius"
            value={theme.radius}
            options={modeOptions(RADIUS_MODES)}
            onValueChange={(radius) => setTheme((t) => ({ ...t, radius }))}
          />
          <AxisSelect
            label="Border width"
            value={theme.borderWidth}
            options={modeOptions(TOKEN_MODES)}
            onValueChange={(borderWidth) =>
              setTheme((t) => ({ ...t, borderWidth }))
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sidebar</CardTitle>
          <CardDescription>
            How the navigation sidebar collapses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AxisSelect
            label="Collapse style"
            value={sidebarMode}
            options={SIDEBAR_MODE_OPTIONS}
            onValueChange={setSidebarMode}
          />
        </CardContent>
      </Card>
    </div>
  );
}
