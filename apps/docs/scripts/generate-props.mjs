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
import {
  componentDefaults,
  toComponentEntry,
  toPropsFile,
  toPropsIndex,
  toProplessEntry,
} from './props-entries.mjs';
import { reactEntryPoints } from './react-entry-points.mjs';
import { docsRoot, reactRoot } from './roots.mjs';

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

// Maps each unexported repo-local alias name to its printed body.
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

  // Expand a name only when every declaration of it prints the same portable body.
  const expansions = new Map(
    [...candidates]
      .filter(([, texts]) => texts.size === 1 && !texts.has(null))
      .map(([name, texts]) => [name, [...texts][0]])
  );

  return { expansions, localAliases: new Set(candidates.keys()) };
}

// Identifiers a printed type refers to: string literals and member/parameter
// names (a name followed by `:` right after `{ ; , ( [`) are stripped first.
function typeReferenceTokens(type) {
  return (
    type
      .replace(/(['"])(?:\\.|(?!\1)[^\\])*\1/g, '""')
      .replace(
        /(^|[{;,([])\s*(?:readonly\s+)?[A-Za-z_$][\w$]*\s*\??\s*:/g,
        '$1:'
      )
      .match(/[A-Za-z_$][\w$]*/g) ?? []
  );
}

function assertResolvableTypes(entries, localAliases) {
  const offenders = entries.flatMap((entry) =>
    entry.props.flatMap((prop) => {
      const matched = typeReferenceTokens(prop.type).filter((token) =>
        localAliases.has(token)
      );

      if (matched.length === 0) return [];

      return [
        `  ${entry.name}.${prop.name}: ${prop.type}\n    unresolved: ${[...new Set(matched)].join(', ')}`,
      ];
    })
  );

  if (offenders.length === 0) return;

  throw new Error(
    [
      'props JSON: a prop is documented with a repo-local type alias that @nexus_ds/react does not export, so a reader cannot resolve it.',
      'Export the alias from its component folder and from src/index.ts. Expansion covers the rest, but only for a prop typed as the bare alias, and only when its body prints portably.',
      ...offenders,
    ].join('\n')
  );
}

// A component documented on its `{Name}Props` interface takes that description.
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

// A file this script wrote carries its own slug in its body.
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

assertWorkspaceTypes(program, {
  srcRoot: reactSrc,
  manifest: reactManifest,
  compilerOptions,
  containingFile: path.join(reactSrc, 'index.ts'),
});

const checker = program.getTypeChecker();

const exported = publicExports(checker, program, entryPoints);
const { expansions, localAliases } = localAliasExpansions(
  checker,
  program,
  exported
);

const parser = docgen.withCompilerOptions(compilerOptions, {
  savePropValueAsString: true,
  shouldIncludeExpression: true,
  shouldIncludePropTagMap: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: isOwnProp,
});

const docsByDeclaration = new Map();
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

  docsByDeclaration.set(`${toRepoPath(doc.filePath)}#${exportName(doc)}`, doc);
}

// Must run after the alias expansions and the docgen parse: union members print
// in the order the checker first interned them.
const components = publicComponents(checker, exported, componentsRoot);

const bySlug = new Map(slugs.map((slug) => [slug, []]));

for (const [name, symbol] of components) {
  const { fileName } = symbol.declarations[0].getSourceFile();
  const sourcePath = toRepoPath(fileName);
  const doc = docsByDeclaration.get(`${sourcePath}#${name}`);
  const entry = doc
    ? toComponentEntry(
        name,
        sourcePath,
        doc,
        expansions,
        componentDefaults(checker, symbol)
      )
    : toProplessEntry(checker, name, sourcePath, symbol);

  bySlug.get(toSlugFolder(path.relative(componentsRoot, fileName))).push(entry);
}

assertResolvableTypes([...bySlug.values()].flat(), localAliases);

mkdirSync(outputDir, { recursive: true });
clearPreviousOutput();

const files = [...bySlug]
  .filter(([, entries]) => entries.length > 0)
  .map(([slug, entries]) => {
    entries.sort(byNameThenSource);
    adoptPropsTypeDescriptions(entries, typeExportDescriptions);
    return toPropsFile(slug, entries);
  });

for (const file of files) {
  writeJson(path.join(outputDir, `${file.slug}.json`), file);
}

const index = toPropsIndex(files);
writeJson(path.join(outputDir, 'index.json'), index);

const propCount = files
  .flatMap((file) => file.components)
  .reduce((total, component) => total + component.props.length, 0);

console.log(
  `props: ${Object.keys(index).length} entries, ${components.size} components, ${propCount} props -> ${toRepoPath(outputDir)}`
);
