// @ts-check
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

import prettier from 'prettier';
import ts from 'typescript';

import { humanize } from './humanize.mjs';
import { collectSourceFiles } from './react-sources.mjs';
import { componentsRoot, isUnder, reactSrc, toRepoPath } from './roots.mjs';

export const DOCS_TAG = 'docs';

// TODO(#796): give Appearance a preview once appearance can be scoped to `[data-nexus-root]`.
/** Components whose page has no preview, keyed to the reason. */
export const PREVIEWLESS_COMPONENTS = new Map([
  [
    'appearance',
    'its editor components need the appearance provider, and a provider on the page would restyle the docs site',
  ],
]);

const STORYBOOK_MODULE = /^(?:storybook(?:\/|$)|@storybook\/)/;
const SPY_MODULE = 'storybook/test';

/** @param {ts.Node | undefined} node */
function unwrap(node) {
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

/** @param {ts.PropertyName} name */
function propertyKey(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return name.getText();
}

/** @param {ts.ObjectLiteralExpression} object */
function tagsOf(object) {
  const property = object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) &&
      propertyKey(candidate.name) === 'tags'
  );
  if (!property || !ts.isPropertyAssignment(property)) return [];
  const array = unwrap(property.initializer);
  if (!array || !ts.isArrayLiteralExpression(array)) return [];
  return array.elements.filter(ts.isStringLiteral).map((tag) => tag.text);
}

/**
 * @param {ts.ObjectLiteralExpression} object
 * @param {string} where
 * @returns {Map<string, ts.Node>}
 */
function propertiesOf(object, where) {
  const properties = new Map();
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

/** @param {ts.BindingName} name */
function boundNames(name) {
  if (ts.isIdentifier(name)) return [name.text];
  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : boundNames(element.name)
  );
}

function hasExportModifier(statement) {
  return (
    ts.canHaveModifiers(statement) &&
    (ts.getModifiers(statement) ?? []).some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    )
  );
}

/**
 * @typedef {{ module: string; kind: 'default' | 'namespace' | 'named'; imported: string; typeOnly: boolean }} ImportBinding
 * @typedef {{
 *   path: string;
 *   imports: Map<string, ImportBinding>;
 *   declarations: Map<string, ts.Statement>;
 *   stories: { name: string; object: ts.ObjectLiteralExpression }[];
 *   meta: ts.ObjectLiteralExpression | undefined;
 *   metaName: string | undefined;
 * }} StoriesFile
 */

