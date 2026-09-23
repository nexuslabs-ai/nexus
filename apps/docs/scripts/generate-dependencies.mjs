import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

import { Project, SyntaxKind, ts } from 'ts-morph';

import { isUnder, toRepoPath } from './props-contract.mjs';
import {
  collectFiles,
  collectSourceFiles,
  componentSlugs,
  componentsRoot,
  reactSrc,
  writeJson,
} from './react-sources.mjs';
import { docsRoot, reactRoot } from './roots.mjs';

const outputDir = path.join(docsRoot, 'generated', 'dependencies');

const reactManifest = JSON.parse(
  readFileSync(path.join(reactRoot, 'package.json'), 'utf8')
);
const declaredPackages = new Set([
  ...Object.keys(reactManifest.dependencies ?? {}),
  ...Object.keys(reactManifest.peerDependencies ?? {}),
]);

const project = new Project({
  tsConfigFilePath: path.join(reactRoot, 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
});

function packageName(specifier) {
  const segments = specifier.split('/');
  if (specifier.startsWith('@')) return segments.slice(0, 2).join('/');
  return segments[0];
}

function toSrcPath(filePath) {
  return path.relative(reactSrc, filePath).split(path.sep).join('/');
}

function assertStaticImportsOnly(sourceFile) {
  const dynamic = [
    ...sourceFile.getDescendantsOfKind(SyntaxKind.ImportType),
    ...sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter(
        (call) => call.getExpression().getKind() === SyntaxKind.ImportKeyword
      ),
  ];
  if (dynamic.length === 0) return;

  throw new Error(
    `dependencies JSON: ${toRepoPath(sourceFile.getFilePath())}:${dynamic[0].getStartLineNumber()} uses import(), which the generator does not follow. Use a static import.`
  );
}

function resolveRelative(importer, specifier) {
  const { resolvedModule } = ts.resolveModuleName(
    specifier,
    importer,
    project.getCompilerOptions(),
    project.getModuleResolutionHost()
  );
  const targetPath =
    resolvedModule && path.resolve(resolvedModule.resolvedFileName);

  if (!targetPath || !isUnder(targetPath, reactSrc)) {
    throw new Error(
      `dependencies JSON: ${toRepoPath(importer)} imports '${specifier}', which does not resolve to a file under ${toRepoPath(reactSrc)}.`
    );
  }
  return targetPath;
}

const importsByFile = new Map();

// Splits one file's module specifiers into npm packages and repo-local files.
function fileImports(filePath) {
  if (importsByFile.has(filePath)) return importsByFile.get(filePath);

  const sourceFile = project.addSourceFileAtPath(filePath);
  assertStaticImportsOnly(sourceFile);

  const packages = [];
  const files = [];
  const declarations = [
    ...sourceFile.getImportDeclarations(),
    ...sourceFile
      .getExportDeclarations()
      .filter((declaration) => declaration.hasModuleSpecifier()),
  ];

  for (const declaration of declarations) {
    const specifier = declaration.getModuleSpecifierValue();
    if (specifier.startsWith('.')) {
      files.push(resolveRelative(filePath, specifier));
    } else {
      packages.push(packageName(specifier));
    }
  }

  const result = { packages, files };
  importsByFile.set(filePath, result);
  return result;
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
      queue.push(file);
    }
  }

  return { files: [...visited], packages: [...packages] };
}

function toEntry(slug) {
  const slugDir = path.join(componentsRoot, slug);
  const roots = collectSourceFiles(slugDir);
  if (roots.length === 0) return null;

  const walked = walk(roots);
  const styles = collectFiles(slugDir).filter((file) => file.endsWith('.css'));
  const own = [...walked.files, ...styles].filter((file) =>
    isUnder(file, slugDir)
  );

  return {
    slug,
    install: walked.packages.filter((name) => name !== 'react').sort(),
    copy: walked.files
      .filter((file) => !isUnder(file, slugDir))
      .map(toSrcPath)
      .sort(),
    files: own.map(toSrcPath).sort(),
  };
}

function assertDeclaredPackages(entries) {
  const offenders = entries.flatMap((entry) =>
    entry.install
      .filter((name) => !declaredPackages.has(name))
      .map((name) => `  ${entry.slug}: ${name}`)
  );

  if (offenders.length === 0) return;

  throw new Error(
    [
      'dependencies JSON: a component imports a package that @nexus_ds/react does not declare in dependencies or peerDependencies, so a reader would be told to install something the package never promised.',
      ...offenders,
    ].join('\n')
  );
}

const entries = componentSlugs().map(toEntry).filter(Boolean);

assertDeclaredPackages(entries);

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const entry of entries) {
  writeJson(path.join(outputDir, `${entry.slug}.json`), entry);
}

console.log(
  `dependencies: ${entries.length} entries, ${importsByFile.size} files walked -> ${toRepoPath(outputDir)}`
);
