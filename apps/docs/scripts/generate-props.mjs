import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import docgen from 'react-docgen-typescript';
import ts from 'typescript';

import {
  isComponentName,
  isPortableExpansion,
  isRenderable,
  opaqueNamespaceNames,
  recordedSlugs,
  toSlugFolder,
} from './props-contract.mjs';
import {
  reactEntryPoints,
  reactRoot,
  repoRoot,
} from './react-entry-points.mjs';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const reactSrc = path.join(reactRoot, 'src');
const componentsRoot = path.join(reactSrc, 'components');
const reactTsconfig = path.join(reactRoot, 'tsconfig.json');

const outputDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(docsRoot, 'generated', 'props');

const indexFile = 'index.json';

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
  return toSlugFolder(path.relative(componentsRoot, absolutePath));
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

function symbolSourceFile(symbol) {
  return symbol.declarations?.[0]?.getSourceFile?.() ?? null;
}

function symbolSourcePath(symbol) {
  const sourceFile = symbolSourceFile(symbol);
  return sourceFile ? toRepoPath(sourceFile.fileName) : null;
}

/**
 * The package's public exports, not docgen's reports, decide what gets an
 * entry: docgen drops a component whose function takes no props parameter, and
 * would otherwise document anything reachable from a parsed file.
 */
function publicExports(checker, program) {
  const exported = new Map();

  for (const entry of reactEntryPoints()) {
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
function publicComponents(checker, exported) {
  const found = [];

  for (const [name, symbol] of exported) {
    if (!isComponentName(name)) continue;
    if (!isRenderable(checker, symbol)) continue;

    const sourceFile = symbolSourceFile(symbol);
    if (!sourceFile || !toSlug(sourceFile.fileName)) {
      throw new Error(
        `@nexus_ds/react exports the component ${name} from ${symbolSourcePath(symbol) ?? 'an unresolvable file'}; it needs a folder of its own under ${toRepoPath(componentsRoot)}/ to get a props entry.`
      );
    }

    found.push([name, symbol]);
  }

  return new Map(found.sort(([a], [b]) => a.localeCompare(b, 'en')));
}

/**
 * A prop typed with a repo-local alias prints that alias name, which a reader
 * cannot resolve unless the package exports it. Print the alias body instead,
 * so no component has to inline a union for the docs' sake. An alias whose body
 * will not print portably keeps its name, and the resolvability test then asks
 * for it to be exported.
 */
function localAliasExpansions(checker, program, exported) {
  const srcPath = toRepoPath(reactSrc);
  const candidates = new Map();

  for (const sourceFile of program.getSourceFiles()) {
    if (!toRepoPath(sourceFile.fileName).startsWith(srcPath)) continue;
    const opaqueNamespaces = opaqueNamespaceNames(sourceFile);

    for (const statement of sourceFile.statements) {
      if (!ts.isTypeAliasDeclaration(statement)) continue;
      const name = statement.name.text;
      if (exported.has(name)) continue;

      const text = checker.typeToString(
        checker.getTypeAtLocation(statement.name),
        statement,
        ts.TypeFormatFlags.InTypeAlias | ts.TypeFormatFlags.NoTruncation
      );

      if (!candidates.has(name)) candidates.set(name, new Set());
      candidates
        .get(name)
        .add(isPortableExpansion(text, opaqueNamespaces) ? text : null);
    }
  }

  // Two files declaring the same unexported alias would otherwise expand
  // whichever was parsed last into both components' props, so a name has to be
  // claimed by one body — and by a body that prints portably everywhere.
  return new Map(
    [...candidates]
      .filter(([, texts]) => texts.size === 1 && !texts.has(null))
      .map(([name, texts]) => [name, [...texts][0]])
  );
}

function toPropEntry(prop, expansions) {
  return {
    name: prop.name,
    type: expansions.get(prop.type.name) ?? prop.type.name,
    required: prop.required,
    defaultValue: prop.defaultValue?.value ?? null,
    description: prop.description,
    // `shouldIncludePropTagMap` strips `@example` out of `description`, so the
    // snippet only survives if it is carried across from the tag map — which,
    // unlike `description`, docgen hands back with the checkout's own line
    // endings.
    example: prop.tags?.example?.replace(/\r\n/g, '\n') ?? null,
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

/**
 * Removes what the last run wrote and nothing else, so a folder renamed or
 * deleted since then leaves no orphan behind. Every current slug is rewritten
 * straight after, so the previous index is the only record worth reading.
 */
function clearPreviousOutput() {
  const indexPath = path.join(outputDir, indexFile);
  const previous = existsSync(indexPath)
    ? recordedSlugs(readFileSync(indexPath, 'utf8'))
    : [];

  for (const slug of previous) {
    rmSync(path.join(outputDir, `${slug}.json`), { force: true });
  }
  rmSync(indexPath, { force: true });
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

const program = ts.createProgram([...sourceFiles, ...reactEntryPoints()], {
  ...compilerOptions,
  noEmit: true,
});
const checker = program.getTypeChecker();

const exported = publicExports(checker, program);
const expansions = localAliasExpansions(checker, program, exported);

// `parseWithProgramProvider` ignores the parser's own options once a program
// is supplied, so this reuses the ones the program was built with.
const parser = docgen.withCompilerOptions(compilerOptions, {
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

// A union prints its members in the order the checker first interned them, so
// resolving component types ahead of the alias expansions and the docgen parse
// would reorder the type strings those two produce.
const components = publicComponents(checker, exported);

const bySlug = new Map(slugs.map((slug) => [slug, []]));

for (const [name, symbol] of components) {
  const doc = docsByName.get(name);
  const entry = doc
    ? toComponentEntry(name, doc, expansions)
    : toProplessEntry(checker, name, symbol);

  bySlug.get(toSlug(path.join(repoRoot, entry.sourcePath))).push(entry);
}

mkdirSync(outputDir, { recursive: true });
clearPreviousOutput();

const index = {};
let propCount = 0;

for (const [slug, entries] of bySlug) {
  // A folder that exports no component (`focus-ring` is stories only,
  // `overlay-layout` is a util module) has no page, so it gets no entry.
  if (entries.length === 0) continue;

  entries.sort(byNameThenSource);
  adoptPropsTypeDescriptions(entries, typeExportDescriptions);

  propCount += entries.reduce((total, entry) => total + entry.props.length, 0);
  index[slug] = entries.map((entry) => entry.name);

  writeJson(path.join(outputDir, `${slug}.json`), {
    slug,
    components: entries,
  });
}

writeJson(path.join(outputDir, indexFile), index);

console.log(
  `props: ${Object.keys(index).length} entries, ${components.size} components, ${propCount} props -> ${toRepoPath(outputDir)}`
);
