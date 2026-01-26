/**
 * Fixture Loader
 *
 * Utilities for loading component fixture files for testing.
 * Supports loading from:
 * - 'nexus': Live components from packages/react/src/components/ui/
 * - 'edge-cases': Edge case fixtures from test/fixtures/components/edge-cases/
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  listAvailableComponents,
  loadNexusComponent,
  nexusComponentExists,
} from './nexus-fixture-loader.js';
import { TEST_ORG_ID } from './test-constants.js';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base path for edge-case fixtures
const FIXTURES_BASE = resolve(__dirname, '../fixtures/components');

/**
 * Fixture category types
 * - 'nexus': Live components from packages/react
 * - 'edge-cases': Edge case test fixtures
 */
export type FixtureCategory = 'nexus' | 'edge-cases';

/**
 * Fixture metadata
 */
export interface ComponentFixture {
  /** Component name (e.g., 'Button') */
  name: string;

  /** Source code content */
  sourceCode: string;

  /** File path */
  filePath: string;

  /** Fixture category */
  category: FixtureCategory;

  /** Stories source code (nexus only) */
  storiesCode?: string;

  /** Stories file path (nexus only) */
  storiesFilePath?: string;

  /** Expected component exports */
  expectedExports?: string[];
}

/**
 * Load a component fixture by category and name
 *
 * @param category - Fixture category ('nexus' or 'edge-cases')
 * @param name - Component file name (without extension, kebab-case for nexus)
 * @returns ComponentFixture with source code and metadata
 *
 * @example
 * ```typescript
 * // Load from packages/react
 * const fixture = loadFixture('nexus', 'button');
 *
 * // Load edge case
 * const edgeCase = loadFixture('edge-cases', 'no-variants');
 * ```
 */
export function loadFixture(
  category: FixtureCategory,
  name: string
): ComponentFixture {
  if (category === 'nexus') {
    return loadNexusFixture(name);
  }

  return loadEdgeCaseFixture(name);
}

/**
 * Load a nexus component from packages/react
 */
function loadNexusFixture(name: string): ComponentFixture {
  const nexusFixture = loadNexusComponent(name);

  // Convert kebab-case to PascalCase for component name
  const componentName = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

  return {
    name: componentName,
    sourceCode: nexusFixture.sourceCode,
    filePath: nexusFixture.componentPath,
    category: 'nexus',
    storiesCode: nexusFixture.storiesCode,
    storiesFilePath: nexusFixture.storiesPath,
  };
}

/**
 * Load an edge case fixture
 */
function loadEdgeCaseFixture(name: string): ComponentFixture {
  const filePath = join(FIXTURES_BASE, 'edge-cases', `${name}.tsx`);

  if (!existsSync(filePath)) {
    throw new Error(`Fixture not found: edge-cases/${name}.tsx at ${filePath}`);
  }

  const sourceCode = readFileSync(filePath, 'utf-8');

  // Extract component name from file name (capitalize first letter)
  const componentName = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    name: componentName,
    sourceCode,
    filePath: `edge-cases/${name}.tsx`,
    category: 'edge-cases',
  };
}

/**
 * Load all fixtures from a category
 *
 * @param category - Fixture category
 * @returns Array of ComponentFixture objects
 */
export function loadAllFixtures(category: FixtureCategory): ComponentFixture[] {
  if (category === 'nexus') {
    const componentNames = listAvailableComponents();
    return componentNames.map((name) => loadNexusFixture(name));
  }

  const categoryPath = join(FIXTURES_BASE, 'edge-cases');

  if (!existsSync(categoryPath)) {
    return [];
  }

  const files = readdirSync(categoryPath).filter((f: string) =>
    f.endsWith('.tsx')
  );

  return files.map((file: string) => {
    const name = file.replace('.tsx', '');
    return loadEdgeCaseFixture(name);
  });
}

/**
 * Load a fixture as extraction input
 *
 * Convenience function that returns a fixture formatted
 * for use with the extractor.
 */
export function loadFixtureAsInput(
  category: FixtureCategory,
  name: string,
  orgId?: string
): {
  orgId: string;
  name: string;
  sourceCode: string;
  filePath: string;
  framework: 'react';
  storiesCode?: string;
  storiesFilePath?: string;
} {
  const fixture = loadFixture(category, name);

  return {
    orgId: orgId ?? TEST_ORG_ID,
    name: fixture.name,
    sourceCode: fixture.sourceCode,
    filePath: fixture.filePath,
    framework: 'react',
    storiesCode: fixture.storiesCode,
    storiesFilePath: fixture.storiesFilePath,
  };
}

/**
 * Get the path to a fixture file
 */
export function getFixturePath(
  category: FixtureCategory,
  name: string
): string {
  if (category === 'nexus') {
    if (!nexusComponentExists(name)) {
      throw new Error(`Nexus component not found: ${name}`);
    }
    const fixture = loadNexusComponent(name);
    return fixture.componentPath;
  }

  return join(FIXTURES_BASE, 'edge-cases', `${name}.tsx`);
}

/**
 * Check if a fixture exists
 */
export function fixtureExists(
  category: FixtureCategory,
  name: string
): boolean {
  if (category === 'nexus') {
    return nexusComponentExists(name);
  }

  return existsSync(join(FIXTURES_BASE, 'edge-cases', `${name}.tsx`));
}

/**
 * Get list of available nexus components
 */
export function getAvailableNexusComponents(): string[] {
  return listAvailableComponents();
}
