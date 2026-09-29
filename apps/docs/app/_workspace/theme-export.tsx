'use client';

import {
  deriveNexusAppearanceCss,
  NEXUS_ROOT_ATTRIBUTE,
  type NexusAppearanceState,
  sanitizeNexusAppearance,
} from '@nexus_ds/core';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@nexus_ds/react';
import { useNexusAppearance } from '@nexus_ds/react/appearance';
import Link from 'next/link';

import { CodeBlock } from '../_components/CodeBlock';

function configurationSource(state: NexusAppearanceState) {
  return `import type { NexusAppearanceState } from '@nexus_ds/core';

export const appearance = ${JSON.stringify(state, null, 2)} satisfies NexusAppearanceState;
`;
}

/** Rendered only while the dialog is open, so the export is built on demand. */
function ExportFiles() {
  const { state } = useNexusAppearance();
  const { themeCss, prefsCss } = deriveNexusAppearanceCss(
    state,
    `[${NEXUS_ROOT_ATTRIBUTE}]`
  );
  const files = [
    {
      name: 'nexus-appearance.ts',
      code: configurationSource(sanitizeNexusAppearance(state)),
    },
    { name: 'theme.css', code: themeCss },
    { name: 'preferences.css', code: prefsCss },
  ];

  return files.map((file) => (
    <section key={file.name} className="nx:space-y-2">
      <h3 className="nx:typography-label-default">{file.name}</h3>
      <CodeBlock className="nx:max-h-64 nx:overflow-y-auto">
        <code>{file.code}</code>
      </CodeBlock>
    </section>
  ));
}

export function ThemeExport() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Use this theme</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use this theme</DialogTitle>
          <DialogDescription>
            Pass the configuration to NexusAppearanceProvider and
            NexusAppearanceScript as their default state, or to NexusRoot. The
            style sheets are the CSS they apply for it, for any Nexus root.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="nx:space-y-4">
          <ExportFiles />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" asChild>
            <Link href="/getting-started/theme-setup">Theme setup guide</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
