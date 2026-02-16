/**
 * Temp File Manager
 *
 * Hybrid temp file management strategy for react-docgen-typescript extraction.
 * react-docgen-typescript requires actual files on disk to parse TypeScript.
 *
 * Strategy:
 * 1. Startup cleanup - removes orphaned files from previous crashes
 * 2. Try-finally cleanup - ensures cleanup on normal operation
 */

import { randomBytes } from 'crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { createLogger } from './logger.js';

const logger = createLogger({ name: 'temp-manager' });

const TEMP_DIR_PREFIX = 'context-engine-';
const TEMP_DIR = join(tmpdir(), `${TEMP_DIR_PREFIX}extract`);

/**
 * Represents a temporary file with cleanup capability
 */
export interface TempFile {
  path: string;
  remove: () => Promise<void>;
}

/**
 * Hybrid temp file management strategy:
 * 1. Startup cleanup - removes orphaned files from previous crashes
 * 2. Try-finally cleanup - ensures cleanup on normal operation
 */
export class TempManager {
  private activeFiles: Set<string> = new Set();

  constructor() {
    this.ensureTempDir();
  }

  /**
   * Initialize temp manager and clean up orphaned files from previous runs
   * Call this on server startup
   */
  async initialize(): Promise<void> {
    await this.cleanupOrphanedFiles();
    logger.info('Temp manager initialized', { tempDir: TEMP_DIR });
  }

  /**
   * Clean up orphaned temp files from previous crashes
   * Called on startup
   */
  private async cleanupOrphanedFiles(): Promise<void> {
    if (!existsSync(TEMP_DIR)) {
      return;
    }

    try {
      const files = readdirSync(TEMP_DIR);
      let cleaned = 0;

      for (const file of files) {
        const filePath = join(TEMP_DIR, file);
        try {
          rmSync(filePath, { force: true });
          cleaned++;
        } catch (err) {
          logger.warn('Failed to clean orphaned temp file', {
            filePath,
            error: err,
          });
        }
      }

      if (cleaned > 0) {
        logger.info('Cleaned orphaned temp files', { count: cleaned });
      }
    } catch (err) {
      logger.warn('Failed to read temp directory for cleanup', { error: err });
    }
  }

  /**
   * Ensure temp directory exists with proper permissions
   */
  private ensureTempDir(): void {
    if (!existsSync(TEMP_DIR)) {
      mkdirSync(TEMP_DIR, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Create a temporary file with secure random name
   */
  createTempFile(content: string, componentName: string): TempFile {
    const randomSuffix = randomBytes(8).toString('hex');
    const sanitizedName = componentName.replace(/[^a-zA-Z0-9]/g, '-');
    const fileName = `${sanitizedName}-${randomSuffix}.tsx`;
    const filePath = join(TEMP_DIR, fileName);

    // Write with restrictive permissions (owner read/write only)
    writeFileSync(filePath, content, { encoding: 'utf-8', mode: 0o600 });
    this.activeFiles.add(filePath);

    return {
      path: filePath,
      remove: async () => {
        try {
          unlinkSync(filePath);
          this.activeFiles.delete(filePath);
        } catch {
          // Ignore cleanup errors - startup cleanup will handle orphans
          logger.debug(
            'Temp file cleanup failed (will be cleaned on restart)',
            { filePath }
          );
        }
      },
    };
  }

  /**
   * Execute extraction with automatic temp file cleanup (try-finally pattern)
   */
  async withTempFile<T>(
    content: string,
    componentName: string,
    operation: (filePath: string) => Promise<T>
  ): Promise<T> {
    const tempFile = this.createTempFile(content, componentName);
    try {
      return await operation(tempFile.path);
    } finally {
      await tempFile.remove();
    }
  }

  /**
   * Clean up all active temp files (for graceful shutdown)
   */
  async shutdown(): Promise<void> {
    for (const filePath of this.activeFiles) {
      try {
        unlinkSync(filePath);
      } catch {
        // Ignore errors during shutdown
      }
    }
    this.activeFiles.clear();
    logger.info('Temp manager shutdown complete');
  }

  /**
   * Get the temp directory path (for debugging)
   */
  getTempDir(): string {
    return TEMP_DIR;
  }

  /**
   * Get count of active temp files (for monitoring)
   */
  getActiveFileCount(): number {
    return this.activeFiles.size;
  }
}

// Singleton instance
let tempManagerInstance: TempManager | null = null;

/**
 * Get the singleton TempManager instance
 */
export function getTempManager(): TempManager {
  if (!tempManagerInstance) {
    tempManagerInstance = new TempManager();
  }
  return tempManagerInstance;
}
