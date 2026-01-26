/**
 * Storybook Extractor
 *
 * Extracts component examples and metadata from Storybook CSF3 files
 * using ts-morph AST parsing. Supports Storybook 10 format with
 * Meta, StoryObj, args, render, and play functions.
 */

import {
  type ArrowFunction,
  type Expression,
  type FunctionExpression,
  type Node,
  type ObjectLiteralExpression,
  Project,
  type SourceFile,
  SyntaxKind,
  ts,
} from 'ts-morph';

import { createLogger } from '../../utils/logger.js';

import type {
  ArgTypeInfo,
  ExtractedStory,
  StorybookExtractionResult,
  StoryComplexity,
} from './types.js';

const logger = createLogger({ name: 'storybook-extractor' });

/**
 * Internal representation of meta configuration
 */
interface MetaConfig {
  title?: string;
  argTypes: Record<string, ArgTypeInfo>;
  defaultArgs: Record<string, unknown>;
  componentName?: string;
}

/**
 * Patterns for showcase story names that should be filtered out
 */
const SHOWCASE_PATTERNS = [
  /^All(Variants|Sizes|States|Modes)$/i,
  /^Showcase$/i,
  /^Overview$/i,
  /^Kitchen\s*Sink$/i,
];

/**
 * Patterns for minimal/basic story names
 */
const MINIMAL_STORY_PATTERNS = [/^Default$/i, /^Basic$/i, /^Simple$/i];

/**
 * Props to skip when generating code (spy functions, internal props)
 */
const SKIP_PROPS_FOR_CODE = new Set(['onClick', 'onChange', 'onSubmit']);

/**
 * Extracts component examples from Storybook CSF3 files
 */
