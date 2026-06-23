import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Tailwind-merge class groups for Nexus role utilities. Hand-mirrors the
 * `@utility` set emitted from canonical-mode role tokens by `@nexus/core`
 * (see `packages/tailwind/spacing-utilities.css`). The parity test in
 * `utils.test.ts` pins this set to that file so a new role utility cannot
 * silently drop out of `cn()`'s last-wins collapse.
 *
 * Not re-exported from the package's public entry — internal coupling only.
 */
export const ROLE_CLASS_GROUPS = {
  gap: ['gap-container', 'gap-layout-section', 'gap-layout-stack'],
  p: ['p-container'],
};

/** Tailwind-merge configured with `nx:` prefix and Nexus role-utility class groups. */
const twMerge = extendTailwindMerge({
  prefix: 'nx',
  extend: {
    classGroups: ROLE_CLASS_GROUPS,
  },
});

/**
 * Combines class names using clsx and tailwind-merge
 * Supports nx: prefixed Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
