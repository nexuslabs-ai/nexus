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
import ts from 'typescript';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  assertWorkspaceTypes,
  exportName,
  importedWorkspaceSpecifiers,
  isComponentName,
  isComponentSource,
  isOwnProp,
  isPortableExpansion,
  isRenderable,
  opaqueNamespaceNames,
  publicComponents,
  publicExports,
  toSlugFolder,
} from './props-contract.mjs';
import {
  entryPointsFromManifest,
  reactEntryPoints,
} from './react-entry-points.mjs';
import { docsRoot, reactRoot } from './roots.mjs';

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

function read(dir: string, file: string) {
  return readFileSync(path.join(dir, file), 'utf8');
}

function readEntry(
  dir: string,
  slug: string
): {
  slug: string;
  components: ComponentEntry[];
} {
  return JSON.parse(read(dir, `${slug}.json`));
}

function byName(a: string, b: string) {
  return a.localeCompare(b, 'en');
}

const FENCED_BLOCK = /^```[a-z]*\n[\s\S]*\n```$/;
let generatedDir: string;
let index: Record<string, string[]>;
let slugs: string[];
let entries: { slug: string; components: ComponentEntry[] }[];
let allComponents: ComponentEntry[];

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

/**
 * The guard reports by throwing, so its message is the only thing a caller
 * sees; this reads it back rather than asserting the guard merely fired.
 */
