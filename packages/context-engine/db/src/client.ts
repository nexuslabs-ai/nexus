/**
 * Database Client
 *
 * Connection management for the Context Engine database.
 * Uses postgres.js for the connection and Drizzle ORM for queries.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema.js';

// =============================================================================
// Module State
// =============================================================================

let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration for database connection
 */
export interface DatabaseConfig {
  /** PostgreSQL connection URL */
  url: string;

  /**
   * Maximum number of connections in the pool
   * @default 10
   */
  maxConnections?: number;

  /**
   * Idle connection timeout in seconds
   * @default 20
   */
  idleTimeout?: number;

  /**
   * Connection timeout in seconds
   * @default 10
   */
  connectTimeout?: number;
}

/**
 * Database instance type (Drizzle with schema)
 */
export type Database = ReturnType<typeof drizzle<typeof schema>>;

// =============================================================================
// Connection Management
// =============================================================================

/**
 * Initialize database connection with pooling
 *
 * Creates a connection pool using postgres.js and wraps it with Drizzle ORM.
 * If already initialized, returns the existing connection (idempotent).
 *
 * @param config - Database configuration
 * @returns The Drizzle database instance
 *
 * @example
 * ```typescript
 * import { initializeDatabase } from '@context-engine/db';
 *
 * const db = initializeDatabase({
 *   url: process.env.DATABASE_URL!,
 *   maxConnections: 20,
 * });
 * ```
 */
export function initializeDatabase(config: DatabaseConfig): Database {
  if (db) {
    return db;
  }

  const {
    url,
    maxConnections = 10,
    idleTimeout = 20,
    connectTimeout = 10,
  } = config;

  if (!url) {
    throw new Error('Database URL is required');
  }

  client = postgres(url, {
    max: maxConnections,
    idle_timeout: idleTimeout,
    connect_timeout: connectTimeout,
  });

  db = drizzle(client, { schema });

  return db;
}

/**
 * Get the database instance
 *
 * Returns the initialized database instance. Throws if not initialized.
 * Use this in application code after initialization.
 *
 * @returns The Drizzle database instance
 * @throws Error if database is not initialized
 *
 * @example
 * ```typescript
 * import { getDatabase } from '@context-engine/db';
 *
 * const db = getDatabase();
 * const users = await db.select().from(users);
 * ```
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error(
      'Database not initialized. Call initializeDatabase() first.'
    );
  }
  return db;
}

/**
 * Close the database connection
 *
 * Gracefully closes all connections in the pool.
 * Safe to call multiple times (idempotent).
 *
 * @example
 * ```typescript
 * import { closeDatabase } from '@context-engine/db';
 *
 * // On application shutdown
 * await closeDatabase();
 * ```
 */
export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}

/**
 * Check database health
 *
 * Performs a simple query to verify the database connection is working.
 * Returns true if healthy, false if the connection fails.
 *
 * @returns Promise resolving to health status
 *
 * @example
 * ```typescript
 * import { checkHealth } from '@context-engine/db';
 *
 * const isHealthy = await checkHealth();
 * if (!isHealthy) {
 *   console.error('Database connection failed');
 * }
 * ```
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const database = getDatabase();
    await database.execute('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
