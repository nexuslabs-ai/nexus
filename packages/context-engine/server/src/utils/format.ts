/**
 * Format Utilities
 *
 * Generic formatting functions for API responses.
 */

/**
 * Entity with standard timestamp fields.
 */
type WithDates = {
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Format an entity's Date fields to ISO strings for API responses.
 *
 * @example
 * ```ts
 * // Before (custom formatOrganization)
 * function formatOrganization(org: DbOrganization) {
 *   return {
 *     id: org.id,
 *     name: org.name,
 *     createdAt: org.createdAt.toISOString(),
 *     updatedAt: org.updatedAt.toISOString(),
 *   };
 * }
 *
 * // After (generic formatDates)
 * formatDates(org)
 * ```
 */
export function formatDates<T extends WithDates>(
  entity: T
): Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
} {
  return {
    ...entity,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
