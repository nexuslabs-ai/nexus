/**
 * Composition Extractor
 *
 * Determines whether sub-components are required in compound component composition
 * using multiple detection strategies:
 *
 * - Internal usage detection: Checks if a sub-component is rendered internally by another
 * - Radix suffix heuristics: Uses naming conventions (Trigger, Content, etc.)
 * - Explicit config: Fallback for non-Radix compound components
 *
 * This replaces the simpler `inferRequiredInComposition` function with a more
 * comprehensive extraction approach.
 */

import {
  type FunctionDeclaration,
  type Node,
  Project,
  type SourceFile,
  SyntaxKind,
  ts,
} from 'ts-morph';

import type { RadixPrimitiveInfo } from '../types/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger({ name: 'composition-extractor' });

/**
 * Required Radix suffixes
 *
 * Structural parts needed for the component to function.
 * All other suffixes (Title, Description, Portal, etc.) default to optional.
 */
const REQUIRED_SUFFIXES = ['Trigger', 'Content', 'Item', 'List'];

/**
 * Non-Radix compound component configuration
 *
 * For components that don't use Radix primitives, we define which
 * sub-components are required. If a component is in this map with
 * an empty array, all its sub-components are optional by default.
 */
const NON_RADIX_REQUIRED: Record<string, string[]> = {
  Card: [], // CardHeader, CardContent, CardFooter, etc. are all optional
  Alert: [], // AlertTitle, AlertDescription are optional
};

/**
 * AST-based composition extractor
 *
 * Determines whether sub-components are required in compound component
 * composition using multiple detection strategies.
 */
