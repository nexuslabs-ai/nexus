/**
 * CORS Types
 *
 * Type definitions for CORS configuration and validation.
 * Transport-agnostic — no framework dependencies.
 */

import type { Environment, McpCorsMode } from '../config.js';

/**
 * Parsed CORS configuration.
 */
export interface CorsConfig {
  /** Allowed origins (parsed patterns) */
  allowedOrigins: string[];
  /** MCP-specific CORS mode */
  mcpMode: McpCorsMode;
  /** Environment for conditional headers */
  environment: Environment;
}

/**
 * Standard CORS headers used across the application.
 */
export const CORS_HEADERS = {
  /** Standard HTTP headers allowed in CORS requests */
  STANDARD: ['Content-Type', 'Authorization', 'Accept'],
  /** MCP-specific headers */
  MCP: ['mcp-session-id', 'Last-Event-ID', 'mcp-protocol-version'],
  /** Development-only headers (e.g., MCP Inspector) */
  DEV_ONLY: ['x-custom-auth-headers'],
  /** Headers exposed to clients */
  EXPOSED: ['mcp-session-id', 'mcp-protocol-version'],
} as const;
