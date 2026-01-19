/**
 * Fixture Loader
 *
 * Utilities for loading component fixture files for testing.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { TEST_ORG_ID } from './test-constants.js';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base path for fixtures
const FIXTURES_BASE = resolve(__dirname, '../fixtures/components');

/**
 * Fixture metadata
 */
export interface ComponentFixture {
  /** Component name (e.g., 'Button') */
  name: string;

  /** Source code content */
  sourceCode: string;

  /** File path (relative to fixtures directory) */
  filePath: string;

  /** Fixture category (e.g., 'shadcn', 'edge-cases') */
  category: string;

  /** Expected component exports */
  expectedExports?: string[];
}

/**
 * Load a component fixture by category and name
 *
 * @param category - Fixture category ('shadcn' or 'edge-cases')
 * @param name - Component file name (without extension)
 * @returns ComponentFixture with source code and metadata
 *
 * @example
 * ```typescript
 * const fixture = loadFixture('shadcn', 'button');
 * console.log(fixture.sourceCode);
 * ```
 */
export function loadFixture(
  category: 'shadcn' | 'edge-cases',
  name: string
): ComponentFixture {
  const filePath = join(FIXTURES_BASE, category, `${name}.tsx`);

  if (!existsSync(filePath)) {
    throw new Error(
      `Fixture not found: ${category}/${name}.tsx at ${filePath}`
    );
  }

  const sourceCode = readFileSync(filePath, 'utf-8');

  // Extract component name from file name (capitalize first letter)
  const componentName = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    name: componentName,
    sourceCode,
    filePath: `${category}/${name}.tsx`,
    category,
  };
}

/**
 * Load all fixtures from a category
 *
 * @param category - Fixture category
 * @returns Array of ComponentFixture objects
 */
export function loadAllFixtures(
  category: 'shadcn' | 'edge-cases'
): ComponentFixture[] {
  const categoryPath = join(FIXTURES_BASE, category);

  if (!existsSync(categoryPath)) {
    return [];
  }

  const files = readdirSync(categoryPath).filter((f: string) =>
    f.endsWith('.tsx')
  );

  return files.map((file: string) => {
    const name = file.replace('.tsx', '');
    return loadFixture(category, name);
  });
}

/**
 * Load a fixture as extraction input
 *
 * Convenience function that returns a fixture formatted
 * for use with the extractor.
 */
export function loadFixtureAsInput(
  category: 'shadcn' | 'edge-cases',
  name: string,
  orgId?: string
): {
  orgId: string;
  name: string;
  sourceCode: string;
  filePath: string;
  framework: 'react';
} {
  const fixture = loadFixture(category, name);

  return {
    orgId: orgId ?? TEST_ORG_ID,
    name: fixture.name,
    sourceCode: fixture.sourceCode,
    filePath: fixture.filePath,
    framework: 'react',
  };
}

/**
 * Get the path to a fixture file
 */
export function getFixturePath(
  category: 'shadcn' | 'edge-cases',
  name: string
): string {
  return join(FIXTURES_BASE, category, `${name}.tsx`);
}

/**
 * Check if a fixture exists
 */
export function fixtureExists(
  category: 'shadcn' | 'edge-cases',
  name: string
): boolean {
  return existsSync(getFixturePath(category, name));
}
