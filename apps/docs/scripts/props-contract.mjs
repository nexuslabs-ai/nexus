import path from 'node:path';

import ts from 'typescript';

/**
 * The rules the props generator applies: what counts as a documentable
 * component export, which folder it lands in, and which files a previous run
 * recorded as its own. Kept out of the generator so each rule can be tested
 * without running it.
 */

/**
 * A slug names one folder under `src/components/`, so a value carrying a path
 * separator, a drive letter, or a `..` did not come from a run of this
 * generator. A hand-edited or merge-conflicted `index.json` must not be able to
 * steer a delete out of the directory it names.
 */
export function isSlugName(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/**
 * The slugs a previous `index.json` body records, and only the ones shaped like
 * a slug. The index is a tracked file that can arrive conflicted, hand-edited,
 * or half-written, and the generator deletes the files it names — so a body
 * that will not parse, or is not an object of slug keys, is treated as no
 * record at all rather than failing the docs build over a file this run is
 * about to replace.
 */
export function recordedSlugs(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }

  if (parsed === null || typeof parsed !== 'object') return [];
  if (Array.isArray(parsed)) return [];

  return Object.keys(parsed).filter(isSlugName);
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

/**
 * A component name is PascalCase. Screaming-snake exports
 * (`NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS`) share the leading capital but are
 * constants.
 */
export function isComponentName(name) {
  return /^[A-Z]/.test(name) && !/^[A-Z0-9_]+$/.test(name);
}

const componentValueFlags =
  ts.SymbolFlags.Function | ts.SymbolFlags.Class | ts.SymbolFlags.Variable;

/**
 * A PascalCase value export is only a component if it can be rendered, so a
 * signature is what separates `Button` from an exported config object — a
 * construct signature as well as a call one, since a class component is
 * rendered through `new` and carries no call signature at all.
 */
export function isRenderable(checker, symbol) {
  if ((symbol.flags & componentValueFlags) === 0) return false;
  const declaration = symbol.declarations?.[0];
  if (!declaration) return false;

  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  return (
    checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0 ||
    checker.getSignaturesOfType(type, ts.SignatureKind.Construct).length > 0
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
