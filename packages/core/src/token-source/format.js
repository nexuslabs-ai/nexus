// @ts-check
import {
  hexToOklchMechanical,
  hexToOklchPinned,
  isPaletteShadeKey,
} from './perceptual-grid.js';
import { extractRefPath, isReference } from './tokens.js';

/** @typedef {import('./types').TokenValue} TokenValue */

/**
 * Reference path (e.g. `blue.500` or `color.blue.500`) to the primitive's
 * CSS variable name without the leading `--`.
 * @typedef {ReadonlyMap<string, { cssName: string }>} PrimitiveLookup
 */

/**
 * @typedef {object} CssDeclaration
 * @property {string} property
 * @property {string} value
 */

/**
 * @param {unknown} value
 * @returns {value is { value: number, unit?: string }}
 */
function isDimension(value) {
  return typeof value === 'object' && value !== null && 'value' in value;
}

/**
 * Format a token value to a CSS string. For `$type: "color"` hex values,
 * routes through the OKLCH converters: palette shade tokens (path ending in a
 * shade key like `'500'`) get pinned to the perceptual L grid; everything else
 * (white/black/semantic hex literals with alpha) is converted mechanically.
 * @param {TokenValue | undefined} value - Token value
 * @param {string} type - Token type
 * @param {readonly string[]} [tokenPath] - Token path (used to route shade conversions)
 * @returns {string} Formatted CSS value
 * @throws {Error} If value is undefined
 */
export function formatTokenValue(value, type, tokenPath) {
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
 * Resolve a DTCG reference to a CSS var(), or leave it as authored
 * @param {string} reference - A reference string like "{blue.500}"
 * @param {PrimitiveLookup} primitiveMap
 * @returns {string} `var(--…)` for a known reference, otherwise the input
 */
function resolveReference(reference, primitiveMap) {
  const primitiveInfo = primitiveMap.get(extractRefPath(reference));

  if (primitiveInfo) {
    return `var(--${primitiveInfo.cssName})`;
  }

  console.warn(`⚠ Reference not found: ${reference}`);
  return reference;
}

/**
 * Resolve a value that might be a reference or a dimension object
 * @param {TokenValue} value - Token value
 * @param {PrimitiveLookup} primitiveMap
 * @param {string} [type] - Token type
 * @param {readonly string[]} [tokenPath] - Token path for color routing
 * @returns {string} Resolved CSS value
 */
export function resolveValue(value, primitiveMap, type = 'unknown', tokenPath) {
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
 * @param {TokenValue | undefined} value
 * @param {PrimitiveLookup} primitiveMap
 */
function formatShadowPropertyAsVar(value, primitiveMap) {
  if (isReference(value)) {
    return resolveValue(value, primitiveMap);
  }

  if (isDimension(value)) {
    return formatTokenValue(value, 'dimension');
  }

  return String(value);
}

/**
 * @param {Record<string, TokenValue>} layer
 * @param {PrimitiveLookup} primitiveMap
 * @param {boolean} isInset
 */
function formatShadowLayer(layer, primitiveMap, isInset) {
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
 * @param {TokenValue} value - One layer object or an array of layers
 * @param {PrimitiveLookup} primitiveMap
 * @param {boolean} [isInset]
 * @returns {string}
 */
export function formatShadowComposite(value, primitiveMap, isInset = false) {
  const layers = /** @type {Record<string, TokenValue>[]} */ (
    Array.isArray(value) ? value : [value]
  );
  return layers
    .map((layer) => formatShadowLayer(layer, primitiveMap, isInset))
    .join(', ');
}

const TYPOGRAPHY_PROPERTIES = /** @type {const} */ ([
  ['fontFamily', 'font-family'],
  ['fontSize', 'font-size'],
  ['fontWeight', 'font-weight'],
  ['lineHeight', 'line-height'],
  ['letterSpacing', 'letter-spacing'],
]);

/**
 * Declarations a typography composite emits in its `@utility`.
 * @param {readonly string[]} tokenPath - e.g. `['heading', 'large']`
 * @param {TokenValue} value - The composite `$value`
 * @param {PrimitiveLookup} primitiveMap
 * @returns {CssDeclaration[]}
 */
export function formatTypographyDeclarations(tokenPath, value, primitiveMap) {
  const fields = /** @type {Record<string, TokenValue>} */ (value);
  /** @type {CssDeclaration[]} */
  const declarations = [];

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
