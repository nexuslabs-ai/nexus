import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import {
  componentsRoot,
  vueComponentsRoot,
} from '../apps/docs/scripts/roots.mjs';

import { shared, vueOnlyDeclarations } from './parity.ts';

const printer = ts.createPrinter({ removeComments: true });

/** `[react, vue]` files holding each component's class recipes. */
const RECIPE_FILES: [react: string, vue: string][] = [
  ...shared.map((slug): [string, string] => [
    path.join(componentsRoot, slug, `${slug}.tsx`),
    path.join(vueComponentsRoot, slug, 'index.ts'),
  ]),
  [
    path.join(componentsRoot, 'overlay-layout', 'overlay-layout.ts'),
    path.join(vueComponentsRoot, 'overlay-layout', 'overlay-layout.ts'),
  ],
];

function withoutExport(modifiers: ts.NodeArray<ts.ModifierLike> | undefined) {
  return modifiers?.filter(
    (modifier) => modifier.kind !== ts.SyntaxKind.ExportKeyword
  );
}

/** Each top-level `const` and `function` in `file`, printed without `export` or comments. */
function valueDeclarations(file: string) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const print = (node: ts.Node) =>
    printer.printNode(ts.EmitHint.Unspecified, node, source);
  const declared = new Map<string, string>();

  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        declared.set(declaration.name.getText(), print(declaration));
      }
    }
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      const bare = ts.factory.updateFunctionDeclaration(
        statement,
        withoutExport(statement.modifiers),
        statement.asteriskToken,
        statement.name,
        statement.typeParameters,
        statement.parameters,
        statement.type,
        statement.body
      );
      declared.set(statement.name.text, print(bare));
    }
  }
  return declared;
}

const declarations = RECIPE_FILES.flatMap(([reactFile, vueFile]) => {
  const react = valueDeclarations(reactFile);
  const key = path.relative(vueComponentsRoot, vueFile);
  return [...valueDeclarations(vueFile)].map(([name, vue]) => ({
    id: `${key}#${name}`,
    vueFile,
    vue,
    react: react.get(name),
  }));
});

const paired = declarations.filter(({ react }) => react !== undefined);

describe('class recipes', () => {
  it('declares nothing in a Vue recipe file that React lacks', () => {
    const vueOnly = declarations
      .filter(
        ({ id, react }) => react === undefined && !(id in vueOnlyDeclarations)
      )
      .map(({ id }) => id);
    expect(vueOnly).toEqual([]);
  });

  it('allows only Vue-only declarations that still exist', () => {
    const stale = Object.keys(vueOnlyDeclarations).filter(
      (id) =>
        !declarations.some(
          (declaration) =>
            declaration.id === id && declaration.react === undefined
        )
    );
    expect(stale).toEqual([]);
  });

  it('compares every Vue file that defines a cva recipe', () => {
    const recipeFiles = RECIPE_FILES.map(([, vueFile]) => vueFile).filter(
      (vueFile) => readFileSync(vueFile, 'utf8').includes('cva(')
    );
    const compared = new Set(paired.map(({ vueFile }) => vueFile));
    expect(recipeFiles.filter((vueFile) => !compared.has(vueFile))).toEqual([]);
    expect(recipeFiles.length).toBeGreaterThan(0);
  });

  it.each(paired)('$id matches React', ({ vue, react }) => {
    expect(vue).toBe(react);
  });
});
