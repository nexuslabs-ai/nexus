'use client';

import * as React from 'react';

import type { NexusAppearanceState } from '@nexus_ds/core';
import {
  NexusAppearanceProvider,
  useNexusAppearance,
} from '@nexus_ds/react/appearance';

interface AppearanceFixtureClientProps {
  defaultState: NexusAppearanceState;
  children?: React.ReactNode;
}

function AppearanceFixtureControls() {
  const { mounted, resolvedMode, setState, state } = useNexusAppearance();

  return (
    <div className="nx:border-border-default nx:bg-container nx:text-container-foreground nx:shadow-md nx:rounded-xl nx:border nx:p-5">
      <div className="nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-3">
        <div>
          <p className="nx:typography-label-default">Client provider</p>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            {mounted ? 'mounted' : 'server default'} · {resolvedMode}
          </p>
        </div>
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <button
            type="button"
            className="nx:border-border-default nx:bg-background nx:hover:bg-background-hover nx:focus-visible:outline-focus-default nx:rounded-md nx:border nx:px-3 nx:py-1.5 nx:typography-label-default nx:focus-visible:outline-2 nx:focus-visible:outline-offset-2"
            onClick={() =>
              setState((current) => ({
                ...current,
                mode: current.mode === 'dark' ? 'light' : 'dark',
              }))
            }
          >
            Toggle mode
          </button>
          <button
            type="button"
            className="nx:border-border-default nx:bg-background nx:hover:bg-background-hover nx:focus-visible:outline-focus-default nx:rounded-md nx:border nx:px-3 nx:py-1.5 nx:typography-label-default nx:focus-visible:outline-2 nx:focus-visible:outline-offset-2"
            onClick={() =>
              setState((current) => ({
                ...current,
                surfaceTone:
                  current.surfaceTone === 'slate' ? 'stone' : 'slate',
              }))
            }
          >
            Toggle tone
          </button>
        </div>
      </div>
      <dl className="nx:mt-4 nx:grid nx:grid-cols-2 nx:gap-3 nx:typography-body-small nx:sm:grid-cols-4">
        <div>
          <dt className="nx:text-muted-foreground">Mode</dt>
          <dd>{state.mode}</dd>
        </div>
        <div>
          <dt className="nx:text-muted-foreground">Surface</dt>
          <dd>{state.surfaceTone}</dd>
        </div>
        <div>
          <dt className="nx:text-muted-foreground">Density</dt>
          <dd>{state.density}</dd>
        </div>
        <div>
          <dt className="nx:text-muted-foreground">Stroke</dt>
          <dd>{state.stroke}</dd>
        </div>
      </dl>
    </div>
  );
}

export function AppearanceFixtureClient({
  defaultState,
  children,
}: AppearanceFixtureClientProps) {
  return (
    <NexusAppearanceProvider defaultState={defaultState} storageKey={false}>
      <div data-nexus-appearance-provider-fixture="">
        <AppearanceFixtureControls />
        {children}
      </div>
    </NexusAppearanceProvider>
  );
}
