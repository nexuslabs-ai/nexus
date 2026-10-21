/**
 * Reads the stories tagged `docs` and turns each into the copy-pasteable
 * module a component page shows and runs.
 *
 * A docs story is an exported story object whose own `tags` contain `docs`.
 * The first one in file order is the page's preview; the rest are its
 * examples. Its code is the story's render (or the meta's, or
 * `<meta.component {...args} />`) with args written in as literals, wrapper
 * decorators applied, and only the imports and file-local helpers it uses.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import prettier, { type Options as PrettierOptions } from 'prettier';
import ts from 'typescript';

import { collectSourceFiles } from './files.mjs';
import { humanize, pascal } from './humanize.ts';
import { componentsRoot, isUnder, reactSrc, toRepoPath } from './roots.mjs';

export const DOCS_TAG = 'docs';

// TODO(#796): give Appearance a preview once appearance can be scoped to `[data-nxds-root]`.
/** Components whose page has no preview, keyed to the reason. */
export const PREVIEWLESS_COMPONENTS = new Map([
  [
    'appearance',
    'its editor components need the appearance provider, and a provider on the page would restyle the docs site',
  ],
]);

type Edit = [start: number, end: number, replacement: string];

const STORYBOOK_MODULE = /^(?:storybook(?:\/|$)|@storybook\/)/;
const SPY_MODULE = 'storybook/test';

