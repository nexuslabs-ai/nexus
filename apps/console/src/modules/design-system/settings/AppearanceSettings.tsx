import type { CodexThemeContract } from '@nexus/core';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
} from '@nexus/react';

import { useThemeContext } from '../../../app/theme-provider';
import type {
  Base,
  RadiusMode,
  SpacingMode,
  ThemeConfig,
  TokenMode,
} from '../../../hooks/useTheme';
import {
  applyBaseTone,
  applyBrandColor,
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  STROKE_OPTIONS,
} from '../../../lib/appearance-theme';
import {
  DEFAULT_SURFACE_TONE,
  sanitizeContract,
} from '../../../lib/codex-contract';
import {
  type CodexPrefs,
  DEFAULT_CODEX_PREFS,
  sanitizePrefs,
} from '../../../lib/codex-prefs';

import { AppearanceColorField } from './AppearanceColorField';
import { AppearanceConfigPreview } from './AppearanceConfigPreview';
import { AppearanceSettingRow } from './AppearanceSettingRow';

type AppearanceSettingsProps = {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
};

function editedBlock(
  appearance: CodexThemeContract['appearance']
): 'light' | 'dark' {
  return appearance === 'light' ? 'light' : 'dark';
}

function AxisSelect<TValue extends string>({
  value,
  options,
  onValueChange,
  ariaLabel,
}: {
  value: TValue;
  options: readonly { value: TValue; label: string }[];
  onValueChange: (value: TValue) => void;
  ariaLabel: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as TValue)}>
      <SelectTrigger className="nx:w-44" aria-label={ariaLabel}>
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
  );
}

