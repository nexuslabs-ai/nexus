import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { ZodError } from 'zod';

import { CLIErrorCode } from '../errors/codes.js';
import { CLIError, type CLIResult, failure, success } from '../errors/index.js';
import {
  type NexusConfig,
  NexusConfigSchema,
} from '../schemas/nexus-config.js';

const CONFIG_FILENAME = 'nexus.json';

/**
 * Find nexus.json by walking up directory tree
 * @param startDir - Starting directory (defaults to cwd)
 * @returns Path to nexus.json or failure if not found
 */
export async function findConfigPath(
  startDir?: string
): Promise<CLIResult<string>> {
  let currentDir = startDir ?? process.cwd();
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const configPath = path.join(currentDir, CONFIG_FILENAME);

    try {
      await fs.access(configPath);
      return success(configPath);
    } catch {
      currentDir = path.dirname(currentDir);
    }
  }

  return failure(
    new CLIError(
      CLIErrorCode.CONFIG_NOT_FOUND,
      `No ${CONFIG_FILENAME} found in current directory or any parent`,
      {
        recoverable: true,
        suggestion: 'Run "nexus init" to create a new project configuration',
        details: { searchedFrom: startDir ?? process.cwd() },
      }
    )
  );
}

/**
 * Load and validate nexus.json
 * @param configPath - Path to nexus.json
 * @returns Parsed and validated configuration or failure
 */
export async function loadConfig(
  configPath: string
): Promise<CLIResult<NexusConfig>> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(content);
    const validated = NexusConfigSchema.parse(parsed);
    return success(validated);
  } catch (err) {
    // Handle file system errors
    if (err instanceof Error && 'code' in err) {
      const fsError = err as NodeJS.ErrnoException;
      if (fsError.code === 'ENOENT') {
        return failure(
          new CLIError(
            CLIErrorCode.FILE_NOT_FOUND,
            `Configuration file not found: ${configPath}`,
            {
              recoverable: false,
              suggestion: 'Run "nexus init" to create a new project',
              cause: err,
            }
          )
        );
      }
      if (fsError.code === 'EACCES') {
        return failure(
          new CLIError(
            CLIErrorCode.FILE_READ_FAILED,
            `Permission denied reading ${configPath}`,
            {
              recoverable: false,
              suggestion: 'Check file permissions',
              cause: err,
            }
          )
        );
      }
    }

    // Handle JSON syntax errors
    if (err instanceof SyntaxError) {
      return failure(
        new CLIError(
          CLIErrorCode.CONFIG_INVALID,
          `Invalid JSON in ${configPath}`,
          {
            recoverable: false,
            suggestion:
              'Check the file for syntax errors or run "nexus repair"',
            cause: err,
          }
        )
      );
    }

    // Handle Zod validation errors with detailed messages
    if (err instanceof ZodError) {
      const issues = err.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      return failure(
        new CLIError(
          CLIErrorCode.CONFIG_INVALID,
          `Invalid configuration in ${configPath}: ${issues}`,
          {
            recoverable: false,
            suggestion: 'Ensure the configuration matches the expected schema',
            details: { issues: err.issues },
            cause: err,
          }
        )
      );
    }

    // Generic error fallback
    return failure(
      new CLIError(
        CLIErrorCode.CONFIG_INVALID,
        `Failed to load configuration from ${configPath}`,
        {
          recoverable: false,
          suggestion: 'Ensure the configuration matches the expected schema',
          cause: err instanceof Error ? err : undefined,
        }
      )
    );
  }
}

/**
 * Save nexus.json
 * @param configPath - Path to write to
 * @param config - Configuration to save
 */
export async function saveConfig(
  configPath: string,
  config: NexusConfig
): Promise<CLIResult<void>> {
  try {
    const content = JSON.stringify(config, null, 2) + '\n';
    await fs.writeFile(configPath, content, 'utf-8');
    return success(undefined);
  } catch (err) {
    return failure(
      new CLIError(
        CLIErrorCode.CONFIG_WRITE_FAILED,
        `Failed to write ${configPath}`,
        {
          recoverable: false,
          suggestion: 'Check file permissions',
          cause: err instanceof Error ? err : undefined,
        }
      )
    );
  }
}

/**
 * Detect package manager by looking for lock files
 * @param cwd - Directory to check (defaults to process.cwd())
 * @returns Detected package manager, defaults to 'npm' if no lock file found
 */
export async function detectPackageManager(
  cwd = process.cwd()
): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'> {
  const checks = [
    { file: 'pnpm-lock.yaml', pm: 'pnpm' as const },
    { file: 'yarn.lock', pm: 'yarn' as const },
    { file: 'bun.lockb', pm: 'bun' as const },
    { file: 'package-lock.json', pm: 'npm' as const },
  ];

  for (const { file, pm } of checks) {
    try {
      await fs.access(path.join(cwd, file));
      return pm;
    } catch {
      continue;
    }
  }

  return 'npm';
}
