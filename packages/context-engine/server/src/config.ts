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
const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    AUTH_ENABLED: z.enum(['true', 'false']).default('false'),
    API_KEY_HASH_SECRET: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.AUTH_ENABLED === 'true' && !data.API_KEY_HASH_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'API_KEY_HASH_SECRET is required when AUTH_ENABLED is true',
        path: ['API_KEY_HASH_SECRET'],
      });
    } else if (
      data.AUTH_ENABLED === 'true' &&
      data.API_KEY_HASH_SECRET &&
      data.API_KEY_HASH_SECRET.length < 32
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'API_KEY_HASH_SECRET must be at least 32 characters (NIST SP 800-224)',
        path: ['API_KEY_HASH_SECRET'],
      });
    }

    if (
      data.NODE_ENV === Environment.Production &&
      data.AUTH_ENABLED !== 'true'
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'AUTH_ENABLED must be true in production',
        path: ['AUTH_ENABLED'],
      });
    }
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
 * Base server configuration shared across all auth modes
 */
interface BaseConfig {
  /** Server port */
  port: number;
  /** Runtime environment */
  environment: Environment;
  /** PostgreSQL connection string */
  databaseUrl: string;
}

/**
 * Configuration when authentication is disabled (dev mode)
 */
interface AuthDisabledConfig extends BaseConfig {
  authEnabled: false;
}

/**
 * Configuration when authentication is enabled (production)
 */
interface AuthEnabledConfig extends BaseConfig {
  authEnabled: true;
  /** Secret used to HMAC-hash API keys (>= 32 chars, per NIST SP 800-224) */
  apiKeyHashSecret: string;
}

/**
 * Server configuration — discriminated union keyed on `authEnabled`.
 *
 * When `authEnabled` is `true`, `apiKeyHashSecret` is guaranteed to be a string.
 * When `authEnabled` is `false`, `apiKeyHashSecret` does not exist on the type.
 */
export type ServerConfig = AuthDisabledConfig | AuthEnabledConfig;

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

  const base: BaseConfig = {
    port: result.data.PORT,
    environment: result.data.NODE_ENV,
    databaseUrl: result.data.DATABASE_URL,
  };

  if (result.data.AUTH_ENABLED === 'true') {
    return {
      ...base,
      authEnabled: true,
      apiKeyHashSecret: result.data.API_KEY_HASH_SECRET!,
    };
  }

  return { ...base, authEnabled: false };
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
