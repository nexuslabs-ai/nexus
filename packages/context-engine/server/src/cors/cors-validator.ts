/**
 * CORS Validator
 *
 * Transport-agnostic origin validation logic.
 * Consumed by both HTTP middleware and MCP router.
 *
 * This module has zero framework dependencies — it works with plain strings.
 */

import { Environment, McpCorsMode } from '../config.js';

import type { CorsConfig } from './cors-types.js';
import { CORS_HEADERS } from './cors-types.js';

/**
 * Check if an origin matches a subdomain wildcard pattern.
 *
 * Pattern format: '*.example.com'
 * Matches: 'https://app.example.com', 'https://staging.example.com'
 * Does not match: 'https://example.com' (base domain without subdomain)
 *
 * @param origin - The request origin (e.g., 'https://app.example.com')
 * @param pattern - The wildcard pattern (e.g., '*.example.com')
 * @returns true if origin matches the pattern
 */
function matchesSubdomainWildcard(origin: string, pattern: string): boolean {
  const baseDomain = pattern.slice(2); // Remove '*.'

  // Must contain the base domain
  if (!origin.includes(baseDomain)) {
    return false;
  }

  // Check for subdomain: origin should have .{baseDomain}
  return origin.includes(`.${baseDomain}`);
}

/**
 * Validate if an origin is allowed based on the allowlist.
 *
 * Supports three pattern types:
 * - Wildcard: '*' allows all origins (development only)
 * - Exact match: 'https://app.example.com'
 * - Subdomain wildcard: '*.example.com'
 *
 * @param origin - The request origin header value
 * @param allowedOrigins - Array of allowed origin patterns
 * @returns true if origin is allowed
 *
 * @example
 * ```ts
 * // Wildcard
 * isOriginAllowed('https://any.com', ['*']); // true
 *
 * // Exact match
 * isOriginAllowed('https://app.com', ['https://app.com']); // true
 * isOriginAllowed('https://other.com', ['https://app.com']); // false
 *
 * // Subdomain wildcard
 * isOriginAllowed('https://app.example.com', ['*.example.com']); // true
 * ```
 */
export function isOriginAllowed(
  origin: string,
  allowedOrigins: string[]
): boolean {
  // Wildcard allows everything
  if (allowedOrigins.includes('*')) {
    return true;
  }

  return allowedOrigins.some((pattern) => {
    // Exact match
    if (pattern === origin) {
      return true;
    }

    // Subdomain wildcard match
    if (pattern.startsWith('*.')) {
      return matchesSubdomainWildcard(origin, pattern);
    }

    return false;
  });
}

/**
 * Validate if an origin is allowed for MCP based on CORS mode.
 *
 * MCP has three modes that layer on top of the base allowlist:
 * - DISABLED: No browser access (server-to-server only)
 * - RESTRICTED: Validate against allowlist
 * - PERMISSIVE: Allow all origins (development only)
 *
 * @param origin - The request origin header value (undefined if no Origin header)
 * @param config - CORS configuration with mode and allowlist
 * @returns true if origin should be allowed for MCP
 *
 * @example
 * ```ts
 * // DISABLED mode - always reject browser requests
 * isOriginAllowedForMcp('https://app.com', { mcpMode: 'DISABLED', ... }); // false
 *
 * // PERMISSIVE mode - allow all
 * isOriginAllowedForMcp('https://any.com', { mcpMode: 'PERMISSIVE', ... }); // true
 *
 * // RESTRICTED mode - check allowlist
 * isOriginAllowedForMcp('https://app.com', {
 *   mcpMode: 'RESTRICTED',
 *   allowedOrigins: ['https://app.com'],
 *   ...
 * }); // true
 * ```
 */
export function isOriginAllowedForMcp(
  origin: string | undefined,
  config: CorsConfig
): boolean {
  // No origin = non-browser request (e.g., curl, server-to-server)
  // These bypass CORS entirely (not a browser security boundary)
  if (!origin) {
    return false; // Return false to indicate "no CORS headers needed"
  }

  switch (config.mcpMode) {
    case McpCorsMode.Disabled:
      // No browser access to MCP
      return false;

    case McpCorsMode.Permissive:
      // Allow all origins (development only)
      return true;

    case McpCorsMode.Restricted:
      // Validate against allowlist
      return isOriginAllowed(origin, config.allowedOrigins);
  }
}

/**
 * Build allowed headers list based on environment.
 *
 * Uses CORS_HEADERS constant for single source of truth.
 *
 * @param environment - Current environment
 * @returns Comma-separated header string for Access-Control-Allow-Headers
 */
export function buildAllowedHeaders(environment: Environment): string {
  const headers: string[] = [...CORS_HEADERS.STANDARD, ...CORS_HEADERS.MCP];

  // Dev-only headers (MCP Inspector)
  if (environment !== Environment.Production) {
    headers.push(...CORS_HEADERS.DEV_ONLY);
  }

  return headers.join(', ');
}
