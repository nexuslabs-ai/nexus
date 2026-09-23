import {
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  type NexusAppearanceState,
} from '../lib/appearance-model';
import { deriveThemeMode } from '../lib/derive-theme';
import type { Mode } from '../lib/palette';
import { SEMANTIC_TOKEN_REGISTRY } from '../lib/token-registry';
import {
  formatTypographyDeclarations,
  resolveValue,
} from '../token-source/format';
import {
  type ExtractedToken,
  extractTokens,
  pathToCssVarPrefixed,
  tokenReferences,
} from '../token-source/tokens';

import { RUNTIME_COLOR_DESCRIPTIONS } from './descriptions';
import { TOKEN_FILES, type TokenFile } from './token-files';
import type {
  CatalogueFamily,
  CatalogueReference,
  CatalogueToken,
  CatalogueTokenName,
  CatalogueVariant,
} from './types';

const RUNTIME_MODES: readonly Mode[] = ['light', 'dark'];
const TYPOGRAPHY_STYLES_FILE: TokenFile = 'styles/typography.json';

/** A `PrimitiveLookup` that also carries each target's canonical name. */
type ReferenceLookup = ReadonlyMap<
  string,
  { cssName: string; name: CatalogueTokenName }
>;

interface PrimitiveLeaf {
  family: CatalogueFamily;
  file: TokenFile;
  mode: string | null;
  leaf: ExtractedToken;
}

function primitiveFileMode(
  file: TokenFile,
  family: CatalogueFamily
): string | null | undefined {
  if (file === `primitives/${family}.json`) return null;
  const prefix = `primitives/${family}/${family}-`;
  if (!file.startsWith(prefix)) return undefined;
  return file.slice(prefix.length, -'.json'.length);
}

function primitiveLeaves(family: CatalogueFamily): PrimitiveLeaf[] {
  return (Object.keys(TOKEN_FILES) as TokenFile[]).flatMap((file) => {
    const mode = primitiveFileMode(file, family);
    if (mode === undefined) return [];
    return extractTokens(TOKEN_FILES[file]).map((leaf) => ({
      family,
      file,
      mode,
      leaf,
    }));
  });
}

function primitiveName(
  family: CatalogueFamily,
  path: readonly string[]
): CatalogueTokenName {
  return `--nx-${pathToCssVarPrefixed(path, family)}`;
}

/** References resolve the way the generator's primitive map does: bare or family-qualified. */
function primitiveLookup(leaves: readonly PrimitiveLeaf[]): ReferenceLookup {
  const lookup = new Map<
    string,
    { cssName: string; name: CatalogueTokenName }
  >();
  for (const { family, leaf } of leaves) {
    const name = primitiveName(family, leaf.path);
    const entry = { cssName: name.slice('--'.length), name };
    const reference = leaf.path.join('.');
    lookup.set(reference, entry);
    lookup.set(`${family}.${reference}`, entry);
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

function primitiveTokens(
  leaves: readonly PrimitiveLeaf[],
  lookup: ReferenceLookup
): CatalogueToken[] {
  const tokens = new Map<
    CatalogueTokenName,
    CatalogueToken & { variants: CatalogueVariant[] }
  >();
  for (const { family, file, mode, leaf } of leaves) {
    const name = primitiveName(family, leaf.path);
    const reference = leaf.path.join('.');
    const token = tokens.get(name) ?? {
      name,
      family,
      group: leaf.path[0] ?? reference,
      type: leaf.type,
      description: leaf.description ?? null,
      aliases: [
        { kind: 'reference', name: reference },
        { kind: 'reference', name: `${family}.${reference}` },
      ],
      variants: [],
    };
    token.variants.push({
      mode,
      source: { file, path: leaf.path },
      appearance: null,
      authoredValue: leaf.value,
      declarations: [
        {
          property: name,
          value: resolveValue(leaf.value, lookup, leaf.type, leaf.path),
        },
      ],
      references: referenceTargets(leaf, lookup),
    });
    tokens.set(name, token);
  }
  return [...tokens.values()];
}

function runtimeAppearance(mode: Mode): NexusAppearanceState {
  return {
    ...DEFAULT_NEXUS_APPEARANCE,
    prefs: { ...DEFAULT_NEXUS_APPEARANCE.prefs },
    mode,
  };
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
      aliases: [{ kind: 'css-variable', name: `--color-${name}` }],
      variants: themes.map(({ mode, appearance, values }) => {
        const value = values[property];
        if (value === undefined) {
          throw new Error(`catalogue: deriveTheme emitted no ${property}`);
        }
        return {
          mode,
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

function typographyStyleTokens(lookup: ReferenceLookup): CatalogueToken[] {
  return extractTokens(TOKEN_FILES[TYPOGRAPHY_STYLES_FILE])
    .filter((leaf) => leaf.type === 'typography')
    .map((leaf) => {
      const utility = pathToCssVarPrefixed(leaf.path, 'typography');
      return {
        name: `--nx-${utility}`,
        family: 'typography',
        group: leaf.path[0] ?? utility,
        type: leaf.type,
        description: leaf.description ?? null,
        aliases: [{ kind: 'utility', name: `nx:${utility}` }],
        variants: [
          {
            mode: null,
            source: { file: TYPOGRAPHY_STYLES_FILE, path: leaf.path },
            appearance: null,
            authoredValue: leaf.value,
            declarations: formatTypographyDeclarations(
              leaf.path,
              leaf.value,
              lookup
            ),
            references: referenceTargets(leaf, lookup),
          },
        ],
      };
    });
}

/**
 * Every colour and typography token, identified by its `--nx-*` name. Derived
 * colours are computed from `DEFAULT_NEXUS_APPEARANCE` in explicit light and
 * dark modes; each variant records the appearance it used.
 */
export function createTokenCatalogue(): readonly CatalogueToken[] {
  const leaves = [
    ...primitiveLeaves('color'),
    ...primitiveLeaves('typography'),
  ];
  const lookup = primitiveLookup(leaves);
  return [
    ...primitiveTokens(leaves, lookup),
    ...runtimeColorTokens(),
    ...typographyStyleTokens(lookup),
  ];
}
