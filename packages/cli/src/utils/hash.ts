import { createHash } from 'crypto';

/**
 * Compute SHA-256 hash of a string
 * @returns Lowercase hex string (64 characters)
 */
export function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}

/**
 * Hash multiple files by sorting keys and combining their contents
 * Used for computing sourceHash of a component's files
 */
export function hashFiles(files: Record<string, string>): string {
  const sortedKeys = Object.keys(files).sort();
  const combined = sortedKeys.map((k) => `${k}:${files[k]}`).join('\n');
  return sha256(combined);
}

/**
 * Case-insensitive hash comparison
 */
export function hashesMatch(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Check if a file has been modified by comparing hashes
 */
export function isModified(currentHash: string, originalHash: string): boolean {
  return !hashesMatch(currentHash, originalHash);
}
