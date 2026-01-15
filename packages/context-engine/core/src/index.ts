/**
 * @context-engine/core
 *
 * Shared types, schemas, and utilities for Context Engine.
 *
 * @example
 * ```typescript
 * // Import types
 * import { ComponentManifest, Framework } from '@context-engine/core';
 *
 * // Import from subpaths
 * import { ComponentManifestSchema } from '@context-engine/core/types';
 * import { generateComponentId, generateHash } from '@context-engine/core/utils';
 * ```
 */

// Re-export all types
export * from './types/index.js';

// Re-export all utilities
export * from './utils/index.js';
