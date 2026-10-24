// Builds the Vue side of every component page from packages/vue, under
// generated/vue/ (generate:demos prunes anything it didn't write in __generated__):
//   demos/{slug}/{story}.vue    each story tagged `docs`, as a single-file component
//   entry.js                    mounts a demo by id; bundle:vue compiles it for the live previews
//   docs.ts                     titles, captions, sources and imports
//   props/{slug}.json           each part's own props
// usage: node scripts/generate-vue-docs.ts
import { vue, vueWalks } from '@nxds/catalog/scripts/dependency-plans.mjs';
import { packageName } from '@nxds/catalog/scripts/install-plans.ts';
import { humanize } from '@nxds/source-model/humanize.ts';
import {
  type PropsFile,
  toPropsIndex,
} from '@nxds/source-model/props-entries.ts';
import {
  toRepoPath,
  vueComponentsRoot,
  vueSrc,
} from '@nxds/source-model/roots.mjs';
import {
  componentProps,
  createVueProgram,
  exportedSlugs,
  parseFile,
} from '@nxds/source-model/vue-sources.ts';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';
import ts from 'typescript';

import { docsRoot } from './docs-root.mjs';

interface SetupValue {
  name: string;
  value: ts.Expression;
}

interface DocsStory {
  id: string;
  title: string;
  description: string | null;
  byModule: Map<string, string[]>;
  source: Promise<string>;
}

interface VueDemo {
  id: string;
  title: string;
  description: string | null;
  source: string;
  alsoInstall: string[];
  packages: string[];
}

interface VueComponentDocs {
  description: string;
  preview: string;
  examples: string[];
  imports: string;
}

const outputDir = path.join(docsRoot, 'generated', 'vue');
const demosDir = path.join(outputDir, 'demos');
const propsDir = path.join(outputDir, 'props');

const prettierConfig =
  (await prettier.resolveConfig(path.join(vueSrc, 'index.ts'))) ?? {};

function fail(message: string): never {
  throw new Error(`generate-vue-docs: ${message}`);
}

function kebab(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function unwrap(node: ts.Expression): ts.Expression {
  let current = node;
  while (
    ts.isSatisfiesExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function property(object: ts.ObjectLiteralExpression, name: string) {
  const found = object.properties.find(
    (prop) =>
      (ts.isPropertyAssignment(prop) ||
        ts.isShorthandPropertyAssignment(prop)) &&
      prop.name.getText() === name
  );
  if (!found) return undefined;
  return ts.isPropertyAssignment(found) ? unwrap(found.initializer) : found;
}

/** `parameters.docs.description.{key}` as a string, or null. */
function docsDescription(object: ts.ObjectLiteralExpression, key: string) {
  let node: ts.Node | undefined = object;
  for (const name of ['parameters', 'docs', 'description', key]) {
    if (!node || !ts.isObjectLiteralExpression(node)) return null;
    node = property(node, name);
  }
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text.trim();
  }
  return null;
}

function dedent(text: string) {
  const lines = text.replace(/^\n+|\s+$/g, '').split('\n');
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.search(/\S/))
  );
  return lines.map((line) => line.slice(indent)).join('\n');
}

/** Where an import in a story file points, as the reader writes it. */
function readerModule(specifier: string, slug: string) {
  if (specifier === '.') return `@/components/${slug}`;
  const sibling = specifier.match(/^\.\.\/([\w-]+)$/);
  if (sibling) return `@/components/${sibling[1]}`;
  if (specifier.startsWith('.')) {
    fail(
      `${slug}: docs stories import components as '.' or '../{slug}', not '${specifier}'.`
    );
  }
  return specifier;
}

