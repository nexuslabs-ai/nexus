import type { CLIErrorCode } from './codes.js';

/**
 * CLI error with structured information
 */
export class CLIError extends Error {
  readonly code: CLIErrorCode;
  readonly details?: Record<string, unknown>;
  readonly recoverable: boolean;
  readonly suggestion?: string;

  constructor(
    code: CLIErrorCode,
    message: string,
    options?: {
      details?: Record<string, unknown>;
      recoverable?: boolean;
      suggestion?: string;
      cause?: Error;
    }
  ) {
    super(message, { cause: options?.cause });
    this.name = 'CLIError';
    this.code = code;
    this.details = options?.details;
    this.recoverable = options?.recoverable ?? false;
    this.suggestion = options?.suggestion;
  }
}

/**
 * Discriminated union result type
 */
export type CLIResult<T> =
  | { type: 'success'; data: T }
  | { type: 'failure'; error: CLIError };

/**
 * Type guard for success result
 */
export function isSuccess<T>(
  result: CLIResult<T>
): result is { type: 'success'; data: T } {
  return result.type === 'success';
}

/**
 * Type guard for failure result
 */
export function isFailure<T>(
  result: CLIResult<T>
): result is { type: 'failure'; error: CLIError } {
  return result.type === 'failure';
}

/**
 * Helper to create success result
 */
export function success<T>(data: T): CLIResult<T> {
  return { type: 'success', data };
}

/**
 * Helper to create failure result
 */
export function failure<T>(error: CLIError): CLIResult<T> {
  return { type: 'failure', error };
}
