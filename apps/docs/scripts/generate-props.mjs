import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import docgen from 'react-docgen-typescript';
import ts from 'typescript';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const repoRoot = path.resolve(docsRoot, '..', '..');
const componentsRoot = path.join(
  repoRoot,
  'packages',
  'react',
  'src',
  'components'
);
const reactTsconfig = path.join(repoRoot, 'packages', 'react', 'tsconfig.json');
const outputDir = path.join(docsRoot, 'generated', 'props');

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

function toPropEntry(prop) {
  return {
    name: prop.name,
    type: prop.type.raw ?? prop.type.name,
    required: prop.required,
    defaultValue: prop.defaultValue?.value ?? null,
    description: prop.description,
  };
}

function toComponentEntry(doc) {
  return {
    // `displayName` reports the primitive's own name for a re-export such as
    // `const DrawerPortal = DrawerPrimitive.Portal`; the export name is what
    // consumers import.
    name: doc.rootExpression?.getName() ?? doc.displayName,
    description: doc.description,
    sourcePath: toRepoPath(doc.filePath),
    props: Object.values(doc.props)
      .map(toPropEntry)
      .sort((a, b) => a.name.localeCompare(b.name, 'en')),
  };
}

/**
 * Components documented above their `{Name}Props` interface rather than above
 * the function leave docgen attributing the description to the type export.
 * Move it back onto the component.
 */
function adoptPropsTypeDescriptions(components, typeExports) {
  const byKey = new Map(
    typeExports.map((doc) => [
      `${toRepoPath(doc.filePath)}#${doc.displayName}`,
      doc.description,
    ])
  );

  for (const component of components) {
    if (component.description) continue;
    component.description =
      byKey.get(`${component.sourcePath}#${component.name}Props`) ?? '';
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

const parser = docgen.withCustomConfig(reactTsconfig, {
  savePropValueAsString: true,
  shouldIncludeExpression: true,
  shouldIncludePropTagMap: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: isOwnProp,
});

const bySlug = new Map(slugs.map((slug) => [slug, []]));

for (const doc of parser.parse(sourceFiles)) {
  bySlug.get(toSlug(doc.filePath)).push(doc);
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

let componentCount = 0;
let propCount = 0;

for (const [slug, docs] of bySlug) {
  const components = docs
    .filter((doc) => !isTypeExport(doc) && !isReExport(doc, parsedPaths))
    .map(toComponentEntry)
    .sort(byNameThenSource);

  adoptPropsTypeDescriptions(components, docs.filter(isTypeExport));

  componentCount += components.length;
  propCount += components.reduce((total, c) => total + c.props.length, 0);

  writeJson(path.join(outputDir, `${slug}.json`), { slug, components });
}

writeJson(path.join(outputDir, 'index.json'), slugs);

console.log(
  `props: ${slugs.length} entries, ${componentCount} components, ${propCount} props -> ${toRepoPath(outputDir)}`
);
