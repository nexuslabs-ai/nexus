'use client';

import { useState } from 'react';

import type { Mode, TokenMap } from '@nexus_ds/core';
import { Button } from '@nexus_ds/react';
import { useNexusAppearance } from '@nexus_ds/react/appearance';

import { AppearanceControls } from '../../appearance-controls';
import { useAppearanceHistory } from '../../appearance-state';
import { PageHeading } from '../../page-heading';
import { WorkspaceLayout } from '../../workspace-layout';
import { TokenViewNav } from '../token-view-nav';
import { useLiveTheme } from '../use-live-theme';

import { LabPreview } from './lab-preview';
import type { PrimitiveColor } from './primitive-colors';
import { TokenLedger } from './token-ledger';

type Overrides = Record<Mode, TokenMap>;

const NO_OVERRIDES: Overrides = { light: {}, dark: {} };

/** A consumer's hand-written theme: plain `:root` declarations, per mode. */
function overrideCss(overrides: Overrides): string {
  const block = (selector: string, tokens: TokenMap) => {
    const body = Object.entries(tokens)
      .map(([name, value]) => `${name}: ${value};`)
      .join(' ');
    return body ? `${selector} { ${body} }` : '';
  };
  return [
    block('html:root:not(.dark)', overrides.light),
    block('html:root.dark', overrides.dark),
  ].join('\n');
}

export function LabWorkspace({ primitives }: { primitives: PrimitiveColor[] }) {
  const { state, change, startStep } = useAppearanceHistory();
  const { resolvedMode } = useNexusAppearance();
  const [overrides, setOverrides] = useState<Overrides>(NO_OVERRIDES);
  const live = useLiveTheme(overrides);

  function setOverride(token: string, value: string | null) {
    setOverrides((current) => {
      const tokens = { ...current[resolvedMode] };
      if (value === null) delete tokens[token];
      else tokens[token] = value;
      return { ...current, [resolvedMode]: tokens };
    });
  }

  const panel = (
    <div className="nx:space-y-8">
      <AppearanceControls
        state={state}
        resolvedMode={resolvedMode}
        onChange={change}
        onGestureStart={startStep}
      />
      <div className="nx:pt-4 nx:border-t-default nx:border-border-default">
        <Button
          variant="outline"
          className="nx:w-full"
          onClick={() => setOverrides(NO_OVERRIDES)}
        >
          Clear overrides
        </Button>
      </div>
    </div>
  );

  return (
    <WorkspaceLayout
      panelTitle="Appearance"
      panelDescription="Change the appearance the engine derives the theme from."
      aside={panel}
      sheetTrigger={<Button variant="outline">Appearance</Button>}
    >
      <TokenViewNav />
      <header className="nx:space-y-2 nx:mb-8">
        <PageHeading>Theme lab</PageHeading>
        <p className="nx:max-w-2xl nx:text-muted-foreground">
          Every semantic colour the engine derives for this appearance, where
          its value comes from, and whether it passes its contrast checks.
          Override a token to see what a hand-written theme does to the
          components.
        </p>
      </header>
      <div className="nx:grid nx:items-start nx:gap-8 nx:xl:grid-cols-2">
        <TokenLedger
          live={live}
          primitives={primitives}
          overrides={overrides[resolvedMode]}
          onOverride={setOverride}
        />
        <LabPreview />
      </div>
      <style>{overrideCss(overrides)}</style>
    </WorkspaceLayout>
  );
}
