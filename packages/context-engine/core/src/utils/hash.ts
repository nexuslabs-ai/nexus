/**
 * Hash Utilities
 *
 * Functions for generating content hashes for change detection.
 */

import { createHash } from 'crypto';
import stringify from 'fast-json-stable-stringify';

import type { Hash } from '../types/extracted.js';

/**
 * Generate SHA-256 hash of content
 */
export function generateHash(content: string): Hash {
  return createHash('sha256').update(content, 'utf8').digest('hex') as Hash;
}

/**
 * Generate hash from an object (JSON serialized)
 *
 * Uses fast-json-stable-stringify for deterministic key ordering,
 * ensuring consistent hashes regardless of object property order
 * at any nesting depth.
 */
export function generateObjectHash(obj: unknown): Hash {
  const serialized = stringify(obj);
  return generateHash(serialized);
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
