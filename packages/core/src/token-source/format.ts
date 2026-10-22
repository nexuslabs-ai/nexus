import {
  hexToOklchMechanical,
  hexToOklchPinned,
  isPaletteShadeKey,
} from './perceptual-grid.ts';
import { extractRefPath, isReference } from './tokens.ts';
import type { TokenValue } from './types.ts';

/**
 * Reference path (e.g. `blue.500` or `color.blue.500`) to the primitive's
 * CSS variable name without the leading `--`.
 */
export type PrimitiveLookup = ReadonlyMap<string, { cssName: string }>;

export interface CssDeclaration {
  property: string;
  value: string;
}

function isDimension(
  value: unknown
): value is { value: number; unit?: string } {
  return typeof value === 'object' && value !== null && 'value' in value;
}

/**
 * Format a token value to a CSS string. For `$type: "color"` hex values,
 * routes through the OKLCH converters: palette shade tokens (path ending in a
 * shade key like `'500'`) get pinned to the perceptual L grid; everything else
 * (white/black/semantic hex literals with alpha) is converted mechanically.
 * `tokenPath` routes shade conversions. Throws if `value` is undefined.
 */
export function formatTokenValue(
  value: TokenValue | undefined,
  type: string,
  tokenPath?: readonly string[]
): string {
  if (value === undefined) {
    throw new Error(`formatTokenValue: value is undefined (type="${type}")`);
  }

  if (type === 'dimension' && isDimension(value)) {
    // Round to 4 decimals to strip Figma's float-32 export artifacts
    // (e.g. -0.800000011920929 → -0.8).
    const rounded = Math.round(value.value * 10000) / 10000;
    return `${rounded}${value.unit || 'px'}`;
  }

  if (type === 'color' && typeof value === 'string' && value.startsWith('#')) {
    const lastSegment = tokenPath?.[tokenPath.length - 1];
    const palette = tokenPath?.[tokenPath.length - 2];

    if (palette !== undefined && isPaletteShadeKey(lastSegment)) {
      // The segment before the shade is the palette/hue (e.g. ['blue','500']),
      // which selects the per-hue lightness curve in the grid.
      return hexToOklchPinned(value, lastSegment, palette, (message) =>
        console.warn(message)
      );
    }

    if (isPaletteShadeKey(lastSegment)) {
      console.warn(
        `formatTokenValue: shade-key color "${tokenPath?.join('.')}" lacks palette root — falling through to mechanical`
      );
    }

    return hexToOklchMechanical(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return JSON.stringify(value);
}

/**
 * Resolve a DTCG reference like `{blue.500}` to a CSS `var(--…)`, or leave it
 * as authored when the reference is unknown.
 */
function resolveReference(
  reference: string,
  primitiveMap: PrimitiveLookup
): string {
  const primitiveInfo = primitiveMap.get(extractRefPath(reference));

  if (primitiveInfo) {
    return `var(--${primitiveInfo.cssName})`;
  }

  console.warn(`⚠ Reference not found: ${reference}`);
  return reference;
}

/**
 * Resolve a value that might be a reference or a dimension object.
 * `tokenPath` routes color conversions.
 */
export function resolveValue(
  value: TokenValue,
  primitiveMap: PrimitiveLookup,
  type = 'unknown',
  tokenPath?: readonly string[]
): string {
  if (isReference(value)) {
    return resolveReference(value, primitiveMap);
  }

  if (type === 'dimension' || isDimension(value)) {
    return formatTokenValue(value, 'dimension');
  }

  return formatTokenValue(value, type, tokenPath);
}

/**
 * Format a shadow property value as a var() reference or literal.
 * References are resolved through the primitive map so the var name matches
 * the actual primitive cssName. This means shadow property references can
 * point to any primitive category, not just `--nx-shadow-*`.
 */
function formatShadowPropertyAsVar(
  value: TokenValue | undefined,
  primitiveMap: PrimitiveLookup
): string {
  if (isReference(value)) {
    return resolveValue(value, primitiveMap);
  }

  if (isDimension(value)) {
    return formatTokenValue(value, 'dimension');
  }

  return String(value);
}

function formatShadowLayer(
  layer: Record<string, TokenValue>,
  primitiveMap: PrimitiveLookup,
  isInset: boolean
): string {
  const x = formatShadowPropertyAsVar(layer.offsetX, primitiveMap);
  const y = formatShadowPropertyAsVar(layer.offsetY, primitiveMap);
  const blur = formatShadowPropertyAsVar(layer.blur, primitiveMap);
  const spread = formatShadowPropertyAsVar(layer.spread, primitiveMap);
  const color = formatShadowPropertyAsVar(layer.color, primitiveMap);
  const inset = isInset || layer.inset ? 'inset ' : '';

  return `${inset}${x} ${y} ${blur} ${spread} ${color}`;
}

/**
 * Format a complete shadow composite (single or multi-layer) to CSS value.
 * `value` is one layer object or an array of layers.
 */
export function formatShadowComposite(
  value: TokenValue,
  primitiveMap: PrimitiveLookup,
  isInset = false
): string {
  const layers = (Array.isArray(value) ? value : [value]) as Record<
    string,
    TokenValue
  >[];
  return layers
    .map((layer) => formatShadowLayer(layer, primitiveMap, isInset))
    .join(', ');
}

/**
 * Format a shadow style from `styles/shadows.json`, where `tokenPath` is e.g.
 * `['inner']` or `['focus', 'error']`. The top-level `inner` style is inset.
 */
export function formatShadowStyle(
  tokenPath: readonly string[],
  value: TokenValue,
  primitiveMap: PrimitiveLookup
): string {
  const isInset = tokenPath.length === 1 && tokenPath[0] === 'inner';
  return formatShadowComposite(value, primitiveMap, isInset);
}

const TYPOGRAPHY_PROPERTIES = [
  ['fontFamily', 'font-family'],
  ['fontSize', 'font-size'],
  ['fontWeight', 'font-weight'],
  ['lineHeight', 'line-height'],
  ['letterSpacing', 'letter-spacing'],
] as const;

/**
 * Declarations a typography composite emits in its `@utility`. `tokenPath` is
 * e.g. `['heading', 'large']` and `value` is the composite `$value`.
 */
export function formatTypographyDeclarations(
  tokenPath: readonly string[],
  value: TokenValue,
  primitiveMap: PrimitiveLookup
): CssDeclaration[] {
  const fields = value as Record<string, TokenValue>;
  const declarations: CssDeclaration[] = [];

  for (const [field, property] of TYPOGRAPHY_PROPERTIES) {
    const fieldValue = fields[field];
    if (!fieldValue) continue;
    // Figma exports `lineHeight: "auto"` for the code-inline typography token,
    // but `line-height: auto` is invalid CSS — browsers ignore it. Map to
    // `normal` (CSS spec default, ~1.2) so the emitted utility is well-formed.
    const css =
      fieldValue === 'auto' ? 'normal' : resolveValue(fieldValue, primitiveMap);
    declarations.push({ property, value: css });
  }

  if (tokenPath[0] === 'heading') {
    declarations.push({ property: 'text-wrap', value: 'balance' });
  }

  if (tokenPath[0] === 'body') {
    // orphan/widow protection for multi-line copy
    declarations.push({ property: 'text-wrap', value: 'pretty' });
  }

  return declarations;
}
