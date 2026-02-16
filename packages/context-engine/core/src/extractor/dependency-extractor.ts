/**
 * Dependency Extractor
 *
 * Designed for Radix-based design systems (shadcn/ui pattern).
 *
 * Extracts dependencies from import statements in component source code.
 * Identifies:
 * - NPM package dependencies (external packages)
 * - Internal dependencies (relative imports or path alias imports like @/utils)
 * - Radix UI primitive detection (@radix-ui/react-*)
 *
 * Supports project configuration for accurate internal vs external detection:
 * - Path aliases from tsconfig.json (e.g., @/* -> ./src/*)
 * - Dependencies list from package.json for external package detection
 */

import { Project, type SourceFile, ts } from 'ts-morph';

import { detectBaseLibrary } from '../constants/index.js';
import { pascalCase } from '../utils/case.js';
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
 * Options for configuring the dependency extractor
 */
export interface DependencyExtractorOptions {
  /**
   * Path aliases from tsconfig.json paths configuration.
   * Used to identify internal imports that use path aliases.
   *
   * @example
   * ```typescript
   * {
   *   "@/*": ["./src/*"],
   *   "@components/*": ["./src/components/*"]
   * }
   * ```
   */
  pathAliases?: Record<string, string[]>;

  /**
   * List of dependency names from package.json.
   * Used to identify external package imports.
   *
   * @example ["react", "class-variance-authority", "@radix-ui/react-slot"]
   */
  dependencies?: string[];
}

/**
 * Extracts dependencies from import statements
 */
export class DependencyExtractor {
  private project: Project;
  private pathAliases: Record<string, string[]>;
  private dependencies: Set<string>;
  private pathAliasPatterns: RegExp[];

  constructor(options: DependencyExtractorOptions = {}) {
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
      },
    });

    this.pathAliases = options.pathAliases ?? {};
    this.dependencies = new Set(options.dependencies ?? []);

    // Pre-compile path alias patterns for efficient matching
    this.pathAliasPatterns = this.compilePathAliasPatterns(this.pathAliases);
  }

  /**
   * Compile path alias keys into regex patterns for matching
   *
   * Converts tsconfig path patterns like "@/*" into regex patterns
   * that can match import specifiers like "@/utils/cn"
   */
  private compilePathAliasPatterns(
    pathAliases: Record<string, string[]>
  ): RegExp[] {
    return Object.keys(pathAliases).map((alias) => {
      // Convert path alias pattern to regex
      // "@/*" -> "^@/" (matches @/anything)
      // "@components/*" -> "^@components/" (matches @components/anything)
      // "~/*" -> "^~/" (matches ~/anything)
      const escapedAlias = alias
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
        .replace(/\\\*/g, '.*'); // Convert * to .* for matching

      return new RegExp(`^${escapedAlias.replace(/\/\.\*$/, '(/|$)')}`);
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

      // Process internal imports (relative imports or path alias imports)
      if (this.isInternalImport(moduleSpecifier)) {
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
   * Check if an import is internal (relative import or path alias)
   *
   * An import is internal if:
   * 1. It starts with './' or '../' (relative import)
   * 2. It starts with '/' (absolute path from project root)
   * 3. It matches a path alias pattern (e.g., '@/', '@components/')
   *
   * An import is external if:
   * 1. It's in the dependencies list
   * 2. It doesn't match any internal patterns
   */
  private isInternalImport(moduleSpecifier: string): boolean {
    // Check for relative imports
    if (moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('/')) {
      return true;
    }

    // If we have a dependencies list, check if the package is in it
    // This takes priority over path alias matching to avoid false positives
    // (e.g., @radix-ui/react-slot shouldn't match @/* alias)
    if (this.dependencies.size > 0) {
      const packageName = this.getPackageNameFromSpecifier(moduleSpecifier);
      if (packageName && this.dependencies.has(packageName)) {
        return false; // It's a known external dependency
      }
    }

    // Check if it matches any path alias pattern
    if (this.matchesPathAlias(moduleSpecifier)) {
      return true;
    }

    return false;
  }

  /**
   * Extract the package name from a module specifier for dependency lookup
   *
   * Examples:
   * - 'react' -> 'react'
   * - 'react/jsx-runtime' -> 'react'
   * - '@radix-ui/react-slot' -> '@radix-ui/react-slot'
   * - '@radix-ui/react-slot/internal' -> '@radix-ui/react-slot'
   */
  private getPackageNameFromSpecifier(moduleSpecifier: string): string | null {
    if (moduleSpecifier.startsWith('@')) {
      // Scoped package: @scope/package or @scope/package/subpath
      const parts = moduleSpecifier.split('/');
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }
      return null;
    }

    // Regular package: package or package/subpath
    const parts = moduleSpecifier.split('/');
    return parts[0] || null;
  }

  /**
   * Check if a module specifier matches any configured path alias
   */
  private matchesPathAlias(moduleSpecifier: string): boolean {
    return this.pathAliasPatterns.some((pattern) =>
      pattern.test(moduleSpecifier)
    );
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
      return pascalCase(segment);
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
    // Guard: Don't process internal imports (relative or path alias)
    if (this.isInternalImport(moduleSpecifier)) {
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
