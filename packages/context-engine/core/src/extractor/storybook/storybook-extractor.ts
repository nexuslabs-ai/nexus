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
  type ObjectLiteralElementLike,
  type ObjectLiteralExpression,
  Project,
  type PropertyAssignment,
  type SourceFile,
  SyntaxKind,
  ts,
} from 'ts-morph';

import { createLogger } from '../../utils/logger.js';

import type {
  ExtractedStory,
  StorybookExtractionResult,
  StoryComplexity,
} from './types.js';

const logger = createLogger({ name: 'storybook-extractor' });

/**
 * Internal representation of meta configuration
 *
 * Note: defaultArgs is used internally for code generation but not exposed in the result.
 */
interface MetaConfig {
  title?: string;
  defaultArgs: Record<string, unknown>;
  componentName?: string;
}

/**
 * Internal representation of extracted story data before building the final result
 */
interface StoryData {
  args: Record<string, unknown>;
  hasRender: boolean;
  renderCode?: string;
  hasPlay: boolean;
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
   * @param storiesCode - Source code of the .stories.tsx file (undefined returns empty result)
   * @param filePath - Optional file path for context
   * @returns Extraction result with stories and title
   */
  extract(
    storiesCode: string | undefined,
    filePath?: string
  ): StorybookExtractionResult {
    if (!storiesCode?.trim()) {
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
      });

      return {
        stories,
        title: meta.title,
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
    const objLiteral = this.getMetaObjectLiteral(sourceFile);
    if (!objLiteral) {
      return { defaultArgs: {} };
    }
    return this.extractMetaFromObject(objLiteral);
  }

  /**
   * Find the meta object literal from either named variable or default export
   */
  private getMetaObjectLiteral(
    sourceFile: SourceFile
  ): ObjectLiteralExpression | undefined {
    // Try named meta variable first
    const metaVar = sourceFile.getVariableDeclaration('meta');
    if (metaVar) {
      const initializer = metaVar.getInitializer();
      if (initializer) {
        const objLiteral = this.resolveToObjectLiteral(initializer);
        if (objLiteral) return objLiteral;
      }
    }

    // Fall back to default export
    const defaultExport = sourceFile.getDefaultExportSymbol();
    if (!defaultExport) return undefined;

    for (const decl of defaultExport.getDeclarations()) {
      const exportAssign = decl.asKind(SyntaxKind.ExportAssignment);
      if (!exportAssign) continue;

      const objLiteral = this.resolveToObjectLiteral(
        exportAssign.getExpression()
      );
      if (objLiteral) return objLiteral;
    }

    return undefined;
  }

