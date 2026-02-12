/**
 * Embedding Processor Service
 *
 * Background service that automatically indexes pending components.
 * Polls for components with embeddingStatus = 'pending' and generates
 * embeddings using the EmbeddingRepository.
 *
 * Uses fair queuing to prevent any single organization from monopolizing
 * the processor ("noisy neighbor" prevention).
 *
 * Lifecycle:
 * - start(): Begin polling loop
 * - stop(): Stop polling gracefully
 */

import type {
  ComponentRepository,
  EmbeddingRepository,
} from '@context-engine/db';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Configuration for EmbeddingProcessor.
 *
 * Accepts repository factory functions to avoid holding database
 * references and allow fresh instances per cycle.
 */
export interface ProcessorConfig {
  /** Poll interval in milliseconds */
  intervalMs: number;
  /** Maximum components to process per cycle */
  batchSize: number;
  /** Factory for creating ComponentRepository instances */
  createComponentRepo: () => ComponentRepository;
  /** Factory for creating EmbeddingRepository instances (may return null if VOYAGE_API_KEY not set) */
  createEmbeddingRepo: () => EmbeddingRepository | null;
}

// =============================================================================
// Service
// =============================================================================

/**
 * Background service for automatic embedding indexing.
 *
 * Polls the database for pending components and generates embeddings
 * in batches. Uses fair queuing to distribute processing across
 * organizations evenly.
 *
 * Graceful degradation: If VOYAGE_API_KEY is not configured, the
 * processor won't start and logs a warning.
 *
 * @example
 * ```typescript
 * const processor = new EmbeddingProcessor({
 *   intervalMs: 5000,
 *   batchSize: 5,
 *   createComponentRepo,
 *   createEmbeddingRepo,
 * });
 *
 * processor.start();
 *
 * // Later, on shutdown:
 * processor.stop();
 * ```
 */
export class EmbeddingProcessor {
  private intervalId: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private config: ProcessorConfig) {}

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Start the background processor.
   *
   * Validates that VOYAGE_API_KEY is configured before starting.
   * If not configured, logs a warning and does not start.
   *
   * Idempotent: Multiple calls to start() have no effect if already running.
   */
  start(): void {
    if (this.running) return;

    // Validate that embedding repository can be created
    try {
      const embeddingRepo = this.config.createEmbeddingRepo();
      if (!embeddingRepo) {
        console.log(
          '[EmbeddingProcessor] Cannot start: VOYAGE_API_KEY not configured'
        );
        return;
      }
    } catch (_error) {
      console.log(
        '[EmbeddingProcessor] Cannot start: VOYAGE_API_KEY not configured'
      );
      return;
    }

    this.running = true;
    this.intervalId = setInterval(
      () => this.processCycle(),
      this.config.intervalMs
    );
    console.log(
      `[EmbeddingProcessor] Started (interval: ${this.config.intervalMs}ms, batch: ${this.config.batchSize})`
    );
  }

  /**
   * Stop the background processor.
   *
   * Stops polling immediately. Does not wait for current cycle to complete.
   * Idempotent: Multiple calls to stop() have no effect if already stopped.
   */
  stop(): void {
    if (!this.running) return;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.running = false;
    console.log('[EmbeddingProcessor] Stopped');
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Process a single cycle: find pending components and index them.
   */
  private async processCycle(): Promise<void> {
    try {
      // Create fresh repository instances
      const componentRepo = this.config.createComponentRepo();
      const embeddingRepo = this.config.createEmbeddingRepo();

      if (!embeddingRepo) {
        // VOYAGE_API_KEY removed after start - stop processor
        console.log(
          '[EmbeddingProcessor] VOYAGE_API_KEY no longer available, stopping'
        );
        this.stop();
        return;
      }

      // Find pending components using fair queuing
      // Query pre-filters to only return components with manifests
      const pending = await componentRepo.findAllPendingFair(
        this.config.batchSize
      );

      if (pending.length === 0) {
        // No pending components - silent return (avoid log spam)
        return;
      }

      console.log(
        `[EmbeddingProcessor] Processing ${pending.length} pending components`
      );

      let succeeded = 0;
      let failed = 0;

      // Process each component
      for (const component of pending) {
        try {
          await embeddingRepo.index(
            component.orgId,
            component.id,
            component.manifest!
          );
          succeeded++;
        } catch (error) {
          failed++;
          console.error(
            `[EmbeddingProcessor] Failed to index ${component.id}:`,
            error
          );
        }
      }

      console.log(
        `[EmbeddingProcessor] Cycle complete: ${succeeded} indexed, ${failed} failed`
      );
    } catch (error) {
      console.error('[EmbeddingProcessor] Cycle error:', error);
    }
  }
}
