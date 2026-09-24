import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

import docgen from 'react-docgen-typescript';
import ts from 'typescript';

import {
  assertWorkspaceTypes,
  cvaVariantKeys,
  exportName,
  isOwnProp,
  isPortableExpansion,
  isReExport,
  isTypeExport,
  opaqueNamespaceNames,
  propsContractProblems,
  publicComponents,
  publicExports,
  toSlugFolder,
} from './props-contract.mjs';
import { reactEntryPoints } from './react-entry-points.mjs';
import {
  collectSourceFiles,
  componentSlugs,
  writeJson,
} from './react-sources.mjs';
import {
  componentsRoot,
  docsRoot,
  isUnder,
  reactRoot,
  reactSrc,
  toRepoPath,
} from './roots.mjs';

const reactTsconfig = path.join(reactRoot, 'tsconfig.json');

const outputDir = path.join(docsRoot, 'generated', 'props');

const reactManifest = JSON.parse(
  readFileSync(path.join(reactRoot, 'package.json'), 'utf8')
);
const entryPoints = reactEntryPoints(reactManifest);

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

function assertPropsContract(checker, program, components, docFor) {
  const variantKeys = cvaVariantKeys(
    checker,
    program
      .getSourceFiles()
      .filter((sourceFile) => isUnder(sourceFile.fileName, reactSrc))
  );

  const offenders = [...components].flatMap(([name, symbol]) =>
    propsContractProblems(
      checker,
      variantKeys,
      name,
      symbol,
      docFor(name, symbol)?.props ?? {}
    )
  );

  if (offenders.length === 0) return;

  throw new Error(
    [
      'props JSON: a component props type does not document as a closed set of keys and options.',
      'string-keyed props: a cva() variants object is typed Record<string, ...>; give it literal keys.',
      'widened: one cva() variant group lost its literal option names; type its options literally.',
      'missing: docgen dropped a cva() variant key; check isOwnProp still matches synthesized members.',
      ...offenders.map((offender) => `  ${offender}`),
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
    // Unlike `description`, docgen leaves tag values with CRLF line endings.
    example: prop.tags?.example?.replace(/\r\n/g, '\n') ?? null,
  };
}

function toComponentEntry(name, sourcePath, doc, expansions) {
  return {
    name,
    description: doc.description,
    sourcePath,
    props: Object.values(doc.props)
      .map((prop) => toPropEntry(prop, expansions))
      .sort((a, b) => a.name.localeCompare(b.name, 'en')),
  };
}

function toProplessEntry(checker, name, sourcePath, symbol) {
  return {
    name,
    description: ts
      .displayPartsToString(symbol.getDocumentationComment(checker))
      .replace(/\r\n/g, '\n'),
    sourcePath,
    props: [],
  };
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

const slugs = componentSlugs();

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

function docFor(name, symbol) {
  const sourcePath = toRepoPath(
    symbol.declarations[0].getSourceFile().fileName
  );
  return docsByDeclaration.get(`${sourcePath}#${name}`);
}

const bySlug = new Map(slugs.map((slug) => [slug, []]));

for (const [name, symbol] of components) {
  const { fileName } = symbol.declarations[0].getSourceFile();
  const sourcePath = toRepoPath(fileName);
  const doc = docFor(name, symbol);
  const entry = doc
    ? toComponentEntry(name, sourcePath, doc, expansions)
    : toProplessEntry(checker, name, sourcePath, symbol);

  bySlug.get(toSlugFolder(path.relative(componentsRoot, fileName))).push(entry);
}

assertPropsContract(checker, program, components, docFor);
assertResolvableTypes([...bySlug.values()].flat(), localAliases);

mkdirSync(outputDir, { recursive: true });
clearPreviousOutput();

const index = {};
let propCount = 0;

for (const [slug, entries] of bySlug) {
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
