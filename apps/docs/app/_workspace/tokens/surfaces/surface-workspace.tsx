'use client';

import { Button } from '@nexus_ds/react';

import { PlaygroundViewNav } from '../../playground-view-nav';
import { WorkspaceLayout } from '../../workspace-layout';
import { useLiveTheme } from '../use-live-theme';

import { SurfaceFilters, SurfacesView } from './surfaces-view';

export function SurfaceWorkspace() {
  const live = useLiveTheme();
  return (
    <WorkspaceLayout
      panelTitle="Surface filters"
      panelDescription="Find the component parts that read a surface token."
      aside={<SurfaceFilters />}
      sheetTrigger={<Button variant="outline">Filters</Button>}
    >
      <PlaygroundViewNav />
      <SurfacesView live={live} />
    </WorkspaceLayout>
  );
}
