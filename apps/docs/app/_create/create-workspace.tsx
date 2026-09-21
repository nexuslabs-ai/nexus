'use client';
import { useEffect, useMemo, useState } from 'react';

import type { NexusAppearanceState } from '@nexus_ds/core';
import {
  Button,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@nexus_ds/react';
import { useNexusAppearance } from '@nexus_ds/react/appearance';
import dynamic from 'next/dynamic';

import { DOCS_APPEARANCE_DEFAULT_STATE } from '../_lib/appearance-controls';

import { AppearanceControls } from './appearance-controls';
import {
  createPreviewResult,
  updatePreviewResult,
} from './preview/accepted-result';
import { PreviewFrame } from './preview/preview-frame';
import { ThemeExport } from './theme-export';
import { useCreateLocation } from './use-create-location';
const Explorer = dynamic(
  () => import('./tokens/explore-route').then((module) => module.ExploreRoute),
  { loading: () => <p role="status">Loading token catalog…</p> }
);

const TokenFilters = dynamic(
  () => import('./tokens/explore-route').then((module) => module.TokenFilters),
  { loading: () => <p role="status">Loading filters…</p> }
);

export function CreateWorkspace({
  view = 'examples',
}: {
  view?: 'examples' | 'tokens';
}) {
  const { state, setState, resolvedMode, mounted } = useNexusAppearance();
  const accepted = useMemo(
    () => createPreviewResult(state, 1, undefined, resolvedMode === 'dark'),
    [state, resolvedMode]
  );
  const [timeline, setTimeline] = useState<{
    current: NexusAppearanceState;
    past: NexusAppearanceState[];
    ready: boolean;
  }>({ current: state, past: [], ready: false });
  if (
    mounted &&
    (!timeline.ready ||
      JSON.stringify(timeline.current) !== JSON.stringify(state))
  ) {
    setTimeline({
      current: state,
      past: timeline.ready
        ? [...timeline.past, timeline.current].slice(-100)
        : [],
      ready: true,
    });
  }
  const history = timeline.past;
  const [error, setError] = useState('');
  const [reset, setReset] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const { component } = useCreateLocation();
  useEffect(() => {
    const media = matchMedia('(max-width: 63.99rem)');
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  function change(patch: Partial<NexusAppearanceState>) {
    try {
      const next = updatePreviewResult(accepted, patch);
      if (JSON.stringify(next.state) === JSON.stringify(accepted.state)) return;
      setState(next.state);
      setError('');
    } catch {
      setError(
        'This appearance could not be calculated. Your last valid theme is still shown.'
      );
    }
  }
  function undo() {
    const previous = history[history.length - 1];
    if (!previous) return;
    try {
      setTimeline({
        current: previous,
        past: history.slice(0, -1),
        ready: true,
      });
      setState(previous);
      setError('');
    } catch {
      setError('Unable to restore the previous appearance.');
    }
  }
  function resetAll() {
    change(DOCS_APPEARANCE_DEFAULT_STATE);
    setReset((value) => value + 1);
  }
  const deliveryKey = `${JSON.stringify(state)}:${resolvedMode}:${view}:${component}:${reset}`;
  const [delivery, setDelivery] = useState({ key: deliveryKey, revision: 1 });
  if (delivery.key !== deliveryKey)
    setDelivery({ key: deliveryKey, revision: delivery.revision + 1 });
  const result = {
    ...accepted.render,
    revision: delivery.revision,
    state: accepted.state,
    scene: {
      view: 'examples' as const,
      component,
      reset,
    },
  };
  const controls =
    view === 'tokens' ? (
      <TokenFilters />
    ) : (
      <div className="nx:space-y-6">
        <AppearanceControls state={accepted.state} onChange={change} />
        <div className="nx:flex nx:flex-col nx:gap-2 nx:border-t-default nx:border-border-default nx:pt-4">
          <div className="nx:grid nx:grid-cols-2 nx:gap-2">
            <Button variant="ghost" onClick={undo} disabled={!history.length}>
              Undo
            </Button>
            <Button variant="ghost" onClick={resetAll}>
              Reset
            </Button>
          </div>
          <ThemeExport accepted={accepted} />
        </div>
        {error && (
          <p
            role="alert"
            className="nx:typography-body-small nx:text-error-subtle-foreground"
          >
            {error}
          </p>
        )}
      </div>
    );
  return (
    <div
      data-slot="create-workspace"
      className="nx:flex nx:flex-col nx:lg:flex-row nx:h-[calc(100svh-var(--docs-header-h))] nx:min-h-0 nx:overflow-hidden"
    >
      {!narrow && (
        <aside
          aria-label={
            view === 'tokens' ? 'Token filters' : 'Playground controls'
          }
          className="nx:hidden nx:lg:flex nx:flex-col nx:w-64 nx:shrink-0 nx:min-h-0 nx:border-r-default nx:border-border-default"
        >
          <div className="nx:min-h-0 nx:flex-1 nx:overflow-y-auto nx:p-4">
            {controls}
          </div>
        </aside>
      )}
      <div className="nx:lg:hidden nx:shrink-0 nx:border-b-default nx:border-border-default nx:p-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              {view === 'tokens' ? 'Filters' : 'Appearance'}
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>
                {view === 'tokens' ? 'Token filters' : 'Appearance'}
              </SheetTitle>
              <SheetDescription>
                {view === 'tokens'
                  ? 'Find tokens by group, value type, and mode.'
                  : 'Style the docs and examples.'}
              </SheetDescription>
            </SheetHeader>
            <SheetBody>{controls}</SheetBody>
          </SheetContent>
        </Sheet>
      </div>
      <section
        aria-label="Playground canvas"
        className={
          view === 'tokens'
            ? 'nx:min-w-0 nx:min-h-0 nx:flex-1 nx:overflow-auto nx:p-3 nx:lg:p-4'
            : 'nx:min-w-0 nx:min-h-0 nx:flex-1 nx:overflow-auto'
        }
      >
        {view === 'tokens' ? (
          <Explorer accepted={accepted} />
        ) : (
          <PreviewFrame result={result} onAppearanceChange={change} />
        )}
      </section>
    </div>
  );
}
