import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterAll, describe, expect, it } from 'vitest';

import {
  isComponentName,
  isPortableExpansion,
  isRenderable,
  isSlugName,
  opaqueNamespaceNames,
  recordedSlugs,
  toSlugFolder,
} from './props-contract.mjs';
import {
  entryPointsFromManifest,
  reactEntryPoints,
  reactRoot,
} from './react-entry-points.mjs';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const generatedDir = path.join(docsRoot, 'generated', 'props');
const reactSrc = path.join(reactRoot, 'src');
const componentsRoot = path.join(reactSrc, 'components');

type PropEntry = {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
  example: string | null;
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

const FENCED_BLOCK = /^```[a-z]*\n[\s\S]*\n```$/;
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

function runGenerator(outputDir: string) {
  execFileSync(
    process.execPath,
    [path.join(docsRoot, 'scripts', 'generate-props.mjs'), outputDir],
    { stdio: 'pipe' }
  );
}

let exportNames: Set<string> | null = null;

/**
 * Everything `@nexus_ds/react` exports, read straight off the package's own
 * entry points rather than off the generator — what a consumer can import is
 * the yardstick the output is measured against.
 */
function reactExportNames() {
  if (exportNames) return exportNames;

  const entryPoints = reactEntryPoints();
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

/**
 * One module carrying every shape the checker-backed predicates have to judge —
 * shapes this repo does not currently export, so they cannot be read off the
 * package itself. Built once: each `ts.createProgram` loads the default library.
 */
const FIXTURE_SOURCE = [
  "import * as React from 'react';",
  "import * as R from 'react';",
  "import * as RechartsPrimitive from 'recharts';",
  "import { useState } from 'react';",
  '',
  'export function FunctionWidget(props: { label: string }) {',
  '  return props.label;',
  '}',
  'export class ClassWidget {',
  "  label = '';",
  '}',
  'export const ConfigWidget = { gap: 4 };',
  'export interface WidgetProps {',
  '  label: string;',
  '}',
].join('\n');

let fixtureDir: string | null = null;

afterAll(() => {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
});

function buildFixture() {
  fixtureDir = mkdtempSync(path.join(tmpdir(), 'nexus-props-fixture-'));

  const file = path.join(fixtureDir, 'fixture.ts');
  writeFileSync(file, FIXTURE_SOURCE, 'utf8');

  const program = ts.createProgram([file], {
    noEmit: true,
    skipLibCheck: true,
  });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(file);
  if (!sourceFile) throw new Error('fixture is not in the program');

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) throw new Error('fixture exports nothing');

  const symbols = new Map(
    checker
      .getExportsOfModule(moduleSymbol)
      .map((symbol) => [symbol.getName(), symbol])
  );

  const symbolNamed = (name: string) => {
    const symbol = symbols.get(name);
    if (!symbol) throw new Error(`fixture does not export ${name}`);
    return symbol;
  };

  return { checker, sourceFile, symbolNamed };
}

let fixture: ReturnType<typeof buildFixture> | null = null;
const fixtureModule = () => (fixture ??= buildFixture());

describe('component export predicates', () => {
  it(
    'counts a call or a construct signature as renderable',
    { timeout: 120_000 },
    () => {
      const { checker, symbolNamed } = fixtureModule();

      // A class component is rendered through `new`, so it carries a construct
      // signature and no call signature at all.
      expect(isRenderable(checker, symbolNamed('ClassWidget'))).toBe(true);
      expect(isRenderable(checker, symbolNamed('FunctionWidget'))).toBe(true);
      expect(isRenderable(checker, symbolNamed('ConfigWidget'))).toBe(false);
      expect(isRenderable(checker, symbolNamed('WidgetProps'))).toBe(false);
    }
  );

  it(
    'exempts only the conventional React namespace binding',
    { timeout: 120_000 },
    () => {
      const { sourceFile } = fixtureModule();

      expect(opaqueNamespaceNames(sourceFile)).toEqual([
        'R',
        'RechartsPrimitive',
      ]);
    }
  );

  it('declines an expansion only its declaring file could print', () => {
    expect(isPortableExpansion('"default" | "center"', [])).toBe(true);
    expect(
      isPortableExpansion('RechartsPrimitive.TooltipPayloadEntry[]', [
        'RechartsPrimitive',
      ])
    ).toBe(false);
    expect(
      isPortableExpansion('import("C:/dev/nexus/node_modules/x").Foo', [])
    ).toBe(false);

    // The namespace has to qualify the name, not merely end it — otherwise an
    // unrelated type whose name ends in the namespace would be dropped.
    expect(
      isPortableExpansion('MyRechartsPrimitive.Entry', ['RechartsPrimitive'])
    ).toBe(true);
  });

  it('resolves a slug only from a path inside a component folder', () => {
    expect(toSlugFolder(path.join('badge', 'badge.tsx'))).toBe('badge');
    expect(toSlugFolder(path.join('alert-dialog', 'parts', 'body.tsx'))).toBe(
      'alert-dialog'
    );
    expect(toSlugFolder('loose-widget.tsx')).toBeNull();
    expect(toSlugFolder(path.join('..', 'lib', 'utils.ts'))).toBeNull();
    expect(
      toSlugFolder(path.resolve(path.sep, 'elsewhere', 'widget.tsx'))
    ).toBeNull();
  });

  it('accepts only a bare kebab-case name as a slug to delete', () => {
    expect(isSlugName('alert-dialog')).toBe(true);
    expect(isSlugName('input-otp')).toBe(true);
    expect(isSlugName('../bystander')).toBe(false);
    expect(isSlugName(path.join('..', 'bystander'))).toBe(false);
    expect(isSlugName('..')).toBe(false);
    expect(isSlugName('nested/slug')).toBe(false);
    expect(isSlugName('C:/tmp/bystander')).toBe(false);
    expect(isSlugName('')).toBe(false);
    expect(isSlugName(null)).toBe(false);
  });

  it('records only the slug-shaped keys a previous index names', () => {
    expect(
      recordedSlugs('{"badge":["Badge"],"alert-dialog":["AlertDialog"]}')
    ).toEqual(['badge', 'alert-dialog']);

    // The generator deletes `{key}.json`, so a key naming a path would reach
    // outside the directory the index sits in.
    expect(recordedSlugs('{"../bystander":["Y"],"badge":["Badge"]}')).toEqual([
      'badge',
    ]);
    expect(recordedSlugs('{"nested/slug":["Y"]}')).toEqual([]);
  });

  it('treats a body it cannot use as no record at all', () => {
    // A merge-conflicted, half-written, or wrong-shaped index must not fail the
    // docs build over files this run is about to replace.
    expect(
      recordedSlugs('<<<<<<< HEAD\n{"badge":["Badge"]}\n=======\n{}\n')
    ).toEqual([]);
    expect(recordedSlugs('')).toEqual([]);
    expect(recordedSlugs('{"badge":["Badge"]')).toEqual([]);
    expect(recordedSlugs('null')).toEqual([]);
    expect(recordedSlugs('"badge"')).toEqual([]);
    expect(recordedSlugs('42')).toEqual([]);
    expect(recordedSlugs('["badge","alert-dialog"]')).toEqual([]);
  });

  it('reads a component name as PascalCase, not a screaming-snake constant', () => {
    expect(isComponentName('Button')).toBe(true);
    expect(isComponentName('NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS')).toBe(
      false
    );
    expect(isComponentName('useSidebar')).toBe(false);
  });
});

describe('react entry points', () => {
  const relative = (entry: string) =>
    path.relative(reactRoot, entry).split(path.sep).join('/');

  it('takes one entry point per subpath that resolves to code', () => {
    const entries = entryPointsFromManifest({
      exports: {
        '.': { types: './dist/index.d.ts', import: './dist/index.mjs' },
        './nested': {
          import: { types: './dist/nested.d.ts', default: './dist/nested.mjs' },
        },
        './v1.2': { types: './dist/v1.2.d.ts', import: './dist/v1.2.mjs' },
        './styles.css': './dist/react.css',
        './asset-object': { default: './dist/react.css' },
        './blocked': null,
      },
    });

    expect(entries.map(relative)).toEqual([
      'src/index.ts',
      'src/nested.ts',
      'src/v1.2.ts',
    ]);
  });

  it('refuses a code subpath that declares no types', () => {
    expect(() =>
      entryPointsFromManifest({ exports: { './bare': './dist/bare.mjs' } })
    ).toThrow(/without a "types" entry/);
  });
});

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

  it('carries the snippet an @example tag documents', () => {
    // The tag map is the only place this survives — docgen strips the tag out
    // of `description`, so a dropped field would read as no example at all.
    expect(propOf('button', 'Button', 'asChild').example).toContain('<Button');
    expect(propOf('badge', 'Badge', 'leftIcon').example).toBeTruthy();
    expect(propOf('badge', 'Badge', 'variant').example).toBeNull();
  });

  it('prints a cva union in the order the component declares it', () => {
    // The member order is whichever the checker interned first, so it shifts if
    // `publicComponents` resolves component types before the docgen parse.
    expect(propOf('button', 'Button', 'variant').type).toBe(
      '"default" | "error" | "destructive" | "outline" | "dashed" | "secondary" | "ghost" | "link" | null'
    );
  });

  it('emits every example as a closed fenced block', () => {
    const examples = allComponents.flatMap((component) =>
      component.props.filter((prop) => prop.example !== null)
    );
    const unfenced = allComponents.flatMap((component) =>
      component.props
        .filter(
          (prop) => prop.example !== null && !FENCED_BLOCK.test(prop.example)
        )
        .map((prop) => `${component.name}.${prop.name}`)
    );

    expect(examples.length).toBeGreaterThan(0);
    expect(unfenced).toEqual([]);
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

  it(
    'clears the files it wrote last run and nothing else',
    { timeout: 120_000 },
    () => {
      const root = mkdtempSync(path.join(tmpdir(), 'nexus-props-clear-'));
      const dir = path.join(root, 'props');
      mkdirSync(dir);

      // A slug the previous run recorded but no folder accounts for any more, a
      // file the generator has no business touching, and a key that is not a slug
      // at all — a conflicted or hand-edited index must not be able to name a
      // path outside the directory it sits in.
      writeFileSync(
        path.join(dir, 'index.json'),
        '{"retired-widget":["X"],"../bystander":["Y"]}\n'
      );
      writeFileSync(path.join(dir, 'retired-widget.json'), '{}\n');
      writeFileSync(path.join(dir, 'package.json'), '{"name":"bystander"}\n');
      writeFileSync(path.join(root, 'bystander.json'), '{"keep":true}\n');

      try {
        runGenerator(dir);

        expect(existsSync(path.join(dir, 'retired-widget.json'))).toBe(false);
        expect(readFileSync(path.join(dir, 'package.json'), 'utf8')).toBe(
          '{"name":"bystander"}\n'
        );
        expect(existsSync(path.join(root, 'bystander.json'))).toBe(true);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  );

  it(
    'treats an index it cannot read as no previous record',
    { timeout: 120_000 },
    () => {
      const dir = mkdtempSync(path.join(tmpdir(), 'nexus-props-conflict-'));
      writeFileSync(
        path.join(dir, 'index.json'),
        '<<<<<<< HEAD\n{"badge":["Badge"]}\n=======\n{}\n>>>>>>> main\n'
      );

      try {
        runGenerator(dir);
        expect(existsSync(path.join(dir, 'badge.json'))).toBe(true);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  );
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
    runGenerator(freshDir);

    const fresh = readdirSync(freshDir).sort(byName);
    expect(fresh).toEqual(readdirSync(generatedDir).sort(byName));

    for (const file of fresh) {
      const generated = readFileSync(path.join(freshDir, file), 'utf8');
      expect(generated, file).toBe(read(file));
    }
  });
});
