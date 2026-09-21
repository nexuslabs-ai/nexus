import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterAll, describe, expect, it } from 'vitest';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const repoRoot = path.resolve(docsRoot, '..', '..');
const generatedDir = path.join(docsRoot, 'generated', 'props');
const reactRoot = path.join(repoRoot, 'packages', 'react');
const reactSrc = path.join(reactRoot, 'src');
const componentsRoot = path.join(reactSrc, 'components');

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

const index: Record<string, string[]> = JSON.parse(read('index.json'));
const slugs = Object.keys(index);
const entries = slugs.map(readEntry);
const allComponents = entries.flatMap((entry) => entry.components);

function componentOf(slug: string, component: string) {
  const entry = entries[slugs.indexOf(slug)];
  const match = entry?.components.find((c) => c.name === component);
  if (!match) throw new Error(`${slug} has no ${component} entry`);
  return match;
}

function propsOf(slug: string, component: string) {
  return componentOf(slug, component).props;
}

function propOf(slug: string, component: string, prop: string) {
  const match = propsOf(slug, component).find((p) => p.name === prop);
  if (!match) throw new Error(`${slug}/${component} has no ${prop} prop`);
  return match;
}

let freshDir: string | null = null;

afterAll(() => {
  if (freshDir) rmSync(freshDir, { recursive: true, force: true });
});

let exportNames: Set<string> | null = null;

/**
 * Everything `@nexus_ds/react` exports, read straight off the package's own
 * entry points rather than off the generator — what a consumer can import is
 * the yardstick the output is measured against.
 */
function reactExportNames() {
  if (exportNames) return exportNames;

  const manifest = JSON.parse(
    readFileSync(path.join(reactRoot, 'package.json'), 'utf8')
  );
  const entryPoints: string[] = Object.values(manifest.exports)
    .map((subpath) => (subpath as { types?: string })?.types)
    .filter((types): types is string => typeof types === 'string')
    .map((types) =>
      path.join(
        reactRoot,
        types.replace(/^\.\/dist\//, 'src/').replace(/\.d\.ts$/, '.ts')
      )
    );

  const tsconfig = path.join(reactRoot, 'tsconfig.json');
  const { options } = ts.parseJsonConfigFileContent(
    ts.readConfigFile(tsconfig, ts.sys.readFile).config,
    ts.sys,
    path.dirname(tsconfig)
  );
  const program = ts.createProgram(entryPoints, { ...options, noEmit: true });
  const checker = program.getTypeChecker();

  const names = new Set<string>();
  for (const entry of entryPoints) {
    const sourceFile = program.getSourceFile(entry);
    if (!sourceFile)
      throw new Error(`entry point ${entry} is not in the program`);

    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) throw new Error(`entry point ${entry} exports nothing`);

    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
      names.add(symbol.getName());
    }
  }

  exportNames = names;
  return names;
}

/**
 * Every type declared at the top level of a file under the react package —
 * anchored at column 0 so an indented `type X,` inside an import block is not
 * mistaken for a declaration.
 */
function reactTypeNames() {
  const names = new Set<string>();

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }
      if (!/\.tsx?$/.test(entry.name)) continue;

      const source = readFileSync(entryPath, 'utf8');
      for (const match of source.matchAll(
        /^(?:export )?(?:declare )?(?:type|interface) ([A-Za-z_$][\w$]*)/gm
      )) {
        const [, name] = match;
        if (name) names.add(name);
      }
    }
  };

  walk(reactSrc);
  return names;
}

describe('docs props data', () => {
  it('has an entry for every component folder that exports a component', () => {
    const folders = readdirSync(componentsRoot, { withFileTypes: true })
      .filter((folder) => folder.isDirectory())
      .map((folder) => folder.name)
      .sort(byName);

    // The only two that export no component: `focus-ring` holds a stories
    // file, `overlay-layout` a shared class-name module.
    expect(folders.filter((folder) => !slugs.includes(folder))).toEqual([
      'focus-ring',
      'overlay-layout',
    ]);
    expect(entries.map((entry) => entry.slug)).toEqual(slugs);
    expect(slugs).toEqual([...slugs].sort(byName));
  });

  it('never indexes a slug with no components', () => {
    expect(entries.filter((entry) => entry.components.length === 0)).toEqual(
      []
    );
  });

  it('indexes every component name in its slug', () => {
    for (const entry of entries) {
      expect(index[entry.slug], entry.slug).toEqual(
        entry.components.map((component) => component.name)
      );
    }
  });

  it('documents nothing a consumer cannot import', { timeout: 120_000 }, () => {
    const exported = reactExportNames();
    const unreachable = allComponents
      .map((component) => component.name)
      .filter((name) => !exported.has(name));

    expect(unreachable).toEqual([]);
  });

  it('drops the hooks and factories docgen reports as components', () => {
    const names = new Set(allComponents.map((component) => component.name));

    expect(names.has('useSidebar')).toBe(false);
    expect(names.has('createNexusAppearance')).toBe(false);
    expect(names.has('createNexusAppearanceScript')).toBe(false);
    expect(names.has('resolveOverlayButtonOrientation')).toBe(false);
    expect(names.has('SidebarProvider')).toBe(true);
  });

  it('keeps an exported component whose function takes no props', () => {
    // docgen resolves props off the first call-signature parameter, so these
    // two are reported as nothing at all.
    expect(componentOf('appearance', 'NexusAppearanceSettings').props).toEqual(
      []
    );
    expect(componentOf('menubar', 'MenubarMenu').props).toEqual([]);
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

  it('prints an unexported alias as its members, not its name', () => {
    expect(propOf('slider', 'Slider', 'markers').type).toBe(
      'number[] | "steps"'
    );
    expect(propOf('table', 'Table', 'variant').type).toBe(
      '"default" | "borderless" | "grid"'
    );
    expect(propOf('alert-dialog', 'AlertDialogContent', 'variant').type).toBe(
      '"default" | "center"'
    );
  });

  it('refuses an output directory outside the docs app', () => {
    // Everything in the target directory's `*.json` is deleted before writing,
    // so a stray argument must not be able to name the repo root.
    const outside = path.join(repoRoot, 'node_modules', '.props-guard-probe');

    expect(() =>
      execFileSync(
        process.execPath,
        [path.join(docsRoot, 'scripts', 'generate-props.mjs'), outside],
        { stdio: 'pipe' }
      )
    ).toThrow(/Refusing to write to/);
    expect(existsSync(outside)).toBe(false);
  });

  it('never names a type a reader cannot resolve', { timeout: 120_000 }, () => {
    const exported = reactExportNames();
    const unresolvable = [...reactTypeNames()].filter(
      (name) => !exported.has(name)
    );
    const pattern = new RegExp(`\\b(?:${unresolvable.join('|')})\\b`);

    const named = allComponents.flatMap((component) =>
      component.props
        .filter((prop) => pattern.test(prop.type))
        .map((prop) => `${component.name}.${prop.name}: ${prop.type}`)
    );

    expect(named).toEqual([]);
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
    freshDir = mkdtempSync(path.join(tmpdir(), 'nexus-props-'));

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
