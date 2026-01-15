/**
 * Component Manifest Types
 *
 * The complete component knowledge, combining identity, extracted data,
 * and AI-generated metadata.
 *
 * IMPORTANT: This schema is versioned. Changes should bump MANIFEST_SCHEMA_VERSION.
 */

import { z } from 'zod';

import {
  EmbeddingModelInfoSchema,
  EmbeddingStatusSchema,
} from './embedding.js';
import { ExtractedPropSchema, HashSchema } from './extracted.js';
import {
  BaseLibrarySchema,
  FrameworkSchema,
  TierSchema,
  VersionSchema,
  VisibilitySchema,
} from './identity.js';
import { AIContextSchema } from './meta.js';

/**
 * Current manifest schema version
 * Bump this when making breaking changes to ComponentManifestSchema
 *
 * @stable This enables schema migrations without data loss.
 */
export const MANIFEST_SCHEMA_VERSION = '1.0';

/**
 * Complete component manifest schema
 */
export const ComponentManifestSchema = z.object({
  // === Schema Version ===
  /** Manifest schema version for migrations */
  schemaVersion: z.string().default(MANIFEST_SCHEMA_VERSION),

  // === Identity ===
  /** Primary identifier (UUID v4) */
  id: z.uuid(),

  /** Derived slug for URLs */
  slug: z.string(),

  /** Human-readable display name */
  name: z.string(),

  /** Semantic version */
  version: VersionSchema,

  /** Target framework */
  framework: FrameworkSchema,

  // === Visibility ===
  /** Component visibility for sharing */
  visibility: VisibilitySchema.default('private'),

  // === From Meta (GENERATED) ===
  /** One-line description */
  description: z.string(),

  /** Component tier */
  tier: TierSchema,

  /** AI-generated context */
  ai: AIContextSchema,

  // === From Extraction (EXTRACTED) ===
  /** Component props */
  props: z.array(ExtractedPropSchema),

  /** Design variants from cva() */
  variants: z.record(z.string(), z.array(z.string())),

  /** Default variants */
  defaultVariants: z.record(z.string(), z.string()),

  /** Component files */
  files: z.array(z.string()),

  /** Dependencies */
  dependencies: z.object({
    npm: z.record(z.string(), z.string()),
    internal: z.array(z.string()),
  }),

  /** Base UI library (if any) */
  baseLibrary: BaseLibrarySchema.optional(),

  // === Embedding Status ===
  /** Current embedding status */
  embeddingStatus: EmbeddingStatusSchema,

  /** Error message if embedding failed */
  embeddingError: z.string().optional(),

  /** Embedding model used (for future migrations) */
  embeddingModel: EmbeddingModelInfoSchema.optional(),

  // === Metadata ===
  /** When manifest was generated */
  generatedAt: z.iso.datetime(),

  /** When manifest was last updated */
  updatedAt: z.iso.datetime(),

  /** Hash of source code (for change detection) */
  sourceHash: HashSchema,

  /** Hash of meta content (for change detection) */
  metaHash: HashSchema,
});

export type ComponentManifest = z.infer<typeof ComponentManifestSchema>;

/**
 * Manifest summary (for list views)
 */
export const ManifestSummarySchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  version: VersionSchema,
  framework: FrameworkSchema,
  description: z.string(),
  tier: TierSchema,
  visibility: VisibilitySchema,
  patterns: z.array(z.string()),
  embeddingStatus: EmbeddingStatusSchema,
  updatedAt: z.iso.datetime(),
});

export type ManifestSummary = z.infer<typeof ManifestSummarySchema>;

/**
 * Version history entry
 */
export const VersionHistoryEntrySchema = z.object({
  version: VersionSchema,
  generatedAt: z.iso.datetime(),
  sourceHash: HashSchema,
  metaHash: HashSchema,
});

export type VersionHistoryEntry = z.infer<typeof VersionHistoryEntrySchema>;

/**
 * Component with version history
 */
export const ComponentWithHistorySchema = ComponentManifestSchema.extend({
  versionHistory: z.array(VersionHistoryEntrySchema),
});

export type ComponentWithHistory = z.infer<typeof ComponentWithHistorySchema>;

/**
 * Manifest creation input (what the API receives)
 */
export const CreateManifestInputSchema = z.object({
  name: z.string(),
  version: VersionSchema,
  framework: FrameworkSchema,
  sourceCode: z.string(),
  files: z.array(z.string()),
  visibility: VisibilitySchema.optional(),
});

export type CreateManifestInput = z.infer<typeof CreateManifestInputSchema>;

/**
 * Manifest update input
 */
export const UpdateManifestInputSchema = z.object({
  version: VersionSchema.optional(),
  sourceCode: z.string().optional(),
  visibility: VisibilitySchema.optional(),
  tier: TierSchema.optional(),
});

export type UpdateManifestInput = z.infer<typeof UpdateManifestInputSchema>;
