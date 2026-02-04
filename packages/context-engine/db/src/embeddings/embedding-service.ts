/**
 * Embedding Service
 *
 * Handles embedding generation via Voyage AI for semantic search.
 * Uses voyage-code-3 model optimized for code understanding.
 */

import type { EmbeddingModelInfo } from '../types.js';

// =============================================================================
// Constants
// =============================================================================

const MODEL = 'voyage-code-3';
const DIMENSIONS = 1024;
const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';

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
 */
export class EmbeddingService {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Voyage API key is required');
    }
    this.apiKey = apiKey;
  }

  // ===========================================================================
  // Public Methods
  // ===========================================================================

  /**
   * Embed a single text (document).
   *
   * @param text - The text to embed
   * @returns The embedding vector
   */
  async embed(text: string): Promise<number[]> {
    const result = await this.embedBatch([text], 'document');
    if (result.length === 0) {
      throw new Error('Embedding service returned empty result');
    }
    return result[0];
  }

  /**
   * Embed multiple texts in batch.
   *
   * Automatically handles pagination for large batches by splitting into
   * chunks of BATCH_SIZE and processing sequentially.
   *
   * @param texts - Array of texts to embed
   * @param inputType - Type of input ('document' for indexing, 'query' for search)
   * @returns Array of embedding vectors in same order as input
   */
  async embedBatch(
    texts: string[],
    inputType: 'document' | 'query' = 'document'
  ): Promise<number[][]> {
    if (texts.length === 0) return [];

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
   * @param text - The query text to embed
   * @returns The embedding vector optimized for similarity search
   */
  async embedQuery(text: string): Promise<number[]> {
    const [embedding] = await this.embedBatch([text], 'query');
    return embedding;
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

  // ===========================================================================
  // Private Methods
  // ===========================================================================

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
          }),
        });

        if (!response.ok) {
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
          // Exponential backoff: 1s, 2s, 4s, ...
          await this.delay(Math.pow(2, attempt) * 1000);
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
