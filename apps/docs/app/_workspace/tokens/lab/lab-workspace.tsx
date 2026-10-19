'use client';

import { useState } from 'react';

import type { Mode, TokenMap } from '@nexus_ds/core';
import { Button } from '@nexus_ds/react';
import { useNexusAppearance } from '@nexus_ds/react/appearance';

import { AppearanceControls } from '../../appearance-controls';
import { useAppearanceHistory } from '../../appearance-state';
import { PageHeading } from '../../page-heading';
import { PlaygroundViewNav } from '../../playground-view-nav';
import { WorkspaceLayout } from '../../workspace-layout';
import { useLiveTheme } from '../use-live-theme';

import type { LabData } from './lab-data';
import { LabPreview } from './lab-preview';
import { ScaleLedger } from './scale-ledger';
import { TokenLedger } from './token-ledger';

/** Colour overrides per mode; `shared` holds non-colour overrides for both. */
type Overrides = Record<Mode | 'shared', TokenMap>;

const NO_OVERRIDES: Overrides = { light: {}, dark: {}, shared: {} };

/** A consumer's hand-written theme: unlayered `:root` declarations. */
function overrideCss(overrides: Overrides): string {
  const block = (selector: string, tokens: TokenMap) => {
    const body = Object.entries(tokens)
      .map(([name, value]) => `${name}: ${value};`)
      .join(' ');
    return body ? `${selector} { ${body} }` : '';
  };
  return [
    block(':root:not(.dark)', overrides.light),
    block(':root.dark', overrides.dark),
    block(':root', overrides.shared),
  ].join('\n');
}

export function LabWorkspace({ primitives, scales }: LabData) {
  const { state, change, startStep } = useAppearanceHistory();
  const { resolvedMode } = useNexusAppearance();
  const [overrides, setOverrides] = useState<Overrides>(NO_OVERRIDES);
  const live = useLiveTheme(overrides);

  function setOverride(
    scope: keyof Overrides,
    token: string,
    value: string | null
  ) {
    setOverrides((current) => {
      const tokens = { ...current[scope] };
      if (value === null) delete tokens[token];
      else tokens[token] = value;
      return { ...current, [scope]: tokens };
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
      <PlaygroundViewNav />
      <header className="nx:space-y-2 nx:mb-8">
        <PageHeading>Tokens</PageHeading>
        <p className="nx:max-w-2xl nx:text-muted-foreground">
          Every token for this appearance and where its value comes from.
          Colours show whether they pass their contrast checks. Override a token
          to see what a hand-written theme does to the components.
        </p>
      </header>
      <div className="nx:grid nx:items-start nx:gap-8 nx:xl:grid-cols-2">
        <div className="nx:min-w-0 nx:space-y-8 nx:xl:border-r-default nx:xl:border-border-default nx:xl:pr-8">
          <TokenLedger
            live={live}
            primitives={primitives}
            overrides={overrides[resolvedMode]}
            onOverride={(token, value) =>
              setOverride(resolvedMode, token, value)
            }
          />
          <ScaleLedger
            tokens={scales}
            appearance={state}
            overrides={overrides.shared}
            onOverride={(token, value) => setOverride('shared', token, value)}
          />
        </div>
        <div className="nx:min-w-0 nx:rounded-lg nx:border-default nx:border-border-default nx:bg-muted nx:p-4 nx:lg:p-6 nx:xl:sticky nx:xl:top-0 nx:xl:max-h-[calc(100svh-var(--docs-header-h)-var(--nx-spacing-12))] nx:xl:overflow-y-auto">
          <LabPreview />
        </div>
      </div>
      <style>{overrideCss(overrides)}</style>
    </WorkspaceLayout>
  );
}
