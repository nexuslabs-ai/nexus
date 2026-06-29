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
  'nexus-border-w': ['border-default', 'border-thick'],
  'nexus-border-w-x': ['border-x-default', 'border-x-thick'],
  'nexus-border-w-y': ['border-y-default', 'border-y-thick'],
  'nexus-border-w-t': ['border-t-default', 'border-t-thick'],
  'nexus-border-w-r': ['border-r-default', 'border-r-thick'],
  'nexus-border-w-b': ['border-b-default', 'border-b-thick'],
  'nexus-border-w-l': ['border-l-default', 'border-l-thick'],
};

export const NEXUS_CLASS_GROUPS = {
  ...ROLE_CLASS_GROUPS,
  ...BORDER_WIDTH_CLASS_GROUPS,
};

type NexusClassGroupId = keyof typeof NEXUS_CLASS_GROUPS;

const BORDER_WIDTH_CONFLICTING_CLASS_GROUPS = {
  'nexus-border-w': [
    'nexus-border-w-x',
    'nexus-border-w-y',
    'nexus-border-w-t',
    'nexus-border-w-r',
    'nexus-border-w-b',
    'nexus-border-w-l',
  ],
  'nexus-border-w-x': ['nexus-border-w-r', 'nexus-border-w-l'],
  'nexus-border-w-y': ['nexus-border-w-t', 'nexus-border-w-b'],
} satisfies Partial<Record<NexusClassGroupId, readonly NexusClassGroupId[]>>;

/** Tailwind-merge configured with `nx:` prefix and Nexus custom utility groups. */
const twMerge = extendTailwindMerge<NexusClassGroupId>({
  prefix: 'nx',
  extend: {
    classGroups: NEXUS_CLASS_GROUPS,
    conflictingClassGroups: BORDER_WIDTH_CONFLICTING_CLASS_GROUPS,
  },
});

/**
 * Combines class names using clsx and tailwind-merge
 * Supports nx: prefixed Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
