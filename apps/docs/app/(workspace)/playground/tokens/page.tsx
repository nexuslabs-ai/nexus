import type { Metadata } from 'next';

import { labData } from '../../../_workspace/tokens/lab/lab-data';
import { LabWorkspace } from '../../../_workspace/tokens/lab/lab-workspace';

export const metadata: Metadata = { title: 'Tokens — Nexus Design System' };

export default function TokenPage() {
  return <LabWorkspace {...labData()} />;
}
