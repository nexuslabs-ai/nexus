/**
 * React Docgen Extractor (Primary)
 *
 * Primary props extractor using react-docgen-typescript.
 *
 * Why this is the primary extractor:
 * 1. Full TypeScript type resolution (handles imported types)
 * 2. Automatic JSDoc extraction
 * 3. Default value detection
 * 4. Battle-tested in Storybook ecosystem (88k+ GitHub stars)
 * 5. Handles React.ComponentProps, HTMLAttributes, etc.
 *
 * Filtering strategy (fix at source):
 * - REJECT standard HTML events (onClick, onChange, etc.) - AI knows these
 * - REJECT passthrough props (className, style, id, aria-*, data-*) - every component has these
 * - REJECT node_modules props except children - AI doesn't need inherited HTML attrs
 * - KEEP only explicitly defined component props
 */

import {
  type ParserOptions,
  type PropItem,
  withCompilerOptions,
} from 'react-docgen-typescript';

import { existsSync } from 'node:fs';
import ts from 'typescript';

import type { ExtractedProp } from '../types/index.js';
import { pascalCase } from '../utils/case.js';
import { createLogger } from '../utils/logger.js';
import { getTempManager } from '../utils/temp-manager.js';
import { extractEnumValues, simplifyType } from '../utils/type-utils.js';

import {
  ExtractorMethod,
  type IPropsExtractor,
  type PropsExtractionResult,
} from './types.js';

const logger = createLogger({ name: 'react-docgen-extractor' });

/**
 * Standard HTML events to REJECT (AI knows these exist on all elements)
 */
const STANDARD_HTML_EVENTS = new Set([
  // Mouse events
  'onClick',
  'onDoubleClick',
  'onMouseDown',
  'onMouseUp',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseOver',
  'onMouseOut',
  'onContextMenu',
  // Keyboard events
  'onKeyDown',
  'onKeyUp',
  'onKeyPress',
  // Focus events
  'onFocus',
  'onBlur',
  // Form events
  'onChange',
  'onInput',
  'onSubmit',
  'onReset',
  'onInvalid',
  // Drag events
  'onDrag',
  'onDragEnd',
  'onDragEnter',
  'onDragLeave',
  'onDragOver',
  'onDragStart',
  'onDrop',
  // Scroll/wheel events
  'onScroll',
  'onWheel',
  // Clipboard events
  'onCopy',
  'onCut',
  'onPaste',
  // Media events
  'onLoad',
  'onError',
  // Touch events
  'onTouchStart',
  'onTouchMove',
  'onTouchEnd',
  'onTouchCancel',
  // Pointer events
  'onPointerDown',
  'onPointerUp',
  'onPointerMove',
  'onPointerEnter',
  'onPointerLeave',
  'onPointerOver',
  'onPointerOut',
  'onPointerCancel',
  // Animation events
  'onAnimationStart',
  'onAnimationEnd',
  'onAnimationIteration',
  'onTransitionEnd',
]);

/**
 * Passthrough props to REJECT (every component has these)
 */
const PASSTHROUGH_PROPS = new Set([
  'className',
  'style',
  'id',
  'ref',
  'key',
  'slot',
  'tabIndex',
  'role',
  'title',
  'lang',
  'dir',
  'hidden',
  'draggable',
  'spellCheck',
  'translate',
  'contentEditable',
  'inputMode',
  'enterKeyHint',
  'autoFocus',
  'form',
  'formAction',
  'formEncType',
  'formMethod',
  'formNoValidate',
  'formTarget',
]);

/**
 * Check if prop name is a passthrough prop (including aria-* and data-*)
 */
function isPassthroughProp(name: string): boolean {
  return (
    PASSTHROUGH_PROPS.has(name) ||
    name.startsWith('aria-') ||
    name.startsWith('data-')
  );
}

/**
 * Primary props extractor using react-docgen-typescript
 */
export class ReactDocgenExtractor implements IPropsExtractor {
  private parser: ReturnType<typeof withCompilerOptions>;

