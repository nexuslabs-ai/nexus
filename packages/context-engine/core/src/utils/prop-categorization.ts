/**
 * Prop Categorization Utility
 *
 * Categorizes extracted props by semantic purpose for AI consumption.
 * This is a presentation concern, not extraction - keeps extractor fast and pure.
 *
 * Note: With the props cleanup, passthrough props are now rejected at extraction
 * time, so the passthrough category is no longer used. Props are already clean.
 */

import type { ExtractedProp } from '../types/extracted.js';
import type { ChildrenInfo } from '../types/manifest.js';
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

// ============================================================================
// Transformation
// ============================================================================

/**
 * Transform ExtractedProp to PropDefinition format.
 *
 * With the props cleanup, this is now a simple mapping since ExtractedProp
 * and PropDefinition have the same simplified structure:
 * - name, type, description, defaultValue, values, required
 *
 * The internal extraction flag (isChildren) is stripped out as it's only
 * used for internal categorization logic.
 */
export function toDefinition(prop: ExtractedProp): PropDefinition {
  return {
    name: prop.name,
    type: prop.type,
    description: prop.description,
    defaultValue: prop.defaultValue,
    values: prop.values,
    required: prop.required,
  };
}

// ============================================================================
// Predicate Functions
// ============================================================================

/**
 * Check if prop is an event handler
 * Highest precedence - on* functions with complex callback types
 *
 * Note: Standard HTML events (onClick, onChange, etc.) are rejected at extraction.
 * This only sees explicitly defined events like onValueChange, onOpenChange.
 */
export function isEventProp(p: PropDefinition): boolean {
  return p.name.startsWith('on') && p.name.length > 2 && p.type.includes('=>');
}

/**
 * Check if prop is a slot (accepts React elements)
 * Second highest precedence
 */
export function isSlotProp(p: PropDefinition): boolean {
  // Check type for React element types
  if (
    p.type.includes('ReactNode') ||
    p.type.includes('ReactElement') ||
    p.type.includes('JSX.Element')
  ) {
    return true;
  }
  return matchesPattern(p.name, SLOT_PATTERNS);
}

/**
 * Check if prop is a variant (CVA variant or has values array)
 */
export function isVariantProp(
  p: PropDefinition,
  variantNames: Set<string>
): boolean {
  // Direct CVA variant match
  if (variantNames.has(p.name)) return true;

  // Has values array with multiple options (string enum type)
  return p.type === 'string' && (p.values?.length ?? 0) > 1;
}

/**
 * Check if prop is a behavior prop (boolean state control)
 */
export function isBehaviorProp(p: PropDefinition): boolean {
  if (p.type !== 'boolean') return false;
  return matchesPattern(p.name, BEHAVIOR_PATTERNS);
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
 * 1. events (highest) - on* functions (explicitly coded, not standard HTML events)
 * 2. slots - ReactNode/element types
 * 3. variants - CVA variant matches or props with values array
 * 4. behaviors - Boolean state props
 * 5. other (lowest) - Fallback
 *
 * Note: Passthrough props (className, style, aria-*, data-*) are now rejected
 * at extraction time, so the passthrough category is no longer needed.
 *
 * @param props - Array of extracted props from component
 * @param cvaVariants - Record of CVA variant names to their values
 * @returns Props organized into semantic categories (empty categories are undefined)
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
 * //   variants: [{ name: 'variant', type: 'string', values: [...] }],
 * //   behaviors: [{ name: 'disabled', type: 'boolean' }],
 * //   slots: [{ name: 'children', type: 'ReactNode' }],
 * // }
 * ```
 */
export function categorizeProps(
  props: ExtractedProp[],
  cvaVariants: Record<string, string[]> = {}
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
  const other: PropDefinition[] = [];

  for (const prop of definitions) {
    // Precedence 1: Events (explicitly coded, not standard HTML events)
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

    // Precedence 5: Other (fallback)
    other.push(prop);
  }

  // Return only non-empty categories
  return {
    variants: variants.length > 0 ? variants : undefined,
    behaviors: behaviors.length > 0 ? behaviors : undefined,
    events: events.length > 0 ? events : undefined,
    slots: slots.length > 0 ? slots : undefined,
    other: other.length > 0 ? other : undefined,
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
// Children Detection
// ============================================================================

/**
 * Detect children prop information from extracted props.
 *
 * Detection patterns:
 * 1. Props include 'children' with type containing 'ReactNode'
 * 2. Props with isChildren flag set
 *
 * @param props - Array of extracted props from component
 * @returns ChildrenInfo if component accepts children, undefined otherwise
 *
 * @example
 * ```typescript
 * const childrenInfo = detectChildrenInfo(extracted.data.props);
 * // Returns: { accepts: true, type: 'ReactNode', required: false }
 * // Or: undefined if component doesn't accept children
 * ```
 */
export function detectChildrenInfo(
  props: ExtractedProp[]
): ChildrenInfo | undefined {
  const childrenProp = props.find((p) => p.name === 'children' || p.isChildren);

  if (!childrenProp) {
    return undefined;
  }

  return {
    accepts: true,
    type: extractChildrenType(childrenProp.type),
    required: childrenProp.required || undefined,
  };
}

/**
 * Extract the children type from a type string.
 *
 * Maps verbose type strings to simplified type names for AI consumption.
 *
 * @param type - The type string from prop extraction
 * @returns Simplified type name or undefined if unknown
 *
 * @example
 * extractChildrenType('ReactNode | undefined') // 'ReactNode'
 * extractChildrenType('ReactElement<ButtonProps>') // 'ReactElement'
 */
function extractChildrenType(type: string): string | undefined {
  if (type.includes('ReactNode')) return 'ReactNode';
  if (type.includes('ReactElement')) return 'ReactElement';
  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  return undefined;
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
} as const;