/** The names `node` reads, leaving out property names such as `b` in `a.b`. */
function referencedNames(node: ts.Node, names = new Set<string>()) {
  if (ts.isIdentifier(node)) {
    const { parent } = node;
    const isPropertyName =
      (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
      (ts.isPropertyAssignment(parent) && parent.name === node);
    if (!isPropertyName) names.add(node.text);
  }
  ts.forEachChild(node, (child) => {
    referencedNames(child, names);
  });
  return names;
}

/** The stories tagged `docs` in one component's story file. */
function readDocsStories(slug: string) {
  const dir = path.join(vueComponentsRoot, slug);
  const file = readdirSync(dir).find((name) => name.endsWith('.stories.ts'));
  if (!file) return null;

  const filePath = path.join(dir, file);
  const source = parseFile(filePath);

  const imported = new Map<string, string>();
  let meta: ts.ObjectLiteralExpression | undefined;
  const stories: { name: string; object: ts.ObjectLiteralExpression }[] = [];

  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      const bindings = statement.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) continue;
      if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const specifier = statement.moduleSpecifier.text;
      for (const element of bindings.elements) {
        if (!element.isTypeOnly) imported.set(element.name.text, specifier);
      }
      continue;
    }
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      const init = declaration.initializer && unwrap(declaration.initializer);
      if (!init || !ts.isObjectLiteralExpression(init)) continue;
      const name = declaration.name.getText();
      if (name === 'meta') {
        meta = init;
        continue;
      }
      const tags = property(init, 'tags');
      const isDocs =
        tags &&
        ts.isArrayLiteralExpression(tags) &&
        tags.elements.some(
          (tag) => ts.isStringLiteral(tag) && tag.text === 'docs'
        );
      if (isDocs) stories.push({ name, object: init });
    }
  }

  if (stories.length === 0) return null;
  if (!meta) fail(`${toRepoPath(filePath)} has no \`const meta\`.`);

  return {
    description: docsDescription(meta, 'component') ?? '',
    stories: stories.map(({ name, object }) =>
      readStory(slug, name, object, imported)
    ),
  };
}

/** One docs story as an SFC: its components' imports, its setup state and its template. */
function readStory(
  slug: string,
  name: string,
  object: ts.ObjectLiteralExpression,
  imported: Map<string, string>
): DocsStory {
  const where = `${slug}/${name}`;
  const render = property(object, 'render');
  if (
    !render ||
    !ts.isArrowFunction(render) ||
    render.parameters.length > 0 ||
    ts.isBlock(render.body)
  ) {
    fail(
      `${where}: a docs story needs its own \`render: () => ({ … })\`, with no args.`
    );
  }
  const body = unwrap(render.body);
  if (!ts.isObjectLiteralExpression(body)) {
    fail(`${where}: render must return an object literal.`);
  }

  const template = property(body, 'template');
  if (
    !template ||
    !(
      ts.isNoSubstitutionTemplateLiteral(template) ||
      ts.isStringLiteral(template)
    )
  ) {
    fail(`${where}: render needs a plain \`template\` string.`);
  }

  const components = property(body, 'components');
  if (!components || !ts.isObjectLiteralExpression(components)) {
    fail(`${where}: render needs \`components: { … }\`.`);
  }
  const componentNames = components.properties.map((prop) => {
    if (!ts.isShorthandPropertyAssignment(prop)) {
      fail(`${where}: list components by name, as \`{ Button }\`.`);
    }
    return prop.name.text;
  });

  const state: SetupValue[] = [];
  const setup = property(body, 'setup');
  if (setup) {
    const returned =
      ts.isArrowFunction(setup) &&
      !ts.isBlock(setup.body) &&
      unwrap(setup.body);
    if (!returned || !ts.isObjectLiteralExpression(returned)) {
      fail(`${where}: setup must be \`() => ({ name: value })\`.`);
    }
    for (const prop of returned.properties) {
      if (!ts.isPropertyAssignment(prop)) {
        fail(
          `${where}: setup values need a name and a value, as \`open: ref(true)\`.`
        );
      }
      state.push({ name: prop.name.getText(), value: prop.initializer });
    }
  }

  const stateNames = new Set(
    state.flatMap(({ value }) => [...referencedNames(value)])
  );
  const used = [
    ...componentNames,
    ...[...imported.keys()].filter((id) => stateNames.has(id)),
  ];

  const byModule = new Map<string, string[]>();
  for (const id of used) {
    const specifier =
      imported.get(id) ??
      fail(`${where}: \`${id}\` is not imported in the story file.`);
    const module = readerModule(specifier, slug);
    byModule.set(module, [...(byModule.get(module) ?? []), id]);
  }

  return {
    id: `${slug}/${kebab(name)}`,
    title: humanize(kebab(name)),
    description: docsDescription(object, 'story'),
    byModule,
    source: sfc(byModule, state, dedent(template.text)),
  };
}

function sfc(
  byModule: Map<string, string[]>,
  state: SetupValue[],
  template: string
) {
  const line = (module: string) =>
    `import { ${[...new Set(byModule.get(module))].sort().join(', ')} } from '${module}';`;
  const modules = [...byModule.keys()].sort();
  const packages = modules
    .filter((module) => !module.startsWith('@/'))
    .map(line);
  const local = modules.filter((module) => module.startsWith('@/')).map(line);

  const script = [
    packages.join('\n'),
    local.join('\n'),
    state
      .map(({ name, value }) => `const ${name} = ${value.getText()};`)
      .join('\n'),
  ].filter(Boolean);

  const indented = template
    .split('\n')
    .map((row) => (row ? `  ${row}` : row))
    .join('\n');

  return prettier.format(
    `<script setup lang="ts">\n${script.join('\n\n')}\n</script>\n\n<template>\n${indented}\n</template>\n`,
    { ...prettierConfig, parser: 'vue' }
  );
}

