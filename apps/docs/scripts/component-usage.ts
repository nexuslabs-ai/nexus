import ts from 'typescript';

interface DemoSource {
  fileName: string;
  source: string;
}

const PATH_SEPARATOR = ' > ';

/** `printWidth` in the repo's `.prettierrc`. */
const PRINT_WIDTH = 80;

/** `import { … } from '…';` laid out the way prettier would print it. */
function importStatement(names: readonly string[], module: string) {
  const oneLine = `import { ${names.join(', ')} } from '${module}';`;
  if (oneLine.length <= PRINT_WIDTH) return oneLine;
  return `import {\n${names.map((name) => `  ${name},`).join('\n')}\n} from '${module}';`;
}

/** Where a component page's demos import the component's parts from. */
function componentModule(slug: string) {
  return `@/components/${slug}/${slug}`;
}

/** Local name → part name, for the named imports from `module`. */
function partImports(file: ts.SourceFile, module: string) {
  const parts = new Map<string, string>();
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

function jsxTagName(node: ts.Node) {
  if (ts.isJsxElement(node)) return node.openingElement.tagName.getText();
  if (ts.isJsxSelfClosingElement(node)) return node.tagName.getText();
  return undefined;
}

/**
 * The module's file-local declarations by name — helper components, render
 * functions and data constants a demo can render through.
 */
function localDeclarations(file: ts.SourceFile) {
  const locals = new Map<string, ts.Node>();
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

function defaultExport(file: ts.SourceFile) {
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
 */
function collectParts(
  demo: DemoSource,
  module: string,
  parts: string[],
  nesting: Map<string, string[]>
) {
  const file = ts.createSourceFile(
    demo.fileName,
    demo.source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const imported = partImports(file, module);
  const locals = localDeclarations(file);
  const entered = new Set<ts.Node>();

  /** @param path the parts this node renders inside, outermost first */
  function visit(node: ts.Node, path: string[]) {
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
    const local = ts.isIdentifier(node) ? locals.get(node.text) : undefined;
    if (local && !entered.has(local)) {
      entered.add(local);
      visit(local, path);
      entered.delete(local);
    }
    ts.forEachChild(node, (child) => visit(child, inner));
  }

  visit(defaultExport(file) ?? file, []);
}

function renderTree(nesting: Map<string, string[]>) {
  const lines: string[] = [];

  function drawChildren(path: string[], indent: string) {
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
 */
export function componentUsage(slug: string, demos: readonly DemoSource[]) {
  const module = componentModule(slug);
  const parts: string[] = [];
  const nesting = new Map<string, string[]>();
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
 */
export function entryUsage(
  entries: readonly { name: string; sourcePath: string }[]
) {
  const byModule = new Map<string, string[]>();
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
