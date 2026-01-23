/**
 * Case Conversion Utilities
 *
 * Provides consistent case conversion functions using lodash.
 * Centralizes all case transformations to avoid duplicate implementations.
 */

import camelCase from 'lodash/camelCase.js';
import kebabCase from 'lodash/kebabCase.js';
import upperFirst from 'lodash/upperFirst.js';

export { kebabCase };

/**
 * Convert string to PascalCase
 *
 * @example
 * pascalCase('foo-bar') // 'FooBar'
 * pascalCase('hello_world') // 'HelloWorld'
 * pascalCase('dialog content') // 'DialogContent'
 */
export const pascalCase = (str: string): string => upperFirst(camelCase(str));
