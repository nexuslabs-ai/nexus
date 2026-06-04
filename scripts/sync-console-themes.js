import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const SOURCE_DIR = path.join(REPO_ROOT, 'packages/core/dist/modular');
const CONSOLE_DIR = path.join(REPO_ROOT, 'apps/console');
const THEMES_DIR = path.join(CONSOLE_DIR, 'public/themes');
const STYLES_DIR = path.join(CONSOLE_DIR, 'src/styles');

// Files copied to src/styles for build-time Tailwind processing.
const STYLES_FILES = [
  'globals.css',
  'color.css',
  'focus-default.css',
  'typography-utilities.css',
  'borderwidth-utilities.css',
  'spacing-utilities.css',
];

// Sentinel: refuse to wipe a directory that isn't the console app.
const SENTINEL = path.join(CONSOLE_DIR, 'vite.config.ts');
if (!fs.existsSync(SENTINEL)) {
  throw new Error(
    `sync-console-themes: sentinel ${SENTINEL} missing — refusing to wipe ${CONSOLE_DIR}.`
  );
}

if (!fs.existsSync(SOURCE_DIR)) {
  throw new Error(
    `sync-console-themes: source ${SOURCE_DIR} missing — run pnpm --filter @nexus/core build:tokens:modular first.`
  );
}

function wipeAndRecreate(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

wipeAndRecreate(THEMES_DIR);
wipeAndRecreate(STYLES_DIR);

for (const entry of fs.readdirSync(SOURCE_DIR)) {
  fs.copyFileSync(path.join(SOURCE_DIR, entry), path.join(THEMES_DIR, entry));
}

for (const file of STYLES_FILES) {
  const src = path.join(SOURCE_DIR, file);
  if (!fs.existsSync(src)) {
    throw new Error(`sync-console-themes: expected ${file} in ${SOURCE_DIR}.`);
  }
  fs.copyFileSync(src, path.join(STYLES_DIR, file));
}

console.log(
  `✨ Synced ${SOURCE_DIR} → ${THEMES_DIR} (${STYLES_FILES.length} also copied to ${STYLES_DIR})`
);
