// Syncs nxds into an example app with the local `nxds-cli` build, the way a
// consumer runs `nxds-cli update`: the items in the app's nxds.json, byte for
// byte from a registry built from this checkout. Then rebuilds packages/core
// and reinstalls it, since the app depends on it by file: path.
// usage: node ../scripts/sync-nxds.mjs   (npm run nxds:add)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { releaseCatalog } from '@nxds/catalog';
import { buildCatalog } from '@nxds/catalog/scripts/generate-catalog.mjs';
import { writeRegistry } from '@nxds/catalog/scripts/registry.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const cli = path.join(repoRoot, 'packages/cli/dist/index.js');
const appDir = process.cwd();

function run(command, args, cwd, stdio = 'pipe') {
  try {
    execFileSync(command, args, { cwd, stdio });
  } catch (error) {
    throw new Error(`${command} ${args.join(' ')} failed in ${cwd}\n${error.stdout ?? ''}\n${error.stderr ?? ''}`);
  }
}

run('pnpm', ['turbo', 'run', 'build', '--filter=nxds-cli', '--filter=@nxds/core'], repoRoot);
const registry = mkdtempSync(path.join(tmpdir(), 'nxds-registry-'));
writeRegistry(registry, [releaseCatalog(buildCatalog())]);
run('node', [cli, 'update', '--overwrite', '--no-install', '--registry', registry], appDir, 'inherit');
rmSync(registry, { recursive: true });

// npm keeps an installed file: dependency whose version has not changed, so
// remove it before reinstalling.
const installedCore = path.join(appDir, 'node_modules/@nxds/core');
if (existsSync(installedCore)) {
  rmSync(installedCore, { recursive: true });
  run('npm', ['install', '--no-audit', '--no-fund'], appDir);
}
