// @ts-check
import ts from 'typescript';

const PATH_SEPARATOR = ' > ';

/** `printWidth` in the repo's `.prettierrc`. */
const PRINT_WIDTH = 80;

/**
 * `import { … } from '…';` laid out the way prettier would print it.
 * @param {readonly string[]} names
 * @param {string} module
 */
function importStatement(names, module) {
  const oneLine = `import { ${names.join(', ')} } from '${module}';`;
  if (oneLine.length <= PRINT_WIDTH) return oneLine;
  return `import {\n${names.map((name) => `  ${name},`).join('\n')}\n} from '${module}';`;
}

/** Where a component page's demos import the component's parts from. */
function componentModule(slug) {
  return `@/components/${slug}/${slug}`;
}

/**
 * Local name → part name, for the named imports from `module`.
 * @param {ts.SourceFile} file
 * @param {string} module
 */
function partImports(file, module) {
  const parts = new Map();
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
    if (statement.moduleSpecifier.text !== module) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      parts.set(element.name.text, (element.propertyName ?? element.name).text);
    }
  }
  return parts;
}

/** @param {ts.Node} node */
function jsxTagName(node) {
  if (ts.isJsxElement(node)) return node.openingElement.tagName.getText();
  if (ts.isJsxSelfClosingElement(node)) return node.tagName.getText();
  return undefined;
}

/**
 * The module's file-local declarations by name — helper components, render
 * functions and data constants a demo can render through.
 * @param {ts.SourceFile} file
 */
function localDeclarations(file) {
  const locals = new Map();
  for (const statement of file.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      locals.set(statement.name.text, statement);
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          locals.set(declaration.name.text, declaration.initializer);
        }
      }
    }
  }
  return locals;
}

/** @param {ts.SourceFile} file */
function defaultExport(file) {
  return file.statements.find(
    (statement) =>
      ts.isFunctionDeclaration(statement) &&
      (ts.getModifiers(statement) ?? []).some(
        (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
      )
  );
}

/**
 * Adds the parts one demo renders to `parts`, and each part to `nesting` under
 * the path of parts it renders inside, both in the order they first appear. Walks
 * from the demo's default export through the helpers it renders, so a part
 * inside a helper still nests under the part that renders the helper.
 * @param {{ fileName: string; source: string }} demo
 * @param {string} module
 * @param {string[]} parts
 * @param {Map<string, string[]>} nesting
 */
function collectParts(demo, module, parts, nesting) {
  const file = ts.createSourceFile(
    demo.fileName,
    demo.source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const imported = partImports(file, module);
  const locals = localDeclarations(file);
  /** @type {Set<string>} */
  const entered = new Set();

  /**
   * @param {ts.Node} node
   * @param {string[]} path the parts this node renders inside, outermost first
   */
  function visit(node, path) {
    const tag = jsxTagName(node);
    const part = tag === undefined ? undefined : imported.get(tag);
    let inner = path;
    // A part inside itself (a submenu in a submenu) adds no new level.
    if (part && !path.includes(part)) {
      if (!parts.includes(part)) parts.push(part);
      const key = path.join(PATH_SEPARATOR);
      const children = nesting.get(key) ?? [];
      if (!children.includes(part)) children.push(part);
      nesting.set(key, children);
      inner = [...path, part];
    }
    if (
      ts.isIdentifier(node) &&
      locals.has(node.text) &&
      !entered.has(node.text)
    ) {
      entered.add(node.text);
      visit(locals.get(node.text), path);
      entered.delete(node.text);
    }
    ts.forEachChild(node, (child) => visit(child, inner));
  }

  visit(defaultExport(file) ?? file, []);
}

/** @param {Map<string, string[]>} nesting */
function renderTree(nesting) {
  const lines = [];

  /**
   * @param {string[]} path
   * @param {string} indent
   */
  function drawChildren(path, indent) {
    const children = nesting.get(path.join(PATH_SEPARATOR)) ?? [];
    children.forEach((child, index) => {
      const last = index === children.length - 1;
      lines.push(`${indent}${last ? '└── ' : '├── '}${child}`);
      drawChildren([...path, child], `${indent}${last ? '    ' : '│   '}`);
    });
  }

  for (const root of nesting.get('') ?? []) {
    lines.push(root);
    drawChildren([root], '');
  }
  return lines.join('\n');
}

/**
 * A component page's Usage import and Composition tree, from the parts its
 * demos render and how they nest. `demos` runs preview first, so the tree
 * follows the page's own order.
 * @param {string} slug
 * @param {readonly { fileName: string; source: string }[]} demos
 */
export function componentUsage(slug, demos) {
  const module = componentModule(slug);
  /** @type {string[]} */
  const parts = [];
  /** @type {Map<string, string[]>} */
  const nesting = new Map();
  for (const demo of demos) collectParts(demo, module, parts, nesting);

  if (parts.length === 0) {
    throw new Error(
      `The ${slug} stories tagged docs render no part of ${slug}, so its page has no Usage — tag a story that renders the component.`
    );
  }
  return {
    imports: importStatement(
      parts.toSorted((a, b) => a.localeCompare(b, 'en')),
      module
    ),
    composition: parts.length > 1 ? renderTree(nesting) : null,
  };
}

/**
 * Usage for a page without demos: every part the component exports, one
 * import per source file — `packages/react/src/components/x/x.tsx` →
 * `@/components/x/x`.
 * @param {readonly { name: string; sourcePath: string }[]} entries
 */
export function entryUsage(entries) {
  /** @type {Map<string, string[]>} */
  const byModule = new Map();
  for (const { name, sourcePath } of entries) {
    const module = sourcePath
      .replace(/^packages\/react\/src\//, '@/')
      .replace(/\.tsx?$/, '');
    byModule.set(module, [...(byModule.get(module) ?? []), name]);
  }
  return [...byModule]
    .sort(([a], [b]) => a.localeCompare(b, 'en'))
    .map(([module, names]) => importStatement(names.toSorted(), module))
    .join('\n');
}
