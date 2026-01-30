/**
 * Variant Extractor
 *
 * Extracts CVA (class-variance-authority) and tailwind-variants
 * variants from component source code using ts-morph AST parsing.
 *
 * Always uses ts-morph since this is pure AST-based extraction
 * that requires no type resolution.
 *
 * Usage Pattern:
 * 1. Call extractAll() first to parse all variants from the file
 * 2. Call matchForComponent() to get variants for a specific component
 */

import {
  type CallExpression,
  type Node,
  type ObjectLiteralExpression,
  Project,
  type SourceFile,
  SyntaxKind,
  ts,
} from 'ts-morph';

import { camelCase } from '../utils/case.js';
import { createLogger } from '../utils/logger.js';

import type { VariantExtractionResult } from './types.js';

const logger = createLogger({ name: 'variant-extractor' });

/**
 * Supported variant function names
 */
const VARIANT_FUNCTIONS = ['cva', 'tv'] as const;
type VariantFunction = (typeof VARIANT_FUNCTIONS)[number];

/**
 * Extracts CVA (class-variance-authority) variants from source code
 * Also supports tailwind-variants (tv) with the same pattern
 */
export class VariantExtractor {
  private project: Project;

  /**
   * Stores all extracted variants keyed by variable name (e.g., "buttonVariants")
   * Must call extractAll() before accessing
   */
  private allVariants: Map<string, VariantExtractionResult> | null = null;

