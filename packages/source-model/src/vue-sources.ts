// What @nxds/vue exports and the props of each component, as the docs and the
// cross-framework parity tests read them, and how the install planner reads a
// Vue source file.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { parse as parseSfc } from 'vue/compiler-sfc';
import {
  createChecker,
  type PropertyMeta,
  type PropertyMetaSchema,
} from 'vue-component-meta';

import { importSpecifiers } from './files.mjs';
import { publicExports } from './props-contract.mjs';
import {
  type ComponentEntry,
  cvaDefaultVariants,
  literalDefaultValue,
  type PropsFile,
  symbolAt,
  toPropsFile,
  typeofArgument,
} from './props-entries.ts';
import {
  isUnder,
  toRepoPath,
  vueComponentsRoot,
  vueRoot,
  vueSrc,
} from './roots.mjs';

const COMPONENT_SPECIFIER = './components/';

export type VueProgram = ReturnType<typeof createVueProgram>;

function fail(message: string): never {
  throw new Error(`vue-sources: ${message}`);
}

export function parseFile(filePath: string) {
  return ts.createSourceFile(
    filePath,
    readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
}

/** Every component folder packages/vue exports, in export order. */
export function exportedSlugs() {
  const index = readFileSync(path.join(vueSrc, 'index.ts'), 'utf8');
  return importSpecifiers(index)
    .filter((specifier) => specifier.startsWith(COMPONENT_SPECIFIER))
    .map((specifier) => {
      const [slug] = specifier.slice(COMPONENT_SPECIFIER.length).split('/');
      return slug ?? fail(`src/index.ts exports '${specifier}'.`);
    });
}

/** The SFCs a component folder exports as `default as Name`, in export order. */
export function exportedParts(slug: string) {
  const index = parseFile(path.join(vueComponentsRoot, slug, 'index.ts'));
  return index.statements.flatMap((statement) => {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !statement.moduleSpecifier.text.endsWith('.vue') ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    ) {
      return [];
    }
    const file = path.join(
      vueComponentsRoot,
      slug,
      statement.moduleSpecifier.text
    );
    return statement.exportClause.elements
      .filter((element) => element.propertyName?.text === 'default')
      .map((element) => ({ name: element.name.text, file }));
  });
}

/** The `vue-component-meta` checker, with the local alias names read from its program. */
export function createVueProgram() {
  const checker = createChecker(path.join(vueRoot, 'tsconfig.json'), {
    forceUseTs: true,
    schema: true,
    printer: { newLine: ts.NewLineKind.LineFeed },
  });
  return { checker, localAliases: localAliasNames(checker) };
}

/** Type alias names declared in @nxds/vue that its public entry does not export. */
function localAliasNames(checker: ReturnType<typeof createChecker>) {
  const program =
    checker.getProgram() ?? fail('the Vue checker has no program.');
  const exported = publicExports(program.getTypeChecker(), program, [
    path.join(vueSrc, 'index.ts'),
  ]);
  return new Set(
    program
      .getSourceFiles()
      .filter((sourceFile) => isUnder(sourceFile.fileName, vueSrc))
      .flatMap((sourceFile) => sourceFile.statements)
      .filter(ts.isTypeAliasDeclaration)
      .map((statement) => statement.name.text)
      .filter((name) => !exported.has(name))
  );
}

/** A union schema's members as printed types, or null when one is not a plain type. */
function unionMembers(schema: PropertyMetaSchema): string[] | null {
  if (typeof schema === 'string') return [schema];
  if (schema.kind !== 'enum' || !schema.schema) return null;
  const members: string[] = [];
  for (const memberSchema of schema.schema) {
    const member = unionMembers(memberSchema);
    if (!member) return null;
    members.push(...member);
  }
  return members;
}

/** A prop's type, with an unexported local union alias such as `Breakpoint` written out as its members. */
function propType(prop: PropertyMeta, localAliases: Set<string>) {
  const type = prop.type.replace(/\s*\|\s*undefined$/, '');
  if (!localAliases.has(type)) return type;
  const members = unionMembers(prop.schema)?.filter(
    (member) => member !== 'undefined'
  );
  return members && members.length > 1 ? members.join(' | ') : type;
}

/** The type node `defineProps<…>()` takes in a part's compiled script. */
function definePropsType(sourceFile: ts.SourceFile) {
  let found: ts.TypeNode | undefined;
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'defineProps'
    ) {
      found = node.typeArguments?.[0];
    }
    if (!found) ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

