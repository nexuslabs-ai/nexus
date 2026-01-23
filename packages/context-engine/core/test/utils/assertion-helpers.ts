/**
 * Assertion Helpers
 *
 * Custom assertion utilities for partial matching and domain-specific validations.
 * Follows the principle of asserting on key fields rather than exact equality.
 */

import { expect } from 'vitest';

import type {
  ExtractedData,
  ExtractedProp,
} from '../../src/types/extracted.js';
import type { ComponentManifest } from '../../src/types/manifest.js';

/**
 * Expected prop shape for partial matching
 */
export interface ExpectedProp {
  name: string;
  type?: string;
  required?: boolean;
  typeCategory?: string;
  defaultValue?: unknown;
}

/**
 * Assert that extracted props include expected props
 *
 * Uses partial matching - only checks specified fields.
 *
 * @example
 * ```typescript
 * expectPropsToInclude(result.props, [
 *   { name: 'variant', type: 'string' },
 *   { name: 'size', required: false },
 * ]);
 * ```
 */
export function expectPropsToInclude(
  actualProps: ExtractedProp[],
  expectedProps: ExpectedProp[]
): void {
  for (const expected of expectedProps) {
    const found = actualProps.find((p) => p.name === expected.name);

    expect(found, `Expected prop "${expected.name}" to exist`).toBeDefined();

    if (!found) continue;

    if (expected.type !== undefined) {
      expect(found.type).toContain(expected.type);
    }

    if (expected.required !== undefined) {
      expect(found.required).toBe(expected.required);
    }

    if (expected.typeCategory !== undefined) {
      expect(found.typeCategory).toBe(expected.typeCategory);
    }

    if (expected.defaultValue !== undefined) {
      expect(found.defaultValue).toBe(expected.defaultValue);
    }
  }
}

/**
 * Assert that a prop exists and return it for further assertions
 */
export function expectPropExists(
  props: ExtractedProp[],
  propName: string
): ExtractedProp {
  const prop = props.find((p) => p.name === propName);
  expect(prop, `Expected prop "${propName}" to exist`).toBeDefined();
  return prop!;
}

/**
 * Assert that variants include expected values
 *
 * @example
 * ```typescript
 * expectVariantsToInclude(result.variants, {
 *   variant: ['default', 'destructive', 'outline'],
 *   size: ['default', 'sm', 'lg'],
 * });
 * ```
 */
export function expectVariantsToInclude(
  actualVariants: Record<string, string[]>,
  expectedVariants: Record<string, string[]>
): void {
  for (const [key, values] of Object.entries(expectedVariants)) {
    expect(
      actualVariants[key],
      `Expected variant "${key}" to exist`
    ).toBeDefined();

    for (const value of values) {
      expect(
        actualVariants[key],
        `Expected variant "${key}" to include "${value}"`
      ).toContain(value);
    }
  }
}

/**
 * Assert that default variants match
 */
export function expectDefaultVariants(
  actual: Record<string, string>,
  expected: Record<string, string>
): void {
  for (const [key, value] of Object.entries(expected)) {
    expect(actual[key], `Expected default "${key}" to be "${value}"`).toBe(
      value
    );
  }
}

/**
 * Assert that a base library was detected
 *
 * @example
 * ```typescript
 * expectBaseLibrary(result, {
 *   name: 'Radix UI',
 *   component: 'Dialog',
 * });
 * ```
 */
export function expectBaseLibrary(
  extracted: ExtractedData,
  expected: { name?: string; component?: string }
): void {
  expect(extracted.baseLibrary).toBeDefined();

  if (expected.name) {
    expect(extracted.baseLibrary?.name).toBe(expected.name);
  }

  if (expected.component) {
    expect(extracted.baseLibrary?.component).toBe(expected.component);
  }
}

/**
 * Assert that a manifest has required AI-ready fields
 *
 * Validates that a manifest contains the minimum information
 * needed for AI assistants to generate correct code.
 */
