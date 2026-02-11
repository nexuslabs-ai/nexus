/**
 * Embedding Repository
 *
 * Handles embedding operations for semantic search:
 * - Index: Generate chunks and embeddings for a component
 * - Remove: Delete embeddings for a component
 * - Search: Semantic search using vector similarity
 *
 * All operations are scoped to an organization for multi-tenancy.
 */

import type { AIManifest } from '@context-engine/core';
import { and, cosineDistance, count, eq, inArray, sql } from 'drizzle-orm';

import type { Database } from '../client.js';
import { generateChunks } from '../embeddings/chunk-generator.js';
import {
  createEmbeddingServiceFromEnv,
  type EmbeddingService,
} from '../embeddings/embedding-service.js';
import { components, embeddingChunks } from '../schema.js';
import type {
  ChunkType,
  IndexResult,
  SearchOptions,
  SearchResult,
} from '../types.js';

// =============================================================================
// Repository
// =============================================================================

/**
 * Repository for embedding operations (indexing and search).
 *
 * Handles:
 * - Generating semantic chunks from component manifests
 * - Creating embeddings via Voyage AI
 * - Storing chunks with embeddings in PostgreSQL (pgvector)
 * - Semantic search using cosine similarity
 *
 * All operations are scoped to an organization for multi-tenant isolation.
 */
export class EmbeddingRepository {
  private embeddingService: EmbeddingService;

  constructor(
    private db: Database,
    embeddingService?: EmbeddingService
  ) {
    this.embeddingService = embeddingService ?? createEmbeddingServiceFromEnv();
  }

  // ===========================================================================
  // Indexing
  // ===========================================================================

