import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generateCreateCatalog } from './generate-create-catalog.mjs';
await generateCreateCatalog({ development: true });
let pending = false,
  running = false,
  timer;
async function refresh() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  do {
    pending = false;
    await generateCreateCatalog({ development: true });
  } while (pending);
  running = false;
}
const watchedPaths = [
  ...['tokens', 'src', 'scripts'].map((dir) => '../../../packages/core/' + dir),
  '../app/_create/demos',
  '../../../packages/react/src/components',
];
const watchers = watchedPaths.map((relativePath) =>
  watch(
    fileURLToPath(new URL(relativePath, import.meta.url)),
    { recursive: true },
    () => {
      clearTimeout(timer);
      timer = setTimeout(refresh, 150);
    }
  )
);
const child = spawn(
  'next',
  [
    'dev',
    '--turbopack',
    ...process.argv.slice(2).filter((arg) => arg !== '--'),
  ],
  {
    stdio: 'inherit',
    shell: false,
  }
);
function close(signal) {
  clearTimeout(timer);
  watchers.forEach((w) => w.close());
  child.kill(signal);
}
process.on('SIGTERM', () => close('SIGTERM'));
process.on('SIGINT', () => close('SIGINT'));
child.on('exit', (code) => {
  watchers.forEach((w) => w.close());
  process.exit(code ?? 1);
});
