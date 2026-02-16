/**
 * MCP Session Store
 *
 * In-memory session storage with TTL-based cleanup and per-org limits.
 * Manages stateful MCP sessions with automatic eviction and lifecycle management.
 *
 * Architecture:
 * - Always-on: No conditional logic, sessions always enabled
 * - TTL cleanup: Automatic expiration via setInterval
 * - Per-org limits: LRU eviction when org reaches max sessions
 * - Thread-safe: JavaScript single-threaded, no locking needed
 * - Config: Uses centralized config from config.ts (no constructor params)
 *
 * Lifecycle:
 * - Created on server startup
 * - Cleaned up via interval (every 60s by default)
 * - Destroyed on server shutdown
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { getConfig } from '../config.js';

// =============================================================================
// Helpers
// =============================================================================

/**
 * Safely close a transport, logging any errors.
 *
 * Transport cleanup is non-fatal: the session is removed from
 * the store regardless of whether close() succeeds. Errors are
 * logged for observability but don't propagate because:
 *
 * 1. Cleanup errors are infrastructure concerns, not business logic
 * 2. They happen outside Hono's request lifecycle (can't use app.onError)
 * 3. Propagating would crash background timers (cleanup interval)
 * 4. The operation succeeded - session IS removed
 *
 * @param transport - The transport to close
 * @param context - Human-readable context for error logging
 */
function safeCloseTransport(
  transport: StreamableHTTPServerTransport,
  context: string
): void {
  try {
    transport.close();
  } catch (error) {
    console.error(`Transport cleanup failed (${context}):`, error);
  }
}

// =============================================================================
// Types
// =============================================================================

/**
 * Stored session entry.
 */
export interface SessionEntry {
  /**
   * MCP transport for this session.
   * Handles SSE streaming and request/response lifecycle.
   */
  transport: StreamableHTTPServerTransport;

  /**
   * MCP server instance bound to this session.
   * Pre-configured with tools and resources for the org.
   */
  server: McpServer;

  /**
   * Organization this session belongs to.
   * Used for per-org limit enforcement and ownership verification.
   */
  orgId: string;

  /**
   * Session creation timestamp (Date.now()).
   */
  createdAt: number;

  /**
   * Last access timestamp (Date.now()).
   * Updated on every get(). Used for LRU eviction and TTL.
   */
  lastAccessedAt: number;
}

// =============================================================================
// Session Store
// =============================================================================

/**
 * Cleanup interval for TTL-based session expiration (1 minute).
 */
const CLEANUP_INTERVAL_MS = 60_000;

/**
 * In-memory session store with TTL cleanup and per-org limits.
 *
 * Configuration is loaded from centralized config (config.ts):
 * - MCP_SESSION_TTL → Session TTL
 * - MCP_MAX_SESSIONS_PER_ORG → Per-org limit
 *
 * Lifecycle:
 * ```typescript
 * const store = new SessionStore();
 * store.set(sessionId, { transport, server, orgId, createdAt, lastAccessedAt });
 * const entry = store.get(sessionId); // Updates lastAccessedAt
 * store.delete(sessionId); // Manual cleanup
 * await store.closeAll(); // Graceful shutdown
 * store.destroy(); // Stop cleanup interval
 * ```
 *
 * Per-org limit enforcement:
 * - When set() is called and org has maxSessionsPerOrg sessions,
 *   evict the session with the oldest lastAccessedAt (LRU).
 * - Evicted session's transport.close() is called before deletion.
 *
 * TTL cleanup:
 * - setInterval runs every 60s.
 * - For each session where Date.now() - lastAccessedAt > ttlMs,
 *   call transport.close() and delete from store.
 *
 * Thread safety:
 * - JavaScript is single-threaded, no locking needed.
 * - setInterval and request handlers never run concurrently.
 */
