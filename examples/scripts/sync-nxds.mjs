// Syncs nxds into an example app with the local `nxds` CLI, the way a
// consumer runs `nxds update`: the items in the app's nxds.json, byte for
// byte from this revision. Then rebuilds packages/core and reinstalls it, since
// the app depends on it by file: path.
// usage: node ../scripts/sync-nxds.mjs   (npm run nxds:add)
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

run('pnpm', ['turbo', 'run', 'build', '--filter=nxds', '--filter=@nxds/core'], repoRoot);
run('node', [cli, 'update', '--overwrite', '--no-install'], appDir, 'inherit');

// npm keeps an installed file: dependency whose version has not changed, so
// remove it before reinstalling.
const installedCore = path.join(appDir, 'node_modules/@nxds/core');
if (existsSync(installedCore)) {
  rmSync(installedCore, { recursive: true });
  run('npm', ['install', '--no-audit', '--no-fund'], appDir);
}
