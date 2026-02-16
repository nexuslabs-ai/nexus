/**
 * MCP Resource: component://detail/{slug}
 *
 * Returns full component manifest with all sections.
 * This is the most comprehensive resource - includes props, examples, and guidance.
 *
 * Use when AI needs complete component information.
 */

import {
  ErrorCode,
  McpError,
  type ReadResourceResult,
} from '@modelcontextprotocol/sdk/types.js';

import { ComponentResolver } from '../../services/component-resolver.js';
import type { McpContext } from '../types.js';

/**
 * Resource URI pattern for component detail.
 */
export const COMPONENT_DETAIL_URI_PATTERN = 'component://detail/{slug}';

/**
 * Resource name for component detail.
 */
export const COMPONENT_DETAIL_NAME = 'Component Detail';

/**
 * Resource description for component detail.
 */
export const COMPONENT_DETAIL_DESCRIPTION =
  'Full component manifest with props, examples, and guidance';

/**
 * Get component detail resource.
 *
 * Returns the complete component manifest (AIManifest).
 * Uses ComponentResolver to support slug, name, or ID lookups.
 *
 * @param slug - Component slug, name, or ID
 * @param ctx - MCP context with orgId and repositories
 * @returns ReadResourceResult with full component manifest
 * @throws McpError if component not found
 */
export async function handleComponentDetail(
  slug: string,
  ctx: McpContext
): Promise<ReadResourceResult> {
  const resolver = new ComponentResolver(ctx.componentRepo);
  const component = await resolver.resolve(ctx.orgId, slug);

  if (!component) {
    throw new McpError(ErrorCode.InvalidParams, `Component not found: ${slug}`);
  }

  if (!component.manifest) {
    throw new McpError(
      ErrorCode.InternalError,
      `Component ${slug} has no manifest (processing may have failed)`
    );
  }

  return {
    contents: [
      {
        uri: `component://detail/${component.slug}`,
        mimeType: 'application/json',
        text: JSON.stringify(component.manifest, null, 2),
      },
    ],
  };
}
