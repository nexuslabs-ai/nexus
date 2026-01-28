/**
 * Compound Component Detector
 *
 * Detects compound components (Dialog, Accordion, Tabs, etc.) and extracts
 * information about their sub-components.
 *
 * Compound components are identified by:
 * 1. Multiple named exports with common prefix (Dialog, DialogTrigger, DialogContent)
 * 2. Object.assign pattern (Accordion.Root, Accordion.Item)
 * 3. Radix-style re-exports (export { Root as Dialog, Trigger as DialogTrigger })
 */

import {
  type CallExpression,
  type ObjectLiteralExpression,
  Project,
  type SourceFile,
  SyntaxKind,
} from 'ts-morph';

import type { CompoundComponentInfo } from '../types/index.js';
import { kebabCase } from '../utils/case.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger({ name: 'compound-detector' });

/**
 * Convert PascalCase component name to kebab-case data-slot value
 *
 * @example
 * inferDataSlot("DialogTrigger") // "dialog-trigger"
 * inferDataSlot("AccordionItem") // "accordion-item"
 * inferDataSlot("Button") // "button"
 */
export function inferDataSlot(componentName: string): string {
  return kebabCase(componentName);
}

/**
 * Find the common prefix among a set of export names
 *
 * @example
 * findCommonPrefix(["Dialog", "DialogTrigger", "DialogContent"]) // "Dialog"
 * findCommonPrefix(["Button"]) // "Button"
 * findCommonPrefix(["Tabs", "TabsList", "TabsTrigger"]) // "Tabs"
 */
function findCommonPrefix(names: string[]): string | undefined {
  if (names.length === 0) return undefined;
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

  return undefined;
}

/**
 * Extract named exports from source code (excluding type-only exports)
 */
function extractNamedExports(sourceFile: SourceFile): string[] {
  const exports: string[] = [];

  // Pattern 1: export { Name1, Name2 }
  const exportDeclarations = sourceFile.getDescendantsOfKind(
    SyntaxKind.ExportDeclaration
  );

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
      exports.push(alias ?? name);
    }
  }

  // Pattern 2: export const Name = ... or export function Name ...
  const variableStatements = sourceFile.getDescendantsOfKind(
    SyntaxKind.VariableStatement
  );

  for (const stmt of variableStatements) {
    const modifiers = stmt.getModifiers();
    if (modifiers.some((m) => m.getKind() === SyntaxKind.ExportKeyword)) {
      const declarations = stmt.getDeclarations();
      for (const decl of declarations) {
        const name = decl.getName();
        // Skip type-only exports (lowercase or special names)
        if (name && /^[A-Z]/.test(name)) {
          exports.push(name);
        }
      }
    }
  }

  // Pattern 3: export function Name() {}
  const functionDeclarations = sourceFile.getDescendantsOfKind(
    SyntaxKind.FunctionDeclaration
  );

  for (const fn of functionDeclarations) {
    const fnModifiers = fn.getModifiers();
    if (fnModifiers.some((m) => m.getKind() === SyntaxKind.ExportKeyword)) {
      const name = fn.getName();
      if (name && /^[A-Z]/.test(name)) {
        exports.push(name);
      }
    }
  }

  return [...new Set(exports)]; // Remove duplicates
}

/**
 * Check if a call expression is an Object.assign call
 */
function isObjectAssignCall(call: CallExpression): boolean {
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
function extractRootNameFromCall(call: CallExpression): string | null {
  const parent = call.getParent();
  if (parent?.getKind() !== SyntaxKind.VariableDeclaration) {
    return null;
  }

  const variableDecl = parent.asKind(SyntaxKind.VariableDeclaration);
  const rootName = variableDecl?.getName();

  if (!rootName || !/^[A-Z]/.test(rootName)) {
    return null;
  }

  return rootName;
}

/**
 * Extract sub-component names from an object literal argument
 *
 * Handles both regular property assignments and shorthand properties:
 * - { Item: AccordionItem } → "Item"
 * - { Item } → "Item"
 */
function extractSubComponentsFromObject(
  objLiteral: ObjectLiteralExpression
): string[] {
  const subComponents: string[] = [];
  const properties = objLiteral.getProperties();

  for (const prop of properties) {
    if (prop.getKind() === SyntaxKind.PropertyAssignment) {
      const propAssignment = prop.asKind(SyntaxKind.PropertyAssignment);
      const propName = propAssignment?.getName();
      if (propName) {
        subComponents.push(propName);
      }
      continue;
    }

    if (prop.getKind() === SyntaxKind.ShorthandPropertyAssignment) {
      const shorthand = prop.asKind(SyntaxKind.ShorthandPropertyAssignment);
      const propName = shorthand?.getName();
      if (propName) {
        subComponents.push(propName);
      }
    }
  }

  return subComponents;
}

/**
 * Detect Object.assign pattern for compound components
 *
 * @example
 * const Accordion = Object.assign(AccordionRoot, {
 *   Item: AccordionItem,
 *   Trigger: AccordionTrigger,
 * })
 */
function detectObjectAssignPattern(sourceFile: SourceFile): {
  rootComponent: string;
  subComponents: string[];
} | null {
  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  );

  for (const call of callExpressions) {
    if (!isObjectAssignCall(call)) {
      continue;
    }

    const rootName = extractRootNameFromCall(call);
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

    const subComponents = extractSubComponentsFromObject(objLiteral);
    if (subComponents.length === 0) {
      continue;
    }

    return { rootComponent: rootName, subComponents };
  }

  return null;
}

