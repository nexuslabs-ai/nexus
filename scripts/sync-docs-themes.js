import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// The docs app loads the modular per-mode CSS at runtime via <link> tags
// (ThemeBootstrap) for live theme swapping, and gets primitives from
// @nexus_ds/tailwind. Console now gets runtime appearance from @nexus_ds/core +
// @nexus_ds/react/appearance, so this sync is docs-only.
//
// public/themes is a committed copy of the generated dist/modular output;
// without this sync it silently drifts from the tokens (which is exactly
// how the white→white-base refs went stale). Wired into `pnpm tokens:modular`
// so regenerating tokens redistributes to every consumer app at once.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const SOURCE_DIR = path.join(REPO_ROOT, 'packages/core/dist/modular');
const DOCS_DIR = path.join(REPO_ROOT, 'apps/docs');
const THEMES_DIR = path.join(DOCS_DIR, 'public/themes');

// Sentinel: refuse to wipe a directory that isn't the docs app.
const SENTINEL = path.join(DOCS_DIR, 'next.config.ts');
if (!fs.existsSync(SENTINEL)) {
  throw new Error(
    `sync-docs-themes: sentinel ${SENTINEL} missing — refusing to wipe ${DOCS_DIR}.`
  );
}

if (!fs.existsSync(SOURCE_DIR)) {
  throw new Error(
    `sync-docs-themes: source ${SOURCE_DIR} missing — run pnpm --filter @nexus_ds/core build:tokens:modular first.`
  );
}

fs.rmSync(THEMES_DIR, { recursive: true, force: true });
fs.mkdirSync(THEMES_DIR, { recursive: true });

let count = 0;
for (const entry of fs.readdirSync(SOURCE_DIR)) {
  fs.copyFileSync(path.join(SOURCE_DIR, entry), path.join(THEMES_DIR, entry));
  count += 1;
}

console.log(`✨ Synced ${count} files: ${SOURCE_DIR} → ${THEMES_DIR}`);
