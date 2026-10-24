import { readFile, writeFile } from 'node:fs/promises';
const files = [
  'SettingsExample.jsx',
  'DataExample.jsx',
  'OnboardingExample.jsx',
  'home-examples.css',
];
const sources = Object.fromEntries(
  await Promise.all(
    files.map(async (file) => [
      file,
      await readFile(new URL(file, import.meta.url), 'utf8'),
    ])
  )
);
await writeFile(
  new URL('example-sources.json', import.meta.url),
  JSON.stringify(sources, null, 2) + '\n'
);
