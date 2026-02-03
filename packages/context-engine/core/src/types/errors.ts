/**
 * Error Types
 *
 * Standardized error types for the Context Engine API.
 * All errors follow a consistent structure for client handling.
 */

import { z } from 'zod';

/**
 * Error codes enum
 * Grouped by category for easier handling
 */
export const ErrorCodeSchema = z.enum([
  // Authentication errors (401)
  'UNAUTHORIZED',
  'INVALID_API_KEY',
  'EXPIRED_API_KEY',
  'INACTIVE_API_KEY',

  // Authorization errors (403)
  'FORBIDDEN',
  'INSUFFICIENT_PERMISSIONS',

  // Not found errors (404)
  'NOT_FOUND',
  'COMPONENT_NOT_FOUND',
  'ORGANIZATION_NOT_FOUND',

  // Validation errors (400)
  'VALIDATION_ERROR',
  'INVALID_INPUT',
  'INVALID_IDENTIFIER',
  'INVALID_VERSION',

  // Conflict errors (409)
  'CONFLICT',
  'COMPONENT_EXISTS',
  'VERSION_EXISTS',

  // Rate limiting (429)
  'RATE_LIMITED',

  // Processing errors (422)
  'EXTRACTION_FAILED',
  'META_GENERATION_FAILED',
  'MANIFEST_BUILD_FAILED',
  'EMBEDDING_FAILED',

  // State store errors (500)
  'STATE_STORE_ERROR',

  // Server errors (500)
  'INTERNAL_ERROR',
  'DATABASE_ERROR',
  'EXTERNAL_SERVICE_ERROR',
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

/**
 * HTTP status codes mapped to error categories
 */
export const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  // 401 Unauthorized
  UNAUTHORIZED: 401,
  INVALID_API_KEY: 401,
  EXPIRED_API_KEY: 401,
  INACTIVE_API_KEY: 401,

  // 403 Forbidden
  FORBIDDEN: 403,
  INSUFFICIENT_PERMISSIONS: 403,

  // 404 Not Found
  NOT_FOUND: 404,
  COMPONENT_NOT_FOUND: 404,
  ORGANIZATION_NOT_FOUND: 404,

  // 400 Bad Request
  VALIDATION_ERROR: 400,
  INVALID_INPUT: 400,
  INVALID_IDENTIFIER: 400,
  INVALID_VERSION: 400,

  // 409 Conflict
  CONFLICT: 409,
  COMPONENT_EXISTS: 409,
  VERSION_EXISTS: 409,

  // 429 Too Many Requests
  RATE_LIMITED: 429,

  // 422 Unprocessable Entity
  EXTRACTION_FAILED: 422,
  META_GENERATION_FAILED: 422,
  MANIFEST_BUILD_FAILED: 422,
  EMBEDDING_FAILED: 422,

  // 500 Internal Server Error
  STATE_STORE_ERROR: 500,
  INTERNAL_ERROR: 500,
  DATABASE_ERROR: 500,
  EXTERNAL_SERVICE_ERROR: 500,
};

/**
 * Validation error detail (for field-level errors)
 */
export const ValidationErrorDetailSchema = z.object({
  /** Field path (e.g., "props.0.name") */
  path: z.array(z.union([z.string(), z.number()])),

  /** Error message */
  message: z.string(),

  /** Expected value or type */
  expected: z.string().optional(),

  /** Received value or type */
  received: z.string().optional(),
});

export type ValidationErrorDetail = z.infer<typeof ValidationErrorDetailSchema>;

/**
 * API error response schema
 */
export const ApiErrorSchema = z.object({
  /** Error code for programmatic handling */
  code: ErrorCodeSchema,

  /** Human-readable error message */
  message: z.string(),

  /** Additional error details */
  details: z.record(z.string(), z.unknown()).optional(),

  /** Validation errors (for VALIDATION_ERROR code) */
  validationErrors: z.array(ValidationErrorDetailSchema).optional(),

  /** Request ID for support/debugging */
  requestId: z.string().optional(),

  /** Timestamp of the error */
  timestamp: z.string(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

/**
 * Base error class for Context Engine errors
 */
export class ContextEngineError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;
  readonly validationErrors?: ValidationErrorDetail[];
  readonly requestId?: string;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      details?: Record<string, unknown>;
      validationErrors?: ValidationErrorDetail[];
      requestId?: string;
      cause?: Error;
    }
  ) {
    super(message, { cause: options?.cause });
    this.name = 'ContextEngineError';
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code];
    this.details = options?.details;
    this.validationErrors = options?.validationErrors;
    this.requestId = options?.requestId;
  }

  /**
   * Convert to API error response format
   */
  toApiError(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      validationErrors: this.validationErrors,
      requestId: this.requestId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create from Zod validation error
   */
  static fromZodError(
    error: z.ZodError,
    requestId?: string
  ): ContextEngineError {
    const validationErrors: ValidationErrorDetail[] = error.issues.map(
      (issue) => ({
        // Filter out symbols from path (rare edge case)
        path: issue.path.filter(
          (p): p is string | number => typeof p !== 'symbol'
        ),
        message: issue.message,
        expected: 'expected' in issue ? String(issue.expected) : undefined,
        received: 'received' in issue ? String(issue.received) : undefined,
      })
    );

    return new ContextEngineError('VALIDATION_ERROR', 'Validation failed', {
      validationErrors,
      requestId,
    });
  }
}

/**
 * Specific error classes for common cases
 */
export class NotFoundError extends ContextEngineError {
  constructor(resource: string, identifier: string, requestId?: string) {
    super('NOT_FOUND', `${resource} not found: ${identifier}`, {
      details: { resource, identifier },
      requestId,
    });
    this.name = 'NotFoundError';
  }
}

export class ComponentNotFoundError extends ContextEngineError {
  constructor(identifier: string, requestId?: string) {
    super('COMPONENT_NOT_FOUND', `Component not found: ${identifier}`, {
      details: { identifier },
      requestId,
    });
    this.name = 'ComponentNotFoundError';
  }
}

export class UnauthorizedError extends ContextEngineError {
  constructor(message = 'Authentication required', requestId?: string) {
    super('UNAUTHORIZED', message, { requestId });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ContextEngineError {
  constructor(message = 'Insufficient permissions', requestId?: string) {
    super('FORBIDDEN', message, { requestId });
    this.name = 'ForbiddenError';
  }
}

export class RateLimitedError extends ContextEngineError {
  readonly retryAfter: number;

  constructor(retryAfter: number, requestId?: string) {
    super(
      'RATE_LIMITED',
      `Rate limit exceeded. Retry after ${retryAfter} seconds`,
      {
        details: { retryAfter },
        requestId,
      }
    );
    this.name = 'RateLimitedError';
    this.retryAfter = retryAfter;
  }
}

export class ValidationError extends ContextEngineError {
  constructor(
    message: string,
    validationErrors?: ValidationErrorDetail[],
    requestId?: string
  ) {
    super('VALIDATION_ERROR', message, {
      validationErrors,
      requestId,
    });
    this.name = 'ValidationError';
  }
}

export class ExtractionError extends ContextEngineError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super('EXTRACTION_FAILED', message, { details, requestId });
    this.name = 'ExtractionError';
  }
}

export class MetaGenerationError extends ContextEngineError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super('META_GENERATION_FAILED', message, { details, requestId });
    this.name = 'MetaGenerationError';
  }
}

export class EmbeddingError extends ContextEngineError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super('EMBEDDING_FAILED', message, { details, requestId });
    this.name = 'EmbeddingError';
  }
}

export class ManifestBuildError extends ContextEngineError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super('MANIFEST_BUILD_FAILED', message, { details, requestId });
    this.name = 'ManifestBuildError';
  }
}

export class StateStoreError extends ContextEngineError {
  constructor(
    message: string,
    details?: { operation?: string; componentName?: string },
    requestId?: string
  ) {
    super('STATE_STORE_ERROR', message, { details, requestId });
    this.name = 'StateStoreError';
  }
}

/**
 * Type guard to check if an error is a ContextEngineError
 */
export function isContextEngineError(
  error: unknown
): error is ContextEngineError {
  return error instanceof ContextEngineError;
}

/**
 * Helper to get HTTP status from error
 */
export function getErrorStatus(error: unknown): number {
  if (isContextEngineError(error)) {
    return error.statusCode;
  }
  return 500;
}
