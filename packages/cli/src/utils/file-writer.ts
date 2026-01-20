import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { CLIErrorCode } from '../errors/codes.js';
import { CLIError, type CLIResult, failure, success } from '../errors/index.js';

interface WriteOptions {
  /** Create parent directories if they don't exist */
  mkdir?: boolean;
  /** Encoding for text files */
  encoding?: BufferEncoding;
}

interface WriteFileResult {
  path: string;
  backed_up: boolean;
}

const BACKUP_SUFFIX = '.backup';

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create backup of a file if it exists
 * @returns true if backup was created, false if file didn't exist
 */
async function createBackup(filePath: string): Promise<boolean> {
  if (!(await fileExists(filePath))) {
    return false;
  }

  const backupPath = filePath + BACKUP_SUFFIX;
  await fs.copyFile(filePath, backupPath);
  return true;
}

/**
 * Restore a file from its backup
 */
async function restoreFromBackup(filePath: string): Promise<void> {
  const backupPath = filePath + BACKUP_SUFFIX;
  if (await fileExists(backupPath)) {
    await fs.rename(backupPath, filePath);
  }
}

/**
 * Remove backup file if it exists
 */
async function removeBackup(filePath: string): Promise<void> {
  const backupPath = filePath + BACKUP_SUFFIX;
  try {
    await fs.unlink(backupPath);
  } catch {
    // Backup might not exist, ignore
  }
}

/**
 * Atomically write a file with backup/rollback support
 *
 * This function follows a transactional pattern:
 * 1. Create backup of existing file (if any)
 * 2. Write new content to target path
 * 3. On success: remove backup
 * 4. On failure: restore from backup
 *
 * @param filePath - Absolute path to the file to write
 * @param content - Content to write to the file
 * @param options - Write options
 * @returns Result indicating success or failure
 *
 * @example
 * ```typescript
 * const result = await writeFileAtomic('/path/to/file.ts', 'content');
 * if (result.type === 'success') {
 *   console.log(`Wrote to ${result.data.path}`);
 * }
 * ```
 */
export async function writeFileAtomic(
  filePath: string,
  content: string,
  options: WriteOptions = {}
): Promise<CLIResult<WriteFileResult>> {
  const { mkdir = false, encoding = 'utf-8' } = options;
  let backedUp = false;

  try {
    // Create parent directories if requested
    if (mkdir) {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
    }

    // Create backup if file exists
    backedUp = await createBackup(filePath);

    // Write new content
    await fs.writeFile(filePath, content, { encoding });

    // Success - remove backup
    if (backedUp) {
      await removeBackup(filePath);
    }

    return success({ path: filePath, backed_up: backedUp });
  } catch (error) {
    // Restore from backup on failure
    if (backedUp) {
      try {
        await restoreFromBackup(filePath);
      } catch {
        // If restore fails, we have a bigger problem
        // but we should still report the original error
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error during file write';

    return failure(
      new CLIError(
        CLIErrorCode.FILE_WRITE_FAILED,
        `Failed to write file: ${message}`,
        {
          details: { path: filePath },
          recoverable: false,
          cause: error instanceof Error ? error : undefined,
        }
      )
    );
  }
}

/**
 * Write multiple files atomically - all or nothing
 *
 * If any file fails to write, all previously written files are rolled back
 * to their original state using their backups.
 *
 * @param files - Array of files to write with their paths and contents
 * @param options - Write options applied to all files
 * @returns Result with all file results or failure
 *
 * @example
 * ```typescript
 * const result = await writeFilesAtomic([
 *   { path: '/path/to/file1.ts', content: 'content1' },
 *   { path: '/path/to/file2.ts', content: 'content2' },
 * ]);
 * ```
 */
export async function writeFilesAtomic(
  files: Array<{ path: string; content: string }>,
  options: WriteOptions = {}
): Promise<CLIResult<WriteFileResult[]>> {
  const { mkdir = false, encoding = 'utf-8' } = options;
  const results: WriteFileResult[] = [];
  const backedUpFiles: string[] = [];

  try {
    for (const file of files) {
      // Create parent directories if requested
      if (mkdir) {
        const dir = path.dirname(file.path);
        await fs.mkdir(dir, { recursive: true });
      }

      // Create backup if file exists
      const backedUp = await createBackup(file.path);
      if (backedUp) {
        backedUpFiles.push(file.path);
      }

      // Write new content
      await fs.writeFile(file.path, file.content, { encoding });

      results.push({ path: file.path, backed_up: backedUp });
    }

    // All writes succeeded - remove all backups
    for (const filePath of backedUpFiles) {
      await removeBackup(filePath);
    }

    return success(results);
  } catch (error) {
    // Rollback all backed up files
    for (const filePath of backedUpFiles) {
      try {
        await restoreFromBackup(filePath);
      } catch {
        // Best effort rollback
      }
    }

    // Also try to remove any partially written files that didn't have backups
    for (const result of results) {
      if (!result.backed_up) {
        try {
          await fs.unlink(result.path);
        } catch {
          // Best effort cleanup
        }
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error during file write';

    return failure(
      new CLIError(
        CLIErrorCode.FILE_WRITE_FAILED,
        `Failed to write files atomically: ${message}`,
        {
          details: { files: files.map((f) => f.path) },
          recoverable: false,
          cause: error instanceof Error ? error : undefined,
        }
      )
    );
  }
}

/**
 * Remove a file with optional backup
 *
 * Creates a backup before removal so the operation can be reversed
 * if needed (though this function doesn't automatically restore).
 *
 * @param filePath - Absolute path to the file to remove
 * @returns Result indicating success or failure
 *
 * @example
 * ```typescript
 * const result = await removeFileAtomic('/path/to/file.ts');
 * if (result.type === 'success') {
 *   console.log(`Removed ${result.data.path}`);
 * }
 * ```
 */
export async function removeFileAtomic(
  filePath: string
): Promise<CLIResult<{ path: string; backed_up: boolean }>> {
  let backedUp = false;

  try {
    // Check if file exists
    if (!(await fileExists(filePath))) {
      return failure(
        new CLIError(
          CLIErrorCode.FILE_NOT_FOUND,
          `File not found: ${filePath}`,
          {
            details: { path: filePath },
            recoverable: false,
          }
        )
      );
    }

    // Create backup before removal
    backedUp = await createBackup(filePath);

    // Remove the file
    await fs.unlink(filePath);

    // Success - remove backup
    if (backedUp) {
      await removeBackup(filePath);
    }

    return success({ path: filePath, backed_up: backedUp });
  } catch (error) {
    // Restore from backup on failure
    if (backedUp) {
      try {
        await restoreFromBackup(filePath);
      } catch {
        // Best effort restore
      }
    }

    // If the error is file not found, we may have already handled it
    if (error instanceof CLIError) {
      return failure(error);
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error during file removal';

    return failure(
      new CLIError(
        CLIErrorCode.FILE_WRITE_FAILED,
        `Failed to remove file: ${message}`,
        {
          details: { path: filePath },
          recoverable: false,
          cause: error instanceof Error ? error : undefined,
        }
      )
    );
  }
}