export class StorybookExtractor {
  private project: Project;

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        strict: false,
        skipLibCheck: true,
      },
    });
  }

  /**
   * Extract stories and metadata from Storybook file
   *
   * @param storiesCode - Source code of the .stories.tsx file
   * @param filePath - Optional file path for context
   * @returns Extraction result with stories, argTypes, and defaultArgs
   */
  extract(storiesCode: string, filePath?: string): StorybookExtractionResult {
    if (!storiesCode.trim()) {
      logger.debug('Empty stories code provided', { filePath });
      return this.emptyResult();
    }

    const fileName = filePath ?? 'Component.stories.tsx';
    const sourceFile = this.project.createSourceFile(fileName, storiesCode, {
      overwrite: true,
    });

    try {
      const meta = this.extractMeta(sourceFile);
      const stories = this.extractStories(sourceFile, meta);

      logger.debug('Storybook extraction complete', {
        filePath,
        title: meta.title,
        storyCount: stories.length,
        argTypeCount: Object.keys(meta.argTypes).length,
      });

      return {
        stories,
        title: meta.title,
        argTypes: meta.argTypes,
        defaultArgs: meta.defaultArgs,
      };
    } catch (error) {
      logger.debug('Storybook extraction failed', {
        filePath,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return this.emptyResult();
    } finally {
      this.project.removeSourceFile(sourceFile);
    }
  }

  /**
   * Return empty result for error cases
   */
  private emptyResult(): StorybookExtractionResult {
    return {
      stories: [],
      argTypes: {},
      defaultArgs: {},
    };
  }

  /**
   * Extract meta configuration from source file
   *
   * Supports patterns:
   * - const meta: Meta<typeof Component> = { ... }
   * - const meta = { ... } satisfies Meta<typeof Component>
   * - export default { ... } satisfies Meta
   */
  private extractMeta(sourceFile: SourceFile): MetaConfig {
    const result: MetaConfig = {
      argTypes: {},
      defaultArgs: {},
    };

    // Try to find meta variable declaration
    const metaVar = sourceFile.getVariableDeclaration('meta');
    if (metaVar) {
      const initializer = metaVar.getInitializer();
      if (initializer) {
        const objLiteral = this.resolveToObjectLiteral(initializer);
        if (objLiteral) {
          this.extractMetaProperties(objLiteral, result);
        }
      }
    }

    // Try default export if no meta variable found
    if (!result.title) {
      const defaultExport = sourceFile.getDefaultExportSymbol();
      if (defaultExport) {
        const declarations = defaultExport.getDeclarations();
        for (const decl of declarations) {
          const exportAssign = decl.asKind(SyntaxKind.ExportAssignment);
          if (exportAssign) {
            const expr = exportAssign.getExpression();
            const objLiteral = this.resolveToObjectLiteral(expr);
            if (objLiteral) {
              this.extractMetaProperties(objLiteral, result);
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Resolve an expression to an ObjectLiteralExpression
   * Handles satisfies expressions and direct object literals
   */
  private resolveToObjectLiteral(
    node: Node
  ): ObjectLiteralExpression | undefined {
    // Handle satisfies expression: { ... } satisfies Meta
    const satisfiesExpr = node.asKind(SyntaxKind.SatisfiesExpression);
    if (satisfiesExpr) {
      return satisfiesExpr
        .getExpression()
        .asKind(SyntaxKind.ObjectLiteralExpression);
    }

    // Handle as expression: { ... } as Meta
    const asExpr = node.asKind(SyntaxKind.AsExpression);
    if (asExpr) {
      return asExpr.getExpression().asKind(SyntaxKind.ObjectLiteralExpression);
    }

    // Direct object literal
    return node.asKind(SyntaxKind.ObjectLiteralExpression);
  }

  /**
   * Extract properties from meta object literal
   */
  private extractMetaProperties(
    objLiteral: ObjectLiteralExpression,
    result: MetaConfig
  ): void {
    // Extract title
    const titleProp = objLiteral
      .getProperty('title')
      ?.asKind(SyntaxKind.PropertyAssignment);
    if (titleProp) {
      const titleInit = titleProp.getInitializer();
      if (titleInit) {
        result.title = this.extractStringValueFromExpression(titleInit);
      }
    }

    // Extract component name from `component` property
    const componentProp = objLiteral
      .getProperty('component')
      ?.asKind(SyntaxKind.PropertyAssignment);
    if (componentProp) {
      const componentInit = componentProp.getInitializer();
      if (componentInit) {
        result.componentName = componentInit.getText();
      }
    }

    // Extract argTypes
    const argTypesProp = objLiteral
      .getProperty('argTypes')
      ?.asKind(SyntaxKind.PropertyAssignment);
    if (argTypesProp) {
      const argTypesObj = argTypesProp
        .getInitializer()
        ?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (argTypesObj) {
        result.argTypes = this.extractArgTypes(argTypesObj);
      }
    }

    // Extract default args
    const argsProp = objLiteral
      .getProperty('args')
      ?.asKind(SyntaxKind.PropertyAssignment);
    if (argsProp) {
      const argsObj = argsProp
        .getInitializer()
        ?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (argsObj) {
        result.defaultArgs = this.extractArgsObject(argsObj);
      }
    }
  }

  /**
   * Extract argTypes metadata from object literal
   */
  private extractArgTypes(
    argTypesObj: ObjectLiteralExpression
  ): Record<string, ArgTypeInfo> {
    const result: Record<string, ArgTypeInfo> = {};

    for (const prop of argTypesObj.getProperties()) {
      const assignment = prop.asKind(SyntaxKind.PropertyAssignment);
      if (!assignment) continue;

      const propName = assignment.getName();
      const propObj = assignment
        .getInitializer()
        ?.asKind(SyntaxKind.ObjectLiteralExpression);

      if (propObj) {
        result[propName] = this.extractSingleArgType(propObj);
      }
    }

    return result;
  }

  /**
   * Extract a single argType definition
   */
  private extractSingleArgType(
    argTypeObj: ObjectLiteralExpression
  ): ArgTypeInfo {
    const result: ArgTypeInfo = {};

    // Extract control
    const controlProp = argTypeObj
      .getProperty('control')
      ?.asKind(SyntaxKind.PropertyAssignment);
    if (controlProp) {
      const controlInit = controlProp.getInitializer();
      if (controlInit) {
        // Handle both string and object control definitions
        const controlStr = controlInit.asKind(SyntaxKind.StringLiteral);
        if (controlStr) {
          result.control = controlStr.getLiteralValue();
        } else {
          result.control = controlInit.getText();
        }
      }
    }

    // Extract options
    const optionsProp = argTypeObj
      .getProperty('options')
      ?.asKind(SyntaxKind.PropertyAssignment);
    if (optionsProp) {
      const optionsArr = optionsProp
        .getInitializer()
        ?.asKind(SyntaxKind.ArrayLiteralExpression);
      if (optionsArr) {
        result.options = optionsArr.getElements().map((el) => {
          const str = el.asKind(SyntaxKind.StringLiteral);
          return str
            ? str.getLiteralValue()
            : el.getText().replace(/['"]/g, '');
        });
      }
    }

    // Extract description
    const descProp = argTypeObj
      .getProperty('description')
      ?.asKind(SyntaxKind.PropertyAssignment);
    if (descProp) {
      const descInit = descProp.getInitializer();
      if (descInit) {
        result.description = this.extractStringValueFromExpression(descInit);
      }
    }

    // Extract defaultValue
    const defaultProp = argTypeObj
      .getProperty('defaultValue')
      ?.asKind(SyntaxKind.PropertyAssignment);
    if (defaultProp) {
      const defaultInit = defaultProp.getInitializer();
      if (defaultInit) {
        result.defaultValue = this.parseValueFromNode(defaultInit);
      }
    }

    return result;
  }

  /**
   * Extract all story exports from source file
   */
  private extractStories(
    sourceFile: SourceFile,
    meta: MetaConfig
  ): ExtractedStory[] {
    const stories: ExtractedStory[] = [];

    // Get all variable statements with export keyword
    for (const statement of sourceFile.getStatements()) {
      const varStatement = statement.asKind(SyntaxKind.VariableStatement);
      if (!varStatement) continue;

      // Check if it's exported
      const isExported = varStatement.hasExportKeyword();
      if (!isExported) continue;

      // Process each declaration
      for (const decl of varStatement.getDeclarations()) {
        const name = decl.getName();

        // Skip 'meta' and any non-story exports
        if (name === 'meta' || name.startsWith('_')) continue;

        const initializer = decl.getInitializer();
        if (!initializer) continue;

        const storyObj = this.resolveToObjectLiteral(initializer);
        if (!storyObj) continue;

        const story = this.parseStory(name, storyObj, meta);
        if (story) {
          stories.push(story);
        }
      }
    }

    return stories;
  }

  /**
   * Parse a single story object
   */
  private parseStory(
    name: string,
    storyObj: ObjectLiteralExpression,
    meta: MetaConfig
  ): ExtractedStory | null {
    // Extract args
    const args = this.extractStoryArgs(storyObj);

    // Extract render function
    const { hasRender, renderCode } = this.extractRenderFunction(storyObj);

    // Check for play function
    const hasPlay = this.hasPlayFunction(storyObj);

    // Check for chromatic.disableSnapshot
    const isInteractionOnly = this.isInteractionOnly(storyObj, hasPlay, args);

    // Check if showcase story
    const isShowcase = this.isShowcase(name);

    // Determine complexity
    const complexity = this.classifyStory(name, hasRender, isInteractionOnly);

    // Extract props used
    const propsUsed = this.extractPropsUsed(args, renderCode);

    // Generate code from args if no render function
    const code = hasRender
      ? undefined
      : this.generateCodeFromArgs(
          meta.componentName ?? 'Component',
          args,
          meta.defaultArgs
        );

    // Generate human-readable title
    const title = this.generateTitle(name);

    return {
      name,
      title,
      args: Object.keys(args).length > 0 ? args : undefined,
      hasRender,
      renderCode,
      code,
      propsUsed,
      complexity,
      isInteractionOnly,
      isShowcase,
    };
  }

  /**
   * Extract args from story object
   */
  private extractStoryArgs(
    storyObj: ObjectLiteralExpression
  ): Record<string, unknown> {
    const argsProp = storyObj
      .getProperty('args')
      ?.asKind(SyntaxKind.PropertyAssignment);

    if (!argsProp) return {};

    const argsObj = argsProp
      .getInitializer()
      ?.asKind(SyntaxKind.ObjectLiteralExpression);

    if (!argsObj) return {};

    return this.extractArgsObject(argsObj);
  }

  /**
   * Extract args object to Record<string, unknown>
   */
  private extractArgsObject(
    argsObj: ObjectLiteralExpression
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const prop of argsObj.getProperties()) {
      const assignment = prop.asKind(SyntaxKind.PropertyAssignment);
      if (!assignment) continue;

      const propName = assignment.getName();
      const propInit = assignment.getInitializer();

      if (propInit) {
        result[propName] = this.parseValueFromNode(propInit);
      }
    }

    return result;
  }

  /**
   * Parse a value node to its JavaScript representation
   */
  private parseValueFromNode(node: Node): unknown {
    // String literal
    const strLiteral = node.asKind(SyntaxKind.StringLiteral);
    if (strLiteral) return strLiteral.getLiteralValue();

    // Numeric literal
    const numLiteral = node.asKind(SyntaxKind.NumericLiteral);
    if (numLiteral) return numLiteral.getLiteralValue();

    // Boolean literals
    if (node.getKind() === SyntaxKind.TrueKeyword) return true;
    if (node.getKind() === SyntaxKind.FalseKeyword) return false;

    // Null
    if (node.getKind() === SyntaxKind.NullKeyword) return null;

    // Undefined
    if (node.getKind() === SyntaxKind.UndefinedKeyword) return undefined;

    // Array literal
    const arrLiteral = node.asKind(SyntaxKind.ArrayLiteralExpression);
    if (arrLiteral) {
      return arrLiteral.getElements().map((el) => this.parseValueFromNode(el));
    }

    // Object literal
    const objLiteral = node.asKind(SyntaxKind.ObjectLiteralExpression);
    if (objLiteral) {
      return this.extractArgsObject(objLiteral);
    }

    // JSX - return as code string
    const jsxElement = node.asKind(SyntaxKind.JsxElement);
    const jsxSelfClosing = node.asKind(SyntaxKind.JsxSelfClosingElement);
    const jsxFragment = node.asKind(SyntaxKind.JsxFragment);
    if (jsxElement || jsxSelfClosing || jsxFragment) {
      return `__JSX__${node.getText()}`;
    }

    // Function call (like fn()) - mark as function
    const callExpr = node.asKind(SyntaxKind.CallExpression);
    if (callExpr) {
      return `__FUNC__${callExpr.getText()}`;
    }

    // Arrow function or function expression
    const arrowFn = node.asKind(SyntaxKind.ArrowFunction);
    const funcExpr = node.asKind(SyntaxKind.FunctionExpression);
    if (arrowFn || funcExpr) {
      return `__FUNC__${node.getText()}`;
    }

    // Default: return raw text
    return node.getText();
  }

  /**
   * Extract render function details
   */
  private extractRenderFunction(storyObj: ObjectLiteralExpression): {
    hasRender: boolean;
    renderCode?: string;
  } {
    const renderProp = storyObj.getProperty('render');
    if (!renderProp) return { hasRender: false };

    const assignment = renderProp.asKind(SyntaxKind.PropertyAssignment);
    if (!assignment) {
      // Could be a method
      const method = renderProp.asKind(SyntaxKind.MethodDeclaration);
      if (method) {
        const body = method.getBody();
        const renderCode = body ? this.extractJsxFromBody(body) : undefined;
        return { hasRender: true, renderCode };
      }
      return { hasRender: false };
    }

    const renderInit = assignment.getInitializer();
    if (!renderInit) return { hasRender: false };

    // Arrow function or function expression
    const arrowFn = renderInit.asKind(SyntaxKind.ArrowFunction);
    const funcExpr = renderInit.asKind(SyntaxKind.FunctionExpression);

    const fn = arrowFn ?? funcExpr;
    if (!fn) return { hasRender: false };

    const renderCode = this.extractJsxFromFunction(fn);
    return { hasRender: true, renderCode };
  }

  /**
   * Extract JSX code from function body
   */
  private extractJsxFromFunction(
    fn: ArrowFunction | FunctionExpression
  ): string | undefined {
    const body = fn.getBody();

    // Arrow function with expression body (no braces)
    if (body.getKind() !== SyntaxKind.Block) {
      return body.getText();
    }

    return this.extractJsxFromBody(body);
  }

  /**
   * Extract JSX from a block body (return statement)
   */
  private extractJsxFromBody(
    body: ReturnType<ArrowFunction['getBody']>
  ): string | undefined {
    const block = body.asKind(SyntaxKind.Block);
    if (!block) return undefined;

    // Find return statement
    const returnStatement = block.getStatements().find((s) => {
      return s.getKind() === SyntaxKind.ReturnStatement;
    });

    if (!returnStatement) return undefined;

    const retStmt = returnStatement.asKind(SyntaxKind.ReturnStatement);
    if (!retStmt) return undefined;

    const expr = retStmt.getExpression();
    if (!expr) return undefined;

    // Handle parenthesized expression
    const parenExpr = expr.asKind(SyntaxKind.ParenthesizedExpression);
    if (parenExpr) {
      return parenExpr.getExpression().getText();
    }

    return expr.getText();
  }

  /**
   * Check if story has a play function
   */
  private hasPlayFunction(storyObj: ObjectLiteralExpression): boolean {
    return storyObj.getProperty('play') !== undefined;
  }

  /**
   * Determine if story is interaction-only (no visual, just tests)
   */
  private isInteractionOnly(
    storyObj: ObjectLiteralExpression,
    hasPlay: boolean,
    args: Record<string, unknown>
  ): boolean {
    // Check chromatic.disableSnapshot
    const paramsProp = storyObj
      .getProperty('parameters')
      ?.asKind(SyntaxKind.PropertyAssignment);

    if (paramsProp) {
      const paramsObj = paramsProp
        .getInitializer()
        ?.asKind(SyntaxKind.ObjectLiteralExpression);

      if (paramsObj) {
        const chromaticProp = paramsObj
          .getProperty('chromatic')
          ?.asKind(SyntaxKind.PropertyAssignment);

        if (chromaticProp) {
          const chromaticObj = chromaticProp
            .getInitializer()
            ?.asKind(SyntaxKind.ObjectLiteralExpression);

          if (chromaticObj) {
            const disableSnapshotProp = chromaticObj
              .getProperty('disableSnapshot')
              ?.asKind(SyntaxKind.PropertyAssignment);

            if (disableSnapshotProp) {
              const value = disableSnapshotProp.getInitializer();
              if (value?.getKind() === SyntaxKind.TrueKeyword) {
                return true;
              }
            }
          }
        }
      }
    }

    // Story with play but no meaningful args or render is likely interaction-only
    if (hasPlay && Object.keys(args).length <= 1) {
      // Only children arg is not meaningful enough
      const onlyChildren = Object.keys(args).length === 1 && 'children' in args;
      if (onlyChildren || Object.keys(args).length === 0) {
        // Check if it has render function
        const hasRender = storyObj.getProperty('render') !== undefined;
        if (!hasRender) {
          return false; // Simple story with play - might still be visual
        }
      }
    }

    return false;
  }

  /**
   * Check if story name indicates a showcase/grid story
   */
  private isShowcase(name: string): boolean {
    return SHOWCASE_PATTERNS.some((pattern) => pattern.test(name));
  }

  /**
   * Classify story complexity
   */
  private classifyStory(
    name: string,
    hasRender: boolean,
    isInteractionOnly: boolean
  ): StoryComplexity {
    // Interaction-only stories are common (but will be filtered)
    if (isInteractionOnly) return 'common';

    // Minimal: Default, Basic, Simple
    if (MINIMAL_STORY_PATTERNS.some((pattern) => pattern.test(name))) {
      return 'minimal';
    }

    // Advanced: Has custom render function
    if (hasRender) {
      return 'advanced';
    }

    // Common: Everything else (variant, size, state stories)
    return 'common';
  }

  /**
   * Extract prop names used in story
   */
  private extractPropsUsed(
    args: Record<string, unknown>,
    renderCode?: string
  ): string[] {
    const propsUsed = new Set<string>();

    // Add args keys (except event handlers and children)
    for (const key of Object.keys(args)) {
      if (key !== 'children' && !key.startsWith('on')) {
        propsUsed.add(key);
      }
    }

    // Extract props from render code JSX
    if (renderCode) {
      // Match prop patterns: propName="value" or propName={value}
      const propPattern = /\s([a-z][a-zA-Z0-9]*)(?:=["'{]|(?=\s|>|\/))/g;
      let match;
      while ((match = propPattern.exec(renderCode)) !== null) {
        const propName = match[1];
        // Filter out common JSX attributes that aren't component props
        if (
          !['className', 'style', 'key', 'ref', 'data-testid'].includes(
            propName
          )
        ) {
          propsUsed.add(propName);
        }
      }

      // Match spread props: {...args}
      if (
        renderCode.includes('{...args}') ||
        renderCode.includes('{...props}')
      ) {
        // Add common props that might be spread
        for (const key of Object.keys(args)) {
          if (key !== 'children') {
            propsUsed.add(key);
          }
        }
      }
    }

    return Array.from(propsUsed).sort();
  }

  /**
   * Generate JSX code from args object
   */
  generateCodeFromArgs(
    componentName: string,
    args: Record<string, unknown>,
    defaultArgs: Record<string, unknown>
  ): string {
    // Filter out event handlers, functions, and default values
    const meaningfulArgs = Object.entries(args).filter(([key, value]) => {
      // Skip event handlers
      if (SKIP_PROPS_FOR_CODE.has(key)) return false;

      // Skip function values (like fn())
      if (typeof value === 'string' && value.startsWith('__FUNC__')) {
        return false;
      }

      // Skip if same as default
      if (key in defaultArgs && defaultArgs[key] === value) {
        return false;
      }

      return true;
    });

    const children = args.children;
    const hasChildren = children !== undefined && children !== null;

    // Get non-children props
    const nonChildrenArgs = meaningfulArgs.filter(
      ([key]) => key !== 'children'
    );

    // No props at all
    if (nonChildrenArgs.length === 0) {
      if (hasChildren) {
        const childrenStr = this.valueToJsxString(children);
        return `<${componentName}>${childrenStr}</${componentName}>`;
      }
      return `<${componentName} />`;
    }

    // Build props string
    const propsStr = nonChildrenArgs
      .map(([key, value]) => this.propToJsxString(key, value))
      .join(' ');

    if (hasChildren) {
      const childrenStr = this.valueToJsxString(children);
      return `<${componentName} ${propsStr}>${childrenStr}</${componentName}>`;
    }

    return `<${componentName} ${propsStr} />`;
  }

  /**
   * Convert a prop key-value pair to JSX string
   */
  private propToJsxString(key: string, value: unknown): string {
    if (typeof value === 'string') {
      // Check for JSX value
      if (value.startsWith('__JSX__')) {
        return `${key}={${value.slice(7)}}`;
      }
      return `${key}="${value}"`;
    }

    if (typeof value === 'boolean') {
      return value ? key : `${key}={false}`;
    }

    if (typeof value === 'number') {
      return `${key}={${value}}`;
    }

    if (value === undefined || value === null) {
      return `${key}={${value}}`;
    }

    // Objects, arrays, etc.
    return `${key}={${JSON.stringify(value)}}`;
  }

  /**
   * Convert a value to JSX children string
   */
  private valueToJsxString(value: unknown): string {
    if (typeof value === 'string') {
      // Check for JSX value
      if (value.startsWith('__JSX__')) {
        return value.slice(7);
      }
      return value;
    }

    if (typeof value === 'number') {
      return String(value);
    }

    return String(value);
  }

  /**
   * Generate human-readable title from story name
   * Converts PascalCase/camelCase to "Title Case With Spaces"
   */
  private generateTitle(name: string): string {
    // Insert space before capital letters, handle consecutive caps
    return name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .trim();
  }

  /**
   * Extract string value from an Expression node
   */
  private extractStringValueFromExpression(
    node: Expression
  ): string | undefined {
    const strLiteral = node.asKind(SyntaxKind.StringLiteral);
    if (strLiteral) return strLiteral.getLiteralValue();

    // Template literal
    const templateLiteral = node.asKind(
      SyntaxKind.NoSubstitutionTemplateLiteral
    );
    if (templateLiteral) return templateLiteral.getLiteralValue();

    return undefined;
  }
}

/**
 * Factory function for creating StorybookExtractor
 */
export function createStorybookExtractor(): StorybookExtractor {
  return new StorybookExtractor();
}
