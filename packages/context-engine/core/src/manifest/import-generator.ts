/**
 * Import Statement Generator
 *
 * Generates import statement variants for component manifests.
 * Provides primary, type-only, and subpath import forms for AI consumption.
 */

import type { ImportStatement } from '../types/import-statement.js';
import { kebabCase } from '../utils/case.js';

/**
 * Options for generating import statements
 */
export interface ImportGeneratorOptions {
  /** Component name (PascalCase) */
  componentName: string;

  /** Package name to import from */
  packageName?: string;

  /** Whether the package supports subpath exports */
  hasSubpathExports?: boolean;
}

/**
 * Default package name when not specified
 */
const DEFAULT_PACKAGE_NAME = '@nexus/react';

/**
 * Generate import statement variants for a component
 *
 * Creates multiple import forms that AI assistants can use
 * when generating code with the component.
 *
 * @example
 * ```typescript
 * const imports = generateImportStatement({
 *   componentName: 'Button',
 *   packageName: '@nexus/react',
 *   hasSubpathExports: true,
 * });
 *
 * // Result:
 * // {
 * //   primary: "import { Button } from '@nexus/react'",
 * //   typeOnly: "import type { ButtonProps } from '@nexus/react'",
 * //   subpath: "import { Button } from '@nexus/react/button'"
 * // }
 * ```
 */
export function generateImportStatement(
  options: ImportGeneratorOptions
): ImportStatement {
  const {
    componentName,
    packageName = DEFAULT_PACKAGE_NAME,
    hasSubpathExports = false,
  } = options;

  const result: ImportStatement = {
    primary: `import { ${componentName} } from '${packageName}'`,
  };

  // Add type-only import for props
  result.typeOnly = `import type { ${componentName}Props } from '${packageName}'`;

  // Add subpath import if supported
  if (hasSubpathExports) {
    const kebabName = kebabCase(componentName);
    result.subpath = `import { ${componentName} } from '${packageName}/${kebabName}'`;
  }

  return result;
}

/**
 * Derive package name from extracted dependencies
 *
 * Attempts to find the main package that exports this component
 * by analyzing the extracted npm dependencies.
 *
 * @param npmDependencies - Record of npm package dependencies
 * @returns The package name or undefined if not found
 */
export function derivePackageName(
  npmDependencies: Record<string, string>
): string | undefined {
  // Common design system package patterns
  const designSystemPatterns = [
    /^@[a-z-]+\/react$/,
    /^@[a-z-]+\/components$/,
    /^@[a-z-]+\/ui$/,
  ];

  // Check for design system packages first
  for (const dep of Object.keys(npmDependencies)) {
    if (designSystemPatterns.some((pattern) => pattern.test(dep))) {
      return dep;
    }
  }

  // Fall back to the first scoped package that looks like a component library
  for (const dep of Object.keys(npmDependencies)) {
    if (dep.startsWith('@') && !dep.includes('types')) {
      return dep;
    }
  }

  return undefined;
}
