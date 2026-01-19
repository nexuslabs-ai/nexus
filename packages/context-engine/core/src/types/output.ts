/**
 * Output Types
 *
 * Shared discriminant constants for operation results across the Context Engine.
 * Uses the `as const` pattern for type-safe string literals.
 *
 * Note: Extractor module extends this with 'conflict' for optimistic locking.
 */

/**
 * Base output type discriminant for success/failure operations
 *
 * Used by:
 * - generator/types.ts (GenerationOutputType)
 * - manifest/types.ts (ManifestBuildOutputType)
 * - processor/types.ts (ProcessorOutputType)
 *
 * Note: Extractor uses ExtractionOutputType which adds 'conflict' for optimistic locking.
 */
export const OutputType = {
  Success: 'success',
  Failure: 'failure',
} as const;

export type OutputType = (typeof OutputType)[keyof typeof OutputType];