/**
 * The cva `defaultVariants` value for a prop typed `XVariants['key']`, where
 * `XVariants` is `VariantProps<typeof x>`: the default React reads from the
 * same recipe when its component leaves the prop unset.
 */
function variantDefault(
  vueProgram: VueProgram,
  file: string,
  propName: string
) {
  const program =
    vueProgram.checker.getProgram() ?? fail('the Vue checker has no program.');
  const typeChecker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(file);
  const propsType = sourceFile && definePropsType(sourceFile);
  if (!propsType) return null;

  const declaration = typeChecker
    .getTypeFromTypeNode(propsType)
    .getProperty(propName)?.declarations?.[0];
  const type =
    declaration && ts.isPropertySignature(declaration)
      ? declaration.type
      : undefined;
  if (
    !type ||
    !ts.isIndexedAccessTypeNode(type) ||
    !ts.isTypeReferenceNode(type.objectType) ||
    !ts.isLiteralTypeNode(type.indexType) ||
    !ts.isStringLiteral(type.indexType.literal)
  ) {
    return null;
  }

  const key = type.indexType.literal.text;
  const alias = symbolAt(
    typeChecker,
    type.objectType.typeName
  )?.declarations?.find(ts.isTypeAliasDeclaration);
  const variants = alias && typeofArgument(alias.type);
  const cva =
    variants?.kind === 'variants'
      ? symbolAt(typeChecker, variants.query.exprName)
      : undefined;
  if (!cva) return null;

  const defaults = new Map(cvaDefaultVariants(typeChecker, cva));
  return defaults.get(key)?.() ?? null;
}

/**
 * A prop's `withDefaults` value, held to the React props contract: a literal
 * or nothing. A variant prop left unset falls back to its recipe's default.
 */
function propDefault(
  vueProgram: VueProgram,
  { name, file }: VuePart,
  prop: PropertyMeta
) {
  if (prop.default === undefined) {
    return variantDefault(vueProgram, file, prop.name);
  }
  return literalDefaultValue(prop.default, `${name}.${prop.name}`);
}

/** Whether a prop or event is declared in @nxds/vue rather than inherited from a dependency. */
export function isOwnDeclaration(declarations: { file: string }[]) {
  return declarations.some(({ file }) => isUnder(file, vueSrc));
}

/** Each part a component folder exports, with its `vue-component-meta` read once. */
export function componentParts(vueProgram: VueProgram, slug: string) {
  return exportedParts(slug).map(({ name, file }) => ({
    name,
    file,
    meta: vueProgram.checker.getComponentMeta(file),
  }));
}

export type VuePart = ReturnType<typeof componentParts>[number];

export function partEntry(
  vueProgram: VueProgram,
  part: VuePart
): ComponentEntry {
  const { name, file, meta } = part;
  return {
    name,
    description: '',
    sourcePath: toRepoPath(file),
    props: meta.props
      .filter(
        (prop) => !prop.global && isOwnDeclaration(prop.getDeclarations())
      )
      .map((prop) => ({
        name: prop.name,
        type: propType(prop, vueProgram.localAliases),
        required: prop.required,
        defaultValue: propDefault(vueProgram, part, prop),
        description: prop.description,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'en')),
  };
}

export function componentProps(
  vueProgram: VueProgram,
  slug: string
): PropsFile {
  return toPropsFile(
    slug,
    componentParts(vueProgram, slug).map((part) => partEntry(vueProgram, part))
  );
}

// ── Install planning ────────────────────────────────────────────────────────

export function isVueModuleSource(file: string) {
  return /\.(?:ts|vue)$/.test(file) && !file.endsWith('.stories.ts');
}

/** A `.vue` file's `<script>` blocks; any other file whole. */
export function readVueScript(file: string) {
  const text = readFileSync(file, 'utf8');
  if (!file.endsWith('.vue')) return text;
  const { descriptor, errors } = parseSfc(text, { filename: file });
  if (errors.length > 0) {
    fail(`${toRepoPath(file)} does not parse: ${errors[0]?.message}`);
  }
  return [descriptor.script, descriptor.scriptSetup]
    .map((block) => block?.content ?? '')
    .join('\n');
}

// A Vue component is its whole folder, so any file in it links the component.
export function linkedVueSlug(file: string, exported: Set<string>) {
  if (!isUnder(file, vueComponentsRoot)) return null;
  const [slug] = path.relative(vueComponentsRoot, file).split(path.sep);
  return slug !== undefined && exported.has(slug) ? slug : null;
}