  /**
   * Maps component names to the variant variable names they use
   * A component can use multiple variants (e.g., Button uses buttonVariants + iconVariants)
   */
  private componentToVariants: Map<string, string[]> | null = null;

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
      },
    });
  }

  /**
   * Extract ALL cva/tv calls from source code and store them keyed by variable name
   *
   * Must be called before matchForComponent(). Extracts and stores all variant
   * definitions found in the file, keyed by their variable names (e.g., "buttonVariants").
   *
   * @param sourceCode - Component source code to parse
   * @param filePath - Optional file path for context
   */
  extractAll(sourceCode: string, filePath?: string): void {
    const fileName = filePath || 'component.tsx';

    // Reset state
    this.allVariants = new Map();
    this.componentToVariants = new Map();

    // Guard: Empty source code
    if (!sourceCode.trim()) {
      return;
    }

    const sourceFile = this.project.createSourceFile(fileName, sourceCode, {
      overwrite: true,
    });

    try {
      this.extractVariantsToMap(sourceFile);
      this.buildComponentToVariantsMap(sourceFile);
    } catch (error) {
      logger.debug('Variant extraction failed', {
        filePath,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Keep empty map on error
    } finally {
      // Clean up to prevent memory accumulation
      this.project.removeSourceFile(sourceFile);
    }
  }

  /**
   * Match a component name to its variants from the previously extracted data
   *
   * Must call extractAll() first. First tries to find variants by actual usage
   * in the component's body, then falls back to camelCase naming convention
   * (e.g., "Button" -> look for "buttonVariants").
   *
   * @param componentName - The component name to find variants for (e.g., "Button", "DialogContent")
   * @returns Extracted variants and defaults for the component, or empty result if no match
   * @throws Error if extractAll() was not called first
   */
  matchForComponent(componentName: string): VariantExtractionResult {
    if (this.allVariants === null || this.componentToVariants === null) {
      throw new Error('extractAll() must be called before matchForComponent()');
    }

    // First, try to find by actual usage
    const usedVariantNames = this.componentToVariants.get(componentName);

    if (usedVariantNames && usedVariantNames.length > 0) {
      // Merge all variants this component uses
      const mergedVariants: Record<string, string[]> = {};
      const mergedDefaults: Record<string, string> = {};

      for (const varName of usedVariantNames) {
        const result = this.allVariants.get(varName);
        if (result) {
          Object.assign(mergedVariants, result.variants);
          Object.assign(mergedDefaults, result.defaultVariants);
        }
      }

      logger.debug('Matched variants for component by usage', {
        componentName,
        usedVariantNames,
        variantCount: Object.keys(mergedVariants).length,
      });

      return { variants: mergedVariants, defaultVariants: mergedDefaults };
    }

    // Fallback: try name-based matching (for edge cases)
    const expectedVarName = `${camelCase(componentName)}Variants`;
    const result = this.allVariants.get(expectedVarName);

    if (result) {
      logger.debug(
        'Matched variants for component by naming convention (fallback)',
        {
          componentName,
          varName: expectedVarName,
        }
      );
      return result;
    }

    logger.debug('No variants found for component', {
      componentName,
      availableVarNames: Array.from(this.allVariants.keys()),
    });

    return this.emptyResult();
  }

  /**
   * Extract variants from source file and store in allVariants map
   * Finds variable declarations that contain cva/tv calls
   */
  private extractVariantsToMap(sourceFile: SourceFile): void {
    const variableDeclarations = sourceFile.getDescendantsOfKind(
      SyntaxKind.VariableDeclaration
    );

    for (const varDecl of variableDeclarations) {
      const varName = varDecl.getName();
      const initializer = varDecl.getInitializer();

      if (!initializer) continue;

      // Check if initializer is a cva/tv call
      const callExpr = initializer.asKind(SyntaxKind.CallExpression);
      if (!callExpr) continue;

      const fnName = this.getCallExpressionName(callExpr);
      if (!this.isVariantFunction(fnName)) continue;

      const configResult = this.extractConfigFromCall(callExpr);
      if (!configResult) continue;

      // Store keyed by variable name
      this.allVariants!.set(varName, configResult);

      logger.debug('Extracted variant definition', {
        varName,
        function: fnName,
        variantCount: Object.keys(configResult.variants).length,
      });
    }
  }

  /**
   * Find which components use which variant functions
   * Searches inside each component's body for calls to extracted variant variables
   */
  private buildComponentToVariantsMap(sourceFile: SourceFile): void {
    const variantNames = new Set(this.allVariants!.keys());
    if (variantNames.size === 0) return;

    // Find all function declarations
    for (const fn of sourceFile.getFunctions()) {
      const componentName = fn.getName();
      if (!componentName) continue;

      const usedVariants = this.findVariantUsagesInNode(fn, variantNames);
      if (usedVariants.length > 0) {
        this.componentToVariants!.set(componentName, usedVariants);
      }
    }

    // Find all variable declarations (arrow functions, forwardRef)
    for (const varDecl of sourceFile.getVariableDeclarations()) {
      const componentName = varDecl.getName();
      const initializer = varDecl.getInitializer();
      if (!initializer) continue;

      // Check if it's a component (arrow function or forwardRef call)
      const isArrowFn = initializer.getKind() === SyntaxKind.ArrowFunction;
      const isForwardRef = initializer.getText().includes('forwardRef');

      if (!isArrowFn && !isForwardRef) continue;

      const usedVariants = this.findVariantUsagesInNode(
        initializer,
        variantNames
      );
      if (usedVariants.length > 0) {
        this.componentToVariants!.set(componentName, usedVariants);
      }
    }

    logger.debug('Built component to variants map', {
      mappings: Object.fromEntries(this.componentToVariants!),
    });
  }

  /**
   * Find all variant function calls within a node
   */
  private findVariantUsagesInNode(
    node: Node,
    variantNames: Set<string>
  ): string[] {
    const usedVariants: string[] = [];

    // Find all call expressions in this node
    const callExprs = node.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const call of callExprs) {
      const calledName = call.getExpression().getText();

      // Check if this call is to one of our extracted variants
      if (variantNames.has(calledName) && !usedVariants.includes(calledName)) {
        usedVariants.push(calledName);
      }
    }

    return usedVariants;
  }

  /**
   * Get the function name from a call expression
   */
  private getCallExpressionName(call: CallExpression): string {
    const expr = call.getExpression();
    return expr.getText();
  }

  /**
   * Check if a function name is a variant function (cva or tv)
   */
  private isVariantFunction(fnName: string): fnName is VariantFunction {
    return VARIANT_FUNCTIONS.includes(fnName as VariantFunction);
  }

  /**
   * Extract variant config from a cva/tv call expression
   */
  private extractConfigFromCall(
    call: CallExpression
  ): VariantExtractionResult | null {
    const args = call.getArguments();

    // cva(baseClass, config) - config is second arg
    // tv({ base, variants }) - config is first arg for tailwind-variants
    const configArg = this.findConfigArgument(args);
    if (!configArg) {
      return null;
    }

    const configObj = configArg.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!configObj) {
      return null;
    }

    const variants = this.extractVariantsProperty(configObj);
    const defaultVariants = this.extractDefaultVariantsProperty(configObj);

    return { variants, defaultVariants };
  }

  /**
   * Find the config argument from call arguments
   * cva: second argument is config
   * tv: first argument is config (with 'variants' property)
   */
  private findConfigArgument(args: Node[]): Node | null {
    // No arguments
    if (args.length === 0) {
      return null;
    }

    // Try second argument first (cva pattern)
    if (args.length >= 2) {
      const secondArg = args[1];
      if (secondArg.getKind() === SyntaxKind.ObjectLiteralExpression) {
        return secondArg;
      }
    }

    // Try first argument (tv pattern or cva with only config)
    const firstArg = args[0];
    if (firstArg.getKind() === SyntaxKind.ObjectLiteralExpression) {
      return firstArg;
    }

    return null;
  }

  /**
   * Extract the 'variants' property from config object
   */
  private extractVariantsProperty(
    configObj: ObjectLiteralExpression
  ): Record<string, string[]> {
    const variantsObj = configObj
      .getProperty('variants')
      ?.asKind(SyntaxKind.PropertyAssignment)
      ?.getInitializer()
      ?.asKind(SyntaxKind.ObjectLiteralExpression);

    if (!variantsObj) return {};

    const result: Record<string, string[]> = {};

    for (const prop of variantsObj.getProperties()) {
      const assignment = prop.asKind(SyntaxKind.PropertyAssignment);
      if (!assignment) continue;

      const name = assignment.getName();
      const values = this.extractObjectKeys(assignment.getInitializer());

      if (values.length > 0) {
        result[name] = values;
      }
    }

    return result;
  }

  /**
   * Extract the 'defaultVariants' property from config object
   */
  private extractDefaultVariantsProperty(
    configObj: ObjectLiteralExpression
  ): Record<string, string> {
    const defaultsObj = configObj
      .getProperty('defaultVariants')
      ?.asKind(SyntaxKind.PropertyAssignment)
      ?.getInitializer()
      ?.asKind(SyntaxKind.ObjectLiteralExpression);

    if (!defaultsObj) return {};

    const result: Record<string, string> = {};

    for (const prop of defaultsObj.getProperties()) {
      const assignment = prop.asKind(SyntaxKind.PropertyAssignment);
      if (!assignment) continue;

      const name = assignment.getName();
      const value = assignment.getInitializer()?.getText().replace(/['"]/g, '');

      if (name && value) {
        result[name] = value;
      }
    }

    return result;
  }

  /**
   * Extract keys from an object literal (variant values)
   */
  private extractObjectKeys(node: Node | undefined): string[] {
    const objLiteral = node?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!objLiteral) return [];

    return objLiteral
      .getProperties()
      .map((prop) => prop.asKind(SyntaxKind.PropertyAssignment)?.getName())
      .filter((name): name is string => !!name);
  }

  /**
   * Return empty result
   */
  private emptyResult(): VariantExtractionResult {
    return { variants: {}, defaultVariants: {} };
  }
}
