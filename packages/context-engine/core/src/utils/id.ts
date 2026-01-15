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
  ParsedIdentifier,
} from '../types/identity.js';
import {
  ComponentIdSchema,
  ComponentSlugSchema,
  FrameworkSchema,
  SLUG_PATTERN,
  UUID_PATTERN,
} from '../types/identity.js';

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
 * Validate a component ID
 */
export function validateComponentId(value: string): ComponentId {
  return ComponentIdSchema.parse(value);
}

/**
 * Validate a component slug
 */
export function validateComponentSlug(value: string): ComponentSlug {
  return ComponentSlugSchema.parse(value);
}

/**
 * Convert a name to kebab-case
 */
export function toKebabCase(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric chars except hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
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
  const kebabName = toKebabCase(name);
  const idPrefix = id.replace(/-/g, '').substring(0, 8);

  return `${kebabName}-${framework}-${idPrefix}` as ComponentSlug;
}

/**
 * Parse an identifier string to determine its type
 *
 * Supports:
 * - UUID: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * - Slug: "button-react-f47ac10b"
 * - Name: "Button" or "button@1.0.0"
 */
export function parseIdentifier(identifier: string): ParsedIdentifier {
  const trimmed = identifier.trim();

  // Check if it's a UUID
  if (isValidUuid(trimmed)) {
    return {
      type: 'uuid',
      value: trimmed.toLowerCase(),
    };
  }

  // Check if it's a slug
  if (isValidSlug(trimmed)) {
    // Extract parts from slug: name-framework-id8
    const parts = trimmed.split('-');
    const _idPart = parts.pop()!; // Last 8 chars of UUID (not needed for parsing)
    const frameworkPart = parts.pop();

    // Validate framework
    const frameworkResult = FrameworkSchema.safeParse(frameworkPart);

    return {
      type: 'slug',
      value: trimmed,
      name: parts.join('-'),
      framework: frameworkResult.success ? frameworkResult.data : undefined,
    };
  }

  // Check for version suffix (name@version)
  const versionMatch = trimmed.match(/^(.+)@(\d+\.\d+\.\d+.*)$/);
  if (versionMatch) {
    return {
      type: 'name',
      value: trimmed,
      name: versionMatch[1],
      version: versionMatch[2],
    };
  }

  // Default to name
  return {
    type: 'name',
    value: trimmed,
    name: trimmed,
  };
}

/**
 * Extract the short ID (first 8 chars) from a UUID
 */
export function getShortId(id: ComponentId): string {
  return id.replace(/-/g, '').substring(0, 8);
}

/**
 * Check if two IDs refer to the same component
 * (handles full UUID vs short ID comparison)
 */
export function isSameComponent(id1: string, id2: string): boolean {
  const normalized1 = id1.replace(/-/g, '').toLowerCase();
  const normalized2 = id2.replace(/-/g, '').toLowerCase();

  // If both are full UUIDs
  if (normalized1.length === 32 && normalized2.length === 32) {
    return normalized1 === normalized2;
  }

  // If one is a short ID, compare prefixes
  const shorter =
    normalized1.length < normalized2.length ? normalized1 : normalized2;
  const longer =
    normalized1.length < normalized2.length ? normalized2 : normalized1;

  return longer.startsWith(shorter);
}
