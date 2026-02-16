/**
 * Case Conversion Utilities
 *
 * Provides consistent case conversion functions using lodash.
 * Centralizes all case transformations to avoid duplicate implementations.
 */

import camelCase from 'lodash/camelCase.js';
import kebabCase from 'lodash/kebabCase.js';
import upperFirst from 'lodash/upperFirst.js';

export { camelCase, kebabCase };

/**
 * Convert string to PascalCase
 *
 * @example
 * pascalCase('foo-bar') // 'FooBar'
 * pascalCase('hello_world') // 'HelloWorld'
 * pascalCase('dialog content') // 'DialogContent'
 */
export const pascalCase = (str: string): string => upperFirst(camelCase(str));

/**
 * Check if a string starts with an uppercase letter (PascalCase convention)
 *
 * Returns true if the first character is an uppercase ASCII letter (A-Z).
 * Returns false for empty strings, strings starting with numbers, symbols,
 * or lowercase letters.
 *
 * Note: lodash does not provide a built-in function for this check.
 * This function is intentionally simple and only checks the first character.
 *
 * @example
 * isPascalCase('Button') // true
 * isPascalCase('DialogTrigger') // true
 * isPascalCase('button') // false
 * isPascalCase('') // false
 * isPascalCase('123') // false
 * isPascalCase('_Button') // false
 */
export const isPascalCase = (str: string): boolean => {
  if (!str || str.length === 0) {
    return false;
  }
  const firstChar = str.charCodeAt(0);
  // Check if first character is uppercase ASCII letter (A-Z: 65-90)
  return firstChar >= 65 && firstChar <= 90;
};
