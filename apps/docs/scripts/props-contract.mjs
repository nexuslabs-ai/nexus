import path from 'node:path';

import ts from 'typescript';

import { isUnder, toRepoPath } from './react-sources.mjs';

export function toSlugFolder(relativePath) {
  if (path.isAbsolute(relativePath)) return null;

  const segments = relativePath.split(path.sep);
  if (segments.length < 2) return null;
  if (segments[0] === '..') return null;

  return segments[0];
}

// docgen reports a `cva` variant key as a PropItem with no declarations and no parent.
function isSynthesized(prop) {
  return (prop.declarations ?? []).length === 0 && !prop.parent;
}

export function isOwnProp(prop) {
  if (isSynthesized(prop)) return true;
  return (prop.declarations ?? []).some(
    (declaration) => !declaration.fileName.includes('node_modules')
  );
}

function branches(type) {
  return type.isUnion() ? type.types : [type];
}

function hasStringIndex(checker, propsType) {
  return branches(propsType).some((branch) =>
    checker
      .getIndexInfosOfType(branch)
      .some((info) => (info.keyType.flags & ts.TypeFlags.String) !== 0)
  );
}

// Matches `cva` however it is imported or re-bound: by the declaration its call resolves to.
function isCvaCall(checker, node) {
  if (!ts.isCallExpression(node)) return false;

  const declaration = checker.getResolvedSignature(node)?.getDeclaration();
  const variable = declaration?.parent;
  return (
    variable !== undefined &&
    ts.isVariableDeclaration(variable) &&
    ts.isIdentifier(variable.name) &&
    variable.name.text === 'cva' &&
    variable.getSourceFile().fileName.includes('/class-variance-authority/')
  );
}

function variantKeyDeclarations(checker, node) {
  if (!isCvaCall(checker, node)) return [];

  const config = node.arguments[1];
  if (!config) return [];

  const variants = checker.getTypeAtLocation(config).getProperty('variants');
  if (!variants) return [];

  return checker
    .getNonNullableType(checker.getTypeOfSymbol(variants))
    .getProperties()
    .flatMap((key) => key.declarations ?? []);
}

// The declarations of every key in a `cva()` config's `variants`, however the config is written.
export function cvaVariantKeys(checker, sourceFiles) {
  const keys = new Set();

  function visit(node) {
    for (const declaration of variantKeyDeclarations(checker, node)) {
      keys.add(declaration);
    }
    ts.forEachChild(node, visit);
  }

  for (const sourceFile of sourceFiles) visit(sourceFile);

  if (keys.size === 0) {
    throw new Error(
      'props JSON: no cva() call with `variants` resolved to the `cva` declared in class-variance-authority/dist/index.d.ts, so no variant key would be checked. Update isCvaCall in apps/docs/scripts/props-contract.mjs to match the installed class-variance-authority.'
    );
  }

  return keys;
}

function variantKeyProblem(member, documentedProps) {
  const documented = documentedProps[member.name];
  if (!documented) return 'missing from the docgen output';

  return documented.type.name.split(' | ').includes('string')
    ? `widened to ${documented.type.name} in the docgen output`
    : null;
}

// Checks each props type the checker resolves against the docgen output for it.
export function propsContractProblems(
  checker,
  variantKeys,
  name,
  symbol,
  documentedProps
) {
  const declaration = symbol.declarations[0];
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);

  const problems = [
    ...checker.getSignaturesOfType(type, ts.SignatureKind.Call),
    ...checker.getSignaturesOfType(type, ts.SignatureKind.Construct),
  ]
    .flatMap((signature) => signature.parameters.slice(0, 1))
    .map((props) => checker.getTypeOfSymbolAtLocation(props, declaration))
    .flatMap((propsType) => {
      if (hasStringIndex(checker, propsType)) {
        return [`${name}: accepts arbitrary string-keyed props`];
      }

      return checker
        .getPropertiesOfType(propsType)
        .filter((member) => variantKeys.has(member.declarations?.[0]))
        .flatMap((member) => {
          const problem = variantKeyProblem(member, documentedProps);
          return problem ? [`${name}.${member.name}: ${problem}`] : [];
        });
    });

  // A class component resolves the same props through each `React.Component` constructor overload.
  return [...new Set(problems)];
}

// Only a type export keeps the alias flag; a value export resolves through it.
export function isTypeExport(doc) {
  return ((doc.expression?.flags ?? 0) & ts.SymbolFlags.Alias) !== 0;
}

// `displayName` is the primitive's name for `const DrawerPortal = DrawerPrimitive.Portal`.
export function exportName(doc) {
  return doc.rootExpression?.getName() ?? doc.displayName;
}

function declarationPath(doc) {
  const sourceFile = doc.expression?.declarations?.[0]?.getSourceFile?.();
  return sourceFile ? toRepoPath(sourceFile.fileName) : null;
}

export function isReExport(doc, parsedPaths) {
  const declaredIn = declarationPath(doc);
  return (
    declaredIn !== null &&
    declaredIn !== toRepoPath(doc.filePath) &&
    parsedPaths.has(declaredIn)
  );
}

