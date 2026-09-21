import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const generatedDir = path.join(docsRoot, 'generated', 'props');
const componentsRoot = path.resolve(
  docsRoot,
  '..',
  '..',
  'packages',
  'react',
  'src',
  'components'
);

type PropEntry = {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
};

type ComponentEntry = {
  name: string;
  description: string;
  sourcePath: string;
  props: PropEntry[];
};

// Git checks these files out with CRLF on Windows; the generator writes LF.
function read(file: string) {
  return readFileSync(path.join(generatedDir, file), 'utf8').replace(
    /\r\n/g,
    '\n'
  );
}

function readEntry(slug: string): {
  slug: string;
  components: ComponentEntry[];
} {
  return JSON.parse(read(`${slug}.json`));
}

function byName(a: string, b: string) {
  return a.localeCompare(b, 'en');
}

const freshDir = mkdtempSync(path.join(tmpdir(), 'nexus-props-'));

afterAll(() => {
  rmSync(freshDir, { recursive: true, force: true });
});

const index: Record<string, string[]> = JSON.parse(read('index.json'));
const slugs = Object.keys(index);
const entries = slugs.map(readEntry);
const allComponents = entries.flatMap((entry) => entry.components);

function propsOf(slug: string, component: string) {
  const entry = entries[slugs.indexOf(slug)];
  const match = entry?.components.find((c) => c.name === component);
  if (!match) throw new Error(`${slug} has no ${component} entry`);
  return match.props;
}

function propOf(slug: string, component: string, prop: string) {
  const match = propsOf(slug, component).find((p) => p.name === prop);
  if (!match) throw new Error(`${slug}/${component} has no ${prop} prop`);
  return match;
}

describe('docs props data', () => {
  it('has an entry for every component folder', () => {
    const folders = readdirSync(componentsRoot, { withFileTypes: true })
      .filter((folder) => folder.isDirectory())
      .map((folder) => folder.name)
      .sort(byName);

    expect(slugs).toEqual(folders);
    expect(entries.map((entry) => entry.slug)).toEqual(folders);
  });

  it('indexes every component name in its slug', () => {
    for (const entry of entries) {
      expect(index[entry.slug], entry.slug).toEqual(
        entry.components.map((component) => component.name)
      );
    }
  });

  it('lists only components, not hooks or factories', () => {
    const notComponents = allComponents
      .map((component) => component.name)
      .filter((name) => !/^[A-Z]/.test(name));

    expect(notComponents).toEqual([]);
  });

  it('lists only the props Badge declares itself', () => {
    expect(propsOf('badge', 'Badge').map((prop) => prop.name)).toEqual([
      'fill',
      'isCaps',
      'isNumber',
      'leftIcon',
      'rightIcon',
      'variant',
    ]);
  });

  it('keeps the cva variant union rather than widening it', () => {
    expect(propOf('badge', 'Badge', 'fill').type).toContain('"outline"');
    expect(propOf('button', 'Button', 'size').type).toContain('"icon-lg"');
  });

  it('never carries a prop inherited from React or a Radix primitive', () => {
    // Global HTML attributes no Nexus component redeclares, so any sighting
    // means the node_modules filter let `React.ComponentProps` through.
    const inheritedOnly = [
      'autoFocus',
      'dangerouslySetInnerHTML',
      'hidden',
      'id',
      'key',
      'onClick',
      'ref',
      'role',
      'style',
      'suppressHydrationWarning',
      'tabIndex',
    ];

    const leaked = allComponents.flatMap((component) =>
      component.props
        .filter((prop) => inheritedOnly.includes(prop.name))
        .map((prop) => `${component.name}.${prop.name}`)
    );

    expect(leaked).toEqual([]);
  });

  it('carries the default a prop documents in code', () => {
    expect(propOf('badge', 'Badge', 'isCaps').defaultValue).toBe('true');
    expect(propOf('badge', 'Badge', 'isNumber').defaultValue).toBe('false');
  });

  it('carries the default a prop documents only with an @default tag', () => {
    expect(propOf('attachment', 'Attachment', 'statusLabel').defaultValue).toBe(
      "a built-in phrase per state, e.g. 'Uploading'"
    );
  });

  it('reports a component under the name it is exported as', () => {
    const drawer = readEntry('drawer').components.map((c) => c.name);

    expect(drawer).toContain('Drawer');
    expect(drawer).toContain('DrawerPortal');
  });

  it('reports a re-exported component once', () => {
    const names = allComponents.map((component) => component.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('is written in a stable order', () => {
    expect(slugs).toEqual([...slugs].sort(byName));

    for (const entry of entries) {
      const names = entry.components.map((component) => component.name);
      expect(names, entry.slug).toEqual([...names].sort(byName));

      for (const component of entry.components) {
        const props = component.props.map((prop) => prop.name);
        expect(props, component.name).toEqual([...props].sort(byName));
      }
    }
  });

  it('is written in the generator’s canonical JSON form', () => {
    for (const file of [...slugs.map((slug) => `${slug}.json`), 'index.json']) {
      const raw = read(file);
      expect(`${JSON.stringify(JSON.parse(raw), null, 2)}\n`, file).toBe(raw);
    }
  });

  // Regenerating and comparing proves determinism and catches a component
  // change committed without rerunning the generator — a stale file here
  // fails the same way a hand-edited one would.
  it('matches a fresh run of the generator', { timeout: 120_000 }, () => {
    execFileSync(
      process.execPath,
      [path.join(docsRoot, 'scripts', 'generate-props.mjs'), freshDir],
      { stdio: 'pipe' }
    );

    const fresh = readdirSync(freshDir).sort(byName);
    expect(fresh).toEqual(readdirSync(generatedDir).sort(byName));

    for (const file of fresh) {
      const generated = readFileSync(path.join(freshDir, file), 'utf8');
      expect(generated, file).toBe(read(file));
    }
  });
});
