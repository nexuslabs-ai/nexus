import type { Metadata } from 'next';

import { SurfaceWorkspace } from '../../../_workspace/tokens/surfaces/surface-workspace';

export const metadata: Metadata = {
  title: 'Surface atlas — Nexus Design System',
};

export default function TokenSurfacesPage() {
  return <SurfaceWorkspace />;
}
