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
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR';

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
export const NotFound = (resource: string, id?: string) =>
  new ApiError(
    404,
    'NOT_FOUND',
    id ? `${resource} '${id}' not found` : `${resource} not found`
  );

/**
 * Service unavailable error.
 * Use when external dependencies (database, APIs) are unavailable.
 * @param message - Description of what's unavailable
 * @param details - Optional additional context
 */
export const ServiceUnavailable = (message: string, details?: unknown) =>
  new ApiError(503, 'SERVICE_UNAVAILABLE', message, details);

/**
 * Validation error.
 * Use when request data fails validation.
 * @param message - Description of what's invalid
 * @param details - Optional field-level details
 */
export const ValidationError = (message: string, details?: unknown) =>
  new ApiError(400, 'VALIDATION_ERROR', message, details);
