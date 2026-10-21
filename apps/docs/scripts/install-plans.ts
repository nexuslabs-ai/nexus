// What installing a component takes, for any framework package: the walk from
// a component's files to every file and package it reaches, and the plan a
// docs page shows. Each generator passes its framework's `ComponentSource`.
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { collectSourceFiles, importSpecifiers, writeJson } from './files.mjs';
import { isUnder, toRepoPath } from './roots.mjs';

export interface ComponentSource {
  /** The package folder, holding package.json and tsconfig.json. */
  root: string;
  src: string;
  componentsRoot: string;
  /** The framework's own package, which a plan never installs. */
  framework: string;
  /** Files the walk reads imports from. */
  isModuleSource: (file: string) => boolean;
  /** A file's script, as TypeScript reads it. */
  readScript: (file: string) => string;
  /** The exported component a page links instead of listing `file`, or null. */
  linkedComponentSlug: (file: string, exported: Set<string>) => string | null;
}

export interface Walk {
  name: string;
  packages: string[];
  files: string[];
}

interface Manifest {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export function packageName(specifier: string): string {
  const segments = specifier.split('/');
  if (specifier.startsWith('@')) return segments.slice(0, 2).join('/');
  return segments[0] ?? specifier;
}

function readManifest(packageDir: string): Manifest {
  return JSON.parse(
    readFileSync(path.join(packageDir, 'package.json'), 'utf8')
  );
}

export function createInstallPlanner(source: ComponentSource) {
  const manifest = readManifest(source.root);
  const runtimeRanges = new Map(
    Object.entries({ ...manifest.peerDependencies, ...manifest.dependencies })
  );
  const tsconfig = path.join(source.root, 'tsconfig.json');
  const compilerOptions = ts.parseJsonConfigFileContent(
    ts.readConfigFile(tsconfig, ts.sys.readFile).config,
    ts.sys,
    path.dirname(tsconfig)
  ).options;

  // Mirrors how `pnpm publish` rewrites a `workspace:` range.
  function publishedRange(name: string): string {
    const range = runtimeRanges.get(name);
    if (!range) {
      throw new Error(
        `dependencies JSON: ${manifest.name} imports ${name} but does not declare it in dependencies or peerDependencies.`
      );
    }
    if (!range.startsWith('workspace:')) return range;

    const spec = range.slice('workspace:'.length);
    const { version } = readManifest(
      path.join(source.root, 'node_modules', name)
    );
    if (spec === '*') return version;
    if (spec === '^' || spec === '~') return `${spec}${version}`;
    return spec;
  }

  function toInstall(name: string) {
    return { name, range: publishedRange(name) };
  }

  function toSrcPath(filePath: string) {
    return path.relative(source.src, filePath).split(path.sep).join('/');
  }

  function resolveRelative(importer: string, specifier: string) {
    const { resolvedModule } = ts.resolveModuleName(
      specifier,
      importer,
      compilerOptions,
      ts.sys
    );
    // Non-TS imports such as `./x.css` or `./X.vue` have no module resolution; take the path as written.
    const targetPath = resolvedModule
      ? path.resolve(resolvedModule.resolvedFileName)
      : path.resolve(path.dirname(importer), specifier);

    const isFile = statSync(targetPath, { throwIfNoEntry: false })?.isFile();
    if (!isFile || !isUnder(targetPath, source.src)) {
      throw new Error(
        `dependencies JSON: ${toRepoPath(importer)} imports '${specifier}', which does not resolve to a file under ${toRepoPath(source.src)}.`
      );
    }
    return targetPath;
  }

  function fileImports(filePath: string) {
    const packages: string[] = [];
    const files: string[] = [];

    for (const specifier of importSpecifiers(source.readScript(filePath))) {
      if (specifier.startsWith('.')) {
        files.push(resolveRelative(filePath, specifier));
      } else {
        packages.push(packageName(specifier));
      }
    }

    return { packages, files };
  }

  function walk(roots: string[]) {
    const visited = new Set(roots);
    const packages = new Set<string>();
    const queue = [...roots];

    for (let file = queue.pop(); file !== undefined; file = queue.pop()) {
      const imports = fileImports(file);
      for (const name of imports.packages) packages.add(name);
      for (const imported of imports.files) {
        if (visited.has(imported)) continue;
        visited.add(imported);
        if (source.isModuleSource(imported)) queue.push(imported);
      }
    }

    return { files: [...visited], packages: [...packages] };
  }

  function colocatedStyles(files: string[]) {
    const folders = new Set(files.map((file) => path.dirname(file)));
    return [...folders].flatMap((folder) =>
      readdirSync(folder)
        .filter((name) => name.endsWith('.css'))
        .map((name) => path.join(folder, name))
    );
  }

  function walkRoots(name: string, roots: string[]): Walk {
    const walked = walk(roots);
    return {
      name,
      packages: walked.packages
        .filter((pkg) => pkg !== source.framework)
        .sort(),
      files: [...new Set([...walked.files, ...colocatedStyles(walked.files)])],
    };
  }

  function walkSlug(slug: string): Walk | null {
    const roots: string[] = collectSourceFiles(
      path.join(source.componentsRoot, slug),
      source.isModuleSource
    );
    return roots.length > 0 ? walkRoots(slug, roots) : null;
  }

  function assertDeclaredPackages(walks: Walk[]) {
    const offenders = walks.flatMap((walked) =>
      walked.packages
        .filter((name) => !runtimeRanges.has(name))
        .map((name) => `  ${walked.name}: ${name}`)
    );

    if (offenders.length === 0) return;

    throw new Error(
      [
        `dependencies JSON: a component or block imports a package ${manifest.name} does not declare in dependencies or peerDependencies.`,
        ...offenders,
      ].join('\n')
    );
  }

  function linkedSlugs(files: string[], exported: Set<string>) {
    return new Set(
      files
        .map((file) => source.linkedComponentSlug(file, exported))
        .filter((slug) => slug !== null)
    );
  }

  /**
   * What a page tells the reader to do: install `components` first, then only
   * the packages, files and styles none of those components bring.
   */
  function installPlan(
    walked: Walk,
    components: string[],
    closures: Map<string, Walk>
  ) {
    const brought = components.map((slug) => {
      const closure = closures.get(slug);
      if (!closure) throw new Error(`dependencies JSON: no walk for ${slug}.`);
      return closure;
    });
    const broughtFiles = new Set(brought.flatMap(({ files }) => files));
    const broughtPackages = new Set(
      brought.flatMap(({ packages }) => packages)
    );
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
  function componentEntry(
    walked: Walk,
    closures: Map<string, Walk>,
    exported: Set<string>
  ) {
    const slugDir = path.join(source.componentsRoot, walked.name);
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

  return {
    publishedRange,
    walkRoots,
    walkSlug,
    assertDeclaredPackages,
    linkedSlugs,
    installPlan,
    componentEntry,
  };
}

// Writes in place, so a page rendering mid-regeneration never finds the file missing.
export function writeEntries(dir: string, entries: { slug: string }[]) {
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
