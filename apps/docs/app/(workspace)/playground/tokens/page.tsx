import type { Metadata } from 'next';

import { labData } from '../../../_workspace/tokens/lab/lab-data';
import { LabWorkspace } from '../../../_workspace/tokens/lab/lab-workspace';

export const metadata: Metadata = {
  title: 'Token lab',
  description:
    'Browse every Nexus UI design token in the current theme, from primitive colors to the semantic tokens components use.',
  alternates: { canonical: '/playground/tokens' },
};

export default function TokenPage() {
  return <LabWorkspace {...labData()} />;
}
