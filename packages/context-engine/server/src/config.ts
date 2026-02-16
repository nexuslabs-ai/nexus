/**
 * Server Configuration
 *
 * Loads configuration from environment variables with Zod validation.
 * Auth is always enabled — both API_KEY_HASH_SECRET and CE_PLATFORM_TOKEN
 * are required in all environments.
 */

import { z } from '@hono/zod-openapi';

import { parseAllowedOrigins } from './cors/cors-config.js';

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
 * MCP-specific CORS modes
 */
export const McpCorsMode = {
  /** No browser access (server-to-server only) */
  Disabled: 'DISABLED',
  /** Use CORS_ALLOWED_ORIGINS allowlist */
  Restricted: 'RESTRICTED',
  /** Allow all origins (development only) */
  Permissive: 'PERMISSIVE',
} as const;

export type McpCorsMode = (typeof McpCorsMode)[keyof typeof McpCorsMode];

/**
 * Environment variable schema with validation and coercion
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z
    .enum([Environment.Development, Environment.Production, Environment.Test])
    .default(Environment.Development),
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

  // Post-auth rate limiting (identity-based, per API key)
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Pre-auth rate limiting (IP-based, DDoS protection)
  PRE_AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  PRE_AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(1000),

  // Background embedding processor
  EMBEDDING_PROCESSOR_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),
  EMBEDDING_PROCESSOR_INTERVAL: z.coerce.number().min(1000).default(5000),
  EMBEDDING_PROCESSOR_BATCH_SIZE: z.coerce.number().min(1).max(100).default(5),

  // CORS configuration
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('*')
    .describe(
      'Comma-separated list of allowed origins. Use "*" for dev only, "NONE" to disable browser CORS, or specific domains for production.'
    ),
  MCP_CORS_MODE: z
    .enum([
      McpCorsMode.Disabled,
      McpCorsMode.Restricted,
      McpCorsMode.Permissive,
    ])
    .default(McpCorsMode.Permissive)
    .describe(
      'MCP CORS policy: DISABLED=no browser access (server-to-server only), RESTRICTED=use CORS_ALLOWED_ORIGINS, PERMISSIVE=allow all (dev only)'
    ),

  // MCP stateful session configuration (always-on)
  MCP_SESSION_TTL: z.coerce
    .number()
    .min(60_000)
    .default(3_600_000)
    .describe('Session TTL in milliseconds (default: 1 hour)'),
  MCP_MAX_SESSIONS_PER_ORG: z.coerce
    .number()
    .min(1)
    .default(10)
    .describe('Maximum concurrent sessions per organization'),
});

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
  /** Post-auth rate limit window duration in milliseconds @default 60000 */
  rateLimitWindowMs: number;
  /** Maximum requests allowed per post-auth rate limit window @default 100 */
  rateLimitMaxRequests: number;
  /** Pre-auth (IP-based) rate limit window duration in milliseconds @default 60000 */
  preAuthRateLimitWindowMs: number;
  /** Maximum requests allowed per pre-auth rate limit window @default 1000 */
  preAuthRateLimitMaxRequests: number;
  /** Allowed CORS origins (parsed from comma-separated string) */
  corsAllowedOrigins: string[];
  /** MCP-specific CORS mode */
  mcpCorsMode: McpCorsMode;
  /** Enable background embedding processor @default false */
  embeddingProcessorEnabled: boolean;
  /** Embedding processor polling interval in milliseconds @default 5000 */
  embeddingProcessorInterval: number;
  /** Embedding processor batch size (components per cycle) @default 5 */
  embeddingProcessorBatchSize: number;
  /** MCP session TTL in milliseconds @default 3600000 (1 hour) */
  mcpSessionTtl: number;
  /** Maximum concurrent sessions per organization @default 10 */
  mcpMaxSessionsPerOrg: number;
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
    rateLimitWindowMs: result.data.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: result.data.RATE_LIMIT_MAX_REQUESTS,
    preAuthRateLimitWindowMs: result.data.PRE_AUTH_RATE_LIMIT_WINDOW_MS,
    preAuthRateLimitMaxRequests: result.data.PRE_AUTH_RATE_LIMIT_MAX_REQUESTS,
    corsAllowedOrigins: parseAllowedOrigins(result.data.CORS_ALLOWED_ORIGINS),
    mcpCorsMode: result.data.MCP_CORS_MODE,
    embeddingProcessorEnabled: result.data.EMBEDDING_PROCESSOR_ENABLED,
    embeddingProcessorInterval: result.data.EMBEDDING_PROCESSOR_INTERVAL,
    embeddingProcessorBatchSize: result.data.EMBEDDING_PROCESSOR_BATCH_SIZE,
    mcpSessionTtl: result.data.MCP_SESSION_TTL,
    mcpMaxSessionsPerOrg: result.data.MCP_MAX_SESSIONS_PER_ORG,
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
