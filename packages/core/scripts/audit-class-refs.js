import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const TOKEN_REGISTRY = path.join(
  REPO_ROOT,
  'packages',
  'core',
  'src',
  'lib',
  'token-registry.ts'
);
const CLASS_SOURCE_DIRS = [
  path.join(REPO_ROOT, 'packages', 'react', 'src'),
  path.join(REPO_ROOT, 'apps'),
];
const COMPONENT_SOURCE_DIRS = [
  path.join(REPO_ROOT, 'packages', 'react', 'src', 'components'),
];

// Deleted/foreign shadcn-style families are not in the registry, but a class
// using one is still trying to reach the semantic-token layer.
const RETIRED_SEMANTIC_FAMILIES = ['accent'];

// Utility prefixes that consume a color-like value (e.g., `nx:bg-X`, `nx:text-X`).
const UTILITY_PREFIXES = [
  'bg',
  'text',
  'border',
  'ring',
  'fill',
  'stroke',
  'outline',
  'shadow',
  'divide',
];

function unwrapExpression(node) {
  let current = node;
  while (ts.isAsExpression(current)) {
    current = current.expression;
  }
  return current;
}

function readStringArray(node) {
  const array = unwrapExpression(node);
  if (!ts.isArrayLiteralExpression(array)) return null;

  const values = [];
  for (const element of array.elements) {
    if (!ts.isStringLiteral(element)) return null;
    values.push(element.text);
  }
  return values;
}

function loadSemanticRegistryNames() {
  const content = fs.readFileSync(TOKEN_REGISTRY, 'utf8');
  const source = ts.createSourceFile(
    TOKEN_REGISTRY,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const namedArrays = new Map();
  let registryInitializer = null;

  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) {
        continue;
      }

      const name = declaration.name.text;
      if (name === 'SEMANTIC_TOKEN_REGISTRY') {
        registryInitializer = unwrapExpression(declaration.initializer);
        continue;
      }

      const values = readStringArray(declaration.initializer);
      if (values) {
        namedArrays.set(name, values);
      }
    }
  }

  if (
    !registryInitializer ||
    !ts.isArrayLiteralExpression(registryInitializer)
  ) {
    throw new Error(
      'audit-class-refs: could not find SEMANTIC_TOKEN_REGISTRY array.'
    );
  }

  const names = [];
  for (const element of registryInitializer.elements) {
    if (!ts.isSpreadElement(element)) {
      throw new Error(
        'audit-class-refs: SEMANTIC_TOKEN_REGISTRY must be composed from metas(...) spreads.'
      );
    }

    const expression = element.expression;
    if (
      !ts.isCallExpression(expression) ||
      !ts.isIdentifier(expression.expression) ||
      expression.expression.text !== 'metas' ||
      expression.arguments.length < 2
    ) {
      throw new Error(
        'audit-class-refs: registry spreads must call metas(category, TOKEN_NAMES).'
      );
    }

    const namesArg = expression.arguments[1];
    if (!ts.isIdentifier(namesArg) || !namedArrays.has(namesArg.text)) {
      throw new Error(
        `audit-class-refs: could not resolve registry token array ${namesArg.getText(source)}.`
      );
    }

    names.push(...namedArrays.get(namesArg.text));
  }

  return new Set(names);
}

function semanticFamily(name) {
  return name.split('-')[0];
}

function semanticFamiliesFromRegistry(registryNames) {
  const families = new Set(RETIRED_SEMANTIC_FAMILIES);
  for (const name of registryNames) {
    families.add(semanticFamily(name));
  }
  return families;
}

function isSemanticName(name, semanticFamilies) {
  return semanticFamilies.has(semanticFamily(name));
}

function isAllowedRuntimeColorVar(name, registryNames) {
  if (name.endsWith('-')) {
    for (const registryName of registryNames) {
      if (registryName.startsWith(name)) return true;
    }
  }

  return registryNames.has(name);
}

function* walkSources(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkSources(full);
    } else if (/\.(tsx?|jsx?|mdx?)$/.test(entry.name)) {
      yield full;
    }
  }
}

