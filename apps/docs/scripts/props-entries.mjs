// @ts-check
import path from 'node:path';

import ts from 'typescript';

import { isUnder } from './props-contract.mjs';
import { reactRoot } from './roots.mjs';

/** @typedef {import('react-docgen-typescript').ComponentDoc} ComponentDoc */
/** @typedef {import('react-docgen-typescript').PropItem} PropItem */

/**
 * @typedef {object} PropEntry
 * @property {string} name
 * @property {string} type
 * @property {boolean} required
 * @property {string | null} defaultValue
 * @property {string} description
 * @property {string | null} example
 */

/**
 * @typedef {object} ComponentEntry
 * @property {string} name
 * @property {string} description
 * @property {string} sourcePath
 * @property {PropEntry[]} props
 */

/** @typedef {{ slug: string; components: ComponentEntry[] }} PropsFile */

/** @typedef {Record<string, string[]>} PropsIndex */

const reactSrc = path.join(reactRoot, 'src');

const LITERAL_KEYWORD = /^(?:true|false|null|undefined|-?\d+(?:\.\d+)?)$/;

/**
 * A `@default` tag keeps its quotes; a destructuring default arrives unquoted.
 * @param {PropItem} prop
 * @param {string | undefined} variantDefault
 * @returns {string | null}
 */
function toDefaultValue(prop, variantDefault) {
  const tags = /** @type {Record<string, string> | undefined} */ (prop.tags);
  const tag = tags?.default;
  if (tag !== undefined) {
    const quoted = tag.match(/^(['"])(.*)\1$/s);
    if (quoted) return JSON.stringify(quoted[2]);
    if (LITERAL_KEYWORD.test(tag)) return tag;
    throw new Error(
      `props JSON: ${prop.parent?.name ?? 'a component'}.${prop.name} has \`@default ${tag}\`, which is not a literal. Put the explanation in the prop's description and drop the tag, or give a quoted string, number, boolean or null.`
    );
  }

  /** @type {string | undefined} */
  const code = prop.defaultValue?.value;
  if (code !== undefined) {
    return LITERAL_KEYWORD.test(code) ? code : JSON.stringify(code);
  }

  return variantDefault ?? null;
}

/**
 * @param {ts.TypeChecker} checker
 * @param {ts.Node} node
 */
function resolveSymbol(checker, node) {
  const symbol = checker.getSymbolAtLocation(node);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(symbol);
  }
  return symbol;
}

/**
 * The `defaultVariants` of the cva call a `typeof x` query points at.
 * @param {ts.TypeChecker} checker
 * @param {ts.TypeQueryNode} typeQuery
 * @returns {[string, string][]}
 */
function cvaDefaultVariants(checker, typeQuery) {
  const declaration = resolveSymbol(checker, typeQuery.exprName)
    ?.valueDeclaration;
  if (!declaration || !ts.isVariableDeclaration(declaration)) return [];
  const call = declaration.initializer;
  if (!call || !ts.isCallExpression(call)) return [];
  const config = call.arguments[1];
  if (!config || !ts.isObjectLiteralExpression(config)) return [];

  const defaults = config.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      property.name.getText() === 'defaultVariants'
  );
  if (!defaults || !ts.isPropertyAssignment(defaults)) return [];
  if (!ts.isObjectLiteralExpression(defaults.initializer)) return [];

  return defaults.initializer.properties
    .filter(ts.isPropertyAssignment)
    .map((property) => [
      property.name.getText().replace(/^['"]|['"]$/g, ''),
      ts.isStringLiteral(property.initializer)
        ? JSON.stringify(property.initializer.text)
        : property.initializer.getText(),
    ]);
}

/**
 * Default values for props that come from `VariantProps<typeof x>`: they take
 * `x`'s cva `defaultVariants`, which docgen never sees.
 * @param {ts.TypeChecker} checker
 * @param {ts.Symbol} symbol the component
 * @returns {Map<string, string>}
 */
export function variantDefaults(checker, symbol) {
  /** @type {Map<string, string>} */
  const defaults = new Map();
  /** @type {Set<ts.Node>} */
  const visited = new Set();

  /** @param {ts.Node} node */
  function visit(node) {
    if (visited.has(node)) return;
    visited.add(node);

    const reference = ts.isTypeReferenceNode(node)
      ? node.typeName
      : ts.isExpressionWithTypeArguments(node)
        ? node.expression
        : undefined;

    if (
      reference?.getText() === 'VariantProps' &&
      (ts.isTypeReferenceNode(node) || ts.isExpressionWithTypeArguments(node))
    ) {
      const [argument] = node.typeArguments ?? [];
      if (argument && ts.isTypeQueryNode(argument)) {
        for (const [key, value] of cvaDefaultVariants(checker, argument)) {
          if (!defaults.has(key)) defaults.set(key, value);
        }
      }
    } else if (reference) {
      for (const declaration of resolveSymbol(checker, reference)
        ?.declarations ?? []) {
        if (!isUnder(declaration.getSourceFile().fileName, reactSrc)) continue;
        if (
          ts.isInterfaceDeclaration(declaration) ||
          ts.isTypeAliasDeclaration(declaration)
        ) {
          visit(declaration);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  const declaration = symbol.declarations?.[0];
  const signature =
    declaration && ts.isVariableDeclaration(declaration)
      ? declaration.initializer
      : declaration;
  if (signature && ts.isFunctionLike(signature)) {
    const propsType = signature.parameters[0]?.type;
    if (propsType) visit(propsType);
  }

  return defaults;
}

/**
 * @param {PropItem} prop
 * @param {Map<string, string>} expansions
 * @param {Map<string, string>} defaults
 * @returns {PropEntry}
 */
function toPropEntry(prop, expansions, defaults) {
  const tags = /** @type {Record<string, string> | undefined} */ (prop.tags);
  return {
    name: prop.name,
    type: expansions.get(prop.type.name) ?? prop.type.name,
    required: prop.required,
    defaultValue: toDefaultValue(prop, defaults.get(prop.name)),
    description: prop.description,
    // Unlike `description`, docgen leaves tag values with CRLF line endings.
    example: tags?.example?.replace(/\r\n/g, '\n') ?? null,
  };
}

/**
 * @param {string} name
 * @param {string} sourcePath
 * @param {ComponentDoc} doc
 * @param {Map<string, string>} expansions
 * @param {Map<string, string>} defaults
 * @returns {ComponentEntry}
 */
export function toComponentEntry(name, sourcePath, doc, expansions, defaults) {
  return {
    name,
    description: doc.description,
    sourcePath,
    props: Object.values(doc.props)
      .map((prop) => toPropEntry(prop, expansions, defaults))
      .sort((a, b) => a.name.localeCompare(b.name, 'en')),
  };
}

/**
 * @param {ts.TypeChecker} checker
 * @param {string} name
 * @param {string} sourcePath
 * @param {ts.Symbol} symbol
 * @returns {ComponentEntry}
 */
export function toProplessEntry(checker, name, sourcePath, symbol) {
  return {
    name,
    description: ts
      .displayPartsToString(symbol.getDocumentationComment(checker))
      .replace(/\r\n/g, '\n'),
    sourcePath,
    props: [],
  };
}
