import type { ComponentDoc, PropItem } from 'react-docgen-typescript';

import path from 'node:path';
import ts from 'typescript';

import { resolveAlias } from './props-contract.mjs';
import { isUnder, reactRoot } from './roots.mjs';

export interface PropEntry {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
}

export interface ComponentEntry {
  name: string;
  description: string;
  sourcePath: string;
  props: PropEntry[];
}

export interface PropsFile {
  slug: string;
  components: ComponentEntry[];
}

export type PropsIndex = Record<string, string[]>;

// Resolved only for props the table documents.
type LazyDefault = () => string | null;

const reactSrc = path.join(reactRoot, 'src');

const LITERAL_KEYWORD = /^(?:true|false|null|undefined|-?\d+(?:\.\d+)?)$/;

/** A default as the Props table shows it: a JSON string, a number, a boolean or null. */
export function literalDefaultValue(text: string, owner: string): string {
  const quoted = text.match(/^(['"])(.*)\1$/s);
  if (quoted) return JSON.stringify(quoted[2]);
  if (LITERAL_KEYWORD.test(text)) return text;
  throw new Error(
    `props JSON: ${owner} defaults to \`${text}\`, which is not a literal. Use a string, number, boolean or null, or drop the default and describe it in the prop's description.`
  );
}

function literalDefault(
  checker: ts.TypeChecker,
  node: ts.Expression,
  owner: string
): string {
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

export function symbolAt(
  checker: ts.TypeChecker,
  node: ts.Node
): ts.Symbol | undefined {
  const symbol = checker.getSymbolAtLocation(node);
  return symbol && resolveAlias(checker, symbol);
}

function componentFunction(symbol: ts.Symbol) {
  const declaration = symbol.declarations?.[0];
  const candidate =
    declaration && ts.isVariableDeclaration(declaration)
      ? declaration.initializer
      : declaration;
  if (!candidate || !ts.isFunctionLike(candidate)) return undefined;
  return candidate;
}

// The `typeof x` in `VariantProps<typeof x>` or `ComponentProps<typeof x>`.
export function typeofArgument(
  node: ts.Node
): { kind: 'variants' | 'component'; query: ts.TypeQueryNode } | undefined {
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

export function cvaDefaultVariants(
  checker: ts.TypeChecker,
  cva: ts.Symbol
): [string, LazyDefault][] {
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

function destructuringDefaults(
  checker: ts.TypeChecker,
  owner: string,
  parameter: ts.ParameterDeclaration | undefined
): [string, LazyDefault][] {
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
function isForwardedProp(
  checker: ts.TypeChecker,
  fn: ts.SignatureDeclaration,
  value: ts.JsxAttributeValue | undefined
) {
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

function attributeDefault(
  checker: ts.TypeChecker,
  value: ts.JsxAttributeValue | undefined,
  owner: string
) {
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
function carriesKey(
  checker: ts.TypeChecker,
  type: ts.Type,
  key: string
): boolean {
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
function attributeSettings(
  checker: ts.TypeChecker,
  owner: string,
  fn: ts.SignatureDeclaration,
  target: ts.Symbol,
  element: ts.JsxOpeningElement | ts.JsxSelfClosingElement
) {
  const { properties } = element.attributes;
  const settings = new Map<string, LazyDefault>();

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
function attributeDefaults(
  checker: ts.TypeChecker,
  owner: string,
  fn: ts.SignatureDeclaration,
  target: ts.Symbol,
  inherited: Map<string, LazyDefault>
) {
  const settingsPerElement: Map<string, LazyDefault>[] = [];

  function visit(node: ts.Node) {
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

  const defaults = new Map<string, LazyDefault>();
  for (const key of keys) {
    const own = inherited.get(key) ?? (() => null);
    defaults.set(key, () => {
      const [first = null, ...rest] = settingsPerElement.map((settings) =>
        (settings.get(key) ?? own)()
      );
      if (rest.every((value) => value === first)) return first;
      throw new Error(
        `props JSON: ${owner} passes different \`${key}\` values to <${target.getName()}>, so it has no single default. Set one in the component's own props destructuring.`
      );
    });
  }
  return defaults;
}

export function componentDefaults(
  checker: ts.TypeChecker,
  symbol: ts.Symbol
): Map<string, LazyDefault> {
  const fn = componentFunction(symbol);
  if (!fn) return new Map();
  return functionDefaults(checker, symbol.getName(), fn);
}

// Destructuring defaults win over cva `defaultVariants`, which win over the
// defaults a `ComponentProps<typeof X>` wrapper inherits from `X`.
function functionDefaults(
  checker: ts.TypeChecker,
  owner: string,
  fn: ts.SignatureDeclaration
) {
  const [parameter] = fn.parameters;
  const defaults = new Map(destructuringDefaults(checker, owner, parameter));
  const visited = new Set<ts.Node>();

  function addMissing(entries: Iterable<[string, LazyDefault]>) {
    for (const [key, value] of entries) {
      if (!defaults.has(key)) defaults.set(key, value);
    }
  }

  function addInherited(query: ts.TypeQueryNode) {
    const target = symbolAt(checker, query.exprName);
    const fileName = target?.valueDeclaration?.getSourceFile().fileName;
    if (!target || !fileName || !isUnder(fileName, reactSrc)) return;

    const inherited = componentDefaults(checker, target);
    addMissing(attributeDefaults(checker, owner, fn, target, inherited));
  }

  function followReference(node: ts.Node) {
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

  function visit(node: ts.Node) {
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

function toPropEntry(
  prop: PropItem,
  expansions: Map<string, string>,
  defaults: Map<string, LazyDefault>
): PropEntry {
  return {
    name: prop.name,
    type: expansions.get(prop.type.name) ?? prop.type.name,
    required: prop.required,
    defaultValue: defaults.get(prop.name)?.() ?? null,
    description: prop.description,
  };
}

export function toComponentEntry(
  name: string,
  sourcePath: string,
  doc: ComponentDoc,
  expansions: Map<string, string>,
  defaults: Map<string, LazyDefault>
): ComponentEntry {
  return {
    name,
    description: doc.description,
    sourcePath,
    props: Object.values(doc.props)
      .map((prop) => toPropEntry(prop, expansions, defaults))
      .sort((a, b) => a.name.localeCompare(b.name, 'en')),
  };
}

export function toProplessEntry(
  checker: ts.TypeChecker,
  name: string,
  sourcePath: string,
  symbol: ts.Symbol
): ComponentEntry {
  return {
    name,
    description: ts
      .displayPartsToString(symbol.getDocumentationComment(checker))
      .replace(/\r\n/g, '\n'),
    sourcePath,
    props: [],
  };
}

export function toPropsFile(
  slug: string,
  components: ComponentEntry[]
): PropsFile {
  return { slug, components };
}

export function toPropsIndex(files: PropsFile[]): PropsIndex {
  return Object.fromEntries(
    files.map((file) => [
      file.slug,
      file.components.map((component) => component.name),
    ])
  );
}
