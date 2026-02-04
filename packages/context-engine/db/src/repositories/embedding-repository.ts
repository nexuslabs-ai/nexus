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
import { and, eq, sql } from 'drizzle-orm';

import type { Database } from '../client.js';
import { generateChunks } from '../embeddings/chunk-generator.js';
import {
  createEmbeddingServiceFromEnv,
  type EmbeddingService,
} from '../embeddings/embedding-service.js';
import { embeddingChunks } from '../schema.js';
import type { IndexResult, SearchOptions, SearchResult } from '../types.js';

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
   * 1. Delete any existing chunks for this component
   * 2. Generate semantic chunks from the manifest
   * 3. Generate embeddings for each chunk via Voyage AI
   * 4. Store chunks with embeddings in the database
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

      // Insert chunks with embeddings using raw SQL for vector type
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = embeddings[i];

        // Use raw SQL because Drizzle doesn't support pgvector natively
        await this.db.execute(sql`
          INSERT INTO embedding_chunks (org_id, component_id, chunk_type, content, chunk_index, embedding, created_at)
          VALUES (
            ${orgId}::uuid,
            ${componentId}::uuid,
            ${chunk.type},
            ${chunk.content},
            ${chunk.index},
            ${sql.raw(`'[${embedding.join(',')}]'::vector`)},
            NOW()
          )
        `);
      }

      return {
        success: true,
        componentId,
        chunksCreated: chunks.length,
      };
    } catch (error) {
      return {
        success: false,
        componentId,
        chunksCreated: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
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
   * 2. Find similar chunks using cosine distance (<=> operator)
   * 3. Aggregate scores by component (take max score per component)
   * 4. Return components ordered by relevance
   *
   * Uses a CTE query for efficiency:
   * - ranked_chunks: Find top matching chunks by vector similarity
   * - component_scores: Aggregate to component level with max score
   * - Final join: Get component details
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
    const { limit = 10, minScore = 0.0, framework } = options;

    // Generate query embedding (query-optimized)
    const queryEmbedding = await this.embeddingService.embedQuery(query);
    const vectorLiteral = `'[${queryEmbedding.join(',')}]'::vector`;

    // Build framework filter (conditional SQL fragment)
    const frameworkFilter = framework
      ? sql`AND c.framework = ${framework}`
      : sql``;

    // Vector similarity search with CTE for aggregation
    const results = await this.db.execute(sql`
      WITH ranked_chunks AS (
        SELECT
          ec.component_id,
          1 - (ec.embedding <=> ${sql.raw(vectorLiteral)}) AS similarity
        FROM embedding_chunks ec
        WHERE ec.org_id = ${orgId}::uuid
        ORDER BY ec.embedding <=> ${sql.raw(vectorLiteral)}
        LIMIT ${limit * 3}
      ),
      component_scores AS (
        SELECT
          component_id,
          MAX(similarity) AS score
        FROM ranked_chunks
        GROUP BY component_id
        HAVING MAX(similarity) >= ${minScore}
        ORDER BY score DESC
        LIMIT ${limit}
      )
      SELECT
        c.id AS component_id,
        c.slug,
        c.name,
        c.manifest->>'description' AS description,
        cs.score
      FROM component_scores cs
      JOIN components c ON c.id = cs.component_id
      WHERE c.org_id = ${orgId}::uuid
        ${frameworkFilter}
      ORDER BY cs.score DESC
    `);

    // Map raw results to SearchResult type
    // postgres-js returns results as an array-like object, not { rows: [] }
    const rows = results as unknown as RawSearchRow[];
    return rows.map((row) => ({
      componentId: row.component_id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      score: parseFloat(String(row.score)),
    }));
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

// =============================================================================
// Internal Types
// =============================================================================

/**
 * Raw row shape from search query results
 */
interface RawSearchRow {
  component_id: string;
  slug: string;
  name: string;
  description: string | null;
  score: string | number;
}
