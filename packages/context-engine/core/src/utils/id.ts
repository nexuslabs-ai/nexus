/**
 * Identity Utilities
 *
 * Functions for generating and parsing component identifiers.
 */

import { v4 as uuidv4 } from 'uuid';

import type {
  ComponentId,
  ComponentSlug,
  Framework,
} from '../types/identity.js';
import { SLUG_PATTERN, UUID_PATTERN } from '../types/identity.js';

import { kebabCase } from './case.js';

/**
 * Generate a new component ID (UUID v4)
 */
export function generateComponentId(): ComponentId {
  return uuidv4() as ComponentId;
}

/**
 * Check if a string is a valid UUID v4
 */
export function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/**
 * Check if a string is a valid component slug
 */
export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

/**
 * Generate a component slug from name, framework, and ID
 *
 * Format: {kebab-name}-{framework}-{first8charsOfId}
 * Example: "date-picker-react-f47ac10b"
 */
export function generateSlug(
  name: string,
  framework: Framework,
  id: ComponentId
): ComponentSlug {
  const kebabName = kebabCase(name);
  const idPrefix = id.replace(/-/g, '').substring(0, 8);

  return `${kebabName}-${framework}-${idPrefix}` as ComponentSlug;
}