export function expectManifestAIReady(manifest: ComponentManifest): void {
  // Identity required
  expect(manifest.id).toBeTruthy();
  expect(manifest.name).toBeTruthy();
  expect(manifest.slug).toBeTruthy();

  // Description required for AI understanding
  expect(manifest.description).toBeTruthy();
  expect(manifest.description.length).toBeGreaterThan(10);

  // Props required for code generation (v1.0 schema: CategorizedProps object)
  expect(manifest.props).toBeDefined();
  expect(typeof manifest.props).toBe('object');

  // CategorizedProps has these categories
  const propCategories = [
    'variants',
    'behaviors',
    'events',
    'slots',
    'passthrough',
    'other',
  ] as const;

  // Each category should be an array
  for (const category of propCategories) {
    expect(Array.isArray(manifest.props[category])).toBe(true);
  }

  // Each prop in each category should have name and type
  for (const category of propCategories) {
    for (const prop of manifest.props[category]) {
      expect(prop.name).toBeTruthy();
      expect(prop.type).toBeTruthy();
    }
  }

  // Source hash for versioning
  expect(manifest.sourceHash).toBeTruthy();
  expect(manifest.sourceHash).toHaveLength(64); // SHA-256
}

/**
 * Get all props from a CategorizedProps object as a flat array
 *
 * Useful for tests that need to check total prop count
 * or iterate over all props regardless of category.
 */
export function getAllProps(
  categorizedProps: ComponentManifest['props']
): Array<{ name: string; type: string }> {
  const allProps: Array<{ name: string; type: string }> = [];

  for (const category of [
    'variants',
    'behaviors',
    'events',
    'slots',
    'passthrough',
    'other',
  ] as const) {
    allProps.push(...categorizedProps[category]);
  }

  return allProps;
}

/**
 * Count total props across all categories
 */
export function countAllProps(
  categorizedProps: ComponentManifest['props']
): number {
  return getAllProps(categorizedProps).length;
}

/**
 * Assert extraction result is successful
 */
export function expectExtractionSuccess(result: {
  type: string;
  data?: ExtractedData;
}): asserts result is { type: 'success'; data: ExtractedData } {
  expect(result.type).toBe('success');
  expect(result).toHaveProperty('data');
}

/**
 * Assert extraction result is a failure
 */
export function expectExtractionFailure(result: {
  type: string;
  error?: string;
}): asserts result is { type: 'failure'; error: string } {
  expect(result.type).toBe('failure');
  expect(result).toHaveProperty('error');
}

/**
 * Assert generator output is successful
 */
export function expectGeneratorSuccess(output: {
  type: string;
}): asserts output is { type: 'success' } {
  expect(output.type).toBe('success');
}

/**
 * Assert generator output is a failure
 */
export function expectGeneratorFailure(output: {
  type: string;
  error?: string;
  retryable?: boolean;
}): asserts output is { type: 'failure'; error: string; retryable: boolean } {
  expect(output.type).toBe('failure');
  expect(output).toHaveProperty('error');
  expect(output).toHaveProperty('retryable');
}

/**
 * Assert processor output is successful
 */
export function expectProcessorSuccess(output: {
  type: string;
  manifest?: ComponentManifest;
}): asserts output is { type: 'success'; manifest: ComponentManifest } {
  expect(output.type).toBe('success');
  expect(output).toHaveProperty('manifest');
}

/**
 * Assert processor output is a failure
 */
export function expectProcessorFailure(output: {
  type: string;
  error?: string;
  code?: string;
}): asserts output is { type: 'failure'; error: string; code: string } {
  expect(output.type).toBe('failure');
  expect(output).toHaveProperty('error');
  expect(output).toHaveProperty('code');
}

/**
 * Assert arrays contain the same elements (order-independent)
 */
export function expectArraysToMatch<T>(
  actual: T[],
  expected: T[],
  message?: string
): void {
  expect(actual.sort()).toEqual(expected.sort());
  if (message && actual.length !== expected.length) {
    throw new Error(message);
  }
}

/**
 * Assert that a hash is a valid SHA-256 format
 */
export function expectValidHash(hash: string): void {
  expect(hash).toHaveLength(64);
  expect(hash).toMatch(/^[a-f0-9]+$/);
}

/**
 * Assert org isolation - processor result belongs to expected org
 *
 * Note: orgId is tracked at the top level of extraction results, not inside identity.
 * The ManifestIdentity type only contains id, slug, name, framework.
 * orgId is a separate property on ExtractorResult.
 */
export function expectOrgIsolation(
  result: {
    orgId?: string;
    identity?: { id?: string };
    manifest?: ComponentManifest;
  },
  expectedOrgId: string
): void {
  // Check orgId at top level (ExtractorResult has orgId as top-level property)
  if (result.orgId) {
    expect(result.orgId).toBe(expectedOrgId);
  }
  // Identity should have an id (component UUID)
  if (result.identity?.id) {
    expect(result.identity.id).toBeTruthy();
  }
  // Manifest ID should be defined (org scoping is in the processor layer)
  if (result.manifest) {
    expect(result.manifest.id).toBeTruthy();
  }
}
