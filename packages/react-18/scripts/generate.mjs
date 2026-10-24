// Writes packages/react-18 from packages/react. Every component whose props
// take `ref` is wrapped in `React.forwardRef`, because React 18 strips `ref`
// from a plain function component's props. Nothing else changes: the body,
// the stories and every other file are copied as they are.
//
//   node scripts/generate.mjs           write src/ and .storybook/
//   node scripts/generate.mjs --check   fail if what is on disk differs
//
// Files listed in hand-maintained.json are kept as they are on disk. --check
// fails when one's React 19 source changed since it was synced, when the
// generator would now write the same file, or when an entry has no reason.

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const SOURCE = path.resolve(PACKAGE, '../react');
const require = createRequire(path.join(SOURCE, 'package.json'));
const ts = require('typescript');
const prettier = require('prettier');

const CHECK = process.argv.includes('--check');

// Copied trees, relative to each package. `main.ts` stays hand-written: it
// pins React 18 and reuses packages/react's static files.
const TREES = ['src', '.storybook'];
const OWNED = new Set(['.storybook/main.ts']);
const SKIP = [/\.test\.ts$/, /(^|\/)tsconfig\.tsbuildinfo$/];

const REACT_18 = '^18.3.1';
const MANIFEST = 'hand-maintained.json';

function listFiles(root, dir = '') {
  return fs
    .readdirSync(path.join(root, dir), { withFileTypes: true })
    .flatMap((entry) => {
      const rel = path.posix.join(dir, entry.name);
      if (entry.isDirectory())
        return entry.name === 'public' ? [] : listFiles(root, rel);
      return SKIP.some((pattern) => pattern.test(rel)) ? [] : [rel];
    });
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

// --- transform ---------------------------------------------------------------

function createChecker() {
  const configPath = path.join(SOURCE, 'tsconfig.json');
  const config = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic(diagnostic) {
        throw new Error(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        );
      },
    }
  );
  // Read @nxds/core from source, so the output doesn't depend on a build.
  const options = {
    ...config.options,
    rootDir: undefined,
    paths: { '@nxds/core': [path.resolve(SOURCE, '../core/src/index.ts')] },
  };
  const program = ts.createProgram(config.fileNames, options);
  return { program, checker: program.getTypeChecker() };
}

/** The element a component's `ref` points at, `undefined` without one. */
function refElement(checker, param) {
  const ref = checker.getTypeAtLocation(param).getProperty('ref');
  if (!ref) return undefined;
  const refType = checker.getNonNullableType(
    checker.getTypeOfSymbolAtLocation(ref, param)
  );
  for (const member of refType.isUnion() ? refType.types : [refType]) {
    const current = member.getProperty('current');
    if (!current) continue;
    const element = checker.getNonNullableType(
      checker.getTypeOfSymbolAtLocation(current, param)
    );
    return checker.typeToString(
      element,
      undefined,
      ts.TypeFormatFlags.NoTruncation
    );
  }
  return null;
}

function isComponentName(name) {
  return /^[A-Z]/.test(name);
}

/** Header that replaces `function Name(binding: Props) {`. */
function forwardRefHeader({ exported, name, element, binding, props }) {
  const local = `React.PropsWithoutRef<${props}> & { ref?: React.ForwardedRef<${element}> }`;
  return [
    `${exported}const ${name} = React.forwardRef<${element}, React.PropsWithoutRef<${props}>>(`,
    `function ${name}(propsWithoutRef, forwardedRef) {`,
    // React 19 leaves `ref` out of props when none is passed. Keep it out, so a
    // `ref={…}` written before `{...props}` isn't replaced by `ref: null`.
    `const ${binding}: ${local} = forwardedRef === null ? propsWithoutRef : { ...propsWithoutRef, ref: forwardedRef };`,
  ].join('\n');
}

/** `import * as React`, after the file's other `react` imports, as the import sorter orders it. */
function reactImport(sourceFile) {
  const imports = sourceFile.statements.filter(ts.isImportDeclaration);
  const fromReact = imports.filter(
    (statement) => statement.moduleSpecifier.text === 'react'
  );
  const text = "import * as React from 'react';";
  const typeOnly = fromReact.find(
    (statement) =>
      statement.importClause?.isTypeOnly &&
      statement.importClause.namedBindings &&
      ts.isNamespaceImport(statement.importClause.namedBindings) &&
      statement.importClause.namedBindings.name.text === 'React'
  );
  if (typeOnly)
    return { from: typeOnly.getStart(sourceFile), to: typeOnly.end, text };
  const last = fromReact.at(-1);
  if (last) return { from: last.end, to: last.end, text: `\n${text}` };
  const first = imports[0];
  return {
    from: first.getStart(sourceFile),
    to: first.getStart(sourceFile),
    text: `${text}\n\n`,
  };
}

