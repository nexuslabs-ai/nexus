/**
 * Constants Index
 *
 * Re-exports all constants from @context-engine/core
 */

// Radix UI constants and utilities
export {
  detectBaseLibrary,
  extractRadixComponentName,
  isRadixPackage,
  RADIX_LIBRARY,
} from './base-libraries.js';

// Base library types
export type { BaseLibraryName } from './base-libraries.js';

// Default LLM model constants
export { DEFAULT_ANTHROPIC_MODEL, DEFAULT_GEMINI_MODEL } from './models.js';
