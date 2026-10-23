import { parse } from '@babel/parser';
import {
  isImportDeclaration,
  isJSXAttribute,
  isJSXElement,
  isJSXIdentifier,
  type JSXElement,
  type Node,
  type Program,
  traverseFast,
} from '@babel/types';

import { CliError } from '../errors';

export function parseModule(source: string, file: string): Program {
  try {
    return parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    }).program;
  } catch (error) {
    throw new CliError(
      `Could not parse ${file}: ${(error as Error).message}. Fix the syntax error, then run the command again.`
    );
  }
}

// Babel sets both offsets on every node it parses.
export function startOf(node: Node) {
  return node.start as number;
}

export function endOf(node: Node) {
  return node.end as number;
}

/** The first node under `root`, depth first, that `matches`. */
export function findNode<T extends Node>(
  root: Node,
  matches: (node: Node) => node is T
): T | undefined {
  let found: T | undefined;
  traverseFast(root, (node) => {
    if (!matches(node)) return undefined;
    found = node;
    return traverseFast.stop;
  });
  return found;
}

/** The name of a JSX element, such as `html` or `App`. */
export function jsxName(element: JSXElement) {
  const { name } = element.openingElement;
  return isJSXIdentifier(name) ? name.name : undefined;
}

export function findJsx(root: Node, name: string) {
  return findNode(
    root,
    (node): node is JSXElement => isJSXElement(node) && jsxName(node) === name
  );
}

export type Insertion = { at: number; text: string };

/** Applies insertions back to front, so earlier offsets stay valid. */
export function applyInsertions(source: string, insertions: Insertion[]) {
  return [...insertions]
    .sort((a, b) => b.at - a.at)
    .reduce(
      (text, { at, text: inserted }) =>
        text.slice(0, at) + inserted + text.slice(at),
      source
    );
}

/**
 * Inserts `lines` after the module's last import, else after its directives
 * (`'use client'`), else at the top. Lines are written with single quotes and
 * semicolons, and follow the file's first import when it uses double quotes
 * or no semicolons.
 */
export function importInsertion(
  source: string,
  program: Program,
  lines: string[]
): Insertion {
  const imports = program.body.filter((node) => isImportDeclaration(node));
  const first = imports[0];
  const quote = first && source[startOf(first.source)];
  const semicolons = !first || source[endOf(first) - 1] === ';';
  const text = lines
    .map((line) => (quote === '"' ? line.replaceAll("'", '"') : line))
    .map((line) => (semicolons ? line : line.replace(/;$/, '')))
    .join('\n');

  const lastImport = imports.at(-1);
  if (lastImport) return { at: endOf(lastImport), text: `\n${text}` };
  const lastDirective = program.directives.at(-1);
  if (lastDirective) return { at: endOf(lastDirective), text: `\n\n${text}` };
  return { at: 0, text: `${text}\n\n` };
}

/** The leading whitespace of the line `offset` is on. */
export function lineIndent(source: string, offset: number) {
  const lineStart = source.lastIndexOf('\n', offset - 1) + 1;
  return /^[ \t]*/.exec(source.slice(lineStart))?.[0] ?? '';
}

/** The offset where the whitespace before `offset` begins. */
export function beforeWhitespace(source: string, offset: number) {
  let at = offset;
  while (at > 0 && /\s/.test(source.charAt(at - 1))) at -= 1;
  return at;
}

/** The offset just after an element's opening tag. */
export function openingTagEnd(element: JSXElement) {
  return endOf(element.openingElement);
}

export function hasAttribute(element: JSXElement, name: string) {
  return element.openingElement.attributes.some(
    (attribute) =>
      isJSXAttribute(attribute) &&
      isJSXIdentifier(attribute.name) &&
      attribute.name.name === name
  );
}

/** Inserts ` name` as the last attribute of an element's opening tag. */
export function attributeInsertion(
  element: JSXElement,
  name: string
): Insertion {
  const opening = element.openingElement;
  const tagEnd = endOf(opening) - (opening.selfClosing ? 2 : 1);
  return { at: tagEnd, text: ` ${name}` };
}
