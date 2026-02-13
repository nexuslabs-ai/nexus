/**
 * MCP Tool: find_similar_components
 *
 * Find components similar to a given component using semantic similarity.
 * Uses embedding-based vector similarity to discover related components.
 *
 * Use cases:
 * - Find alternative components with similar functionality
 * - Discover related components for composition
 * - Explore component variations
 *
 * Requires:
 * - component:read scope
 * - Embedding repository configured (VOYAGE_API_KEY)
 * - Base component must be indexed
 *
 * Read-only operation: queries only, no writes.
 */

import type { ShapeOutput } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { ComponentResolver } from '../../services/component-resolver.js';
import type { McpContext } from '../types.js';
import { mcpError } from '../utils/error.js';

// =============================================================================
// Schema
// =============================================================================

/**
 * Input schema for find_similar_components tool.
 * Plain object with Zod validators (v1.x SDK pattern).
 */
export const findSimilarSchema = {
  identifier: z
    .string()
    .min(1)
    .describe(
      'Component slug, name, or ID to find similar components for (e.g., "button", "Button", or UUID)'
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe('Maximum similar components to return (default 5, max 20)'),
  minScore: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('Minimum similarity score threshold (0-1, default 0.5)'),
  framework: z
    .string()
    .optional()
    .describe('Filter results by framework (e.g., "react", "vue")'),
};

/**
 * Validated input type for find_similar_components.
 * Uses SDK's ShapeOutput helper for correct type inference with v1.x.
 */
export type FindSimilarInput = ShapeOutput<typeof findSimilarSchema>;

// =============================================================================
// Handler
// =============================================================================

/**
 * Find components similar to a given component.
 *
 * Flow:
 * 1. Resolve base component using ComponentResolver
 * 2. Check if embedding repository is available
 * 3. Use component's embedding to find similar components via vector search
 * 4. Return similar components with similarity scores
 *
 * @param args - Validated tool arguments
 * @param ctx - MCP context with orgId and repositories
 * @returns CallToolResult with similar components or error
 */
export async function handleFindSimilar(
  args: FindSimilarInput,
  ctx: McpContext
): Promise<CallToolResult> {
  // Check if embedding repository is available
  if (!ctx.embeddingRepo) {
    return mcpError('Semantic similarity not available', {
      reason: 'Embedding repository not configured (VOYAGE_API_KEY missing)',
      suggestion:
        'Configure VOYAGE_API_KEY to enable similarity search, or use search_components with mode=keyword as fallback',
    });
  }

  // Resolve base component
  const resolver = new ComponentResolver(ctx.componentRepo);
  const baseComponent = await resolver.resolve(ctx.orgId, args.identifier);

  // Handle component not found
  if (!baseComponent) {
    return mcpError('Base component not found', {
      identifier: args.identifier,
      suggestion:
        'Use search_components to find available components, or check the component identifier',
    });
  }

  // Check if base component is indexed (has embedding)
  if (baseComponent.embeddingStatus !== 'indexed') {
    return mcpError('Base component not indexed', {
      componentId: baseComponent.id,
      name: baseComponent.name,
      embeddingStatus: baseComponent.embeddingStatus,
      suggestion:
        'Component must be indexed before similarity search. Status: ' +
        baseComponent.embeddingStatus,
    });
  }

  // Perform similarity search using the base component's name/description
  // We use the component's natural language text (name + description) as the query
  // because the embedding repo's search method expects a text query, not a component ID.
  const query = baseComponent.manifest?.description
    ? `${baseComponent.name}: ${baseComponent.manifest.description}`
    : baseComponent.name;

  const limit = args.limit ?? 5;
  const minScore = args.minScore ?? 0.5;

  const results = await ctx.embeddingRepo.search(ctx.orgId, query, {
    limit: limit + 1, // +1 to account for the base component appearing in results
    minScore,
    framework: args.framework,
  });

  // Filter out the base component from results (it will likely appear as most similar to itself)
  const similarComponents = results
    .filter((r) => r.componentId !== baseComponent.id)
    .slice(0, limit);

  // Format results for AI consumption
  const formattedResults = similarComponents.map((r) => ({
    componentId: r.componentId,
    slug: r.slug,
    name: r.name,
    description: r.description,
    framework: r.framework,
    similarityScore: r.score,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            baseComponent: {
              componentId: baseComponent.id,
              slug: baseComponent.slug,
              name: baseComponent.name,
              description: baseComponent.manifest?.description ?? null,
              framework: baseComponent.framework,
            },
            similarComponents: formattedResults,
            total: formattedResults.length,
            meta: {
              query,
              limit: args.limit ?? 5,
              minScore: args.minScore ?? 0.5,
              framework: args.framework ?? null,
            },
          },
          null,
          2
        ),
      },
    ],
  };
}