/**
 * Detect compound component from source code
 *
 * Analyzes the source code to determine if it exports a compound component
 * and identifies all sub-components.
 *
 * Detection patterns:
 * 1. Multiple named exports with common prefix (Dialog, DialogTrigger, DialogContent)
 * 2. Object.assign pattern (Accordion = Object.assign(AccordionRoot, { Item, Trigger }))
 * 3. Radix-style re-exports (export { Root as Dialog, Trigger as DialogTrigger })
 *
 * @param sourceCode - The component source code to analyze
 * @returns CompoundComponentInfo with detection results
 */
export function detectCompoundComponent(
  sourceCode: string
): CompoundComponentInfo {
  // Default result for non-compound components
  const notCompound: CompoundComponentInfo = {
    isCompound: false,
    rootComponent: '',
    subComponents: [],
  };

  if (!sourceCode.trim()) {
    return notCompound;
  }

  // Create a ts-morph project for AST analysis
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: 99, // ESNext
      module: 99, // ESNext
      jsx: 4, // React JSX
      strict: false,
      skipLibCheck: true,
    },
  });

  const sourceFile = project.createSourceFile('component.tsx', sourceCode, {
    overwrite: true,
  });

  try {
    // Pattern 1: Check for Object.assign pattern first (most explicit)
    const objectAssignResult = detectObjectAssignPattern(sourceFile);
    if (objectAssignResult) {
      logger.debug('Compound component detected via Object.assign pattern', {
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
    const namedExports = extractNamedExports(sourceFile);

    // Filter to only PascalCase exports (component names)
    const componentExports = namedExports.filter((name) => /^[A-Z]/.test(name));

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
    const prefix = findCommonPrefix(componentExports);

    if (prefix) {
      // Identify root (the one that equals the prefix) and sub-components
      const rootComponent = prefix;
      const subComponents = componentExports.filter(
        (name) => name !== prefix && name.startsWith(prefix)
      );

      // Must have at least one sub-component to be compound
      if (subComponents.length > 0) {
        logger.debug('Compound component detected via common prefix', {
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

    // No compound pattern detected
    // Return first export as root component
    return {
      isCompound: false,
      rootComponent: componentExports[0] ?? '',
      subComponents: [],
    };
  } catch (error) {
    logger.debug('Compound detection failed', { error });
    return notCompound;
  } finally {
    project.removeSourceFile(sourceFile);
  }
}

/**
 * Infer whether a sub-component is required in composition
 *
 * Uses naming heuristics to determine if a sub-component is typically
 * required when composing the compound component.
 *
 * @example
 * inferRequiredInComposition("AccordionItem", "Accordion") // true - items are required
 * inferRequiredInComposition("DialogClose", "Dialog") // false - close button is optional
 * inferRequiredInComposition("TabsSeparator", "Tabs") // false - separators are optional
 */
export function inferRequiredInComposition(
  subComponentName: string,
  rootComponentName: string
): boolean {
  // Common optional suffixes across all compound components
  const optionalSuffixes = ['Separator', 'Label', 'Group'];
  if (optionalSuffixes.some((suffix) => subComponentName.endsWith(suffix))) {
    return false;
  }

  // Dialog-specific optional sub-components
  if (rootComponentName === 'Dialog') {
    const dialogOptional = [
      'Header',
      'Footer',
      'Title',
      'Description',
      'Close',
    ];
    if (dialogOptional.some((suffix) => subComponentName.endsWith(suffix))) {
      return false;
    }
  }

  // Alert-specific optional sub-components
  if (rootComponentName === 'Alert') {
    const alertOptional = ['Title', 'Description'];
    if (alertOptional.some((suffix) => subComponentName.endsWith(suffix))) {
      return false;
    }
  }

  // Card-specific optional sub-components
  if (rootComponentName === 'Card') {
    const cardOptional = [
      'Header',
      'Footer',
      'Title',
      'Description',
      'Content',
    ];
    if (cardOptional.some((suffix) => subComponentName.endsWith(suffix))) {
      return false;
    }
  }

  // Default: sub-component is required
  return true;
}

/**
 * Factory function for creating a compound detector
 *
 * Provides a convenient API wrapper around the detection functions.
 * Note: Each detection creates its own ts-morph Project internally
 * for isolation. For true batch processing optimization, consider
 * using detectCompoundComponent directly with a shared Project instance.
 */
export function createCompoundDetector() {
  return {
    detect: (sourceCode: string): CompoundComponentInfo => {
      return detectCompoundComponent(sourceCode);
    },

    inferDataSlot,

    dispose: () => {
      // Reserved for future cleanup needs
    },
  };
}
