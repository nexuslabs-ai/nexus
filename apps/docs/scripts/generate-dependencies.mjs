import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import {
  blockSources,
  collectSourceFiles,
  componentSlugs,
  exportedComponentSlugs,
  isModuleSource,
  linkedComponentSlug,
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
const blocksOutputDir = path.join(outputDir, 'blocks');

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

function walkRoots(name, roots) {
  const walked = walk(roots);
  return {
    name,
    packages: walked.packages.filter((pkg) => pkg !== 'react').sort(),
    files: [...new Set([...walked.files, ...colocatedStyles(walked.files)])],
  };
}

function walkSlug(slug) {
  const roots = collectSourceFiles(
    path.join(componentsRoot, slug),
    isModuleSource
  );
  return roots.length > 0 ? walkRoots(slug, roots) : null;
}

// A block page shows its minimal example if it has one, else its source.
function walkBlock(block) {
  const example = path.join(
    path.dirname(block.source),
    `${block.slug}-example.tsx`
  );
  return walkRoots(block.slug, [existsSync(example) ? example : block.source]);
}

function assertDeclaredPackages(walks) {
  const offenders = walks.flatMap((walked) =>
    walked.packages
      .filter((name) => !runtimeRanges.has(name))
      .map((name) => `  ${walked.name}: ${name}`)
  );

  if (offenders.length === 0) return;

  throw new Error(
    [
      'dependencies JSON: a component or block imports a package @nexus_ds/react does not declare in dependencies or peerDependencies.',
      ...offenders,
    ].join('\n')
  );
}

function linkedSlugs(files, exported) {
  return new Set(
    files.map((file) => linkedComponentSlug(file, exported)).filter(Boolean)
  );
}

/**
 * What a page tells the reader to do: install `components` first, then only
 * the packages, files and styles none of those components bring.
 */
function installPlan(walked, components, closures) {
  const brought = components.map((slug) => closures.get(slug));
  const broughtFiles = new Set(brought.flatMap(({ files }) => files));
  const broughtPackages = new Set(brought.flatMap(({ packages }) => packages));
  const files = walked.files.filter((file) => !broughtFiles.has(file));

  return {
    components,
    install: walked.packages
      .filter((name) => !broughtPackages.has(name))
      .map(toInstall),
    files: files.map(toSrcPath).sort(),
    styles: files
      .filter((file) => file.endsWith('.css'))
      .map(toSrcPath)
      .sort(),
  };
}

/**
 * A component page links every component it reaches. `closure` is everything
 * the component needs on disk, for tools that copy it whole.
 */
function componentEntry(walked, closures, exported) {
  const slugDir = path.join(componentsRoot, walked.name);
  const linked = linkedSlugs(walked.files, exported);
  linked.delete(walked.name);

  return {
    slug: walked.name,
    closure: {
      install: walked.packages.map(toInstall),
      copy: walked.files
        .filter((file) => !isUnder(file, slugDir))
        .map(toSrcPath)
        .sort(),
      files: walked.files
        .filter((file) => isUnder(file, slugDir))
        .map(toSrcPath)
        .sort(),
    },
    plan: installPlan(walked, [...linked].sort(), closures),
  };
}

// A block page links only the components no other link brings.
function blockEntry(walked, closures, exported) {
  const linked = [...linkedSlugs(walked.files, exported)];
  const reached = new Set(
    linked.flatMap((slug) =>
      [...linkedSlugs(closures.get(slug).files, exported)].filter(
        (other) => other !== slug
      )
    )
  );
  const direct = linked.filter((slug) => !reached.has(slug));

  return {
    slug: walked.name,
    plan: installPlan(walked, direct.sort(), closures),
  };
}

// Writes in place, so a page rendering mid-regeneration never finds the file missing.
function writeEntries(dir, entries) {
  mkdirSync(dir, { recursive: true });
  const current = new Set(entries.map(({ slug }) => `${slug}.json`));
  for (const file of readdirSync(dir)) {
    if (file.endsWith('.json') && !current.has(file)) {
      rmSync(path.join(dir, file));
    }
  }
  for (const entry of entries) {
    writeJson(path.join(dir, `${entry.slug}.json`), entry);
  }
}

/** Writes each component's and block's JSON; returns how many of each. */
export function generateDependencies() {
  const exported = new Set(exportedComponentSlugs());
  const componentWalks = componentSlugs().map(walkSlug).filter(Boolean);
  const blockWalks = blockSources().map(walkBlock);

  assertDeclaredPackages([...componentWalks, ...blockWalks]);

  const closures = new Map(
    componentWalks.map((walked) => [walked.name, walked])
  );
  const entries = componentWalks.map((walked) =>
    componentEntry(walked, closures, exported)
  );
  const blockEntries = blockWalks.map((walked) =>
    blockEntry(walked, closures, exported)
  );

  writeEntries(outputDir, entries);
  writeEntries(blocksOutputDir, blockEntries);

  return { components: entries.length, blocks: blockEntries.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { components, blocks } = generateDependencies();
  console.log(
    `dependencies: ${components} components, ${blocks} blocks -> ${toRepoPath(outputDir)}`
  );
}
