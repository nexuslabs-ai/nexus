import type { Metadata } from 'next';

import { LabWorkspace } from '../../../_workspace/tokens/lab/lab-workspace';
import { primitiveColors } from '../../../_workspace/tokens/lab/primitive-colors';

export const metadata: Metadata = { title: 'Theme lab — Nexus Design System' };

export default function TokenLabPage() {
  return <LabWorkspace primitives={primitiveColors()} />;
}