function findClassRefs(content) {
  // Match: nx:<optional state chain>:(utility)-<color-name>
  // State chain segments may be:
  //   - bare words like `hover:`, `focus:`, `focus-visible:`, `dark:`
  //   - words with arbitrary-value suffix like `data-[state=open]:`
  //   - pure arbitrary selectors like `[&_svg]:`
  // The leading `nx:` is anchored at a non-word boundary so `foonx:` does not
  // match.
  const utilityAlt = UTILITY_PREFIXES.join('|');
  const re = new RegExp(
    String.raw`(?:^|[^\w-])nx:(?:[a-z-]+(?:\[[^\]]+\])?:|\[[^\]]+\]:)*(?:${utilityAlt})-([a-z][a-z0-9-]*)`,
    'g'
  );
  const hits = [];
  for (const match of content.matchAll(re)) {
    hits.push({ name: match[1], offset: match.index });
  }
  return hits;
}

function findRuntimeColorVarRefs(content) {
  const hits = [];
  for (const match of content.matchAll(/--nx-color-([a-z][a-z0-9-]*)/g)) {
    hits.push({ name: match[1], offset: match.index });
  }
  return hits;
}

function lineOf(content, offset) {
  return content.slice(0, offset).split('\n').length;
}

function main() {
  const known = loadSemanticRegistryNames();
  const semanticFamilies = semanticFamiliesFromRegistry(known);
  const unresolvedClassRefs = [];
  const primitiveVarRefs = [];
  let scanned = 0;

  for (const dir of CLASS_SOURCE_DIRS) {
    for (const file of walkSources(dir)) {
      scanned += 1;
      const content = fs.readFileSync(file, 'utf8');
      const seen = new Set();
      for (const hit of findClassRefs(content)) {
        // Documentation placeholders like `nx:bg-chart-categorical-N` are not
        // real class refs; the regex stops before the uppercase placeholder.
        if (hit.name.endsWith('-')) continue;
        if (!isSemanticName(hit.name, semanticFamilies)) continue;
        if (known.has(hit.name)) continue;
        const key = `${file}:${hit.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unresolvedClassRefs.push({
          file: path.relative(REPO_ROOT, file),
          line: lineOf(content, hit.offset),
          name: hit.name,
        });
      }
    }
  }

  for (const dir of COMPONENT_SOURCE_DIRS) {
    for (const file of walkSources(dir)) {
      const content = fs.readFileSync(file, 'utf8');
      const seen = new Set();
      for (const hit of findRuntimeColorVarRefs(content)) {
        if (isAllowedRuntimeColorVar(hit.name, known)) {
          continue;
        }

        const key = `${file}:${hit.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        primitiveVarRefs.push({
          file: path.relative(REPO_ROOT, file),
          line: lineOf(content, hit.offset),
          name: hit.name,
        });
      }
    }
  }

  if (unresolvedClassRefs.length === 0 && primitiveVarRefs.length === 0) {
    process.stdout.write(
      `audit-class-refs: scanned ${scanned} files — all semantic color refs resolve and component color vars are semantic.\n`
    );
    process.exit(0);
  }

  if (unresolvedClassRefs.length > 0) {
    process.stdout.write(
      `audit-class-refs: scanned ${scanned} files — ${unresolvedClassRefs.length} unresolved semantic color class ref(s):\n`
    );
    for (const f of unresolvedClassRefs) {
      process.stdout.write(
        `  ${f.file}:${f.line}  nx:...-${f.name}  (not in SEMANTIC_TOKEN_REGISTRY)\n`
      );
    }
  }

  if (primitiveVarRefs.length > 0) {
    process.stdout.write(
      `audit-class-refs: found ${primitiveVarRefs.length} primitive/unknown component color var ref(s):\n`
    );
    for (const f of primitiveVarRefs) {
      process.stdout.write(
        `  ${f.file}:${f.line}  --nx-color-${f.name}  (component code must use semantic color vars)\n`
      );
    }
  }
  process.exit(1);
}

main();
