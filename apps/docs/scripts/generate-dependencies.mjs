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
  ALWAYS_INSTALLED,
  COPIED_PREFIX,
  DEMO_EXTENSION,
  importSpecifiers,
  isDemoName,
  packageName,
} from './examples.mjs';
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

const outputDir = path.join(docsRoot, 'generated', 'dependencies');
const examplesRoot = path.join(docsRoot, 'examples');

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
const docsDependencies = readManifest(docsRoot).dependencies;
const reactTsconfig = path.join(reactRoot, 'tsconfig.json');
const compilerOptions = ts.parseJsonConfigFileContent(
  ts.readConfigFile(reactTsconfig, ts.sys.readFile).config,
  ts.sys,
  path.dirname(reactTsconfig)
).options;

// Mirrors how `pnpm publish` rewrites a `workspace:` range.
function publishedRange(name) {
  const range = runtimeRanges.get(name);
  if (!range.startsWith('workspace:')) return range;

  const spec = range.slice('workspace:'.length);
  const { version } = readManifest(path.join(reactRoot, 'node_modules', name));
  if (spec === '*') return version;
  if (spec === '^' || spec === '~') return `${spec}${version}`;
  return spec;
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

/** Packages the demos in `examples/{slug}/` import beyond the component's own. */
function examplePackages(slug, componentPackages) {
  const slugExamples = path.join(examplesRoot, slug);
  if (!statSync(slugExamples, { throwIfNoEntry: false })?.isDirectory()) {
    return [];
  }

  const names = readdirSync(slugExamples)
    .filter((name) => name.endsWith(DEMO_EXTENSION) && isDemoName(name))
    .flatMap((name) =>
      importSpecifiers(readFileSync(path.join(slugExamples, name), 'utf8'))
    )
    .filter(
      (specifier) =>
        !specifier.startsWith('.') && !specifier.startsWith(COPIED_PREFIX)
    )
    .map(packageName);

  return [...new Set(names)]
    .filter(
      (name) => !ALWAYS_INSTALLED.has(name) && !componentPackages.includes(name)
    )
    .sort()
    .map((name) => {
      const range = docsDependencies[name];
      if (!range || range.startsWith('workspace:')) {
        throw new Error(
          `dependencies JSON: examples/${slug}/ imports ${name}, which apps/docs/package.json does not list with an npm range.`
        );
      }
      return { name, range };
    });
}

function walkSlug(slug) {
  const slugDir = path.join(componentsRoot, slug);
  const roots = collectSourceFiles(slugDir, isModuleSource);
  if (roots.length === 0) return null;

  const walked = walk(roots);
  const needed = new Set([...walked.files, ...colocatedStyles(walked.files)]);
  const packages = walked.packages.filter(
    (name) => !ALWAYS_INSTALLED.has(name)
  );

  return {
    slug,
    slugDir,
    packages,
    examples: examplePackages(slug, packages),
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

function toEntry({ slug, slugDir, packages, examples, files }) {
  return {
    slug,
    install: packages.sort().map(toInstall),
    examples,
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

const walks = componentSlugs().map(walkSlug).filter(Boolean);

assertDeclaredPackages(walks);

const entries = walks.map(toEntry);

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const entry of entries) {
  writeJson(path.join(outputDir, `${entry.slug}.json`), entry);
}

console.log(
  `dependencies: ${entries.length} entries -> ${toRepoPath(outputDir)}`
);
