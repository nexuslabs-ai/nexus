import { useState } from 'react';

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

import { exportAppearance } from './appearance-state';
import type { AcceptedPreview } from './preview/accepted-result';

export function ThemeExport({ accepted }: { accepted: AcceptedPreview }) {
  const [status, setStatus] = useState('');
  const data = exportAppearance(accepted);
  const configuration = `import type { NexusAppearanceState } from '@nexus_ds/core';\n\nexport const appearance = ${JSON.stringify(data.appearance, null, 2)} satisfies NexusAppearanceState;\n`;
  const setup = `import { NexusAppearanceProvider } from '@nexus_ds/react/appearance';\nimport { NexusAppearanceScript } from '@nexus_ds/react/appearance/server';\nimport { appearance } from './nexus-appearance';\n\n// In your root layout:\n// <head><NexusAppearanceScript defaultState={appearance} storageKey="my-app-appearance" /></head>\n// <body><NexusAppearanceProvider defaultState={appearance} storageKey="my-app-appearance">{children}</NexusAppearanceProvider></body>\n\n// For a CSS-only integration, load theme.css after Nexus styles and\n// apply these attributes to <html>:\n${JSON.stringify(data.root, null, 2)}\n`;
  const files = [
    { name: 'nexus-appearance.ts', text: configuration },
    {
      name: 'theme.css',
      text: (data.themeCss ?? '') + '\n' + (data.prefsCss ?? ''),
    },
    { name: 'setup.txt', text: setup },
  ];
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied.');
    } catch {
      setStatus('Clipboard unavailable. Select the code to copy it.');
    }
  }
  function download(name: string, text: string) {
    const url = URL.createObjectURL(
      new Blob([text], { type: 'text/plain;charset=utf-8' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus(`Downloaded ${name}.`);
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Use this theme</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make this theme yours.</DialogTitle>
          <DialogDescription>
            The exact accepted appearance from your preview.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="nx:space-y-6">
          {files.map((file) => (
            <section key={file.name} className="nx:space-y-3">
              <h3 className="nx:typography-label-default">{file.name}</h3>
              <pre className="nx:max-h-48 nx:overflow-auto nx:rounded-base nx:bg-muted nx:p-4 nx:typography-code-inline">
                <code>{file.text}</code>
              </pre>
              <div className="nx:flex nx:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copy(file.text)}
                >
                  Copy {file.name}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => download(file.name, file.text)}
                >
                  Download
                </Button>
              </div>
            </section>
          ))}
          <p role="status">{status}</p>
        </DialogBody>
        <DialogFooter>
          <Button variant="link" asChild>
            <a
              href="/getting-started/theme-setup"
              target="_blank"
              rel="noreferrer"
            >
              Theme setup documentation
            </a>
          </Button>
          <Button
            onClick={() =>
              download('nexus-theme.json', JSON.stringify(data, null, 2))
            }
          >
            Download complete setup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
