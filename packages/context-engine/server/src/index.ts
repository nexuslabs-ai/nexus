/**
 * @context-engine/server
 *
 * HTTP API server for Context Engine.
 *
 * This is the library entry point — pure exports only.
 * For the executable server, see `server.ts`.
 */

// =============================================================================
// Exports
// =============================================================================

// Re-export constants
export { SERVER_VERSION } from './constants.js';

// Re-export app factory and type
export { type App, createApp } from './app.js';

// Re-export config
export {
  Environment,
  getConfig,
  loadConfig,
  resetConfig,
  type ServerConfig,
} from './config.js';

// Re-export schemas
export * from './schemas/index.js';

// Re-export routes
export * from './routes/index.js';

// Re-export auth module
export * from './auth/index.js';

// Re-export middleware
export { authMiddleware, requireScope } from './middleware/index.js';
