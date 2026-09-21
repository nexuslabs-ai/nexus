/**
 * What the props JSON documents: which files are read, which of docgen's
 * reports count, and which of the package's exports are components. The
 * generator turns the answers into files; nothing here touches disk, so every
 * rule can be exercised without running it.
 */

import path from 'node:path';

import ts from 'typescript';

import { repoRoot } from './roots.mjs';

export function toRepoPath(absolutePath) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join('/');
}

/**
 * The slug is the folder a component lives in. A path that escapes
 * `components/`, or names a file sitting directly in it, has no slug and so no
 * page to land on.
 */
export function toSlugFolder(relativePath) {
  if (path.isAbsolute(relativePath)) return null;

  const segments = relativePath.split(path.sep);
  if (segments.length < 2) return null;
  if (segments[0] === '..') return null;

  return segments[0];
}

export function isComponentSource(filePath) {
  const name = path.basename(filePath);
  if (!/\.tsx?$/.test(name)) return false;
  if (/\.(?:stories|test)\.tsx?$/.test(name)) return false;
  // A barrel would re-report every component it re-exports under a second
  // source path.
  return !/^index\.tsx?$/.test(name);
}

/**
 * Keeps a prop only when this repo declares it. Props reaching a component
 * through `React.ComponentProps<'element'>` or a Radix primitive resolve to a
 * declaration under `node_modules`; `cva` variant keys arrive as synthesized
 * mapped-type members carrying neither a declaration nor a parent.
 */
export function isOwnProp(prop) {
  const declarations = prop.declarations ?? [];
  if (declarations.length === 0) return !prop.parent;
  return declarations.some(
    (declaration) => !declaration.fileName.includes('node_modules')
  );
}

/**
 * docgen reports every export it can attach a doc comment to, so type exports
 * (`type AttachmentState`, `interface BadgeProps`) arrive alongside the
 * components. Only a type export keeps the alias flag — anything exported as a
 * value resolves through to its function or interface symbol.
 */
export function isTypeExport(doc) {
  return ((doc.expression?.flags ?? 0) & ts.SymbolFlags.Alias) !== 0;
}

/**
 * `displayName` reports the primitive's own name for a re-export such as
 * `const DrawerPortal = DrawerPrimitive.Portal`; the export name is what
 * consumers import.
 */
export function exportName(doc) {
  return doc.rootExpression?.getName() ?? doc.displayName;
}

export function declarationPath(doc) {
  const sourceFile = doc.expression?.declarations?.[0]?.getSourceFile?.();
  return sourceFile ? toRepoPath(sourceFile.fileName) : null;
}

/**
 * `provider/server.ts` re-exports the script component from `provider/script.tsx`,
 * so docgen reports it once per file. Keep the report from the file that
 * declares it; a component declared outside the parsed set (a Radix or vaul
 * primitive re-exported under a Nexus name) is only ever reported once.
 */
export function isReExport(doc, parsedPaths) {
  const declaredIn = declarationPath(doc);
  return (
    declaredIn !== null &&
    declaredIn !== toRepoPath(doc.filePath) &&
    parsedPaths.has(declaredIn)
  );
}

/**
 * A component name is PascalCase. Screaming-snake exports
 * (`NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS`) share the leading capital but are
 * constants.
 */
export function isComponentName(name) {
  return /^[A-Z]/.test(name) && !/^[A-Z0-9_]+$/.test(name);
}

/**
 * A PascalCase value export is only a component if it can be rendered. A
 * function component carries a call signature; a class component is rendered
 * through `new` and carries a construct signature instead, so its instance has
 * to answer to `render` for an ordinary exported class not to read as one.
 */
export function isRenderable(checker, symbol) {
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

/**
 * The package's public exports, not docgen's reports, decide what gets an
 * entry: docgen drops a component whose function takes no props parameter, and
 * would otherwise document anything reachable from a parsed file.
 */
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

/**
 * A slug is a folder under `src/components/`, so a component declared anywhere
 * else — or directly in `components/` with no folder of its own — has nowhere
 * to land. Dropping it silently would leave the output short of the export
 * surface with nothing to say so.
 */
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

/**
 * The workspace packages `packages/react/src` imports. `pnpm install` links
 * these into `node_modules` in whatever state their last build left them, so
 * they are the imports that can be present and carry no types at all.
 */
export function importedWorkspaceSpecifiers(sourceFiles, manifest) {
  const packages = Object.entries({
    ...manifest.dependencies,
    ...manifest.peerDependencies,
  })
    .filter(([, range]) => range.startsWith('workspace:'))
    .map(([name]) => name);

  const imported = new Set();

  for (const sourceFile of sourceFiles) {
    for (const statement of sourceFile.statements) {
      // A side-effect import binds nothing, so it cannot widen a prop however
      // type-less the module it names turns out to be.
      const bindsNames = ts.isImportDeclaration(statement)
        ? Boolean(statement.importClause)
        : ts.isExportDeclaration(statement);
      if (!bindsNames) continue;

      const specifier = statement.moduleSpecifier?.text;
      if (!specifier) continue;

      if (
        packages.some(
          (name) => specifier === name || specifier.startsWith(`${name}/`)
        )
      ) {
        imported.add(specifier);
      }
    }
  }

  return [...imported].sort();
}

const DECLARATION_EXTENSIONS = new Set([
  ts.Extension.Dts,
  ts.Extension.Dcts,
  ts.Extension.Dmts,
]);

/**
 * An unbuilt workspace dependency is not an error the checker reports on the
 * props that travel through it. A package with no `dist` at all reports
 * against the import site; one whose declaration pass failed is worse, because
 * `allowJs` lets its JavaScript into the program and every type taken from it
 * silently widens to `any` — which reads in the output as a documented type.
 * The props JSON is a build output of those packages as much as of
 * `packages/react/src`, and none of them is a declared input anywhere in the
 * build graph, so the declarations have to be asked for rather than inferred
 * from the diagnostics they fail to produce.
 */
export function assertWorkspaceTypes(
  specifiers,
  compilerOptions,
  containingFile
) {
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
      'Build the workspace dependencies first: pnpm turbo build --filter=@nexus_ds/react^...',
      ...untyped.map((specifier) => `  ${specifier}`),
    ].join('\n')
  );
}

/**
 * `React.CSSProperties` is spelled the same in every file and reads as itself,
 * so the conventional `React` binding is exempt; a namespace over any other
 * module — or react under a different local name — prints a name only that
 * file knows.
 */
export function opaqueNamespaceNames(sourceFile) {
  return sourceFile.statements
    .filter((statement) => ts.isImportDeclaration(statement))
    .map((statement) => ({
      module: statement.moduleSpecifier.text,
      bindings: statement.importClause?.namedBindings,
    }))
    .filter(({ bindings }) => bindings && ts.isNamespaceImport(bindings))
    .map(({ module, bindings }) => ({ module, name: bindings.name.text }))
    .filter(({ module, name }) => !(module === 'react' && name === 'React'))
    .map(({ name }) => name);
}

/**
 * `typeToString` spells names as the declaring file sees them: a namespace
 * import prints as its local alias (`RechartsPrimitive.TooltipPayloadEntry`),
 * and a type that file never imported prints as `import("<absolute path>")` —
 * a machine path that would make the output differ per checkout.
 */
export function isPortableExpansion(text, opaqueNamespaces) {
  if (text.includes('import(')) return false;
  return !opaqueNamespaces.some((namespace) =>
    new RegExp(`\\b${namespace}\\.`).test(text)
  );
}
