/**
 * Reciprocal Rank Fusion (RRF)
 *
 * Utility for combining ranked search results from multiple retrieval methods.
 * Used by both HTTP search routes and MCP search tools for hybrid search.
 *
 * RRF Algorithm:
 * - Assigns each result a score of 1/(k + rank) from each retrieval method
 * - Sums scores across all methods for each unique result
 * - Sorts by combined score descending
 *
 * Benefits:
 * - No score normalization needed between methods
 * - Rewards results that appear in multiple ranked lists
 * - Handles different score scales naturally (semantic vs keyword)
 * - Simple and effective for hybrid search
 */

import type { KeywordSearchResult, SearchResult } from '@context-engine/db';

// =============================================================================
// Constants
// =============================================================================

/**
 * RRF smoothing constant.
 *
 * Controls how much rank position affects the fused score.
 * Higher values dampen rank differences (standard value from the RRF paper).
 */
export const RRF_K = 60;

// =============================================================================
// Types
// =============================================================================

/**
 * A single result from RRF fusion with a combined score.
 *
 * The rrfScore combines rankings from multiple retrieval methods,
 * where higher values indicate the component appeared highly ranked
 * in one or more methods.
 */
export interface RrfFusedResult {
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
 * Algorithm:
 * 1. For each result in semanticResults at rank i: score += 1/(RRF_K + i + 1)
 * 2. For each result in keywordResults at rank j: score += 1/(RRF_K + j + 1)
 * 3. Sort all unique results by combined score descending
 * 4. Return top N results
 *
 * @param semanticResults - Results from vector similarity search (ordered by relevance)
 * @param keywordResults - Results from full-text search (ordered by relevance)
 * @param limit - Maximum number of fused results to return
 * @returns Fused results sorted by combined RRF score descending
 *
 * @example
 * ```typescript
 * const semanticResults = await embeddingRepo.search(orgId, query, { limit: 20 });
 * const keywordResults = await componentRepo.searchKeyword(orgId, query, { limit: 20 });
 * const fused = fuseWithRRF(semanticResults, keywordResults, 10);
 * // Returns top 10 results with combined scores
 * ```
 */
export function fuseWithRRF(
  semanticResults: SearchResult[],
  keywordResults: KeywordSearchResult[],
  limit: number
): RrfFusedResult[] {
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
  // Note: If both input arrays are empty, scores.values() will be empty,
  // resulting in an empty array. This is the expected behavior — no results
  // from either retrieval method means no fused results to return.
  return Array.from(scores.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, limit);
}
