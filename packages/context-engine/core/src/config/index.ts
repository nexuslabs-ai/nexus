/**
 * Configuration Module
 *
 * Centralized configuration management for Context Engine.
 * Reads from environment variables with sensible defaults.
 *
 * Environment variables can be set in:
 * - .env file (development)
 * - .env.local file (local overrides, not committed)
 * - System environment (production)
 *
 * For testing, use test-specific values in test/setup.ts
 * to ensure deterministic behavior.
 */

import {
  DEFAULT_ANTHROPIC_MODEL,
  DEFAULT_GEMINI_MODEL,
} from '../constants/models.js';

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get environment variable with optional default
 */
function getEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue;
}

/**
 * Get environment variable as number
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(
      `Invalid number for ${key}: "${value}", using default: ${defaultValue}`
    );
    return defaultValue;
  }
  return parsed;
}

/**
 * Get environment variable as boolean
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]?.toLowerCase();
  if (!value) return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
}

// =============================================================================
// Anthropic Configuration
// =============================================================================

/**
 * Anthropic provider configuration
 */
export interface AnthropicConfig {
  /** LLM API key (provider-agnostic, set via LLM_API_KEY) */
  apiKey: string | undefined;
  /** Model identifier */
  model: string;
  /** Maximum tokens for completion */
  maxTokens: number;
  /** Request timeout in milliseconds */
  timeoutMs: number;
  /** Base URL override (for proxies/custom endpoints) */
  baseUrl: string | undefined;
}

/**
 * Get Anthropic provider configuration from environment
 *
 * Model selection priority:
 * 1. ANTHROPIC_MODEL (provider-specific)
 * 2. CONTEXT_ENGINE_MODEL (generic fallback)
 * 3. Default: DEFAULT_ANTHROPIC_MODEL constant
 */
export function getAnthropicConfig(): AnthropicConfig {
  return {
    apiKey: getEnv('LLM_API_KEY'),
    model:
      getEnv('ANTHROPIC_MODEL') ??
      getEnv('CONTEXT_ENGINE_MODEL', DEFAULT_ANTHROPIC_MODEL)!,
    maxTokens: getEnvNumber('CONTEXT_ENGINE_MAX_TOKENS', 8192),
    timeoutMs: getEnvNumber('CONTEXT_ENGINE_TIMEOUT_MS', 180000),
    baseUrl: getEnv('ANTHROPIC_BASE_URL'),
  };
}

// =============================================================================
// Gemini Configuration
// =============================================================================

/**
 * Gemini provider configuration
 */
export interface GeminiConfig {
  /** LLM API key (provider-agnostic, set via LLM_API_KEY) */
  apiKey: string | undefined;
  /** Model identifier */
  model: string;
  /** Maximum tokens for completion */
  maxTokens: number;
  /** Request timeout in milliseconds */
  timeoutMs: number;
}

/**
 * Get Gemini configuration from environment
 *
 * Model selection priority:
 * 1. GEMINI_MODEL (provider-specific)
 * 2. CONTEXT_ENGINE_MODEL (generic fallback)
 * 3. Default: DEFAULT_GEMINI_MODEL constant
 */
export function getGeminiConfig(): GeminiConfig {
  return {
    apiKey: getEnv('LLM_API_KEY'),
    model:
      getEnv('GEMINI_MODEL') ??
      getEnv('CONTEXT_ENGINE_MODEL', DEFAULT_GEMINI_MODEL)!,
    maxTokens: getEnvNumber('CONTEXT_ENGINE_MAX_TOKENS', 8192),
    timeoutMs: getEnvNumber('CONTEXT_ENGINE_TIMEOUT_MS', 180000),
  };
}

// =============================================================================
// Generation Configuration
// =============================================================================

/**
 * Metadata generation configuration
 */
export interface GenerationConfig {
  /** Maximum tokens for meta generation */
  maxTokens: number;
  /** Minimum semantic description length */
  minSemanticDescriptionLength: number;
  /** Maximum semantic description length */
  maxSemanticDescriptionLength: number;
  /** Minimum component description length */
  minDescriptionLength: number;
  /** Maximum component description length */
  maxDescriptionLength: number;
}

/**
 * Get generation configuration from environment
 */
export function getGenerationConfig(): GenerationConfig {
  return {
    maxTokens: getEnvNumber('CONTEXT_ENGINE_GENERATION_MAX_TOKENS', 8192),
    minSemanticDescriptionLength: getEnvNumber(
      'CONTEXT_ENGINE_MIN_SEMANTIC_DESC_LENGTH',
      50
    ),
    maxSemanticDescriptionLength: getEnvNumber(
      'CONTEXT_ENGINE_MAX_SEMANTIC_DESC_LENGTH',
      2000
    ),
    minDescriptionLength: getEnvNumber('CONTEXT_ENGINE_MIN_DESC_LENGTH', 10),
    maxDescriptionLength: getEnvNumber('CONTEXT_ENGINE_MAX_DESC_LENGTH', 500),
  };
}

// =============================================================================
// Logger Configuration
// =============================================================================

/**
 * Valid log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger configuration
 */
export interface LoggerEnvConfig {
  /** Minimum log level */
  level: LogLevel;
  /** Output JSON format */
  json: boolean;
}

/**
 * Validate log level string
 */
function isValidLogLevel(value: string): value is LogLevel {
  return ['debug', 'info', 'warn', 'error'].includes(value);
}

/**
 * Get logger configuration from environment
 */
export function getLoggerConfig(): LoggerEnvConfig {
  const levelValue = getEnv('CONTEXT_ENGINE_LOG_LEVEL', 'info')!;
  const level: LogLevel = isValidLogLevel(levelValue) ? levelValue : 'info';

  const jsonDefault = process.env.NODE_ENV === 'production';
  const json = getEnvBoolean('CONTEXT_ENGINE_LOG_JSON', jsonDefault);

  return { level, json };
}

// =============================================================================
// Feature Flags
// =============================================================================

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  /** Enable debug mode */
  debug: boolean;
}

/**
 * Get feature flags from environment
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    debug: getEnvBoolean('CONTEXT_ENGINE_DEBUG', false),
  };
}
