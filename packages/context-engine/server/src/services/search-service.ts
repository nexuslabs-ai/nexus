/**
 * Search Service
 *
 * Transport-agnostic hybrid search combining semantic (vector) and keyword
 * (full-text) search with Reciprocal Rank Fusion (RRF) for score merging.
 *
 * Designed to be consumed by both HTTP routes and MCP tools without
 * coupling to any specific transport layer.
 *
 * Search modes:
 * - **hybrid** — Runs semantic + keyword in parallel, fuses with RRF (default)
 * - **semantic** — Vector similarity only
 * - **keyword** — PostgreSQL full-text search only
 */

import type {
  ComponentRepository,
  EmbeddingRepository,
  KeywordSearchResult,
  SearchResult,
} from '@context-engine/db';

import { fuseWithRRF, type RrfFusedResult } from '../utils/rrf.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Options for search queries.
 */
export interface SearchOptions {
  /** Maximum results to return (default: 10) */
  limit?: number;

  /** Minimum relevance score threshold (default: 0) */
  minScore?: number;

  /** Filter results by framework (e.g., 'react', 'vue') */
  framework?: string;
}

/**
 * A single result from hybrid search with an RRF-fused score.
 *
 * Re-exported from utils/rrf for backward compatibility.
 * The rrfScore combines rankings from both semantic and keyword search,
 * where higher values indicate the component appeared highly ranked
 * in one or both retrieval methods.
 */
export type FusedSearchResult = RrfFusedResult;

/**
 * Result of a hybrid search including metadata about the search execution.
 *
 * The meta field helps consumers understand which search paths contributed
 * to the results (useful for debugging relevance).
 */
export interface HybridSearchResult {
  /** Fused search results ordered by RRF score descending */
  results: FusedSearchResult[];

  /** Metadata about the search execution */
  meta: {
    /** Which search mode was actually used */
    searchMode: 'hybrid' | 'semantic' | 'keyword';

    /** Number of results from semantic search (0 if not used) */
    semanticCount: number;

    /** Number of results from keyword search */
    keywordCount: number;
  };
}

// =============================================================================
// Service
// =============================================================================

/**
 * Transport-agnostic search service combining semantic and keyword search.
 *
 * Provides three search modes:
 * - `searchHybrid` — Best results via RRF fusion of both methods
 * - `searchSemantic` — Vector similarity only
 * - `searchKeyword` — PostgreSQL full-text search only
 *
 * @example
 * ```typescript
 * const searchService = new SearchService(componentRepo, embeddingRepo);
 *
 * // Hybrid search (recommended for best results)
 * const { results, meta } = await searchService.searchHybrid(
 *   orgId, 'button with loading state', { limit: 5 }
 * );
 *
 * // Keyword-only
 * const keywords = await searchService.searchKeyword(
 *   orgId, 'dialog modal', { framework: 'react' }
 * );
 * ```
 */
export class SearchService {
  constructor(
    private componentRepo: ComponentRepository,
    private embeddingRepo: EmbeddingRepository
  ) {}

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Hybrid search combining semantic and keyword results via RRF fusion.
   *
   * Runs both search methods in parallel for performance, then merges
   * results using Reciprocal Rank Fusion.
   *
   * @param orgId - Organization ID for multi-tenant isolation
   * @param query - Natural language search query
   * @param options - Search options (limit, minScore, framework)
   * @returns Fused results with metadata about the search execution
   */
  async searchHybrid(
    orgId: string,
    query: string,
    options: SearchOptions = {}
  ): Promise<HybridSearchResult> {
    // minScore is intentionally excluded — RRF fusion works on rank positions, not raw scores.
    const { limit = 10, framework } = options;
    const searchOptions = { limit, framework };

    // Run both searches in parallel for performance
    const [semanticResults, keywordResults] = await Promise.all([
      this.embeddingRepo.search(orgId, query, searchOptions),
      this.componentRepo.searchKeyword(orgId, query, searchOptions),
    ]);

    // Fuse results using RRF
    const fusedResults = fuseWithRRF(semanticResults, keywordResults, limit);

    return {
      results: fusedResults,
      meta: {
        searchMode: 'hybrid',
        semanticCount: semanticResults.length,
        keywordCount: keywordResults.length,
      },
    };
  }

  /**
   * Semantic search using vector similarity.
   *
   * Delegates to the embedding repository's search method.
   *
   * @param orgId - Organization ID for multi-tenant isolation
   * @param query - Natural language search query
   * @param options - Search options (limit, minScore, framework)
   * @returns Array of matching components with similarity scores
   */
  async searchSemantic(
    orgId: string,
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    return this.embeddingRepo.search(orgId, query, options);
  }

  /**
   * Keyword search using PostgreSQL full-text search.
   *
   * Delegates to the component repository's searchKeyword method.
   *
   * @param orgId - Organization ID for multi-tenant isolation
   * @param query - Search query (parsed by PostgreSQL websearch_to_tsquery)
   * @param options - Search options (limit, minScore, framework)
   * @returns Array of matching components with full-text relevance scores
   */
  async searchKeyword(
    orgId: string,
    query: string,
    options: SearchOptions = {}
  ): Promise<KeywordSearchResult[]> {
    return this.componentRepo.searchKeyword(orgId, query, options);
  }
}
