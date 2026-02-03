/**
 * @context-engine/core
 *
 * Shared types, schemas, and utilities for Context Engine.
 *
 * @example
 * ```typescript
 * // Import types
 * import { AIManifest, ManifestMetadata, Framework } from '@context-engine/core';
 *
 * // Import from subpaths
 * import { AIManifestSchema, ManifestMetadataSchema } from '@context-engine/core/types';
 * import { generateComponentId, generateHash } from '@context-engine/core/utils';
 * import { HybridExtractor, extractComponent } from '@context-engine/core/extractor';
 * import { MetaGenerator, createMetaGenerator } from '@context-engine/core/generator';
 * import { ManifestBuilder } from '@context-engine/core/manifest';
 * import { ComponentProcessor, FileStateStore } from '@context-engine/core/processor';
 * ```
 */

// Re-export config
export * from './config/index.js';

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

// Re-export processor module (includes FileStateStore and state store types)
export * from './processor/index.js';
