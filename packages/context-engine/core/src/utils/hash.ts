/**
 * Hash Utilities
 *
 * Functions for generating content hashes for change detection.
 */

import { createHash } from 'crypto';

import type { Hash } from '../types/extracted.js';

/**
 * Generate SHA-256 hash of content
 */
export function generateHash(content: string): Hash {
  return createHash('sha256').update(content, 'utf8').digest('hex') as Hash;
}

/**
 * Generate hash from multiple content strings
 * Useful for combining source files
 */
export function generateCombinedHash(contents: string[]): Hash {
  const combined = contents.join('\n---FILE-BOUNDARY---\n');
  return generateHash(combined);
}

/**
 * Generate hash from an object (JSON serialized)
 */
export function generateObjectHash(obj: unknown): Hash {
  const serialized = JSON.stringify(obj, Object.keys(obj as object).sort());
  return generateHash(serialized);
}

/**
 * Check if two hashes match
 */
export function hashesMatch(hash1: string, hash2: string): boolean {
  return hash1.toLowerCase() === hash2.toLowerCase();
}

/**
 * Validate that a string is a valid SHA-256 hash
 */
export function isValidHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}

/**
 * Get a short preview of a hash (first 8 chars)
 */
export function getHashPreview(hash: Hash): string {
  return hash.substring(0, 8);
}

/**
 * Compare content against a stored hash
 * Returns true if content matches the hash
 */
export function contentMatchesHash(content: string, hash: Hash): boolean {
  const contentHash = generateHash(content);
  return hashesMatch(contentHash, hash);
}

/**
 * Generate a hash for source code change detection
 * Normalizes whitespace for consistent hashing
 */
export function generateSourceHash(sourceCode: string): Hash {
  // Normalize line endings and trim
  const normalized = sourceCode.replace(/\r\n/g, '\n').trim();
  return generateHash(normalized);
}

/**
 * Generate a hash for meta content change detection
 */
export function generateMetaHash(meta: {
  description: string;
  patterns: string[];
  examples: string[];
}): Hash {
  // Create a deterministic string from meta content
  const content = [
    meta.description,
    ...meta.patterns.sort(),
    ...meta.examples.sort(),
  ].join('\n');

  return generateHash(content);
}
