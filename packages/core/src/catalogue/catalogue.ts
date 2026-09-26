import {
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  type NexusAppearanceState,
} from '../lib/appearance-model';
import { deriveThemeMode } from '../lib/derive-theme';
import type { Mode } from '../lib/palette';
import { SEMANTIC_TOKEN_REGISTRY } from '../lib/token-registry';
import {
  formatShadowStyle,
  formatTokenValue,
  formatTypographyDeclarations,
  resolveValue,
} from '../token-source/format';
import {
  SPACING_MODE_FILE_PATTERN,
  spacingRoleUtility,
  spacingTokenKind,
} from '../token-source/spacing';
import {
  type ExtractedToken,
  extractTokens,
  pathToCssVarPrefixed,
  tokenReferences,
} from '../token-source/tokens';
import {
  BORDER_COLOR_ALIAS_NAMES,
  borderWidthAliasUtilities,
  durationUtility,
} from '../token-source/utilities';

import { RUNTIME_COLOR_DESCRIPTIONS } from './descriptions';
import { TOKEN_FILES, type TokenFile } from './token-files';
import type {
  CatalogueAlias,
  CatalogueDeclaration,
  CatalogueFamily,
  CatalogueReference,
  CatalogueToken,
  CatalogueTokenName,
  CatalogueVariant,
} from './types';

type PrimitiveFamily = Extract<
  CatalogueFamily,
  'borderwidth' | 'color' | 'motion' | 'radius' | 'shadow' | 'typography'
>;

const PRIMITIVE_FAMILIES: readonly PrimitiveFamily[] = [
  'borderwidth',
  'color',
  'motion',
  'radius',
  'shadow',
  'typography',
];
const RUNTIME_MODES: readonly Mode[] = ['light', 'dark'];
const Z_INDEX_FILE: TokenFile = 'semantic/z-index.json';
const BREAKPOINTS_FILE: TokenFile = 'semantic/breakpoints.json';
const TYPOGRAPHY_STYLES_FILE: TokenFile = 'styles/typography.json';
const SHADOW_STYLES_FILE: TokenFile = 'styles/shadows.json';
const BORDER_COLOR_ALIASES = new Set<string>(BORDER_COLOR_ALIAS_NAMES);
const SINGLE_SOURCE = { mode: null, preset: null } as const;

/** A `PrimitiveLookup` that also carries each target's canonical name. */
type ReferenceLookup = ReadonlyMap<
  string,
  { cssName: string; name: CatalogueTokenName }
>;

/** The theme mode and preset one token file holds values for. */
interface VariantAxes {
  mode: Mode | null;
  preset: string | null;
}

/** One authored leaf, in the file, theme mode, and preset it came from. */
interface AuthoredLeaf extends VariantAxes {
  family: CatalogueFamily;
  file: TokenFile;
  leaf: ExtractedToken;
}

/** What one leaf contributes: the token it belongs to and its variant's declarations. */
interface LeafEntry {
  name: CatalogueTokenName;
  aliases: readonly CatalogueAlias[];
  declarations: readonly CatalogueDeclaration[];
}

const cssVariable = (name: string): CatalogueAlias => ({
  kind: 'css-variable',
  name,
});
const utility = (name: string): CatalogueAlias => ({
  kind: 'utility',
  name: `nx:${name}`,
});

function tokenFiles(): TokenFile[] {
  return Object.keys(TOKEN_FILES) as TokenFile[];
}

function fileLeaves(
  family: CatalogueFamily,
  file: TokenFile,
  axes: VariantAxes
): AuthoredLeaf[] {
  return extractTokens(TOKEN_FILES[file]).map((leaf) => ({
    family,
    file,
    ...axes,
    leaf,
  }));
}

function primitiveFiles(family: PrimitiveFamily): TokenFile[] {
  return tokenFiles().filter(
    (file) =>
      file === `primitives/${family}.json` ||
      file.startsWith(`primitives/${family}/${family}-`)
  );
}

/**
 * A mode file's suffix split into its preset and theme mode:
 * `shadow-quiet-dark.json` is preset `quiet` in `dark`, and
 * `radius-round.json` is preset `round` in both modes.
 */
function modeFileAxes(file: TokenFile, family: PrimitiveFamily): VariantAxes {
  const suffix = file.slice(
    `primitives/${family}/${family}-`.length,
    -'.json'.length
  );
  const mode = RUNTIME_MODES.find((candidate) =>
    suffix.endsWith(`-${candidate}`)
  );
  if (mode === undefined) return { mode: null, preset: suffix };
  return { mode, preset: suffix.slice(0, -`-${mode}`.length) };
}

function primitiveLeaves(family: PrimitiveFamily): AuthoredLeaf[] {
  const files = primitiveFiles(family);
  return files.flatMap((file) =>
    fileLeaves(
      family,
      file,
      files.length > 1 ? modeFileAxes(file, family) : SINGLE_SOURCE
    )
  );
}

