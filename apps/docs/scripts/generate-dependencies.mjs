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
  pastedComponents,
  PREVIEW_DEMO,
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
const publicRoot = path.join(docsRoot, 'public');
const PUBLIC_URL = /['"`](\/[\w./-]+\.\w+)['"`]/g;

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

function toPublicPath(filePath) {
  return path.relative(publicRoot, filePath).split(path.sep).join('/');
}

/** Sorted src paths of `files`, split into imports (outside `slugDir`) and the component's own. */
function splitOwn(files, slugDir) {
  const imported = [];
  const own = [];
  for (const file of files) {
    (isUnder(file, slugDir) ? own : imported).push(toSrcPath(file));
  }
  return { imported: imported.sort(), own: own.sort() };
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

/** The source of every demo in `examples/{slug}/`, the preview demo's apart from the rest. */
function demoSources(slug) {
  const slugExamples = path.join(examplesRoot, slug);
  if (!statSync(slugExamples, { throwIfNoEntry: false })?.isDirectory()) {
    return { preview: [], examples: [] };
  }

  const previewFile = `${PREVIEW_DEMO}${DEMO_EXTENSION}`;
  const names = readdirSync(slugExamples).filter(
    (name) => name.endsWith(DEMO_EXTENSION) && isDemoName(name)
  );
  const sourceOf = (name) =>
    readFileSync(path.join(slugExamples, name), 'utf8');

  return {
    preview: names.filter((name) => name === previewFile).map(sourceOf),
    examples: names.filter((name) => name !== previewFile).map(sourceOf),
  };
}

/** Packages the demos in `examples/{slug}/` import beyond the pasted components'. */
function demoPackages(slug, specifiers, componentPackages) {
  const names = specifiers
    .filter(
      (specifier) =>
        !specifier.startsWith('.') && !specifier.startsWith(COPIED_PREFIX)
    )
    .map(packageName);

  return [...new Set(names)]
    .filter(
      (name) => !ALWAYS_INSTALLED.has(name) && !componentPackages.has(name)
    )
    .map((name) => {
      const range = docsDependencies[name];
      if (!range) {
        throw new Error(
          `dependencies JSON: examples/${slug}/ imports ${name}, which is not in apps/docs/package.json dependencies.`
        );
      }
      if (range.startsWith('workspace:')) {
        throw new Error(
          `dependencies JSON: examples/${slug}/ imports workspace package ${name} — import Nexus code through @/ instead.`
        );
      }
      return { name, range };
    });
}

/** Files under `public/` a demo references by root-relative URL, such as `/avatars/ada.svg`. */
function publicAssets(slug, source) {
  return [...source.matchAll(PUBLIC_URL)].map(([, url]) => {
    const file = path.join(publicRoot, url);
    const isFile = statSync(file, { throwIfNoEntry: false })?.isFile();
    if (!isFile || !isUnder(file, publicRoot)) {
      throw new Error(
        `dependencies JSON: examples/${slug}/ references ${url}, which is not a file under ${toRepoPath(publicRoot)}.`
      );
    }
    return file;
  });
}

/**
 * What `sources` paste beside: the `slug` block, the block of every other
 * component they import, the packages they import directly, and the `public/`
 * files they reference.
 */
function pasteNeeds(slug, sources, walksBySlug) {
  const specifiers = sources.flatMap(importSpecifiers);
  const blocks = pastedComponents(specifiers, slug).map((other) => {
    const walked = walksBySlug.get(other);
    if (!walked) {
      throw new Error(
        `dependencies JSON: examples/${slug}/ imports @/components/${other}, which has no install block.`
      );
    }
    return walked;
  });
  const componentPackages = new Set(blocks.flatMap(({ packages }) => packages));

  return {
    packages: [
      ...[...componentPackages].map(toInstall),
      ...demoPackages(slug, specifiers, componentPackages),
    ],
    files: new Set(blocks.flatMap(({ files }) => files)),
    assets: new Set(sources.flatMap((source) => publicAssets(slug, source))),
  };
}

/** The copy list names the files a component imports first and its own last. */
function toBlock(slugDir, packages, files, assets) {
  const { imported, own } = splitOwn(files, slugDir);
  const copy = [...imported, ...own];

  return {
    packages: packages.map(({ name, range }) => `${name}@${range}`).sort(),
    copy,
    styles: copy.filter((file) => file.endsWith('.css')),
    assets: [...assets].map(toPublicPath).sort(),
  };
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
    files: [...needed],
    demos: demoSources(slug),
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

/**
 * The component's own block, then the page's: the Installation block covers
 * the preview demo, and the examples block adds what the other demos need.
 */
function toEntry(walked, walksBySlug) {
  const { slug, slugDir, packages, files, demos } = walked;
  const preview = pasteNeeds(slug, demos.preview, walksBySlug);
  const all = pasteNeeds(
    slug,
    [...demos.preview, ...demos.examples],
    walksBySlug
  );
  const previewPackages = preview.packages.map(({ name }) => name);
  const { imported, own } = splitOwn(files, slugDir);

  return {
    slug,
    install: [...packages].sort().map(toInstall),
    copy: imported,
    files: own,
    installBlock: toBlock(
      slugDir,
      preview.packages,
      preview.files,
      preview.assets
    ),
    examplesBlock: toBlock(
      slugDir,
      all.packages.filter(({ name }) => !previewPackages.includes(name)),
      [...all.files].filter((file) => !preview.files.has(file)),
      [...all.assets].filter((file) => !preview.assets.has(file))
    ),
  };
}

const walks = componentSlugs().map(walkSlug).filter(Boolean);

assertDeclaredPackages(walks);

const walksBySlug = new Map(walks.map((walked) => [walked.slug, walked]));
const entries = walks.map((walked) => toEntry(walked, walksBySlug));

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const entry of entries) {
  writeJson(path.join(outputDir, `${entry.slug}.json`), entry);
}

console.log(
  `dependencies: ${entries.length} entries -> ${toRepoPath(outputDir)}`
);
