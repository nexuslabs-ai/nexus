/**
 * Radix Primitive Extractor
 *
 * Extracts Radix primitive information when a component is a direct re-export
 * or wrapper of a Radix primitive using ts-morph AST parsing. Returns primitive
 * name and docs URL for AI consumption.
 *
 * Extraction Patterns:
 * 1. Direct assignment: `const DialogTrigger = DialogPrimitive.Trigger`
 * 2. forwardRef wrapper: `const DialogContent = forwardRef<...>((props, ref) => <DialogPrimitive.Content ...>)`
 * 3. Function wrapper: `function DialogContent(...) { return <DialogPrimitive.Content ...> }`
 * 4. Arrow function component: `const DialogHeader = ({ ... }) => <DialogPrimitive.Header ...>`
 */

import {
  type Node,
  Project,
  type SourceFile,
  SyntaxKind,
  ts,
  type VariableDeclaration,
} from 'ts-morph';

import type { RadixPrimitiveInfo } from '../types/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger({ name: 'radix-extractor' });

/**
 * Internal representation of a Radix import
 */
interface RadixImportInfo {
  /** The namespace alias (e.g., "DialogPrimitive") */
  alias: string;
  /** The package name (e.g., "@radix-ui/react-dialog") */
  packageName: string;
}

/**
 * Base URL for Radix UI documentation
 */
const RADIX_DOCS_BASE = 'https://www.radix-ui.com/primitives/docs/components';

/**
 * AST-based Radix primitive extractor
 *
 * Uses ts-morph for deterministic extraction of which Radix primitive
 * a subcomponent wraps. All extraction is done via AST traversal,
 * not regex pattern matching.
 */
