/**
 * Embedding Service
 *
 * Handles embedding generation via Voyage AI for semantic search.
 * Uses voyage-code-3 model optimized for code understanding.
 *
 * Includes LRU cache for document embeddings to reduce API costs and latency.
 */

import { createHash } from 'node:crypto';

import type { EmbeddingModelInfo } from '../types.js';

// =============================================================================
// Constants
// =============================================================================

const MODEL = 'voyage-code-3';
const DIMENSIONS = 1024;
const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const CACHE_MAX_SIZE = 1000;

// =============================================================================
// Types
// =============================================================================

/**
 * Voyage AI API response shape
 */
interface VoyageAPIResponse {
  data: Array<{ embedding: number[] }>;
}

// =============================================================================
// Embedding Service
// =============================================================================

/**
 * Service for generating embeddings via Voyage AI.
 *
 * Supports single document embedding, batch embedding with automatic pagination,
 * and query-optimized embedding for search queries.
 *
 * Includes LRU cache for document embeddings:
 * - Cache key: SHA-256 hash of input text
 * - Max size: 1000 entries
 * - Eviction: Least recently used (Map insertion order)
 * - Scope: Document embeddings only (queries use different optimization)
 */
export class EmbeddingService {
  private apiKey: string;
  private cache: Map<string, number[]>;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Voyage API key is required');
    }
    this.apiKey = apiKey;
    this.cache = new Map();
  }

  // ===========================================================================
  // Public Methods
  // ===========================================================================

  /**
   * Embed multiple texts in batch (documents only).
   *
   * Automatically handles pagination for large batches by splitting into
   * chunks of BATCH_SIZE and processing sequentially.
   *
   * Uses LRU cache to reduce API costs and latency. For query embeddings,
   * use embedQuery() instead (different optimization strategy).
   *
   * @param texts - Array of texts to embed
   * @returns Array of embedding vectors in same order as input
   * @throws Error if embedding generation fails for any text
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    // Initialize results array with proper length to catch gaps early
    const results: Array<number[] | undefined> = new Array(texts.length);
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];

    // Check cache for each text
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const cacheKey = this.getCacheKey(text);
      const cached = this.cache.get(cacheKey);

      if (cached) {
        // Cache hit - use cached embedding and refresh LRU position
        this.cache.delete(cacheKey);
        this.cache.set(cacheKey, cached);
        results[i] = cached;
      } else {
        // Cache miss - need to fetch
        uncachedTexts.push(text);
        uncachedIndices.push(i);
      }
    }

    // Fetch uncached embeddings
    if (uncachedTexts.length > 0) {
      const embeddings = await this.embedBatchUncached(
        uncachedTexts,
        'document'
      );

      // Store in cache and results
      for (let i = 0; i < embeddings.length; i++) {
        const text = uncachedTexts[i];
        const embedding = embeddings[i];
        const resultIndex = uncachedIndices[i];

        this.setCached(text, embedding);
        results[resultIndex] = embedding;
      }
    }

    // Validate no holes remain - catches incomplete embedding generation
    if (results.some((r) => r === undefined)) {
      throw new Error(
        'Failed to generate embeddings for all texts: some results are undefined'
      );
    }

    // Safe to cast after validation - all elements guaranteed to be number[]
    return results as number[][];
  }

  /**
   * Embed batch without cache (internal).
   *
   * @param texts - Texts to embed
   * @param inputType - Document or query
   * @returns Embeddings
   */
  private async embedBatchUncached(
    texts: string[],
    inputType: 'document' | 'query'
  ): Promise<number[][]> {
    const results: number[][] = [];

    // Process in batches
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const embeddings = await this.callVoyageAPI(batch, inputType);
      results.push(...embeddings);
    }

    return results;
  }

  /**
   * Embed a query (uses query-specific optimization).
   *
   * Voyage AI optimizes embeddings differently for queries vs documents.
   * Use this for search queries to get better retrieval results.
   *
   * Query embeddings bypass cache (low hit rate, different optimization).
   *
   * @param text - The query text to embed
   * @returns The embedding vector optimized for similarity search
   */
  async embedQuery(text: string): Promise<number[]> {
    const result = await this.embedBatchUncached([text], 'query');
    if (result.length === 0) {
      throw new Error('Embedding service returned empty result for query');
    }
    return result[0];
  }

  /**
   * Get model info for storage.
   *
   * Returns metadata about the embedding model for tracking which model
   * was used to generate embeddings.
   */
  get modelInfo(): EmbeddingModelInfo {
    return {
      provider: 'voyage',
      model: MODEL,
      dimensions: DIMENSIONS,
    };
  }

  /**
   * Get embedding dimensions.
   *
   * Returns the dimension size of vectors produced by this model.
   */
  get dimensions(): number {
    return DIMENSIONS;
  }

  /**
   * Get cache statistics.
   *
   * @returns Cache size and hit rate info
   */
  get cacheStats() {
    return {
      size: this.cache.size,
      maxSize: CACHE_MAX_SIZE,
    };
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Generate cache key from text using SHA-256.
   *
   * @param text - Input text
   * @returns Cache key (hex string)
   */
  private getCacheKey(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  /**
   * Set cached embedding with LRU eviction.
   *
   * @param text - Input text
   * @param embedding - Embedding vector
   */
  private setCached(text: string, embedding: number[]): void {
    const cacheKey = this.getCacheKey(text);

    // Evict oldest entry if cache is full (LRU via Map insertion order)
    if (this.cache.size >= CACHE_MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      // Safe assertion: if size >= CACHE_MAX_SIZE, there's always a first key
      this.cache.delete(firstKey!);
    }

    this.cache.set(cacheKey, embedding);
  }

  /**
   * Call Voyage AI API with retry logic and exponential backoff.
   */
  private async callVoyageAPI(
    texts: string[],
    inputType: 'document' | 'query'
  ): Promise<number[][]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(VOYAGE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: MODEL,
            input: texts,
            input_type: inputType,
            output_dimension: DIMENSIONS,
          }),
        });

        if (!response.ok) {
          // Handle rate limiting with Retry-After header
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter
              ? parseInt(retryAfter, 10) * 1000
              : 5000;
            await this.delay(waitTime);
            continue; // Retry immediately after waiting
          }

          const errorText = await response.text();
          throw new Error(
            `Voyage API error (${response.status}): ${errorText}`
          );
        }

        const data = (await response.json()) as VoyageAPIResponse;

        return data.data.map((d) => d.embedding);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < MAX_RETRIES - 1) {
          // Exponential backoff with jitter to prevent thundering herd
          const baseDelay = Math.pow(2, attempt) * 1000;
          const jitter = Math.random() * 500;
          await this.delay(baseDelay + jitter);
        }
      }
    }

    throw lastError ?? new Error('All embedding attempts failed');
  }

  /**
   * Delay helper for exponential backoff.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create embedding service from environment.
 *
 * Reads VOYAGE_API_KEY from environment variables.
 * Throws if the environment variable is not set.
 *
 * @returns Configured EmbeddingService instance
 */
export function createEmbeddingServiceFromEnv(): EmbeddingService {
  const apiKey = process.env.VOYAGE_API_KEY;

  if (!apiKey) {
    throw new Error('VOYAGE_API_KEY environment variable is required');
  }

  return new EmbeddingService(apiKey);
}
