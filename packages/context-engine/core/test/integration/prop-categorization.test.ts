/**
 * Prop Categorization Integration Tests
 *
 * Tests the categorizeProps function using INPUT -> OUTPUT philosophy.
 * Focus: Given realistic props and CVA variants, expect correct categorization.
 *
 * These tests replace the 78 unit tests that tested internal predicates.
 * The internal functions (isEventProp, isSlotProp, etc.) are implementation
 * details - what matters is that categorizeProps produces correct output.
 */

import { describe, expect, it } from 'vitest';

import type {
  ExtractedProp,
  PropTypeCategory,
} from '../../src/types/extracted.js';
import { categorizeProps } from '../../src/utils/prop-categorization.js';

// ============================================================================
// Test Fixtures - Realistic Component Props
// ============================================================================

/**
 * Helper to create ExtractedProp with minimal boilerplate
 */
function createProp(
  name: string,
  type: string,
  typeCategory: PropTypeCategory,
  overrides: Partial<ExtractedProp> = {}
): ExtractedProp {
  return {
    name,
    type,
    typeCategory,
    required: false,
    isChildren: false,
    isClassName: false,
    isStyle: false,
    deprecated: false,
    ...overrides,
  };
}

/**
 * Realistic Button component props (from shadcn fixture)
 * - CVA variants: variant, size
 * - Behaviors: disabled, loading, asChild
 * - Events: onClick
 * - Slots: children
 * - Passthrough: className
 */
const BUTTON_PROPS: ExtractedProp[] = [
  createProp(
    'variant',
    "'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'",
    'literal',
    {
      possibleValues: [
        'primary',
        'secondary',
        'destructive',
        'outline',
        'ghost',
        'link',
      ],
      defaultValue: 'primary',
    }
  ),
  createProp('size', "'default' | 'sm' | 'lg' | 'icon'", 'literal', {
    possibleValues: ['default', 'sm', 'lg', 'icon'],
    defaultValue: 'default',
  }),
  createProp('disabled', 'boolean', 'primitive'),
  createProp('loading', 'boolean', 'primitive'),
  createProp('asChild', 'boolean', 'primitive', {
    defaultValue: false,
    description: 'When true, renders as child element using Radix Slot',
  }),
  createProp('onClick', '(event: MouseEvent) => void', 'function'),
  createProp('children', 'ReactNode', 'element', { isChildren: true }),
  createProp('className', 'string', 'primitive', { isClassName: true }),
];

