/**
 * Server Configuration
 *
 * Loads configuration from environment variables with Zod validation.
 * Required variables must be set; optional ones have sensible defaults.
 */

import { z } from '@hono/zod-openapi';

/**
 * Environment variable schema with validation and coercion
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Runtime environment types
 */
export const Environment = {
  Development: 'development',
  Production: 'production',
  Test: 'test',
} as const;

export type Environment = (typeof Environment)[keyof typeof Environment];

/**
 * Server configuration interface
 */
export interface ServerConfig {
  /** Server port */
  port: number;
  /** Runtime environment */
  environment: Environment;
  /** PostgreSQL connection string */
  databaseUrl: string;
}

/**
 * Load configuration from environment variables.
 *
 * @throws Error if required variables are missing or invalid
 * @returns ServerConfig object
 */
export function loadConfig(): ServerConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Configuration error: ${errors}`);
  }

  return {
    port: result.data.PORT,
    environment: result.data.NODE_ENV,
    databaseUrl: result.data.DATABASE_URL,
  };
}

/**
 * Server configuration singleton
 *
 * Note: This is lazily initialized to allow tests to set env vars before loading.
 * Access via getConfig() for test-friendly usage.
 */
let _config: ServerConfig | null = null;

/**
 * Get server configuration (lazily loaded singleton)
 *
 * @throws Error if required environment variables are missing
 */
export function getConfig(): ServerConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

/**
 * Reset configuration singleton (for testing only)
 */
export function resetConfig(): void {
  _config = null;
}