  /**
   * Extract all meta properties from object literal and return complete MetaConfig
   */
  private extractMetaFromObject(
    objLiteral: ObjectLiteralExpression
  ): MetaConfig {
    const result: MetaConfig = { defaultArgs: {} };

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

    // Extract component name
    const componentProp = objLiteral
      .getProperty('component')
      ?.asKind(SyntaxKind.PropertyAssignment);
    if (componentProp) {
      const componentInit = componentProp.getInitializer();
      if (componentInit) {
        result.componentName = componentInit.getText();
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
   *
   * Returns null for stories that should be filtered out:
   * - Interaction-only stories (play function with disableSnapshot)
   * - Showcase/grid stories (AllVariants, Overview, etc.)
   *
   * @returns ExtractedStory with only essential fields, or null if filtered
   */
  private parseStory(
    name: string,
    storyObj: ObjectLiteralExpression,
    meta: MetaConfig
  ): ExtractedStory | null {
    if (this.isShowcase(name)) return null;

    const storyData = this.extractStoryData(storyObj);

    if (this.isInteractionOnly(storyObj, storyData)) return null;

    return this.buildStoryResult(name, storyData, meta);
  }

  /**
   * Extract raw story data from story object
   */
  private extractStoryData(storyObj: ObjectLiteralExpression): StoryData {
    const args = this.extractStoryArgs(storyObj);
    const { hasRender, renderCode } = this.extractRenderFunction(storyObj);
    const hasPlay = this.hasPlayFunction(storyObj);

    return {
      args,
      hasRender,
      renderCode,
      hasPlay,
    };
  }

  /**
   * Build the final ExtractedStory result from story data
   */
  private buildStoryResult(
    name: string,
    storyData: StoryData,
    meta: MetaConfig
  ): ExtractedStory {
    const { args, hasRender, renderCode } = storyData;
    const componentName = meta.componentName ?? 'Component';

    const complexity = this.classifyStory(storyData, name);
    const title = this.generateTitle(name);
    const code = hasRender
      ? (renderCode ?? `<${componentName} />`)
      : this.generateCodeFromArgs(componentName, args, meta.defaultArgs);

    return {
      title,
      code,
      complexity,
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
    storyData: StoryData
  ): boolean {
    // Check chromatic.disableSnapshot
    if (this.hasChromaticDisableSnapshot(storyObj)) {
      return true;
    }

    const { hasPlay, args, hasRender } = storyData;

    // Story with play but no meaningful args or render is likely interaction-only
    if (!hasPlay || Object.keys(args).length > 1) {
      return false;
    }

    // Only children arg is not meaningful enough
    const onlyChildren = Object.keys(args).length === 1 && 'children' in args;
    if (!onlyChildren && Object.keys(args).length !== 0) {
      return false;
    }

    // Simple story with play - might still be visual
    if (!hasRender) {
      return false;
    }

    return false;
  }

  /**
   * Get a nested object property from an ObjectLiteralExpression
   *
   * @param obj - The root object literal
   * @param propertyPath - Dot-separated path (e.g., "chromatic.disableSnapshot")
   * @returns The property assignment at the path, or undefined if not found
   */
  private getNestedProperty(
    obj: ObjectLiteralExpression,
    propertyPath: string
  ): ObjectLiteralElementLike | undefined {
    const parts = propertyPath.split('.');
    let current: ObjectLiteralExpression | undefined = obj;

    for (let i = 0; i < parts.length; i++) {
      if (!current) return undefined;

      const propName = parts[i];
      const prop: ObjectLiteralElementLike | undefined =
        current.getProperty(propName);
      if (!prop) return undefined;

      // Last part - return the property itself
      if (i === parts.length - 1) {
        return prop;
      }

      // Not the last part - drill into the object
      const assignment: PropertyAssignment | undefined = prop.asKind(
        SyntaxKind.PropertyAssignment
      );
      if (!assignment) return undefined;

      current = assignment
        .getInitializer()
        ?.asKind(SyntaxKind.ObjectLiteralExpression);
    }

    return undefined;
  }

  /**
   * Check if story has chromatic.disableSnapshot set to true
   */
  private hasChromaticDisableSnapshot(
    storyObj: ObjectLiteralExpression
  ): boolean {
    const paramsObj = this.getObjectPropertyValue(storyObj, 'parameters');
    if (!paramsObj) return false;

    const disableSnapshotProp = this.getNestedProperty(
      paramsObj,
      'chromatic.disableSnapshot'
    );
    if (!disableSnapshotProp) return false;

    const assignment = disableSnapshotProp.asKind(
      SyntaxKind.PropertyAssignment
    );
    if (!assignment) return false;

    const value = assignment.getInitializer();
    return value?.getKind() === SyntaxKind.TrueKeyword;
  }

  /**
   * Get the ObjectLiteralExpression value of a property
   */
  private getObjectPropertyValue(
    obj: ObjectLiteralExpression,
    propertyName: string
  ): ObjectLiteralExpression | undefined {
    const prop = obj
      .getProperty(propertyName)
      ?.asKind(SyntaxKind.PropertyAssignment);
    if (!prop) return undefined;

    return prop.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
  }

  /**
   * Check if story name indicates a showcase/grid story
   */
  private isShowcase(name: string): boolean {
    return SHOWCASE_PATTERNS.some((pattern) => pattern.test(name));
  }

  /**
   * Patterns indicating advanced complexity in render code
   */
  private static readonly ADVANCED_RENDER_PATTERNS = [
    /\buseState\b/, // State hooks
    /\buseReducer\b/, // Reducer hooks
    /\buseRef\b/, // Refs (often for complex interactions)
    /\buseEffect\b/, // Side effects
    /\buseCallback\b/, // Memoized callbacks
    /\buseMemo\b/, // Memoized values
    /\bsetTimeout\b/, // Async patterns
    /\bsetInterval\b/, // Timer patterns
    /\bPromise\b/, // Async patterns
    /\bawait\b/, // Async patterns
  ];

  /**
   * Classify story complexity
   *
   * Classification rules:
   * 1. Name matches Default/Basic/Simple → 'minimal'
   * 2. Has render with advanced patterns (hooks, async) → 'advanced'
   * 3. Everything else → 'common'
   */
  private classifyStory(storyData: StoryData, name: string): StoryComplexity {
    // Minimal: Default, Basic, Simple
    if (MINIMAL_STORY_PATTERNS.some((pattern) => pattern.test(name))) {
      return 'minimal';
    }

    const { hasRender, renderCode } = storyData;

    // If has render, check if it uses advanced patterns
    if (hasRender && renderCode) {
      const isAdvanced = StorybookExtractor.ADVANCED_RENDER_PATTERNS.some(
        (pattern) => pattern.test(renderCode)
      );
      return isAdvanced ? 'advanced' : 'common';
    }

    // Common: Everything else (variant, size, state stories, simple renders)
    return 'common';
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
