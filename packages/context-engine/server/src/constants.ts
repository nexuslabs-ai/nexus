/**
 * Server Constants
 *
 * Shared constants used across the server package.
 * Separated to avoid circular imports between routes and index.
 */

import { createRequire } from 'node:module';

// =============================================================================
// Version
// =============================================================================

const require = createRequire(import.meta.url);
const packageJson = require('../package.json') as { version: string };

/** Current server version, read from package.json as single source of truth. */
export const SERVER_VERSION: string = packageJson.version;
