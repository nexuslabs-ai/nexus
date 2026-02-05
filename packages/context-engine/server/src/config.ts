/**
 * Server Configuration
 *
 * Loads configuration from environment variables.
 * Required variables must be set; optional ones have sensible defaults.
 */

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
 * Validate that a string is a valid environment
 */
function isValidEnvironment(value: string): value is Environment {
  return Object.values(Environment).includes(value as Environment);
}

/**
 * Load configuration from environment variables.
 *
 * @throws Error if required variables are missing
 * @returns ServerConfig object
 */
export function loadConfig(): ServerConfig {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const envValue = process.env.NODE_ENV || 'development';
  const environment = isValidEnvironment(envValue)
    ? envValue
    : Environment.Development;

  const portString = process.env.PORT || '3000';
  const port = parseInt(portString, 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${portString}. Must be 1-65535`);
  }

  return {
    port,
    environment,
    databaseUrl,
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