export function AppearanceSettings({
  theme,
  setTheme,
}: AppearanceSettingsProps) {
  const { codexContract, setCodexContract, codexPrefs, setCodexPrefs } =
    useThemeContext();
  const block = editedBlock(codexContract.appearance);
  const seeds = codexContract[block];
  const selectedBase: Base = codexContract.surfaceTone ?? DEFAULT_SURFACE_TONE;

  const setAppearance = (value: string) => {
    if (value === 'light' || value === 'dark' || value === 'system') {
      setCodexContract((contract) => ({ ...contract, appearance: value }));
      if (value !== 'system') {
        setTheme((t) => ({ ...t, dark: value === 'dark' }));
      }
    }
  };

  const setBaseTone = (base: Base) => {
    setCodexContract((contract) => applyBaseTone(contract, base));
  };

  const setBrandColor = (hex: string) => {
    setCodexContract((contract) => applyBrandColor(contract, hex));
  };

  const setContrast = (values: number[]) => {
    setCodexContract((contract) => ({
      ...contract,
      contrast: values[0] ?? contract.contrast,
    }));
  };

  const setDensity = (spacing: SpacingMode) => {
    setTheme((t) => ({ ...t, spacing }));
  };

  const setCorners = (radius: RadiusMode) => {
    setTheme((t) => ({ ...t, radius }));
  };

  const setElevation = (shadow: TokenMode) => {
    setTheme((t) => ({ ...t, shadow }));
  };

  const setStroke = (borderWidth: TokenMode) => {
    setTheme((t) => ({ ...t, borderWidth }));
  };

  const updatePrefs = (patch: Partial<CodexPrefs>) =>
    setCodexPrefs((p) => ({ ...p, ...patch }));

  const setFontSize = (key: 'uiFontSize' | 'codeFontSize', n: number) =>
    updatePrefs({ [key]: n > 0 ? n : DEFAULT_CODEX_PREFS[key] });

  const setReduceMotion = (value: string) => {
    if (value === 'system' || value === 'on' || value === 'off') {
      updatePrefs({ reduceMotion: value });
    }
  };

  const setDiffMarkers = (value: string) => {
    if (value === 'color' || value === 'symbols') {
      updatePrefs({ diffMarkers: value });
    }
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(
      JSON.stringify({ ...codexContract, prefs: codexPrefs }, null, 2)
    );
  };

  const handleImport = () => {
    const text = window.prompt('Paste a theme JSON');
    if (!text) return;
    try {
      const parsed: unknown = JSON.parse(text);
      const nextContract = sanitizeContract(parsed);
      setCodexContract(nextContract);
      const prefsField = (parsed as { prefs?: unknown }).prefs;
      if (prefsField) setCodexPrefs(sanitizePrefs(prefsField));
    } catch {
      window.alert('That was not valid theme JSON.');
    }
  };

  return (
    <div className="nx:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Brand color, neutral tone, and contrast apply live across the whole
            console.
          </CardDescription>
        </CardHeader>
        <CardContent className="nx:space-y-4">
          <AppearanceSettingRow
            label="Mode"
            description="Use light, dark, or match your system"
          >
            <ToggleGroup
              type="single"
              value={codexContract.appearance}
              onValueChange={setAppearance}
              variant="outline"
            >
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="system">System</ToggleGroupItem>
            </ToggleGroup>
          </AppearanceSettingRow>
          <AppearanceSettingRow
            label="Brand color"
            description="Primary actions, selected states, and highlights"
          >
            <AppearanceColorField
              label="Brand color"
              value={seeds.accent}
              onChange={setBrandColor}
            />
          </AppearanceSettingRow>
          <AppearanceSettingRow
            label="Base tone"
            description="Neutral surfaces, borders, and muted UI"
          >
            <AxisSelect
              value={selectedBase}
              options={BASE_TONE_OPTIONS}
              onValueChange={setBaseTone}
              ariaLabel="Base tone"
            />
          </AppearanceSettingRow>
          <AppearanceSettingRow
            label="Contrast"
            description={`${codexContract.contrast}`}
          >
            <Slider
              value={[codexContract.contrast]}
              onValueChange={setContrast}
              min={0}
              max={100}
              step={1}
              aria-label="Contrast"
              className="nx:w-48"
            />
          </AppearanceSettingRow>
          <AppearanceConfigPreview
            contract={codexContract}
            base={selectedBase}
            markers={codexPrefs.diffMarkers}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>UI and code font preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceSettingRow label="UI font">
            <Input
              value={codexPrefs.uiFont}
              onChange={(e) => updatePrefs({ uiFont: e.target.value })}
              aria-label="UI font"
              className="nx:w-56 nx:font-mono nx:typography-body-small"
            />
          </AppearanceSettingRow>
          <AppearanceSettingRow label="Code font">
            <Input
              value={codexPrefs.codeFont}
              onChange={(e) => updatePrefs({ codeFont: e.target.value })}
              aria-label="Code font"
              className="nx:w-56 nx:font-mono nx:typography-body-small"
            />
          </AppearanceSettingRow>
          <AppearanceSettingRow label="UI font size">
            <Input
              type="number"
              min={8}
              max={32}
              value={codexPrefs.uiFontSize}
              onChange={(e) =>
                setFontSize('uiFontSize', e.target.valueAsNumber)
              }
              aria-label="UI font size"
              className="nx:w-20"
            />
          </AppearanceSettingRow>
          <AppearanceSettingRow label="Code font size">
            <Input
              type="number"
              min={8}
              max={32}
              value={codexPrefs.codeFontSize}
              onChange={(e) =>
                setFontSize('codeFontSize', e.target.valueAsNumber)
              }
              aria-label="Code font size"
              className="nx:w-20"
            />
          </AppearanceSettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout Feel</CardTitle>
          <CardDescription>
            Density, corners, elevation, and stroke use curated token modes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceSettingRow label="Density">
            <AxisSelect
              value={theme.spacing}
              options={DENSITY_OPTIONS}
              onValueChange={setDensity}
              ariaLabel="Density"
            />
          </AppearanceSettingRow>
          <AppearanceSettingRow label="Corners">
            <AxisSelect
              value={theme.radius}
              options={CORNER_OPTIONS}
              onValueChange={setCorners}
              ariaLabel="Corners"
            />
          </AppearanceSettingRow>
          <AppearanceSettingRow label="Elevation">
            <AxisSelect
              value={theme.shadow}
              options={ELEVATION_OPTIONS}
              onValueChange={setElevation}
              ariaLabel="Elevation"
            />
          </AppearanceSettingRow>
          <AppearanceSettingRow label="Stroke">
            <AxisSelect
              value={theme.borderWidth}
              options={STROKE_OPTIONS}
              onValueChange={setStroke}
              ariaLabel="Stroke"
            />
          </AppearanceSettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Interaction, motion, and rendering preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceSettingRow label="Translucent sidebar">
            <Switch
              checked={codexPrefs.translucentSidebar}
              onCheckedChange={(v) => updatePrefs({ translucentSidebar: v })}
            />
          </AppearanceSettingRow>
          <AppearanceSettingRow
            label="Use pointer cursors"
            description="Pointer cursor on interactive elements"
          >
            <Switch
              checked={codexPrefs.pointerCursors}
              onCheckedChange={(v) => updatePrefs({ pointerCursors: v })}
            />
          </AppearanceSettingRow>
          <AppearanceSettingRow label="Reduce motion">
            <ToggleGroup
              type="single"
              value={codexPrefs.reduceMotion}
              onValueChange={setReduceMotion}
              variant="outline"
            >
              <ToggleGroupItem value="system">System</ToggleGroupItem>
              <ToggleGroupItem value="on">On</ToggleGroupItem>
              <ToggleGroupItem value="off">Off</ToggleGroupItem>
            </ToggleGroup>
          </AppearanceSettingRow>
          <AppearanceSettingRow label="Diff markers">
            <ToggleGroup
              type="single"
              value={codexPrefs.diffMarkers}
              onValueChange={setDiffMarkers}
              variant="outline"
            >
              <ToggleGroupItem value="color">Color</ToggleGroupItem>
              <ToggleGroupItem value="symbols">+ / -</ToggleGroupItem>
            </ToggleGroup>
          </AppearanceSettingRow>
          <AppearanceSettingRow
            label="Font smoothing"
            description="Native macOS anti-aliasing"
          >
            <Switch
              checked={codexPrefs.fontSmoothing}
              onCheckedChange={(v) => updatePrefs({ fontSmoothing: v })}
            />
          </AppearanceSettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme File</CardTitle>
          <CardDescription>
            Import or copy the active theme JSON.
          </CardDescription>
        </CardHeader>
        <CardContent className="nx:flex nx:flex-wrap nx:gap-2">
          <Button variant="ghost" size="sm" onClick={handleImport}>
            Import
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            Copy theme
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
