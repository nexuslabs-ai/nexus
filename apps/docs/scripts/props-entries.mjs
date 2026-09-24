// @ts-check
import path from 'node:path';

import ts from 'typescript';

import { isUnder, resolveAlias } from './props-contract.mjs';
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
 * @param {PropItem} prop
 * @param {string | undefined} codeDefault
 * @returns {string | null}
 */
function toDefaultValue(prop, codeDefault) {
  const tags = /** @type {Record<string, string> | undefined} */ (prop.tags);
  const tag = tags?.default;
  if (tag === undefined) return codeDefault ?? null;

  const quoted = tag.match(/^(['"])(.*)\1$/s);
  if (quoted) return JSON.stringify(quoted[2]);
  if (LITERAL_KEYWORD.test(tag)) return tag;
  throw new Error(
    `props JSON: ${prop.parent?.name ?? 'a component'}.${prop.name} has \`@default ${tag}\`, which is not a literal. Put the explanation in the prop's description and drop the tag, or give a quoted string, number, boolean or null.`
  );
}

/**
 * The default printed the way the type column prints it: strings quoted, the
 * rest bare. A `const` identifier resolves to its literal initializer.
 * @param {ts.TypeChecker} checker
 * @param {ts.Expression} node
 * @param {string} owner what the error names, e.g. `Badge.variant`
 * @returns {string}
 */
function literalDefault(checker, node, owner) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return JSON.stringify(node.text);
  }
  if (ts.isNumericLiteral(node)) return node.text;
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand)
  ) {
    return `-${node.operand.text}`;
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return 'true';
  if (node.kind === ts.SyntaxKind.FalseKeyword) return 'false';
  if (node.kind === ts.SyntaxKind.NullKeyword) return 'null';
  if (ts.isIdentifier(node) && node.text === 'undefined') return 'undefined';

  const declaration = ts.isIdentifier(node)
    ? symbolAt(checker, node)?.valueDeclaration
    : undefined;
  if (
    declaration &&
    ts.isVariableDeclaration(declaration) &&
    declaration.initializer &&
    ts.getCombinedNodeFlags(declaration) & ts.NodeFlags.Const
  ) {
    return literalDefault(checker, declaration.initializer, owner);
  }

  throw new Error(
    `props JSON: ${owner} defaults to \`${node.getText()}\`, which is not a literal. Use a string, number, boolean or null, or drop the default and describe it in the prop's description.`
  );
}

/**
 * @param {ts.TypeChecker} checker
 * @param {ts.Node} node
 * @returns {ts.Symbol | undefined}
 */
function symbolAt(checker, node) {
  const symbol = checker.getSymbolAtLocation(node);
  return symbol && resolveAlias(checker, symbol);
}

/**
 * @param {ts.Symbol} symbol
 * @returns {ts.SignatureDeclaration | undefined}
 */
function componentFunction(symbol) {
  const declaration = symbol.declarations?.[0];
  const candidate =
    declaration && ts.isVariableDeclaration(declaration)
      ? declaration.initializer
      : declaration;
  if (!candidate || !ts.isFunctionLike(candidate)) return undefined;
  return candidate;
}

/**
 * The `x` in `VariantProps<typeof x>` or `ComponentProps<typeof x>`, with the
 * kind of reference it came from.
 * @param {ts.Node} node
 * @returns {{ kind: 'variants' | 'component'; query: ts.TypeQueryNode } | undefined}
 */
function typeofArgument(node) {
  if (
    !ts.isTypeReferenceNode(node) &&
    !ts.isExpressionWithTypeArguments(node)
  ) {
    return undefined;
  }
  const [query] = node.typeArguments ?? [];
  if (!query || !ts.isTypeQueryNode(query)) return undefined;

  const reference = ts.isTypeReferenceNode(node)
    ? node.typeName.getText()
    : node.expression.getText();
  if (/(?:^|\.)VariantProps$/.test(reference)) {
    return { kind: 'variants', query };
  }
  if (/(?:^|\.)ComponentProps(?:With(?:out)?Ref)?$/.test(reference)) {
    return { kind: 'component', query };
  }
  return undefined;
}

/**
 * @param {ts.TypeChecker} checker
 * @param {ts.Symbol} cva the variable holding the `cva(…)` call
 * @returns {[string, string][]}
 */
