/**
 * Parses `*.stories.tsx` files: their imports, declarations, stories and meta,
 * which stories are tagged `docs`, and the page description the meta sets.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { collectSourceFiles } from './files.mjs';
import { pascal } from './humanize.ts';
import { componentsRoot, toRepoPath } from './roots.mjs';

export const DOCS_TAG = 'docs';

export function unwrap(node: ts.Node): ts.Node;
export function unwrap(node: ts.Node | undefined): ts.Node | undefined;
export function unwrap(node: ts.Node | undefined) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

export function propertyKey(name: ts.PropertyName) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return name.getText();
}

function tagsOf(object: ts.ObjectLiteralExpression) {
  const property = object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) &&
      propertyKey(candidate.name) === 'tags'
  );
  if (!property || !ts.isPropertyAssignment(property)) return [];
  const array = unwrap(property.initializer);
  if (!ts.isArrayLiteralExpression(array)) return [];
  return array.elements.filter(ts.isStringLiteral).map((tag) => tag.text);
}

export function propertiesOf(
  object: ts.ObjectLiteralExpression,
  where: string
): Map<string, ts.Node> {
  const properties = new Map<string, ts.Node>();
  for (const property of object.properties) {
    if (ts.isSpreadAssignment(property)) {
      throw new Error(
        `${where} spreads \`${property.expression.getText()}\` — write its properties out.`
      );
    }
    if (ts.isShorthandPropertyAssignment(property)) {
      properties.set(property.name.text, property.name);
    } else if (ts.isPropertyAssignment(property)) {
      properties.set(propertyKey(property.name), property.initializer);
    } else if (ts.isMethodDeclaration(property)) {
      properties.set(propertyKey(property.name), property);
    }
  }
  return properties;
}

export function isPlainString(
  node: ts.Node
): node is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

/** `['a', 'b'].join(' ')` as its value, or null for any other expression. */
function joinedStrings(node: ts.Node): string | null {
  if (!ts.isCallExpression(node)) return null;
  const callee = node.expression;
  if (!ts.isPropertyAccessExpression(callee) || callee.name.text !== 'join') {
    return null;
  }
  const array = unwrap(callee.expression);
  const [separator] = node.arguments;
  if (!ts.isArrayLiteralExpression(array)) return null;
  if (!separator || !isPlainString(separator)) return null;
  const strings = array.elements.filter(isPlainString);
  if (strings.length !== array.elements.length) return null;
  return strings.map((element) => element.text).join(separator.text);
}

/**
 * `parameters.docs.description[kind]` on a meta or story, or null when unset.
 * Throws when a step on that path is not written inline.
 */
export function docsDescription(
  object: ts.ObjectLiteralExpression,
  kind: 'component' | 'story',
  where: string
): string | null {
  const notInline = new Error(
    `${where} its \`parameters.docs.description.${kind}\` is not written inline — use object literals, without spreads or shorthand, down to a string literal or a \`[…].join(…)\` of them.`
  );
  let current: ts.Node = object;
  for (const key of ['parameters', 'docs', 'description', kind]) {
    const level = unwrap(current);
    if (!ts.isObjectLiteralExpression(level)) throw notInline;
    if (level.properties.some(ts.isSpreadAssignment)) throw notInline;
    const property = level.properties.find(
      (candidate) =>
        !ts.isSpreadAssignment(candidate) && propertyKey(candidate.name) === key
    );
    if (!property) return null;
    if (!ts.isPropertyAssignment(property)) throw notInline;
    current = property.initializer;
  }
  const value = unwrap(current);
  const text = isPlainString(value) ? value.text : joinedStrings(value);
  if (text === null) throw notInline;
  const unsupported = unsupportedMarkdown(text);
  if (unsupported) {
    throw new Error(
      `${where} its \`parameters.docs.description.${kind}\` uses ${unsupported}, which the docs page shows as raw text. Use paragraphs, \`- \` lists and \`code\` only.`
    );
  }
  return text;
}

/**
 * Names the first Markdown in `text` that DescriptionText doesn't render, or
 * null. Code spans are skipped, so their contents can hold any characters.
 */
