/**
 * Prop Categorization Utility
 *
 * Categorizes extracted props by semantic purpose for AI consumption.
 * This is a presentation concern, not extraction - keeps extractor fast and pure.
 */

import type { ExtractedProp } from '../types/extracted.js';
import type { CategorizedProps, PropDefinition } from '../types/props.js';

// ============================================================================
// Pattern Constants
// ============================================================================

/**
 * Patterns for detecting slot props (props that accept React elements)
 */
const SLOT_PATTERNS: (string | RegExp)[] = [
  'children',
  /Icon$/,
  /Slot$/,
  'prefix',
  'suffix',
  'left',
  'right',
  'leading',
  'trailing',
];

/**
 * Patterns for detecting behavior props (boolean state props)
 */
const BEHAVIOR_PATTERNS: (string | RegExp)[] = [
  'disabled',
  'loading',
  'required',
  'readOnly',
  'open',
  'checked',
  'selected',
  'expanded',
  'pressed',
  /^is[A-Z]/,
  /^has[A-Z]/,
];

/**
 * Known passthrough prop names (forwarded to DOM)
 */
const PASSTHROUGH_NAMES = new Set([
  'className',
  'style',
  'id',
  'ref',
  'key',
  'tabIndex',
  'role',
  'title',
  'lang',
  'dir',
]);

// ============================================================================
// Transformation
// ============================================================================

/**
 * Transform ExtractedProp to PropDefinition format.
 *
 * This maps the raw extraction format to the AI-friendly format with
 * consistent `is*` prefix for boolean flags.
 */
export function toDefinition(prop: ExtractedProp): PropDefinition {
  return {
    name: prop.name,
    type: prop.type,
    typeCategory: prop.typeCategory,
    required: prop.required,
    defaultValue: prop.defaultValue,
    possibleValues: prop.possibleValues,
    description: prop.description,
    isControlled: detectControlled(prop),
    acceptsChildren: prop.isChildren,
    isEventHandler:
      prop.name.startsWith('on') && prop.typeCategory === 'function',
    isDeprecated: prop.deprecated,
  };
}

/**
 * Detect if a prop is controlled (has corresponding onChange pattern)
 */
function detectControlled(prop: ExtractedProp): boolean {
  // Common controlled prop names
  return (
    prop.name === 'value' || prop.name === 'checked' || prop.name === 'selected'
  );
}

// ============================================================================
// Predicate Functions
// ============================================================================

/**
 * Check if prop is an event handler
 * Highest precedence - on* functions are always events
 */
export function isEventProp(p: PropDefinition): boolean {
  return p.name.startsWith('on') && p.typeCategory === 'function';
}

/**
 * Check if prop is a slot (accepts React elements)
 * Second highest precedence
 */
export function isSlotProp(p: PropDefinition): boolean {
  if (p.acceptsChildren) return true;
  if (p.typeCategory === 'element') return true;
  return matchesPattern(p.name, SLOT_PATTERNS);
}

/**
 * Check if prop is a variant (CVA variant or literal union)
 */
export function isVariantProp(
  p: PropDefinition,
  variantNames: Set<string>
): boolean {
  // Direct CVA variant match
  if (variantNames.has(p.name)) return true;

  // Literal type with multiple possible values
  return p.typeCategory === 'literal' && (p.possibleValues?.length ?? 0) > 1;
}

/**
 * Check if prop is a behavior prop (boolean state control)
 */
export function isBehaviorProp(p: PropDefinition): boolean {
  if (p.typeCategory !== 'primitive') return false;
  if (p.type !== 'boolean') return false;
  return matchesPattern(p.name, BEHAVIOR_PATTERNS);
}

/**
 * Check if prop is a passthrough prop (forwarded to DOM)
 */
export function isPassthroughProp(p: PropDefinition): boolean {
  // Check explicit flags from extraction
  if (p.name === 'className' || p.name === 'style') return true;

  // Known passthrough names
  if (PASSTHROUGH_NAMES.has(p.name)) return true;

  // aria-* and data-* attributes
  return p.name.startsWith('aria-') || p.name.startsWith('data-');
}

// ============================================================================
// Main Categorization Function
// ============================================================================

/**
 * Categorize extracted props by semantic purpose.
 *
 * Categories follow a strict precedence order to ensure props
 * are placed in exactly one category:
 *
 * 1. events (highest) - on* functions
 * 2. slots - ReactNode/element types
 * 3. variants - CVA variant matches or literal unions
 * 4. behaviors - Boolean state props
 * 5. passthrough - DOM attributes
 * 6. other (lowest) - Fallback
 *
 * @param props - Array of extracted props from component
 * @param cvaVariants - Record of CVA variant names to their values
 * @returns Props organized into semantic categories
 *
 * @example
 * ```typescript
 * const extracted = await extractor.extract(buttonSource);
 * const categorized = categorizeProps(
 *   extracted.data.props,
 *   extracted.data.variants
 * );
 *
 * // Result:
 * // {
 * //   variants: [{ name: 'variant', ... }, { name: 'size', ... }],
 * //   behaviors: [{ name: 'disabled', ... }],
 * //   events: [{ name: 'onClick', ... }],
 * //   slots: [{ name: 'children', ... }],
 * //   passthrough: [{ name: 'className', ... }],
 * //   other: []
 * // }
 * ```
 */
export function categorizeProps(
  props: ExtractedProp[],
  cvaVariants: Record<string, string[]>
): CategorizedProps {
  const variantNames = new Set(Object.keys(cvaVariants));

  // Transform all props to definitions first
  const definitions = props.map(toDefinition);

  // Categorize using precedence order
  // Each prop goes into exactly one category based on precedence

  const events: PropDefinition[] = [];
  const slots: PropDefinition[] = [];
  const variants: PropDefinition[] = [];
  const behaviors: PropDefinition[] = [];
  const passthrough: PropDefinition[] = [];
  const other: PropDefinition[] = [];

  for (const prop of definitions) {
    // Precedence 1: Events
    if (isEventProp(prop)) {
      events.push(prop);
      continue;
    }

    // Precedence 2: Slots
    if (isSlotProp(prop)) {
      slots.push(prop);
      continue;
    }

    // Precedence 3: Variants
    if (isVariantProp(prop, variantNames)) {
      variants.push(prop);
      continue;
    }

    // Precedence 4: Behaviors
    if (isBehaviorProp(prop)) {
      behaviors.push(prop);
      continue;
    }

    // Precedence 5: Passthrough
    if (isPassthroughProp(prop)) {
      passthrough.push(prop);
      continue;
    }

    // Precedence 6: Other (fallback)
    other.push(prop);
  }

  return {
    variants,
    behaviors,
    events,
    slots,
    passthrough,
    other,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a name matches any pattern in the list
 */
function matchesPattern(name: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((pattern) =>
    typeof pattern === 'string' ? name === pattern : pattern.test(name)
  );
}

// ============================================================================
// Exports for Testing
// ============================================================================

/**
 * Export pattern constants for testing
 */
export const PATTERNS = {
  SLOT_PATTERNS,
  BEHAVIOR_PATTERNS,
  PASSTHROUGH_NAMES,
} as const;
