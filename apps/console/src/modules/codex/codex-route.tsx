import { useEffect } from 'react';

import type { CodexThemeContract, ThemeSeeds } from '@nexus/core';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
} from '@nexus/react';

import { useThemeContext } from '../../app/theme-provider';
import { PageHeader } from '../../components/page-header';
import { DEFAULT_CODEX_CONTRACT } from '../../lib/codex-contract';

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
  const { codexContract, setCodexContract } = useThemeContext();

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

  return (
    <div className="nx:mx-auto nx:max-w-2xl nx:space-y-6 nx:p-6">
      <PageHeader
        title="Appearance"
        description="Edit a few values; the whole console re-themes in real time."
      />

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
          <ThemeConfigDiff contract={contract} />
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
    </div>
  );
}
