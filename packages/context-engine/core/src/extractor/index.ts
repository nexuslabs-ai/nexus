/**
 * Extractor Module
 *
 * Exports all extractor implementations and types for the
 * hybrid extraction system.
 */

import { HybridExtractor } from './hybrid-extractor.js';
import type { ExtractionInput, IExtractor } from './types.js';

export {
  createCompoundDetector,
  detectCompoundComponent,
  inferDataSlot,
} from './compound-detector.js';
export { DependencyExtractor } from './dependency-extractor.js';
export * from './fallback-triggers.js';
export { HybridExtractor } from './hybrid-extractor.js';
export { ReactDocgenExtractor } from './react-docgen-extractor.js';
export * from './storybook/index.js';
export { TsMorphExtractor } from './ts-morph-extractor.js';
export * from './types.js';
export { VariantExtractor } from './variant-extractor.js';

/**
 * Singleton extractors per framework
 *
 * Currently only React is supported. Future frameworks (Vue, Svelte, Angular)
 * will have their own extractor implementations.
 */
const extractors: Record<string, IExtractor> = {
  react: new HybridExtractor(),
  // Future: vue, svelte, angular extractors
};

/**
 * Get extractor for a framework
 *
 * @throws Error if framework is not supported
 */
export function getExtractor(framework: string): IExtractor {
  const extractor = extractors[framework];
  if (!extractor) {
    throw new Error(
      `Unsupported framework: ${framework}. Supported: ${Object.keys(extractors).join(', ')}`
    );
  }
  return extractor;
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
