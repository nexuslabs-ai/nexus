/**
 * Utils Index
 *
 * Re-exports all utility functions from @context-engine/core
 */

// ID utilities
export {
  generateComponentId,
  generateSlug,
  getShortId,
  isSameComponent,
  isValidSlug,
  isValidUuid,
  parseIdentifier,
  toKebabCase,
  validateComponentId,
  validateComponentSlug,
} from './id.js';

// Hash utilities
export {
  contentMatchesHash,
  generateCombinedHash,
  generateHash,
  generateMetaHash,
  generateObjectHash,
  generateSourceHash,
  getHashPreview,
  hashesMatch,
  isValidHash,
} from './hash.js';

// Version utilities
export {
  compareVersions,
  formatVersion,
  getLatestVersion,
  getVersionParts,
  incrementVersion,
  INITIAL_VERSION,
  isNewerVersion,
  isOlderVersion,
  isPrerelease,
  isValidVersion,
  nextMajorVersion,
  nextMinorVersion,
  nextPatchVersion,
  parseVersion,
  satisfiesRange,
  sortVersionsAsc,
  sortVersionsDesc,
} from './version.js';

// Logger utilities - values
export { createLogger, Logger, logger } from './logger.js';

// Logger utilities - types
export type { LogEntry, LoggerConfig, LogLevel } from './logger.js';
