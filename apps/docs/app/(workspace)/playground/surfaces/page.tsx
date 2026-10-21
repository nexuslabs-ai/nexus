import { pageMetadata, SITE_IMAGE } from '../../../_lib/site';
import { SurfaceWorkspace } from '../../../_workspace/tokens/surfaces/surface-workspace';

export const metadata = pageMetadata({
  title: 'Surface tokens',
  description:
    'Find the nxds component parts that read each surface token, in the current theme.',
  route: '/playground/surfaces',
  image: SITE_IMAGE,
});

export default function SurfacesPage() {
  return <SurfaceWorkspace />;
}
