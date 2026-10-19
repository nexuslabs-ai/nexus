'use client';

import { Button } from '@nexus_ds/react';
import { useNexusAppearance } from '@nexus_ds/react/appearance';

import { AppearanceControls } from './appearance-controls';
import { useAppearanceHistory } from './appearance-state';
import { PageHeading } from './page-heading';
import { Sampler } from './sampler';
import { ThemeExport } from './theme-export';
import { WorkspaceLayout } from './workspace-layout';

export function PlaygroundWorkspace() {
  const { state, change, startStep, reset, undo, canUndo } =
    useAppearanceHistory();
  const { resolvedMode } = useNexusAppearance();

  const panel = (
    <div className="nx:space-y-8">
      <AppearanceControls
        state={state}
        resolvedMode={resolvedMode}
        onChange={change}
        onGestureStart={startStep}
      />
      <div className="nx:flex nx:flex-col nx:gap-2 nx:pt-4 nx:border-t-default nx:border-border-default">
        <div className="nx:grid nx:grid-cols-2 nx:gap-2">
          <Button variant="outline" onClick={undo} aria-disabled={!canUndo}>
            Undo
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
        <ThemeExport />
      </div>
    </div>
  );

  return (
    <WorkspaceLayout
      panelTitle="Appearance"
      panelDescription="Style the docs and the examples."
      aside={panel}
      sheetTrigger={<Button variant="outline">Appearance</Button>}
    >
      <div className="nx:space-y-8">
        <header className="nx:space-y-2">
          <p className="nx:typography-label-small nx:text-muted-foreground">
            PLAYGROUND
          </p>
          <PageHeading>Try a theme on every component.</PageHeading>
          <p className="nx:max-w-2xl nx:text-muted-foreground">
            Change the appearance, and these examples, the docs and every
            overlay they open follow it. When you like the result, select Use
            this theme to copy it into your app.
          </p>
        </header>
        <Sampler />
      </div>
    </WorkspaceLayout>
  );
}
