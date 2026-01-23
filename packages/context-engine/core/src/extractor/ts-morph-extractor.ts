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
 */

import {
  type InterfaceDeclaration,
  type Node,
  Project,
  type PropertySignature,
  type SourceFile,
  SyntaxKind,
  ts,
  type TypeAliasDeclaration,
} from 'ts-morph';

import type { ExtractedProp, PropTypeCategory } from '../types/index.js';
import { pascalCase } from '../utils/case.js';
import { createLogger } from '../utils/logger.js';

import {
  ExtractorMethod,
  type IPropsExtractor,
  type PropsExtractionResult,
} from './types.js';

const logger = createLogger({ name: 'ts-morph-extractor' });

/**
 * Fallback props extractor using ts-morph
 */
export class TsMorphExtractor implements IPropsExtractor {
  private project: Project;

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

      const props = this.findAndExtractProps(sourceFile, componentName);
      const description = this.extractDescription(sourceFile, componentName);

      // Clean up the source file to prevent memory accumulation
      this.project.removeSourceFile(sourceFile);

      if (props.length === 0) {
        logger.debug('No props found by ts-morph', { componentName });
        return null;
      }

      return {
        props,
        method: ExtractorMethod.TsMorph,
        componentName: pascalCase(componentName),
        description,
      };
    } catch (error) {
      logger.debug('ts-morph extraction failed', {
        componentName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
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

    // Strategy 3: Look for function component and infer props type
    const fnProps = this.extractPropsFromFunctionComponent(
      sourceFile,
      pascalName
    );
    if (fnProps) {
      return fnProps;
    }

    // Strategy 4: Look for arrow function component
    const arrowProps = this.extractPropsFromArrowComponent(
      sourceFile,
      pascalName
    );
    if (arrowProps) {
      return arrowProps;
    }

    return [];
  }

  /**
   * Extract props from function component declaration
   */
  private extractPropsFromFunctionComponent(
    sourceFile: SourceFile,
    componentName: string
  ): ExtractedProp[] | null {
    const componentFn = sourceFile.getFunction(componentName);
    if (!componentFn) return null;

    const params = componentFn.getParameters();
    if (params.length === 0) return null;

    const typeNode = params[0].getTypeNode();
    if (!typeNode) return null;

    return this.extractPropsFromTypeNode(typeNode, sourceFile);
  }

  /**
   * Extract props from arrow function component
   */
  private extractPropsFromArrowComponent(
    sourceFile: SourceFile,
    componentName: string
  ): ExtractedProp[] | null {
    const varDecl = sourceFile.getVariableDeclaration(componentName);
    if (!varDecl) return null;

    const initializer = varDecl.getInitializer();
    if (!initializer) return null;

    // Check for forwardRef pattern first
    const forwardRefProps = this.extractForwardRefProps(initializer);
    if (forwardRefProps) return forwardRefProps;

    // Check for arrow function
    if (initializer.getKind() !== SyntaxKind.ArrowFunction) return null;

    const arrowFn = initializer.asKind(SyntaxKind.ArrowFunction);
    if (!arrowFn) return null;

    const params = arrowFn.getParameters();
    if (params.length === 0) return null;

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
    const props: ExtractedProp[] = [];

    // Extract own properties
    for (const prop of iface.getProperties()) {
      props.push(this.extractPropInfo(prop));
    }

    // Check for extended interfaces
    for (const ext of iface.getExtends()) {
      const extName = ext.getText().split('<')[0]; // Handle generics
      const extInterface = sourceFile.getInterface(extName);
      if (extInterface) {
        for (const prop of extInterface.getProperties()) {
          if (!props.find((p) => p.name === prop.getName())) {
            props.push(this.extractPropInfo(prop));
          }
        }
      }
    }

    return props;
  }

  /**
   * Extract props from a type alias
   */
  private extractPropsFromTypeAlias(
    typeAlias: TypeAliasDeclaration
  ): ExtractedProp[] {
    const typeNode = typeAlias.getTypeNode();
    if (!typeNode || typeNode.getKind() !== SyntaxKind.TypeLiteral) {
      return [];
    }

    const typeLiteral = typeNode.asKind(SyntaxKind.TypeLiteral);
    if (!typeLiteral) return [];

    return this.extractPropsFromMembers(typeLiteral.getMembers());
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
   * Extract props from forwardRef pattern
   */
  private extractForwardRefProps(initializer: Node): ExtractedProp[] | null {
    if (!initializer.getText().includes('forwardRef')) return null;

    const callExpr = initializer.asKind(SyntaxKind.CallExpression);
    if (!callExpr) return null;

    const typeArgs = callExpr.getTypeArguments();
    // forwardRef<RefType, PropsType> - need at least 2 type args
    if (typeArgs.length < 2) return null;

    const propsType = typeArgs[1];
    return this.extractPropsFromTypeNode(
      propsType,
      initializer.getSourceFile()
    );
  }

  /**
   * Extract prop info from a property signature
   */
  private extractPropInfo(prop: PropertySignature): ExtractedProp {
    const name = prop.getName();
    const typeNode = prop.getTypeNode();
    const type = typeNode?.getText() || 'unknown';
    const isOptional = prop.hasQuestionToken() ?? false;

    // Extract JSDoc info
    const jsDocs = prop.getJsDocs() || [];
    let description: string | undefined;
    let defaultValue: unknown;
    let deprecated = false;
    let deprecationMessage: string | undefined;

    if (jsDocs.length > 0) {
      description = jsDocs[0].getDescription()?.trim();

      for (const tag of jsDocs[0].getTags() || []) {
        const tagName = tag.getTagName();
        if (tagName === 'default') {
          defaultValue = tag.getCommentText();
        }
        if (tagName === 'deprecated') {
          deprecated = true;
          deprecationMessage = tag.getCommentText();
        }
      }
    }

    return {
      name,
      type,
      typeCategory: this.categorizeType(type),
      required: !isOptional,
      defaultValue,
      description,
      possibleValues: this.extractPossibleValues(type),
      isChildren: name === 'children',
      isClassName: name === 'className',
      isStyle: name === 'style',
      deprecated,
      deprecationMessage,
    };
  }

  /**
   * Categorize TypeScript type string into simplified categories
   */
  private categorizeType(typeString: string): PropTypeCategory {
    const normalized = typeString.toLowerCase();

    if (['string', 'number', 'boolean'].includes(normalized)) {
      return 'primitive';
    }
    if (typeString.includes('|') && !typeString.includes('=>')) {
      if (/^['"][^'"]+['"](\s*\|\s*['"][^'"]+['"])+$/.test(typeString.trim())) {
        return 'literal';
      }
      return 'union';
    }
    if (typeString.startsWith('{') || typeString.includes('Record<')) {
      return 'object';
    }
    if (typeString.includes('[]') || typeString.startsWith('Array<')) {
      return 'array';
    }
    if (typeString.includes('=>') || typeString.includes('Function')) {
      return 'function';
    }
    if (typeString.includes('Ref<') || typeString.includes('RefObject')) {
      return 'ref';
    }
    if (
      typeString.includes('ReactNode') ||
      typeString.includes('ReactElement')
    ) {
      return 'element';
    }

    return 'unknown';
  }

  /**
   * Extract possible values from literal union types
   */
  private extractPossibleValues(typeString: string): string[] | undefined {
    // Extract literal union values: 'a' | 'b' | 'c'
    const literalMatch = typeString.match(/['"]([^'"]+)['"]/g);
    if (literalMatch && literalMatch.length > 1) {
      return literalMatch.map((v) => v.replace(/['"]/g, ''));
    }
    return undefined;
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
}
