/**
 * The shape of `generated/catalog.json`, which `generate-catalog.mjs` writes
 * and the docs install blocks read, and of each release catalog the
 * `nxds-cli` fetches from the registry. The generator and the CLI both
 * validate against these schemas, and the types are inferred from them.
 */
import path from 'node:path';
import { valid, validRange } from 'semver';
import { z } from 'zod';

/**
 * `value` as a POSIX path inside a folder, such as `ui/button.tsx`, or null
 * when it is absolute, leaves the folder, or holds a control character such
 * as a newline.
 */
export function relativePath(value: string) {
  const normalized = path.posix
    .normalize(value.replaceAll('\\', '/'))
    .replace(/\/+$/, '');
  if (
    [...normalized].some((char) => char < ' ' || char === '\u007f') ||
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:/.test(normalized) ||
    normalized === '.' ||
    normalized === '..' ||
    normalized.startsWith('../')
  ) {
    return null;
  }
  return normalized;
}

/** A path already in `relativePath`'s form. */
export const relativePathSchema = z
  .string()
  .refine(
    (value) => relativePath(value) === value,
    'must be a relative path that stays inside its folder'
  );

/** A release version such as `0.5.0`, exactly as `semver` prints it. */
export const versionSchema = z
  .string()
  .refine((value) => valid(value) === value, 'must be a release version');

/**
 * A semver range exactly as written: `validRange` trims its input and reads a
 * blank range as `*`, so padding and control characters are rejected first.
 */
const rangeSchema = z
  .string()
  .refine(
    (value) =>
      /^[ -~]+$/.test(value) &&
      value === value.trim() &&
      validRange(value) !== null,
    'must be a semver range'
  );

const npmNameSchema = z
  .string()
  .regex(
    /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/,
    'must be an npm package name'
  );

const frameworkSchema = z.enum(['react', 'vue']);

export type Framework = z.infer<typeof frameworkSchema>;

function isFramework(value: string): value is Framework {
  return frameworkSchema.safeParse(value).success;
}

/**
 * Each framework's variant. An object, not a record, so a release with a
 * framework this version doesn't know still parses, without that variant.
 */
function variantsSchema<V extends z.ZodType>(variant: V) {
  return z.object({
    react: variant.optional(),
    vue: variant.optional(),
  } satisfies Record<Framework, z.ZodOptional<V>>);
}

const catalogFileSchema = z.object({
  /** Relative to the project's nxds folder. */
  path: relativePathSchema,
  content: z.string(),
});

export type CatalogFile = z.infer<typeof catalogFileSchema>;

/** A change to the app's own files that the CLI's framework adapter makes. */
const setupStepSchema = z.enum([
  'add-css-import',
  'add-head-script',
  'wrap-root-with-provider',
]);

export type SetupStep = z.infer<typeof setupStepSchema>;

const npmPackagesSchema = z.record(npmNameSchema, rangeSchema);

/** A variant with `packages`, whose `css` names only files in its `files`. */
function variantWith<P extends z.ZodType>(packages: P) {
  return z
    .object({
      /** Other items this one needs, installed first. */
      items: z.array(z.string()),
      packages,
      files: z.array(catalogFileSchema),
      /** Files in `files` the nxds CSS entry imports. */
      css: z.array(relativePathSchema),
      steps: z.array(setupStepSchema),
    })
    .refine(
      ({ css, files }) =>
        css.every((entry) => files.some((file) => file.path === entry)),
      { path: ['css'], message: 'must name files in `files`' }
    );
}

const variantSchema = variantWith(z.object({ npm: npmPackagesSchema }));

export type Variant = z.infer<typeof variantSchema>;

const setupVariantSchema = variantWith(
  z.object({
    npm: npmPackagesSchema,
    /** The Tailwind range `init` installs, with the app's build plugin, when the app has no Tailwind. */
    tailwind: rangeSchema,
  })
);

export type SetupVariant = z.infer<typeof setupVariantSchema>;

const itemInfo = {
  name: z.string(),
  title: z.string(),
  description: z.string(),
  docs: z.string(),
};

const setupItemSchema = z.object({
  ...itemInfo,
  kind: z.literal('setup'),
  variants: variantsSchema(setupVariantSchema),
});

export type SetupItem = z.infer<typeof setupItemSchema>;

const catalogItemSchema = z.discriminatedUnion('kind', [
  setupItemSchema,
  z.object({
    ...itemInfo,
    kind: z.enum(['component', 'block']),
    variants: variantsSchema(variantSchema),
  }),
]);

export type CatalogItem = z.infer<typeof catalogItemSchema>;

/** The `schema` this package writes and the CLI reads. */
export const CATALOG_SCHEMA = 1;

export const catalogSchema = z.object({
  schema: z.literal(CATALOG_SCHEMA),
  /** The `@nxds/react` version this catalog was built from. */
  version: versionSchema,
  /** The frameworks the CLI installs. The docs copy also carries variants for others; a release catalog drops them. Names this version doesn't know are dropped too. */
  frameworks: z
    .array(z.string())
    .transform((frameworks) => frameworks.filter(isFramework)),
  items: z.array(catalogItemSchema),
});

export type Catalog = z.infer<typeof catalogSchema>;

// A record key's own issues are nested in its `invalid_key` issue.
function lines(issues: z.core.$ZodIssue[], prefix: PropertyKey[]): string[] {
  return issues.flatMap((issue) => {
    const at = [...prefix, ...issue.path];
    if (issue.code === 'invalid_key') return lines(issue.issues, at);
    return [
      `${at.length > 0 ? at.map(String).join('.') : '(root)'}: ${issue.message}`,
    ];
  });
}

/** Each issue as `path: message`, such as `items.3.variants.react.files: …`. */
export function issueLines(error: z.ZodError) {
  return lines(error.issues, []);
}

function installedVariants<V extends Variant>(
  variants: Partial<Record<Framework, V>>,
  frameworks: Framework[]
): Partial<Record<Framework, V>> {
  return Object.fromEntries(
    frameworks
      .filter((framework) => variants[framework])
      .map((framework) => [framework, variants[framework]])
  );
}

// Two returns, so each keeps its own variant type.
function releaseItem(item: CatalogItem, frameworks: Framework[]): CatalogItem {
  if (item.kind === 'setup') {
    return { ...item, variants: installedVariants(item.variants, frameworks) };
  }
  return { ...item, variants: installedVariants(item.variants, frameworks) };
}

/** `catalog` with only the variants the CLI installs: what a release publishes. */
export function releaseCatalog(catalog: Catalog): Catalog {
  return {
    ...catalog,
    items: catalog.items.map((item) => releaseItem(item, catalog.frameworks)),
  };
}