function failureFrom(run: () => void) {
  try {
    run();
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error('the guard accepted a dependency with no declarations');
}

const tempDirs: string[] = [];

function tempDir(prefix: string) {
  const dir = mkdtempSync(path.join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
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
  'export class RenderWidget {',
  '  render() {',
  '    return null;',
  '  }',
  '}',
  'export class PlainClass {',
  "  label = '';",
  '}',
  'export const ConfigWidget = { gap: 4 };',
  'export interface WidgetProps {',
  '  label: string;',
  '}',
  'export const NOT_A_COMPONENT = 1;',
].join('\n');

function buildFixture() {
  const fixtureDir = tempDir('nexus-props-fixture-');

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

  return { checker, program, sourceFile, file, symbols, symbolNamed };
}

let fixture: ReturnType<typeof buildFixture> | null = null;
const fixtureModule = () => (fixture ??= buildFixture());

describe('component export predicates', () => {
  it(
    'counts a call signature, or a construct signature that renders',
    { timeout: 120_000 },
    () => {
      const { checker, symbolNamed } = fixtureModule();

      expect(isRenderable(checker, symbolNamed('FunctionWidget'))).toBe(true);

      // A class component is rendered through `new`, so it carries a construct
      // signature and no call signature at all — but so does every other
      // exported class, and only a component answers to `render`.
      expect(isRenderable(checker, symbolNamed('RenderWidget'))).toBe(true);
      expect(isRenderable(checker, symbolNamed('PlainClass'))).toBe(false);

      expect(isRenderable(checker, symbolNamed('ConfigWidget'))).toBe(false);
      expect(isRenderable(checker, symbolNamed('WidgetProps'))).toBe(false);
    }
  );

  it('declines a symbol carrying no declaration to read a type from', () => {
    // `publicComponents` derefs `symbol.declarations[0]` on everything this
    // admits. Passing no checker proves the guard answers before one is used.
    expect(isRenderable(null, { declarations: undefined })).toBe(false);
    expect(isRenderable(null, { declarations: [] })).toBe(false);
  });

  it(
    'takes the components off the export surface, not every export',
    { timeout: 120_000 },
    () => {
      const { checker, symbols, file } = fixtureModule();
      const componentsRoot = path.dirname(path.dirname(file));

      expect([
        ...publicComponents(checker, symbols, componentsRoot).keys(),
      ]).toEqual(['FunctionWidget', 'RenderWidget']);
    }
  );

  it(
    'refuses a component with no folder of its own to land in',
    { timeout: 120_000 },
    () => {
      const { checker, symbols, file } = fixtureModule();

      // The fixture sits directly in this root, so its components have no
      // folder to become a slug.
      expect(() =>
        publicComponents(checker, symbols, path.dirname(file))
      ).toThrow(/needs a folder of its own/);
    }
  );

  it(
    'refuses an entry point the program never loaded',
    { timeout: 120_000 },
    () => {
      const { checker, program, file } = fixtureModule();
      const absent = path.join(path.dirname(file), 'absent.ts');

      expect(() => publicExports(checker, program, [absent])).toThrow(
        /is not in the program/
      );
    }
  );

  it(
    'reads a file that exports nothing as no entry point',
    { timeout: 120_000 },
    () => {
      const dir = mkdtempSync(path.join(tmpdir(), 'nexus-props-entry-'));
      const file = path.join(dir, 'script.ts');
      writeFileSync(file, 'const local = 1;\n', 'utf8');

      try {
        const program = ts.createProgram([file], {
          noEmit: true,
          skipLibCheck: true,
        });

        expect(() =>
          publicExports(program.getTypeChecker(), program, [file])
        ).toThrow(/exports nothing/);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  );

  it('reads only a component source, not a barrel or a story', () => {
    expect(isComponentSource(path.join('badge', 'badge.tsx'))).toBe(true);
    expect(isComponentSource(path.join('badge', 'use-badge.ts'))).toBe(true);
    expect(isComponentSource(path.join('badge', 'index.ts'))).toBe(false);
    expect(isComponentSource(path.join('badge', 'Badge.stories.tsx'))).toBe(
      false
    );
    expect(isComponentSource(path.join('badge', 'badge.test.ts'))).toBe(false);
    expect(isComponentSource(path.join('badge', 'badge.css'))).toBe(false);
  });

  it('keeps a prop this repo declares and drops an inherited one', () => {
    const local = { declarations: [{ fileName: '/repo/src/badge.tsx' }] };
    const inherited = {
      declarations: [{ fileName: '/repo/node_modules/@radix-ui/index.d.ts' }],
    };

    expect(isOwnProp(local)).toBe(true);
    expect(isOwnProp(inherited)).toBe(false);

    // A `cva` variant key arrives synthesized, carrying neither.
    expect(isOwnProp({ declarations: [], parent: null })).toBe(true);
    expect(isOwnProp({ parent: { name: 'HTMLAttributes' } })).toBe(false);
  });

  it('names a re-export by the name consumers import', () => {
    expect(exportName({ displayName: 'Root' })).toBe('Root');
    expect(
      exportName({
        displayName: 'Root',
        rootExpression: { getName: () => 'Drawer' },
      })
    ).toBe('Drawer');
  });

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

  it('reads a component name as PascalCase, not a screaming-snake constant', () => {
    expect(isComponentName('Button')).toBe(true);
    expect(isComponentName('NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS')).toBe(
      false
    );
    expect(isComponentName('useSidebar')).toBe(false);
  });
});

describe('workspace dependency types', () => {
  it('names only the workspace packages the source binds from', () => {
    const source = ts.createSourceFile(
      'widget.ts',
      [
        "import { tokens } from '@nexus_ds/core';",
        "import { derive } from '@nexus_ds/core/runtime';",
        "export type { Mode } from '@nexus_ds/core';",
        "import { cva } from 'class-variance-authority';",
        "import { cn } from './lib/utils';",
        // Binds nothing, so nothing it fails to type can reach a prop.
        "import '@nexus_ds/tailwind/nexus.css';",
      ].join('\n'),
      ts.ScriptTarget.ES2020,
      true
    );

    expect(
      importedWorkspaceSpecifiers([source], {
        dependencies: {
          '@nexus_ds/core': 'workspace:*',
          'class-variance-authority': '^0.7.1',
        },
        peerDependencies: { '@nexus_ds/tailwind': 'workspace:*' },
      })
    ).toEqual(['@nexus_ds/core', '@nexus_ds/core/runtime']);
  });

  it('refuses a dependency that resolves to no declarations', () => {
    const root = tempDir('nexus-props-types-');

    const dependency = (name: string, target: Record<string, string>) => {
      const dir = path.join(root, 'node_modules', name);
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        path.join(dir, 'package.json'),
        JSON.stringify({
          name,
          version: '0.0.0',
          exports: { '.': { import: target } },
        })
      );
      for (const file of Object.values(target)) {
        writeFileSync(path.join(dir, file), '');
      }
    };

    dependency('typed', { types: './index.d.ts', default: './index.js' });
    // tsup writes JavaScript and declarations in separate passes, so a failed
    // declaration pass leaves the package importable and type-less — and
    // `allowJs` then types every prop reached through it as `any` without a
    // single unresolved-module error to show for it.
    dependency('js-only', { default: './index.js' });

    const caller = path.join(root, 'caller.ts');
    const options = {
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      allowJs: true,
    };

    expect(() =>
      assertWorkspaceTypes(['typed'], options, caller)
    ).not.toThrow();
    expect(() => assertWorkspaceTypes([], options, caller)).not.toThrow();

    expect(
      failureFrom(() =>
        assertWorkspaceTypes(['js-only', 'absent'], options, caller)
      ).split('\n')
    ).toEqual([
      'props JSON: a workspace dependency resolves to no type declarations, so every prop typed through it would be documented as `any`.',
      'Build the workspace dependencies first: pnpm turbo build --filter=@nexus_ds/react^...',
      '  js-only',
      '  absent',
    ]);
  });
});

describe('react entry points', () => {
  const relative = (entry: string) =>
    path.relative(reactRoot, entry).split(path.sep).join('/');

  it('takes one entry point per subpath that resolves to code', () => {
    // Declared out of alphabetical order: the generator feeds these to
    // `ts.createProgram`, whose input order decides which union member the
    // checker interns first, so the sort is what keeps the output stable.
    const entries = entryPointsFromManifest({
      exports: {
        './v1.2': { types: './dist/v1.2.d.ts', import: './dist/v1.2.mjs' },
        './nested': {
          import: { types: './dist/nested.d.ts', default: './dist/nested.mjs' },
        },
        '.': { types: './dist/index.d.ts', import: './dist/index.mjs' },
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

  it('reads types by condition priority, not by the order they are listed', () => {
    const priority = ['import', 'module', 'require', 'node', 'default'];

    const declaration = (condition: string): [string, unknown] => [
      condition,
      {
        types: `./dist/${condition}.d.ts`,
        default: `./dist/${condition}.mjs`,
      },
    ];

    // Each manifest declares its conditions in reverse priority order, so only
    // the priority walk can pick the expected winner — listing order would
    // always yield the last entry instead. `browser` leads every round: a
    // condition the list does not name still has to lose to every one it does,
    // so dropping a rung fails the round that starts at it, and walking the
    // unnamed conditions ahead of the named ones fails all five.
    for (let i = 0; i < priority.length; i += 1) {
      const remaining = priority.slice(i);
      const target = Object.fromEntries([
        declaration('browser'),
        ...[...remaining].reverse().map(declaration),
      ]);

      const entries = entryPointsFromManifest({ exports: { '.': target } });

      expect(entries.map(relative)).toEqual([`src/${remaining[0]}.ts`]);
    }
  });

  it('reads types under a condition the priority list does not name', () => {
    const entries = entryPointsFromManifest({
      exports: {
        './browser-only': {
          browser: {
            types: './dist/browser.d.ts',
            default: './dist/browser.mjs',
          },
        },
        './array-fallback': [
          { types: './dist/array.d.ts', default: './dist/array.mjs' },
        ],
      },
    });

    expect(entries.map(relative)).toEqual(['src/array.ts', 'src/browser.ts']);
  });

  it('refuses a code subpath that declares no types', () => {
    expect(() =>
      entryPointsFromManifest({ exports: { './bare': './dist/bare.mjs' } })
    ).toThrow(/without a "types" entry/);
  });
});

describe('docs props data', () => {
  // The output is a build artifact, not a committed file: what the suite
  // measures is what a run of the generator produces right now.
  beforeAll(() => {
    generatedDir = tempDir('nexus-props-');
    runGenerator(generatedDir);

    index = JSON.parse(read(generatedDir, 'index.json'));
    slugs = Object.keys(index);
    entries = slugs.map((slug) => readEntry(generatedDir, slug));
    allComponents = entries.flatMap((entry) => entry.components);
  }, 120_000);

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

      // A slug no folder accounts for any more, next to two files the generator
      // has no business touching — one of them named exactly as a slug file
      // would be.
      writeFileSync(path.join(dir, 'index.json'), '{"retired-widget":["X"]}\n');
      writeFileSync(
        path.join(dir, 'retired-widget.json'),
        '{"slug":"retired-widget","components":[]}\n'
      );
      writeFileSync(path.join(dir, 'package.json'), '{"name":"bystander"}\n');
      writeFileSync(
        path.join(dir, 'badge.json.bak'),
        '{"slug":"badge.json","components":[]}\n'
      );

      try {
        runGenerator(dir);

        expect(existsSync(path.join(dir, 'retired-widget.json'))).toBe(false);
        expect(readFileSync(path.join(dir, 'package.json'), 'utf8')).toBe(
          '{"name":"bystander"}\n'
        );
        expect(existsSync(path.join(dir, 'badge.json.bak'))).toBe(true);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  );

  it(
    'clears an orphan even when the index cannot be read',
    { timeout: 120_000 },
    () => {
      const dir = mkdtempSync(path.join(tmpdir(), 'nexus-props-conflict-'));

      // The index is tracked, so it can arrive merge-conflicted. The files it
      // would have named are recognised from their own bodies instead.
      writeFileSync(
        path.join(dir, 'index.json'),
        '<<<<<<< HEAD\n{"retired-widget":["X"]}\n=======\n{}\n>>>>>>> main\n'
      );
      writeFileSync(
        path.join(dir, 'retired-widget.json'),
        '{"slug":"retired-widget","components":[]}\n'
      );

      try {
        runGenerator(dir);

        expect(existsSync(path.join(dir, 'retired-widget.json'))).toBe(false);
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
    const drawer = readEntry(generatedDir, 'drawer').components.map(
      (c) => c.name
    );

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
      const raw = read(generatedDir, file);
      expect(`${JSON.stringify(JSON.parse(raw), null, 2)}\n`, file).toBe(raw);
    }
  });

  // Two runs over the same tree have to agree byte for byte: a union prints
  // its members in whichever order the checker interned them, and the docs
  // build would otherwise turn that ordering into a cache miss.
  it('is byte-identical across runs', { timeout: 120_000 }, () => {
    const repeat = tempDir('nexus-props-repeat-');
    runGenerator(repeat);

    const files = readdirSync(repeat).sort(byName);
    expect(files).toEqual(readdirSync(generatedDir).sort(byName));

    for (const file of files) {
      expect(read(repeat, file), file).toBe(read(generatedDir, file));
    }
  });
});
