/**
 * Server Configuration
 *
 * Loads configuration from environment variables with Zod validation.
 * Auth is always enabled — both API_KEY_HASH_SECRET and CE_PLATFORM_TOKEN
 * are required in all environments.
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
  SERVER_LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error', 'silent'])
    .default('info'),
  API_KEY_HASH_SECRET: z
    .string()
    .min(
      32,
      'API_KEY_HASH_SECRET must be at least 32 characters (NIST SP 800-224)'
    ),
  CE_PLATFORM_TOKEN: z
    .string()
    .min(32, 'CE_PLATFORM_TOKEN must be at least 32 characters')
    .startsWith('cep_', 'CE_PLATFORM_TOKEN must start with "cep_" prefix'),

  // MCP Gateway
  MCP_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),

  // Post-auth rate limiting (identity-based, per API key)
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Pre-auth rate limiting (IP-based, DDoS protection)
  PRE_AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  PRE_AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(1000),
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
 * Server configuration.
 *
 * Auth is always enabled. The platform token (`CE_PLATFORM_TOKEN`) handles
 * admin operations, and tenant API keys (`ce_`) handle tenant operations.
 * Both `apiKeyHashSecret` and `platformToken` are required in all environments.
 */
export interface ServerConfig {
  /** Server port */
  port: number;
  /** Runtime environment */
  environment: Environment;
  /** PostgreSQL connection string */
  databaseUrl: string;
  /** Server log level */
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  /** Secret used to HMAC-hash API keys (>= 32 chars, per NIST SP 800-224) */
  apiKeyHashSecret: string;
  /** Platform token for internal service authentication (must start with "cep_") */
  platformToken: string;
  /** Enable MCP gateway endpoint at POST /mcp @default false */
  mcpEnabled: boolean;
  /** Post-auth rate limit window duration in milliseconds @default 60000 */
  rateLimitWindowMs: number;
  /** Maximum requests allowed per post-auth rate limit window @default 100 */
  rateLimitMaxRequests: number;
  /** Pre-auth (IP-based) rate limit window duration in milliseconds @default 60000 */
  preAuthRateLimitWindowMs: number;
  /** Maximum requests allowed per pre-auth rate limit window @default 1000 */
  preAuthRateLimitMaxRequests: number;
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
    logLevel: result.data.SERVER_LOG_LEVEL,
    apiKeyHashSecret: result.data.API_KEY_HASH_SECRET,
    platformToken: result.data.CE_PLATFORM_TOKEN,
    mcpEnabled: result.data.MCP_ENABLED,
    rateLimitWindowMs: result.data.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: result.data.RATE_LIMIT_MAX_REQUESTS,
    preAuthRateLimitWindowMs: result.data.PRE_AUTH_RATE_LIMIT_WINDOW_MS,
    preAuthRateLimitMaxRequests: result.data.PRE_AUTH_RATE_LIMIT_MAX_REQUESTS,
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
