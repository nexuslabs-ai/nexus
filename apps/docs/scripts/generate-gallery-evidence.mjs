import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// The Inspector displays the actual authored demo, so props cannot drift from
// the example people are operating. This module is build tooling only.
export async function generateGalleryEvidence() {
  const demos = new URL('../app/_create/demos/', import.meta.url);
  const components = new URL(
    '../../../packages/react/src/components/',
    import.meta.url
  );
  const evidence = {};
  for (const file of (await fs.readdir(demos)).sort()) {
    if (!file.endsWith('.tsx') || file === 'gallery-demo.tsx') continue;
    const id = file.slice(0, -4);
    const source = await fs.readFile(new URL(file, demos), 'utf8');
    const componentFiles =
      id === 'appearance'
        ? [
            'appearance-settings',
            'brand-color-field',
            'color-field',
            'config-preview',
            'setting-row',
            'theme-quick-control',
          ].map((name) => 'appearance/' + name + '/' + name + '.tsx')
        : [id + '/' + id + '.tsx'];
    const implementation = (
      await Promise.all(
        componentFiles.map((name) =>
          fs.readFile(new URL(name, components), 'utf8')
        )
      )
    ).join('\n');
    const tokens = [
      ...new Set(
        [
          ...implementation.matchAll(
            /(?:--nx-color-|(?:bg|text|border|ring|outline|fill|stroke)-)([a-z]+(?:-[a-z]+)*)/g
          ),
        ].map((match) => match[1])
      ),
    ].sort();
    evidence[id] = { source, tokens };
  }
  await fs.writeFile(
    new URL('../app/_create/gallery-evidence.json', import.meta.url),
    JSON.stringify(evidence, null, 2) + '\n'
  );
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  await generateGalleryEvidence();
