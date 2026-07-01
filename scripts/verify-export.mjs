/**
 * `pnpm export:verify` — acceptance harness for the standalone export (#541).
 *
 * Builds + packs the published upstream deps (`@nexus_ds/core`,
 * `@nexus_ds/eslint-plugin`) into tarballs, runs `pnpm export` into a temp
 * monorepo, redirects the two upstream deps to those tarballs via root
 * `pnpm.overrides` (leaving the real version ranges intact so `publish
 * --dry-run` validates the shipped manifest), then proves the produced repo
 * passes: install → build → lint → typecheck → publish --dry-run (both members)
 * → build-storybook → ESM smoke import → CSS token emission.
 *
 * Per-step pass/fail + duration is reported; the temp dir is retained on failure.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCOPE = '@acme';
const NAME = 'acme-ds';
const OFFLINE_RE =
  /ERR_PNPM_(FETCH|META_FETCH|REGISTRIES)|ENOTFOUND|getaddrinfo|ECONNREFUSED|request to .* failed/i;

const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.json', '.md']);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function tail(text, lines = 25) {
  return String(text ?? '')
    .trim()
    .split('\n')
    .slice(-lines)
    .join('\n');
}

/** Run a command, throwing a readable error (flagging registry/network failures). */
function exec(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { cwd, encoding: 'utf8', env: process.env });
  if (res.error) {
    throw new Error(`${cmd} ${args.join(' ')} failed to spawn: ${res.error.message}`);
  }
  if (res.status !== 0) {
    const combined = `${res.stdout ?? ''}\n${res.stderr ?? ''}`;
    const offline = OFFLINE_RE.test(combined)
      ? ' — registry/network unreachable (this harness needs an online install)'
      : '';
    throw new Error(
      `${cmd} ${args.join(' ')} exited ${res.status}${offline}\n${tail(combined)}`
    );
  }
  return res.stdout ?? '';
}

/** Recursively find text files whose contents match `re`, relative to `root`. */
function findMatches(root, re) {
  const hits = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist') {
          continue;
        }
        walk(full);
      } else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
        if (re.test(fs.readFileSync(full, 'utf8'))) {
          hits.push(path.relative(root, full));
        }
      }
    }
  };
  walk(root);
  return hits;
}

function packTarball(packageDir, destDir) {
  const pkg = readJson(path.join(packageDir, 'package.json'));
  exec('pnpm', ['pack', '--pack-destination', destDir], packageDir);
  const fileName = `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`;
  const tarball = path.join(destDir, fileName);
  if (!fs.existsSync(tarball)) {
    throw new Error(`Expected tarball not found: ${tarball}`);
  }
  return { name: pkg.name, tarball };
}

