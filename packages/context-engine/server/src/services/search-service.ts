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

// =============================================================================
// Constants
// =============================================================================

/**
 * RRF smoothing constant.
 *
 * Controls how much rank position affects the fused score.
 * Higher values dampen rank differences (standard value from the RRF paper).
 */
const RRF_K = 60;

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
 * The rrfScore combines rankings from both semantic and keyword search,
 * where higher values indicate the component appeared highly ranked
 * in one or both retrieval methods.
 */
export interface FusedSearchResult {
  /** Component UUID */
  componentId: string;

  /** URL-friendly identifier */
  slug: string;

  /** Human-readable component name */
  name: string;

  /** Component description (may be null) */
  description: string | null;

  /** Target framework (e.g., 'react', 'vue') */
  framework: string;

  /** Reciprocal Rank Fusion score (higher is more relevant) */
  rrfScore: number;
}

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
// RRF Fusion
// =============================================================================

/**
 * Fuse semantic and keyword search results using Reciprocal Rank Fusion.
 *
 * RRF combines ranked lists by assigning each result a score of 1/(k + rank)
 * from each retrieval method, then summing across methods. This approach:
 * - Requires no score normalization between methods
 * - Rewards results that appear in both lists
 * - Handles different score scales naturally
 *
 * @param semanticResults - Results from vector similarity search (ordered by relevance)
 * @param keywordResults - Results from full-text search (ordered by relevance)
 * @param limit - Maximum number of fused results to return
 * @returns Fused results sorted by combined RRF score descending
 */
function fuseWithRRF(
  semanticResults: SearchResult[],
  keywordResults: KeywordSearchResult[],
  limit: number
): FusedSearchResult[] {
  const scores = new Map<
    string,
    {
      rrfScore: number;
      name: string;
      slug: string;
      description: string | null;
      framework: string;
      componentId: string;
    }
  >();

  // Assign RRF scores from semantic results (rank-based, 0-indexed)
  for (let rank = 0; rank < semanticResults.length; rank++) {
    const result = semanticResults[rank];
    const entry = scores.get(result.componentId) ?? {
      rrfScore: 0,
      name: result.name,
      slug: result.slug,
      description: result.description,
      framework: result.framework,
      componentId: result.componentId,
    };
    entry.rrfScore += 1 / (RRF_K + rank + 1);
    scores.set(result.componentId, entry);
  }

  // Assign RRF scores from keyword results (rank-based, 0-indexed)
  for (let rank = 0; rank < keywordResults.length; rank++) {
    const result = keywordResults[rank];
    const entry = scores.get(result.componentId) ?? {
      rrfScore: 0,
      name: result.name,
      slug: result.slug,
      description: result.description,
      framework: result.framework,
      componentId: result.componentId,
    };
    entry.rrfScore += 1 / (RRF_K + rank + 1);
    scores.set(result.componentId, entry);
  }

  // Sort by fused RRF score descending, take top N
  return Array.from(scores.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, limit);
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
