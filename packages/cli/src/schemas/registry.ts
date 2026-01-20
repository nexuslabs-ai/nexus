import { z } from 'zod';

/**
 * Component manifest from registry
 */
export const ComponentManifestSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  version: z.string(),
  framework: z.enum(['react', 'vue', 'svelte', 'angular']),
  description: z.string(),
  tier: z.enum(['free', 'pro']),

  /** Component props */
  props: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string().optional(),
    })
  ),

  /** Variants from CVA */
  variants: z.record(z.string(), z.array(z.string())),

  /** Dependencies */
  dependencies: z.object({
    npm: z.record(z.string(), z.string()),
    internal: z.array(z.string()),
  }),

  /** File list */
  files: z.array(z.string()),

  /** Source hash for change detection */
  sourceHash: z.string().length(64),

  updatedAt: z.string().datetime(),
});

export type ComponentManifest = z.infer<typeof ComponentManifestSchema>;

/**
 * Component version entry
 */
export const ComponentVersionSchema = z.object({
  version: z.string(),
  sourceHash: z.string().length(64),
  releasedAt: z.string().datetime(),
  changelog: z.string().optional(),
});

export type ComponentVersion = z.infer<typeof ComponentVersionSchema>;

/**
 * Source code response
 */
export const SourceCodeResponseSchema = z.object({
  files: z.record(z.string(), z.string()),
  sourceHash: z.string().length(64),
  version: z.string(),
});

export type SourceCodeResponse = z.infer<typeof SourceCodeResponseSchema>;

/**
 * Auth validation response
 */
export const AuthResponseSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  organization: z.string(),
  organizationId: z.string().uuid(),
  expiresAt: z.string().datetime(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/**
 * Component list response
 */
export const ComponentListResponseSchema = z.object({
  components: z.array(ComponentManifestSchema),
  total: z.number(),
});

export type ComponentListResponse = z.infer<typeof ComponentListResponseSchema>;