function spacingLeaves(): AuthoredLeaf[] {
  const directory = 'semantic/';
  return tokenFiles().flatMap((file) => {
    if (!file.startsWith(directory)) return [];
    const preset = file
      .slice(directory.length)
      .match(SPACING_MODE_FILE_PATTERN)?.[1];
    if (preset === undefined) return [];
    return fileLeaves('spacing', file, { mode: null, preset });
  });
}

function primitiveName(
  family: CatalogueFamily,
  path: readonly string[]
): CatalogueTokenName {
  return `--nx-${pathToCssVarPrefixed(path, family)}`;
}

/**
 * References resolve the way the generator's primitive map does: bare or
 * family-qualified. A bare path two families share would resolve to whichever
 * the generator loaded last, so it throws instead.
 */
function primitiveLookup(leaves: readonly AuthoredLeaf[]): ReferenceLookup {
  const lookup = new Map<
    string,
    { cssName: string; name: CatalogueTokenName }
  >();
  for (const { family, leaf } of leaves) {
    const name = primitiveName(family, leaf.path);
    const entry = { cssName: name.slice('--'.length), name };
    const reference = leaf.path.join('.');
    for (const key of [reference, `${family}.${reference}`]) {
      const existing = lookup.get(key);
      if (existing && existing.name !== name) {
        throw new Error(
          `catalogue: reference {${key}} matches both ${existing.name} and ${name}`
        );
      }
      lookup.set(key, entry);
    }
  }
  return lookup;
}

function referenceTargets(
  leaf: ExtractedToken,
  lookup: ReferenceLookup
): CatalogueReference[] {
  return tokenReferences(leaf.value).map(({ field, reference }) => {
    const target = lookup.get(reference);
    if (!target) {
      throw new Error(
        `catalogue: ${leaf.path.join('.')} references unknown token {${reference}}`
      );
    }
    return { field, reference, target: target.name };
  });
}

/** A multi-level path is grouped by its first key; a flat file by its family. */
function leafGroup(family: CatalogueFamily, path: readonly string[]): string {
  return path.length > 1 ? (path[0] ?? family) : family;
}

/**
 * Build one token per canonical name, with one variant per leaf that maps to
 * it. Token-level fields come from the first leaf.
 */
function authoredTokens(
  leaves: readonly AuthoredLeaf[],
  lookup: ReferenceLookup,
  entryFor: (leaf: AuthoredLeaf) => LeafEntry
): CatalogueToken[] {
  const tokens = new Map<
    CatalogueTokenName,
    CatalogueToken & { variants: CatalogueVariant[] }
  >();
  for (const authored of leaves) {
    const { family, file, mode, preset, leaf } = authored;
    const { name, aliases, declarations } = entryFor(authored);
    const token = tokens.get(name) ?? {
      name,
      family,
      group: leafGroup(family, leaf.path),
      type: leaf.type,
      description: leaf.description ?? null,
      aliases,
      variants: [],
    };
    token.variants.push({
      mode,
      preset,
      source: { file, path: leaf.path },
      appearance: null,
      authoredValue: structuredClone(leaf.value),
      declarations,
      references: referenceTargets(leaf, lookup),
    });
    tokens.set(name, token);
  }
  return [...tokens.values()];
}

/** The theme variables and utilities the generator emits for a primitive. */
function primitiveAliases(
  family: CatalogueFamily,
  path: readonly string[]
): CatalogueAlias[] {
  const key = path.join('-');
  if (family === 'radius') return [cssVariable(`--radius-${key}`)];
  if (family === 'borderwidth') {
    return [
      cssVariable(`--border-width-${key}`),
      cssVariable(`--outline-width-${key}`),
      ...borderWidthAliasUtilities(key).map(({ name }) => utility(name)),
    ];
  }
  if (family !== 'motion') return [];
  const [group, motionKey = ''] = path;
  if (group === 'duration') {
    const aliases = [utility(durationUtility(motionKey).name)];
    if (motionKey === 'default') {
      aliases.push(cssVariable('--default-transition-duration'));
    }
    return aliases;
  }
  if (group === 'ease') {
    const aliases = [cssVariable(`--ease-${motionKey}`)];
    if (motionKey === 'enter') {
      aliases.push(cssVariable('--default-transition-timing-function'));
    }
    return aliases;
  }
  return [];
}

function primitiveEntry(lookup: ReferenceLookup) {
  return ({ family, leaf }: AuthoredLeaf): LeafEntry => {
    const name = primitiveName(family, leaf.path);
    const reference = leaf.path.join('.');
    return {
      name,
      aliases: [
        ...primitiveAliases(family, leaf.path),
        { kind: 'reference', name: reference },
        { kind: 'reference', name: `${family}.${reference}` },
      ],
      declarations: [
        {
          property: name,
          value: resolveValue(leaf.value, lookup, leaf.type, leaf.path),
        },
      ],
    };
  };
}

