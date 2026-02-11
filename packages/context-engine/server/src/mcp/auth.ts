/**
 * MCP Auth Bridge
 *
 * Bridges the MCP transport to the shared auth core from the server package.
 * This module is transport-agnostic: works with any Request object (Fetch API).
 *
 * Auth flow for MCP:
 * 1. Extract Authorization header from request
 * 2. Parse Bearer token (strip "Bearer " prefix)
 * 3. Detect token kind via detectTokenKind()
 * 4. Reject platform tokens (cep_) — MCP is tenant-only
 * 5. Validate tenant API key via validateApiKey()
 * 6. Check for component:read scope (required for all MCP tools)
 * 7. Return AuthResult (success with context, or failure with error)
 *
 * This function is called BEFORE the MCP transport processes the JSON-RPC message.
 * If auth fails, we return a 401 JSON-RPC error without invoking the MCP server.
 */

import type { ApiKeyRepository } from '@context-engine/db';

import { type AuthResult, TokenKind } from '../auth/auth-types.js';
import { detectTokenKind, validateApiKey } from '../auth/auth-validator.js';
import { hasScope } from '../auth/scope-checker.js';
import type { ServerConfig } from '../config.js';

/**
 * Extract and validate MCP authentication from a raw Request.
 *
 * This is the auth entry point for MCP. It:
 * - Accepts tenant API keys (`ce_` prefix) only
 * - Rejects platform tokens (`cep_` prefix) — MCP is tenant-scoped
 * - Requires `component:read` scope at minimum
 *
 * @param request - The raw incoming request (Fetch API Request)
 * @param config - Server configuration (for API key hash secret)
 * @param apiKeyRepo - Repository for API key validation
 * @returns AuthResult — success with TenantAuthContext, or failure with error message
 *
 * @example
 * ```ts
 * const authResult = await extractMcpAuth(request, config, apiKeyRepo);
 * if (!authResult.success) {
 *   return c.json({
 *     jsonrpc: '2.0',
 *     error: { code: -32001, message: authResult.error },
 *     id: null,
 *   }, 401);
 * }
 * // Use authResult.context.orgId for MCP context
 * ```
 */
export async function extractMcpAuth(
  request: Request,
  config: ServerConfig,
  apiKeyRepo: ApiKeyRepository
): Promise<AuthResult> {
  // Step 1: Extract Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'Missing or invalid Authorization header',
    };
  }

  // Step 2: Parse Bearer token
  const token = authHeader.slice(7); // Remove "Bearer " prefix

  // Step 3: Detect token kind
  const tokenKind = detectTokenKind(token);

  // Step 4: Reject platform tokens
  // MCP is tenant-scoped; platform tokens stay internal to control-plane flows.
  if (tokenKind === TokenKind.PlatformToken) {
    return {
      success: false,
      error: 'MCP requires tenant API key (ce_ prefix)',
    };
  }

  // Step 5: Validate as tenant API key
  if (tokenKind !== TokenKind.TenantApiKey) {
    return {
      success: false,
      error: 'Invalid token format',
    };
  }

  const result = await validateApiKey(
    token,
    config.apiKeyHashSecret,
    apiKeyRepo
  );

  if (!result.success) {
    return result;
  }

  // Step 6: Check for component:read scope
  // All MCP tools require at minimum the ability to read components.
  if (!hasScope(result.context, 'component:read')) {
    return {
      success: false,
      error: "Missing required scope: 'component:read'",
    };
  }

  return result;
}
