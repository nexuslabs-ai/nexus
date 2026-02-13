/**
 * MCP Tool: get_component
 *
 * Retrieve full component details by identifier (slug, name, or ID).
 * Returns the complete manifest with props, examples, and usage guidance.
 *
 * Resolution order:
 * 1. Slug (most common for API usage)
 * 2. Name (case-insensitive fallback)
 * 3. ID (UUID fallback)
 *
 * The manifest fields are flattened into the response for easier AI parsing.
 */

import type { ShapeOutput } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { ComponentResolver } from '../../services/component-resolver.js';
import { formatComponent } from '../../utils/formatters.js';
import type { McpContext } from '../types.js';
import { mcpError } from '../utils/error.js';

// =============================================================================
// Schema
// =============================================================================

/**
 * Input schema for get_component tool.
 * Plain object with Zod validators (v1.x SDK pattern).
 */
export const getComponentSchema = {
  identifier: z
    .string()
    .min(1)
    .describe(
      'Component slug, name, or ID (e.g., "button", "Button", or UUID)'
    ),
};

/**
 * Validated input type for get_component.
 * Uses SDK's ShapeOutput helper for correct type inference with v1.x.
 */
export type GetComponentInput = ShapeOutput<typeof getComponentSchema>;

// =============================================================================
// Handler
// =============================================================================

/**
 * Get full component details by identifier.
 *
 * Uses ComponentResolver to flexibly match slug, name, or ID.
 * Returns the complete component with manifest fields flattened.
 *
 * @param args - Validated tool arguments
 * @param ctx - MCP context with orgId and repositories
 * @returns CallToolResult with component details or not-found error
 */
export async function handleGetComponent(
  args: GetComponentInput,
  ctx: McpContext
): Promise<CallToolResult> {
  // Resolve component using the service layer
  const resolver = new ComponentResolver(ctx.componentRepo);
  const component = await resolver.resolve(ctx.orgId, args.identifier);

  // Handle not found
  if (!component) {
    return mcpError('Component not found', {
      identifier: args.identifier,
      suggestion:
        'Use search_components to find available components, or check the component identifier',
    });
  }

  // Format component for response (converts dates to ISO strings)
  const formatted = formatComponent(component);

  // Flatten manifest fields into top-level response for easier AI parsing
  const response = {
    ...formatted,
    // Flatten manifest if present
    ...(formatted.manifest && {
      description: formatted.manifest.description,
      props: formatted.manifest.props,
      examples: formatted.manifest.examples,
      guidance: formatted.manifest.guidance,
      dependencies: formatted.manifest.dependencies,
      subComponents: formatted.manifest.subComponents,
    }),
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}
