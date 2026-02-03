/**
 * Fallback Triggers
 *
 * Explicit logic for determining when to fallback from react-docgen-typescript
 * to ts-morph extraction. This ensures predictable, documented behavior.
 */

import type { PropsExtractionResult } from './types.js';

/**
 * Fallback trigger reasons
 */
export const FallbackReason = {
  PrimaryReturnedNull: 'primary_returned_null',
  EmptyPropsArray: 'empty_props_array',
  ForwardRefNoProps: 'forward_ref_no_props',
  HocPatternDetected: 'hoc_pattern_detected',
  StyledComponentPattern: 'styled_component_pattern',
} as const;

export type FallbackReason =
  (typeof FallbackReason)[keyof typeof FallbackReason];

/**
 * Result of fallback check
 */
export interface FallbackCheckResult {
  shouldFallback: boolean;
  reason?: FallbackReason;
}

/**
 * HOC patterns that react-docgen-typescript struggles with
 */
const HOC_PATTERNS = [
  /\bwithRouter\s*\(/,
  /\bconnect\s*\(/,
  /\bwithStyles\s*\(/,
  /\bwithTheme\s*\(/,
  /\bmemo\s*\(\s*forwardRef/,
  /\bforwardRef\s*\(\s*memo/,
];

/**
 * Styled-components patterns
 */
const STYLED_PATTERNS = [/\bstyled\s*\.\w+/, /\bstyled\s*\(/, /\bcss`/];

/**
 * Determine if we should fallback to ts-morph based on:
 * 1. Primary extractor result
 * 2. Source code patterns
 *
 * Explicit triggers ensure predictable behavior
 */
export function shouldFallback(
  result: PropsExtractionResult | null,
  sourceCode: string
): FallbackCheckResult {
  // Trigger 1: Primary extractor returned null (failed to parse)
  if (result === null) {
    return { shouldFallback: true, reason: FallbackReason.PrimaryReturnedNull };
  }

  // Trigger 2: Empty props array
  if (result.props.length === 0) {
    return { shouldFallback: true, reason: FallbackReason.EmptyPropsArray };
  }

  // Trigger 3: forwardRef detected but might have missed props
  const hasForwardRef = sourceCode.includes('forwardRef');
  const hasRefProp = result.props.some((p) => p.name === 'ref');
  if (hasForwardRef && !hasRefProp && result.props.length < 2) {
    return { shouldFallback: true, reason: FallbackReason.ForwardRefNoProps };
  }

  // Trigger 4: HOC patterns detected (react-docgen often fails with these)
  // Only fallback if props seem incomplete
  const hasHocPattern = HOC_PATTERNS.some((pattern) =>
    pattern.test(sourceCode)
  );
  if (hasHocPattern && result.props.length < 3) {
    return { shouldFallback: true, reason: FallbackReason.HocPatternDetected };
  }

  // Trigger 5: Styled-components pattern (check if props might be incomplete)
  const hasStyledPattern = STYLED_PATTERNS.some((pattern) =>
    pattern.test(sourceCode)
  );
  if (hasStyledPattern && result.props.length < 2) {
    return {
      shouldFallback: true,
      reason: FallbackReason.StyledComponentPattern,
    };
  }

  // No fallback needed
  return { shouldFallback: false };
}

/**
 * Human-readable descriptions of fallback reasons
 */
export const FALLBACK_REASON_DESCRIPTIONS: Record<FallbackReason, string> = {
  [FallbackReason.PrimaryReturnedNull]:
    'Primary extractor (react-docgen-typescript) failed to parse the component',
  [FallbackReason.EmptyPropsArray]:
    'No props were extracted by the primary extractor',
  [FallbackReason.ForwardRefNoProps]:
    'forwardRef pattern detected but props interface could not be resolved',
  [FallbackReason.HocPatternDetected]:
    'Higher-order component wrapper detected, which may confuse the primary extractor',
  [FallbackReason.StyledComponentPattern]:
    'Styled-components pattern detected with potentially incomplete props',
};
