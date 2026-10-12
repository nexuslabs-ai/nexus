// Compiles src/ to dist/ with tsc, then copies every CSS file beside it:
// consumers compile the package's Tailwind entries in their own build.
import { execFileSync } from 'node:child_process';
import { cpSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

rmSync('dist', { recursive: true, force: true });
execFileSync('npx', ['tsc', '-p', 'tsconfig.build.json'], { stdio: 'inherit' });
for (const file of readdirSync('src', { recursive: true })) {
  if (file.endsWith('.css')) cpSync(path.join('src', file), path.join('dist', file));
}