// ── Write everything ────────────────────────────────────────────────────────

const slugs = exportedSlugs();
const closures = vueWalks(slugs);
const componentDocs: Record<string, VueComponentDocs> = {};
const demos: Record<string, VueDemo> = {};

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(propsDir, { recursive: true });

const vueProgram = createVueProgram();
const propsFiles: PropsFile[] = [];

for (const slug of slugs) {
  const docs = readDocsStories(slug);
  if (!docs) continue;

  const walked = closures.get(slug) ?? fail(`${slug} has no source files.`);
  /** Every package installing the component brings, its components' included. */
  const brings = new Set(walked.packages);

  const propsFile = componentProps(vueProgram, slug);
  propsFiles.push(propsFile);
  writeFileSync(
    path.join(propsDir, `${slug}.json`),
    `${JSON.stringify(propsFile, null, 2)}\n`
  );

  const pageImports = new Set<string>();
  for (const story of docs.stories) {
    const alsoInstall = [...story.byModule.keys()]
      .map((module) => module.match(/^@\/components\/([\w-]+)$/)?.[1])
      .filter(
        (other): other is string => other !== undefined && other !== slug
      );
    const packages = [...story.byModule.keys()]
      .filter((module) => !module.startsWith('@/') && module !== 'vue')
      .map(packageName)
      .filter((name) => !brings.has(name))
      .map((name) => `${name}@${vue.publishedRange(name)}`);

    const source = await story.source;
    demos[story.id] = {
      id: story.id,
      title: story.title,
      description: story.description,
      source,
      alsoInstall,
      packages,
    };
    const demoFile = path.join(demosDir, `${story.id}.vue`);
    mkdirSync(path.dirname(demoFile), { recursive: true });
    writeFileSync(demoFile, source);

    for (const part of story.byModule.get(`@/components/${slug}`) ?? []) {
      pageImports.add(part);
    }
  }

  const [preview, ...examples] = docs.stories.map(({ id }) => id);
  componentDocs[slug] = {
    description: docs.description,
    preview: preview ?? fail(`${slug} has no docs stories.`),
    examples,
    imports: `import { ${[...pageImports].sort().join(', ')} } from '@/components/${slug}';`,
  };
}

writeFileSync(
  path.join(propsDir, 'index.json'),
  `${JSON.stringify(toPropsIndex(propsFiles), null, 2)}\n`
);

writeFileSync(
  path.join(outputDir, 'docs.ts'),
  `// Generated by apps/docs/scripts/generate-vue-docs.ts — do not edit.
// Run \`pnpm --filter @nxds/docs generate:vue\` to regenerate.

export interface VueDemo {
  /** \`{slug}/{story}\` for a Vue story tagged \`docs\`. */
  id: string;
  title: string;
  description: string | null;
  /** The demo as the single-file component a reader copies. */
  source: string;
  /** Components the demo needs beyond its own. */
  alsoInstall: readonly string[];
  /** \`name@range\` packages it imports that its component doesn't install. */
  packages: readonly string[];
}

export interface VueComponentDocs {
  description: string;
  preview: string;
  examples: readonly string[];
  imports: string;
}

export const vueDemos: Record<string, VueDemo> = ${JSON.stringify(demos, null, 2)};

export const vueComponentDocs: Record<string, VueComponentDocs> = ${JSON.stringify(componentDocs, null, 2)};
`
);

writeFileSync(
  path.join(outputDir, 'entry.js'),
  `import { createApp } from 'vue';

const demos = {
${Object.keys(demos)
  .map((id) => `  ${JSON.stringify(id)}: () => import('./demos/${id}.vue'),`)
  .join('\n')}
};

/** Mounts one docs demo into \`element\`. Returns the unmount. */
export async function mount(element, id) {
  const load = demos[id];
  if (!load) throw new Error(\`No Vue demo "\${id}".\`);
  const app = createApp((await load()).default);
  app.mount(element);
  return () => app.unmount();
}
`
);

console.log(
  `Vue docs: ${Object.keys(componentDocs).length} components, ${Object.keys(demos).length} demos -> ${toRepoPath(outputDir)}`
);
