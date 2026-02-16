/**
 * MCP Error Utilities
 *
 * Standardized error response helpers for MCP tools.
 * Ensures consistent error format across all tool handlers.
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Creates a standardized MCP error response.
 *
 * All MCP tools should use this helper instead of manually constructing
 * error objects to ensure consistent error format.
 *
 * @param error - High-level error message (e.g., "Component not found")
 * @param details - Additional context (string message or structured data)
 * @returns MCP CallToolResult with isError: true
 *
 * @example
 * // String details
 * return mcpError('Component not found', 'Use search_components to find available components');
 *
 * @example
 * // Structured details
 * return mcpError('Base component not indexed', {
 *   componentId: component.id,
 *   embeddingStatus: component.embeddingStatus,
 *   suggestion: 'Component must be indexed before similarity search'
 * });
 */
export function mcpError(
  error: string,
  details?: string | Record<string, unknown>
): CallToolResult {
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          typeof details === 'string'
            ? { error, message: details }
            : { error, ...details }
        ),
      },
    ],
  };
}
