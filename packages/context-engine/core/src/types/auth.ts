/**
 * Authentication & Authorization Types
 *
 * Types for API key authentication, rate limiting, and permissions.
 */

import { z } from 'zod';

/**
 * API key prefix pattern
 * Format: ce_{env}_{random}
 * - ce: context engine
 * - env: live or test
 * - random: 32 random alphanumeric chars
 */
export const API_KEY_PREFIX = 'ce_';
export const API_KEY_PATTERN = /^ce_(live|test)_[a-zA-Z0-9]{32}$/;

/**
 * API key environment
 */
export const ApiKeyEnvironmentSchema = z.enum(['live', 'test']);

export type ApiKeyEnvironment = z.infer<typeof ApiKeyEnvironmentSchema>;

/**
 * API key schema
 */
export const ApiKeySchema = z.string().regex(API_KEY_PATTERN, {
  message: 'API key must be in format ce_{live|test}_{32chars}',
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

/**
 * Permission levels
 */
export const PermissionLevelSchema = z.enum([
  'read', // Can read components
  'write', // Can read and create/update components
  'admin', // Full access including delete and settings
]);

export type PermissionLevel = z.infer<typeof PermissionLevelSchema>;

/**
 * API key record (stored in database)
 */
export const ApiKeyRecordSchema = z.object({
  /** API key ID */
  id: z.uuid(),

  /** Organization this key belongs to */
  orgId: z.uuid(),

  /** Key environment */
  environment: ApiKeyEnvironmentSchema,

  /** Hashed API key (never store raw) */
  keyHash: z.string(),

  /** Key prefix for display (ce_live_xxx...xxx) */
  keyPrefix: z.string(),

  /** Human-readable name for this key */
  name: z.string().max(255),

  /** Permission level */
  permission: PermissionLevelSchema,

  /** Rate limit (requests per minute) */
  rateLimitRpm: z.number().int().positive().default(60),

  /** Last used timestamp */
  lastUsedAt: z.date().nullable(),

  /** Expiration date (null = never expires) */
  expiresAt: z.date().nullable(),

  /** Whether key is active */
  isActive: z.boolean().default(true),

  /** Created timestamp */
  createdAt: z.date(),

  /** Updated timestamp */
  updatedAt: z.date(),
});

export type ApiKeyRecord = z.infer<typeof ApiKeyRecordSchema>;

/**
 * Authenticated context (attached to requests)
 */
export const AuthContextSchema = z.object({
  /** Organization ID */
  orgId: z.uuid(),

  /** API key ID used for authentication */
  apiKeyId: z.uuid(),

  /** Key environment */
  environment: ApiKeyEnvironmentSchema,

  /** Permission level */
  permission: PermissionLevelSchema,

  /** Rate limit for this key */
  rateLimitRpm: z.number().int().positive(),
});

export type AuthContext = z.infer<typeof AuthContextSchema>;

/**
 * Rate limit info (returned in headers)
 */
export const RateLimitInfoSchema = z.object({
  /** Maximum requests per window */
  limit: z.number().int().positive(),

  /** Remaining requests in current window */
  remaining: z.number().int().min(0),

  /** When the current window resets (Unix timestamp) */
  reset: z.number().int(),
});

export type RateLimitInfo = z.infer<typeof RateLimitInfoSchema>;

/**
 * Rate limit status
 */
export const RateLimitStatusSchema = z.object({
  /** Whether the request is allowed */
  allowed: z.boolean(),

  /** Rate limit info */
  info: RateLimitInfoSchema,
});

export type RateLimitStatus = z.infer<typeof RateLimitStatusSchema>;

/**
 * Create API key input
 */
export const CreateApiKeyInputSchema = z.object({
  /** Human-readable name */
  name: z.string().min(1).max(255),

  /** Key environment */
  environment: ApiKeyEnvironmentSchema,

  /** Permission level */
  permission: PermissionLevelSchema.default('read'),

  /** Rate limit (requests per minute) */
  rateLimitRpm: z.number().int().positive().optional(),

  /** Expiration date (null = never expires) */
  expiresAt: z.date().nullable().optional(),
});

export type CreateApiKeyInput = z.infer<typeof CreateApiKeyInputSchema>;

/**
 * Create API key result (includes raw key - only returned once)
 */
export const CreateApiKeyResultSchema = z.object({
  /** API key ID */
  id: z.uuid(),

  /** Raw API key (only returned on creation) */
  key: ApiKeySchema,

  /** Human-readable name */
  name: z.string(),

  /** Key environment */
  environment: ApiKeyEnvironmentSchema,

  /** Permission level */
  permission: PermissionLevelSchema,

  /** Rate limit */
  rateLimitRpm: z.number().int().positive(),

  /** Expiration date */
  expiresAt: z.date().nullable(),

  /** Created timestamp */
  createdAt: z.date(),
});

export type CreateApiKeyResult = z.infer<typeof CreateApiKeyResultSchema>;

/**
 * API key summary (for listing - no sensitive data)
 */
export const ApiKeySummarySchema = z.object({
  /** API key ID */
  id: z.uuid(),

  /** Key prefix for identification */
  keyPrefix: z.string(),

  /** Human-readable name */
  name: z.string(),

  /** Key environment */
  environment: ApiKeyEnvironmentSchema,

  /** Permission level */
  permission: PermissionLevelSchema,

  /** Whether key is active */
  isActive: z.boolean(),

  /** Last used timestamp */
  lastUsedAt: z.date().nullable(),

  /** Expiration date */
  expiresAt: z.date().nullable(),

  /** Created timestamp */
  createdAt: z.date(),
});

export type ApiKeySummary = z.infer<typeof ApiKeySummarySchema>;
