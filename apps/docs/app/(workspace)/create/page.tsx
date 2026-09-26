import type { Metadata } from 'next';

import { CreateWorkspace } from '../../_workspace/create-workspace';

export const metadata: Metadata = { title: 'Create — Nexus Design System' };

export default function CreatePage() {
  return <CreateWorkspace />;
}
