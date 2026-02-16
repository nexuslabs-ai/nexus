/**
 * MCP Utilities
 *
 * Shared utility functions for MCP protocol implementation.
 */

/**
 * Create a JSON-RPC 2.0 error response body.
 *
 * Returns a properly formatted JSON-RPC 2.0 error object per the MCP protocol spec.
 * All MCP errors must follow this format for SDK compatibility.
 *
 * JSON-RPC 2.0 Standard Error Codes:
 * - -32700: Parse error (invalid JSON)
 * - -32600: Invalid Request
 * - -32601: Method not found
 * - -32602: Invalid params
 * - -32603: Internal error
 * - -32000 to -32099: Server error (reserved range)
 * - -32001: Custom auth/business errors (commonly used in our code)
 *
 * @param code - JSON-RPC error code (e.g., -32001 for auth errors, -32700 for parse errors)
 * @param message - Human-readable error message
 * @returns JSON-RPC 2.0 error object for use with c.json(body, status)
 *
 * @example
 * ```typescript
 * return c.json(jsonRpcError(-32001, 'Invalid API key'), 401);
 * return c.json(jsonRpcError(-32700, 'Parse error: Invalid JSON'), 400);
 * ```
 */
export function jsonRpcError(code: number, message: string) {
  return {
    jsonrpc: '2.0' as const,
    error: { code, message },
    id: null,
  };
}
