import type { Metadata } from 'next';

import { PlaygroundWorkspace } from '../../_workspace/playground-workspace';

export const metadata: Metadata = { title: 'Playground — Nexus Design System' };

export default function PlaygroundPage() {
  return <PlaygroundWorkspace />;
}
