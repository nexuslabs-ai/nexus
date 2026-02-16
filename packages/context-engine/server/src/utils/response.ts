/**
 * Response Helpers
 *
 * Utility functions for creating consistent API responses.
 * Reduces repetition of `{ success: true as const, data: ... }` pattern.
 */

/**
 * Create a success response wrapper.
 *
 * @example
 * ```ts
 * // Before
 * return c.json({ success: true as const, data: formatOrganization(org) }, 200);
 *
 * // After
 * return c.json(successResponse(formatOrganization(org)), 200);
 * ```
 */
export function successResponse<T>(data: T) {
  return { success: true as const, data };
}
