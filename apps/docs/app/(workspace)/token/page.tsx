import { createTokenCatalogue } from '@nexus_ds/core/catalogue';
import type { Metadata } from 'next';

import { TokenWorkspace } from '../../_workspace/tokens/token-workspace';

export const metadata: Metadata = { title: 'Tokens — Nexus Design System' };

export default function TokenPage() {
  return <TokenWorkspace tokens={createTokenCatalogue()} />;
}