function cvaDefaultVariants(checker, cva) {
  const declaration = cva.valueDeclaration;
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
    .map((property) => {
      const key = property.name.getText().replace(/^['"]|['"]$/g, '');
      return [
        key,
        literalDefault(
          checker,
          property.initializer,
          `${cva.getName()} defaultVariants.${key}`
        ),
      ];
    });
}

/**
 * @param {ts.TypeChecker} checker
 * @param {string} owner
 * @param {ts.ParameterDeclaration | undefined} parameter
 * @returns {[string, string][]}
 */
function destructuringDefaults(checker, owner, parameter) {
  if (!parameter || !ts.isObjectBindingPattern(parameter.name)) return [];

  return parameter.name.elements.flatMap((element) => {
    if (!element.initializer || element.dotDotDotToken) return [];
    const key = (element.propertyName ?? element.name).getText();
    return [
      [key, literalDefault(checker, element.initializer, `${owner}.${key}`)],
    ];
  });
}

/**
 * The JSX attributes `fn` sets on `target`, by name.
 * @param {ts.TypeChecker} checker
 * @param {ts.SignatureDeclaration} fn
 * @param {ts.Symbol} target
 * @returns {Map<string, ts.JsxAttributeValue | undefined>}
 */
function attributesSetOn(checker, fn, target) {
  /** @type {Map<string, ts.JsxAttributeValue | undefined>} */
  const attributes = new Map();

  /** @param {ts.Node} node */
  function visit(node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      symbolAt(checker, node.tagName) === target
    ) {
      for (const attribute of node.attributes.properties) {
        if (!ts.isJsxAttribute(attribute)) continue;
        attributes.set(attribute.name.getText(), attribute.initializer);
      }
    }
    ts.forEachChild(node, visit);
  }

  ts.forEachChild(fn, visit);
  return attributes;
}

/**
 * @param {ts.TypeChecker} checker
 * @param {ts.JsxAttributeValue | undefined} value `undefined` for a bare attribute
 * @param {string} owner
 * @returns {string}
 */
function attributeDefault(checker, value, owner) {
  if (!value) return 'true';
  if (ts.isJsxExpression(value) && value.expression) {
    return literalDefault(checker, value.expression, owner);
  }
  if (ts.isStringLiteral(value)) return JSON.stringify(value.text);
  throw new Error(
    `props JSON: ${owner} is set to \`${value.getText()}\`, which is not a literal.`
  );
}

/**
 * Default values docgen cannot print faithfully: the component's own
 * destructuring defaults, then `x`'s cva `defaultVariants` for
 * `VariantProps<typeof x>`, then the defaults a `ComponentProps<typeof X>`
 * wrapper inherits from `X` — or the value it passes to `<X>` itself.
 * @param {ts.TypeChecker} checker
 * @param {ts.Symbol} symbol the component
 * @returns {Map<string, string>}
 */
export function componentDefaults(checker, symbol) {
  const fn = componentFunction(symbol);
  if (!fn) return new Map();
  return functionDefaults(checker, symbol.getName(), fn);
}

/**
 * @param {ts.TypeChecker} checker
 * @param {string} owner
 * @param {ts.SignatureDeclaration} fn
 * @returns {Map<string, string>}
 */
function functionDefaults(checker, owner, fn) {
  const [parameter] = fn.parameters;
  const defaults = new Map(destructuringDefaults(checker, owner, parameter));
  /** @type {Set<ts.Node>} */
  const visited = new Set();

  /** @param {ts.TypeQueryNode} query */
  function addVariants(query) {
    const cva = symbolAt(checker, query.exprName);
    if (!cva) return;
    for (const [key, value] of cvaDefaultVariants(checker, cva)) {
      if (!defaults.has(key)) defaults.set(key, value);
    }
  }

  /** @param {ts.TypeQueryNode} query */
  function addInherited(query) {
    const target = symbolAt(checker, query.exprName);
    if (!target?.valueDeclaration) return;
    if (!isUnder(target.valueDeclaration.getSourceFile().fileName, reactSrc)) {
      return;
    }

    const attributes = attributesSetOn(checker, fn, target);
    for (const [key, value] of componentDefaults(checker, target)) {
      if (defaults.has(key)) continue;
      defaults.set(
        key,
        attributes.has(key)
          ? attributeDefault(
              checker,
              attributes.get(key),
              `${owner}'s <${target.getName()} ${key}>`
            )
          : value
      );
    }
  }

  /** @param {ts.Node} node */
  function followReference(node) {
    const reference = ts.isTypeReferenceNode(node)
      ? node.typeName
      : ts.isExpressionWithTypeArguments(node)
        ? node.expression
        : undefined;
    if (!reference) return;

    for (const declaration of symbolAt(checker, reference)?.declarations ??
      []) {
      if (!isUnder(declaration.getSourceFile().fileName, reactSrc)) continue;
      if (
        ts.isInterfaceDeclaration(declaration) ||
        ts.isTypeAliasDeclaration(declaration)
      ) {
        visit(declaration);
      }
    }
  }

  /** @param {ts.Node} node */
  function visit(node) {
    if (visited.has(node)) return;
    visited.add(node);

    const argument = typeofArgument(node);
    if (argument?.kind === 'variants') addVariants(argument.query);
    if (argument?.kind === 'component') addInherited(argument.query);
    if (!argument) followReference(node);

    ts.forEachChild(node, visit);
  }

  if (parameter?.type) visit(parameter.type);
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

/**
 * @param {string} slug
 * @param {ComponentEntry[]} components
 * @returns {PropsFile}
 */
export function toPropsFile(slug, components) {
  return { slug, components };
}

/**
 * @param {PropsFile[]} files
 * @returns {PropsIndex}
 */
export function toPropsIndex(files) {
  return Object.fromEntries(
    files.map((file) => [
      file.slug,
      file.components.map((component) => component.name),
    ])
  );
}
