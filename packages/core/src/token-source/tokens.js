// @ts-check

/** @typedef {import('./types').TokenValue} TokenValue */

/**
 * @typedef {object} ExtractedToken
 * @property {string[]} path - Group keys from the document root to the leaf
 * @property {TokenValue} value - The authored `$value`
 * @property {string} type - The leaf's `$type`, or the nearest group's
 * @property {string | undefined} description - The authored `$description`
 */

/**
 * @typedef {object} TokenReference
 * @property {string} field - Where the reference sits inside the value; `''` for the whole value
 * @property {string} reference - The referenced path, e.g. `family.font-heading`
 */

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isGroup(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Collect every DTCG leaf (a node with `$value`) in document order. `$type`
 * inherits from the nearest enclosing group.
 *
 * @param {Record<string, unknown>} document - Parsed token JSON
 * @returns {ExtractedToken[]}
 * @throws {Error} If a leaf has no `$type` of its own or inherited
 */
export function extractTokens(document) {
  /** @type {ExtractedToken[]} */
  const result = [];

  /**
   * @param {Record<string, unknown>} group
   * @param {string[]} groupPath
   * @param {unknown} inheritedType
   */
  function visit(group, groupPath, inheritedType) {
    for (const [key, node] of Object.entries(group)) {
      if (key.startsWith('$') || !isGroup(node)) continue;

      const path = [...groupPath, key];
      const type = node.$type ?? inheritedType;
      if (!('$value' in node)) {
        visit(node, path, type);
        continue;
      }
      if (typeof type !== 'string') {
        throw new Error(`Token ${path.join('.')} has $value but no $type`);
      }
      result.push({
        path,
        value: /** @type {TokenValue} */ (node.$value),
        type,
        description:
          typeof node.$description === 'string' ? node.$description : undefined,
      });
    }
  }

  visit(document, [], document.$type);
  return result;
}

/**
 * Check if a value is a DTCG reference (e.g., "{blue.500}")
 * @param {unknown} value
 * @returns {value is string}
 */
export function isReference(value) {
  return (
    typeof value === 'string' && value.startsWith('{') && value.endsWith('}')
  );
}

/**
 * Extract reference path from DTCG reference string
 * @param {string} ref - Reference string like "{blue.500}"
 * @returns {string} Path like "blue.500"
 */
export function extractRefPath(ref) {
  return ref.slice(1, -1);
}

/**
 * List the references a value makes, including those nested in composites.
 *
 * @param {TokenValue} value
 * @returns {TokenReference[]}
 */
export function tokenReferences(value) {
  /** @type {TokenReference[]} */
  const references = [];

  /**
   * @param {TokenValue} node
   * @param {string} field
   */
  function visit(node, field) {
    if (isReference(node)) {
      references.push({ field, reference: extractRefPath(node) });
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item, index) => visit(item, `${field}[${index}]`));
      return;
    }
    if (!isGroup(node)) return;
    for (const [key, item] of Object.entries(node)) {
      visit(item, field ? `${field}.${key}` : key);
    }
  }

  visit(value, '');
  return references;
}

/**
 * Convert token path to CSS variable name with optional nx- prefix
 * @param {readonly string[]} tokenPath - Token path array
 * @param {string | null} [categoryPrefix] - Optional category prefix (e.g., 'color', 'radius')
 * @param {boolean} [useNxPrefix] - Whether to add nx- prefix
 * @returns {string} CSS variable name (without --)
 */
export function pathToCssVarPrefixed(
  tokenPath,
  categoryPrefix = null,
  useNxPrefix = false
) {
  const cssName = tokenPath.join('-');
  const base = categoryPrefix ? `${categoryPrefix}-${cssName}` : cssName;
  return useNxPrefix ? `nx-${base}` : base;
}
