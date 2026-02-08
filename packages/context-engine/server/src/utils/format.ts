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
 * Converts all Date fields in a type to strings.
 * - `Date` becomes `string`
 * - `Date | null` becomes `string | null`
 * - All other types are preserved
 */
type FormatDates<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K];
};

/**
 * Format all Date fields in an entity to ISO strings for API responses.
 *
 * Handles both required and nullable Date fields:
 * - `Date` → ISO 8601 string
 * - `Date | null` → ISO 8601 string or null
 * - All other fields pass through unchanged
 *
 * @example
 * ```ts
 * formatDates(organization)  // { ...org, createdAt: "2025-...", updatedAt: "2025-..." }
 * formatDates(apiKey)        // Also converts lastUsedAt, expiresAt
 * ```
 */
export function formatDates<T extends WithDates>(entity: T): FormatDates<T> {
  const result = { ...entity } as Record<string, unknown>;
  for (const key of Object.keys(result)) {
    const value = result[key];
    if (value instanceof Date) {
      result[key] = value.toISOString();
    }
  }
  return result as FormatDates<T>;
}

/**
 * Omit specified fields from an object.
 *
 * Use to strip sensitive or internal fields before returning API responses.
 *
 * @example
 * ```ts
 * omitFields(entity, ['keyHash', 'orgId'])  // returns entity without those fields
 * ```
 */
export function omitFields<
  T extends Record<string, unknown>,
  K extends keyof T,
>(entity: T, keys: K[]): Omit<T, K> {
  const result = { ...entity };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
