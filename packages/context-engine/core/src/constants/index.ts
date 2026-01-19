/**
 * Constants Index
 *
 * Re-exports all constants from @context-engine/core
 */

// Base library constants and utilities
export {
  BASE_LIBRARIES,
  BASE_LIBRARY_PATTERNS,
  detectBaseLibrary,
  isBaseLibraryPackage,
} from './base-libraries.js';

// Base library types
export type { BaseLibraryName, BaseLibraryPattern } from './base-libraries.js';
