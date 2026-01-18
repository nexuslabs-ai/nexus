/**
 * Manifest Builder
 *
 * Combines extracted data from HybridExtractor and generated metadata
 * from MetaGenerator into a complete ComponentManifest.
 *
 * This is the final step in the extraction-generation pipeline that
 * produces the complete component knowledge ready for storage.
 */

import type { ComponentManifest, EmbeddingStatus } from '../types/index.js';
import {
  DEFAULT_EMBEDDING_MODEL,
  MANIFEST_SCHEMA_VERSION,
} from '../types/index.js';
import { generateObjectHash } from '../utils/hash.js';

import {
  type ManifestBuilderInput,
  type ManifestBuilderOutput,
  ManifestBuildOutputType,
  type ManifestUpdateInput,
} from './types.js';

/**
 * ManifestBuilder combines extracted data and generated metadata
 * into a complete ComponentManifest.
 *
 * @example
 * ```typescript
 * const builder = new ManifestBuilder();
 *
 * const result = builder.build({
 *   orgId: 'org-uuid',
 *   identity: { id: 'comp-uuid', slug: 'button-react-abc123', name: 'Button', framework: 'react' },
 *   extracted: extractionResult.data,
 *   meta: generationResult.meta,
 *   sourceHash: extractionResult.sourceHash,
 *   version: '1.0.0'
 * });
 *
 * if (result.type === 'success') {
 *   console.log(result.manifest);
 * }
 * ```
 */
export class ManifestBuilder {
  /**
   * Build a complete ComponentManifest from extracted data and generated metadata
   *
   * @param input - Builder input containing identity, extracted data, and meta
   * @returns ManifestBuilderOutput with success or failure result
   */
  build(input: ManifestBuilderInput): ManifestBuilderOutput {
    const { identity, extracted, meta, sourceHash, version = '0.0.1' } = input;

    // TypeScript types enforce required fields - no runtime validation needed
    const now = new Date().toISOString();
    const metaHash = generateObjectHash(meta);

    const manifest: ComponentManifest = {
      // Schema version for migrations
      schemaVersion: MANIFEST_SCHEMA_VERSION,

      // Identity
      id: identity.id,
      slug: identity.slug,
      name: identity.name,
      version,
      framework: identity.framework,

      // Visibility (default to private)
      visibility: 'private',

      // From meta (generated)
      description: meta.description,
      tier: meta.tier,
      ai: meta.ai,

      // From extraction
      props: extracted.props,
      variants: extracted.variants,
      defaultVariants: extracted.defaultVariants,
      files: extracted.files,
      dependencies: {
        npm: extracted.npmDependencies,
        internal: extracted.internalDependencies,
      },

      // Base library if detected
      baseLibrary: extracted.baseLibrary,

      // Embedding status (pending until processed)
      embeddingStatus: 'pending' as EmbeddingStatus,
      embeddingError: undefined,
      embeddingModel: DEFAULT_EMBEDDING_MODEL,

      // Timestamps and hashes
      generatedAt: now,
      updatedAt: now,
      sourceHash,
      metaHash,
    };

    return {
      type: ManifestBuildOutputType.Success,
      manifest,
      builtAt: now,
    };
  }

  /**
   * Update an existing manifest with new extraction or generation data
   *
   * Preserves unchanged fields and updates timestamps appropriately.
   * When source code changes, marks embedding status as pending.
   *
   * @param existing - The existing manifest to update
   * @param updates - Partial updates to apply
   * @returns Updated manifest
   */
  update(
    existing: ComponentManifest,
    updates: ManifestUpdateInput
  ): ComponentManifest {
    const now = new Date().toISOString();

    return {
      ...existing,
      updatedAt: now,

      // Extraction updates
      ...(updates.extracted && {
        props: updates.extracted.props,
        variants: updates.extracted.variants,
        defaultVariants: updates.extracted.defaultVariants,
        files: updates.extracted.files,
        dependencies: {
          npm: updates.extracted.npmDependencies,
          internal: updates.extracted.internalDependencies,
        },
        baseLibrary: updates.extracted.baseLibrary,
      }),

      // Meta updates
      ...(updates.meta && {
        description: updates.meta.description,
        tier: updates.meta.tier,
        ai: updates.meta.ai,
        metaHash: generateObjectHash(updates.meta),
      }),

      // Source hash update (triggers re-embedding)
      ...(updates.sourceHash && {
        sourceHash: updates.sourceHash,
        embeddingStatus: 'pending' as const,
        embeddingError: undefined,
      }),

      // Version update
      ...(updates.version && { version: updates.version }),
    };
  }

  /**
   * Create a minimal manifest for cases where generation fails
   *
   * Uses extracted data with placeholder meta values.
   * Useful for fallback scenarios where we want to store extraction
   * results even if LLM generation fails.
   *
   * @param input - Partial input with extraction data
   * @returns Minimal manifest or failure
   */
  buildMinimal(
    input: Omit<ManifestBuilderInput, 'meta'> & { name: string }
  ): ManifestBuilderOutput {
    const {
      orgId,
      identity,
      extracted,
      sourceHash,
      version = '0.0.1',
      name,
    } = input;

    // Create placeholder meta from extracted data
    const placeholderMeta = {
      name,
      description: extracted.sourceDescription || `${name} component`,
      tier: 'free' as const,
      ai: {
        semanticDescription:
          extracted.sourceDescription ||
          `A ${name} component for the design system.`,
        patterns: [] as string[],
        tokens: [] as string[],
        examples: [] as string[],
        relatedComponents: extracted.internalDependencies,
      },
      variants: extracted.variants,
      defaults: extracted.defaultVariants,
    };

    return this.build({
      orgId,
      identity,
      extracted,
      meta: placeholderMeta,
      sourceHash,
      version,
    });
  }
}
