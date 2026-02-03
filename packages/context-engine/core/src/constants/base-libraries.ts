/**
 * Radix UI Constants
 *
 * Constants and utilities for detecting Radix UI primitives.
 * Designed for Radix-based design systems (shadcn/ui pattern).
 */

import { pascalCase } from '../utils/case.js';

// =============================================================================
// Radix UI Library
// =============================================================================

/**
 * Radix UI library identifier
 *
 * Used for:
 * - Detection during extraction
 * - Filtering/querying in the API
 * - Display in UI
 */
export const RADIX_LIBRARY = 'radix-ui' as const;

/**
 * Type for base library name (Radix-only)
 */
export type BaseLibraryName = typeof RADIX_LIBRARY;

/**
 * Pattern to detect Radix UI packages
 *
 * Matches: @radix-ui/react-{component}
 */
const RADIX_PATTERN = /^@radix-ui\/react-/;

/**
 * Detect if a package is a Radix UI package
 *
 * @param packageName - The npm package name to check
 * @returns 'radix-ui' if detected, null otherwise
 *
 * @example
 * ```typescript
 * detectBaseLibrary('@radix-ui/react-dialog') // 'radix-ui'
 * detectBaseLibrary('lodash')                 // null
 * ```
 */
export function detectBaseLibrary(packageName: string): BaseLibraryName | null {
  return RADIX_PATTERN.test(packageName) ? RADIX_LIBRARY : null;
}

/**
 * Check if a package is a Radix UI package
 *
 * @param packageName - The npm package name to check
 * @returns True if the package is a Radix UI package
 *
 * @example
 * ```typescript
 * isRadixPackage('@radix-ui/react-dialog') // true
 * isRadixPackage('@radix-ui/react-slot')   // true
 * isRadixPackage('lodash')                 // false
 * ```
 */
export function isRadixPackage(packageName: string): boolean {
  return RADIX_PATTERN.test(packageName);
}

/**
 * Extract component name from a Radix UI package
 *
 * @param packageName - The Radix UI package name
 * @returns The component name in PascalCase, or undefined if not a Radix package
 *
 * @example
 * ```typescript
 * extractRadixComponentName('@radix-ui/react-dialog')   // 'Dialog'
 * extractRadixComponentName('@radix-ui/react-dropdown-menu') // 'DropdownMenu'
 * extractRadixComponentName('lodash')                   // undefined
 * ```
 */
export function extractRadixComponentName(
  packageName: string
): string | undefined {
  if (!RADIX_PATTERN.test(packageName)) {
    return undefined;
  }

  const componentSegment = packageName.replace(RADIX_PATTERN, '');
  if (!componentSegment) {
    return undefined;
  }

  // Convert kebab-case to PascalCase
  return pascalCase(componentSegment);
}
