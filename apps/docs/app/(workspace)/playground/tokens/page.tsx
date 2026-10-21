import { pageMetadata, SITE_IMAGE } from '../../../_lib/site';
import { labData } from '../../../_workspace/tokens/lab/lab-data';
import { LabWorkspace } from '../../../_workspace/tokens/lab/lab-workspace';

export const metadata = pageMetadata({
  title: 'Token lab',
  description:
    'Browse every nxds design token in the current theme, from primitive colors to the semantic tokens components use.',
  route: '/playground/tokens',
  image: SITE_IMAGE,
});

export default function TokenPage() {
  return <LabWorkspace {...labData()} />;
}
