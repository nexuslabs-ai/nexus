/**
 * Base Libraries Constants
 *
 * Constants and utilities for detecting and working with base UI libraries
 * (headless UI primitive libraries that components may be built upon).
 */

// =============================================================================
// Base UI Libraries
// =============================================================================

/**
 * Known base UI library identifiers
 *
 * These are the headless UI primitive libraries that components may be built upon.
 * The values are used for:
 * - Detection during extraction
 * - Filtering/querying in the API
 * - Display in UI
 */
export const BASE_LIBRARIES = {
  RadixUI: 'radix-ui',
  ArkUI: 'ark-ui',
  BaseUI: 'base-ui',
  HeadlessUI: 'headless-ui',
  ReactAria: 'react-aria',
} as const;

/**
 * Union type of all base library names
 */
export type BaseLibraryName =
  (typeof BASE_LIBRARIES)[keyof typeof BASE_LIBRARIES];

/**
 * Pattern configuration for detecting base UI libraries from package names
 */
export interface BaseLibraryPattern {
  /** Regex pattern to match against package name */
  pattern: RegExp;
  /** Normalized library name to use when matched */
  name: BaseLibraryName;
}

/**
 * Mapping of package name patterns to base library names
 *
 * Order matters: first match wins. More specific patterns should come first.
 */
export const BASE_LIBRARY_PATTERNS: ReadonlyArray<BaseLibraryPattern> = [
  { pattern: /^@radix-ui\/react-/, name: BASE_LIBRARIES.RadixUI },
  { pattern: /^@ark-ui\/react/, name: BASE_LIBRARIES.ArkUI },
  { pattern: /^@base-ui-components\/react/, name: BASE_LIBRARIES.BaseUI },
  { pattern: /^@headlessui\/react/, name: BASE_LIBRARIES.HeadlessUI },
  { pattern: /^@react-aria\//, name: BASE_LIBRARIES.ReactAria },
  { pattern: /^react-aria-components/, name: BASE_LIBRARIES.ReactAria },
];

/**
 * Detect if a package is a known base UI library
 *
 * @param packageName - The npm package name to check
 * @returns The base library name if detected, null otherwise
 *
 * @example
 * ```typescript
 * detectBaseLibrary('@radix-ui/react-dialog') // 'radix-ui'
 * detectBaseLibrary('@ark-ui/react')          // 'ark-ui'
 * detectBaseLibrary('lodash')                 // null
 * ```
 */
export function detectBaseLibrary(packageName: string): BaseLibraryName | null {
  for (const { pattern, name } of BASE_LIBRARY_PATTERNS) {
    if (pattern.test(packageName)) {
      return name;
    }
  }
  return null;
}

/**
 * Check if a package belongs to a specific base library
 *
 * @param library - The base library to check against
 * @param packageName - The npm package name to check
 * @returns True if the package belongs to the specified library
 *
 * @example
 * ```typescript
 * isBaseLibraryPackage('radix-ui', '@radix-ui/react-dialog') // true
 * isBaseLibraryPackage('radix-ui', '@ark-ui/react')          // false
 * isBaseLibraryPackage('ark-ui', '@ark-ui/react')            // true
 * ```
 */
export function isBaseLibraryPackage(
  library: BaseLibraryName,
  packageName: string
): boolean {
  const libraryPatterns = BASE_LIBRARY_PATTERNS.filter(
    (p) => p.name === library
  );
  return libraryPatterns.some(({ pattern }) => pattern.test(packageName));
}
