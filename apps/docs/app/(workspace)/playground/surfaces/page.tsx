import type { Metadata } from 'next';

import { SurfaceWorkspace } from '../../../_workspace/tokens/surfaces/surface-workspace';

export const metadata: Metadata = { title: 'Surfaces — Nexus Design System' };

export default function SurfacesPage() {
  return <SurfaceWorkspace />;
}
