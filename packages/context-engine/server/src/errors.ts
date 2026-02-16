/**
 * API Errors
 *
 * Custom error classes for consistent error handling.
 * Throw these in routes - they're caught by app.onError.
 */

import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

type ErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED'
  | 'PROCESSING_ERROR';

/**
 * Base API error class.
 * Extends HTTPException for Hono compatibility.
 */
export class ApiError extends HTTPException {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(
    status: ContentfulStatusCode,
    code: ErrorCode,
    message: string,
    details?: unknown
  ) {
    super(status, { message });
    this.code = code;
    this.details = details;
  }
}

/**
 * Resource not found error.
 * @param resource - The type of resource (e.g., "Organization", "Component")
 * @param id - Optional identifier that was not found
 */
export const notFound = (resource: string, id?: string) =>
  new ApiError(
    404,
    'NOT_FOUND',
    id ? `${resource} '${id}' not found` : `${resource} not found`
  );

/**
 * Conflict error.
 * Use when an operation conflicts with existing state (e.g., FK constraint).
 * @param message - Description of the conflict
 * @param details - Optional additional context
 */
export const conflict = (message: string, details?: unknown) =>
  new ApiError(409, 'CONFLICT', message, details);

/**
 * Service unavailable error.
 * Use when external dependencies (database, APIs) are unavailable.
 * @param message - Description of what's unavailable
 * @param details - Optional additional context
 */
export const serviceUnavailable = (message: string, details?: unknown) =>
  new ApiError(503, 'SERVICE_UNAVAILABLE', message, details);

/**
 * Validation error.
 * Use when request data fails validation.
 * @param message - Description of what's invalid
 * @param details - Optional field-level details
 */
export const validationError = (message: string, details?: unknown) =>
  new ApiError(400, 'VALIDATION_ERROR', message, details);

/**
 * 401 Unauthorized — missing or invalid authentication.
 * Use when a request lacks valid credentials.
 * @param message - Description of the auth failure
 */
export const unauthorized = (message = 'Authentication required') =>
  new ApiError(401, 'UNAUTHORIZED', message);

/**
 * 403 Forbidden — valid auth but insufficient permissions.
 * Use when the caller is authenticated but lacks the required scope.
 * @param message - Description of what permission is missing
 */
export const forbidden = (message = 'Insufficient permissions') =>
  new ApiError(403, 'FORBIDDEN', message);

/**
 * Rate limit exceeded.
 * Use when a client has exceeded their allowed request rate.
 * @param retryAfter - Optional seconds until the client can retry
 */
export const rateLimited = (retryAfter?: number) =>
  new ApiError(
    429,
    'RATE_LIMITED',
    'Rate limit exceeded. Please try again later.',
    retryAfter ? { retryAfter } : undefined
  );

/**
 * Component processing error.
 * Use when component extraction or generation fails.
 * @param message - Description of what failed during processing
 * @param details - Optional additional context about the failure
 */
export const processingError = (message: string, details?: unknown) =>
  new ApiError(500, 'PROCESSING_ERROR', message, details);
