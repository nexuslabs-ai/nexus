import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import {
  collectSourceFiles,
  componentSlugs,
  isModuleSource,
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

const generatedDir = path.join(docsRoot, 'generated');
const outputDir = path.join(generatedDir, 'dependencies');

function readManifest(packageDir) {
  return JSON.parse(
    readFileSync(path.join(packageDir, 'package.json'), 'utf8')
  );
}

const reactManifest = readManifest(reactRoot);
const runtimeRanges = new Map(
  Object.entries({
    ...reactManifest.peerDependencies,
    ...reactManifest.dependencies,
  })
);
// Stylesheet packages are compiled into the shipped CSS, so they are devDependencies.
const installableRanges = new Map([
  ...Object.entries(reactManifest.devDependencies),
  ...runtimeRanges,
]);

const reactStylesheet = path.join(reactSrc, 'index.css');

const reactTsconfig = path.join(reactRoot, 'tsconfig.json');
const compilerOptions = ts.parseJsonConfigFileContent(
  ts.readConfigFile(reactTsconfig, ts.sys.readFile).config,
  ts.sys,
  path.dirname(reactTsconfig)
).options;

// Mirrors how `pnpm publish` rewrites a `workspace:` range.
function publishedRange(name) {
  const range = installableRanges.get(name);
  if (!range.startsWith('workspace:')) return range;

  const spec = range.slice('workspace:'.length);
  const { version } = readManifest(path.join(reactRoot, 'node_modules', name));
  if (spec === '*') return version;
  if (spec === '^' || spec === '~') return `${spec}${version}`;
  return spec;
}

function packageName(specifier) {
  const segments = specifier.split('/');
  if (specifier.startsWith('@')) return segments.slice(0, 2).join('/');
  return segments[0];
}

function toInstall(name) {
  return { name, range: publishedRange(name) };
}

function toSrcPath(filePath) {
  return path.relative(reactSrc, filePath).split(path.sep).join('/');
}

function resolveRelative(importer, specifier) {
  const { resolvedModule } = ts.resolveModuleName(
    specifier,
    importer,
    compilerOptions,
    ts.sys
  );
  // Non-TS imports such as `./x.css` have no module resolution; take the path as written.
  const targetPath = resolvedModule
    ? path.resolve(resolvedModule.resolvedFileName)
    : path.resolve(path.dirname(importer), specifier);

  const isFile = statSync(targetPath, { throwIfNoEntry: false })?.isFile();
  if (!isFile || !isUnder(targetPath, reactSrc)) {
    throw new Error(
      `dependencies JSON: ${toRepoPath(importer)} imports '${specifier}', which does not resolve to a file under ${toRepoPath(reactSrc)}.`
    );
  }
  return targetPath;
}

function fileImports(filePath) {
  const { importedFiles } = ts.preProcessFile(
    readFileSync(filePath, 'utf8'),
    true,
    true
  );
  const packages = [];
  const files = [];

  for (const { fileName: specifier } of importedFiles) {
    if (specifier.startsWith('.')) {
      files.push(resolveRelative(filePath, specifier));
    } else {
      packages.push(packageName(specifier));
    }
  }

  return { packages, files };
}

function walk(roots) {
  const visited = new Set(roots);
  const packages = new Set();
  const queue = [...roots];

  while (queue.length > 0) {
    const imports = fileImports(queue.pop());
    for (const name of imports.packages) packages.add(name);
    for (const file of imports.files) {
      if (visited.has(file)) continue;
      visited.add(file);
      if (isModuleSource(file)) queue.push(file);
    }
  }

  return { files: [...visited], packages: [...packages] };
}

function colocatedStyles(files) {
  const folders = new Set(files.map((file) => path.dirname(file)));
  return [...folders].flatMap((folder) =>
    readdirSync(folder)
      .filter((name) => name.endsWith('.css'))
      .map((name) => path.join(folder, name))
  );
}

function walkSlug(slug) {
  const slugDir = path.join(componentsRoot, slug);
  const roots = collectSourceFiles(slugDir, isModuleSource);
  if (roots.length === 0) return null;

  const walked = walk(roots);
  const needed = new Set([...walked.files, ...colocatedStyles(walked.files)]);

  return {
    slug,
    slugDir,
    packages: walked.packages.filter((name) => name !== 'react'),
    files: [...needed],
  };
}

function assertDeclaredPackages(walks) {
  const offenders = walks.flatMap((walked) =>
    walked.packages
      .filter((name) => !runtimeRanges.has(name))
      .map((name) => `  ${walked.slug}: ${name}`)
  );

  if (offenders.length === 0) return;

  throw new Error(
    [
      'dependencies JSON: a component imports a package @nexus_ds/react does not declare in dependencies or peerDependencies.',
      ...offenders,
    ].join('\n')
  );
}

function toEntry({ slug, slugDir, packages, files }) {
  return {
    slug,
    install: packages.sort().map(toInstall),
    copy: files
      .filter((file) => !isUnder(file, slugDir))
      .map(toSrcPath)
      .sort(),
    files: files
      .filter((file) => isUnder(file, slugDir))
      .map(toSrcPath)
      .sort(),
    styles: files
      .filter((file) => file.endsWith('.css'))
      .map(toSrcPath)
      .sort(),
  };
}

function stylesheetPackages() {
  const css = readFileSync(reactStylesheet, 'utf8');
  const specifiers = [
    ...css.matchAll(
      /@(?:import|reference|plugin)\s+(?:url\()?['"]([^'"]+)['"]/g
    ),
  ].map(([, specifier]) => specifier);
  const names = specifiers
    .filter((specifier) => !specifier.startsWith('.'))
    .map(packageName);

  const undeclared = names.filter((name) => !installableRanges.has(name));
  if (undeclared.length > 0) {
    throw new Error(
      `dependencies JSON: ${toRepoPath(reactStylesheet)} imports ${undeclared.join(', ')}, which @nexus_ds/react does not declare in its manifest.`
    );
  }

  return [...new Set(names)].sort();
}

const walks = componentSlugs().map(walkSlug).filter(Boolean);

assertDeclaredPackages(walks);

const entries = walks.map(toEntry);
const prerequisites = { install: stylesheetPackages().map(toInstall) };

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const entry of entries) {
  writeJson(path.join(outputDir, `${entry.slug}.json`), entry);
}
writeJson(path.join(generatedDir, 'prerequisites.json'), prerequisites);

console.log(
  `dependencies: ${entries.length} entries -> ${toRepoPath(outputDir)}`
);
