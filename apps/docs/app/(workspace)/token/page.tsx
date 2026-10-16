import type { Metadata } from 'next';

import { LabWorkspace } from '../../_workspace/tokens/lab/lab-workspace';
import { primitiveColors } from '../../_workspace/tokens/lab/primitive-colors';

export const metadata: Metadata = { title: 'Tokens — Nexus Design System' };

export default function TokenPage() {
  return <LabWorkspace primitives={primitiveColors()} />;
}
