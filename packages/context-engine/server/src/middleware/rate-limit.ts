/**
 * Rate Limit Middleware
 *
 * Simple in-memory rate limiter using a fixed-window counter.
 * Limits requests per IP address within a configurable time window.
 *
 * Reads `rateLimitWindowMs` and `rateLimitMaxRequests` from server config.
 * Returns standard rate limit headers on every response and a `Retry-After`
 * header when the limit is exceeded.
 */

import { createMiddleware } from 'hono/factory';

import { getConfig } from '../config.js';
import { rateLimited } from '../errors.js';
import type { AppEnv } from '../types.js';

// =============================================================================
// Types
// =============================================================================

interface RateLimitEntry {
  /** Number of requests made in the current window */
  count: number;
  /** Timestamp (ms) when the current window resets */
  resetAt: number;
}

// =============================================================================
// In-memory store
// =============================================================================

/**
 * Maps client identifier (IP) to their current rate limit entry.
 *
 * Note: This store is process-local. In a multi-instance deployment,
 * each instance tracks limits independently. For shared state,
 * replace with Redis or similar.
 */
const store = new Map<string, RateLimitEntry>();

/** Interval handle for periodic cleanup (exported for test teardown) */
export const cleanupInterval = setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

// Allow the process to exit even if the interval is still active
cleanupInterval.unref();

// =============================================================================
// Helpers
// =============================================================================

/**
 * Derive a client identifier for rate limiting.
 *
 * Checks `X-Forwarded-For` first (for proxied environments), then
 * `X-Real-IP`, and falls back to `"unknown"` when neither is present.
 */
function getClientId(req: {
  header: (name: string) => string | undefined;
}): string {
  const forwarded = req.header('x-forwarded-for');
  if (forwarded) {
    // First IP in the chain is the original client
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.header('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

// =============================================================================
// Middleware
// =============================================================================

/**
 * Rate limit middleware.
 *
 * Applies a fixed-window counter per client IP. On every request:
 *
 * 1. Identifies the client by IP (via proxy headers or fallback).
 * 2. Increments the request count for the current window.
 * 3. If the limit is exceeded, throws a `rateLimited` error with `Retry-After`.
 * 4. Sets standard `X-RateLimit-*` headers on the response.
 *
 * Configuration is read from `getConfig()` on first invocation and cached
 * for the lifetime of the middleware.
 */
export const rateLimitMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const { rateLimitWindowMs, rateLimitMaxRequests } = getConfig();
  const clientId = getClientId(c.req);
  const now = Date.now();

  let entry = store.get(clientId);

  // Create new entry or reset if window has expired
  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 0,
      resetAt: now + rateLimitWindowMs,
    };
    store.set(clientId, entry);
  }

  entry.count++;

  // Reject if over limit
  if (entry.count > rateLimitMaxRequests) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    c.header('Retry-After', String(retryAfterSeconds));
    c.header('X-RateLimit-Limit', String(rateLimitMaxRequests));
    c.header('X-RateLimit-Remaining', '0');
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
    throw rateLimited(retryAfterSeconds);
  }

  // Set rate limit info headers
  c.header('X-RateLimit-Limit', String(rateLimitMaxRequests));
  c.header('X-RateLimit-Remaining', String(rateLimitMaxRequests - entry.count));
  c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

  await next();
});
