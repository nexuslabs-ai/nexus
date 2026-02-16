/**
 * MCP Resource: component://examples/{slug}
 *
 * Returns only component usage examples (no props or guidance).
 * Useful when AI needs to see how component is used in practice.
 *
 * Use when AI knows the component but needs usage patterns.
 */

import {
  ErrorCode,
  McpError,
  type ReadResourceResult,
} from '@modelcontextprotocol/sdk/types.js';

import { ComponentResolver } from '../../services/component-resolver.js';
import type { McpContext } from '../types.js';

/**
 * Resource URI pattern for component examples.
 */
export const COMPONENT_EXAMPLES_URI_PATTERN = 'component://examples/{slug}';

/**
 * Resource name for component examples.
 */
export const COMPONENT_EXAMPLES_NAME = 'Component Examples';

/**
 * Resource description for component examples.
 */
export const COMPONENT_EXAMPLES_DESCRIPTION =
  'Component usage examples (code snippets showing real-world usage)';

/**
 * Get component examples resource.
 *
 * Returns only the examples section from the component manifest.
 * Includes usage patterns, variants, and real code snippets.
 *
 * @param slug - Component slug, name, or ID
 * @param ctx - MCP context with orgId and repositories
 * @returns ReadResourceResult with component examples
 * @throws McpError if component not found or has no manifest
 */
export async function handleComponentExamples(
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

  // Extract examples section
  const examplesData = {
    name: component.manifest.name,
    slug: component.manifest.slug,
    importStatement: component.manifest.importStatement,
    examples: component.manifest.examples || null,
  };

  return {
    contents: [
      {
        uri: `component://examples/${component.slug}`,
        mimeType: 'application/json',
        text: JSON.stringify(examplesData, null, 2),
      },
    ],
  };
}
