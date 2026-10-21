import type { UtilityRule } from './utilities.ts';

/** Matches a per-mode spacing file in `semantic/`, capturing the mode name. */
export const SPACING_MODE_FILE_PATTERN = /^spacing-([a-z]+)\.json$/;

/**
 * Top-level keys a `spacing-{mode}.json` may use. A key outside both lists
 * throws, so a stray group fails close to the JSON edit.
 */
const SPACING_NUMERIC_ROOTS = new Set(['spacing']);
const SPACING_ROLE_ROOTS = new Set(['container', 'layout']);

/**
 * Numeric tokens (`spacing.*`) seed Tailwind's `--spacing-*` theme namespace.
 * Role tokens (`container.*`, `layout.*`) never enter `@theme`: Tailwind's
 * `--container-*` namespace would codegen `nx:w-p` from them. They get their
 * own `@utility` instead. Throws if the path's root is in neither allowlist.
 */
export function spacingTokenKind(
  tokenPath: readonly string[]
): 'numeric' | 'role' {
  const root = tokenPath[0] ?? '';
  if (SPACING_NUMERIC_ROOTS.has(root)) return 'numeric';
  if (SPACING_ROLE_ROOTS.has(root)) return 'role';
  throw new Error(
    `spacingTokenKind: unknown top-level key "${root}" in path [${tokenPath.join('.')}] — extend SPACING_NUMERIC_ROOTS / SPACING_ROLE_ROOTS`
  );
}

export function splitSpacingTokens<T extends { path: readonly string[] }>(
  tokens: readonly T[]
): { numeric: T[]; role: T[] } {
  const halves: { numeric: T[]; role: T[] } = { numeric: [], role: [] };
  for (const token of tokens) {
    halves[spacingTokenKind(token.path)].push(token);
  }
  return halves;
}

/**
 * Utility prefix and properties for the family segment of a three-segment
 * `[role, family, size]` role path.
 */
const FAMILY_TO_UTILITY = {
  'padding-x': { prefix: 'px', properties: ['padding-left', 'padding-right'] },
  'padding-y': { prefix: 'py', properties: ['padding-top', 'padding-bottom'] },
  gap: { prefix: 'gap', properties: ['gap'] },
};

/**
 * Utility name and properties for a role path:
 *
 *   `<role>.<family>.<size>` → `<prefix>-<role>-<size>`
 *   `container.p`            → `p-container`
 *   `container.gap`          → `gap-container`
 *   `layout.section-gap`     → `gap-layout-section`
 */
function deriveRoleUtility(tokenPath: readonly string[]): {
  utilityName: string;
  properties: readonly string[];
} {
  if (tokenPath.length < 2 || tokenPath.length > 3) {
    throw new Error(
      `deriveRoleUtility: path [${tokenPath.join('.')}] has ${tokenPath.length} segment(s); only 2- or 3-segment role paths are supported`
    );
  }
  const [role, second = '', third] = tokenPath;

  if (third !== undefined) {
    const entry = FAMILY_TO_UTILITY[second as keyof typeof FAMILY_TO_UTILITY];
    if (!entry) {
      throw new Error(
        `deriveRoleUtility: unknown family "${second}" in path [${tokenPath.join('.')}] — extend FAMILY_TO_UTILITY`
      );
    }
    return {
      utilityName: `${entry.prefix}-${role}-${third}`,
      properties: entry.properties,
    };
  }

  if (second === 'gap') {
    return { utilityName: `gap-${role}`, properties: ['gap'] };
  }
  if (second === 'p') {
    return { utilityName: `p-${role}`, properties: ['padding'] };
  }
  const gapSuffixMatch = second.match(/^(.+)-gap$/);
  if (gapSuffixMatch) {
    return {
      utilityName: `gap-${role}-${gapSuffixMatch[1]}`,
      properties: ['gap'],
    };
  }

  throw new Error(
    `deriveRoleUtility: unhandled path shape [${tokenPath.join('.')}] — extend deriveRoleUtility cases`
  );
}

/**
 * The utility a spacing role token (path e.g. `['container', 'p']`) emits. It
 * reads the per-mode `--nx-<path>` variable, so a `[data-density]` swap
 * reaches it.
 */
export function spacingRoleUtility(tokenPath: readonly string[]): UtilityRule {
  const { utilityName, properties } = deriveRoleUtility(tokenPath);
  const value = `var(--nx-${tokenPath.join('-')})`;
  return {
    name: utilityName,
    declarations: properties.map((property) => ({ property, value })),
  };
}
