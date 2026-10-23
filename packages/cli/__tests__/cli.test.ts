// @vitest-environment node
import { type Catalog, catalogSchema } from '@nxds/catalog';
import { writeRegistry } from '@nxds/catalog/scripts/registry.mjs';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { main } from '../src/cli';
import { EXIT_CODES } from '../src/errors';

// The first release `nxds-cli` installs from, as committed for nxds.dev/r.
const RELEASE = catalogSchema.parse(
  JSON.parse(
    readFileSync(
      path.resolve(import.meta.dirname, '../../catalog/releases/0.4.6.json'),
      'utf8'
    )
  )
);

const BUTTON = 'components/button/button.tsx';
// A line the next release changes: Button's icon size.
const ICON_SIZE = 'nx:[&_svg]:size-3.5';

function buttonSource(catalog: Catalog) {
  const button = catalog.items.find((item) => item.name === 'button');
  const file = button?.variants.react?.files.find((f) => f.path === BUTTON);
  if (!file) throw new Error(`${catalog.version} has no ${BUTTON}`);
  return file;
}

/** The next release: the same catalog, with Button's icon size changed. */
function nextRelease(): Catalog {
  const next = structuredClone(RELEASE);
  next.version = '0.4.7';
  const file = buttonSource(next);
  file.content = file.content.replace(ICON_SIZE, 'nx:[&_svg]:size-4');
  return next;
}

// A line the release after that changes: the small size's padding.
const SM_PADDING = 'nx:h-8 nx:px-2.5';

/** The release after `nextRelease`, with Button's small padding changed too. */
function laterRelease(): Catalog {
  const later = nextRelease();
  later.version = '0.4.8';
  const file = buttonSource(later);
  file.content = file.content.replace(SM_PADDING, 'nx:h-8 nx:px-2');
  return later;
}

const NEXT_LAYOUT = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Acme' };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

/** A fresh Next.js App Router app, and a registry with `releases`. */
function setup(releases: Catalog[] = [RELEASE]) {
  const root = mkdtempSync(path.join(tmpdir(), 'nxds-cli-test-'));
  roots.push(root);
  const app = path.join(root, 'app');
  const registry = path.join(root, 'registry');
  mkdirSync(path.join(app, 'app'), { recursive: true });
  writeFileSync(
    path.join(app, 'package.json'),
    JSON.stringify({
      name: 'acme',
      dependencies: { next: '^16.0.0', react: '^19.2.0' },
      devDependencies: {
        tailwindcss: '^4.1.0',
        '@tailwindcss/postcss': '^4.1.0',
      },
    })
  );
  writeFileSync(
    path.join(app, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } })
  );
  writeFileSync(path.join(app, 'app/layout.tsx'), NEXT_LAYOUT);
  writeFileSync(path.join(app, 'app/globals.css'), "@import 'tailwindcss';\n");
  writeRegistry(registry, releases);
  return { app, registry };
}

type Context = { app: string; registry: string };

const INSTALL_COMMANDS = new Set(['init', 'add', 'update']);

/** Runs the CLI in `app` against the test registry, without npm installs. */
async function cli(args: string[], { app, registry }: Context) {
  const argv = [...args, '--cwd', app, '--registry', registry];
  if (INSTALL_COMMANDS.has(args[0] ?? '')) argv.push('--no-install');
  let stdout = '';
  let stderr = '';
  const exitCode = await main(argv, {
    out: (text) => (stdout += text),
    err: (text) => (stderr += text),
  });
  return { exitCode, stdout, stderr };
}

async function cliJson(args: string[], context: Context) {
  const run = await cli([...args, '--json'], context);
  return { exitCode: run.exitCode, body: JSON.parse(run.stdout) };
}

function readApp(app: string, file: string) {
  return readFileSync(path.join(app, file), 'utf8');
}

function writeApp(app: string, file: string, content: string) {
  writeFileSync(path.join(app, file), content);
}

/** Every file under the app, by path, for comparing before and after. */
function readTree(app: string) {
  return Object.fromEntries(
    readdirSync(app, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const file = path.join(entry.parentPath, entry.name);
        return [path.relative(app, file), readFileSync(file, 'utf8')];
      })
  );
}

const NXDS_BUTTON = `components/nxds/${BUTTON}`;

async function installButton(context: Context) {
  for (const args of [['init'], ['add', 'button']]) {
    const run = await cli(args, context);
    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
  }
}

function nxdsVersion(app: string) {
  return (JSON.parse(readApp(app, 'nxds.json')) as { version: string }).version;
}

