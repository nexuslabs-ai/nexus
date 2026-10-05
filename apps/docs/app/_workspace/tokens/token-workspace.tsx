'use client';

import { useMemo } from 'react';

import type { CatalogueToken } from '@nexus_ds/core/catalogue';
import { Button } from '@nexus_ds/react';

import { WorkspaceLayout } from '../workspace-layout';

import { ExploreRoute, TokenFilters } from './explore-route';
import { indexTokens } from './token-index';
import { TokenViewNav } from './token-view-nav';
import { useLiveTheme } from './use-live-theme';

export function TokenWorkspace({
  tokens,
}: {
  tokens: readonly CatalogueToken[];
}) {
  const index = useMemo(() => indexTokens(tokens), [tokens]);
  const live = useLiveTheme();
  return (
    <WorkspaceLayout
      panelTitle="Token filters"
      panelDescription="Find tokens by family, group, preset, and mode."
      aside={<TokenFilters index={index} />}
      sheetTrigger={<Button variant="outline">Filters</Button>}
    >
      <TokenViewNav />
      <ExploreRoute index={index} live={live} />
    </WorkspaceLayout>
  );
}
