/**
 * MCP Resource: component://props/{slug}
 *
 * Returns only component props reference (no examples or guidance).
 * Useful when AI needs to know what props are available without context overhead.
 *
 * Use when AI is working with known component and needs prop API.
 */

import {
  ErrorCode,
  McpError,
  type ReadResourceResult,
} from '@modelcontextprotocol/sdk/types.js';

import { ComponentResolver } from '../../services/component-resolver.js';
import type { McpContext } from '../types.js';

/**
 * Resource URI pattern for component props.
 */
export const COMPONENT_PROPS_URI_PATTERN = 'component://props/{slug}';

/**
 * Resource name for component props.
 */
export const COMPONENT_PROPS_NAME = 'Component Props';

/**
 * Resource description for component props.
 */
export const COMPONENT_PROPS_DESCRIPTION =
  'Component props reference (categorized props with types and defaults)';

/**
 * Get component props resource.
 *
 * Returns only the props section from the component manifest.
 * Includes categorized props (required, optional, style, variants, events)
 * with types, defaults, and value descriptions.
 *
 * @param slug - Component slug, name, or ID
 * @param ctx - MCP context with orgId and repositories
 * @returns ReadResourceResult with component props
 * @throws McpError if component not found or has no manifest
 */
export async function handleComponentProps(
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

  // Extract props section
  const propsData = {
    name: component.manifest.name,
    slug: component.manifest.slug,
    importStatement: component.manifest.importStatement,
    children: component.manifest.children,
    props: component.manifest.props || null,
    subComponents: component.manifest.subComponents
      ? component.manifest.subComponents.map((sub) => ({
          name: sub.name,
          description: sub.description,
          props: sub.props,
          dataSlot: sub.dataSlot,
          requiredInComposition: sub.requiredInComposition,
        }))
      : null,
  };

  return {
    contents: [
      {
        uri: `component://props/${component.slug}`,
        mimeType: 'application/json',
        text: JSON.stringify(propsData, null, 2),
      },
    ],
  };
}
