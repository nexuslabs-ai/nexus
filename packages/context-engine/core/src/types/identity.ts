/**
 * Identity Types
 *
 * Component identity follows a three-part model:
 * - id: UUID v4 (primary key, immutable)
 * - slug: Derived identifier (name-framework-id8, for URLs)
 * - name: Human-readable display name
 */

import { z } from 'zod';

/**
 * UUID v4 regex pattern
 */
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Slug pattern: lowercase-kebab-case-8charUUID
 * Example: "date-picker-react-f47ac10b"
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{8}$/;

/**
 * Component identifier schema (UUID v4)
 */
export const ComponentIdSchema = z.uuid();

export type ComponentId = z.infer<typeof ComponentIdSchema>;

/**
 * Component slug schema
 */
export const ComponentSlugSchema = z.string().regex(SLUG_PATTERN, {
  message:
    'Slug must be lowercase kebab-case ending with 8-char UUID (e.g., "button-react-f47ac10b")',
});

export type ComponentSlug = z.infer<typeof ComponentSlugSchema>;

/**
 * Component name schema (display name)
 */
export const ComponentNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be 100 characters or less')
  .regex(/^[a-zA-Z][a-zA-Z0-9\s\-_]*$/, {
    message:
      'Name must start with a letter and contain only letters, numbers, spaces, hyphens, and underscores',
  });

export type ComponentName = z.infer<typeof ComponentNameSchema>;

/**
 * Framework enum
 */
export const FrameworkSchema = z.enum(['react', 'vue', 'svelte', 'angular']);

export type Framework = z.infer<typeof FrameworkSchema>;

/**
 * Complete component identity
 */
export const ComponentIdentitySchema = z.object({
  /** Primary identifier (UUID v4) */
  id: ComponentIdSchema,

  /** Derived slug for URLs (name-framework-id8) */
  slug: ComponentSlugSchema,

  /** Human-readable display name */
  name: ComponentNameSchema,

  /** Framework this component targets */
  framework: FrameworkSchema,
});

export type ComponentIdentity = z.infer<typeof ComponentIdentitySchema>;

/**
 * Version schema (semver)
 */
export const VersionSchema = z
  .string()
  .regex(
    /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)?(?:\+[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)?$/,
    { message: 'Version must be valid semver (e.g., "1.0.0", "2.1.0-beta.1")' }
  );

export type Version = z.infer<typeof VersionSchema>;

/**
 * Tier enum
 */
export const TierSchema = z.enum(['free', 'pro']);

export type Tier = z.infer<typeof TierSchema>;

/**
 * Visibility enum (for future cross-org sharing)
 *
 * @stable This is an irreversible architectural decision.
 * Adding this field now enables future sharing features without migration.
 */
export const VisibilitySchema = z.enum([
  'private', // Only visible within the org (default)
  'org', // Visible to all members of the org
  'public', // Visible to all orgs (marketplace future)
]);

export type Visibility = z.infer<typeof VisibilitySchema>;

/**
 * Base UI library schema
 * Used for components built on headless UI primitives (Radix, Ark, Base UI, etc.)
 */
export const BaseLibrarySchema = z.object({
  /** Library name (e.g., "radix-ui", "ark-ui", "base-ui", "headless-ui", "react-aria") */
  name: z.string(),
  /** Specific component from the library (e.g., "Dialog", "Select") */
  component: z.string().optional(),
});

export type BaseLibrary = z.infer<typeof BaseLibrarySchema>;

/**
 * Identifier type for flexible lookups
 */
export const IdentifierTypeSchema = z.enum(['uuid', 'slug', 'name']);

export type IdentifierType = z.infer<typeof IdentifierTypeSchema>;

/**
 * Parsed identifier (result of parsing any identifier string)
 */
export const ParsedIdentifierSchema = z.object({
  type: IdentifierTypeSchema,
  value: z.string(),
  /** Extracted name (for slug/name types) */
  name: z.string().optional(),
  /** Extracted framework (for slug type) */
  framework: FrameworkSchema.optional(),
  /** Extracted version (for name type with version) */
  version: VersionSchema.optional(),
});

export type ParsedIdentifier = z.infer<typeof ParsedIdentifierSchema>;

/**
 * Component identity information for manifest building
 *
 * Used by processor and manifest modules to pass identity information
 * through the extraction -> generation -> manifest build pipeline.
 */
export const ManifestIdentitySchema = z.object({
  /** Component UUID */
  id: z.string(),

  /** URL-friendly slug */
  slug: z.string(),

  /** Human-readable name */
  name: z.string(),

  /** Target framework */
  framework: FrameworkSchema,
});

export type ManifestIdentity = z.infer<typeof ManifestIdentitySchema>;
