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

import {
  closeDatabase,
  createComponentRepository,
  createEmbeddingRepository,
  initializeDatabase,
} from '@context-engine/db';
import { serve } from '@hono/node-server';

import { createApp } from './app.js';
import { loadConfig, type ServerConfig } from './config.js';
import { SERVER_VERSION } from './constants.js';
import { createServerLogger } from './logger.js';
import { sessionStore } from './middleware/repositories.js';
import { EmbeddingProcessor } from './services/embedding-processor.js';

// =============================================================================
// Server Startup
// =============================================================================

/**
 * Start the server with the given configuration.
 */
async function startServer() {
  // Load config first (will throw if DATABASE_URL missing)
  const config = loadConfig();
  const rootLogger = createServerLogger(config);

  // Initialize database connection
  initializeDatabase({
    url: config.databaseUrl,
  });

  // Create the app
  const app = createApp();

  // Initialize background embedding processor (if enabled)
  let embeddingProcessor: EmbeddingProcessor | null = null;
  if (config.embeddingProcessorEnabled) {
    embeddingProcessor = new EmbeddingProcessor({
      intervalMs: config.embeddingProcessorInterval,
      batchSize: config.embeddingProcessorBatchSize,
      createComponentRepo: createComponentRepository,
      createEmbeddingRepo: createEmbeddingRepository,
    });
    embeddingProcessor.start();
  }

  // Print startup banner
  printBanner(config);

  // Start HTTP server
  const server = serve({
    fetch: app.fetch,
    port: config.port,
  });

  rootLogger.info(
    { port: config.port, docs: `/ui`, spec: `/doc` },
    `Server running at http://localhost:${config.port}`
  );

  // Setup graceful shutdown
  const shutdown = async (signal: string) => {
    rootLogger.info({ signal }, 'Shutting down gracefully');

    // Stop background processor
    if (embeddingProcessor) {
      embeddingProcessor.stop();
      rootLogger.info('Embedding processor stopped');
    }

    // Close all MCP sessions
    await sessionStore.closeAll();
    sessionStore.destroy();
    rootLogger.info('MCP sessions closed');

    // Close the HTTP server (wait for connections to drain)
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          rootLogger.error({ err }, 'Error closing HTTP server');
          reject(err);
        } else {
          rootLogger.info('HTTP server closed');
          resolve();
        }
      });
    });

    // Close database connection
    await closeDatabase();
    rootLogger.info('Database connection closed');

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

  const platformToken = config.platformToken ? 'Configured' : 'Missing';

  const llmKey = process.env.LLM_API_KEY ? 'Configured' : 'Not configured';

  // Embedding processor status
  const processorStatus = config.embeddingProcessorEnabled
    ? `Enabled (${config.embeddingProcessorInterval}ms, batch ${config.embeddingProcessorBatchSize})`
    : 'Disabled';

  // MCP session configuration
  const sessionConfig = `TTL: ${config.mcpSessionTtl}ms, Max/org: ${config.mcpMaxSessionsPerOrg}`;

  console.log(`
+=====================================================================+
|                     Context Engine Server                           |
+=====================================================================+
|  Version:        ${SERVER_VERSION.padEnd(51)}|
|  Environment:    ${config.environment.padEnd(51)}|
|  Port:           ${String(config.port).padEnd(51)}|
|  Database:       ${dbHost.padEnd(51)}|
|  Auth:           ${'Enabled'.padEnd(51)}|
|  Platform token: ${platformToken.padEnd(51)}|
+---------------------------------------------------------------------+
|  Features                                                           |
+---------------------------------------------------------------------+
|  Processing:     ${llmKey.padEnd(51)}|
|  Embeddings:     ${embeddings.padEnd(51)}|
|  Search:         ${'Hybrid (semantic + keyword, RRF)'.padEnd(51)}|
|  MCP:            ${'Enabled (POST /mcp)'.padEnd(51)}|
|  MCP Sessions:   ${sessionConfig.padEnd(51)}|
|  BG Processor:   ${processorStatus.padEnd(51)}|
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