  constructor() {
    const parserOptions: ParserOptions = {
      savePropValueAsString: true,
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Sort union type values alphabetically for consistent output
      // (e.g., "default" | "destructive" | "ghost" instead of random order)
      shouldSortUnions: true,
      propFilter: (prop) => {
        const propName = prop.name;

        // ALWAYS keep 'children' - important for component composition
        if (propName === 'children') {
          return true;
        }

        // REJECT standard HTML events (AI knows these exist on all elements)
        if (STANDARD_HTML_EVENTS.has(propName)) {
          return false;
        }

        // REJECT passthrough props (every component has these)
        if (isPassthroughProp(propName)) {
          return false;
        }

        // REJECT ALL node_modules props (including Radix events)
        // Only keep props explicitly defined in the component's own code
        if (prop.parent?.fileName.includes('node_modules')) {
          return false;
        }

        return true;
      },
    };

    this.parser = withCompilerOptions(
      {
        esModuleInterop: true,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        strict: true,
      },
      parserOptions
    );
  }

  async extractProps(
    sourceCode: string,
    componentName: string,
    filePath?: string
  ): Promise<PropsExtractionResult | null> {
    // If a real file path is provided, use it directly for better type resolution.
    // This allows react-docgen-typescript to resolve node_modules imports and
    // expand types like React.ComponentProps<'button'> to include inherited props.
    if (filePath && this.fileExists(filePath)) {
      return this.parseFile(filePath, componentName);
    }

    // Fall back to temp file when source code is provided without a valid file path
    const tempManager = getTempManager();
    return tempManager.withTempFile(
      sourceCode,
      componentName,
      async (tempFilePath) => this.parseFile(tempFilePath, componentName)
    );
  }

  /**
   * Check if a file exists on disk
   */
  private fileExists(filePath: string): boolean {
    try {
      return existsSync(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Parse a file and extract component props
   */
  private parseFile(
    filePath: string,
    componentName: string
  ): PropsExtractionResult | null {
    try {
      const components = this.parser.parse(filePath);

      if (components.length === 0) {
        logger.debug('No components found by react-docgen-typescript', {
          componentName,
        });
        return null;
      }

      // Find the component matching our name (case-insensitive)
      const pascalName = pascalCase(componentName);
      const component =
        components.find(
          (c) =>
            c.displayName.toLowerCase() === pascalName.toLowerCase() ||
            c.displayName.toLowerCase() === componentName.toLowerCase()
        ) || components[0];

      const props = this.convertProps(component.props);

      if (props.length === 0) {
        logger.debug('No props extracted by react-docgen-typescript', {
          componentName,
        });
        return null;
      }

      return {
        props,
        method: ExtractorMethod.ReactDocgen,
        componentName: component.displayName,
        description: component.description || undefined,
      };
    } catch (error) {
      logger.debug('react-docgen-typescript extraction failed', {
        componentName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Convert react-docgen-typescript props to our ExtractedProp format
   *
   * Value extraction strategy:
   * 1. Primary: Use structured type.value from react-docgen when available
   *    (enabled by shouldExtractLiteralValuesFromEnum option)
   * 2. Fallback: Parse raw type string for edge cases where structured
   *    data isn't produced (mixed unions, complex types, ts-morph path)
   *
   * Uses simplified structure:
   * - type: simplified type string ("string", "boolean", not full union)
   * - values: array of valid options for enum types
   * - required: whether the prop is required (from TypeScript)
   */
  private convertProps(docgenProps: Record<string, PropItem>): ExtractedProp[] {
    return Object.entries(docgenProps).map(([name, prop]) => {
      const rawType = prop.type?.name || 'unknown';

      // Try to extract enum values first (before simplifying type)
      const enumValues =
        this.extractValuesFromDocgen(prop.type) || extractEnumValues(rawType);

      return {
        name,
        type: simplifyType(rawType),
        description: prop.description || undefined,
        defaultValue: prop.defaultValue?.value,
        values: enumValues,
        required: prop.required,
        isChildren: name === 'children',
      };
    });
  }

  /**
   * Extract values from react-docgen-typescript's type structure
   */
  private extractValuesFromDocgen(
    type: PropItem['type']
  ): string[] | undefined {
    if (!type?.value) return undefined;

    // Handle union types with literal values
    if (Array.isArray(type.value)) {
      const values = type.value
        .map(
          (v: { value?: string; name?: string }) =>
            v.value?.replace(/['"]/g, '') || v.name
        )
        .filter(
          (v): v is string => Boolean(v) && v !== 'null' && v !== 'undefined'
        );

      return values.length > 0 ? values : undefined;
    }

    return undefined;
  }
}
