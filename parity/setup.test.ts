import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { copies, dependencies } from './parity.ts';

const read = (file: string) =>
  readFileSync(path.resolve(process.cwd(), file), 'utf8');

const printer = ts.createPrinter({ removeComments: true });

function unwrap(node: ts.Expression): ts.Expression {
  let current = node;
  while (ts.isAsExpression(current) || ts.isSatisfiesExpression(current)) {
    current = current.expression;
  }
  return current;
}

/** The `const preview = { … }` object a Storybook preview file exports. */
function readPreview(file: string) {
  const source = ts.createSourceFile(
    file,
    read(file),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const init = declaration.initializer && unwrap(declaration.initializer);
      if (declaration.name.getText() !== 'preview') continue;
      if (init && ts.isObjectLiteralExpression(init)) return { source, init };
    }
  }
  throw new Error(`${file} has no \`const preview = { … }\`.`);
}

function member(object: ts.ObjectLiteralExpression, name: string) {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    if (property.name.getText() !== name) continue;
    const value = unwrap(property.initializer);
    if (ts.isObjectLiteralExpression(value)) return value;
  }
  throw new Error(`preview has no \`${name}: { … }\`.`);
}

function keys(object: ts.ObjectLiteralExpression) {
  return object.properties.map((property) => property.name?.getText()).sort();
}

const react = readPreview('packages/react/.storybook/preview.tsx');
const vue = readPreview('packages/vue/.storybook/preview.ts');

function manifest(framework: 'react' | 'vue') {
  const { dependencies: declared } = JSON.parse(
    read(`packages/${framework}/package.json`)
  );
  return declared as Record<string, string>;
}

describe('shared setup', () => {
  it.each(copies)('%s is copied unchanged to %s', (reactFile, vueFile) => {
    expect(read(vueFile)).toBe(read(reactFile));
  });

  it.each(['parameters', 'globalTypes', 'initialGlobals'])(
    'both Storybook previews set the same %s',
    (name) => {
      expect(keys(member(vue.init, name))).toEqual(
        keys(member(react.init, name))
      );
    }
  );

  it('both Storybook previews run the same axe rules', () => {
    const print = ({ source, init }: typeof react) =>
      printer.printNode(
        ts.EmitHint.Expression,
        member(member(init, 'parameters'), 'a11y'),
        source
      );
    expect(print(vue)).toBe(print(react));
  });

  it.each(dependencies)(
    '%s and %s take the same range',
    (reactName, vueName) => {
      const range = manifest('react')[reactName];
      expect(range).toBeDefined();
      expect(manifest('vue')[vueName]).toBe(range);
    }
  );
});