function unsupportedMarkdown(text: string) {
  const prose = text.replace(/`[^`]*`/g, '');
  if (/\*\*|__/.test(prose)) return 'bold';
  if (/\[[^\]]*\]\([^)]*\)/.test(prose)) return 'a link';
  if (/^\s*#{1,6}\s/m.test(prose)) return 'a heading';
  if (/^\s*>/m.test(prose)) return 'a blockquote';
  if (/^\s*(\d+\.|\*)\s/m.test(prose)) return 'a list marker other than `- `';
  if (/(^|[\s(])[*_][^\s*_][^*_]*[*_](?=[\s.,;:!?)]|$)/m.test(prose)) {
    return 'emphasis';
  }
  return null;
}

function boundNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text];
  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : boundNames(element.name)
  );
}

function hasExportModifier(statement: ts.Node) {
  return (
    ts.canHaveModifiers(statement) &&
    (ts.getModifiers(statement) ?? []).some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    )
  );
}

export interface ImportBinding {
  module: string;
  kind: 'default' | 'namespace' | 'named';
  imported: string;
  typeOnly: boolean;
}

export interface StoriesFile {
  path: string;
  imports: Map<string, ImportBinding>;
  declarations: Map<string, ts.Statement>;
  stories: { name: string; object: ts.ObjectLiteralExpression }[];
  meta: ts.ObjectLiteralExpression;
  metaName: string;
}

export function parseStoriesFile(filePath: string): StoriesFile {
  const sourceFile = ts.createSourceFile(
    filePath,
    readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const imports = new Map<string, ImportBinding>();
  const declarations = new Map<string, ts.Statement>();
  const initializers = new Map<string, ts.Expression | undefined>();
  const stories: StoriesFile['stories'] = [];
  let metaName: string | undefined;

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;
      if (!clause || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const module = statement.moduleSpecifier.text;
      if (clause.name) {
        imports.set(clause.name.text, {
          module,
          kind: 'default',
          imported: 'default',
          typeOnly: clause.isTypeOnly,
        });
      }
      const bindings = clause.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) {
        imports.set(bindings.name.text, {
          module,
          kind: 'namespace',
          imported: '*',
          typeOnly: clause.isTypeOnly,
        });
      } else if (bindings) {
        for (const element of bindings.elements) {
          imports.set(element.name.text, {
            module,
            kind: 'named',
            imported: (element.propertyName ?? element.name).text,
            typeOnly: clause.isTypeOnly || element.isTypeOnly,
          });
        }
      }
      continue;
    }
    if (ts.isExportAssignment(statement)) {
      const exported = unwrap(statement.expression);
      if (ts.isIdentifier(exported)) metaName = exported.text;
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        for (const name of boundNames(declaration.name)) {
          declarations.set(name, statement);
          initializers.set(name, declaration.initializer);
        }
        const object = unwrap(declaration.initializer);
        if (
          hasExportModifier(statement) &&
          ts.isIdentifier(declaration.name) &&
          object &&
          ts.isObjectLiteralExpression(object)
        ) {
          stories.push({ name: declaration.name.text, object });
        }
      }
      continue;
    }
    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isEnumDeclaration(statement)) &&
      statement.name
    ) {
      declarations.set(statement.name.text, statement);
    }
  }

  const meta = metaName ? unwrap(initializers.get(metaName)) : undefined;
  if (!metaName || !meta || !ts.isObjectLiteralExpression(meta)) {
    throw new Error(
      `${toRepoPath(filePath)}: its default export is not a variable holding the meta object — declare \`const meta = { … }\` and \`export default meta;\`.`
    );
  }
  return { path: filePath, imports, declarations, stories, meta, metaName };
}

export interface DocsStory {
  slug: string;
  file: StoriesFile;
  name: string;
  object: ts.ObjectLiteralExpression;
}

/** Every `*.stories.tsx` under `components/{slug}/`, sorted. */
export function componentStoryFiles(slug: string): string[] {
  return collectSourceFiles(path.join(componentsRoot, slug), (file: string) =>
    file.endsWith('.stories.tsx')
  ).sort();
}

/** Every story in `files` tagged `docs`, in file order, for the page `slug`. */
export function readDocsStories(slug: string, files: string[]): DocsStory[] {
  return files.flatMap((filePath) => {
    const file = parseStoriesFile(filePath);
    if (tagsOf(file.meta).includes(DOCS_TAG)) {
      throw new Error(
        `${toRepoPath(filePath)}: meta is tagged \`${DOCS_TAG}\` — tag the stories a component page should show, not the whole file.`
      );
    }
    return file.stories
      .filter((story) => tagsOf(story.object).includes(DOCS_TAG))
      .map((story) => ({ slug, file, name: story.name, object: story.object }));
  });
}

/**
 * The page description for `slug`: the meta's `docs.description.component` in
 * `{Slug}.stories.tsx`, else in the first of `files` that has one.
 */
export function componentDescription(slug: string, files: string[]): string {
  const ownName = `${pascal(slug)}.stories.tsx`;
  const own = files.find((filePath) => path.basename(filePath) === ownName);
  const ordered = own
    ? [own, ...files.filter((filePath) => filePath !== own)]
    : files;
  for (const filePath of ordered) {
    const description = docsDescription(
      parseStoriesFile(filePath).meta,
      'component',
      `${toRepoPath(filePath)}: the meta describes the ${slug} page, but`
    );
    if (description !== null) return description;
  }
  throw new Error(
    `The ${slug} page has no description — set \`parameters.docs.description.component\` on the meta in ${files.map(toRepoPath).join(' or ')}.`
  );
}
