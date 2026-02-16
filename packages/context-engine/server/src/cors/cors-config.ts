/**
 * CORS Config Parser
 *
 * Transforms raw environment variable strings into structured CORS configuration.
 * Separated from loadConfig() to keep parsing logic testable and readable.
 */

/**
 * Parse comma-separated origins string into array.
 *
 * Handles special cases:
 * - 'NONE' → empty array (disable browser CORS)
 * - '*' → ['*'] (wildcard, dev only)
 * - 'https://a.com,https://b.com' → ['https://a.com', 'https://b.com']
 *
 * @param raw - Raw CORS_ALLOWED_ORIGINS environment variable
 * @returns Parsed array of origin patterns
 *
 * @example
 * ```ts
 * parseAllowedOrigins('NONE');                    // []
 * parseAllowedOrigins('*');                       // ['*']
 * parseAllowedOrigins('https://a.com, https://b.com'); // ['https://a.com', 'https://b.com']
 * ```
 */
export function parseAllowedOrigins(raw: string): string[] {
  // Special case: explicit disable
  if (raw === 'NONE') {
    return [];
  }

  // Special case: wildcard (dev only)
  if (raw === '*') {
    return ['*'];
  }

  // Standard case: comma-separated list
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
