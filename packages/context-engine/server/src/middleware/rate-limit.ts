/**
 * Rate Limit Middleware
 *
 * Two-layer rate limiting:
 * 1. **Pre-auth (IP-based):** Coarse protection before authentication (default 1000 req/min).
 * 2. **Post-auth (identity-based):** Per-tenant limits keyed on authenticated identity.
 */

import { getConnInfo } from '@hono/node-server/conninfo';
import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

import { type AuthContext, AuthKind } from '../auth/index.js';
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
// In-memory stores
// =============================================================================

/** Maps authenticated identity to their current rate limit entry. */
const identityStore = new Map<string, RateLimitEntry>();

/** Maps IP address to their current rate limit entry. */
const ipStore = new Map<string, RateLimitEntry>();

/**
 * Periodic cleanup for the identity-based store.
 * Removes expired entries every 5 minutes.
 */
export const identityCleanupInterval = setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of identityStore) {
      if (entry.resetAt < now) {
        identityStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

identityCleanupInterval.unref();

/**
 * Periodic cleanup for the IP-based store.
 * Removes expired entries every 5 minutes.
 */
export const ipCleanupInterval = setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of ipStore) {
      if (entry.resetAt < now) {
        ipStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

ipCleanupInterval.unref();

// =============================================================================
// Helpers
// =============================================================================

/**
 * Derive a rate limit key from the authenticated context.
 *
 * - Tenant: `tenant:{orgId}:{apiKeyId}`
 * - Platform: `platform`
 */
function getRateLimitKey(auth: AuthContext): string {
  if (auth.kind === AuthKind.Tenant) {
    return `tenant:${auth.orgId}:${auth.apiKeyId}`;
  }

  if (auth.kind === AuthKind.Platform) {
    return 'platform';
  }

  // Exhaustive check — should never reach here if AuthContext union is complete
  const _exhaustive: never = auth;
  return `unknown:${String(_exhaustive)}`;
}

/** Get the client IP from the TCP socket. Falls back to "unknown" if unavailable. */
function getSocketAddress(c: Context<AppEnv>): string {
  try {
    const info = getConnInfo(c);
    return info.remote.address ?? 'unknown';
  } catch {
    // Socket access may be unavailable in test environments
    return 'unknown';
  }
}

/** Check and increment the rate limit counter for a given key. */
function checkRateLimit(
  store: Map<string, RateLimitEntry>,
  key: string,
  windowMs: number,
  maxRequests: number,
  now: number
): { entry: RateLimitEntry; exceeded: boolean } {
  let entry = store.get(key);

  // Create new entry or reset if window has expired
  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    store.set(key, entry);
  }

  entry.count++;

  return {
    entry,
    exceeded: entry.count > maxRequests,
  };
}

// =============================================================================
// Pre-Auth Rate Limit Middleware (IP-based)
// =============================================================================

/** IP-based rate limiter that runs before authentication. */
export const preAuthRateLimitMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    const { preAuthRateLimitWindowMs, preAuthRateLimitMaxRequests } =
      getConfig();
    const ip = getSocketAddress(c);
    const now = Date.now();

    const { entry, exceeded } = checkRateLimit(
      ipStore,
      ip,
      preAuthRateLimitWindowMs,
      preAuthRateLimitMaxRequests,
      now
    );

    if (exceeded) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      c.header('Retry-After', String(retryAfterSeconds));
      throw rateLimited(retryAfterSeconds);
    }

    await next();
  }
);

// =============================================================================
// Post-Auth Rate Limit Middleware (identity-based)
// =============================================================================

/** Identity-based rate limiter that runs after authentication. Sets X-RateLimit-* response headers. */
export const rateLimitMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const { rateLimitWindowMs, rateLimitMaxRequests } = getConfig();
  const auth = c.var.auth;
  const key = getRateLimitKey(auth);
  const now = Date.now();

  const { entry, exceeded } = checkRateLimit(
    identityStore,
    key,
    rateLimitWindowMs,
    rateLimitMaxRequests,
    now
  );

  // Reject if over limit
  if (exceeded) {
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
