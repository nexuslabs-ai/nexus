/**
 * examples/scripts/setup.mjs — end-to-end external-consumer integration test.
 *
 * Simulates the full "consumer gets our exported design system" flow with a
 * local registry, so nothing touches public npm:
 *
 *   1. start Verdaccio (local npm registry, proxies npmjs)
 *   2. `pnpm export` the design system into .generated/ (@acme scope)
 *   3. install + build the exported @acme/react, then publish @acme/tailwind
 *      then @acme/react to Verdaccio (publish order matters)
 *   4. `npm install` the nextjs-consumer app against Verdaccio (@acme/* only;
 *      everything else from real npm)
 *
 * After this, `cd examples/nextjs-consumer && npm run dev` runs fully offline —
 * all deps are in node_modules. Re-run this script after changing the design
 * system to republish + reinstall.
 */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXAMPLES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(EXAMPLES_DIR, '..');
const GENERATED_DIR = path.join(EXAMPLES_DIR, '.generated', 'acme-design-system');
const APP_DIR = path.join(EXAMPLES_DIR, 'nextjs-consumer');
const REGISTRY = 'http://localhost:4873';
const PORT = 4873;
const SCOPE = '@acme';
const NAME = 'acme-design-system';

function run(cmd, args, cwd) {
  console.log(`\n$ ${cmd} ${args.join(' ')}  (${path.relative(REPO_ROOT, cwd) || '.'})`);
  const res = spawnSync(cmd, args, { cwd, stdio: 'inherit', env: process.env });
  if (res.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} exited ${res.status}`);
  }
}

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, '127.0.0.1');
    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

async function waitForPort(port, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await portOpen(port)) {
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Verdaccio did not come up on :${port} within ${timeoutMs}ms`);
}

async function startVerdaccio() {
  if (await portOpen(PORT)) {
    console.log(`ℹ Verdaccio already running on :${PORT} — reusing it.`);
    return null;
  }
  console.log(`▶ starting Verdaccio on :${PORT}`);
  const proc = spawn(
    'npx',
    ['--yes', 'verdaccio@6', '--config', path.join(EXAMPLES_DIR, 'verdaccio.yaml'), '--listen', String(PORT)],
    { cwd: EXAMPLES_DIR, stdio: 'inherit', env: process.env }
  );
  await waitForPort(PORT);
  return proc;
}

/** Export the design system into .generated/ (fresh each run). */
function exportDesignSystem() {
  run('node', ['scripts/export.mjs', `--name=${NAME}`, `--scope=${SCOPE}`, `--out=${GENERATED_DIR}`, '--force'], REPO_ROOT);
}

/** Install + build the exported react package, then publish both to Verdaccio. */
function publishDesignSystem() {
  run('pnpm', ['install'], GENERATED_DIR);
  run('pnpm', ['--filter', `${SCOPE}/react`, 'build'], GENERATED_DIR);

  // Anonymous publish is allowed by verdaccio.yaml ($all); npm still needs a
  // token present, so seed a throwaway one scoped to the local registry.
  const npmrc = path.join(GENERATED_DIR, '.npmrc');
  const authLine = `//localhost:${PORT}/:_authToken=local-verdaccio-token\n`;
  if (!fs.readFileSync(npmrc, 'utf8').includes(authLine)) {
    fs.appendFileSync(npmrc, authLine);
  }

  // Order matters: react depends on @acme/tailwind, so tailwind publishes first.
  for (const pkg of [`${SCOPE}/tailwind`, `${SCOPE}/react`]) {
    run('pnpm', ['--filter', pkg, 'publish', '--registry', REGISTRY, '--no-git-checks'], GENERATED_DIR);
  }
}

/** Install the consumer app. Its .npmrc scopes @acme/* to Verdaccio; every other
 *  dependency resolves from the default (real) npm registry. */
function installConsumerApp() {
  run('npm', ['install'], APP_DIR);
}

async function main() {
  let verdaccio = null;
  try {
    verdaccio = await startVerdaccio();
    exportDesignSystem();
    publishDesignSystem();
    if (fs.existsSync(path.join(APP_DIR, 'package.json'))) {
      installConsumerApp();
    } else {
      console.log(`\n⚠ ${path.relative(REPO_ROOT, APP_DIR)} not found yet — skipping app install.`);
    }
    console.log(`\n✅ setup complete. Next:\n   cd ${path.relative(process.cwd(), APP_DIR)} && npm run dev\n`);
  } finally {
    if (verdaccio) {
      verdaccio.kill();
    }
  }
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}`);
  process.exit(1);
});