export class RadixExtractor {
  private project: Project;
  private currentSourceFile: SourceFile | null = null;
  private radixImport: RadixImportInfo | null = null;

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
   * Extract Radix primitive information if component is a Radix primitive re-export
   *
   * @param componentName - The name of the component to extract from
   * @param sourceCode - The source code to analyze
   * @returns RadixPrimitiveInfo if extracted, undefined otherwise
   */
  extract(
    componentName: string,
    sourceCode: string
  ): RadixPrimitiveInfo | undefined {
    const fileName = 'component.tsx';

    try {
      this.currentSourceFile = this.project.createSourceFile(
        fileName,
        sourceCode,
        { overwrite: true }
      );

      // Extract Radix import info
      this.radixImport = this.extractRadixImport();
      if (!this.radixImport) {
        return undefined;
      }

      // Try each extraction pattern in order
      const primitive = this.extractPrimitive(componentName);
      if (!primitive) {
        return undefined;
      }

      const docsUrl = this.generateDocsUrl(primitive);

      logger.debug('Radix primitive extracted', {
        componentName,
        primitive,
        docsUrl,
      });

      return { primitive, docsUrl };
    } catch (error) {
      logger.debug('Radix extraction failed', {
        componentName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return undefined;
    } finally {
      if (this.currentSourceFile) {
        this.project.removeSourceFile(this.currentSourceFile);
        this.currentSourceFile = null;
      }
      this.radixImport = null;
    }
  }

  /**
   * Extract Radix namespace import from source file
   *
   * Looks for patterns like:
   * - `import * as DialogPrimitive from '@radix-ui/react-dialog'`
   * - `import * as Dialog from '@radix-ui/react-dialog'`
   * - `import * as RadixDialog from '@radix-ui/react-dialog'`
   */
  private extractRadixImport(): RadixImportInfo | null {
    if (!this.currentSourceFile) return null;

    const importDeclarations = this.currentSourceFile.getImportDeclarations();

    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();

      // Check if it's a Radix UI package
      if (!moduleSpecifier.startsWith('@radix-ui/react-')) {
        continue;
      }

      // Check for namespace import: import * as Xxx from '...'
      const namespaceImport = importDecl.getNamespaceImport();
      if (namespaceImport) {
        return {
          alias: namespaceImport.getText(),
          packageName: moduleSpecifier,
        };
      }
    }

    return null;
  }

  /**
   * Extract the Radix primitive for a component using multiple strategies
   */
  private extractPrimitive(componentName: string): string | undefined {
    if (!this.currentSourceFile || !this.radixImport) return undefined;

    // Find the variable declaration for this component
    const varDecl =
      this.currentSourceFile.getVariableDeclaration(componentName);
    if (varDecl) {
      const primitive = this.extractFromVariableDeclaration(varDecl);
      if (primitive) return primitive;
    }

    // Try function declaration
    const fnDecl = this.currentSourceFile.getFunction(componentName);
    if (fnDecl) {
      const body = fnDecl.getBody();
      if (body) {
        const primitive = this.findRadixPrimitiveInJsx(body);
        if (primitive) return primitive;
      }
    }

    return undefined;
  }

  /**
   * Extract primitive from a variable declaration
   *
   * Handles:
   * - Direct assignment: `const X = DialogPrimitive.Trigger`
   * - forwardRef wrapper: `const X = forwardRef(...)`
   * - Arrow function: `const X = () => ...`
   */
  private extractFromVariableDeclaration(
    varDecl: VariableDeclaration
  ): string | undefined {
    const initializer = varDecl.getInitializer();
    if (!initializer) return undefined;

    // Pattern 1: Direct assignment to Radix primitive
    // e.g., `const DialogTrigger = DialogPrimitive.Trigger`
    const directPrimitive = this.extractDirectPrimitiveAccess(initializer);
    if (directPrimitive) return directPrimitive;

    // Pattern 2: forwardRef wrapper
    // e.g., `const DialogContent = forwardRef<...>((props, ref) => ...)`
    if (this.isForwardRefCall(initializer)) {
      return this.extractPrimitiveFromForwardRef(initializer);
    }

    // Pattern 3: Arrow function component
    // e.g., `const DialogHeader = ({ ... }) => <DialogPrimitive.Header ...>`
    const arrowFn = initializer.asKind(SyntaxKind.ArrowFunction);
    if (arrowFn) {
      const body = arrowFn.getBody();
      return this.findRadixPrimitiveInJsx(body);
    }

    return undefined;
  }

  /**
   * Extract primitive name from direct property access
   *
   * e.g., `DialogPrimitive.Trigger` -> "Trigger"
   */
  private extractDirectPrimitiveAccess(node: Node): string | undefined {
    if (!this.radixImport) return undefined;

    const propAccess = node.asKind(SyntaxKind.PropertyAccessExpression);
    if (!propAccess) return undefined;

    const expression = propAccess.getExpression();
    const expressionText = expression.getText();

    // Check if accessing the Radix primitive namespace
    if (expressionText === this.radixImport.alias) {
      return propAccess.getName();
    }

    return undefined;
  }

  /**
   * Check if a node is a forwardRef call
   */
  private isForwardRefCall(node: Node): boolean {
    const callExpr = node.asKind(SyntaxKind.CallExpression);
    if (!callExpr) return false;

    const expression = callExpr.getExpression();
    const text = expression.getText();

    return text === 'forwardRef' || text === 'React.forwardRef';
  }

  /**
   * Extract primitive from a forwardRef call
   *
   * Looks inside the forwardRef callback for JSX that uses the Radix primitive
   */
  private extractPrimitiveFromForwardRef(node: Node): string | undefined {
    const callExpr = node.asKind(SyntaxKind.CallExpression);
    if (!callExpr) return undefined;

    const args = callExpr.getArguments();
    if (args.length === 0) return undefined;

    // The first argument is the render function (arrow or function expression)
    const renderFn = args[0];

    // Get the function body
    const arrowFn = renderFn.asKind(SyntaxKind.ArrowFunction);
    if (arrowFn) {
      const body = arrowFn.getBody();
      return this.findRadixPrimitiveInJsx(body);
    }

    const funcExpr = renderFn.asKind(SyntaxKind.FunctionExpression);
    if (funcExpr) {
      const body = funcExpr.getBody();
      if (body) {
        return this.findRadixPrimitiveInJsx(body);
      }
    }

    return undefined;
  }

  /**
   * Find the first Radix primitive JSX element in a node
   *
   * Searches for JSX elements like:
   * - `<DialogPrimitive.Content ...>`
   * - `<DialogPrimitive.Trigger ...>`
   */
  private findRadixPrimitiveInJsx(node: Node): string | undefined {
    if (!this.radixImport) return undefined;

    // Handle expression body (arrow function without braces)
    // e.g., `() => <DialogPrimitive.Content />`
    const jsxElement = this.extractJsxPrimitiveFromNode(node);
    if (jsxElement) return jsxElement;

    // Handle block body - search all JSX elements
    const allJsxElements = [
      ...node.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
      ...node.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
    ];

    for (const jsx of allJsxElements) {
      const tagName = jsx.getTagNameNode();
      const primitive = this.extractPrimitiveFromTagName(tagName);
      if (primitive) return primitive;
    }

    return undefined;
  }

  /**
   * Extract JSX primitive directly from a node (for expression bodies)
   */
  private extractJsxPrimitiveFromNode(node: Node): string | undefined {
    // Direct JSX self-closing element
    const selfClosing = node.asKind(SyntaxKind.JsxSelfClosingElement);
    if (selfClosing) {
      const tagName = selfClosing.getTagNameNode();
      return this.extractPrimitiveFromTagName(tagName);
    }

    // Direct JSX element
    const jsxElement = node.asKind(SyntaxKind.JsxElement);
    if (jsxElement) {
      const opening = jsxElement.getOpeningElement();
      const tagName = opening.getTagNameNode();
      return this.extractPrimitiveFromTagName(tagName);
    }

    // Parenthesized expression
    const parenExpr = node.asKind(SyntaxKind.ParenthesizedExpression);
    if (parenExpr) {
      return this.extractJsxPrimitiveFromNode(parenExpr.getExpression());
    }

    return undefined;
  }

  /**
   * Extract primitive name from JSX tag name
   *
   * e.g., `DialogPrimitive.Content` -> "Content"
   */
  private extractPrimitiveFromTagName(tagName: Node): string | undefined {
    if (!this.radixImport) return undefined;

    const propAccess = tagName.asKind(SyntaxKind.PropertyAccessExpression);
    if (!propAccess) return undefined;

    const expression = propAccess.getExpression();
    const expressionText = expression.getText();

    if (expressionText === this.radixImport.alias) {
      return propAccess.getName();
    }

    return undefined;
  }

  /**
   * Generate the Radix documentation URL for a primitive
   */
  private generateDocsUrl(primitive: string): string {
    if (!this.radixImport) return '';

    // Extract component name from package: @radix-ui/react-dialog → dialog
    const match = this.radixImport.packageName.match(/@radix-ui\/react-(.+)/);
    if (!match) return '';

    const component = match[1]; // "dialog", "dropdown-menu", etc.
    const primitiveLower = primitive.toLowerCase();

    return `${RADIX_DOCS_BASE}/${component}#${primitiveLower}`;
  }
}
