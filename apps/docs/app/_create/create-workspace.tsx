'use client';
import { useCallback, useEffect, useState } from 'react';

import type { NexusAppearanceState } from '@nexus_ds/core';
import {
  Button,
  Input,
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@nexus_ds/react';
import dynamic from 'next/dynamic';

import { AppearanceControls } from './appearance-controls';
import { CREATE_STORAGE_KEY, restoreResult } from './appearance-state';
import { type ComponentId, GALLERY } from './gallery';
import {
  createPreviewResult,
  PREVIEW_DEFAULT_STATE,
  updatePreviewResult,
} from './preview/accepted-result';
import { PreviewFrame } from './preview/preview-frame';
import { ThemeExport } from './theme-export';
import { useCreateLocation } from './use-create-location';
const Inspector = dynamic(() => import('./inspector'), {
  loading: () => <p role="status">Loading inspection…</p>,
});
const Explorer = dynamic(
  () => import('./tokens/explore-route').then((module) => module.ExploreRoute),
  { loading: () => <p role="status">Loading token catalog…</p> }
);

export function CreateWorkspace() {
  const [accepted, setAccepted] = useState(() =>
    createPreviewResult(PREVIEW_DEFAULT_STATE, 1)
  );
  const [history, setHistory] = useState<NexusAppearanceState[]>([]);
  const [restored, setRestored] = useState(false);
  const [error, setError] = useState('');
  const [reset, setReset] = useState(0);
  const [query, setQuery] = useState('');
  const [inspected, setInspected] = useState<ComponentId | null>(null);
  const [narrow, setNarrow] = useState(false);
  const { view, component, navigate } = useCreateLocation();
  useEffect(() => {
    const media = matchMedia('(max-width: 63.99rem)');
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(CREATE_STORAGE_KEY);
    } catch {
      /* Storage is optional in private browsing. */
    }
    setAccepted(restoreResult(raw, 2));
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(CREATE_STORAGE_KEY, JSON.stringify(accepted.state));
    } catch {
      /* Storage is optional in private browsing. */
    }
  }, [accepted.state, restored]);
  function change(patch: Partial<NexusAppearanceState>) {
    try {
      const next = updatePreviewResult(accepted, patch);
      if (JSON.stringify(next.state) === JSON.stringify(accepted.state)) return;
      setHistory((previous) => [...previous, accepted.state].slice(-100));
      setAccepted(next);
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
      setAccepted(createPreviewResult(previous, accepted.render.revision + 1));
      setHistory(history.slice(0, -1));
      setError('');
    } catch {
      setError('Unable to restore the previous appearance.');
    }
  }
  function resetAll() {
    change(PREVIEW_DEFAULT_STATE);
    setReset((value) => value + 1);
  }
  const inspect = useCallback((id: ComponentId) => setInspected(id), []);
  const deliveryKey = `${accepted.render.revision}:${view}:${component}:${reset}`;
  const [delivery, setDelivery] = useState({ key: deliveryKey, revision: 1 });
  if (delivery.key !== deliveryKey)
    setDelivery({ key: deliveryKey, revision: delivery.revision + 1 });
  const result = {
    ...accepted.render,
    revision: delivery.revision,
    state: accepted.state,
    scene: {
      view:
        view === 'components' ? ('components' as const) : ('examples' as const),
      component,
      reset,
    },
  };
  const visible = GALLERY.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );
  function explore(token?: string) {
    navigate({ view: 'tokens', token, variant: undefined });
    setInspected(null);
  }
  return (
    <div data-slot="create-workspace">
      <div className="nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-3 nx:border-b-default nx:border-border-default nx:px-6 nx:py-4">
        <nav aria-label="Playground views" className="nx:flex nx:gap-2">
          <Button
            variant={view === 'examples' ? 'secondary' : 'ghost'}
            aria-pressed={view === 'examples'}
            onClick={() => navigate({ view: 'examples' })}
          >
            Examples
          </Button>
          <Button
            variant={view === 'components' ? 'secondary' : 'ghost'}
            aria-pressed={view === 'components'}
            onClick={() => navigate({ view: 'components' })}
          >
            Components
          </Button>
        </nav>
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <Button variant="ghost" onClick={undo} disabled={!history.length}>
            Undo
          </Button>
          <Button variant="ghost" onClick={resetAll}>
            Reset
          </Button>
          <ThemeExport accepted={accepted} />
        </div>
      </div>
      {error && (
        <p role="alert" className="nx:p-4 nx:text-error-subtle-foreground">
          {error}
        </p>
      )}
      <div className="nx:flex nx:items-start">
        {!narrow && (
          <aside className="nx:hidden nx:lg:block nx:w-64 nx:shrink-0 nx:border-r-default nx:border-border-default nx:p-6">
            <AppearanceControls state={accepted.state} onChange={change} />
          </aside>
        )}
        <section
          aria-label="Playground canvas"
          className="nx:min-w-0 nx:flex-1 nx:p-6 nx:space-y-4"
        >
          <div className="nx:flex nx:flex-wrap nx:justify-between nx:items-center nx:gap-3">
            <div className="nx:lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Appearance</Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Appearance</SheetTitle>
                    <SheetDescription>Style the preview.</SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <AppearanceControls
                      state={accepted.state}
                      onChange={change}
                    />
                  </SheetBody>
                </SheetContent>
              </Sheet>
            </div>
            <p className="nx:typography-label-small nx:text-muted-foreground">
              LIVE PREVIEW / {accepted.state.mode.toUpperCase()}
            </p>
            <div className="nx:flex nx:gap-2">
              <Button variant="ghost" size="sm" onClick={() => explore()}>
                Explore tokens
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  inspect(view === 'components' ? component : 'button')
                }
              >
                Inspect
              </Button>
            </div>
          </div>
          {view === 'components' && (
            <div className="nx:flex nx:flex-wrap nx:gap-4">
              <label
                htmlFor="component-search"
                className="nx:flex nx:flex-col nx:gap-2"
              >
                Find a component
                <Input
                  id="component-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search components…"
                />
              </label>
              <div className="nx:flex nx:flex-col nx:gap-2">
                <label htmlFor="component-select">Component</label>
                <NativeSelect
                  id="component-select"
                  value={component}
                  onChange={(event) =>
                    navigate({ component: event.target.value })
                  }
                >
                  {!visible.some((item) => item.id === component) && (
                    <NativeSelectOption value={component}>
                      {GALLERY.find((item) => item.id === component)?.label}
                    </NativeSelectOption>
                  )}
                  {[
                    'inputs',
                    'containers',
                    'navigation',
                    'display',
                    'primitives',
                  ].map((group) => (
                    <NativeSelectOptGroup key={group} label={group}>
                      {visible
                        .filter((item) => item.group === group)
                        .map((item) => (
                          <NativeSelectOption key={item.id} value={item.id}>
                            {item.label}
                          </NativeSelectOption>
                        ))}
                    </NativeSelectOptGroup>
                  ))}
                </NativeSelect>
              </div>
              <p
                role="status"
                className="nx:typography-body-small nx:text-muted-foreground nx:self-end"
              >
                {visible.length} component families
              </p>
            </div>
          )}
          {view === 'tokens' ? (
            <Explorer accepted={accepted} />
          ) : (
            <PreviewFrame
              result={result}
              onInspect={inspect}
              onAppearanceChange={change}
            />
          )}
        </section>
        {inspected && !narrow && (
          <aside className="nx:w-80 nx:shrink-0 nx:border-l-default nx:border-border-default nx:p-6 nx:space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInspected(null)}
            >
              Close inspector
            </Button>
            <Inspector id={inspected} accepted={accepted} onExplore={explore} />
          </aside>
        )}
      </div>
      <Sheet
        open={!!inspected && narrow}
        onOpenChange={(open) => {
          if (!open) setInspected(null);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Inspect</SheetTitle>
            <SheetDescription>Look under the hood.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            {inspected && (
              <Inspector
                id={inspected}
                accepted={accepted}
                onExplore={explore}
              />
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
