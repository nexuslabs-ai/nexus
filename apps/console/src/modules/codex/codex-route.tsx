import { useEffect } from 'react';

import type { CodexThemeContract, ThemeSeeds } from '@nexus/core';
import {
  Button,
  Card,
  CardContent,
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

import { useThemeContext } from '../../app/theme-provider';
import { PageHeader } from '../../components/page-header';
import {
  DEFAULT_CODEX_CONTRACT,
  sanitizeContract,
} from '../../lib/codex-contract';
import {
  type CodexPrefs,
  DEFAULT_CODEX_PREFS,
  sanitizePrefs,
} from '../../lib/codex-prefs';
import {
  activePresetName,
  CODEX_PRESETS,
  CUSTOM_PRESET,
} from '../../lib/codex-presets';

import { ColorField } from './color-field';
import { SettingRow } from './setting-row';
import { ThemeConfigDiff } from './theme-config-diff';

/** Which seed block the editor edits, given the appearance. */
function editedBlock(
  appearance: CodexThemeContract['appearance']
): 'light' | 'dark' {
  return appearance === 'light' ? 'light' : 'dark';
}

export function CodexRoute() {
  const { codexContract, setCodexContract, codexPrefs, setCodexPrefs } =
    useThemeContext();

  // Entering the editor activates the derived theme so edits are visible.
  useEffect(() => {
    if (!codexContract) setCodexContract(DEFAULT_CODEX_CONTRACT);
  }, [codexContract, setCodexContract]);

  const contract = codexContract ?? DEFAULT_CODEX_CONTRACT;
  const block = editedBlock(contract.appearance);
  const seeds = contract[block];

  const setAppearance = (value: string) => {
    if (value === 'light' || value === 'dark' || value === 'system') {
      setCodexContract({ ...contract, appearance: value });
    }
  };

  const setSeed = (field: keyof ThemeSeeds, hex: string) => {
    const nextSeeds = { ...seeds, [field]: hex };
    setCodexContract(
      block === 'dark'
        ? { ...contract, dark: nextSeeds }
        : { ...contract, light: nextSeeds }
    );
  };

  const setContrast = (values: number[]) => {
    setCodexContract({ ...contract, contrast: values[0] ?? contract.contrast });
  };

  const updatePrefs = (patch: Partial<CodexPrefs>) =>
    setCodexPrefs((p) => ({ ...p, ...patch }));

  // A cleared input reports valueAsNumber NaN, a typed "0" reports 0 — neither is
  // a usable size, so coerce both to the field default. Positive values pass
  // through; the [8,32] range is clamped on emit (prefsToCss) and load.
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
      JSON.stringify({ ...contract, prefs: codexPrefs }, null, 2)
    );
  };

  const handleImport = () => {
    const text = window.prompt('Paste a theme JSON');
    if (!text) return;
    try {
      const parsed: unknown = JSON.parse(text);
      setCodexContract(sanitizeContract(parsed));
      const prefsField = (parsed as { prefs?: unknown }).prefs;
      if (prefsField) setCodexPrefs(sanitizePrefs(prefsField));
    } catch {
      window.alert('That was not valid theme JSON.');
    }
  };

  const applyPreset = (name: string) => {
    const preset = CODEX_PRESETS.find((p) => p.name === name);
    if (preset) setCodexContract(preset.contract);
  };

  return (
    <div className="nx:mx-auto nx:max-w-2xl nx:space-y-6 nx:p-6">
      <PageHeader
        title="Appearance"
        description="Edit a few values; the whole console re-themes in real time."
      >
        <Select value={activePresetName(contract)} onValueChange={applyPreset}>
          <SelectTrigger className="nx:w-36" aria-label="Theme preset">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CODEX_PRESETS.map((p) => (
              <SelectItem key={p.name} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_PRESET} disabled>
              {CUSTOM_PRESET}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={handleImport}>
          Import
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          Copy theme
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="nx:space-y-4">
          <SettingRow
            label="Mode"
            description="Use light, dark, or match your system"
          >
            <ToggleGroup
              type="single"
              value={contract.appearance}
              onValueChange={setAppearance}
              variant="outline"
            >
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="system">System</ToggleGroupItem>
            </ToggleGroup>
          </SettingRow>
          <ThemeConfigDiff
            contract={contract}
            markers={codexPrefs.diffMarkers}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {block === 'dark' ? 'Dark theme' : 'Light theme'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SettingRow label="Accent">
            <ColorField
              label="Accent"
              value={seeds.accent}
              onChange={(hex) => setSeed('accent', hex)}
            />
          </SettingRow>
          <SettingRow label="Background">
            <ColorField
              label="Background"
              value={seeds.background}
              onChange={(hex) => setSeed('background', hex)}
            />
          </SettingRow>
          <SettingRow label="Foreground">
            <ColorField
              label="Foreground"
              value={seeds.foreground}
              onChange={(hex) => setSeed('foreground', hex)}
            />
          </SettingRow>
          <SettingRow label="Contrast" description={`${contract.contrast}`}>
            <Slider
              value={[contract.contrast]}
              onValueChange={setContrast}
              min={0}
              max={100}
              step={1}
              aria-label="Contrast"
              className="nx:w-48"
            />
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingRow label="UI font" description="Font stack for the Codex UI">
            <Input
              value={codexPrefs.uiFont}
              onChange={(e) => updatePrefs({ uiFont: e.target.value })}
              aria-label="UI font"
              className="nx:w-56 nx:font-mono nx:typography-body-small"
            />
          </SettingRow>
          <SettingRow
            label="Code font"
            description="Font stack for code & diffs"
          >
            <Input
              value={codexPrefs.codeFont}
              onChange={(e) => updatePrefs({ codeFont: e.target.value })}
              aria-label="Code font"
              className="nx:w-56 nx:font-mono nx:typography-body-small"
            />
          </SettingRow>
          <SettingRow
            label="UI font size"
            description="Base size for the Codex UI"
          >
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
          </SettingRow>
          <SettingRow
            label="Code font size"
            description="Base size for code & diffs"
          >
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
          </SettingRow>
          <SettingRow label="Translucent sidebar">
            <Switch
              checked={codexPrefs.translucentSidebar}
              onCheckedChange={(v) => updatePrefs({ translucentSidebar: v })}
            />
          </SettingRow>
          <SettingRow
            label="Use pointer cursors"
            description="Pointer cursor on interactive elements"
          >
            <Switch
              checked={codexPrefs.pointerCursors}
              onCheckedChange={(v) => updatePrefs({ pointerCursors: v })}
            />
          </SettingRow>
          <SettingRow label="Reduce motion">
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
          </SettingRow>
          <SettingRow label="Diff markers">
            <ToggleGroup
              type="single"
              value={codexPrefs.diffMarkers}
              onValueChange={setDiffMarkers}
              variant="outline"
            >
              <ToggleGroupItem value="color">Color</ToggleGroupItem>
              <ToggleGroupItem value="symbols">+ / -</ToggleGroupItem>
            </ToggleGroup>
          </SettingRow>
          <SettingRow
            label="Font smoothing"
            description="Native macOS anti-aliasing"
          >
            <Switch
              checked={codexPrefs.fontSmoothing}
              onCheckedChange={(v) => updatePrefs({ fontSmoothing: v })}
            />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}