function isComponentName(name) {
  return /^[A-Z]/.test(name) && !/^[A-Z0-9_]+$/.test(name);
}

// A function component has a call signature; a class component's instance has `render`.
function isRenderable(checker, symbol) {
  const declaration = symbol.declarations?.[0];
  if (!declaration) return false;

  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  if (checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0) {
    return true;
  }

  return checker
    .getSignaturesOfType(type, ts.SignatureKind.Construct)
    .some((signature) =>
      checker.getPropertyOfType(
        checker.getReturnTypeOfSignature(signature),
        'render'
      )
    );
}

function resolveAlias(checker, symbol) {
  if ((symbol.flags & ts.SymbolFlags.Alias) === 0) return symbol;
  try {
    return checker.getAliasedSymbol(symbol);
  } catch {
    return symbol;
  }
}

export function publicExports(checker, program, entryPoints) {
  const exported = new Map();

  for (const entry of entryPoints) {
    const sourceFile = program.getSourceFile(entry);
    if (!sourceFile) {
      throw new Error(
        `Entry point ${toRepoPath(entry)} is not in the program; check the "exports" map still points at a file under src/.`
      );
    }

    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) {
      throw new Error(
        `Entry point ${toRepoPath(entry)} exports nothing; check it is still a module.`
      );
    }

    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
      exported.set(symbol.getName(), resolveAlias(checker, symbol));
    }
  }

  return exported;
}

export function publicComponents(checker, exported, componentsRoot) {
  const found = [];

  for (const [name, symbol] of exported) {
    if (!isComponentName(name)) continue;
    if (!isRenderable(checker, symbol)) continue;

    const { fileName } = symbol.declarations[0].getSourceFile();
    if (!toSlugFolder(path.relative(componentsRoot, fileName))) {
      throw new Error(
        `@nexus_ds/react exports the component ${name} from ${toRepoPath(fileName)}; it needs a folder of its own under ${toRepoPath(componentsRoot)}/ to get a props entry.`
      );
    }

    found.push([name, symbol]);
  }

  return new Map(found.sort(([a], [b]) => a.localeCompare(b, 'en')));
}

function importedWorkspaceSpecifiers(sourceFiles, manifest) {
  const packages = Object.entries({
    ...manifest.dependencies,
    ...manifest.peerDependencies,
  })
    .filter(([, range]) => range.startsWith('workspace:'))
    .map(([name]) => name);

  const imported = new Set();

  for (const sourceFile of sourceFiles) {
    for (const statement of sourceFile.statements) {
      // A side-effect import binds no names, so it cannot reach a prop type.
      const bindsNames = ts.isImportDeclaration(statement)
        ? Boolean(statement.importClause)
        : ts.isExportDeclaration(statement);
      if (!bindsNames) continue;

      const specifier = statement.moduleSpecifier?.text;
      if (!specifier) continue;

      const isWorkspace = packages.some(
        (name) => specifier === name || specifier.startsWith(`${name}/`)
      );
      if (isWorkspace) imported.add(specifier);
    }
  }

  return [...imported].sort();
}

const DECLARATION_EXTENSIONS = new Set([
  ts.Extension.Dts,
  ts.Extension.Dcts,
  ts.Extension.Dmts,
]);

// An unbuilt workspace dependency widens its types to `any` without a diagnostic.
export function assertWorkspaceTypes(
  program,
  { srcRoot, manifest, compilerOptions, containingFile }
) {
  const specifiers = importedWorkspaceSpecifiers(
    program.getSourceFiles().filter((file) => isUnder(file.fileName, srcRoot)),
    manifest
  );

  const untyped = specifiers.filter((specifier) => {
    const { resolvedModule } = ts.resolveModuleName(
      specifier,
      containingFile,
      compilerOptions,
      ts.sys
    );
    return (
      !resolvedModule || !DECLARATION_EXTENSIONS.has(resolvedModule.extension)
    );
  });

  if (untyped.length === 0) return;

  throw new Error(
    [
      'props JSON: a workspace dependency resolves to no type declarations, so every prop typed through it would be documented as `any`.',
      'Build the workspace dependencies first: pnpm turbo build --filter=@nexus_ds/react',
      ...untyped.map((specifier) => `  ${specifier}`),
    ].join('\n')
  );
}

// Namespace imports print as a file-local prefix; `React.` is the exception.
export function opaqueNamespaceNames(sourceFile) {
  return sourceFile.statements.flatMap((statement) => {
    if (!ts.isImportDeclaration(statement)) return [];

    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamespaceImport(bindings)) return [];

    const name = bindings.name.text;
    if (statement.moduleSpecifier.text === 'react' && name === 'React') {
      return [];
    }
    return [name];
  });
}

// `import(...)` embeds a machine path; a namespace prefix only resolves in its own file.
export function isPortableExpansion(text, opaqueNamespaces) {
  if (text.includes('import(')) return false;
  return !opaqueNamespaces.some((namespace) =>
    new RegExp(`\\b${namespace}\\.`).test(text)
  );
}
