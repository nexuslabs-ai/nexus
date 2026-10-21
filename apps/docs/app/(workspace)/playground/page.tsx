import { pageMetadata, SITE_IMAGE } from '../../_lib/site';
import { PlaygroundWorkspace } from '../../_workspace/playground-workspace';

export const metadata = pageMetadata({
  title: 'Theme playground',
  description:
    'Try an nxds theme on every component. Change the brand color, density, corners and shadows, then copy the appearance into your app.',
  route: '/playground',
  image: SITE_IMAGE,
});

export default function PlaygroundPage() {
  return <PlaygroundWorkspace />;
}
