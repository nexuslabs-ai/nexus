/**
 * Version Utilities
 *
 * Functions for working with semantic versions.
 */

import * as semver from 'semver';

import type { Version } from '../types/identity.js';

/**
 * Default initial version
 */
export const INITIAL_VERSION: Version = '1.0.0' as Version;

/**
 * Parse and validate a version string
 */
export function parseVersion(version: string): Version | null {
  const cleaned = semver.clean(version);
  return cleaned as Version | null;
}

/**
 * Check if a string is a valid semver version
 */
export function isValidVersion(version: string): boolean {
  return semver.valid(version) !== null;
}

/**
 * Compare two versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: Version, v2: Version): -1 | 0 | 1 {
  return semver.compare(v1, v2);
}

/**
 * Check if v1 is greater than v2
 */
export function isNewerVersion(v1: Version, v2: Version): boolean {
  return semver.gt(v1, v2);
}

/**
 * Check if v1 is less than v2
 */
export function isOlderVersion(v1: Version, v2: Version): boolean {
  return semver.lt(v1, v2);
}

/**
 * Increment version by release type
 */
export function incrementVersion(
  version: Version,
  releaseType: 'major' | 'minor' | 'patch' | 'prerelease'
): Version {
  const incremented = semver.inc(version, releaseType);
  if (!incremented) {
    throw new Error(`Failed to increment version: ${version}`);
  }
  return incremented as Version;
}

/**
 * Get the next patch version
 */
export function nextPatchVersion(version: Version): Version {
  return incrementVersion(version, 'patch');
}

/**
 * Get the next minor version
 */
export function nextMinorVersion(version: Version): Version {
  return incrementVersion(version, 'minor');
}

/**
 * Get the next major version
 */
export function nextMajorVersion(version: Version): Version {
  return incrementVersion(version, 'major');
}

/**
 * Get version parts
 */
export function getVersionParts(version: Version): {
  major: number;
  minor: number;
  patch: number;
  prerelease: readonly (string | number)[];
  build: readonly string[];
} {
  const parsed = semver.parse(version);
  if (!parsed) {
    throw new Error(`Invalid version: ${version}`);
  }
  return {
    major: parsed.major,
    minor: parsed.minor,
    patch: parsed.patch,
    prerelease: parsed.prerelease,
    build: parsed.build,
  };
}

/**
 * Check if version satisfies a range
 */
export function satisfiesRange(version: Version, range: string): boolean {
  return semver.satisfies(version, range);
}

/**
 * Get the highest version from a list
 */
export function getLatestVersion(versions: Version[]): Version | null {
  if (versions.length === 0) return null;

  const sorted = [...versions].sort((a, b) => semver.compare(b, a));
  return sorted[0];
}

/**
 * Sort versions in descending order (newest first)
 */
export function sortVersionsDesc(versions: Version[]): Version[] {
  return [...versions].sort((a, b) => semver.compare(b, a));
}

/**
 * Sort versions in ascending order (oldest first)
 */
export function sortVersionsAsc(versions: Version[]): Version[] {
  return [...versions].sort((a, b) => semver.compare(a, b));
}

/**
 * Check if a version is a prerelease
 */
export function isPrerelease(version: Version): boolean {
  const parsed = semver.parse(version);
  return parsed !== null && parsed.prerelease.length > 0;
}

/**
 * Format version for display
 */
export function formatVersion(version: Version, prefix = 'v'): string {
  return `${prefix}${version}`;
}
