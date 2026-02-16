/**
 * MCP Types
 *
 * Type definitions for MCP tool and resource handlers.
 * These types are transport-agnostic and contain no Hono dependencies.
 *
 * The MCP module is deliberately decoupled from HTTP frameworks:
 * - Handlers receive McpContext (orgId + repositories)
 * - Handlers return MCP protocol types (CallToolResult, ReadResourceResult)
 * - No Hono Context (c) passed to handlers
 *
 * This keeps handlers testable and framework-independent.
 */

import type {
  ApiKeyRepository,
  ComponentRepository,
  EmbeddingRepository,
} from '@context-engine/db';
import type {
  CallToolResult,
  ReadResourceResult,
} from '@modelcontextprotocol/sdk/types.js';

import type { AuthScope } from '../auth/auth-types.js';

// =============================================================================
// MCP Context
// =============================================================================

/**
 * Context passed to every MCP tool and resource handler.
 *
 * Contains the authenticated organization ID and repository instances.
 * Handlers use this to perform org-scoped queries.
 *
 * This is intentionally minimal and framework-agnostic.
 */
export interface McpContext {
  /**
   * Authenticated organization ID from tenant API key validation.
   * All repository queries must be scoped to this org.
   */
  orgId: string;

  /**
   * Component repository for CRUD operations.
   * Always available.
   */
  componentRepo: ComponentRepository;

  /**
   * Embedding repository for semantic search.
   * Only available when VOYAGE_API_KEY is configured.
   * Check availability before using.
   */
  embeddingRepo: EmbeddingRepository | undefined;

  /**
   * API key repository for authentication lookups.
   * Used by auth bridge, not typically needed by handlers.
   */
  apiKeyRepo: ApiKeyRepository;

  /**
   * Validated permission scopes from API key.
   * Used for read-scope verification in MCP tools.
   * MCP is read-only: all tools require component:read at minimum.
   */
  scopes: AuthScope[];
}

// =============================================================================
// Handler Signatures
// =============================================================================

/**
 * MCP tool handler function signature.
 *
 * Tool handlers are pure async functions that:
 * - Accept validated arguments and MCP context
 * - Return CallToolResult with content or error
 * - Never throw exceptions (return isError: true instead)
 *
 * @template TArgs - Tool-specific argument type (validated by Zod)
 */
export type ToolHandler<TArgs = unknown> = (
  args: TArgs,
  ctx: McpContext
) => Promise<CallToolResult>;

/**
 * MCP resource handler function signature.
 *
 * Resource handlers are pure async functions that:
 * - Accept MCP context only (resources have no arguments)
 * - Return ReadResourceResult with content
 * - Should not throw exceptions (handle errors gracefully)
 */
export type ResourceHandler = (ctx: McpContext) => Promise<ReadResourceResult>;
