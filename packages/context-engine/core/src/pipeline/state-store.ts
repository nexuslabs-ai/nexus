/**
 * Pipeline State Store Interface
 *
 * Defines the contract for pipeline state persistence.
 * Implementations can use file system, database, or other storage backends.
 */

import type {
  StoredExtraction,
  StoredGeneration,
  StoredManifest,
} from './types.js';

/**
 * Interface for pipeline state persistence.
 *
 * Storage is organized by component name (kebab-case).
 * Each component has up to 3 files:
 * - {component-name}.extraction.json
 * - {component-name}.generation.json
 * - {component-name}.manifest.json
 *
 * Implementations must handle:
 * - Thread-safe file operations
 * - Atomic writes (write to temp, then rename)
 * - Proper error handling for missing files
 *
 * @example
 * ```typescript
 * const store = new FileStateStore('./state');
 *
 * // Save extraction result
 * await store.saveExtraction('Button', extractionData);
 *
 * // Later, retrieve it
 * const extraction = await store.getExtraction('Button');
 * if (extraction) {
 *   // Use extraction to generate metadata
 * }
 * ```
 */
export interface IPipelineStateStore {
  // ===========================================================================
  // Extraction State
  // ===========================================================================

  /**
   * Save extraction state for a component
   *
   * @param componentName - Component name (will be converted to kebab-case)
   * @param data - Extraction data to persist
   */
  saveExtraction(componentName: string, data: StoredExtraction): Promise<void>;

  /**
   * Get stored extraction state for a component
   *
   * @param componentName - Component name (will be converted to kebab-case)
   * @returns Stored extraction or null if not found
   */
  getExtraction(componentName: string): Promise<StoredExtraction | null>;

  // ===========================================================================
  // Generation State
  // ===========================================================================

  /**
   * Save generation state for a component
   *
   * @param componentName - Component name (will be converted to kebab-case)
   * @param data - Generation data to persist
   */
  saveGeneration(componentName: string, data: StoredGeneration): Promise<void>;

  /**
   * Get stored generation state for a component
   *
   * @param componentName - Component name (will be converted to kebab-case)
   * @returns Stored generation or null if not found
   */
  getGeneration(componentName: string): Promise<StoredGeneration | null>;

  // ===========================================================================
  // Manifest State
  // ===========================================================================

  /**
   * Save manifest for a component
   *
   * @param componentName - Component name (will be converted to kebab-case)
   * @param data - Manifest data to persist
   */
  saveManifest(componentName: string, data: StoredManifest): Promise<void>;

  /**
   * Get stored manifest for a component
   *
   * @param componentName - Component name (will be converted to kebab-case)
   * @returns Stored manifest or null if not found
   */
  getManifest(componentName: string): Promise<StoredManifest | null>;

  // ===========================================================================
  // Cleanup Operations
  // ===========================================================================

  /**
   * Delete all stored state for a component
   *
   * Removes extraction, generation, and manifest files.
   *
   * @param componentName - Component name (will be converted to kebab-case)
   */
  delete(componentName: string): Promise<void>;

  /**
   * Delete all stored state for all components
   *
   * Clears the entire state directory.
   *
   * @returns Number of components deleted
   */
  deleteAll(): Promise<number>;

  // ===========================================================================
  // Query Operations
  // ===========================================================================

  /**
   * List all component names that have stored state
   *
   * @returns Array of component names (kebab-case)
   */
  list(): Promise<string[]>;

  /**
   * Check if a component has any stored state
   *
   * @param componentName - Component name (will be converted to kebab-case)
   * @returns True if any state exists for the component
   */
  exists(componentName: string): Promise<boolean>;
}
