/**
 * File-based Pipeline State Store
 *
 * Stores pipeline state as JSON files in a configurable directory.
 * Files are stored with naming convention:
 * {component-name-in-kebab-case}.{type}.json
 */

import {
  mkdir,
  readdir,
  readFile,
  rm,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';

import { kebabCase } from '../utils/case.js';

import type {
  StoredExtraction,
  StoredGeneration,
  StoredManifest,
} from './types.js';

// =============================================================================
// Constants
// =============================================================================

/** Default directory for state storage */
const DEFAULT_STATE_DIR = '.ce-state';

/** Environment variable for custom state directory */
const STATE_DIR_ENV = 'CE_STATE_DIR';

/** State phase constants */
const PHASE_EXTRACTION = 'extraction' as const;
const PHASE_GENERATION = 'generation' as const;
const PHASE_MANIFEST = 'manifest' as const;

/** All state phases in pipeline order */
const STATE_PHASES = [
  PHASE_EXTRACTION,
  PHASE_GENERATION,
  PHASE_MANIFEST,
] as const;

/** Type representing valid state phases */
type StatePhase = (typeof STATE_PHASES)[number];

/** File suffixes for different state types */
const FILE_SUFFIX: Record<StatePhase, string> = {
  [PHASE_EXTRACTION]: '.extraction.json',
  [PHASE_GENERATION]: '.generation.json',
  [PHASE_MANIFEST]: '.manifest.json',
};

// =============================================================================
// FileStateStore Implementation
// =============================================================================

/**
 * File-based state store for pipeline persistence
 *
 * Stores pipeline state as JSON files in a configurable directory.
 * Supports atomic writes via temp file + rename pattern.
 *
 * @example
 * ```typescript
 * // Use default directory (.ce-state)
 * const store = new FileStateStore();
 *
 * // Use custom directory
 * const store = new FileStateStore('./my-state');
 *
 * // Save and retrieve state
 * await store.saveExtraction('Button', extractionData);
 * const data = await store.getExtraction('Button');
 * ```
 */
export class FileStateStore {
  private readonly stateDir: string;
  private initialized = false;

  /**
   * Create a new FileStateStore
   *
   * @param stateDir - Directory for state files. Falls back to:
   *   1. Provided value
   *   2. CE_STATE_DIR environment variable
   *   3. Default '.ce-state' directory
   */
  constructor(stateDir?: string) {
    this.stateDir = stateDir ?? process.env[STATE_DIR_ENV] ?? DEFAULT_STATE_DIR;
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Ensure state directory exists
   */
  private async ensureDir(): Promise<void> {
    if (this.initialized) return;

    await mkdir(this.stateDir, { recursive: true });
    this.initialized = true;
  }

  /**
   * Get full file path for a component and state type
   */
  private getFilePath(componentName: string, type: StatePhase): string {
    const kebabName = kebabCase(componentName);
    return join(this.stateDir, `${kebabName}${FILE_SUFFIX[type]}`);
  }

  /**
   * Read and parse a JSON file, returning null if not found
   */
  private async readJsonFile<T>(filePath: string): Promise<T | null> {
    try {
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      // File not found is expected
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Write data to a JSON file atomically
   *
   * Writes to a temp file first, then renames for atomicity.
   */
  private async writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    await this.ensureDir();

    const tempPath = `${filePath}.tmp`;
    const content = JSON.stringify(data, null, 2);

    // Write to temp file
    await writeFile(tempPath, content, 'utf-8');

    // Rename for atomic write (works on same filesystem)
    await import('node:fs/promises').then((fs) =>
      fs.rename(tempPath, filePath)
    );
  }

  /**
   * Delete a file if it exists, ignoring ENOENT errors
   */
  private async deleteIfExists(filePath: string): Promise<boolean> {
    try {
      await unlink(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  // ===========================================================================
  // Extraction State
  // ===========================================================================

  async saveExtraction(
    componentName: string,
    data: StoredExtraction
  ): Promise<void> {
    const filePath = this.getFilePath(componentName, PHASE_EXTRACTION);
    await this.writeJsonFile(filePath, data);
  }

  async getExtraction(componentName: string): Promise<StoredExtraction | null> {
    const filePath = this.getFilePath(componentName, PHASE_EXTRACTION);
    return this.readJsonFile<StoredExtraction>(filePath);
  }

  // ===========================================================================
  // Generation State
  // ===========================================================================

  async saveGeneration(
    componentName: string,
    data: StoredGeneration
  ): Promise<void> {
    const filePath = this.getFilePath(componentName, PHASE_GENERATION);
    await this.writeJsonFile(filePath, data);
  }

  async getGeneration(componentName: string): Promise<StoredGeneration | null> {
    const filePath = this.getFilePath(componentName, PHASE_GENERATION);
    return this.readJsonFile<StoredGeneration>(filePath);
  }

  // ===========================================================================
  // Manifest State
  // ===========================================================================

  async saveManifest(
    componentName: string,
    data: StoredManifest
  ): Promise<void> {
    const filePath = this.getFilePath(componentName, PHASE_MANIFEST);
    await this.writeJsonFile(filePath, data);
  }

  async getManifest(componentName: string): Promise<StoredManifest | null> {
    const filePath = this.getFilePath(componentName, PHASE_MANIFEST);
    return this.readJsonFile<StoredManifest>(filePath);
  }

  // ===========================================================================
  // Cleanup Operations
  // ===========================================================================

  async delete(componentName: string): Promise<void> {
    await Promise.all(
      STATE_PHASES.map((phase) => {
        const filePath = this.getFilePath(componentName, phase);
        return this.deleteIfExists(filePath);
      })
    );
  }

  async deleteAll(): Promise<number> {
    try {
      const entries = await readdir(this.stateDir);

      // Get unique component names from file entries
      const componentNames = new Set<string>();

      for (const entry of entries) {
        // Extract component name from filename
        for (const suffix of Object.values(FILE_SUFFIX)) {
          if (entry.endsWith(suffix)) {
            const name = entry.slice(0, -suffix.length);
            componentNames.add(name);
            break;
          }
        }
      }

      // Delete all files
      await rm(this.stateDir, { recursive: true, force: true });

      // Reset initialized flag so directory is recreated on next write
      this.initialized = false;

      return componentNames.size;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return 0;
      }
      throw error;
    }
  }

  // ===========================================================================
  // Query Operations
  // ===========================================================================

  async list(): Promise<string[]> {
    try {
      const entries = await readdir(this.stateDir);

      // Get unique component names from file entries
      const componentNames = new Set<string>();

      for (const entry of entries) {
        for (const suffix of Object.values(FILE_SUFFIX)) {
          if (entry.endsWith(suffix)) {
            const name = entry.slice(0, -suffix.length);
            componentNames.add(name);
            break;
          }
        }
      }

      return Array.from(componentNames).sort();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async exists(componentName: string): Promise<boolean> {
    for (const phase of STATE_PHASES) {
      const filePath = this.getFilePath(componentName, phase);
      try {
        await readFile(filePath);
        return true;
      } catch {
        // Continue to check other phases
      }
    }

    return false;
  }
}
