import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Tailwind-merge class groups for Nexus custom utilities. Hand-mirrors the
 * `@utility` sets emitted by `@nexus_ds/core` (see `packages/tailwind`) so a new
 * custom utility cannot silently drop out of `cn()`'s last-wins collapse.
 */
const ROLE_CLASS_GROUPS = {
  gap: ['gap-container', 'gap-layout-section', 'gap-layout-stack'],
  p: ['p-container'],
};

const BORDER_WIDTH_CLASS_GROUPS = {
  'border-w': [
    'border-default',
    'border-thick',
    'border-width-default',
    'border-width-thick',
  ],
  'border-w-x': [
    'border-x-default',
    'border-x-thick',
    'border-width-x-default',
    'border-width-x-thick',
  ],
  'border-w-y': [
    'border-y-default',
    'border-y-thick',
    'border-width-y-default',
    'border-width-y-thick',
  ],
  'border-w-t': [
    'border-t-default',
    'border-t-thick',
    'border-width-t-default',
    'border-width-t-thick',
  ],
  'border-w-r': [
    'border-r-default',
    'border-r-thick',
    'border-width-r-default',
    'border-width-r-thick',
  ],
  'border-w-b': [
    'border-b-default',
    'border-b-thick',
    'border-width-b-default',
    'border-width-b-thick',
  ],
  'border-w-l': [
    'border-l-default',
    'border-l-thick',
    'border-width-l-default',
    'border-width-l-thick',
  ],
};

const BORDER_COLOR_CLASS_GROUPS = {
  'border-color': [
    'border-border-default',
    'border-color-default',
    'border-border-default-alpha',
    'border-color-default-alpha',
    'border-border-active',
    'border-color-active',
    'border-border-disabled',
    'border-color-disabled',
    'border-border-warning',
    'border-color-warning',
    'border-border-warning-active',
    'border-color-warning-active',
    'border-border-success',
    'border-color-success',
    'border-border-success-active',
    'border-color-success-active',
    'border-border-error',
    'border-color-error',
    'border-border-error-active',
    'border-color-error-active',
    'border-border-information',
    'border-color-information',
    'border-border-information-active',
    'border-color-information-active',
    'border-border-primary',
    'border-color-primary',
    'border-border-primary-active',
    'border-color-primary-active',
  ],
};

const NEXUS_CLASS_GROUPS = {
  ...ROLE_CLASS_GROUPS,
  ...BORDER_WIDTH_CLASS_GROUPS,
  ...BORDER_COLOR_CLASS_GROUPS,
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
