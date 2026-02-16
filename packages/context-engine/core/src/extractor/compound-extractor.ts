/**
 * Compound Component Extractor
 *
 * Extracts compound component information (Dialog, Accordion, Tabs, etc.) and
 * data about their sub-components using ts-morph AST parsing.
 *
 * Compound components are identified by:
 * 1. Multiple named exports with common prefix (Dialog, DialogTrigger, DialogContent)
 * 2. Object.assign pattern (Accordion.Root, Accordion.Item)
 * 3. Radix-style re-exports (export { Root as Dialog, Trigger as DialogTrigger })
 *
 * The Project instance is created once in the constructor and reused across
 * multiple extract() calls for efficiency.
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

import type { CompoundComponentInfo } from '../types/index.js';
import { isPascalCase } from '../utils/case.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger({ name: 'compound-extractor' });

/**
 * AST-based compound component extractor
 *
 * Uses ts-morph for deterministic extraction of compound component patterns.
 * All extraction is done via AST traversal, not regex pattern matching.
 *
 * The Project instance is created once and reused across extract() calls.
 */
export class CompoundExtractor {
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
   * Extract compound component information from source code
   *
   * Analyzes the source code to determine if it exports a compound component
   * and identifies all sub-components.
   *
   * Extraction patterns:
   * 1. Multiple named exports with common prefix (Dialog, DialogTrigger, DialogContent)
   * 2. Object.assign pattern (Accordion = Object.assign(AccordionRoot, { Item, Trigger }))
   * 3. Radix-style re-exports (export { Root as Dialog, Trigger as DialogTrigger })
   *
   * @param sourceCode - The component source code to analyze
   * @returns CompoundComponentInfo with extraction results
   */
  extract(sourceCode: string): CompoundComponentInfo {
    // Default result for non-compound components
    const notCompound: CompoundComponentInfo = {
      isCompound: false,
      rootComponent: '',
      subComponents: [],
    };

    if (!sourceCode.trim()) {
      return notCompound;
    }

    const fileName = 'component.tsx';

    try {
      this.currentSourceFile = this.project.createSourceFile(
        fileName,
        sourceCode,
        { overwrite: true }
      );

      // Pattern 1: Check for Object.assign pattern first (most explicit)
      const objectAssignResult = this.extractObjectAssignPattern();
      if (objectAssignResult) {
        logger.debug('Compound component extracted via Object.assign pattern', {
          root: objectAssignResult.rootComponent,
          subComponents: objectAssignResult.subComponents,
        });

        return {
          isCompound: true,
          rootComponent: objectAssignResult.rootComponent,
          subComponents: objectAssignResult.subComponents,
        };
      }

      // Pattern 2: Check for multiple named exports with common prefix
      const namedExports = this.extractNamedExports();

      // Filter to only PascalCase exports (component names)
      const componentExports = namedExports.filter((name) =>
        isPascalCase(name)
      );

      // Need at least 2 exports to be compound
      if (componentExports.length < 2) {
        // Single component or no component exports
        if (componentExports.length === 1) {
          return {
            isCompound: false,
            rootComponent: componentExports[0],
            subComponents: [],
          };
        }
        return notCompound;
      }

      // Find common prefix
      const prefix = this.findCommonPrefix(componentExports);

      if (prefix) {
        // Identify root (the one that equals the prefix) and sub-components
        const rootComponent = prefix;
        const subComponents = componentExports.filter(
          (name) => name !== prefix && name.startsWith(prefix)
        );

        // Must have at least one sub-component to be compound
        if (subComponents.length > 0) {
          logger.debug('Compound component extracted via common prefix', {
            root: rootComponent,
            subComponents,
            allExports: componentExports,
          });

          return {
            isCompound: true,
            rootComponent,
            subComponents,
          };
        }
      }

      // No compound pattern extracted
      // Return first export as root component
      return {
        isCompound: false,
        rootComponent: componentExports[0] ?? '',
        subComponents: [],
      };
    } catch (error) {
      logger.debug('Compound extraction failed', { error });
      return notCompound;
    } finally {
      if (this.currentSourceFile) {
        this.project.removeSourceFile(this.currentSourceFile);
        this.currentSourceFile = null;
      }
    }
  }

  /**
   * Find the common prefix among a set of export names
   *
   * @example
   * findCommonPrefix(["Dialog", "DialogTrigger", "DialogContent"]) // "Dialog"
   * findCommonPrefix(["Button"]) // "Button"
   * findCommonPrefix(["Tabs", "TabsList", "TabsTrigger"]) // "Tabs"
   */
  private findCommonPrefix(names: string[]): string | null {
    if (names.length === 0) return null;
    if (names.length === 1) return names[0];

    // Sort by length to start with shortest potential prefix
    const sorted = [...names].sort((a, b) => a.length - b.length);
    const shortest = sorted[0];

    // Try progressively shorter prefixes
    for (let len = shortest.length; len >= 2; len--) {
      const prefix = shortest.substring(0, len);

      // Check if this prefix is a complete word (not cutting mid-word)
      // and all names either equal the prefix or start with it
      const allMatch = names.every(
        (name) => name === prefix || name.startsWith(prefix)
      );

      if (allMatch) {
        // Verify the prefix is a complete word (next char after prefix is uppercase or end)
        const isCompleteWord = names.every((name) => {
          if (name === prefix) return true;
          const nextChar = name[prefix.length];
          // Next char should be uppercase (PascalCase) to be a valid word boundary
          return nextChar && nextChar === nextChar.toUpperCase();
        });

        if (isCompleteWord) {
          return prefix;
        }
      }
    }

    return null;
  }

