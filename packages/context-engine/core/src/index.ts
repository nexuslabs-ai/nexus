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
 * import { HybridExtractor, extractComponent } from '@context-engine/core/extractor';
 * import { MetaGenerator, createMetaGenerator } from '@context-engine/core/generator';
 * import { ManifestBuilder } from '@context-engine/core/manifest';
 * import { ComponentProcessor } from '@context-engine/core/processor';
 * ```
 */

// Re-export constants
export * from './constants/index.js';

// Re-export all types
export * from './types/index.js';

// Re-export all utilities
export * from './utils/index.js';

// Re-export extractor module
export * from './extractor/index.js';

// Re-export generator module
export * from './generator/index.js';

// Re-export manifest module
export * from './manifest/index.js';

// Re-export processor module
export * from './processor/index.js';
