/**
 * Server Constants
 *
 * Shared constants used across the server package.
 * Separated to avoid circular imports between routes and index.
 */

// =============================================================================
// Version
// =============================================================================

/**
 * Current server version, injected at build time from package.json by tsup.
 * Falls back to '0.0.0' in development mode (ts-node/tsx).
 */
export const SERVER_VERSION: string = process.env.PACKAGE_VERSION ?? '0.0.0';
