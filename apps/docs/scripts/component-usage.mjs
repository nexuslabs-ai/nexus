// @ts-check
import ts from 'typescript';

/** `printWidth` in the repo's `.prettierrc`. */
const PRINT_WIDTH = 80;

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
 * Adds the parts one demo renders to `parts`, and each part's nearest part
 * ancestor → part to `nesting`, both in the order they first appear.
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

  /**
   * @param {ts.Node} node
   * @param {string | undefined} parent
   */
  function visit(node, parent) {
    const tag = jsxTagName(node);
    const part = tag === undefined ? undefined : imported.get(tag);
    if (part) {
      if (!parts.includes(part)) parts.push(part);
      if (parent) {
        const children = nesting.get(parent) ?? [];
        if (!children.includes(part)) children.push(part);
        nesting.set(parent, children);
      }
    }
    ts.forEachChild(node, (child) => visit(child, part ?? parent));
  }

  visit(file, undefined);
}

/**
 * @param {string[]} parts
 * @param {string} module
 */
function renderImport(parts, module) {
  const oneLine = `import { ${parts.join(', ')} } from '${module}';`;
  if (oneLine.length <= PRINT_WIDTH) return oneLine;
  return `import {\n${parts.map((part) => `  ${part},`).join('\n')}\n} from '${module}';`;
}

/**
 * @param {string[]} parts
 * @param {Map<string, string[]>} nesting
 */
function renderTree(parts, nesting) {
  const nested = new Set([...nesting.values()].flat());
  const lines = [];

  /**
   * @param {string} part
   * @param {string} indent
   * @param {string[]} ancestors
   */
  function drawChildren(part, indent, ancestors) {
    // A part can sit inside itself (a submenu in a submenu); draw that once.
    const children = (nesting.get(part) ?? []).filter(
      (child) => !ancestors.includes(child)
    );
    children.forEach((child, index) => {
      const last = index === children.length - 1;
      lines.push(`${indent}${last ? '└── ' : '├── '}${child}`);
      drawChildren(child, `${indent}${last ? '    ' : '│   '}`, [
        ...ancestors,
        child,
      ]);
    });
  }

  for (const root of parts.filter((part) => !nested.has(part))) {
    lines.push(root);
    drawChildren(root, '', [root]);
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
      `examples/${slug}/ renders no part imported from ${module}, so its page has no Usage — render the component from ${module}.`
    );
  }
  return {
    imports: renderImport(
      parts.toSorted((a, b) => a.localeCompare(b, 'en')),
      module
    ),
    composition: parts.length > 1 ? renderTree(parts, nesting) : null,
  };
}