/** @returns {StoriesFile} */
function parseStoriesFile(filePath) {
  const sourceFile = ts.createSourceFile(
    filePath,
    readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  /** @type {Map<string, ImportBinding>} */
  const imports = new Map();
  /** @type {Map<string, ts.Statement>} */
  const declarations = new Map();
  /** @type {Map<string, ts.Expression | undefined>} */
  const initializers = new Map();
  const stories = [];
  let metaName;

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
      metaName = statement.expression.getText();
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

  const metaObject = metaName ? unwrap(initializers.get(metaName)) : undefined;
  return {
    path: filePath,
    imports,
    declarations,
    stories,
    meta:
      metaObject && ts.isObjectLiteralExpression(metaObject)
        ? metaObject
        : undefined,
    metaName,
  };
}

/**
 * @typedef {{ slug: string; file: StoriesFile; name: string; object: ts.ObjectLiteralExpression }} DocsStory
 */

/**
 * Every story under `components/{slug}/` tagged `docs`, in file order.
 * @param {string} slug
 * @returns {DocsStory[]}
 */
export function readDocsStories(slug) {
  const files = collectSourceFiles(path.join(componentsRoot, slug), (file) =>
    file.endsWith('.stories.tsx')
  ).sort();

  return files.flatMap((filePath) => {
    const file = parseStoriesFile(filePath);
    if (file.meta && tagsOf(file.meta).includes(DOCS_TAG)) {
      throw new Error(
        `${toRepoPath(filePath)}: meta is tagged \`${DOCS_TAG}\` — tag the stories a component page should show, not the whole file.`
      );
    }
    return file.stories
      .filter((story) => tagsOf(story.object).includes(DOCS_TAG))
      .map((story) => ({ slug, file, name: story.name, object: story.object }));
  });
}

/** `DefaultOpen` → `default-open`. */
function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function pascal(slug) {
  return slug
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
}

/** @param {DocsStory} story */
export function docsStoryId(story) {
  return `${story.slug}/${kebab(story.name)}`;
}

/** @param {DocsStory} story */
function docsStoryTitle(story) {
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

/**
 * Applies non-overlapping `[start, end, text]` edits that fall inside `node`.
 * @param {ts.Node} node
 * @param {[number, number, string][]} edits
 */
function textWithEdits(node, edits) {
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

/**
 * @param {ts.Node | undefined} value
 * @param {StoriesFile} file
 */
function isDropped(value, file) {
  const node = unwrap(value);
  if (!node) return true;
  if (ts.isIdentifier(node) && node.text === 'undefined') return true;
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    file.imports.get(node.expression.text)?.module === SPY_MODULE
  );
}

const ESCAPE_IN_JSX_STRING = /["\\\n]/;
const ESCAPE_IN_JSX_TEXT = /[{}<>]/;

/**
 * The JSX attribute an arg becomes, or '' when it has no value to show.
 * @param {string} name
 * @param {ts.Node | undefined} value
 * @param {StoriesFile} file
 */
function attributeText(name, value, file) {
  if (isDropped(value, file)) return '';
  const node = /** @type {ts.Node} */ (unwrap(value));
  if (
    (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
    !ESCAPE_IN_JSX_STRING.test(node.text)
  ) {
    return `${name}="${node.text}"`;
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return name;
  return `${name}={${node.getText()}}`;
}

/**
 * @param {ts.Node | undefined} value
 * @param {StoriesFile} file
 */
function childText(value, file) {
  if (isDropped(value, file)) return '';
  const node = /** @type {ts.Node} */ (unwrap(value));
  if (
    (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
    !ESCAPE_IN_JSX_TEXT.test(node.text)
  ) {
    return node.text;
  }
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
    return node.getText();
  }
  if (ts.isJsxFragment(node)) return node.getText();
  return `{${node.getText()}}`;
}

/**
 * @param {Map<string, ts.Node>} args
 * @param {StoriesFile} file
 */
function spreadText(args, file) {
  return [...args]
    .filter(([name]) => name !== 'children')
    .map(([name, value]) => attributeText(name, value, file))
    .filter(Boolean)
    .join(' ');
}

/**
 * The rendered element, either as an expression (with any statements that
 * come before it) or as a whole function body.
 * @typedef {{ kind: 'expression'; prelude: string; returned: string; jsx: boolean } | { kind: 'block'; body: string; node: ts.Block; edits: [number, number, string][] }} Rendered
 */

/**
 * @param {ts.Node} render
 * @param {Map<string, ts.Node>} args
 * @param {StoriesFile} file
 * @param {string} where
 * @returns {Rendered}
 */
function fromRender(render, args, file, where) {
  const fn = ts.isMethodDeclaration(render) ? render : unwrap(render);
  if (
    !fn ||
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

  /** @type {[number, number, string][]} */
  const edits = [];
  const parameter = fn.parameters[0]?.name;
  /** @type {Map<string, { key: string; fallback: ts.Expression | undefined }>} */
  const bindings = new Map();
  let argsName;
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

  /** @param {string} key */
  const valueOf = (key, fallback) => args.get(key) ?? fallback;

  /**
   * @param {ts.Node} use the identifier or `args.x` access
   * @param {ts.Node | undefined} value
   */
  function substitute(use, value) {
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

  /** @param {ts.Node} node */
  function visit(node) {
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
        const replacement = spreadText(args, file);
        edits.push([
          replacement ? node.getStart() : node.getFullStart(),
          node.getEnd(),
          replacement,
        ]);
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
    const returned = unwrap(fn.body) ?? fn.body;
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

/** @param {ts.Node} node */
function isJsx(node) {
  return (
    ts.isJsxElement(node) ||
    ts.isJsxSelfClosingElement(node) ||
    ts.isJsxFragment(node)
  );
}

/**
 * A block body as `prelude` + one final `return`, so a decorator can wrap it.
 * @param {Rendered} rendered
 * @param {string} where
 * @returns {Extract<Rendered, { kind: 'expression' }>}
 */
function asExpression(rendered, where) {
  if (rendered.kind === 'expression') return rendered;
  const statements = rendered.node.statements;
  const last = statements.at(-1);
  let returns = 0;
  /** @param {ts.Node} node */
  const count = (node) => {
    if (ts.isFunctionLike(node)) return;
    if (ts.isReturnStatement(node)) returns += 1;
    ts.forEachChild(node, count);
  };
  statements.forEach(count);
  if (!last || !ts.isReturnStatement(last) || !last.expression || returns > 1) {
    throw new Error(
      `${where} its render returns from more than one place, so its decorator has nothing single to wrap — end the render in one \`return\`.`
    );
  }
  const returned = unwrap(last.expression) ?? last.expression;
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

/**
 * Wraps the story in a `(Story) => <…><Story /></…>` decorator.
 * @param {Rendered} rendered
 * @param {ts.Node} decorator
 * @param {StoriesFile} file
 * @param {string} where
 * @returns {Rendered}
 */
function decorate(rendered, decorator, file, where) {
  const unsupported = new Error(
    `${where} it is wrapped in a decorator the docs page can't show (\`${decorator.getText().replace(/\s+/g, ' ').slice(0, 60)}\`) — make the decorator a plain \`(Story) => <…><Story /></…>\` wrapper, or put its markup in the story.`
  );
  let fn = unwrap(decorator);
  if (fn && ts.isIdentifier(fn)) {
    const statement = file.declarations.get(fn.text);
    const declaration =
      statement && ts.isVariableStatement(statement)
        ? statement.declarationList.declarations.find(
            (candidate) => candidate.name.getText() === fn?.getText()
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
    const [only] = body.statements;
    if (
      body.statements.length !== 1 ||
      !ts.isReturnStatement(only) ||
      !only.expression
    ) {
      throw unsupported;
    }
    body = only.expression;
  }
  const wrapper = unwrap(body);
  if (!wrapper || !isJsx(wrapper)) throw unsupported;

  const placeholders = [];
  let otherUses = 0;
  /** @param {ts.Node} node */
  const find = (node) => {
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
    /** @param {ts.Node} node */
    const usesContext = (node) =>
      (ts.isIdentifier(node) && node.text === context.text) ||
      ts.forEachChild(node, usesContext);
    if (usesContext(wrapper)) throw unsupported;
  }
  if (placeholders.length !== 1 || otherUses > 0) throw unsupported;

  const inner = asExpression(rendered, where);
  const [placeholder] = placeholders;
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

/** @param {ts.Node | undefined} node */
function argsObject(node, where) {
  const object = unwrap(node);
  if (!object) return new Map();
  if (!ts.isObjectLiteralExpression(object)) {
    throw new Error(`${where} its args are not an object literal.`);
  }
  return propertiesOf(object, where);
}

/** @param {ts.Node | undefined} node */
function decoratorList(node) {
  const array = unwrap(node);
  if (!array) return [];
  if (!ts.isArrayLiteralExpression(array)) return [array];
  return [...array.elements];
}

/**
 * The story's own JSX, args filled in and decorators applied.
 * @param {DocsStory} story
 * @param {string} where
 * @returns {Rendered}
 */
function renderStory(story, where) {
  const { file } = story;
  const props = propertiesOf(story.object, where);
  const metaProps = file.meta
    ? propertiesOf(file.meta, `${toRepoPath(file.path)}: meta`)
    : new Map();
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
  /** @type {Rendered} */
  let rendered;
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
function identifiersIn(text) {
  const source = ts.createSourceFile(
    'closure.tsx',
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const names = new Set();
  /** @param {ts.Node} node */
  const visit = (node) => {
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

function resolveModule(basePath) {
  const candidates = [
    `${basePath}.tsx`,
    `${basePath}.ts`,
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.ts'),
  ];
  return candidates.find((candidate) => existsSync(candidate));
}

/**
 * Where the pasted module imports `module` from: packages stay, relative
 * imports become the `@/` path the install block copies.
 * @param {string} module
 * @param {StoriesFile} file
 * @param {string} where
 */
function pasteSpecifier(module, file, where) {
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
  if (!relative.endsWith('/index')) return `@/${relative}`;
  const folder = relative.slice(0, -'/index'.length);
  const own = `${folder}/${path.posix.basename(folder)}`;
  return resolveModule(path.join(reactSrc, own)) ? `@/${own}` : `@/${folder}`;
}

function importGroup(specifier) {
  if (/^react(?:-dom)?(?:\/|$)/.test(specifier)) return 0;
  if (specifier.startsWith('@/')) return 2;
  return 1;
}

/**
 * @param {Set<string>} names
 * @param {StoriesFile} file
 * @param {string} where
 */
function renderImports(names, file, where) {
  /** @type {Map<string, { namespace?: string; default?: string; named: string[]; typeOnly: boolean }>} */
  const modules = new Map();
  for (const name of names) {
    const binding = /** @type {ImportBinding} */ (file.imports.get(name));
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

  const lines = [];
  const ordered = [...modules].sort(
    ([a], [b]) => importGroup(a) - importGroup(b) || a.localeCompare(b, 'en')
  );
  let group;
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
function withoutTestIds(text) {
  const source = ts.createSourceFile(
    'module.tsx',
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const ranges = [];
  /** @param {ts.Node} node */
  const visit = (node) => {
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
 * @param {DocsStory} story
 * @param {import('prettier').Options} formatOptions
 */
export async function docsStoryModule(story, formatOptions) {
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
  /** @type {Set<ts.Statement>} */
  const helpers = new Set();
  /** @type {Set<string>} */
  const imported = new Set();
  const pending = [...identifiersIn(component)];
  const seen = new Set();
  while (pending.length > 0) {
    const name = /** @type {string} */ (pending.pop());
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
    source: await prettier.format(withoutTestIds(source), {
      ...formatOptions,
      filepath: `${story.name}.tsx`,
    }),
  };
}