function transform(checker, sourceFile, rel, problems) {
  const edits = [];
  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        const init = declaration.initializer;
        if (
          !ts.isIdentifier(declaration.name) ||
          !isComponentName(declaration.name.text)
        )
          continue;
        if (
          !init ||
          !(ts.isArrowFunction(init) || ts.isFunctionExpression(init))
        )
          continue;
        const param = init.parameters[0];
        if (param && refElement(checker, param) !== undefined) {
          problems.push(
            `${rel}: ${declaration.name.text} is an arrow or function expression that takes ref. Write it as a function declaration.`
          );
        }
      }
      continue;
    }
    if (
      !ts.isFunctionDeclaration(statement) ||
      !statement.name ||
      !statement.body
    )
      continue;
    const name = statement.name.text;
    if (!isComponentName(name) || statement.parameters.length !== 1) continue;

    const param = statement.parameters[0];
    const element = refElement(checker, param);
    if (element === undefined) continue;
    if (element === null) {
      problems.push(`${rel}: can't name the element ${name}'s ref points at.`);
      continue;
    }
    if (statement.typeParameters) {
      problems.push(
        `${rel}: ${name} is generic and takes ref; forwardRef would drop its type parameters.`
      );
      continue;
    }
    if (!param.type) {
      problems.push(`${rel}: ${name}'s props have no type annotation.`);
      continue;
    }

    const exported = statement.modifiers?.some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword
    )
      ? 'export '
      : '';
    const header = forwardRefHeader({
      exported,
      name,
      element,
      binding: param.name.getText(sourceFile),
      props: param.type.getText(sourceFile),
    });
    edits.push({
      from: statement.getStart(sourceFile),
      to: statement.body.getStart(sourceFile) + 1,
      text: header,
    });
    edits.push({ from: statement.end, to: statement.end, text: ');' });
  }

  if (edits.length === 0) return null;

  if (!/^import \* as React from 'react';$/m.test(sourceFile.text)) {
    edits.push(reactImport(sourceFile));
  }

  let text = sourceFile.text;
  for (const edit of edits.sort((a, b) => b.from - a.from)) {
    text = text.slice(0, edit.from) + edit.text + text.slice(edit.to);
  }
  return text;
}

// --- output ------------------------------------------------------------------

async function generate() {
  const { program, checker } = createChecker();
  const problems = [];
  const output = new Map();

  for (const tree of TREES) {
    for (const rel of listFiles(path.join(SOURCE, tree))) {
      const file = path.posix.join(tree, rel);
      if (OWNED.has(file)) continue;
      const absolute = path.join(SOURCE, file);
      let text = fs.readFileSync(absolute, 'utf8');

      const sourceFile = program.getSourceFile(absolute);
      if (
        sourceFile &&
        file.endsWith('.tsx') &&
        !file.endsWith('.stories.tsx')
      ) {
        const transformed = transform(checker, sourceFile, file, problems);
        if (transformed !== null) {
          const options = await prettier.resolveConfig(absolute);
          text = await prettier.format(transformed, {
            ...options,
            filepath: absolute,
          });
        }
      }
      output.set(file, text);
    }
  }

  output.set('package.json', manifest());
  return { output, problems };
}

/** packages/react-18's package.json with packages/react's dependencies. */
function manifest() {
  const own = JSON.parse(
    fs.readFileSync(path.join(PACKAGE, 'package.json'), 'utf8')
  );
  const source = JSON.parse(
    fs.readFileSync(path.join(SOURCE, 'package.json'), 'utf8')
  );
  const devDependencies = { ...source.devDependencies, ...own.devDependencies };
  const next = {
    ...own,
    dependencies: source.dependencies,
    peerDependencies: {
      ...source.peerDependencies,
      react: REACT_18,
      'react-dom': REACT_18,
    },
    peerDependenciesMeta: source.peerDependenciesMeta,
    devDependencies: Object.fromEntries(
      Object.entries(devDependencies).sort(([a], [b]) => a.localeCompare(b))
    ),
  };
  return `${JSON.stringify(next, null, 2)}\n`;
}

function readManifestEntries(problems) {
  const file = path.join(PACKAGE, MANIFEST);
  const entries = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [rel, entry] of Object.entries(entries)) {
    if (!entry.reason?.trim())
      problems.push(`${MANIFEST}: ${rel} needs a reason.`);
    if (!fs.existsSync(path.join(SOURCE, rel))) {
      problems.push(
        `${MANIFEST}: ${rel} is not in packages/react. Delete the entry.`
      );
    }
  }
  return entries;
}

const { output, problems } = await generate();
const handMaintained = readManifestEntries(problems);

if (problems.length > 0) {
  fail(
    `Can't generate packages/react-18:\n${problems.map((p) => `  ${p}`).join('\n')}`
  );
  process.exit();
}

const stale = [];
for (const [rel, text] of output) {
  const target = path.join(PACKAGE, rel);
  const onDisk = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;

  if (rel in handMaintained) {
    const entry = handMaintained[rel];
    const source = fs.readFileSync(path.join(SOURCE, rel), 'utf8');
    if (onDisk === null)
      stale.push(`${rel} is hand-maintained but missing. Write it.`);
    else if (onDisk === text)
      stale.push(
        `${rel} matches what the generator writes. Delete its ${MANIFEST} entry.`
      );
    if (entry.syncedWith !== sha256(source)) {
      stale.push(
        `${rel} changed in packages/react. Port the change by hand, then set syncedWith to ${sha256(source)}.`
      );
    }
    continue;
  }

  if (onDisk === text) continue;
  if (CHECK) stale.push(`${rel} is out of date.`);
  else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  }
}

for (const tree of TREES) {
  const root = path.join(PACKAGE, tree);
  if (!fs.existsSync(root)) continue;
  for (const rel of listFiles(root)) {
    const file = path.posix.join(tree, rel);
    if (output.has(file) || OWNED.has(file)) continue;
    if (CHECK) stale.push(`${file} is not in packages/react.`);
    else fs.rmSync(path.join(PACKAGE, file));
  }
}

if (stale.length > 0) {
  const fix = CHECK
    ? '\nRun `pnpm --filter @nxds/react-18 generate`, and never edit generated files by hand.'
    : '';
  fail(
    `packages/react-18 is out of date:\n${stale.map((line) => `  ${line}`).join('\n')}${fix}`
  );
}
