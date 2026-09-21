import {
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import docgen from 'react-docgen-typescript';
import ts from 'typescript';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const repoRoot = path.resolve(docsRoot, '..', '..');
const reactRoot = path.join(repoRoot, 'packages', 'react');
const reactSrc = path.join(reactRoot, 'src');
const componentsRoot = path.join(reactSrc, 'components');
const reactTsconfig = path.join(reactRoot, 'tsconfig.json');
const outputDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(docsRoot, 'generated', 'props');

function isComponentSource(filePath) {
  const name = path.basename(filePath);
  if (!/\.tsx?$/.test(name)) return false;
  if (/\.(?:stories|test)\.tsx?$/.test(name)) return false;
  // A barrel would re-report every component it re-exports under a second
  // source path.
  return !/^index\.tsx?$/.test(name);
}

function collectSourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(entryPath);
      return [entryPath];
    })
    .filter(isComponentSource);
}

function toRepoPath(absolutePath) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join('/');
}

function toSlug(absolutePath) {
  return path.relative(componentsRoot, absolutePath).split(path.sep)[0];
}

/**
 * The `exports` map points at built declarations; the same subpaths under
 * `src/` are what the program is built from, so a new public subentry is picked
 * up without a second list to maintain.
 */
function entryPoints() {
  const manifest = JSON.parse(
    readFileSync(path.join(reactRoot, 'package.json'), 'utf8')
  );

  return Object.values(manifest.exports)
    .map((subpath) => subpath?.types)
    .filter((types) => typeof types === 'string')
    .map((types) =>
      path.join(
        reactRoot,
        types.replace(/^\.\/dist\//, 'src/').replace(/\.d\.ts$/, '.ts')
      )
    )
    .sort();
}

/**
 * Keeps a prop only when this repo declares it. Props reaching a component
 * through `React.ComponentProps<'element'>` or a Radix primitive resolve to a
 * declaration under `node_modules`; `cva` variant keys arrive as synthesized
 * mapped-type members carrying neither a declaration nor a parent.
 */
function isOwnProp(prop) {
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
function isTypeExport(doc) {
  return ((doc.expression?.flags ?? 0) & ts.SymbolFlags.Alias) !== 0;
}

/**
 * `displayName` reports the primitive's own name for a re-export such as
 * `const DrawerPortal = DrawerPrimitive.Portal`; the export name is what
 * consumers import.
 */
function exportName(doc) {
  return doc.rootExpression?.getName() ?? doc.displayName;
}

function declarationPath(doc) {
  const sourceFile = doc.expression?.declarations?.[0]?.getSourceFile?.();
  return sourceFile ? toRepoPath(sourceFile.fileName) : null;
}

/**
 * `provider/server.ts` re-exports the script component from `provider/script.tsx`,
 * so docgen reports it once per file. Keep the report from the file that
 * declares it; a component declared outside the parsed set (a Radix or vaul
 * primitive re-exported under a Nexus name) is only ever reported once.
 */
function isReExport(doc, parsedPaths) {
  const declaredIn = declarationPath(doc);
  return (
    declaredIn !== null &&
    declaredIn !== toRepoPath(doc.filePath) &&
    parsedPaths.has(declaredIn)
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

function symbolSourcePath(symbol) {
  const sourceFile = symbol.declarations?.[0]?.getSourceFile?.();
  return sourceFile ? toRepoPath(sourceFile.fileName) : null;
}

/**
 * A component name is PascalCase. Screaming-snake exports
 * (`NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS`) share the leading capital but are
 * constants.
 */
function isComponentName(name) {
  return /^[A-Z]/.test(name) && !/^[A-Z0-9_]+$/.test(name);
}

/**
 * The package's public exports, not docgen's reports, decide what gets an
 * entry: docgen drops a component whose function takes no props parameter, and
 * would otherwise document anything reachable from a parsed file.
 */
function publicExports(checker, program) {
  const exported = new Map();

  for (const entry of entryPoints()) {
    const moduleSymbol = checker.getSymbolAtLocation(
      program.getSourceFile(entry)
    );

    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
      exported.set(symbol.getName(), resolveAlias(checker, symbol));
    }
  }

  return exported;
}

const componentValueFlags =
  ts.SymbolFlags.Function | ts.SymbolFlags.Class | ts.SymbolFlags.Variable;

function publicComponents(exported) {
  const componentsPath = toRepoPath(componentsRoot);

  return new Map(
    [...exported]
      .filter(([name, symbol]) => {
        if (!isComponentName(name)) return false;
        if ((symbol.flags & componentValueFlags) === 0) return false;
        return symbolSourcePath(symbol)?.startsWith(componentsPath) ?? false;
      })
      .sort(([a], [b]) => a.localeCompare(b, 'en'))
  );
}

/**
 * A prop typed with a repo-local alias prints that alias name, which a reader
 * cannot resolve unless the package exports it. Print the alias body instead,
 * so no component has to inline a union for the docs' sake.
 */
function localAliasExpansions(checker, program, exported) {
  const srcPath = toRepoPath(reactSrc);
  const expansions = new Map();

  for (const sourceFile of program.getSourceFiles()) {
    if (!toRepoPath(sourceFile.fileName).startsWith(srcPath)) continue;

    for (const statement of sourceFile.statements) {
      if (!ts.isTypeAliasDeclaration(statement)) continue;
      const name = statement.name.text;
      if (exported.has(name)) continue;

      expansions.set(
        name,
        checker.typeToString(
          checker.getTypeAtLocation(statement.name),
          statement,
          ts.TypeFormatFlags.InTypeAlias | ts.TypeFormatFlags.NoTruncation
        )
      );
    }
  }

  return expansions;
}

function toPropEntry(prop, expansions) {
  return {
    name: prop.name,
    type: expansions.get(prop.type.name) ?? prop.type.name,
    required: prop.required,
    defaultValue: prop.defaultValue?.value ?? null,
    description: prop.description,
  };
}

function toComponentEntry(name, doc, expansions) {
  return {
    name,
    description: doc.description,
    sourcePath: toRepoPath(doc.filePath),
    props: Object.values(doc.props)
      .map((prop) => toPropEntry(prop, expansions))
      .sort((a, b) => a.name.localeCompare(b.name, 'en')),
  };
}

function toProplessEntry(checker, name, symbol) {
  return {
    name,
    // docgen normalizes line endings; reading the comment off the symbol
    // directly would carry a CRLF checkout into the output.
    description: ts
      .displayPartsToString(symbol.getDocumentationComment(checker))
      .replace(/\r\n/g, '\n'),
    sourcePath: symbolSourcePath(symbol),
    props: [],
  };
}

/**
 * Components documented above their `{Name}Props` interface rather than above
 * the function leave docgen attributing the description to the type export.
 * Move it back onto the component.
 */
function adoptPropsTypeDescriptions(components, typeExportDescriptions) {
  for (const component of components) {
    if (component.description) continue;
    component.description =
      typeExportDescriptions.get(
        `${component.sourcePath}#${component.name}Props`
      ) ?? '';
  }
}

function byNameThenSource(a, b) {
  return (
    a.name.localeCompare(b.name, 'en') ||
    a.sourcePath.localeCompare(b.sourcePath, 'en')
  );
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const slugs = readdirSync(componentsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const sourceFiles = slugs
  .flatMap((slug) => collectSourceFiles(path.join(componentsRoot, slug)))
  .sort();
const parsedPaths = new Set(sourceFiles.map(toRepoPath));

const compilerOptions = ts.parseJsonConfigFileContent(
  ts.readConfigFile(reactTsconfig, ts.sys.readFile).config,
  ts.sys,
  path.dirname(reactTsconfig)
).options;

const program = ts.createProgram([...sourceFiles, ...entryPoints()], {
  ...compilerOptions,
  noEmit: true,
});
const checker = program.getTypeChecker();

const exported = publicExports(checker, program);
const components = publicComponents(exported);
const expansions = localAliasExpansions(checker, program, exported);

const parser = docgen.withCustomConfig(reactTsconfig, {
  savePropValueAsString: true,
  shouldIncludeExpression: true,
  shouldIncludePropTagMap: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: isOwnProp,
});

const docsByName = new Map();
const typeExportDescriptions = new Map();

for (const doc of parser.parseWithProgramProvider(sourceFiles, () => program)) {
  if (isTypeExport(doc)) {
    typeExportDescriptions.set(
      `${toRepoPath(doc.filePath)}#${doc.displayName}`,
      doc.description
    );
    continue;
  }
  if (isReExport(doc, parsedPaths)) continue;

  docsByName.set(exportName(doc), doc);
}

const bySlug = new Map(slugs.map((slug) => [slug, []]));

for (const [name, symbol] of components) {
  const doc = docsByName.get(name);
  const entry = doc
    ? toComponentEntry(name, doc, expansions)
    : toProplessEntry(checker, name, symbol);

  bySlug.get(toSlug(path.join(repoRoot, entry.sourcePath))).push(entry);
}

mkdirSync(outputDir, { recursive: true });
for (const file of readdirSync(outputDir)) {
  if (file.endsWith('.json')) unlinkSync(path.join(outputDir, file));
}

const index = {};
let propCount = 0;

for (const [slug, entries] of bySlug) {
  entries.sort(byNameThenSource);
  adoptPropsTypeDescriptions(entries, typeExportDescriptions);

  propCount += entries.reduce((total, entry) => total + entry.props.length, 0);
  index[slug] = entries.map((entry) => entry.name);

  writeJson(path.join(outputDir, `${slug}.json`), {
    slug,
    components: entries,
  });
}

writeJson(path.join(outputDir, 'index.json'), index);

console.log(
  `props: ${slugs.length} entries, ${components.size} components, ${propCount} props -> ${toRepoPath(outputDir)}`
);
