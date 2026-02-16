/**
 * ts-morph Extractor (Fallback)
 *
 * Fallback props extractor using ts-morph for cases where
 * react-docgen-typescript fails.
 *
 * Use cases:
 * - Higher-order components (wrapped exports)
 * - Styled-components patterns
 * - Complex conditional exports
 * - Non-standard component patterns
 * - forwardRef with complex generic patterns
 * - Compound components with Radix UI primitives
 */

import {
  type InterfaceDeclaration,
  type Node,
  type ParameterDeclaration,
  Project,
  type PropertySignature,
  type SourceFile,
  SyntaxKind,
  ts,
  type TypeAliasDeclaration,
} from 'ts-morph';

import type { ExtractedProp } from '../types/index.js';
import { pascalCase } from '../utils/case.js';
import { createLogger } from '../utils/logger.js';
import { extractEnumValues, simplifyType } from '../utils/type-utils.js';

import {
  ExtractorMethod,
  type IPropsExtractor,
  type PropsExtractionResult,
} from './types.js';

const logger = createLogger({ name: 'ts-morph-extractor' });

/**
 * Fallback props extractor using ts-morph
 *
 * Used when react-docgen-typescript fails (HOCs, forwardRef patterns,
 * compound components, non-standard exports).
 *
 * ## Extraction Flow
 *
 * Both public methods (`extractProps` and `extractMultipleComponents`) delegate
 * to `extractSingleComponent`, which is the unified entry point that applies
 * all extraction strategies consistently.
 *
 * ## Extraction Strategies (in order)
 *
 * 1. **Named interface** - Looks for `{ComponentName}Props` interface
 * 2. **Type alias** - Looks for `type {ComponentName}Props = ...`
 * 3. **Component props type** - Infers props from function/arrow/forwardRef
 *
 * ## Default Value Extraction
 *
 * Defaults are extracted from destructuring patterns in the component signature
 * (e.g., `{ variant = 'default' }`), NOT from JSDoc `@default` tags. This ensures
 * runtime defaults match what we report.
 */
export class TsMorphExtractor implements IPropsExtractor {
  private project: Project;
  private currentDefaults: Map<string, unknown> = new Map();

