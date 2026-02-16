/**
 * MCP Resource: component-catalog
 *
 * URI: context://components
 * Returns a summary list of all components in the organization.
 *
 * This resource provides a catalog view of available components,
 * useful for AI assistants to browse what's available before
 * fetching detailed component information.
 *
 * Returns up to 100 components in summary format (no large JSONB fields).
 */

import type { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

import { formatComponentSummary } from '../../utils/formatters.js';
import type { McpContext } from '../types.js';

/**
 * Resource URI for component catalog.
 */
export const COMPONENT_CATALOG_URI = 'context://components';

/**
 * Resource name for component catalog.
 */
export const COMPONENT_CATALOG_NAME = 'Component Catalog';

/**
 * Resource description for component catalog.
 */
export const COMPONENT_CATALOG_DESCRIPTION =
  'List of all components in the organization (summary view)';

/**
 * Get component catalog resource.
 *
 * Returns a summary list of all components (up to 100).
 * Uses summary format to exclude large JSONB fields (manifest, extraction, generation).
 *
 * @param ctx - MCP context with orgId and repositories
 * @returns ReadResourceResult with component catalog
 */
export async function handleComponentCatalog(
  ctx: McpContext
): Promise<ReadResourceResult> {
  // Fetch components (limit to 100 for performance)
  const result = await ctx.componentRepo.findMany(ctx.orgId, {
    limit: 100,
  });

  // Format as summary (excludes large JSONB fields)
  const catalog = result.components.map(formatComponentSummary);

  // Build response
  const response = {
    total: result.total,
    count: catalog.length,
    components: catalog,
  };

  return {
    contents: [
      {
        uri: COMPONENT_CATALOG_URI,
        mimeType: 'application/json',
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}
