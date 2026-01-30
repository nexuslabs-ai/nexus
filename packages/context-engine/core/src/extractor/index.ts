/**
 * Extractor Module
 *
 * Exports all extractor implementations and types for the
 * hybrid extraction system.
 */

import {
  HybridExtractor,
  type HybridExtractorOptions,
} from './hybrid-extractor.js';
import type { ExtractionInput, IExtractor } from './types.js';

export { CompositionExtractor } from './composition-extractor.js';
export { CompoundExtractor } from './compound-extractor.js';
export {
  DependencyExtractor,
  type DependencyExtractorOptions,
} from './dependency-extractor.js';
export * from './fallback-triggers.js';
export {
  HybridExtractor,
  type HybridExtractorOptions,
} from './hybrid-extractor.js';
export { RadixExtractor } from './radix-extractor.js';
export { ReactDocgenExtractor } from './react-docgen-extractor.js';
export * from './storybook/index.js';
export { TsMorphExtractor } from './ts-morph-extractor.js';
export * from './types.js';
export { VariantExtractor } from './variant-extractor.js';

/**
 * Supported frameworks for extraction
 */
const SUPPORTED_FRAMEWORKS = ['react'] as const;

/**
 * Factory function to create an extractor for a framework
 *
 * Creates a new extractor instance each time it's called. This is the
 * recommended way to get an extractor, as it allows passing custom options.
 *
 * @param framework - The framework to create an extractor for
 * @param options - Optional configuration for the extractor
 * @returns A new extractor instance
 * @throws Error if framework is not supported
 *
 * @example
 * ```typescript
 * // Basic usage
 * const extractor = getExtractor('react');
 *
 * // With options
 * const extractor = getExtractor('react', {
 *   pathAliases: { '@/*': ['./src/*'] },
 *   dependencies: ['react', '@radix-ui/react-slot'],
 * });
 * ```
 */
export function getExtractor(
  framework: string,
  options?: HybridExtractorOptions
): IExtractor {
  switch (framework) {
    case 'react':
      return new HybridExtractor(options);
    // Future: case 'vue': return new VueExtractor(options);
    // Future: case 'svelte': return new SvelteExtractor(options);
    default:
      throw new Error(
        `Unsupported framework: ${framework}. Supported: ${SUPPORTED_FRAMEWORKS.join(', ')}`
      );
  }
}

/**
 * Extract component data using the appropriate framework extractor
 *
 * Convenience function that selects the correct extractor based on
 * the framework specified in the input.
 */
export async function extractComponent(input: ExtractionInput) {
  const extractor = getExtractor(input.framework);
  return extractor.extract(input);
}
