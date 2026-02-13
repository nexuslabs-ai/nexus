/**
 * MCP Resource: component://guidance/{slug}
 *
 * Returns only component guidance (best practices, accessibility, when to use).
 * Useful when AI needs contextual advice without full manifest overhead.
 *
 * Use when AI needs design/UX guidance for component selection.
 */

import type { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

import { ComponentResolver } from '../../services/component-resolver.js';
import type { McpContext } from '../types.js';
import { mcpError } from '../utils/error.js';

/**
 * Resource URI pattern for component guidance.
 */
export const COMPONENT_GUIDANCE_URI_PATTERN = 'component://guidance/{slug}';

/**
 * Resource name for component guidance.
 */
export const COMPONENT_GUIDANCE_NAME = 'Component Guidance';

/**
 * Resource description for component guidance.
 */
export const COMPONENT_GUIDANCE_DESCRIPTION =
  'Component best practices and usage guidance (when to use, accessibility, patterns)';

/**
 * Get component guidance resource.
 *
 * Returns only the guidance section from the component manifest.
 * Includes when-to-use advice, accessibility considerations, best practices,
 * and related components.
 *
 * @param slug - Component slug, name, or ID
 * @param ctx - MCP context with orgId and repositories
 * @returns ReadResourceResult with component guidance
 * @throws McpError if component not found or has no manifest
 */
export async function handleComponentGuidance(
  slug: string,
  ctx: McpContext
): Promise<ReadResourceResult> {
  const resolver = new ComponentResolver(ctx.componentRepo);
  const component = await resolver.resolve(ctx.orgId, slug);

  if (!component) {
    throw mcpError('NOT_FOUND', `Component not found: ${slug}`);
  }

  if (!component.manifest) {
    throw mcpError(
      'INVALID_STATE',
      `Component ${slug} has no manifest (processing may have failed)`
    );
  }

  // Extract guidance section
  const guidanceData = {
    name: component.manifest.name,
    slug: component.manifest.slug,
    description: component.manifest.description,
    guidance: component.manifest.guidance || null,
  };

  return {
    contents: [
      {
        uri: `component://guidance/${component.slug}`,
        mimeType: 'application/json',
        text: JSON.stringify(guidanceData, null, 2),
      },
    ],
  };
}