/** Redirect the upstream deps to local tarballs while keeping their real ranges. */
function injectOverrides(producedDir, tarballs) {
  const pkgPath = path.join(producedDir, 'package.json');
  const pkg = readJson(pkgPath);
  pkg.pnpm ??= {};
  pkg.pnpm.overrides ??= {};
  for (const { name, tarball } of tarballs) {
    pkg.pnpm.overrides[name] = `file:${tarball}`;
  }
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

/** Import the built ESM bundle (under a jsdom global) and assert the exports resolve. */
async function smokeImport(producedDir) {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  if (typeof dom.window.matchMedia !== 'function') {
    dom.window.matchMedia = () => ({
      matches: false,
      media: '',
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    });
  }

  const distDir = path.join(producedDir, 'packages', 'react', 'dist');
  const lib = await import(pathToFileURL(path.join(distDir, 'index.mjs')).href);
  const appearance = await import(pathToFileURL(path.join(distDir, 'appearance.mjs')).href);

  if (typeof lib.Button !== 'function') {
    throw new Error('Built index.mjs did not export a `Button` component.');
  }
  if (typeof appearance.NexusAppearanceProvider !== 'function') {
    throw new Error('Built appearance.mjs did not export `NexusAppearanceProvider`.');
  }
}

/** Prove tokens emit (tailwind) and utilities build (react). */
function assertCss(producedDir) {
  const reactCss = path.join(producedDir, 'packages', 'react', 'dist', 'react.css');
  const tailwindCss = path.join(producedDir, 'packages', 'tailwind', 'nexus.css');
  if (!fs.existsSync(reactCss) || fs.statSync(reactCss).size < 500) {
    throw new Error('Built react.css is missing or empty (no utilities generated).');
  }
  if (!fs.readFileSync(tailwindCss, 'utf8').includes('--nx-color-')) {
    throw new Error('tailwind nexus.css does not emit `--nx-color-*` tokens.');
  }
}

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-export-verify-'));
  const producedDir = path.join(tmp, NAME);
  const tarballDir = path.join(tmp, 'tarballs');
  fs.mkdirSync(tarballDir, { recursive: true });

  const results = [];
  const step = async (name, fn) => {
    const start = Date.now();
    try {
      await fn();
      results.push({ name, ok: true, ms: Date.now() - start });
      console.log(`  ✓ ${name} (${((Date.now() - start) / 1000).toFixed(1)}s)`);
    } catch (error) {
      results.push({ name, ok: false, ms: Date.now() - start });
      console.log(`  ✗ ${name}\n${error.message}`);
      throw error;
    }
  };

  console.log(`\n🔎 export:verify → ${producedDir}\n`);
  let failed = false;
  try {
    await step('build @nexus_ds/core', () =>
      exec('pnpm', ['--filter', '@nexus_ds/core', 'build'], REPO_ROOT)
    );

    const tarballs = [];
    await step('pack upstream deps', () => {
      tarballs.push(packTarball(path.join(REPO_ROOT, 'packages', 'core'), tarballDir));
      tarballs.push(
        packTarball(path.join(REPO_ROOT, 'packages', 'eslint-plugin-nexus'), tarballDir)
      );
    });

    await step('run pnpm export', () =>
      exec(
        process.execPath,
        [
          path.join('scripts', 'export.mjs'),
          `--name=${NAME}`,
          `--scope=${SCOPE}`,
          `--out=${producedDir}`,
          '--force',
        ],
        REPO_ROOT
      )
    );

    await step('rebrand audit (no stray upstream react/tailwind refs)', () => {
      const stray = findMatches(
        path.join(producedDir, 'packages'),
        /@nexus_ds\/(react|tailwind)/
      );
      if (stray.length > 0) {
        throw new Error(`Stray @nexus_ds/react|tailwind refs in: ${stray.join(', ')}`);
      }
    });

    await step('inject tarball overrides', () => injectOverrides(producedDir, tarballs));
    await step('pnpm install', () => exec('pnpm', ['install'], producedDir));
    await step('pnpm build', () => exec('pnpm', ['run', 'build'], producedDir));
    await step('pnpm lint', () => exec('pnpm', ['run', 'lint'], producedDir));
    await step('pnpm typecheck', () => exec('pnpm', ['run', 'typecheck'], producedDir));
    await step('publish --dry-run (tailwind)', () =>
      exec(
        'pnpm',
        ['--filter', `${SCOPE}/tailwind`, 'publish', '--dry-run', '--no-git-checks'],
        producedDir
      )
    );
    await step('publish --dry-run (react)', () =>
      exec(
        'pnpm',
        ['--filter', `${SCOPE}/react`, 'publish', '--dry-run', '--no-git-checks'],
        producedDir
      )
    );
    await step('build-storybook', () => exec('pnpm', ['run', 'build-storybook'], producedDir));
    await step('ESM smoke import', () => smokeImport(producedDir));
    await step('CSS token emission', () => assertCss(producedDir));
  } catch {
    failed = true;
  }

  const totalMs = results.reduce((sum, r) => sum + r.ms, 0);
  console.log('\n── Summary ──');
  for (const r of results) {
    console.log(`  ${r.ok ? '✓' : '✗'} ${r.name}  ${(r.ms / 1000).toFixed(1)}s`);
  }
  console.log(`  total ${(totalMs / 1000).toFixed(1)}s`);

  if (failed) {
    console.log(`\n✗ export:verify FAILED — temp retained at:\n  ${producedDir}\n`);
    process.exit(1);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('\n✅ export:verify PASSED\n');
}

main().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exit(1);
});
