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
 */

import {
  type ParserOptions,
  type PropItem,
  withCompilerOptions,
} from 'react-docgen-typescript';

import ts from 'typescript';

import type { ExtractedProp, PropTypeCategory } from '../types/index.js';
import { pascalCase } from '../utils/case.js';
import { createLogger } from '../utils/logger.js';
import { getTempManager } from '../utils/temp-manager.js';

import {
  ExtractorMethod,
  type IPropsExtractor,
  type PropsExtractionResult,
} from './types.js';

const logger = createLogger({ name: 'react-docgen-extractor' });

/**
 * Props to keep from HTML attributes (filter out noise)
 */
const KEEP_HTML_PROPS = [
  'className',
  'style',
  'id',
  'children',
  'onClick',
  'onChange',
  'onSubmit',
  'onFocus',
  'onBlur',
  'disabled',
  'type',
  'name',
  'value',
  'placeholder',
  'aria-label',
  'aria-describedby',
  'role',
  'tabIndex',
];

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
      propFilter: (prop) => {
        // Filter out HTML attributes that clutter the output
        if (prop.parent?.fileName.includes('node_modules')) {
          return KEEP_HTML_PROPS.includes(prop.name);
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
    _filePath?: string
  ): Promise<PropsExtractionResult | null> {
    const tempManager = getTempManager();

    // Use hybrid temp file strategy: try-finally ensures cleanup
    return tempManager.withTempFile(
      sourceCode,
      componentName,
      async (tempFilePath) => {
        try {
          const components = this.parser.parse(tempFilePath);

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
    );
  }

  /**
   * Convert react-docgen-typescript props to our ExtractedProp format
   */
  private convertProps(docgenProps: Record<string, PropItem>): ExtractedProp[] {
    return Object.entries(docgenProps).map(([name, prop]) => {
      const typeCategory = this.categorizeType(prop.type?.name || 'unknown');
      const tags = prop.tags as Record<string, unknown> | undefined;
      const deprecatedTag = tags?.deprecated;

      return {
        name,
        type: prop.type?.name || 'unknown',
        typeCategory,
        required: prop.required ?? false,
        defaultValue: prop.defaultValue?.value,
        description: prop.description || undefined,
        possibleValues: this.extractPossibleValues(prop.type),
        isChildren: name === 'children',
        isClassName: name === 'className',
        isStyle: name === 'style',
        deprecated: deprecatedTag !== undefined,
        deprecationMessage:
          typeof deprecatedTag === 'string' ? deprecatedTag : undefined,
      };
    });
  }

  /**
   * Categorize TypeScript type string into our simplified categories
   */
  private categorizeType(typeString: string): PropTypeCategory {
    const normalized = typeString.toLowerCase();

    if (['string', 'number', 'boolean'].includes(normalized)) {
      return 'primitive';
    }
    if (typeString.includes('|') && !typeString.includes('=>')) {
      // Check if it's a literal union (e.g., "'primary' | 'secondary'")
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
      typeString.includes('ReactElement') ||
      typeString.includes('JSX.Element')
    ) {
      return 'element';
    }

    return 'unknown';
  }

  /**
   * Extract possible values from union/enum types
   */
  private extractPossibleValues(type: PropItem['type']): string[] | undefined {
    if (!type?.value) return undefined;

    // Handle union types with literal values
    if (Array.isArray(type.value)) {
      const values = type.value
        .map(
          (v: { value?: string; name?: string }) =>
            v.value?.replace(/['"]/g, '') || v.name
        )
        .filter(Boolean) as string[];

      return values.length > 0 ? values : undefined;
    }

    return undefined;
  }
}