export class CompositionExtractor {
  private project: Project;
  private currentSourceFile: SourceFile | null = null;

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        strict: false,
        skipLibCheck: true,
      },
    });
  }

  /**
   * Analyze all sub-components for requiredInComposition in a single call
   *
   * This is the main public API. It:
   * 1. Detects internal usage once for all sub-components
   * 2. Applies detection logic to each sub-component
   * 3. Returns a map of subComponentName -> requiredInComposition
   *
   * @param sourceCode - Source code to analyze
   * @param rootComponentName - Name of the root component (e.g., "Dialog")
   * @param subComponents - Array of sub-component info with optional Radix primitive
   * @returns Map of subComponentName to boolean (true if required in composition)
   *
   * @example
   * const results = compositionExtractor.analyzeAll(
   *   sourceCode,
   *   'Dialog',
   *   [
   *     { name: 'DialogTrigger', radixPrimitive: { primitive: 'Trigger', ... } },
   *     { name: 'DialogContent' },
   *   ]
   * );
   * // Returns: Map { 'DialogTrigger' => true, 'DialogContent' => true }
   */
  analyzeAll(
    sourceCode: string,
    rootComponentName: string,
    subComponents: Array<{ name: string; radixPrimitive?: RadixPrimitiveInfo }>
  ): Map<string, boolean> {
    const result = new Map<string, boolean>();

    if (subComponents.length === 0) {
      return result;
    }

    // Step 1: Detect internal usage once for all sub-components
    const subComponentNames = subComponents.map((s) => s.name);
    const internalUsageMap = this.detectInternalUsage(
      sourceCode,
      subComponentNames
    );

    // Step 2: Apply detection logic to each sub-component
    for (const { name, radixPrimitive } of subComponents) {
      const internallyUsedBy = internalUsageMap.get(name);
      const required = this.detectRequiredInComposition(
        name,
        rootComponentName,
        radixPrimitive,
        internallyUsedBy
      );
      result.set(name, required);
    }

    return result;
  }

  /**
   * Detect whether a sub-component is required in composition
   *
   * Detection order:
   * - Check if internally composed by another sub-component (mark as optional)
   * - Check Radix suffix heuristics (Trigger, Content, Item, List are required)
   * - Check explicit config for non-Radix components
   *
   * @param subComponentName - Name of the sub-component (e.g., "DialogTrigger")
   * @param rootComponentName - Name of the root component (e.g., "Dialog")
   * @param radixPrimitive - Optional Radix primitive info if detected
   * @param internallyUsedBy - Optional list of components that use this internally
   * @returns true if the sub-component is required in composition, false otherwise
   */
  private detectRequiredInComposition(
    subComponentName: string,
    rootComponentName: string,
    radixPrimitive?: RadixPrimitiveInfo,
    internallyUsedBy?: string[]
  ): boolean {
    // Check if internally composed by another sub-component
    if (internallyUsedBy && internallyUsedBy.length > 0) {
      logger.debug('Sub-component used internally', {
        subComponentName,
        usedBy: internallyUsedBy,
      });
      return false;
    }

    // Check Radix suffix heuristics
    if (radixPrimitive) {
      const isRequired = this.isRequiredSuffix(radixPrimitive.primitive);
      logger.debug('Radix primitive suffix check', {
        subComponentName,
        primitive: radixPrimitive.primitive,
        isRequired,
      });
      return isRequired;
    }

    // Try suffix detection from sub-component name itself
    const suffix = this.extractSuffix(subComponentName, rootComponentName);
    if (suffix) {
      const isRequired = this.isRequiredSuffix(suffix);
      logger.debug('Suffix heuristic check', {
        subComponentName,
        suffix,
        isRequired,
      });
      return isRequired;
    }

    // Check explicit config for non-Radix components
    const nonRadixConfig = NON_RADIX_REQUIRED[rootComponentName];
    if (nonRadixConfig !== undefined) {
      const required = nonRadixConfig.includes(subComponentName);
      logger.debug('Non-Radix config matched', {
        subComponentName,
        rootComponentName,
        required,
      });
      return required;
    }

    // Default: optional (safer default than required)
    logger.debug('Defaulting to optional', {
      subComponentName,
      rootComponentName,
    });
    return false;
  }

  /**
   * Detect internal usage of sub-components
   *
   * Analyzes JSX in source code to find which sub-components render
   * other sub-components internally.
   *
   * @param sourceCode - Source code to analyze
   * @param subComponentNames - List of sub-component names to check
   * @returns Map of subComponentName to list of components that use it internally
   *
   * @example
   * // If DialogContent renders <DialogPortal> internally:
   * detectInternalUsage(sourceCode, ['DialogPortal', 'DialogContent'])
   * // Returns: Map { 'DialogPortal' => ['DialogContent'] }
   */
  private detectInternalUsage(
    sourceCode: string,
    subComponentNames: string[]
  ): Map<string, string[]> {
    const result = new Map<string, string[]>();

    if (!sourceCode.trim() || subComponentNames.length === 0) {
      return result;
    }

    const fileName = 'component.tsx';

    try {
      this.currentSourceFile = this.project.createSourceFile(
        fileName,
        sourceCode,
        { overwrite: true }
      );

      const subComponentSet = new Set(subComponentNames);

      // Find all function declarations and variable declarations (components)
      for (const subComponentName of subComponentNames) {
        const usedBy = this.findComponentsUsingJsx(
          subComponentName,
          subComponentSet
        );

        if (usedBy.length > 0) {
          result.set(subComponentName, usedBy);
          logger.debug('Internal usage detected', {
            subComponentName,
            usedBy,
          });
        }
      }

      return result;
    } catch (error) {
      logger.debug('Internal usage detection failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return result;
    } finally {
      if (this.currentSourceFile) {
        this.project.removeSourceFile(this.currentSourceFile);
        this.currentSourceFile = null;
      }
    }
  }

  /**
   * Find which components render a given JSX element
   *
   * @param targetJsxName - The JSX element name to search for
   * @param componentNames - Set of known component names in the file
   * @returns List of component names that render the target JSX element
   */
  private findComponentsUsingJsx(
    targetJsxName: string,
    componentNames: Set<string>
  ): string[] {
    if (!this.currentSourceFile) return [];

    const usedBy: string[] = [];

    // Check function declarations
    for (const fn of this.currentSourceFile.getFunctions()) {
      const fnName = fn.getName();
      if (!fnName || !componentNames.has(fnName) || fnName === targetJsxName) {
        continue;
      }

      if (this.componentRendersJsx(fn, targetJsxName)) {
        usedBy.push(fnName);
      }
    }

    // Check variable declarations (arrow functions, forwardRef)
    for (const varDecl of this.currentSourceFile.getVariableDeclarations()) {
      const varName = varDecl.getName();
      if (!componentNames.has(varName) || varName === targetJsxName) {
        continue;
      }

      const initializer = varDecl.getInitializer();
      if (!initializer) continue;

      if (this.nodeRendersJsx(initializer, targetJsxName)) {
        usedBy.push(varName);
      }
    }

    return usedBy;
  }

  /**
   * Check if a function component renders a specific JSX element
   */
  private componentRendersJsx(
    fn: FunctionDeclaration,
    targetJsxName: string
  ): boolean {
    const body = fn.getBody();
    if (!body) return false;

    return this.nodeRendersJsx(body, targetJsxName);
  }

  /**
   * Check if a node contains JSX elements with the given name
   */
  private nodeRendersJsx(node: Node, targetJsxName: string): boolean {
    // Find all JSX elements
    const jsxElements = [
      ...node.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
      ...node.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
    ];

    for (const jsx of jsxElements) {
      const tagNameNode = jsx.getTagNameNode();
      const tagName = tagNameNode.getText();

      // Match direct name or property access (e.g., "DialogPortal" or "Primitive.Portal")
      if (tagName === targetJsxName || tagName.endsWith(`.${targetJsxName}`)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a suffix indicates a required sub-component
   */
  private isRequiredSuffix(suffix: string): boolean {
    // Direct match
    if (REQUIRED_SUFFIXES.includes(suffix)) {
      return true;
    }

    // Check if suffix ends with any required suffix
    return REQUIRED_SUFFIXES.some((required) => suffix.endsWith(required));
  }

  /**
   * Extract the suffix from a sub-component name
   *
   * @example
   * extractSuffix("DialogTrigger", "Dialog") // "Trigger"
   * extractSuffix("AccordionItem", "Accordion") // "Item"
   * extractSuffix("Button", "Button") // null (not a sub-component)
   */
  private extractSuffix(
    subComponentName: string,
    rootComponentName: string
  ): string | null {
    // Sub-component should start with root name
    if (!subComponentName.startsWith(rootComponentName)) {
      return null;
    }

    // Extract the suffix after the root name
    const suffix = subComponentName.slice(rootComponentName.length);

    // Must have a suffix (not just the root name itself)
    if (!suffix) {
      return null;
    }

    return suffix;
  }
}
