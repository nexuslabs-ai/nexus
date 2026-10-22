// What @nxds/vue exports and the props of each component, as the docs and the
// cross-framework parity tests read them.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createChecker, type PropertyMeta } from 'vue-component-meta';

import { importSpecifiers } from './files.mjs';
import {
  type ComponentEntry,
  literalDefaultValue,
  type PropsFile,
  toPropsFile,
} from './props-entries.ts';
import {
  isUnder,
  toRepoPath,
  vueComponentsRoot,
  vueRoot,
  vueSrc,
} from './roots.mjs';

const COMPONENT_SPECIFIER = './components/';

export type VueChecker = ReturnType<typeof createChecker>;

function fail(message: string): never {
  throw new Error(`vue-sources: ${message}`);
}

export function parseFile(filePath: string) {
  return ts.createSourceFile(
    filePath,
    readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
}

/** Every component folder packages/vue exports, in export order. */
export function exportedSlugs() {
  const index = readFileSync(path.join(vueSrc, 'index.ts'), 'utf8');
  return importSpecifiers(index)
    .filter((specifier) => specifier.startsWith(COMPONENT_SPECIFIER))
    .map((specifier) => {
      const [slug] = specifier.slice(COMPONENT_SPECIFIER.length).split('/');
      return slug ?? fail(`src/index.ts exports '${specifier}'.`);
    });
}

/** The SFCs a component folder exports as `default as Name`, in export order. */
export function exportedParts(slug: string) {
  const index = parseFile(path.join(vueComponentsRoot, slug, 'index.ts'));
  return index.statements.flatMap((statement) => {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !statement.moduleSpecifier.text.endsWith('.vue') ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    ) {
      return [];
    }
    const file = path.join(
      vueComponentsRoot,
      slug,
      statement.moduleSpecifier.text
    );
    return statement.exportClause.elements
      .filter((element) => element.propertyName?.text === 'default')
      .map((element) => ({ name: element.name.text, file }));
  });
}

export function createVueChecker(): VueChecker {
  return createChecker(path.join(vueRoot, 'tsconfig.json'), {
    forceUseTs: true,
    printer: { newLine: ts.NewLineKind.LineFeed },
  });
}

/** A prop's `withDefaults` value, held to the React props contract: a literal or nothing. */
function propDefault(prop: PropertyMeta, owner: string) {
  return prop.default === undefined
    ? null
    : literalDefaultValue(prop.default, owner);
}

/** Whether a prop or event is declared in @nxds/vue rather than inherited from a dependency. */
export function isOwnDeclaration(declarations: { file: string }[]) {
  return declarations.some(({ file }) => isUnder(file, vueSrc));
}

/** Each part a component folder exports, with its `vue-component-meta` read once. */
export function componentParts(checker: VueChecker, slug: string) {
  return exportedParts(slug).map(({ name, file }) => ({
    name,
    file,
    meta: checker.getComponentMeta(file),
  }));
}

export type VuePart = ReturnType<typeof componentParts>[number];

export function partEntry({ name, file, meta }: VuePart): ComponentEntry {
  return {
    name,
    description: '',
    sourcePath: toRepoPath(file),
    props: meta.props
      .filter(
        (prop) => !prop.global && isOwnDeclaration(prop.getDeclarations())
      )
      .map((prop) => ({
        name: prop.name,
        type: prop.type.replace(/\s*\|\s*undefined$/, ''),
        required: prop.required,
        defaultValue: propDefault(prop, `${name}.${prop.name}`),
        description: prop.description,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'en')),
  };
}

export function componentProps(checker: VueChecker, slug: string): PropsFile {
  return toPropsFile(slug, componentParts(checker, slug).map(partEntry));
}