describe('init and add', () => {
  it('changes nothing when init runs again', async () => {
    const context = setup();
    expect((await cli(['init'], context)).exitCode).toBe(EXIT_CODES.ok);
    const before = readTree(context.app);

    const again = await cli(['init'], context);

    expect(again.exitCode).toBe(EXIT_CODES.ok);
    expect(readTree(context.app)).toEqual(before);
  });

  it('keeps a file you edited when add runs again', async () => {
    const context = setup();
    await installButton(context);
    const edited = `${readApp(context.app, NXDS_BUTTON)}\nexport const edited = true;\n`;
    writeApp(context.app, NXDS_BUTTON, edited);

    const { exitCode, body } = await cliJson(['add', 'button'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data.skipped).toContain(BUTTON);
    expect(readApp(context.app, NXDS_BUTTON)).toBe(edited);
  });
});

describe('update', () => {
  it('treats line endings and trailing whitespace as unedited', async () => {
    const context = setup();
    await installButton(context);
    const crlf = readApp(context.app, NXDS_BUTTON)
      .split('\n')
      .map((line) => `${line}  `)
      .join('\r\n');
    writeApp(context.app, NXDS_BUTTON, crlf);
    writeRegistry(context.registry, [RELEASE, nextRelease()]);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data).toMatchObject({
      written: [BUTTON],
      merged: [],
      skipped: [],
    });
    expect(readApp(context.app, NXDS_BUTTON)).toBe(
      buttonSource(nextRelease()).content
    );
    expect(nxdsVersion(context.app)).toBe('0.4.7');
  });

  it("merges nxds's changes into lines you didn't edit", async () => {
    const context = setup();
    await installButton(context);
    const edited = readApp(context.app, NXDS_BUTTON).replace(
      "'use client';",
      "'use client';\n// Acme: buttons follow the brand guide."
    );
    writeApp(context.app, NXDS_BUTTON, edited);
    writeRegistry(context.registry, [RELEASE, nextRelease()]);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data.merged).toEqual([BUTTON]);
    const merged = readApp(context.app, NXDS_BUTTON);
    expect(merged).toContain('// Acme: buttons follow the brand guide.');
    expect(merged).toContain('nx:[&_svg]:size-4');
    expect(merged).not.toContain('<<<<<<<');
    expect(nxdsVersion(context.app)).toBe('0.4.7');
  });

  it('writes conflict markers where you and nxds changed the same line', async () => {
    const context = setup();
    await installButton(context);
    writeApp(
      context.app,
      NXDS_BUTTON,
      readApp(context.app, NXDS_BUTTON).replace(ICON_SIZE, 'nx:[&_svg]:size-5')
    );
    writeRegistry(context.registry, [RELEASE, nextRelease()]);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body).toMatchObject({ ok: false, exitCode: EXIT_CODES.attention });
    expect(body.data.conflicted).toEqual([BUTTON]);
    const conflicted = readApp(context.app, NXDS_BUTTON);
    expect(conflicted).toContain('<<<<<<< your file');
    expect(conflicted).toContain('>>>>>>> nxds 0.4.7');
    expect(nxdsVersion(context.app)).toBe('0.4.7');

    const doctor = await cliJson(['doctor'], context);
    expect(doctor.body.data.checks).toContainEqual(
      expect.objectContaining({ name: 'conflicts', ok: false })
    );
  });

  it('keeps reporting a conflict until you resolve it', async () => {
    const context = setup();
    await installButton(context);
    writeApp(
      context.app,
      NXDS_BUTTON,
      readApp(context.app, NXDS_BUTTON).replace(ICON_SIZE, 'nx:[&_svg]:size-5')
    );
    writeRegistry(context.registry, [RELEASE, nextRelease()]);
    await cli(['update'], context);
    const conflicted = readApp(context.app, NXDS_BUTTON);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data).toMatchObject({ conflicted: [], unresolved: [BUTTON] });
    expect(readApp(context.app, NXDS_BUTTON)).toBe(conflicted);
  });

  it("stays on the conflicted release until you resolve it, then merges the next one's changes", async () => {
    const context = setup();
    await installButton(context);
    writeApp(
      context.app,
      NXDS_BUTTON,
      readApp(context.app, NXDS_BUTTON).replace(ICON_SIZE, 'nx:[&_svg]:size-5')
    );
    writeRegistry(context.registry, [RELEASE, nextRelease()]);
    await cli(['update'], context);
    writeRegistry(context.registry, [RELEASE, nextRelease(), laterRelease()]);

    const held = await cliJson(['update'], context);

    expect(held.exitCode).toBe(EXIT_CODES.attention);
    expect(held.body.data.unresolved).toEqual([BUTTON]);
    expect(nxdsVersion(context.app)).toBe('0.4.7');

    // Keep your side of the conflict.
    const resolved = buttonSource(nextRelease()).content.replace(
      'nx:[&_svg]:size-4',
      'nx:[&_svg]:size-5'
    );
    writeApp(context.app, NXDS_BUTTON, resolved);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data.merged).toEqual([BUTTON]);
    const merged = readApp(context.app, NXDS_BUTTON);
    expect(merged).toContain('nx:[&_svg]:size-5');
    expect(merged).toContain("'nx:h-8 nx:px-2 ");
    expect(nxdsVersion(context.app)).toBe('0.4.8');
  });
});

describe('help', () => {
  it.each([[['help', 'add']], [['add', '--help']]])(
    'prints help for %j and exits 0',
    async (args) => {
      const run = await cli(args, setup());

      expect(run.exitCode).toBe(EXIT_CODES.ok);
      expect(run.stdout).toMatch(/add components or blocks/);
      expect(run.stderr).toBe('');
    }
  );
});

describe('errors', () => {
  it('exits 2 with one JSON object for a flag the command does not take', async () => {
    const context = setup();

    const run = await cli(['list', '--overwrite', '--json'], context);

    expect(run.exitCode).toBe(EXIT_CODES.usage);
    expect(JSON.parse(run.stdout)).toMatchObject({
      ok: false,
      exitCode: EXIT_CODES.usage,
      error: expect.stringMatching(/unknown option '--overwrite'/),
    });
  });

  it('exits 2 for an item the release does not have', async () => {
    const context = setup();
    expect((await cli(['init'], context)).exitCode).toBe(EXIT_CODES.ok);

    const run = await cli(['add', 'buton'], context);

    expect(run.exitCode).toBe(EXIT_CODES.usage);
    expect(run.stderr).toMatch(/has no item named "buton"/);
  });

  it('names each invalid field of a broken release', async () => {
    const broken = structuredClone(RELEASE);
    const file = buttonSource(broken);
    file.path = '../outside.tsx';
    const context = setup([broken]);

    const run = await cli(['list'], context);

    expect(run.exitCode).toBe(EXIT_CODES.error);
    expect(run.stderr).toMatch(
      /items\.\d+\.variants\.react\.files\.\d+\.path: must be a relative path/
    );
  });
});
