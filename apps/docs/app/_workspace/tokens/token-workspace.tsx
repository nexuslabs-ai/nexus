'use client';

import { useMemo } from 'react';

import type { CatalogueToken } from '@nexus_ds/core/catalogue';
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@nexus_ds/react';

import { useWorkspaceLocation } from '../use-workspace-location';
import { WorkspaceLayout } from '../workspace-layout';

import { ExploreRoute, TokenFilters } from './explore-route';
import {
  SurfaceFilters,
  SURFACES_VIEW,
  surfacesParams,
  SurfacesView,
} from './surfaces/surfaces-view';
import { indexTokens } from './token-index';
import { useLiveTheme } from './use-live-theme';

const TOKENS_VIEW = 'tokens';

const PANELS = {
  [TOKENS_VIEW]: {
    title: 'Token filters',
    description: 'Find tokens by family, group, preset, and mode.',
  },
  [SURFACES_VIEW]: {
    title: 'Surface filters',
    description: 'Find the component parts that read a surface token.',
  },
};

export function TokenWorkspace({
  tokens,
}: {
  tokens: readonly CatalogueToken[];
}) {
  const index = useMemo(() => indexTokens(tokens), [tokens]);
  const live = useLiveTheme();
  const { search, navigate } = useWorkspaceLocation();
  const view =
    search.get('view') === SURFACES_VIEW ? SURFACES_VIEW : TOKENS_VIEW;
  const panel = PANELS[view];
  const changeView = (next: string) =>
    navigate(next === SURFACES_VIEW ? surfacesParams() : new URLSearchParams());

  return (
    <WorkspaceLayout
      panelTitle={panel.title}
      panelDescription={panel.description}
      aside={
        view === SURFACES_VIEW ? (
          <SurfaceFilters />
        ) : (
          <TokenFilters index={index} />
        )
      }
      sheetTrigger={<Button variant="outline">Filters</Button>}
    >
      <Tabs value={view} onValueChange={changeView}>
        <TabsList aria-label="Token views">
          <TabsTrigger value={TOKENS_VIEW}>Tokens</TabsTrigger>
          <TabsTrigger value={SURFACES_VIEW}>Surfaces</TabsTrigger>
        </TabsList>
        <TabsContent value={TOKENS_VIEW} className="nx:mt-6">
          <ExploreRoute index={index} live={live} />
        </TabsContent>
        <TabsContent value={SURFACES_VIEW} className="nx:mt-6">
          <SurfacesView live={live} />
        </TabsContent>
      </Tabs>
    </WorkspaceLayout>
  );
}
