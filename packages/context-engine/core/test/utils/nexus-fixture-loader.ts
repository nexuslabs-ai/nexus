/**
 * Nexus Fixture Loader
 *
 * Provides direct access to @nexus/react components from the monorepo.
 * No file duplication - tests always use latest component versions.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Path to @nexus/react UI components.
 * Structure: packages/react/src/components/ui/{name}.tsx
 */
const REACT_COMPONENTS_PATH = resolve(
  __dirname,
  '../../../../react/src/components/ui'
);

/**
 * Components to exclude from testing.
 * Empty for now - all components are included.
 * Add component names (kebab-case) here to skip them in future if needed.
 */
const EXCLUDED_COMPONENTS: string[] = [];

/**
 * Nexus component fixture with component and stories source code
 */
export interface NexusComponentFixture {
  /** Component name (kebab-case) */
  name: string;

  /** Component source code */
  sourceCode: string;

  /** Storybook stories source code */
  storiesCode: string;

  /** Absolute path to component file */
  componentPath: string;

  /** Absolute path to stories file */
  storiesPath: string;
}

/**
 * Convert kebab-case to PascalCase
 * @example kebabToPascal('button') => 'Button'
 * @example kebabToPascal('date-picker') => 'DatePicker'
 */
export function kebabToPascal(name: string): string {
  return name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

/**
 * Load a component and its stories directly from @nexus/react
 *
 * @param componentName - kebab-case name (e.g., 'button', 'badge')
 * @returns NexusComponentFixture with source code and paths
 *
 * @example
 * ```typescript
 * const fixture = loadNexusComponent('button');
 * console.log(fixture.sourceCode);
 * console.log(fixture.storiesCode);
 * ```
 */
export function loadNexusComponent(
  componentName: string
): NexusComponentFixture {
  // Component file: ui/button.tsx (kebab-case)
  const componentPath = join(REACT_COMPONENTS_PATH, `${componentName}.tsx`);

  // Stories file: ui/Button.stories.tsx (PascalCase)
  const pascalName = kebabToPascal(componentName);
  const storiesPath = join(REACT_COMPONENTS_PATH, `${pascalName}.stories.tsx`);

  if (!existsSync(componentPath)) {
    throw new Error(
      `Nexus component not found: ${componentName}.tsx at ${componentPath}`
    );
  }

  if (!existsSync(storiesPath)) {
    throw new Error(
      `Nexus stories not found: ${pascalName}.stories.tsx at ${storiesPath}`
    );
  }

  return {
    name: componentName,
    sourceCode: readFileSync(componentPath, 'utf-8'),
    storiesCode: readFileSync(storiesPath, 'utf-8'),
    componentPath,
    storiesPath,
  };
}

/**
 * Discover and list all available components in @nexus/react.
 * Excludes components in EXCLUDED_COMPONENTS array.
 * A component is valid if it has both a .tsx file and a .stories.tsx file.
 *
 * @returns Array of component names (kebab-case)
 *
 * @example
 * ```typescript
 * const components = listAvailableComponents();
 * // ['button', 'badge']
 * ```
 */
export function listAvailableComponents(): string[] {
  if (!existsSync(REACT_COMPONENTS_PATH)) {
    return [];
  }

  // Get all .tsx files that are NOT .stories.tsx
  const componentFiles = readdirSync(REACT_COMPONENTS_PATH).filter(
    (file: string) => file.endsWith('.tsx') && !file.includes('.stories.')
  );

  return componentFiles
    .map((file: string) => file.replace('.tsx', ''))
    .filter((name: string) => {
      // Skip excluded components
      if (EXCLUDED_COMPONENTS.includes(name)) {
        return false;
      }

      // Verify stories file exists
      const pascalName = kebabToPascal(name);
      const storiesPath = join(
        REACT_COMPONENTS_PATH,
        `${pascalName}.stories.tsx`
      );

      return existsSync(storiesPath);
    });
}

/**
 * Load ALL available components from @nexus/react.
 * Automatically discovers components - no hardcoded list.
 *
 * @returns Array of NexusComponentFixture objects
 *
 * @example
 * ```typescript
 * const allComponents = loadAllNexusComponents();
 * allComponents.forEach(fixture => {
 *   console.log(`${fixture.name}: ${fixture.sourceCode.length} chars`);
 * });
 * ```
 */
export function loadAllNexusComponents(): NexusComponentFixture[] {
  const componentNames = listAvailableComponents();
  return componentNames.map((name) => loadNexusComponent(name));
}

/**
 * Check if a Nexus component exists and has stories
 *
 * @param componentName - kebab-case component name
 * @returns true if both component and stories files exist
 */
export function nexusComponentExists(componentName: string): boolean {
  const componentPath = join(REACT_COMPONENTS_PATH, `${componentName}.tsx`);
  const pascalName = kebabToPascal(componentName);
  const storiesPath = join(REACT_COMPONENTS_PATH, `${pascalName}.stories.tsx`);

  return existsSync(componentPath) && existsSync(storiesPath);
}
