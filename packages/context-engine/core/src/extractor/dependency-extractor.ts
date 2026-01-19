/**
 * Dependency Extractor
 *
 * Extracts dependencies from import statements in component source code.
 * Identifies:
 * - NPM package dependencies (external packages)
 * - Internal dependencies (relative imports like ../utils)
 * - Base UI library detection (Radix, Ark, etc.)
 */

import { Project, type SourceFile, ts } from 'ts-morph';

import { detectBaseLibrary } from '../constants/index.js';
import { createLogger } from '../utils/logger.js';

import type { DependencyExtractionResult } from './types.js';

const logger = createLogger({ name: 'dependency-extractor' });

/**
 * Patterns indicating an internal component import
 */
const INTERNAL_COMPONENT_PATTERNS: ReadonlyArray<RegExp> = [
  /\/ui\//, // Common: ./ui/button
  /\/components\//, // Common: ./components/button
  /^[A-Z]/, // Starts with capital (component naming convention)
];

/**
 * Extracts dependencies from import statements
 */
export class DependencyExtractor {
  private project: Project;

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
      },
    });
  }

  /**
   * Extract dependencies from source code
   *
   * @param sourceCode - Component source code to parse
   * @param filePath - Optional file path for context
   * @returns Extracted npm and internal dependencies
   */
  extract(sourceCode: string, filePath?: string): DependencyExtractionResult {
    const fileName = filePath || 'component.tsx';

    // Guard: Empty source code
    if (!sourceCode.trim()) {
      return this.emptyResult();
    }

    const sourceFile = this.project.createSourceFile(fileName, sourceCode, {
      overwrite: true,
    });

    try {
      return this.extractDependencies(sourceFile);
    } catch (error) {
      logger.debug('Dependency extraction failed', {
        filePath,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return this.emptyResult();
    } finally {
      // Clean up to prevent memory accumulation
      this.project.removeSourceFile(sourceFile);
    }
  }

  /**
   * Extract all dependencies from a source file
   */
  private extractDependencies(
    sourceFile: SourceFile
  ): DependencyExtractionResult {
    const npmDependencies: Record<string, string> = {};
    const internalDependencies: string[] = [];
    let baseLibrary: string | undefined;

    for (const imp of sourceFile.getImportDeclarations()) {
      const moduleSpecifier = imp.getModuleSpecifierValue();
      const isTypeOnly = imp.isTypeOnly();

      // Process relative imports (internal dependencies)
      if (this.isRelativeImport(moduleSpecifier)) {
        const componentName = this.extractComponentName(moduleSpecifier);
        if (
          componentName &&
          this.isLikelyComponent(moduleSpecifier, componentName)
        ) {
          internalDependencies.push(componentName);
        }
        continue;
      }

      // Skip type-only imports for npm dependencies
      // They don't affect the bundle
      if (isTypeOnly) {
        continue;
      }

      // Process external package imports
      const packageName = this.extractPackageName(moduleSpecifier);
      if (packageName) {
        npmDependencies[packageName] = '*';

        // Check for base UI library (using centralized detection)
        const detectedLibrary = detectBaseLibrary(packageName);
        if (detectedLibrary && !baseLibrary) {
          baseLibrary = detectedLibrary;
        }
      }
    }

    // Dedupe internal dependencies
    const uniqueInternalDeps = [...new Set(internalDependencies)];

    logger.debug('Extracted dependencies', {
      npmCount: Object.keys(npmDependencies).length,
      internalCount: uniqueInternalDeps.length,
      baseLibrary,
    });

    return {
      npmDependencies,
      internalDependencies: uniqueInternalDeps,
      baseLibrary,
    };
  }

  /**
   * Check if an import is a relative import
   */
  private isRelativeImport(moduleSpecifier: string): boolean {
    return moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('/');
  }

  /**
   * Extract component name from a relative import path
   *
   * Examples:
   * - '../button' -> 'Button'
   * - './ui/button' -> 'Button'
   * - '../utils/cn' -> 'cn'
   * - './button/index' -> 'Button'
   */
  private extractComponentName(moduleSpecifier: string): string | null {
    // Match the last segment before /index or file extension
    const match = moduleSpecifier.match(
      /\/([^/]+?)(?:\/index)?(?:\.[jt]sx?)?$/
    );

    if (!match || !match[1]) {
      return null;
    }

    const segment = match[1];

    // Convert to PascalCase if it looks like a component path
    // but keep utils/helpers as-is
    if (this.isLikelyComponent(moduleSpecifier, segment)) {
      return this.toPascalCase(segment);
    }

    return segment;
  }

  /**
   * Check if an import is likely a component (vs utility/helper)
   */
  private isLikelyComponent(
    moduleSpecifier: string,
    componentName: string
  ): boolean {
    // Check if path contains component indicators
    for (const pattern of INTERNAL_COMPONENT_PATTERNS) {
      if (pattern.test(moduleSpecifier) || pattern.test(componentName)) {
        return true;
      }
    }

    // Exclude common utility imports
    const utilityNames = [
      'utils',
      'helpers',
      'lib',
      'hooks',
      'types',
      'cn',
      'clsx',
      'constants',
    ];
    if (utilityNames.includes(componentName.toLowerCase())) {
      return false;
    }

    // After filtering out known utilities, assume it's a component
    return true;
  }

  /**
   * Extract package name from an external import
   *
   * Handles:
   * - Scoped packages: @radix-ui/react-dialog -> @radix-ui/react-dialog
   * - Regular packages: react -> react
   * - Deep imports: lodash/debounce -> lodash
   */
  private extractPackageName(moduleSpecifier: string): string | null {
    // Guard: Don't process relative imports
    if (this.isRelativeImport(moduleSpecifier)) {
      return null;
    }

    // Handle scoped packages (@scope/package)
    if (moduleSpecifier.startsWith('@')) {
      const parts = moduleSpecifier.split('/');
      // Scoped package needs at least scope + package name
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }
      return moduleSpecifier;
    }

    // Handle regular packages (take first segment only)
    const parts = moduleSpecifier.split('/');
    return parts[0];
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Return empty result
   */
  private emptyResult(): DependencyExtractionResult {
    return {
      npmDependencies: {},
      internalDependencies: [],
      baseLibrary: undefined,
    };
  }
}
