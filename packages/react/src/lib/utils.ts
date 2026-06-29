import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Tailwind-merge class groups for Nexus custom utilities. Hand-mirrors the
 * `@utility` sets emitted by `@nexus/core` (see `packages/tailwind`). The
 * parity tests in `utils.test.ts` pin these groups to the generated files so
 * a new custom utility cannot silently drop out of `cn()`'s last-wins collapse.
 *
 * Not re-exported from the package's public entry — internal coupling only.
 */
export const ROLE_CLASS_GROUPS = {
  gap: ['gap-container', 'gap-layout-section', 'gap-layout-stack'],
  p: ['p-container'],
};

const BORDER_WIDTH_CLASS_GROUPS = {
  'border-w': ['border-default', 'border-thick'],
  'border-w-x': ['border-x-default', 'border-x-thick'],
  'border-w-y': ['border-y-default', 'border-y-thick'],
  'border-w-t': ['border-t-default', 'border-t-thick'],
  'border-w-r': ['border-r-default', 'border-r-thick'],
  'border-w-b': ['border-b-default', 'border-b-thick'],
  'border-w-l': ['border-l-default', 'border-l-thick'],
};

export const NEXUS_CLASS_GROUPS = {
  ...ROLE_CLASS_GROUPS,
  ...BORDER_WIDTH_CLASS_GROUPS,
};

type NexusClassGroupId = keyof typeof NEXUS_CLASS_GROUPS;

/** Tailwind-merge configured with `nx:` prefix and Nexus custom utility groups. */
const twMerge = extendTailwindMerge<NexusClassGroupId>({
  prefix: 'nx',
  extend: {
    classGroups: NEXUS_CLASS_GROUPS,
  },
});

/**
 * Combines class names using clsx and tailwind-merge
 * Supports nx: prefixed Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