const BUTTON_CVA_VARIANTS = {
  variant: ['primary', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
  size: ['default', 'sm', 'lg', 'icon'],
};

/**
 * Select component props - more complex with multiple events
 * - CVA variants: none (uses Radix styles)
 * - Behaviors: disabled, required, open
 * - Events: onChange, onOpenChange, onValueChange
 * - Slots: children, placeholder, value
 * - Passthrough: className, aria-label, data-testid
 */
const SELECT_PROPS: ExtractedProp[] = [
  createProp('disabled', 'boolean', 'primitive'),
  createProp('required', 'boolean', 'primitive'),
  createProp('open', 'boolean', 'primitive'),
  createProp('onOpenChange', '(open: boolean) => void', 'function'),
  createProp('onValueChange', '(value: string) => void', 'function'),
  createProp('children', 'ReactNode', 'element', { isChildren: true }),
  createProp('placeholder', 'ReactNode', 'element'),
  createProp('className', 'string', 'primitive', { isClassName: true }),
  createProp('aria-label', 'string', 'primitive'),
  createProp('data-testid', 'string', 'primitive'),
];

/**
 * Input component props - form control with validation
 * - CVA variants: size
 * - Behaviors: disabled, readOnly, required, isInvalid, hasError
 * - Events: onChange, onBlur, onFocus
 * - Slots: leftIcon, rightIcon
 * - Passthrough: className, id, ref, aria-describedby
 */
const INPUT_PROPS: ExtractedProp[] = [
  createProp('size', "'sm' | 'md' | 'lg'", 'literal', {
    possibleValues: ['sm', 'md', 'lg'],
    defaultValue: 'md',
  }),
  createProp('disabled', 'boolean', 'primitive'),
  createProp('readOnly', 'boolean', 'primitive'),
  createProp('required', 'boolean', 'primitive'),
  createProp('isInvalid', 'boolean', 'primitive'),
  createProp('hasError', 'boolean', 'primitive'),
  createProp('onChange', '(event: ChangeEvent) => void', 'function'),
  createProp('onBlur', '() => void', 'function'),
  createProp('onFocus', '() => void', 'function'),
  createProp('leftIcon', 'ReactNode', 'element'),
  createProp('rightIcon', 'ReactNode', 'element'),
  createProp('className', 'string', 'primitive', { isClassName: true }),
  createProp('id', 'string', 'primitive'),
  createProp('ref', 'Ref<HTMLInputElement>', 'ref'),
  createProp('aria-describedby', 'string', 'primitive'),
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
      expect(result.variants.map((p) => p.name).sort()).toEqual([
        'size',
        'variant',
      ]);

      // Behaviors: disabled, loading (asChild is boolean but not a behavior pattern)
      expect(result.behaviors).toHaveLength(2);
      expect(result.behaviors.map((p) => p.name).sort()).toEqual([
        'disabled',
        'loading',
      ]);

      // Events: onClick
      expect(result.events).toHaveLength(1);
      expect(result.events[0].name).toBe('onClick');

      // Slots: children
      expect(result.slots).toHaveLength(1);
      expect(result.slots[0].name).toBe('children');

      // Passthrough: className
      expect(result.passthrough).toHaveLength(1);
      expect(result.passthrough[0].name).toBe('className');

      // Other: asChild (boolean but doesn't match behavior patterns)
      expect(result.other).toHaveLength(1);
      expect(result.other[0].name).toBe('asChild');
    });

    it('preserves prop definitions with correct fields', () => {
      const result = categorizeProps(BUTTON_PROPS, BUTTON_CVA_VARIANTS);

      // Find variant prop and check it has correct structure
      const variantProp = result.variants.find((p) => p.name === 'variant');
      expect(variantProp).toBeDefined();
      expect(variantProp?.possibleValues).toEqual([
        'primary',
        'secondary',
        'destructive',
        'outline',
        'ghost',
        'link',
      ]);
      expect(variantProp?.defaultValue).toBe('primary');
      expect(variantProp?.typeCategory).toBe('literal');
    });
  });

  describe('realistic Select component (no CVA)', () => {
    it('categorizes props without CVA variants', () => {
      const result = categorizeProps(SELECT_PROPS, {});

      // Events: onOpenChange, onValueChange
      expect(result.events).toHaveLength(2);
      expect(result.events.map((p) => p.name).sort()).toEqual([
        'onOpenChange',
        'onValueChange',
      ]);

      // Behaviors: disabled, required, open
      expect(result.behaviors).toHaveLength(3);
      expect(result.behaviors.map((p) => p.name).sort()).toEqual([
        'disabled',
        'open',
        'required',
      ]);

      // Slots: children, placeholder (both are element type)
      expect(result.slots).toHaveLength(2);
      expect(result.slots.map((p) => p.name).sort()).toEqual([
        'children',
        'placeholder',
      ]);

      // Passthrough: className, aria-label, data-testid
      expect(result.passthrough).toHaveLength(3);
      expect(result.passthrough.map((p) => p.name).sort()).toEqual([
        'aria-label',
        'className',
        'data-testid',
      ]);

      // No variants without CVA (unless literal with multiple values)
      expect(result.variants).toHaveLength(0);
    });
  });

  describe('realistic Input component (form control)', () => {
    it('categorizes form control props correctly', () => {
      const result = categorizeProps(INPUT_PROPS, INPUT_CVA_VARIANTS);

      // Variants: size (from CVA)
      expect(result.variants).toHaveLength(1);
      expect(result.variants[0].name).toBe('size');

      // Behaviors: disabled, readOnly, required, isInvalid, hasError
      expect(result.behaviors).toHaveLength(5);
      expect(result.behaviors.map((p) => p.name).sort()).toEqual([
        'disabled',
        'hasError',
        'isInvalid',
        'readOnly',
        'required',
      ]);

      // Events: onChange, onBlur, onFocus
      expect(result.events).toHaveLength(3);
      expect(result.events.map((p) => p.name).sort()).toEqual([
        'onBlur',
        'onChange',
        'onFocus',
      ]);

      // Slots: leftIcon, rightIcon
      expect(result.slots).toHaveLength(2);
      expect(result.slots.map((p) => p.name).sort()).toEqual([
        'leftIcon',
        'rightIcon',
      ]);

      // Passthrough: className, id, ref, aria-describedby
      expect(result.passthrough).toHaveLength(4);
      expect(result.passthrough.map((p) => p.name).sort()).toEqual([
        'aria-describedby',
        'className',
        'id',
        'ref',
      ]);
    });
  });

  describe('edge cases', () => {
    it('handles empty props array', () => {
      const result = categorizeProps([], {});

      expect(result.variants).toHaveLength(0);
      expect(result.behaviors).toHaveLength(0);
      expect(result.events).toHaveLength(0);
      expect(result.slots).toHaveLength(0);
      expect(result.passthrough).toHaveLength(0);
      expect(result.other).toHaveLength(0);
    });

    it('handles only event props', () => {
      const props: ExtractedProp[] = [
        createProp('onClick', '() => void', 'function'),
        createProp('onChange', '(e: Event) => void', 'function'),
        createProp('onSubmit', '() => void', 'function'),
      ];

      const result = categorizeProps(props, {});

      expect(result.events).toHaveLength(3);
      expect(result.variants).toHaveLength(0);
      expect(result.behaviors).toHaveLength(0);
      expect(result.slots).toHaveLength(0);
      expect(result.passthrough).toHaveLength(0);
      expect(result.other).toHaveLength(0);
    });

    it('places unknown/uncategorizable props in other', () => {
      const props: ExtractedProp[] = [
        createProp('customConfig', 'CustomType', 'unknown'),
        createProp('options', 'Record<string, unknown>', 'object'),
        createProp('someArray', 'string[]', 'array'),
      ];

      const result = categorizeProps(props, {});

      // All should end up in "other" since they don't match known patterns
      expect(result.other).toHaveLength(3);
    });

    it('each prop appears in exactly one category', () => {
      // Use a unique set of props (deduplicate by name)
      const mixedProps: ExtractedProp[] = [
        createProp('variant', "'a' | 'b'", 'literal', {
          possibleValues: ['a', 'b'],
        }),
        createProp('disabled', 'boolean', 'primitive'),
        createProp('onClick', '() => void', 'function'),
        createProp('children', 'ReactNode', 'element', { isChildren: true }),
        createProp('className', 'string', 'primitive', { isClassName: true }),
        createProp('customProp', 'SomeType', 'unknown'),
      ];
      const cvaVariants = { variant: ['a', 'b'] };

      const result = categorizeProps(mixedProps, cvaVariants);

      const total =
        result.variants.length +
        result.behaviors.length +
        result.events.length +
        result.slots.length +
        result.passthrough.length +
        result.other.length;

      // Total categorized should equal input count
      expect(total).toBe(mixedProps.length);

      // Each category contains unique props (no prop appears twice)
      const allNames = [
        ...result.variants.map((p) => p.name),
        ...result.behaviors.map((p) => p.name),
        ...result.events.map((p) => p.name),
        ...result.slots.map((p) => p.name),
        ...result.passthrough.map((p) => p.name),
        ...result.other.map((p) => p.name),
      ];
      const uniqueNames = new Set(allNames);
      expect(uniqueNames.size).toBe(allNames.length);
    });

    it('CVA variants take precedence over literal union detection', () => {
      // A prop that is a literal union but NOT in CVA
      const props: ExtractedProp[] = [
        createProp('theme', "'light' | 'dark'", 'literal', {
          possibleValues: ['light', 'dark'],
        }),
        createProp('variant', "'a' | 'b'", 'literal', {
          possibleValues: ['a', 'b'],
        }),
      ];

      // Only 'variant' is in CVA
      const cvaVariants = { variant: ['a', 'b'] };

      const result = categorizeProps(props, cvaVariants);

      // Both should be variants (CVA match AND literal union)
      expect(result.variants).toHaveLength(2);
      expect(result.variants.map((p) => p.name).sort()).toEqual([
        'theme',
        'variant',
      ]);
    });

    it('transforms ExtractedProp to PropDefinition correctly', () => {
      const props: ExtractedProp[] = [
        createProp('value', 'string', 'primitive'),
        createProp('onClick', '() => void', 'function'),
        createProp('children', 'ReactNode', 'element', { isChildren: true }),
        createProp('oldProp', 'string', 'primitive', { deprecated: true }),
      ];

      const result = categorizeProps(props, {});

      // Check onClick has isEventHandler set
      expect(result.events[0].isEventHandler).toBe(true);

      // Check children has acceptsChildren set
      expect(result.slots[0].acceptsChildren).toBe(true);

      // Check value has isControlled set (it's a controlled prop pattern)
      const valueProp = result.other.find((p) => p.name === 'value');
      expect(valueProp?.isControlled).toBe(true);

      // Check oldProp has isDeprecated set
      const oldProp = result.other.find((p) => p.name === 'oldProp');
      expect(oldProp?.isDeprecated).toBe(true);
    });
  });
});