export class SessionStore {
  private readonly sessions = new Map<string, SessionEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start TTL cleanup interval
    this.cleanupInterval = setInterval(
      () => this.cleanup(),
      CLEANUP_INTERVAL_MS
    );
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Store a session.
   *
   * If the org already has maxSessionsPerOrg sessions, evicts the oldest
   * (by lastAccessedAt) before adding the new session.
   *
   * @param sessionId - Unique session identifier (UUID)
   * @param entry - Session entry with transport, server, and metadata
   */
  set(sessionId: string, entry: SessionEntry): void {
    const config = getConfig();

    // Check per-org limit
    const orgSessions = this.getByOrg(entry.orgId);

    if (orgSessions.length >= config.mcpMaxSessionsPerOrg) {
      // Find oldest session for this org (LRU eviction)
      let oldestSessionId: string | null = null;
      let oldestAccessTime = Infinity;

      for (const [sid, sessEntry] of this.sessions.entries()) {
        if (
          sessEntry.orgId === entry.orgId &&
          sessEntry.lastAccessedAt < oldestAccessTime
        ) {
          oldestAccessTime = sessEntry.lastAccessedAt;
          oldestSessionId = sid;
        }
      }

      // Evict oldest session
      if (oldestSessionId) {
        const oldestSession = this.sessions.get(oldestSessionId);
        if (oldestSession) {
          safeCloseTransport(
            oldestSession.transport,
            `LRU eviction ${oldestSessionId}`
          );
          this.sessions.delete(oldestSessionId);
        }
      }
    }

    // Store new session
    this.sessions.set(sessionId, entry);
  }

  /**
   * Retrieve a session and update its lastAccessedAt.
   *
   * Returns undefined if session not found or expired.
   *
   * @param sessionId - Session identifier
   * @returns Session entry or undefined
   */
  get(sessionId: string): SessionEntry | undefined {
    const config = getConfig();
    const entry = this.sessions.get(sessionId);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    const now = Date.now();
    const age = now - entry.lastAccessedAt;

    if (age > config.mcpSessionTtl) {
      // Expired - clean up and return undefined
      safeCloseTransport(entry.transport, `TTL expiry ${sessionId}`);
      this.sessions.delete(sessionId);
      return undefined;
    }

    // Update last access time
    entry.lastAccessedAt = now;

    return entry;
  }

  /**
   * Delete a session.
   *
   * Calls transport.close() before removal.
   *
   * @param sessionId - Session identifier
   * @returns true if session existed, false otherwise
   */
  delete(sessionId: string): boolean {
    const entry = this.sessions.get(sessionId);

    if (!entry) {
      return false;
    }

    safeCloseTransport(entry.transport, `explicit delete ${sessionId}`);
    this.sessions.delete(sessionId);
    return true;
  }

  /**
   * Get all active sessions for an organization.
   *
   * Used for per-org limit enforcement.
   *
   * @param orgId - Organization identifier
   * @returns Array of session entries for the org
   */
  getByOrg(orgId: string): SessionEntry[] {
    const orgSessions: SessionEntry[] = [];

    for (const entry of this.sessions.values()) {
      if (entry.orgId === orgId) {
        orgSessions.push(entry);
      }
    }

    return orgSessions;
  }

  /**
   * Remove expired sessions (TTL cleanup).
   *
   * Called automatically via setInterval.
   * Can also be called manually for testing.
   */
  cleanup(): void {
    const config = getConfig();
    const now = Date.now();
    const expiredSessions: string[] = [];

    // Find expired sessions
    for (const [sessionId, entry] of this.sessions.entries()) {
      const age = now - entry.lastAccessedAt;
      if (age > config.mcpSessionTtl) {
        expiredSessions.push(sessionId);
      }
    }

    // Close and delete expired sessions
    for (const sessionId of expiredSessions) {
      const entry = this.sessions.get(sessionId);
      if (entry) {
        safeCloseTransport(entry.transport, `background cleanup ${sessionId}`);
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Close all sessions (graceful shutdown).
   *
   * Calls transport.close() for each session and clears the store.
   * Use this during server shutdown.
   */
  async closeAll(): Promise<void> {
    for (const [sessionId, entry] of this.sessions.entries()) {
      safeCloseTransport(entry.transport, `graceful shutdown ${sessionId}`);
    }

    this.sessions.clear();
  }

  /**
   * Get total active session count across all orgs.
   *
   * @returns Number of active sessions
   */
  size(): number {
    return this.sessions.size;
  }

  /**
   * Stop the cleanup interval and prepare for destruction.
   *
   * Call this during server shutdown after closeAll().
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
