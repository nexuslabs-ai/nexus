import type { Metadata } from 'next';

import { SurfaceWorkspace } from '../../../_workspace/tokens/surfaces/surface-workspace';

export const metadata: Metadata = {
  title: 'Surface tokens',
  description:
    'Find the Nexus UI component parts that read each surface token, in the current theme.',
  alternates: { canonical: '/playground/surfaces' },
};

export default function SurfacesPage() {
  return <SurfaceWorkspace />;
}