  constructor() {
    // Use in-memory file system to avoid file I/O
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        strict: true,
        esModuleInterop: true,
      },
    });
  }

  /**
   * Extract props for multiple components from a single source file
   *
   * Used for compound components where we need to extract props for each
   * sub-component (e.g., DropdownMenuItem, DropdownMenuContent).
   *
   * Uses the same unified extraction logic as `extractProps` via
   * `extractSingleComponent`, ensuring all 3 strategies are applied:
   * 1. Named interface (e.g., ButtonProps)
   * 2. Type alias (e.g., type ButtonProps = {...})
   * 3. Component props type (function, arrow, or forwardRef)
   *
   * @param sourceCode - Component source code
   * @param componentNames - List of component names to extract
   * @param filePath - Optional file path for context
   * @returns Map of component name to extraction result
   */
  async extractMultipleComponents(
    sourceCode: string,
    componentNames: string[],
    filePath?: string
  ): Promise<Map<string, PropsExtractionResult>> {
    const results = new Map<string, PropsExtractionResult>();
    const fileName = filePath || 'compound-component.tsx';

    try {
      const sourceFile = this.project.createSourceFile(fileName, sourceCode, {
        overwrite: true,
      });

      for (const name of componentNames) {
        const result = this.extractSingleComponent(sourceFile, name);

        if (result) {
          results.set(result.componentName ?? pascalCase(name), result);
        }
      }

      // Clean up
      this.project.removeSourceFile(sourceFile);

      logger.debug('Multi-component extraction complete', {
        requested: componentNames.length,
        found: results.size,
        componentNames: Array.from(results.keys()),
      });

      return results;
    } catch (error) {
      logger.debug('Multi-component extraction failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return results;
    } finally {
      this.currentDefaults.clear();
    }
  }

  async extractProps(
    sourceCode: string,
    componentName: string,
    filePath?: string
  ): Promise<PropsExtractionResult | null> {
    try {
      const fileName = filePath || `${componentName}.tsx`;
      const sourceFile = this.project.createSourceFile(fileName, sourceCode, {
        overwrite: true,
      });

      const result = this.extractSingleComponent(sourceFile, componentName);

      // Clean up the source file to prevent memory accumulation
      this.project.removeSourceFile(sourceFile);

      if (!result) {
        logger.debug('No props found by ts-morph', { componentName });
        return null;
      }

      return result;
    } catch (error) {
      logger.debug('ts-morph extraction failed', {
        componentName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    } finally {
      this.currentDefaults.clear();
    }
  }

  /**
   * Extract props for a single component from a source file
   *
   * This is the unified extraction logic used by both `extractProps`
   * and `extractMultipleComponents`. It ensures all 3 extraction strategies
   * are applied consistently.
   *
   * Extraction strategies (in order):
   * 1. Named interface (e.g., ButtonProps)
   * 2. Type alias (e.g., type ButtonProps = {...})
   * 3. Component props type (function, arrow, or forwardRef)
   *
   * @param sourceFile - ts-morph SourceFile to extract from
   * @param componentName - Name of the component to extract
   * @returns PropsExtractionResult if props found, null otherwise
   */
  private extractSingleComponent(
    sourceFile: SourceFile,
    componentName: string
  ): PropsExtractionResult | null {
    const pascalName = pascalCase(componentName);

    // Extract destructuring defaults upfront (stored in instance variable)
    this.currentDefaults = this.extractDestructuringDefaults(
      sourceFile,
      pascalName
    );

    const props = this.findAndExtractProps(sourceFile, pascalName);
    const description = this.extractDescription(sourceFile, pascalName);

    if (props.length === 0) return null;

    return {
      props,
      method: ExtractorMethod.TsMorph,
      componentName: pascalName,
      description,
    };
  }

  /**
   * Find and extract props using multiple strategies
   */
  private findAndExtractProps(
    sourceFile: SourceFile,
    componentName: string
  ): ExtractedProp[] {
    const pascalName = pascalCase(componentName);
    const propsTypeName = `${pascalName}Props`;

    // Strategy 1: Look for named interface (e.g., ButtonProps)
    const propsInterface = sourceFile.getInterface(propsTypeName);
    if (propsInterface) {
      return this.extractPropsFromInterface(propsInterface, sourceFile);
    }

    // Strategy 2: Look for type alias (e.g., type ButtonProps = {...})
    const propsType = sourceFile.getTypeAlias(propsTypeName);
    if (propsType) {
      return this.extractPropsFromTypeAlias(propsType);
    }

    // Strategy 3: Look for component (function or arrow) and infer props type
    const componentProps = this.extractPropsFromComponent(
      sourceFile,
      pascalName
    );
    if (componentProps) {
      return componentProps;
    }

    return [];
  }

  /**
   * Get component parameters from function or arrow function declaration
   *
   * Tries multiple patterns in order:
   * 1. Function declaration: function Button(props) {}
   * 2. forwardRef: const Button = forwardRef<Ref, Props>((props, ref) => ...)
   * 3. Arrow function: const Button = (props) => ...
   *
   * @param sourceFile - ts-morph SourceFile to search
   * @param componentName - Name of the component to find
   * @returns Parameters array if found, null otherwise
   */
  private getComponentParameters(
    sourceFile: SourceFile,
    componentName: string
  ): ParameterDeclaration[] | null {
    // Try function declaration first
    const fn = sourceFile.getFunction(componentName);
    if (fn) {
      const params = fn.getParameters();
      if (params.length > 0) return params;
    }

    // Try variable declaration (arrow function or forwardRef)
    const varDecl = sourceFile.getVariableDeclaration(componentName);
    const initializer = varDecl?.getInitializer();
    if (!initializer) return null;

    return this.getParametersFromInitializer(initializer);
  }

  /**
   * Extract parameters from a variable initializer (arrow function or forwardRef)
   *
   * Handles:
   * - forwardRef: forwardRef<Ref, Props>((props, ref) => ...)
   * - Arrow function: (props) => ...
   *
   * @param initializer - The initializer node from a variable declaration
   * @returns Parameters array if found, null otherwise
   */
  private getParametersFromInitializer(
    initializer: Node
  ): ParameterDeclaration[] | null {
    // Handle forwardRef pattern: forwardRef<Ref, Props>((props, ref) => ...)
    if (initializer.getText().includes('forwardRef')) {
      const callExpr = initializer.asKind(SyntaxKind.CallExpression);
      const args = callExpr?.getArguments();
      const arrowFn = args?.[0]?.asKind(SyntaxKind.ArrowFunction);
      return arrowFn?.getParameters() ?? null;
    }

    // Handle arrow function: const Button = (props) => ...
    const arrowFn = initializer.asKind(SyntaxKind.ArrowFunction);
    return arrowFn?.getParameters() ?? null;
  }

  /**
   * Extract props from component (function or arrow function)
   *
   * Unified method that handles both function declarations and arrow functions,
   * including forwardRef patterns. Uses getComponentParameters to find the
   * component's parameters, then extracts props from the first parameter's type.
   *
   * @param sourceFile - ts-morph SourceFile to extract from
   * @param componentName - Name of the component to extract
   * @returns Extracted props if found, null otherwise
   */
  private extractPropsFromComponent(
    sourceFile: SourceFile,
    componentName: string
  ): ExtractedProp[] | null {
    const params = this.getComponentParameters(sourceFile, componentName);
    if (!params?.length) return null;

    const typeNode = params[0].getTypeNode();
    if (!typeNode) return null;

    return this.extractPropsFromTypeNode(typeNode, sourceFile);
  }

  /**
   * Extract props from an interface declaration
   */
  private extractPropsFromInterface(
    iface: InterfaceDeclaration,
    sourceFile: SourceFile
  ): ExtractedProp[] {
    // Extract own properties
    const ownProps = iface
      .getProperties()
      .map((prop) => this.extractPropInfo(prop));
    const ownPropNames = new Set(ownProps.map((p) => p.name));

    // Extract props from extended interfaces (excluding duplicates)
    const extendedProps = iface.getExtends().flatMap((ext) => {
      const extName = ext.getText().split('<')[0]; // Handle generics
      const extInterface = sourceFile.getInterface(extName);
      if (!extInterface) return [];

      return extInterface
        .getProperties()
        .filter((prop) => !ownPropNames.has(prop.getName()))
        .map((prop) => this.extractPropInfo(prop));
    });

    return [...ownProps, ...extendedProps];
  }

  /**
   * Extract props from a type alias
   *
   * Handles multiple patterns:
   * - Type literal: `type Props = { prop: string }`
   * - Intersection: `type Props = BaseProps & { prop: string }`
   */
  private extractPropsFromTypeAlias(
    typeAlias: TypeAliasDeclaration
  ): ExtractedProp[] {
    const typeNode = typeAlias.getTypeNode();
    if (!typeNode) return [];

    // Handle direct type literal
    if (typeNode.getKind() === SyntaxKind.TypeLiteral) {
      const typeLiteral = typeNode.asKind(SyntaxKind.TypeLiteral);
      if (!typeLiteral) return [];
      return this.extractPropsFromMembers(typeLiteral.getMembers());
    }

    // Handle intersection type: BaseType & { customProps }
    if (typeNode.getKind() === SyntaxKind.IntersectionType) {
      return this.extractPropsFromIntersection(typeNode);
    }

    return [];
  }

  /**
   * Extract props from intersection type, focusing on type literals
   *
   * Example: `React.ComponentProps<typeof X> & { inset?: boolean }`
   * We extract only the props from type literals (the custom props),
   * not the inherited props from React.ComponentProps.
   */
  private extractPropsFromIntersection(typeNode: Node): ExtractedProp[] {
    const intersectionType = typeNode.asKind(SyntaxKind.IntersectionType);
    if (!intersectionType) return [];

    return intersectionType
      .getTypeNodes()
      .filter((type) => type.getKind() === SyntaxKind.TypeLiteral)
      .flatMap((type) => {
        const typeLiteral = type.asKind(SyntaxKind.TypeLiteral);
        return typeLiteral
          ? this.extractPropsFromMembers(typeLiteral.getMembers())
          : [];
      });
  }

  /**
   * Extract props from type literal members
   */
  private extractPropsFromMembers(members: Node[]): ExtractedProp[] {
    const props: ExtractedProp[] = [];

    for (const member of members) {
      if (member.getKind() !== SyntaxKind.PropertySignature) continue;

      const propSig = member.asKind(SyntaxKind.PropertySignature);
      if (!propSig) continue;

      props.push(this.extractPropInfo(propSig));
    }

    return props;
  }

  /**
   * Extract props from a type node (e.g., type reference or literal)
   */
  private extractPropsFromTypeNode(
    typeNode: Node,
    sourceFile: SourceFile
  ): ExtractedProp[] {
    // Handle type reference (resolve to interface or type alias)
    if (typeNode.getKind() === SyntaxKind.TypeReference) {
      return this.resolveTypeReference(typeNode, sourceFile);
    }

    // Handle inline type literal
    if (typeNode.getKind() === SyntaxKind.TypeLiteral) {
      const typeLiteral = typeNode.asKind(SyntaxKind.TypeLiteral);
      if (!typeLiteral) return [];
      return this.extractPropsFromMembers(typeLiteral.getMembers());
    }

    return [];
  }

  /**
   * Resolve a type reference to extract props
   */
  private resolveTypeReference(
    typeNode: Node,
    sourceFile: SourceFile
  ): ExtractedProp[] {
    const typeName = typeNode.getText().split('<')[0];

    const iface = sourceFile.getInterface(typeName);
    if (iface) {
      return this.extractPropsFromInterface(iface, sourceFile);
    }

    const typeAlias = sourceFile.getTypeAlias(typeName);
    if (typeAlias) {
      return this.extractPropsFromTypeAlias(typeAlias);
    }

    return [];
  }

  /**
   * Extract prop info from a property signature
   *
   * Uses simplified structure:
   * - type: simplified type string ("string", "boolean", not full union)
   * - values: array of valid options for enum types
   * - required: whether the prop is required (no ? marker)
   * - defaultValue: looked up from this.currentDefaults (extracted from destructuring)
   */
  private extractPropInfo(prop: PropertySignature): ExtractedProp {
    const name = prop.getName();
    const typeNode = prop.getTypeNode();
    const rawType = typeNode?.getText() || 'unknown';
    const isOptional = prop.hasQuestionToken();

    // Extract description from JSDoc (but NOT defaultValue - that comes from code)
    const jsDocs = prop.getJsDocs() || [];
    const description = jsDocs[0]?.getDescription()?.trim();

    return {
      name,
      type: simplifyType(rawType),
      description,
      defaultValue: this.currentDefaults.get(name),
      values: extractEnumValues(rawType),
      required: !isOptional,
      isChildren: name === 'children',
    };
  }

  /**
   * Extract component description from JSDoc
   */
  private extractDescription(
    sourceFile: SourceFile,
    componentName: string
  ): string | undefined {
    const pascalName = pascalCase(componentName);

    // Try function declaration
    const fn = sourceFile.getFunction(pascalName);
    if (fn) {
      const jsDocs = fn.getJsDocs();
      if (jsDocs.length > 0) {
        return jsDocs[0].getDescription()?.trim();
      }
    }

    // Try variable declaration
    const variable = sourceFile.getVariableDeclaration(pascalName);
    if (variable) {
      const statement = variable.getVariableStatement();
      const jsDocs = statement?.getJsDocs() || [];
      if (jsDocs.length > 0) {
        return jsDocs[0].getDescription()?.trim();
      }
    }

    return undefined;
  }

  /**
   * Extract default values from destructuring in function signature
   *
   * Parses patterns like: function Button({ variant = 'default', disabled = false })
   * This is the source of truth for defaults, not JSDoc @default tags.
   *
   * Handles two paths:
   * - Path 1: Function declaration - function Button({ variant = 'default' }) {}
   * - Path 2: Variable declaration - arrow function or forwardRef pattern
   *
   * Pure function: creates and returns a new Map without mutating external state.
   */
  private extractDestructuringDefaults(
    sourceFile: SourceFile,
    componentName: string
  ): Map<string, unknown> {
    const pascalName = pascalCase(componentName);

    // Path 1: Function declaration
    const fn = sourceFile.getFunction(pascalName);
    const fnParams = fn?.getParameters();
    if (fnParams?.length) {
      return this.extractDefaultsFromParameter(fnParams[0]);
    }

    // Path 2: Variable declaration (arrow function or forwardRef)
    const varDecl = sourceFile.getVariableDeclaration(pascalName);
    const initializer = varDecl?.getInitializer();
    if (!initializer) return new Map();

    const params = this.getParametersFromInitializer(initializer);
    if (params?.length) {
      return this.extractDefaultsFromParameter(params[0]);
    }

    return new Map();
  }

  /**
   * Extract defaults from a function parameter's destructuring pattern
   *
   * Pure function: creates and returns a new Map with extracted defaults.
   */
  private extractDefaultsFromParameter(
    param: ParameterDeclaration
  ): Map<string, unknown> {
    const defaults = new Map<string, unknown>();

    const nameNode = param.getNameNode();
    if (nameNode?.getKind() !== SyntaxKind.ObjectBindingPattern) {
      return defaults;
    }

    const bindingPattern = nameNode.asKind(SyntaxKind.ObjectBindingPattern);
    if (!bindingPattern) return defaults;

    for (const element of bindingPattern.getElements()) {
      const elementInitializer = element.getInitializer();
      if (!elementInitializer) continue;

      const propName = element.getNameNode().getText();
      const value = this.parseDefaultValue(elementInitializer.getText());
      defaults.set(propName, value);
    }

    return defaults;
  }

  /**
   * Parse a default value string into appropriate type
   */
  private parseDefaultValue(text: string): unknown {
    if (text === 'true') return true;
    if (text === 'false') return false;
    if (text === 'null') return null;
    if (text === 'undefined') return undefined;

    // String literal
    if (/^['"].*['"]$/.test(text)) {
      return text.slice(1, -1);
    }

    // Number
    if (!isNaN(Number(text))) {
      return Number(text);
    }

    // Keep as string for complex expressions (arrays, objects, function calls)
    return text;
  }
}
