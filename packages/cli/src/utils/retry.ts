import { Retrier } from '@humanwhocodes/retry';

/**
 * Default retry configuration for network operations
 *
 * Note: @humanwhocodes/retry uses a timeout-based approach rather than
 * maxAttempts. The library handles exponential backoff internally.
 */
export const DEFAULT_RETRY_CONFIG = {
  /** Total timeout in milliseconds before giving up */
  timeout: 30_000,
  /** Maximum concurrent retry operations */
  concurrency: 100,
} as const;

/**
 * Determine if an error is transient and should be retried
 *
 * @param error - The error to check
 * @returns true if the error is transient and the operation should be retried
 */
export function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('enotfound') ||
      message.includes('econnrefused') ||
      message.includes('socket hang up') ||
      message.includes('network')
    ) {
      return true;
    }

    // Check for error code property (common in Node.js errors)
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code) {
      const transientCodes = [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'ECONNREFUSED',
        'EPIPE',
        'ENETUNREACH',
        'EHOSTUNREACH',
        'EAI_AGAIN',
      ];
      if (transientCodes.includes(nodeError.code)) {
        return true;
      }
    }
  }

  // HTTP status codes that are retryable
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    const status = errorObj.status ?? errorObj.statusCode;

    if (typeof status === 'number') {
      // 429 Too Many Requests, 502/503/504 Server errors
      return (
        status === 429 || status === 502 || status === 503 || status === 504
      );
    }
  }

  return false;
}

export interface RetryConfig {
  /** Total timeout in milliseconds before giving up */
  timeout?: number;
  /** Maximum concurrent retry operations */
  concurrency?: number;
  /** Optional AbortSignal to cancel retries */
  signal?: AbortSignal;
}

/**
 * Create a retrier instance with the provided configuration
 *
 * @param config - Optional retry configuration
 * @returns A configured Retrier instance
 *
 * @example
 * ```typescript
 * const retrier = createRetrier({ timeout: 60_000 });
 * const result = await retrier.retry(() => fetchData());
 * ```
 */
export function createRetrier(
  config: Omit<RetryConfig, 'signal'> = {}
): Retrier {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  return new Retrier((error: unknown) => isTransientError(error), {
    timeout: mergedConfig.timeout,
    concurrency: mergedConfig.concurrency,
  });
}

/**
 * Execute a function with retry logic for transient errors
 *
 * Uses exponential backoff internally via @humanwhocodes/retry.
 * Only retries on transient network errors and specific HTTP status codes.
 *
 * @param fn - The async function to execute with retries
 * @param config - Optional retry configuration
 * @returns The result of the function
 * @throws The last error if all retries fail or a non-transient error occurs
 *
 * @example
 * ```typescript
 * // Basic usage
 * const data = await withRetry(() => fetchFromAPI());
 *
 * // With custom timeout
 * const data = await withRetry(() => fetchFromAPI(), { timeout: 60_000 });
 *
 * // With abort signal
 * const controller = new AbortController();
 * const data = await withRetry(() => fetchFromAPI(), { signal: controller.signal });
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { signal, ...retrierConfig } = config;
  const retrier = createRetrier(retrierConfig);

  return retrier.retry(fn, signal ? { signal } : undefined);
}
