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

// Resolved only when the prop has no `@default` tag.
/** @typedef {() => string | null} LazyDefault */

const reactSrc = path.join(reactRoot, 'src');

const LITERAL_KEYWORD = /^(?:true|false|null|undefined|-?\d+(?:\.\d+)?)$/;

/** @param {PropItem} prop */
function tagsOf(prop) {
  return /** @type {Record<string, string | undefined>} */ (prop.tags ?? {});
}

/**
 * @param {PropItem} prop
 * @param {LazyDefault | undefined} codeDefault
 * @returns {string | null}
 */
function toDefaultValue(prop, codeDefault) {
  const tag = tagsOf(prop).default;
  if (tag === undefined) return codeDefault?.() ?? null;

  const quoted = tag.match(/^(['"])(.*)\1$/s);
  if (quoted) return JSON.stringify(quoted[2]);
  if (LITERAL_KEYWORD.test(tag)) return tag;
  throw new Error(
    `props JSON: ${prop.parent?.name ?? 'a component'}.${prop.name} has \`@default ${tag}\`, which is not a literal. Put the explanation in the prop's description and drop the tag, or give a quoted string, number, boolean or null.`
  );
}

/**
 * @param {ts.TypeChecker} checker
 * @param {ts.Expression} node
 * @param {string} owner
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
 */
function symbolAt(checker, node) {
  const symbol = checker.getSymbolAtLocation(node);
  return symbol && resolveAlias(checker, symbol);
}

/** @param {ts.Symbol} symbol */
function componentFunction(symbol) {
  const declaration = symbol.declarations?.[0];
  const candidate =
    declaration && ts.isVariableDeclaration(declaration)
      ? declaration.initializer
      : declaration;
  if (!candidate || !ts.isFunctionLike(candidate)) return undefined;
  return candidate;
}

// The `typeof x` in `VariantProps<typeof x>` or `ComponentProps<typeof x>`.
/**
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
 * @param {ts.Symbol} cva
 * @returns {[string, LazyDefault][]}
 */
function cvaDefaultVariants(checker, cva) {
  const declaration = cva.valueDeclaration;
  if (!declaration || !ts.isVariableDeclaration(declaration)) return [];
  const call = declaration.initializer;
  if (!call || !ts.isCallExpression(call)) return [];
  const config = call.arguments[1];
  if (!config || !ts.isObjectLiteralExpression(config)) return [];

  const defaults = config.properties
    .filter(ts.isPropertyAssignment)
    .find((property) => property.name.getText() === 'defaultVariants');
  if (!defaults || !ts.isObjectLiteralExpression(defaults.initializer)) {
    return [];
  }

  return defaults.initializer.properties
    .filter(ts.isPropertyAssignment)
    .map((property) => {
      const key = property.name.getText().replace(/^['"]|['"]$/g, '');
      const owner = `${cva.getName()} defaultVariants.${key}`;
      return [key, () => literalDefault(checker, property.initializer, owner)];
    });
}

/**
 * @param {ts.TypeChecker} checker
 * @param {string} owner
 * @param {ts.ParameterDeclaration | undefined} parameter
 * @returns {[string, LazyDefault][]}
 */
function destructuringDefaults(checker, owner, parameter) {
  if (!parameter || !ts.isObjectBindingPattern(parameter.name)) return [];

  return parameter.name.elements.flatMap(
    ({ dotDotDotToken, initializer, name, propertyName }) => {
      if (!initializer || dotDotDotToken) return [];
      const key = (propertyName ?? name).getText();
      return [
        [key, () => literalDefault(checker, initializer, `${owner}.${key}`)],
      ];
    }
  );
}

// `variant={variant}`, where `variant` is destructured from `fn`'s own props.
/**
 * @param {ts.TypeChecker} checker
 * @param {ts.SignatureDeclaration} fn
 * @param {ts.JsxAttributeValue | undefined} value
 */
function isForwardedProp(checker, fn, value) {
  if (!value || !ts.isJsxExpression(value) || !value.expression) return false;
  if (!ts.isIdentifier(value.expression)) return false;
  const declaration = symbolAt(checker, value.expression)?.valueDeclaration;
  const [parameter] = fn.parameters;
  if (!declaration || !parameter || !ts.isBindingElement(declaration)) {
    return false;
  }
  return (
    ts.findAncestor(declaration, (node) => node === parameter) !== undefined
  );
}

/**
 * @param {ts.TypeChecker} checker
 * @param {ts.JsxAttributeValue | undefined} value
 * @param {string} owner
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

// A type the checker cannot rule out — `any`, an unconstrained type
// parameter, an index signature, one union member — counts as carrying `key`.
/**
 * @param {ts.TypeChecker} checker
 * @param {ts.Type} type
 * @param {string} key
 * @returns {boolean}
 */
function carriesKey(checker, type, key) {
  if (type.flags & ts.TypeFlags.TypeParameter) {
    const constraint = checker.getBaseConstraintOfType(type);
    return !constraint || carriesKey(checker, constraint, key);
  }
  if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return true;
  if (type.isUnion()) {
    return type.types.some((member) => carriesKey(checker, member, key));
  }
  return (
    type.getProperty(key) !== undefined ||
    checker.getIndexInfosOfType(type).length > 0
  );
}

// An attribute a later spread can override is a default; any other fixes the
// prop, so it has none. A forwarded prop keeps `X`'s own default.
/**
 * @param {ts.TypeChecker} checker
 * @param {string} owner
 * @param {ts.SignatureDeclaration} fn
 * @param {ts.Symbol} target
 * @param {ts.JsxOpeningElement | ts.JsxSelfClosingElement} element
 */
function attributeSettings(checker, owner, fn, target, element) {
  const { properties } = element.attributes;
  /** @type {Map<string, LazyDefault>} */
  const settings = new Map();

  properties.forEach((attribute, position) => {
    if (!ts.isJsxAttribute(attribute)) return;
    const key = attribute.name.getText();
    const value = attribute.initializer;
    if (isForwardedProp(checker, fn, value)) return;

    const overridable = properties
      .slice(position + 1)
      .some(
        (property) =>
          ts.isJsxSpreadAttribute(property) &&
          carriesKey(
            checker,
            checker.getTypeAtLocation(property.expression),
            key
          )
      );
    const where = `${owner}'s <${target.getName()} ${key}>`;
    settings.set(key, () =>
      overridable ? attributeDefault(checker, value, where) : null
    );
  });

  return settings;
}

// Every `<X>` in `fn` must leave a prop at the same default.
/**
 * @param {ts.TypeChecker} checker
 * @param {string} owner
 * @param {ts.SignatureDeclaration} fn
 * @param {ts.Symbol} target
 * @param {Map<string, LazyDefault>} inherited
 */
function attributeDefaults(checker, owner, fn, target, inherited) {
  /** @type {Map<string, LazyDefault>[]} */
  const settingsPerElement = [];

  /** @param {ts.Node} node */
  function visit(node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      symbolAt(checker, node.tagName) === target
    ) {
      settingsPerElement.push(
        attributeSettings(checker, owner, fn, target, node)
      );
    }
    ts.forEachChild(node, visit);
  }

  ts.forEachChild(fn, visit);
  if (settingsPerElement.length === 0) return inherited;

  const keys = new Set([
    ...inherited.keys(),
    ...settingsPerElement.flatMap((settings) => [...settings.keys()]),
  ]);

  /** @type {Map<string, LazyDefault>} */
  const defaults = new Map();
  for (const key of keys) {
    const own = inherited.get(key) ?? (() => null);
    defaults.set(key, () => {
      const [first = null, ...rest] = settingsPerElement.map((settings) =>
        (settings.get(key) ?? own)()
      );
      if (rest.every((value) => value === first)) return first;
      throw new Error(
        `props JSON: ${owner} passes different \`${key}\` values to <${target.getName()}>, so it has no single default. Give it an \`@default\` tag.`
      );
    });
  }
  return defaults;
}

/**
 * @param {ts.TypeChecker} checker
 * @param {ts.Symbol} symbol
 * @returns {Map<string, LazyDefault>}
 */
export function componentDefaults(checker, symbol) {
  const fn = componentFunction(symbol);
  if (!fn) return new Map();
  return functionDefaults(checker, symbol.getName(), fn);
}

// Destructuring defaults win over cva `defaultVariants`, which win over the
// defaults a `ComponentProps<typeof X>` wrapper inherits from `X`.
/**
 * @param {ts.TypeChecker} checker
 * @param {string} owner
 * @param {ts.SignatureDeclaration} fn
 */
function functionDefaults(checker, owner, fn) {
  const [parameter] = fn.parameters;
  const defaults = new Map(destructuringDefaults(checker, owner, parameter));
  /** @type {Set<ts.Node>} */
  const visited = new Set();

  /** @param {Iterable<[string, LazyDefault]>} entries */
  function addMissing(entries) {
    for (const [key, value] of entries) {
      if (!defaults.has(key)) defaults.set(key, value);
    }
  }

  /** @param {ts.TypeQueryNode} query */
  function addInherited(query) {
    const target = symbolAt(checker, query.exprName);
    const fileName = target?.valueDeclaration?.getSourceFile().fileName;
    if (!target || !fileName || !isUnder(fileName, reactSrc)) return;

    const inherited = componentDefaults(checker, target);
    addMissing(attributeDefaults(checker, owner, fn, target, inherited));
  }

  /** @param {ts.Node} node */
  function followReference(node) {
    const reference = ts.isTypeReferenceNode(node)
      ? node.typeName
      : ts.isExpressionWithTypeArguments(node)
        ? node.expression
        : undefined;
    if (!reference) return;

    const declarations = symbolAt(checker, reference)?.declarations ?? [];
    for (const declaration of declarations) {
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
    if (visited.has(node) || ts.isPropertySignature(node)) return;
    visited.add(node);

    const argument = typeofArgument(node);
    if (!argument) {
      followReference(node);
    } else if (argument.kind === 'variants') {
      const cva = symbolAt(checker, argument.query.exprName);
      if (cva) addMissing(cvaDefaultVariants(checker, cva));
    } else {
      addInherited(argument.query);
    }

    ts.forEachChild(node, visit);
  }

  if (parameter?.type) visit(parameter.type);
  return defaults;
}

/**
 * @param {PropItem} prop
 * @param {Map<string, string>} expansions
 * @param {Map<string, LazyDefault>} defaults
 * @returns {PropEntry}
 */
function toPropEntry(prop, expansions, defaults) {
  return {
    name: prop.name,
    type: expansions.get(prop.type.name) ?? prop.type.name,
    required: prop.required,
    defaultValue: toDefaultValue(prop, defaults.get(prop.name)),
    description: prop.description,
    // Unlike `description`, docgen leaves tag values with CRLF line endings.
    example: tagsOf(prop).example?.replace(/\r\n/g, '\n') ?? null,
  };
}

/**
 * @param {string} name
 * @param {string} sourcePath
 * @param {ComponentDoc} doc
 * @param {Map<string, string>} expansions
 * @param {Map<string, LazyDefault>} defaults
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
