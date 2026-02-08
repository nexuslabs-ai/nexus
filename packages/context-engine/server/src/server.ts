/**
 * Server Entry Point
 *
 * Executable entry point that starts the HTTP server.
 * This file is the only place with side effects (server startup).
 *
 * Usage:
 *   Development: tsx watch --env-file=.env src/server.ts
 *   Production:  node --env-file=.env dist/server.js
 */

import { closeDatabase, initializeDatabase } from '@context-engine/db';
import { serve } from '@hono/node-server';

import { createApp } from './app.js';
import { loadConfig, type ServerConfig } from './config.js';
import { SERVER_VERSION } from './constants.js';

// =============================================================================
// Server Startup
// =============================================================================

/**
 * Start the server with the given configuration.
 */
async function startServer() {
  // Load config first (will throw if DATABASE_URL missing)
  const config = loadConfig();

  // Initialize database connection
  initializeDatabase({
    url: config.databaseUrl,
  });

  // Create the app
  const app = createApp();

  // Print startup banner
  printBanner(config);

  // Start HTTP server
  const server = serve({
    fetch: app.fetch,
    port: config.port,
  });

  console.log(`Server running at http://localhost:${config.port}`);
  console.log(`API docs: http://localhost:${config.port}/ui`);
  console.log(`OpenAPI spec: http://localhost:${config.port}/doc`);

  // Setup graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);

    // Close the HTTP server (wait for connections to drain)
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          console.error('Error closing HTTP server:', err);
          reject(err);
        } else {
          console.log('HTTP server closed');
          resolve();
        }
      });
    });

    // Close database connection
    await closeDatabase();
    console.log('Database connection closed');

    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// =============================================================================
// Banner
// =============================================================================

/**
 * Print server startup banner.
 */
function printBanner(config: ServerConfig) {
  // Extract database host from URL, safely handling various formats
  let dbHost = 'configured';
  try {
    const urlParts = config.databaseUrl.split('@');
    if (urlParts.length > 1) {
      const hostPart = urlParts[1].split('/')[0];
      dbHost = hostPart || 'configured';
    }
  } catch {
    dbHost = 'configured';
  }

  // Check VOYAGE_API_KEY from env (used by @context-engine/db for search)
  const embeddings = process.env.VOYAGE_API_KEY
    ? 'Configured'
    : 'Not configured';

  const auth = config.authEnabled
    ? 'Enabled'
    : 'Disabled (set AUTH_ENABLED=true for production)';

  console.log(`
+=====================================================================+
|                     Context Engine Server                           |
+=====================================================================+
|  Version:     ${SERVER_VERSION.padEnd(54)}|
|  Environment: ${config.environment.padEnd(54)}|
|  Port:        ${String(config.port).padEnd(54)}|
|  Database:    ${dbHost.padEnd(54)}|
|  Auth:        ${auth.padEnd(54)}|
|  Embeddings:  ${embeddings.padEnd(54)}|
+=====================================================================+
`);
}

// =============================================================================
// Main
// =============================================================================

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
