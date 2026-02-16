/**
 * Type Utilities
 *
 * Shared utilities for TypeScript type string manipulation.
 * Used by extractors to simplify types and extract enum values.
 */

/**
 * Simplify a TypeScript type string for AI consumption
 *
 * Converts complex type unions to simple type names where appropriate,
 * making the output more consumable for AI assistants.
 *
 * @param typeString - Raw TypeScript type string
 * @returns Simplified type string
 *
 * @example
 * // String literal unions become 'string'
 * simplifyType('"default" | "destructive" | "outline"') // => 'string'
 *
 * @example
 * // Boolean literal unions become 'boolean'
 * simplifyType('true | false') // => 'boolean'
 *
 * @example
 * // Mixed unions are preserved
 * simplifyType('string | number') // => 'string | number'
 */
export function simplifyType(typeString: string): string {
  // String literal unions -> 'string'
  if (typeString.includes('|') && typeString.includes('"')) {
    // Remove null/undefined and check if remaining is all string literals
    const withoutNullish = typeString
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s !== 'null' && s !== 'undefined')
      .join(' | ');

    if (/^["'][^"']+["'](\s*\|\s*["'][^"']+["'])*$/.test(withoutNullish)) {
      return 'string';
    }
  }

  // Boolean literals -> 'boolean'
  const normalized = typeString.replace(/\s/g, '');
  if (normalized === 'true|false' || normalized === 'false|true') {
    return 'boolean';
  }

  return typeString;
}

/**
 * Extract enum/union values from a TypeScript type string
 *
 * Parses string literal union types and extracts the individual values.
 * Handles both double-quoted and single-quoted string literals.
 *
 * @param typeString - TypeScript type string to parse
 * @returns Array of enum values, or undefined if not a string literal union
 *
 * @example
 * // Double-quoted literals
 * extractEnumValues('"default" | "destructive" | "outline"')
 * // => ['default', 'destructive', 'outline']
 *
 * @example
 * // Single-quoted literals
 * extractEnumValues("'sm' | 'md' | 'lg'")
 * // => ['sm', 'md', 'lg']
 *
 * @example
 * // Filters out null/undefined
 * extractEnumValues('"sm" | "md" | "lg" | null')
 * // => ['sm', 'md', 'lg']
 *
 * @example
 * // Returns undefined for non-union types
 * extractEnumValues('string')
 * // => undefined
 */
export function extractEnumValues(typeString: string): string[] | undefined {
  // Must be a union type with either double or single quoted strings
  if (!typeString.includes('|')) {
    return undefined;
  }

  // Check for presence of string literals (double or single quotes)
  if (!typeString.includes('"') && !typeString.includes("'")) {
    return undefined;
  }

  const matches = typeString.match(/["']([^"']+)["']/g);
  if (!matches || matches.length === 0) {
    return undefined;
  }

  return matches.map((m) => m.replace(/["']/g, ''));
}