function unwrap(node: ts.Node): ts.Node;
function unwrap(node: ts.Node | undefined): ts.Node | undefined;
function unwrap(node: ts.Node | undefined) {
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

function propertyKey(name: ts.PropertyName) {
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

function propertiesOf(
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

function isPlainString(
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
function docsDescription(
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

interface ImportBinding {
  module: string;
  kind: 'default' | 'namespace' | 'named';
  imported: string;
  typeOnly: boolean;
}

interface StoriesFile {
  path: string;
  imports: Map<string, ImportBinding>;
  declarations: Map<string, ts.Statement>;
  stories: { name: string; object: ts.ObjectLiteralExpression }[];
  meta: ts.ObjectLiteralExpression;
  metaName: string;
}

function parseStoriesFile(filePath: string): StoriesFile {
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

interface DocsStory {
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

/** `DefaultOpen` → `default-open`. */
function kebab(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function docsStoryId(story: DocsStory) {
  return `${story.slug}/${kebab(story.name)}`;
}

function docsStoryTitle(story: DocsStory) {
  const name = story.object.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) && propertyKey(property.name) === 'name'
  );
  if (
    name &&
    ts.isPropertyAssignment(name) &&
    ts.isStringLiteral(name.initializer)
  ) {
    return name.initializer.text;
  }
  return humanize(kebab(story.name));
}

/** Applies non-overlapping `[start, end, text]` edits that fall inside `node`. */
function textWithEdits(node: ts.Node, edits: Edit[]) {
  const start = node.getStart();
  let text = node.getText();
  const inside = edits
    .filter(([from, to]) => from >= start && to <= node.getEnd())
    .sort((a, b) => b[0] - a[0]);
  for (const [from, to, replacement] of inside) {
    text = text.slice(0, from - start) + replacement + text.slice(to - start);
  }
  return text;
}

function isDropped(value: ts.Node | undefined, file: StoriesFile) {
  const node = unwrap(value);
  if (!node) return true;
  if (ts.isIdentifier(node) && node.text === 'undefined') return true;
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    file.imports.get(node.expression.text)?.module === SPY_MODULE
  );
}

const ESCAPE_IN_JSX_STRING = /["&\\\n]/;
const ESCAPE_IN_JSX_TEXT = /[{}<>&]/;

/** The JSX attribute an arg becomes, or '' when it has no value to show. */
function attributeText(
  name: string,
  value: ts.Node | undefined,
  file: StoriesFile
) {
  if (!value || isDropped(value, file)) return '';
  const node = unwrap(value);
  if (isPlainString(node) && !ESCAPE_IN_JSX_STRING.test(node.text)) {
    return `${name}="${node.text}"`;
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return name;
  return `${name}={${node.getText()}}`;
}

function childText(value: ts.Node | undefined, file: StoriesFile) {
  if (!value || isDropped(value, file)) return '';
  const node = unwrap(value);
  if (isPlainString(node) && !ESCAPE_IN_JSX_TEXT.test(node.text)) {
    return node.text;
  }
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
    return node.getText();
  }
  if (ts.isJsxFragment(node)) return node.getText();
  return `{${node.getText()}}`;
}

function spreadText(args: Map<string, ts.Node>, file: StoriesFile) {
  return [...args]
    .filter(([name]) => name !== 'children')
    .map(([name, value]) => attributeText(name, value, file))
    .filter(Boolean)
    .join(' ');
}

/**
 * The rendered element, either as an expression (with any statements that
 * come before it) or as a whole function body.
 */
type Rendered = RenderedExpression | RenderedBlock;

interface RenderedExpression {
  kind: 'expression';
  prelude: string;
  returned: string;
  jsx: boolean;
}

interface RenderedBlock {
  kind: 'block';
  body: string;
  node: ts.Block;
  edits: Edit[];
}

function fromRender(
  render: ts.Node,
  args: Map<string, ts.Node>,
  file: StoriesFile,
  where: string
): Rendered {
  const fn = unwrap(render);
  if (
    !(
      ts.isArrowFunction(fn) ||
      ts.isFunctionExpression(fn) ||
      ts.isMethodDeclaration(fn)
    ) ||
    !fn.body
  ) {
    throw new Error(
      `${where} its render is \`${render.getText().slice(0, 40)}\` — write the render inline in the story.`
    );
  }
  if (fn.parameters.length > 1) {
    throw new Error(
      `${where} its render reads the story context — render from args only.`
    );
  }

  const edits: Edit[] = [];
  const parameter = fn.parameters[0]?.name;
  const bindings = new Map<
    string,
    { key: string; fallback: ts.Expression | undefined }
  >();
  let argsName: string | undefined;
  if (parameter && ts.isObjectBindingPattern(parameter)) {
    for (const element of parameter.elements) {
      if (element.dotDotDotToken || !ts.isIdentifier(element.name)) {
        throw new Error(
          `${where} its render collects \`${element.getText()}\` from args — name each arg it uses.`
        );
      }
      bindings.set(element.name.text, {
        key: element.propertyName
          ? propertyKey(element.propertyName)
          : element.name.text,
        fallback: element.initializer,
      });
    }
  } else if (parameter && ts.isIdentifier(parameter)) {
    argsName = parameter.text;
  }

  /** @param fallback the destructuring default */
  const valueOf = (key: string, fallback?: ts.Node) => {
    const value = args.get(key);
    return isDropped(value, file) ? fallback : value;
  };

  /** @param use the identifier or `args.x` access */
  function substitute(use: ts.Node, value: ts.Node | undefined) {
    const parent = use.parent;
    if (ts.isJsxExpression(parent) && ts.isJsxAttribute(parent.parent)) {
      const attribute = parent.parent;
      const replacement = attributeText(attribute.name.getText(), value, file);
      edits.push([
        replacement ? attribute.getStart() : attribute.getFullStart(),
        attribute.getEnd(),
        replacement,
      ]);
      return;
    }
    if (
      ts.isJsxExpression(parent) &&
      (ts.isJsxElement(parent.parent) || ts.isJsxFragment(parent.parent))
    ) {
      edits.push([parent.getStart(), parent.getEnd(), childText(value, file)]);
      return;
    }
    throw new Error(
      `${where} its render uses \`${parent.getText().replace(/\s+/g, ' ').slice(0, 60)}\` from args outside a JSX prop or child — write the value inline.`
    );
  }

  /**
   * `{...args}` as the attributes it sets, plus `args.children` as the
   * element's children when the element has none of its own — as in React,
   * an attribute after the spread and JSX children win over args.
   */
  function spreadArgs(spread: ts.JsxSpreadAttribute) {
    const attributes = spread.parent.properties;
    const position = attributes.indexOf(spread);
    const namesIn = (list: readonly ts.JsxAttributeLike[]) =>
      new Set(
        list
          .filter(ts.isJsxAttribute)
          .map((attribute) => attribute.name.getText())
      );
    const setAfter = namesIn(attributes.slice(position + 1));
    const overridden = [...namesIn(attributes.slice(0, position))].find(
      (name) => args.has(name) && !setAfter.has(name)
    );
    if (overridden) {
      throw new Error(
        `${where} its render sets \`${overridden}\` before \`{...${argsName}}\`, so the arg overrides it — set it after the spread, or drop it from args.`
      );
    }

    const replacement = spreadText(
      new Map([...args].filter(([name]) => !setAfter.has(name))),
      file
    );
    edits.push([
      replacement ? spread.getStart() : spread.getFullStart(),
      spread.getEnd(),
      replacement,
    ]);

    if (setAfter.has('children')) return;
    const children = childText(args.get('children'), file);
    if (!children) return;
    const element = spread.parent.parent;
    if (ts.isJsxSelfClosingElement(element)) {
      edits.push([
        element.getEnd() - '/>'.length,
        element.getEnd(),
        `>${children}</${element.tagName.getText()}>`,
      ]);
      return;
    }
    const { children: ownChildren, closingElement } = element.parent;
    const hasOwnChildren = ownChildren.some(
      (child) => !(ts.isJsxText(child) && child.containsOnlyTriviaWhiteSpaces)
    );
    if (!hasOwnChildren) {
      edits.push([
        closingElement.getStart(),
        closingElement.getStart(),
        children,
      ]);
    }
  }

  function visit(node: ts.Node) {
    if (argsName) {
      if (
        ts.isPropertyAccessExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === argsName
      ) {
        substitute(node, valueOf(node.name.text));
        return;
      }
      if (
        ts.isJsxSpreadAttribute(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === argsName
      ) {
        spreadArgs(node);
        return;
      }
      if (ts.isIdentifier(node) && node.text === argsName) {
        throw new Error(
          `${where} its render passes args on as a whole in \`${node.parent.getText().replace(/\s+/g, ' ').slice(0, 60)}\` — spread them into JSX or write the values inline.`
        );
      }
    }
    const binding = ts.isIdentifier(node) ? bindings.get(node.text) : undefined;
    if (
      binding &&
      !(
        ts.isPropertyAccessExpression(node.parent) && node.parent.name === node
      ) &&
      !(ts.isPropertyAssignment(node.parent) && node.parent.name === node) &&
      !(ts.isJsxAttribute(node.parent) && node.parent.name === node)
    ) {
      substitute(node, valueOf(binding.key, binding.fallback));
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(fn.body);

  if (!ts.isBlock(fn.body)) {
    const returned = unwrap(fn.body);
    return {
      kind: 'expression',
      prelude: '',
      returned: textWithEdits(returned, edits),
      jsx: isJsx(returned),
    };
  }
  return {
    kind: 'block',
    body: textWithEdits(fn.body, edits),
    node: fn.body,
    edits,
  };
}

function isJsx(node: ts.Node) {
  return (
    ts.isJsxElement(node) ||
    ts.isJsxSelfClosingElement(node) ||
    ts.isJsxFragment(node)
  );
}

/** A block body as `prelude` + one final `return`, so a decorator can wrap it. */
function asExpression(rendered: Rendered, where: string): RenderedExpression {
  if (rendered.kind === 'expression') return rendered;
  const statements = rendered.node.statements;
  const last = statements.at(-1);
  let returns = 0;
  const count = (node: ts.Node) => {
    if (ts.isFunctionLike(node)) return;
    if (ts.isReturnStatement(node)) returns += 1;
    ts.forEachChild(node, count);
  };
  statements.forEach(count);
  if (!last || !ts.isReturnStatement(last) || !last.expression) {
    throw new Error(
      `${where} its render doesn't end in a \`return\`, so its decorator has nothing to wrap — end the render by returning its JSX.`
    );
  }
  if (returns > 1) {
    throw new Error(
      `${where} its render returns from more than one place, so its decorator has nothing single to wrap — end the render in one \`return\`.`
    );
  }
  const returned = unwrap(last.expression);
  return {
    kind: 'expression',
    prelude: statements
      .slice(0, -1)
      .map((statement) => textWithEdits(statement, rendered.edits))
      .join('\n'),
    returned: textWithEdits(returned, rendered.edits),
    jsx: isJsx(returned),
  };
}

/** Wraps the story in a `(Story) => <…><Story /></…>` decorator. */
function decorate(
  rendered: Rendered,
  decorator: ts.Node,
  file: StoriesFile,
  where: string
): Rendered {
  const unsupported = new Error(
    `${where} it is wrapped in a decorator the docs page can't show (\`${decorator.getText().replace(/\s+/g, ' ').slice(0, 60)}\`) — make the decorator a plain \`(Story) => <…><Story /></…>\` wrapper, or put its markup in the story.`
  );
  let fn: ts.Node | undefined = unwrap(decorator);
  if (ts.isIdentifier(fn)) {
    const name = fn.text;
    const statement = file.declarations.get(name);
    const declaration =
      statement && ts.isVariableStatement(statement)
        ? statement.declarationList.declarations.find(
            (candidate) => candidate.name.getText() === name
          )
        : undefined;
    fn = unwrap(declaration?.initializer);
  }
  if (!fn || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) {
    throw unsupported;
  }
  const storyParameter = fn.parameters[0]?.name;
  if (!storyParameter || !ts.isIdentifier(storyParameter)) throw unsupported;
  const storyName = storyParameter.text;

  let body = fn.body;
  if (ts.isBlock(body)) {
    const [only, ...rest] = body.statements;
    if (
      !only ||
      rest.length > 0 ||
      !ts.isReturnStatement(only) ||
      !only.expression
    ) {
      throw unsupported;
    }
    body = only.expression;
  }
  const wrapper = unwrap(body);
  if (!isJsx(wrapper)) throw unsupported;

  const placeholders: ts.JsxSelfClosingElement[] = [];
  let otherUses = 0;
  const find = (node: ts.Node) => {
    if (
      ts.isJsxSelfClosingElement(node) &&
      node.tagName.getText() === storyName &&
      node.attributes.properties.length === 0
    ) {
      placeholders.push(node);
      return;
    }
    if (ts.isIdentifier(node) && node.text === storyName) otherUses += 1;
    ts.forEachChild(node, find);
  };
  find(wrapper);
  const context = fn.parameters[1]?.name;
  if (context && ts.isIdentifier(context)) {
    const usesContext = (node: ts.Node): boolean | undefined =>
      (ts.isIdentifier(node) && node.text === context.text) ||
      ts.forEachChild(node, usesContext);
    if (usesContext(wrapper)) throw unsupported;
  }
  const [placeholder, ...otherPlaceholders] = placeholders;
  if (!placeholder || otherPlaceholders.length > 0 || otherUses > 0) {
    throw unsupported;
  }

  const inner = asExpression(rendered, where);
  return {
    kind: 'expression',
    prelude: inner.prelude,
    returned: textWithEdits(wrapper, [
      [
        placeholder.getStart(),
        placeholder.getEnd(),
        inner.jsx ? inner.returned : `{${inner.returned}}`,
      ],
    ]),
    jsx: true,
  };
}

function argsObject(node: ts.Node | undefined, where: string) {
  const object = unwrap(node);
  if (!object) return new Map();
  if (!ts.isObjectLiteralExpression(object)) {
    throw new Error(`${where} its args are not an object literal.`);
  }
  return propertiesOf(object, where);
}

function decoratorList(node: ts.Node | undefined) {
  const array = unwrap(node);
  if (!array) return [];
  if (!ts.isArrayLiteralExpression(array)) return [array];
  return [...array.elements];
}

/** The story's own JSX, args filled in and decorators applied. */
function renderStory(story: DocsStory, where: string): Rendered {
  const { file } = story;
  const props = propertiesOf(story.object, where);
  const metaProps = propertiesOf(file.meta, `${toRepoPath(file.path)}: meta`);
  for (const key of ['beforeEach', 'loaders']) {
    if (props.has(key) || metaProps.has(key)) {
      throw new Error(
        `${where} it uses \`${key}\`, which a component page can't run — render everything the example needs in the story.`
      );
    }
  }

  const args = new Map([
    ...argsObject(metaProps.get('args'), where),
    ...argsObject(props.get('args'), where),
  ]);
  const render = props.get('render') ?? metaProps.get('render');
  let rendered: Rendered;
  if (render) {
    rendered = fromRender(render, args, file, where);
  } else {
    const component = metaProps.get('component');
    if (!component) {
      throw new Error(
        `${where} it has no render, and its meta has no \`component\` to render.`
      );
    }
    const tag = component.getText();
    const attributes = spreadText(args, file);
    const opening = attributes ? `${tag} ${attributes}` : tag;
    const children = childText(args.get('children'), file);
    rendered = {
      kind: 'expression',
      prelude: '',
      returned: children
        ? `<${opening}>${children}</${tag}>`
        : `<${opening} />`,
      jsx: true,
    };
  }

  // A story's decorators sit inside its meta's; each list wraps outward in order.
  for (const decorator of [
    ...decoratorList(props.get('decorators')),
    ...decoratorList(metaProps.get('decorators')),
  ]) {
    rendered = decorate(rendered, decorator, file, where);
  }
  return rendered;
}

/** Identifiers `text` reads, other than property and attribute names. */
function identifiersIn(text: string) {
  const source = ts.createSourceFile(
    'closure.tsx',
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const names = new Set<string>();
  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node)) {
      const parent = node.parent;
      const isPropertyName =
        ((ts.isPropertyAccessExpression(parent) ||
          ts.isQualifiedName(parent) ||
          ts.isPropertyAssignment(parent) ||
          ts.isPropertySignature(parent) ||
          ts.isMethodDeclaration(parent) ||
          ts.isJsxAttribute(parent)) &&
          'name' in parent &&
          parent.name === node) ||
        (ts.isQualifiedName(parent) && parent.right === node) ||
        (ts.isBindingElement(parent) && parent.propertyName === node);
      if (!isPropertyName) names.add(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return names;
}

function resolveModule(basePath: string) {
  return [`${basePath}.tsx`, `${basePath}.ts`].find((candidate) =>
    existsSync(candidate)
  );
}

/**
 * Where the pasted module imports `module` from: packages stay, relative
 * imports become the `@/` path the install block copies.
 */
function pasteSpecifier(module: string, file: StoriesFile, where: string) {
  if (STORYBOOK_MODULE.test(module)) {
    throw new Error(
      `${where} its render uses ${module}, which is Storybook tooling — keep it in \`play\`.`
    );
  }
  if (!module.startsWith('.')) return module;

  const target = resolveModule(path.resolve(path.dirname(file.path), module));
  const appearance = path.join(componentsRoot, 'appearance');
  if (
    !target ||
    !isUnder(target, reactSrc) ||
    isUnder(target, path.join(reactSrc, 'stories')) ||
    isUnder(target, appearance)
  ) {
    throw new Error(
      `${where} its render imports ${module}, which a pasting app doesn't have — import component source only.`
    );
  }
  const relative = path
    .relative(reactSrc, target)
    .split(path.sep)
    .join('/')
    .replace(/\.tsx?$/, '');
  return `@/${relative}`;
}

function importGroup(specifier: string) {
  if (/^react(?:-dom)?(?:\/|$)/.test(specifier)) return 0;
  if (specifier.startsWith('@/')) return 2;
  return 1;
}

function renderImports(names: Set<string>, file: StoriesFile, where: string) {
  const modules = new Map<
    string,
    { namespace?: string; default?: string; named: string[]; typeOnly: boolean }
  >();
  for (const name of names) {
    const binding = file.imports.get(name) as ImportBinding;
    const specifier = pasteSpecifier(binding.module, file, where);
    const entry = modules.get(specifier) ?? { named: [], typeOnly: true };
    if (binding.kind === 'namespace') entry.namespace = name;
    else if (binding.kind === 'default') entry.default = name;
    else {
      const local =
        binding.imported === name ? name : `${binding.imported} as ${name}`;
      entry.named.push(binding.typeOnly ? `type ${local}` : local);
    }
    entry.typeOnly &&= binding.typeOnly;
    modules.set(specifier, entry);
  }

  const lines: string[] = [];
  const ordered = [...modules].sort(
    ([a], [b]) => importGroup(a) - importGroup(b) || a.localeCompare(b, 'en')
  );
  let group: number | undefined;
  for (const [specifier, entry] of ordered) {
    if (group !== undefined && importGroup(specifier) !== group) lines.push('');
    group = importGroup(specifier);
    const from = `from '${specifier}';`;
    if (entry.namespace) {
      lines.push(
        `import ${entry.typeOnly ? 'type ' : ''}* as ${entry.namespace} ${from}`
      );
    }
    const named = entry.named
      .map((local) => (entry.typeOnly ? local.replace(/^type /, '') : local))
      .sort((a, b) =>
        a.replace(/^type /, '').localeCompare(b.replace(/^type /, ''), 'en')
      );
    const parts = [
      entry.default,
      named.length > 0 ? `{ ${named.join(', ')} }` : undefined,
    ].filter(Boolean);
    if (parts.length > 0) {
      lines.push(
        `import ${entry.typeOnly ? 'type ' : ''}${parts.join(', ')} ${from}`
      );
    }
  }
  return lines.join('\n');
}

/** `data-testid` is for the story's tests, not for code a reader pastes. */
function withoutTestIds(text: string) {
  const source = ts.createSourceFile(
    'module.tsx',
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const ranges: [number, number][] = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && node.name.getText() === 'data-testid') {
      ranges.push([node.getFullStart(), node.getEnd()]);
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  let result = text;
  for (const [start, end] of ranges.sort((a, b) => b[0] - a[0])) {
    result = result.slice(0, start) + result.slice(end);
  }
  return result;
}

/**
 * The page's code for one docs story: a client module whose default export
 * renders the story.
 */
export async function docsStoryModule(
  story: DocsStory,
  formatOptions: PrettierOptions
) {
  const { file } = story;
  const where = `${toRepoPath(file.path)}: ${story.name} is tagged \`${DOCS_TAG}\`, but`;
  const rendered = renderStory(story, where);
  const baseName = `${pascal(story.slug)}${story.name}`;
  // `ItemMedia` the story would shadow `ItemMedia` the part it renders.
  const functionName =
    file.imports.has(baseName) || file.declarations.has(baseName)
      ? `${baseName}Example`
      : baseName;
  const component =
    rendered.kind === 'block'
      ? `export default function ${functionName}() ${rendered.body}`
      : `export default function ${functionName}() {\n${rendered.prelude ? `${rendered.prelude}\n\n` : ''}return (${rendered.jsx ? rendered.returned : `<>{${rendered.returned}}</>`});\n}`;

  const storyNames = new Set(file.stories.map(({ name }) => name));
  const helpers = new Set<ts.Statement>();
  const imported = new Set<string>();
  const pending = [...identifiersIn(component)];
  const seen = new Set<string>();
  while (pending.length > 0) {
    const name = pending.pop() as string;
    if (seen.has(name)) continue;
    seen.add(name);
    if (name === file.metaName || storyNames.has(name)) {
      throw new Error(
        `${where} its render reads \`${name}\`, which is Storybook setup rather than component code.`
      );
    }
    if (file.imports.has(name)) {
      imported.add(name);
      continue;
    }
    const statement = file.declarations.get(name);
    if (statement && !helpers.has(statement)) {
      helpers.add(statement);
      pending.push(...identifiersIn(statement.getText()));
    }
  }

  const helperText = [...helpers]
    .sort((a, b) => a.pos - b.pos)
    .map((statement) => statement.getText().replace(/^export\s+/, ''));
  const source = [
    `'use client';`,
    renderImports(imported, file, where),
    ...helperText,
    component,
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    id: docsStoryId(story),
    title: docsStoryTitle(story),
    description: docsDescription(story.object, 'story', where),
    source: await prettier.format(withoutTestIds(source), {
      ...formatOptions,
      filepath: `${story.name}.tsx`,
    }),
  };
}
