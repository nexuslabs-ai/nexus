/**
 * Component Manifest Types
 *
 * The complete component knowledge, combining identity, extracted data,
 * and AI-generated metadata. Optimized for AI consumption.
 */

import { z } from 'zod';

import { CvaVariantSchema } from './cva-variant.js';
import {
  EmbeddingModelInfoSchema,
  EmbeddingStatusSchema,
} from './embedding.js';
import { StructuredExamplesSchema } from './examples.js';
import { HashSchema } from './extracted.js';
import { GuidanceSchema } from './guidance.js';
import {
  BaseLibrarySchema,
  FrameworkSchema,
  TierSchema,
  VersionSchema,
  VisibilitySchema,
} from './identity.js';
import { ImportStatementSchema } from './import-statement.js';
import { CategorizedPropsSchema } from './props.js';

/**
 * Current manifest schema version
 */
export const MANIFEST_SCHEMA_VERSION = '1.0';

/**
 * Dependencies schema
 */
export const DependenciesSchema = z.object({
  npm: z.record(z.string(), z.string()),
  internal: z.array(z.string()),
});

export type Dependencies = z.infer<typeof DependenciesSchema>;

/**
 * Complete component manifest schema (v1.0)
 *
 * This schema is optimized for AI consumption with:
 * - Flat structure for AI-critical fields at top level
 * - Categorized props grouped by semantic purpose
 * - Structured examples with metadata
 * - Tool calling support for reliable LLM output
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

  // === AI Quick Reference (TOP LEVEL) ===
  /** One-line description (10-500 chars) */
  description: z.string().min(10).max(500),

  /** Component tier for licensing */
  tier: TierSchema,

  /**
   * Import statement variants for AI use
   */
  importStatement: ImportStatementSchema,

  /**
   * Simplest working code example
   */
  minimalExample: z.string(),

  // === Props (Categorized) ===
  /**
   * Props categorized by semantic purpose
   * Grouped for better AI filtering
   */
  props: CategorizedPropsSchema,

  // === CVA Variants ===
  /**
   * CVA variant definitions with metadata
   * @example { variant: { values: ["primary", "secondary"], default: "primary" } }
   */
  variants: z.record(z.string(), CvaVariantSchema),

  // === Examples (Structured) ===
  /**
   * Structured code examples organized by complexity
   */
  examples: StructuredExamplesSchema,

  // === AI Guidance ===
  /**
   * Guidance for AI assistants on when/how to use
   */
  guidance: GuidanceSchema,

  // === Semantic Search ===
  /**
   * Rich description for embedding/search (50-2000 chars)
   */
  semanticDescription: z.string().min(50).max(2000),

  /**
   * Design tokens used by this component
   */
  tokens: z.array(z.string()),

  // === From Extraction ===
  /** Component files */
  files: z.array(z.string()),

  /** Dependencies */
  dependencies: DependenciesSchema,

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
  /** Component patterns from guidance */
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