  /**
   * Index a component (generate chunks and embeddings).
   *
   * Process:
   * 1. Set embedding status to 'processing'
   * 2. Delete any existing chunks for this component
   * 3. Generate semantic chunks from the manifest
   * 4. Generate embeddings for each chunk via Voyage AI
   * 5. Store chunks with embeddings in the database
   * 6. Update embedding status to 'indexed' on success or 'failed' on error
   *
   * @param orgId - Organization ID (for multi-tenant isolation)
   * @param componentId - Component to index
   * @param manifest - AI manifest containing component metadata
   * @returns Result with success status and chunk count
   */
  async index(
    orgId: string,
    componentId: string,
    manifest: AIManifest
  ): Promise<IndexResult> {
    try {
      // Set status to processing
      await this.db
        .update(components)
        .set({
          embeddingStatus: 'processing',
          embeddingError: null,
        })
        .where(
          and(eq(components.id, componentId), eq(components.orgId, orgId))
        );

      // Delete existing chunks for this component
      await this.db
        .delete(embeddingChunks)
        .where(
          and(
            eq(embeddingChunks.orgId, orgId),
            eq(embeddingChunks.componentId, componentId)
          )
        );

      // Generate semantic chunks from manifest
      const chunks = generateChunks(manifest);

      if (chunks.length === 0) {
        // Update status to indexed even with no chunks
        await this.db
          .update(components)
          .set({
            embeddingStatus: 'indexed',
            embeddingModel: this.embeddingService.modelInfo,
            embeddingError: null,
          })
          .where(
            and(eq(components.id, componentId), eq(components.orgId, orgId))
          );

        return {
          success: true,
          componentId,
          chunksCreated: 0,
        };
      }

      // Generate embeddings for all chunks in batch
      const embeddings = await this.embeddingService.embedBatch(
        chunks.map((c) => c.content)
      );

      // Verify we got the expected number of embeddings
      if (embeddings.length !== chunks.length) {
        throw new Error(
          `Embedding count mismatch: expected ${chunks.length}, got ${embeddings.length}`
        );
      }

      // Prepare chunk records with embeddings
      const chunkRecords = chunks.map((chunk, i) => ({
        orgId,
        componentId,
        chunkType: chunk.type,
        content: chunk.content,
        chunkIndex: chunk.index,
        embedding: embeddings[i],
      }));

      // Batch insert chunks with embeddings using native Drizzle pgvector support
      await this.db.insert(embeddingChunks).values(chunkRecords);

      // Update status to indexed on success
      await this.db
        .update(components)
        .set({
          embeddingStatus: 'indexed',
          embeddingModel: this.embeddingService.modelInfo,
          embeddingError: null,
        })
        .where(
          and(eq(components.id, componentId), eq(components.orgId, orgId))
        );

      return {
        success: true,
        componentId,
        chunksCreated: chunks.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Log error for observability
      console.error(
        `[EmbeddingRepository] Failed to index component ${componentId}:`,
        errorMessage
      );

      // Update status to failed on error
      await this.db
        .update(components)
        .set({
          embeddingStatus: 'failed',
          embeddingError: errorMessage,
        })
        .where(
          and(eq(components.id, componentId), eq(components.orgId, orgId))
        );

      return {
        success: false,
        componentId,
        chunksCreated: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Remove embeddings for a component.
   *
   * Deletes all chunks associated with the component.
   * Called when a component is deleted or needs re-indexing.
   *
   * @param orgId - Organization ID (for multi-tenant isolation)
   * @param componentId - Component to remove embeddings for
   */
  async remove(orgId: string, componentId: string): Promise<void> {
    await this.db
      .delete(embeddingChunks)
      .where(
        and(
          eq(embeddingChunks.orgId, orgId),
          eq(embeddingChunks.componentId, componentId)
        )
      );
  }

  // ===========================================================================
  // Search
  // ===========================================================================

  /**
   * Semantic search using vector similarity.
   *
   * Process:
   * 1. Generate query embedding (optimized for search queries)
   * 2. Find similar chunks using cosine distance
   * 3. Aggregate scores by component (take max score per component)
   * 4. Return components ordered by relevance
   *
   * Uses Drizzle's native cosineDistance function for type-safe queries.
   * Orders by cosineDistance directly to ensure HNSW index usage.
   *
   * @param orgId - Organization ID (for multi-tenant isolation)
   * @param query - Natural language search query
   * @param options - Search options (limit, minScore, framework filter)
   * @returns Array of matching components with scores
   */
  async search(
    orgId: string,
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const { limit = 10, minScore = 0.5, framework } = options;

    // Generate query embedding (query-optimized)
    const queryEmbedding = await this.embeddingService.embedQuery(query);

    // Build framework filter conditions
    const frameworkCondition = framework
      ? eq(components.framework, framework)
      : undefined;

    // Use cosineDistance directly in select and orderBy (ensures HNSW index usage)
    // Similarity is computed in JS as 1 - distance to avoid SQL type mismatch
    const distance = cosineDistance(
      embeddingChunks.embedding,
      queryEmbedding
    ).mapWith(Number);

    const rankedChunks = await this.db
      .select({
        componentId: embeddingChunks.componentId,
        distance,
      })
      .from(embeddingChunks)
      .where(eq(embeddingChunks.orgId, orgId))
      .orderBy(distance)
      .limit(limit * 3);

    // Aggregate: take max similarity (1 - distance) per component
    const componentScores = new Map<string, number>();
    for (const chunk of rankedChunks) {
      const similarity = 1 - (chunk.distance ?? 1);
      const current = componentScores.get(chunk.componentId) ?? 0;
      if (similarity > current) {
        componentScores.set(chunk.componentId, similarity);
      }
    }

    // Filter by minScore and get top components
    const topComponentIds = Array.from(componentScores.entries())
      .filter(([, score]) => score >= minScore)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topComponentIds.length === 0) {
      return [];
    }

    // Fetch component details for top results (including framework)
    const componentDetails = await this.db
      .select({
        id: components.id,
        slug: components.slug,
        name: components.name,
        description: sql<string | null>`${components.manifest}->>'description'`,
        framework: components.framework,
      })
      .from(components)
      .where(
        and(
          eq(components.orgId, orgId),
          inArray(components.id, topComponentIds),
          frameworkCondition
        )
      );

    // Build result with scores, maintaining score order
    const componentMap = new Map(componentDetails.map((c) => [c.id, c]));
    return topComponentIds
      .map((id) => {
        const component = componentMap.get(id);
        if (!component) return null;
        return {
          componentId: component.id,
          slug: component.slug,
          name: component.name,
          description: component.description,
          framework: component.framework,
          score: componentScores.get(id) ?? 0,
        };
      })
      .filter((r): r is SearchResult => r !== null);
  }

  // ===========================================================================
  // Analytics
  // ===========================================================================

  /**
   * Count total embedding chunks for an organization.
   *
   * @param orgId - Organization ID for multi-tenant isolation
   * @returns Total number of chunks
   */
  async countChunks(orgId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(embeddingChunks)
      .where(eq(embeddingChunks.orgId, orgId));

    return Number(result.count);
  }

  /**
   * Count embedding chunks grouped by chunk type.
   *
   * Returns a record with counts for each chunk type.
   * Missing types default to 0.
   *
   * @param orgId - Organization ID for multi-tenant isolation
   * @returns Record mapping chunk types to counts
   */
  async countChunksByType(orgId: string): Promise<Record<ChunkType, number>> {
    const results = await this.db
      .select({
        chunkType: embeddingChunks.chunkType,
        count: count(),
      })
      .from(embeddingChunks)
      .where(eq(embeddingChunks.orgId, orgId))
      .groupBy(embeddingChunks.chunkType);

    // Initialize all chunk types to 0
    const counts: Record<ChunkType, number> = {
      description: 0,
      import: 0,
      props: 0,
      composition: 0,
      examples: 0,
      patterns: 0,
      guidance: 0,
    };

    for (const row of results) {
      counts[row.chunkType] = Number(row.count);
    }

    return counts;
  }

  // ===========================================================================
  // Model Info
  // ===========================================================================

  /**
   * Get embedding model info.
   *
   * Returns metadata about the embedding model for tracking which model
   * was used to generate embeddings.
   */
  get modelInfo() {
    return this.embeddingService.modelInfo;
  }
}
