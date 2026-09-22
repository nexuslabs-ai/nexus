import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import docgen from 'react-docgen-typescript';
import ts from 'typescript';

import {
  assertWorkspaceTypes,
  exportName,
  isComponentSource,
  isOwnProp,
  isPortableExpansion,
  isReExport,
  isTypeExport,
  isUnder,
  opaqueNamespaceNames,
  publicComponents,
  publicExports,
  toRepoPath,
  toSlugFolder,
} from './props-contract.mjs';
import { reactEntryPoints } from './react-entry-points.mjs';
import { docsRoot, reactRoot, repoRoot } from './roots.mjs';

const reactSrc = path.join(reactRoot, 'src');
const componentsRoot = path.join(reactSrc, 'components');
const reactTsconfig = path.join(reactRoot, 'tsconfig.json');

const outputDir = path.join(docsRoot, 'generated', 'props');

const reactManifest = JSON.parse(
  readFileSync(path.join(reactRoot, 'package.json'), 'utf8')
);
const entryPoints = reactEntryPoints(reactManifest);

function collectSourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(entryPath);
      return [entryPath];
    })
    .filter(isComponentSource);
}

function toSlug(absolutePath) {
  return toSlugFolder(path.relative(componentsRoot, absolutePath));
}

// `publicComponents` has already proven the declaration and its file resolve.
function symbolSourcePath(symbol) {
  return toRepoPath(symbol.declarations[0].getSourceFile().fileName);
}

/**
 * A prop typed with a repo-local alias prints that alias name, which a reader
 * cannot resolve unless the package exports it. Print the alias body instead,
 * so no component has to inline a union for the docs' sake. An alias whose body
 * will not print portably has nothing to print but its bare name, so it comes
 * back as unresolvable for `assertResolvableTypes` to report.
 */
function localAliasExpansions(checker, program, exported) {
  const candidates = new Map();

  for (const sourceFile of program.getSourceFiles()) {
    if (!isUnder(sourceFile.fileName, reactSrc)) continue;
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
  const expansions = new Map(
    [...candidates]
      .filter(([, texts]) => texts.size === 1 && !texts.has(null))
      .map(([name, texts]) => [name, [...texts][0]])
  );

  return {
    expansions,
    unresolvable: new Set(
      [...candidates.keys()].filter((name) => !expansions.has(name))
    ),
  };
}

/**
 * A prop left printing a bare alias name the package does not export names
 * something the reader has no way to look up. Expanding the body is the usual
 * answer; when it will not print portably, exporting the alias is.
 */
function assertResolvableTypes(entries, unresolvable) {
  const offenders = entries.flatMap((entry) =>
    entry.props
      .filter((prop) => unresolvable.has(prop.type))
      .map((prop) => `  ${entry.name}.${prop.name}: ${prop.type}`)
  );

  if (offenders.length === 0) return;

  throw new Error(
    [
      'props JSON: a prop is documented with a repo-local type alias that @nexus_ds/react does not export, so a reader cannot resolve it.',
      'Export the alias from its component folder and from src/index.ts, or give it a body that prints portably.',
      ...offenders,
    ].join('\n')
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
 * A slug file names its own slug in its body, so a run can recognise the files
 * a previous one wrote without trusting anything to name a path: the names come
 * from the directory listing, and the body only has to agree with the name it
 * already has. That leaves a folder renamed or deleted since the last run with
 * no orphan behind, whatever state the index arrives in.
 */
function wasGeneratedHere(fileName) {
  try {
    const body = JSON.parse(
      readFileSync(path.join(outputDir, fileName), 'utf8')
    );
    return body?.slug === path.basename(fileName, '.json');
  } catch {
    return false;
  }
}

function clearPreviousOutput() {
  for (const fileName of readdirSync(outputDir)) {
    if (!wasGeneratedHere(fileName)) continue;
    rmSync(path.join(outputDir, fileName), { force: true });
  }
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

const program = ts.createProgram([...sourceFiles, ...entryPoints], {
  ...compilerOptions,
  noEmit: true,
});

// The generator is the only place that can tell a missing workspace build from
// an ordinary type error, so it asks the resolver for the declarations before
// reading a single type off them.
assertWorkspaceTypes(program, {
  srcRoot: reactSrc,
  manifest: reactManifest,
  compilerOptions,
  containingFile: path.join(reactSrc, 'index.ts'),
});

const checker = program.getTypeChecker();

const exported = publicExports(checker, program, entryPoints);
const { expansions, unresolvable } = localAliasExpansions(
  checker,
  program,
  exported
);

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

  // A file-local component sharing a public export's name would otherwise
  // claim the entry, and take it to whichever slug it happens to live in.
  const name = exportName(doc);
  if (!exported.has(name)) continue;

  docsByName.set(name, doc);
}

// A union prints its members in the order the checker first interned them, so
// resolving component types ahead of the alias expansions and the docgen parse
// would reorder the type strings those two produce.
const components = publicComponents(checker, exported, componentsRoot);

const bySlug = new Map(slugs.map((slug) => [slug, []]));

for (const [name, symbol] of components) {
  const doc = docsByName.get(name);
  const entry = doc
    ? toComponentEntry(name, doc, expansions)
    : toProplessEntry(checker, name, symbol);

  bySlug.get(toSlug(path.join(repoRoot, entry.sourcePath))).push(entry);
}

assertResolvableTypes([...bySlug.values()].flat(), unresolvable);

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

writeJson(path.join(outputDir, 'index.json'), index);

console.log(
  `props: ${Object.keys(index).length} entries, ${components.size} components, ${propCount} props -> ${toRepoPath(outputDir)}`
);