  /**
   * Check if a node has an export modifier
   */
  private hasExportModifier(node: { getModifiers(): Node[] }): boolean {
    return node
      .getModifiers()
      .some((m) => m.getKind() === SyntaxKind.ExportKeyword);
  }

  /**
   * Extract named exports from source code (excluding type-only exports)
   */
  private extractNamedExports(): string[] {
    if (!this.currentSourceFile) return [];

    const exports: string[] = [];

    // Pattern 1: export { Name1, Name2 }
    const exportDeclarations = this.currentSourceFile.getExportDeclarations();

    for (const decl of exportDeclarations) {
      // Skip entire type-only export declarations: export type { ... }
      if (decl.isTypeOnly()) {
        continue;
      }

      const namedExports = decl.getNamedExports();
      for (const namedExport of namedExports) {
        // Skip individual type exports: export { type Foo, Bar }
        if (namedExport.isTypeOnly()) {
          continue;
        }

        const name = namedExport.getName();
        // Use alias if present (export { Root as Dialog })
        const alias = namedExport.getAliasNode()?.getText();
        const exportName = alias ?? name;

        // Filter to only PascalCase exports (component names)
        if (isPascalCase(exportName)) {
          exports.push(exportName);
        }
      }
    }

    // Pattern 2: export const Name = ...
    for (const stmt of this.currentSourceFile.getVariableStatements()) {
      if (this.hasExportModifier(stmt)) {
        for (const decl of stmt.getDeclarations()) {
          const name = decl.getName();
          // Filter to only PascalCase exports (component names)
          if (isPascalCase(name)) {
            exports.push(name);
          }
        }
      }
    }

    // Pattern 3: export function Name() {}
    for (const fn of this.currentSourceFile.getFunctions()) {
      if (this.hasExportModifier(fn)) {
        const name = fn.getName();
        // Filter to only PascalCase exports (component names)
        if (name && isPascalCase(name)) {
          exports.push(name);
        }
      }
    }

    return [...new Set(exports)]; // Remove duplicates
  }

  /**
   * Extract Object.assign pattern for compound components
   *
   * @example
   * const Accordion = Object.assign(AccordionRoot, {
   *   Item: AccordionItem,
   *   Trigger: AccordionTrigger,
   * })
   */
  private extractObjectAssignPattern(): {
    rootComponent: string;
    subComponents: string[];
  } | null {
    if (!this.currentSourceFile) return null;

    const callExpressions = this.currentSourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression
    );

    for (const call of callExpressions) {
      if (!this.isObjectAssignCall(call)) {
        continue;
      }

      const rootName = this.extractRootNameFromCall(call);
      if (!rootName) {
        continue;
      }

      // Extract sub-component names from the second argument (the object)
      const args = call.getArguments();
      if (args.length < 2) {
        continue;
      }

      const objArg = args[1];
      if (objArg.getKind() !== SyntaxKind.ObjectLiteralExpression) {
        continue;
      }

      const objLiteral = objArg.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!objLiteral) {
        continue;
      }

      const subComponents = this.extractSubComponentsFromObject(objLiteral);
      if (subComponents.length === 0) {
        continue;
      }

      return { rootComponent: rootName, subComponents };
    }

    return null;
  }

  /**
   * Check if a call expression is an Object.assign call
   */
  private isObjectAssignCall(call: CallExpression): boolean {
    const expression = call.getExpression();
    if (expression.getKind() !== SyntaxKind.PropertyAccessExpression) {
      return false;
    }
    return expression.getText() === 'Object.assign';
  }

  /**
   * Extract the root component name from an Object.assign call
   *
   * Returns the variable name if:
   * - The call is assigned to a variable declaration
   * - The variable name starts with uppercase (component convention)
   */
  private extractRootNameFromCall(call: CallExpression): string | null {
    const parent = call.getParent();
    if (parent?.getKind() !== SyntaxKind.VariableDeclaration) {
      return null;
    }

    const variableDecl = parent.asKind(SyntaxKind.VariableDeclaration);
    const rootName = variableDecl?.getName();

    if (rootName && isPascalCase(rootName)) {
      return rootName;
    }

    return null;
  }

  /**
   * Extract sub-component names from an object literal argument
   *
   * Handles both regular property assignments and shorthand properties:
   * - { Item: AccordionItem } → "Item"
   * - { Item } → "Item"
   */
  private extractSubComponentsFromObject(
    objLiteral: ObjectLiteralExpression
  ): string[] {
    const subComponents: string[] = [];

    for (const prop of objLiteral.getProperties()) {
      const named =
        prop.asKind(SyntaxKind.PropertyAssignment) ??
        prop.asKind(SyntaxKind.ShorthandPropertyAssignment);
      if (named) {
        subComponents.push(named.getName());
      }
    }

    return subComponents;
  }
}
