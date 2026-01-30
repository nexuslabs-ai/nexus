/**
 * Utils Index
 *
 * Re-exports all utility functions from @context-engine/core
 */

// Case conversion utilities
export { kebabCase, pascalCase } from './case.js';

// ID utilities
export {
  generateComponentId,
  generateSlug,
  isValidSlug,
  isValidUuid,
} from './id.js';

// Hash utilities
export {
  generateHash,
  generateObjectHash,
  generateSourceHash,
} from './hash.js';

// Logger utilities - values
export { createLogger, Logger, logger } from './logger.js';

// Logger utilities - types (LogLevel is re-exported from config, so we don't re-export here)
export type { LogEntry, LoggerConfig } from './logger.js';

// Temp file manager utilities - values
export { getTempManager, TempManager } from './temp-manager.js';

// Temp file manager utilities - types
export type { TempFile } from './temp-manager.js';

// Prop categorization utilities - values
export {
  categorizeProps,
  detectChildrenInfo,
  isBehaviorProp,
  isEventProp,
  isSlotProp,
  isVariantProp,
  PATTERNS,
  toDefinition,
} from './prop-categorization.js';

// Environment-based provider selection
export { createProviderFromEnv } from './env-provider.js';

// Type utilities for extraction
export { extractEnumValues, simplifyType } from './type-utils.js';
