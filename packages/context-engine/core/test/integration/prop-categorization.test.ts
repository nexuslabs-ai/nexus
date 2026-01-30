/**
 * Prop Categorization Integration Tests
 *
 * Tests the categorizeProps function using INPUT -> OUTPUT philosophy.
 * Focus: Given realistic props and CVA variants, expect correct categorization.
 *
 * Note: With the props cleanup, passthrough props are now rejected at extraction
 * time, so the passthrough category is no longer tested. Props are already clean.
 */

import { describe, expect, it } from 'vitest';

import type { ExtractedProp } from '../../src/types/extracted.js';
import { categorizeProps } from '../../src/utils/prop-categorization.js';

// ============================================================================
// Test Fixtures - Realistic Component Props
// ============================================================================

/**
 * Helper to create ExtractedProp with minimal boilerplate
 *
 * Simplified structure:
 * - name, type, description, defaultValue, values
 * - Internal flag: isChildren
 */
function createProp(
  name: string,
  type: string,
  overrides: Partial<ExtractedProp> = {}
): ExtractedProp {
  return {
    name,
    type,
    isChildren: false,
    ...overrides,
  };
}

/**
 * Realistic Button component props (from shadcn fixture)
 * Note: className is now rejected at extraction, not included here
 * - CVA variants: variant, size
 * - Behaviors: disabled, loading
 * - Events: onClick (custom, not standard HTML)
 * - Slots: children
 * - Other: asChild
 */