function spacingEntry({ leaf }: AuthoredLeaf): LeafEntry {
  const key = leaf.path.join('-');
  const name: CatalogueTokenName = `--nx-${key}`;
  const alias =
    spacingTokenKind(leaf.path) === 'role'
      ? utility(spacingRoleUtility(leaf.path).name)
      : cssVariable(`--${key}`);
  return {
    name,
    aliases: [alias],
    declarations: [
      {
        property: name,
        value: formatTokenValue(leaf.value, leaf.type, leaf.path),
      },
    ],
  };
}

/** Z-index layers and breakpoints, declared only as their `@theme` property. */
function themeOnlyEntry({ leaf }: AuthoredLeaf): LeafEntry {
  const key = leaf.path.join('-');
  const property = `--${key}`;
  return {
    name: `--nx-${key}`,
    aliases: [cssVariable(property)],
    declarations: [
      { property, value: formatTokenValue(leaf.value, leaf.type, leaf.path) },
    ],
  };
}

function typographyStyleEntry(lookup: ReferenceLookup) {
  return ({ leaf }: AuthoredLeaf): LeafEntry => {
    const key = pathToCssVarPrefixed(leaf.path, 'typography');
    return {
      name: `--nx-${key}`,
      aliases: [utility(key)],
      declarations: formatTypographyDeclarations(leaf.path, leaf.value, lookup),
    };
  };
}

function shadowStyleEntry(lookup: ReferenceLookup) {
  return ({ leaf }: AuthoredLeaf): LeafEntry => {
    const key = pathToCssVarPrefixed(leaf.path, 'shadow');
    const property = `--${key}`;
    return {
      name: `--nx-${key}`,
      aliases: [cssVariable(property)],
      declarations: [
        {
          property,
          value: formatShadowStyle(leaf.path, leaf.value, lookup),
        },
      ],
    };
  };
}

function styleLeaves(family: CatalogueFamily, file: TokenFile): AuthoredLeaf[] {
  return fileLeaves(family, file, SINGLE_SOURCE).filter(
    ({ leaf }) => leaf.type === family
  );
}

function runtimeAppearance(mode: Mode): NexusAppearanceState {
  return {
    ...DEFAULT_NEXUS_APPEARANCE,
    prefs: { ...DEFAULT_NEXUS_APPEARANCE.prefs },
    mode,
  };
}

function runtimeColorAliases(name: string): CatalogueAlias[] {
  const aliases = [cssVariable(`--color-${name}`)];
  const borderName = name.startsWith('border-')
    ? name.slice('border-'.length)
    : null;
  if (borderName !== null && BORDER_COLOR_ALIASES.has(borderName)) {
    aliases.push(utility(`border-color-${borderName}`));
  }
  return aliases;
}

function runtimeColorTokens(): CatalogueToken[] {
  const themes = RUNTIME_MODES.map((mode) => {
    const appearance = runtimeAppearance(mode);
    return {
      mode,
      appearance,
      values: deriveThemeMode(createNexusThemeContract(appearance), mode),
    };
  });

  return SEMANTIC_TOKEN_REGISTRY.map(({ name, category }) => {
    const property: CatalogueTokenName = `--nx-color-${name}`;
    return {
      name: property,
      family: 'color',
      group: category,
      type: 'color',
      description: RUNTIME_COLOR_DESCRIPTIONS[name] ?? null,
      aliases: runtimeColorAliases(name),
      variants: themes.map(({ mode, appearance, values }) => {
        const value = values[property];
        if (value === undefined) {
          throw new Error(`catalogue: deriveTheme emitted no ${property}`);
        }
        return {
          mode,
          preset: null,
          source: null,
          appearance,
          authoredValue: null,
          declarations: [{ property, value }],
          references: [],
        };
      }),
    };
  });
}

/**
 * Every Nexus token, identified by its `--nx-*` name: primitives, runtime
 * colours, spacing, z-index, breakpoints, and typography and shadow styles.
 * Runtime colours are computed from `DEFAULT_NEXUS_APPEARANCE` in explicit
 * light and dark modes; each variant records the appearance it used.
 */
export function createTokenCatalogue(): readonly CatalogueToken[] {
  const primitives = PRIMITIVE_FAMILIES.flatMap(primitiveLeaves);
  const lookup = primitiveLookup(primitives);
  const themeOnly = [
    ...fileLeaves('z-index', Z_INDEX_FILE, SINGLE_SOURCE),
    ...fileLeaves('breakpoint', BREAKPOINTS_FILE, SINGLE_SOURCE),
  ];
  return [
    ...authoredTokens(primitives, lookup, primitiveEntry(lookup)),
    ...runtimeColorTokens(),
    ...authoredTokens(spacingLeaves(), lookup, spacingEntry),
    ...authoredTokens(themeOnly, lookup, themeOnlyEntry),
    ...authoredTokens(
      styleLeaves('typography', TYPOGRAPHY_STYLES_FILE),
      lookup,
      typographyStyleEntry(lookup)
    ),
    ...authoredTokens(
      styleLeaves('shadow', SHADOW_STYLES_FILE),
      lookup,
      shadowStyleEntry(lookup)
    ),
  ];
}
