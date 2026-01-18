/**
 * Variant Extractor
 *
 * Extracts CVA (class-variance-authority) and tailwind-variants
 * variants from component source code using ts-morph AST parsing.
 *
 * Always uses ts-morph since this is pure AST-based extraction
 * that requires no type resolution.
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
   * Extract variants from source code
   *
   * @param sourceCode - Component source code to parse
   * @param filePath - Optional file path for context
   * @returns Extracted variants and defaults
   */
  extract(sourceCode: string, filePath?: string): VariantExtractionResult {
    const fileName = filePath || 'component.tsx';

    // Guard: Empty source code
    if (!sourceCode.trim()) {
      return this.emptyResult();
    }

    const sourceFile = this.project.createSourceFile(fileName, sourceCode, {
      overwrite: true,
    });

    try {
      return this.extractVariants(sourceFile);
    } catch (error) {
      logger.debug('Variant extraction failed', {
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
   * Extract variants from a source file
   */
  private extractVariants(sourceFile: SourceFile): VariantExtractionResult {
    const variants: Record<string, string[]> = {};
    const defaultVariants: Record<string, string> = {};

    const callExpressions = sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression
    );

    for (const call of callExpressions) {
      const fnName = this.getCallExpressionName(call);

      // Skip non-variant functions
      if (!this.isVariantFunction(fnName)) {
        continue;
      }

      const configResult = this.extractConfigFromCall(call);
      if (!configResult) {
        continue;
      }

      // Merge results (in case of multiple cva/tv calls)
      Object.assign(variants, configResult.variants);
      Object.assign(defaultVariants, configResult.defaultVariants);

      logger.debug('Extracted variants from call', {
        function: fnName,
        variantCount: Object.keys(configResult.variants).length,
      });
    }

    return { variants, defaultVariants };
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

    return variantsObj ? this.extractVariantProperties(variantsObj) : {};
  }

  /**
   * Extract variant name -> values mapping from variants object
   */
  private extractVariantProperties(
    variantsObj: ObjectLiteralExpression
  ): Record<string, string[]> {
    const entries = variantsObj
      .getProperties()
      .map((prop) => {
        const assignment = prop.asKind(SyntaxKind.PropertyAssignment);
        if (!assignment) return null;
        const name = assignment.getName();
        const values = this.extractObjectKeys(assignment.getInitializer());
        return values.length > 0 ? ([name, values] as const) : null;
      })
      .filter((entry): entry is [string, string[]] => entry !== null);

    return Object.fromEntries(entries);
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

    return defaultsObj ? this.extractDefaultValues(defaultsObj) : {};
  }

  /**
   * Extract default variant values from defaultVariants object
   */
  private extractDefaultValues(
    defaultsObj: ObjectLiteralExpression
  ): Record<string, string> {
    const entries = defaultsObj
      .getProperties()
      .map((prop) => {
        const assignment = prop.asKind(SyntaxKind.PropertyAssignment);
        const name = assignment?.getName();
        const value = assignment
          ?.getInitializer()
          ?.getText()
          .replace(/['"]/g, '');
        return name && value ? ([name, value] as const) : null;
      })
      .filter((entry): entry is [string, string] => entry !== null);

    return Object.fromEntries(entries);
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