const BUTTON_PROPS: ExtractedProp[] = [
  createProp('variant', 'string', {
    values: ['primary', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    defaultValue: 'primary',
  }),
  createProp('size', 'string', {
    values: ['default', 'sm', 'lg', 'icon'],
    defaultValue: 'default',
  }),
  createProp('disabled', 'boolean'),
  createProp('loading', 'boolean'),
  createProp('asChild', 'boolean', {
    defaultValue: false,
    description: 'When true, renders as child element using Radix Slot',
  }),
  createProp('onCustomAction', '(data: CustomData) => void'),
  createProp('children', 'ReactNode', { isChildren: true }),
];

const BUTTON_CVA_VARIANTS = {
  variant: ['primary', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
  size: ['default', 'sm', 'lg', 'icon'],
};

/**
 * Select component props - more complex with multiple custom events
 * Note: Standard HTML events (onClick, onChange) are rejected at extraction
 * - CVA variants: none (uses Radix styles)
 * - Behaviors: disabled, open
 * - Events: onOpenChange, onValueChange (custom Radix events)
 * - Slots: children, placeholder
 */
const SELECT_PROPS: ExtractedProp[] = [
  createProp('disabled', 'boolean'),
  createProp('open', 'boolean'),
  createProp('onOpenChange', '(open: boolean) => void'),
  createProp('onValueChange', '(value: string) => void'),
  createProp('children', 'ReactNode', { isChildren: true }),
  createProp('placeholder', 'ReactNode'),
];

/**
 * Input component props - form control with validation
 * Note: Standard events rejected, only custom events kept
 * - CVA variants: size
 * - Behaviors: disabled, readOnly
 * - Events: onValueChange (custom)
 * - Slots: leftIcon, rightIcon
 */
const INPUT_PROPS: ExtractedProp[] = [
  createProp('size', 'string', {
    values: ['sm', 'md', 'lg'],
    defaultValue: 'md',
  }),
  createProp('disabled', 'boolean'),
  createProp('readOnly', 'boolean'),
  createProp('isInvalid', 'boolean'),
  createProp('hasError', 'boolean'),
  createProp('onValueChange', '(value: string) => void'),
  createProp('leftIcon', 'ReactNode'),
  createProp('rightIcon', 'ReactNode'),
];

const INPUT_CVA_VARIANTS = {
  size: ['sm', 'md', 'lg'],
};

// ============================================================================
// Integration Tests
// ============================================================================

describe('categorizeProps', () => {
  describe('realistic Button component', () => {
    it('categorizes all props correctly with CVA variants', () => {
      const result = categorizeProps(BUTTON_PROPS, BUTTON_CVA_VARIANTS);

      // Variants: variant, size (from CVA)
      expect(result.variants).toHaveLength(2);
      expect(result.variants?.map((p) => p.name).sort()).toEqual([
        'size',
        'variant',
      ]);

      // Behaviors: disabled, loading (asChild is boolean but not a behavior pattern)
      expect(result.behaviors).toHaveLength(2);
      expect(result.behaviors?.map((p) => p.name).sort()).toEqual([
        'disabled',
        'loading',
      ]);

      // Events: onCustomAction (custom event with => in type)
      expect(result.events).toHaveLength(1);
      expect(result.events?.[0].name).toBe('onCustomAction');

      // Slots: children
      expect(result.slots).toHaveLength(1);
      expect(result.slots?.[0].name).toBe('children');

      // Other: asChild (boolean but doesn't match behavior patterns)
      expect(result.other).toHaveLength(1);
      expect(result.other?.[0].name).toBe('asChild');
    });

    it('preserves prop definitions with correct fields', () => {
      const result = categorizeProps(BUTTON_PROPS, BUTTON_CVA_VARIANTS);

      // Find variant prop and check it has correct structure
      const variantProp = result.variants?.find((p) => p.name === 'variant');
      expect(variantProp).toBeDefined();
      expect(variantProp?.values).toEqual([
        'primary',
        'secondary',
        'destructive',
        'outline',
        'ghost',
        'link',
      ]);
      expect(variantProp?.defaultValue).toBe('primary');
      expect(variantProp?.type).toBe('string');
    });
  });

  describe('realistic Select component (no CVA)', () => {
    it('categorizes props without CVA variants', () => {
      const result = categorizeProps(SELECT_PROPS, {});

      // Events: onOpenChange, onValueChange (custom Radix events)
      expect(result.events).toHaveLength(2);
      expect(result.events?.map((p) => p.name).sort()).toEqual([
        'onOpenChange',
        'onValueChange',
      ]);

      // Behaviors: disabled, open
      expect(result.behaviors).toHaveLength(2);
      expect(result.behaviors?.map((p) => p.name).sort()).toEqual([
        'disabled',
        'open',
      ]);

      // Slots: children, placeholder (both are ReactNode type)
      expect(result.slots).toHaveLength(2);
      expect(result.slots?.map((p) => p.name).sort()).toEqual([
        'children',
        'placeholder',
      ]);

      // No variants without CVA
      expect(result.variants).toBeUndefined();
    });
  });

  describe('realistic Input component (form control)', () => {
    it('categorizes form control props correctly', () => {
      const result = categorizeProps(INPUT_PROPS, INPUT_CVA_VARIANTS);

      // Variants: size (from CVA)
      expect(result.variants).toHaveLength(1);
      expect(result.variants?.[0].name).toBe('size');

      // Behaviors: disabled, readOnly, isInvalid, hasError
      expect(result.behaviors).toHaveLength(4);
      expect(result.behaviors?.map((p) => p.name).sort()).toEqual([
        'disabled',
        'hasError',
        'isInvalid',
        'readOnly',
      ]);

      // Events: onValueChange (custom)
      expect(result.events).toHaveLength(1);
      expect(result.events?.[0].name).toBe('onValueChange');

      // Slots: leftIcon, rightIcon
      expect(result.slots).toHaveLength(2);
      expect(result.slots?.map((p) => p.name).sort()).toEqual([
        'leftIcon',
        'rightIcon',
      ]);
    });
  });

  describe('edge cases', () => {
    it('handles empty props array', () => {
      const result = categorizeProps([], {});

      // All categories should be undefined (empty categories are omitted)
      expect(result.variants).toBeUndefined();
      expect(result.behaviors).toBeUndefined();
      expect(result.events).toBeUndefined();
      expect(result.slots).toBeUndefined();
      expect(result.other).toBeUndefined();
    });

    it('handles only event props', () => {
      const props: ExtractedProp[] = [
        createProp('onCustomClick', '() => void'),
        createProp('onCustomChange', '(e: Event) => void'),
        createProp('onSubmitData', '() => void'),
      ];

      const result = categorizeProps(props, {});

      expect(result.events).toHaveLength(3);
      expect(result.variants).toBeUndefined();
      expect(result.behaviors).toBeUndefined();
      expect(result.slots).toBeUndefined();
      expect(result.other).toBeUndefined();
    });

    it('places unknown/uncategorizable props in other', () => {
      const props: ExtractedProp[] = [
        createProp('customConfig', 'CustomType'),
        createProp('options', 'Record<string, unknown>'),
        createProp('someArray', 'string[]'),
      ];

      const result = categorizeProps(props, {});

      // All should end up in "other" since they don't match known patterns
      expect(result.other).toHaveLength(3);
    });

    it('each prop appears in exactly one category', () => {
      const mixedProps: ExtractedProp[] = [
        createProp('variant', 'string', { values: ['a', 'b'] }),
        createProp('disabled', 'boolean'),
        createProp('onCustomClick', '() => void'),
        createProp('children', 'ReactNode', { isChildren: true }),
        createProp('customProp', 'SomeType'),
      ];
      const cvaVariants = { variant: ['a', 'b'] };

      const result = categorizeProps(mixedProps, cvaVariants);

      const total =
        (result.variants?.length ?? 0) +
        (result.behaviors?.length ?? 0) +
        (result.events?.length ?? 0) +
        (result.slots?.length ?? 0) +
        (result.other?.length ?? 0);

      // Total categorized should equal input count
      expect(total).toBe(mixedProps.length);

      // Each category contains unique props (no prop appears twice)
      const allNames = [
        ...(result.variants?.map((p) => p.name) ?? []),
        ...(result.behaviors?.map((p) => p.name) ?? []),
        ...(result.events?.map((p) => p.name) ?? []),
        ...(result.slots?.map((p) => p.name) ?? []),
        ...(result.other?.map((p) => p.name) ?? []),
      ];
      const uniqueNames = new Set(allNames);
      expect(uniqueNames.size).toBe(allNames.length);
    });

    it('CVA variants take precedence over literal union detection', () => {
      // A prop that has values array but NOT in CVA
      const props: ExtractedProp[] = [
        createProp('theme', 'string', { values: ['light', 'dark'] }),
        createProp('variant', 'string', { values: ['a', 'b'] }),
      ];

      // Only 'variant' is in CVA
      const cvaVariants = { variant: ['a', 'b'] };

      const result = categorizeProps(props, cvaVariants);

      // Both should be variants (CVA match AND string with values)
      expect(result.variants).toHaveLength(2);
      expect(result.variants?.map((p) => p.name).sort()).toEqual([
        'theme',
        'variant',
      ]);
    });
  });
});
