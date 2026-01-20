import { z } from 'zod';

/**
 * Per-file tracking with checksum and timestamp
 */
export const InstalledFileSchema = z.object({
  /** SHA-256 hash of file content at install time */
  checksum: z
    .string()
    .length(64)
    .regex(/^[a-f0-9]+$/),
  /** ISO timestamp when file was installed */
  installedAt: z.string().datetime(),
});

export type InstalledFile = z.infer<typeof InstalledFileSchema>;

/**
 * Installed component tracking
 */
export const InstalledComponentSchema = z.object({
  /** Installed version (semver) */
  version: z.string(),
  /** Registry source hash (for 3-way merge base) */
  sourceHash: z
    .string()
    .length(64)
    .regex(/^[a-f0-9]+$/),
  /** Installed timestamp */
  installedAt: z.string().datetime(),
  /** Per-file checksums for modification detection */
  files: z.record(z.string(), InstalledFileSchema),
});

export type InstalledComponent = z.infer<typeof InstalledComponentSchema>;

/**
 * Complete nexus.json schema
 */
export const NexusConfigSchema = z.object({
  /** Schema version for migrations */
  $schema: z.string().optional(),

  /** Config format version */
  version: z.literal('1.0').default('1.0'),

  /** Output directory for components (relative to nexus.json) */
  componentPath: z.string().default('src/components/ui'),

  /** Target framework */
  framework: z.enum(['react', 'vue', 'svelte', 'angular']).default('react'),

  /** Tailwind CSS prefix (if using) */
  tailwindPrefix: z.string().optional(),

  /** TypeScript configuration */
  typescript: z
    .object({
      /** Use .tsx extension */
      tsx: z.boolean().default(true),
      /** Path aliases (e.g., "@/") */
      aliases: z.record(z.string(), z.string()).optional(),
    })
    .default({ tsx: true }),

  /** Registry URL override */
  registry: z
    .object({
      url: z.string().url().optional(),
    })
    .default({}),

  /** Installed components */
  components: z.record(z.string(), InstalledComponentSchema).default({}),
});

export type NexusConfig = z.infer<typeof NexusConfigSchema>;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<NexusConfig> = {
  version: '1.0',
  componentPath: 'src/components/ui',
  framework: 'react',
  typescript: { tsx: true },
  components: {},
};
