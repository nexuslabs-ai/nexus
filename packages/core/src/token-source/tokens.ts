import type { TokenValue } from './types.ts';

export interface ExtractedToken {
  /** Group keys from the document root to the leaf. */
  path: string[];
  /** The authored `$value`. */
  value: TokenValue;
  /** The leaf's `$type`, or the nearest group's. */
  type: string;
  /** The authored `$description`. */
  description: string | undefined;
}

export interface TokenReference {
  /** Where the reference sits inside the value; `''` for the whole value. */
  field: string;
  /** The referenced path, e.g. `family.font-heading`. */
  reference: string;
}

function isGroup(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Collect every DTCG leaf (a node with `$value`) in document order. `$type`
 * inherits from the nearest enclosing group. Throws if a leaf has no `$type`
 * of its own or inherited.
 */
export function extractTokens(
  document: Record<string, unknown>
): ExtractedToken[] {
  const result: ExtractedToken[] = [];

  function visit(
    group: Record<string, unknown>,
    groupPath: string[],
    inheritedType: unknown
  ) {
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
        value: node.$value as TokenValue,
        type,
        description:
          typeof node.$description === 'string' ? node.$description : undefined,
      });
    }
  }

  visit(document, [], document.$type);
  return result;
}

/** Check if a value is a DTCG reference (e.g., "{blue.500}") */
export function isReference(value: unknown): value is string {
  return (
    typeof value === 'string' && value.startsWith('{') && value.endsWith('}')
  );
}

/** Extract the path (`blue.500`) from a DTCG reference string (`{blue.500}`) */
export function extractRefPath(ref: string): string {
  return ref.slice(1, -1);
}

/** List the references a value makes, including those nested in composites. */
export function tokenReferences(value: TokenValue): TokenReference[] {
  const references: TokenReference[] = [];

  function visit(node: TokenValue, field: string) {
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
 * Convert a token path to a CSS variable name (without `--`), optionally
 * prefixed with a category (e.g. `color`, `radius`) and `nx-`.
 */
export function pathToCssVarPrefixed(
  tokenPath: readonly string[],
  categoryPrefix: string | null = null,
  useNxPrefix = false
): string {
  const cssName = tokenPath.join('-');
  const base = categoryPrefix ? `${categoryPrefix}-${cssName}` : cssName;
  return useNxPrefix ? `nx-${base}` : base;
}
