// Copies Nexus into an example app the way the Install docs page tells a
// consumer to: component files from packages/react/src (each component's
// dependency closure), the appearance provider, and the token CSS from
// packages/tailwind — byte for byte. Then rebuilds packages/core and
// reinstalls it, since the app depends on it by file: path.
//
// Reads nexus.json from the current directory:
//   components  slugs from apps/docs/generated/dependencies
//   sourceDir   where packages/react/src lands, relative to the app
//   cssDir      where packages/tailwind/*.css lands, relative to the app
// usage: node ../scripts/sync-nexus.mjs   (npm run nexus:add)
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const srcRoot = path.join(repoRoot, 'packages/react/src');
const tailwindDir = path.join(repoRoot, 'packages/tailwind');
const depsDir = path.join(repoRoot, 'apps/docs/generated/dependencies');
const PROVIDER_DIR = 'components/appearance/provider';

const appDir = process.cwd();
const config = JSON.parse(readFileSync(path.join(appDir, 'nexus.json'), 'utf8'));
const sourceDest = path.join(appDir, config.sourceDir);
const cssDest = path.join(appDir, config.cssDir);

run('node', ['apps/docs/scripts/generate-dependencies.mjs'], repoRoot);

const closures = config.components.map(
  (slug) => JSON.parse(readFileSync(path.join(depsDir, `${slug}.json`), 'utf8')).closure
);
const providerFiles = readdirSync(path.join(srcRoot, PROVIDER_DIR))
  .filter((name) => !name.includes('.stories.'))
  .map((name) => `${PROVIDER_DIR}/${name}`);
const sourceFiles = new Set([
  ...closures.flatMap((closure) => [...closure.files, ...closure.copy]),
  ...providerFiles,
]);
const cssFiles = readdirSync(tailwindDir).filter((name) => name.endsWith('.css'));

// Clear each component folder this copy owns, so a file dropped upstream does
// not linger. lib/ files are overwritten in place: the app may keep its own there.
const ownedDirs = new Set(
  [...sourceFiles].map((file) => path.dirname(file)).filter((dir) => dir.startsWith('components/'))
);
for (const dir of ownedDirs) rmSync(path.join(sourceDest, dir), { recursive: true, force: true });
rmSync(cssDest, { recursive: true, force: true });

for (const file of sourceFiles) {
  mkdirSync(path.dirname(path.join(sourceDest, file)), { recursive: true });
  cpSync(path.join(srcRoot, file), path.join(sourceDest, file));
}
mkdirSync(cssDest, { recursive: true });
for (const file of cssFiles) cpSync(path.join(tailwindDir, file), path.join(cssDest, file));

// The app installs @nexus_ds/core from packages/core, so the engine and the
// copied components come from the same revision. npm keeps an installed file:
// dependency whose version has not changed, so remove it before reinstalling.
function run(command, args, cwd) {
  try {
    execFileSync(command, args, { cwd, stdio: 'pipe' });
  } catch (error) {
    throw new Error(`${command} ${args.join(' ')} failed in ${cwd}\n${error.stdout}\n${error.stderr}`);
  }
}

run('pnpm', ['--filter', '@nexus_ds/core', 'build'], repoRoot);
const installedCore = path.join(appDir, 'node_modules/@nexus_ds/core');
if (existsSync(installedCore)) {
  rmSync(installedCore, { recursive: true });
  run('npm', ['install', '--no-audit', '--no-fund'], appDir);
}

const install = new Map(closures.flatMap((closure) => closure.install.map(({ name, range }) => [name, range])));
console.log(`${sourceFiles.size} source files → ${config.sourceDir}`);
console.log(`${cssFiles.length} CSS files → ${config.cssDir}`);
console.log(`npm packages the copied files import:\n  ${[...install].map(([name, range]) => `${name}@${range}`).join('\n  ')}`);
