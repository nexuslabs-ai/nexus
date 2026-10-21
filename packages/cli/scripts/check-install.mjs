// Installs nxds with the built CLI the way a new user would, into a fresh
// Next.js App Router app and a fresh Vite + React app, then checks the result:
// - `init`, then `add` with every catalog item;
// - running `init` again, and `add --dry-run`, change nothing;
// - every docs example, pasted as the docs page shows it;
// - the app's own typecheck, lint and production build pass;
// - `nxds doctor` passes;
// - `add` keeps a file you edited.
// The app gets this checkout's @nxds/core as a packed tarball, since the
// catalog pins a version that may not be published yet.
// usage: node packages/cli/scripts/check-install.mjs [next|vite]
// Needs the built CLI (packages/cli/dist), the built core (packages/core/dist)
// and the docs demos (apps/docs/__generated__/demos).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cliRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const cli = path.join(cliRoot, 'dist/index.js');
const coreRoot = path.resolve(cliRoot, '../core');
const demosDir = path.resolve(cliRoot, '../../apps/docs/__generated__/demos');

const APPS = {
  next: {
    create: [
      'create-next-app@16',
      'app',
      '--ts',
      '--tailwind',
      '--app',
      '--eslint',
      '--no-src-dir',
      '--import-alias',
      '@/*',
      '--use-npm',
      '--yes',
      '--disable-git',
    ],
    srcDir: 'app',
    mount: (names) => writePage('app/nxds-check/page.tsx', 'app', names),
    checks: [
      ['npm', ['run', 'build']],
      ['npm', ['run', 'lint']],
    ],
  },
  vite: {
    create: [
      'create-vite@7',
      'app',
      '--template',
      'react-ts',
      '--no-interactive',
    ],
    install: true,
    srcDir: 'src',
    mount: (names) => mountInViteApp(names),
    checks: [
      ['npm', ['run', 'build']],
      ['npx', ['eslint', 'src']],
    ],
  },
};

let appDir;

function run(command, args, cwd = appDir) {
  console.log(`$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function runCli(args) {
  run('node', [cli, ...args, '--cwd', appDir]);
}

function cliJson(args) {
  const output = execFileSync(
    'node',
    [cli, ...args, '--cwd', appDir, '--json'],
    { encoding: 'utf8' }
  );
  return JSON.parse(output);
}

function fail(message) {
  console.error(`\n${message}`);
  process.exit(1);
}

/** A hash of every file in the app, outside dependencies and build output. */
function treeHash() {
  const hash = createHash('sha256');
  const files = readdirSync(appDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
    .filter((file) => !/[\\/](node_modules|\.next|dist)[\\/]/.test(file))
    .sort();
  for (const file of files) {
    hash.update(path.relative(appDir, file)).update(readFileSync(file));
  }
  return hash.digest('hex');
}

/** Installs this checkout's @nxds/core, packed the way it publishes. */
function installLocalCore(workDir) {
  const output = execFileSync('pnpm', ['pack', '--pack-destination', workDir], {
    cwd: coreRoot,
    encoding: 'utf8',
  });
  const tarball = output.trim().split('\n').at(-1);
  run('npm', ['install', '--no-audit', '--no-fund', tarball]);
}

/** Rerunning `init`, and `add` as a dry run, leave the app as it is. */
function checkRerunsChangeNothing(items) {
  const before = treeHash();
  runCli(['init']);
  runCli(['add', ...items, '--dry-run']);
  if (treeHash() !== before) {
    fail('Running `init` again, or `add --dry-run`, changed the app.');
  }
}

/** `add` keeps a file you edited, and says so. */
function checkEditedFileKept() {
  const { data } = cliJson(['info']);
  const file = 'components/button/button.tsx';
  const target = path.join(appDir, data.dir, file);
  const edited = `${readFileSync(target, 'utf8')}// edited by the app\n`;
  writeFileSync(target, edited);
  const { data: added } = cliJson(['add', 'button']);
  if (
    !added.skipped.some((skipped) => skipped.path === file) ||
    readFileSync(target, 'utf8') !== edited
  ) {
    fail(`\`add button\` replaced ${file}, which the app had edited.`);
  }
}

function catalogItems() {
  const catalog = JSON.parse(
    readFileSync(path.join(cliRoot, 'dist/catalog.json'), 'utf8')
  );
  return catalog.items
    .map((item) => item.name)
    .filter((name) => name !== 'setup');
}

/** The docs' shown code for every example, as a reader copies it. */
function pasteDemos(srcDir) {
  const outDir = path.join(appDir, srcDir, 'pasted');
  mkdirSync(outDir, { recursive: true });
  const ids = readdirSync(demosDir, { recursive: true })
    .filter((file) => file.endsWith('.ts'))
    .map((file) => file.slice(0, -3));
  return ids.map((id, index) => {
    const module = readFileSync(path.join(demosDir, `${id}.ts`), 'utf8');
    const source = JSON.parse(/export const source = (".*");/.exec(module)[1]);
    const name = `Example${index}`;
    writeFileSync(path.join(outDir, `${name}.tsx`), source);
    return name;
  });
}

function writePage(file, srcDir, names) {
  const target = path.join(appDir, file);
  mkdirSync(path.dirname(target), { recursive: true });
  const relative = path.relative(
    path.dirname(target),
    path.join(appDir, srcDir, 'pasted')
  );
  const from = relative.startsWith('.') ? relative : `./${relative}`;
  writeFileSync(
    target,
    [
      "'use client';",
      '',
      ...names.map((name) => `import ${name} from '${from}/${name}';`),
      '',
      'export default function NxdsCheck() {',
      '  return (',
      '    <>',
      ...names.map((name) => `      <${name} />`),
      '    </>',
      '  );',
      '}',
      '',
    ].join('\n')
  );
}

function mountInViteApp(names) {
  writePage('src/NxdsCheck.tsx', 'src', names);
  const appFile = path.join(appDir, 'src/App.tsx');
  const app = readFileSync(appFile, 'utf8');
  writeFileSync(
    appFile,
    `import NxdsCheck from './NxdsCheck'\n${app.replace('<>', '<>\n      <NxdsCheck />')}`
  );
}

const only = process.argv[2];
for (const [name, app] of Object.entries(APPS)) {
  if (only && only !== name) continue;
  const workDir = mkdtempSync(path.join(tmpdir(), `nxds-${name}-`));
  appDir = path.join(workDir, 'app');
  console.log(`\n=== ${name}: ${appDir}`);

  run('npx', ['--yes', ...app.create], workDir);
  if (app.install) run('npm', ['install', '--no-audit', '--no-fund']);
  installLocalCore(workDir);

  const items = catalogItems();
  runCli(['init']);
  runCli(['add', ...items]);
  checkRerunsChangeNothing(items);
  app.mount(pasteDemos(app.srcDir));

  for (const [command, args] of app.checks) run(command, args);
  runCli(['doctor']);
  checkEditedFileKept();
}
console.log('\nThe CLI installs nxds cleanly into every app.');
