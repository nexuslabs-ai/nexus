import { type ClassValue, clsx } from 'clsx';
import {
  type DefaultClassGroupIds,
  type DefaultThemeGroupIds,
  extendTailwindMerge,
} from 'tailwind-merge';

/**
 * Custom `@theme` scale values Nexus adds to built-in tailwind-merge
 * namespaces. Hand-mirrors the keys emitted by `@nexus_ds/core` (see
 * `packages/tailwind`) and by co-located component CSS.
 */
export const NEXUS_THEME_SCALES = {
  radius: ['base'],
  ease: ['enter', 'exit', 'move'],
  shadow: ['base', 'inner'],
  animate: ['progress-indeterminate'],
} satisfies Partial<Record<DefaultThemeGroupIds, string[]>>;

/**
 * Nexus class names tailwind-merge does not know, keyed by the class group
 * each one extends, so a conflicting pair collapses to last-wins in `cn()`.
 * Most are `@utility` definitions (`z-modal`, `typography-*`,
 * `border-{thin,default,thick}`); `outline-{thin,default,thick}` are not —
 * Tailwind generates those from the `--outline-width-*` `@theme` namespace.
 */
export const NEXUS_CLASS_GROUPS = {
  animate: ['animate-overlay-presence-exit'],
  duration: [
    'duration-0',
    'duration-faster',
    'duration-fast',
    'duration-default',
    'duration-moderate',
    'duration-slow',
    'duration-slower',
  ],
  z: ['z-overlay', 'z-sticky', 'z-modal', 'z-popover', 'z-toast', 'z-max'],
  gap: ['gap-container', 'gap-layout-section', 'gap-layout-stack'],
  p: ['p-container'],
  'border-w': [
    'border-thin',
    'border-default',
    'border-thick',
    'border-width-thin',
    'border-width-default',
    'border-width-thick',
  ],
  'border-w-x': [
    'border-x-thin',
    'border-x-default',
    'border-x-thick',
    'border-width-x-thin',
    'border-width-x-default',
    'border-width-x-thick',
  ],
  'border-w-y': [
    'border-y-thin',
    'border-y-default',
    'border-y-thick',
    'border-width-y-thin',
    'border-width-y-default',
    'border-width-y-thick',
  ],
  'border-w-t': [
    'border-t-thin',
    'border-t-default',
    'border-t-thick',
    'border-width-t-thin',
    'border-width-t-default',
    'border-width-t-thick',
  ],
  'border-w-r': [
    'border-r-thin',
    'border-r-default',
    'border-r-thick',
    'border-width-r-thin',
    'border-width-r-default',
    'border-width-r-thick',
  ],
  'border-w-b': [
    'border-b-thin',
    'border-b-default',
    'border-b-thick',
    'border-width-b-thin',
    'border-width-b-default',
    'border-width-b-thick',
  ],
  'border-w-l': [
    'border-l-thin',
    'border-l-default',
    'border-l-thick',
    'border-width-l-thin',
    'border-width-l-default',
    'border-width-l-thick',
  ],
  // `outline-{thin,default,thick}` are widths, not colours. Without this they
  // land in tailwind-merge's `outline-color` group and a field's
  // `outline-focus-default` silently drops the width beside it.
  'outline-w': ['outline-thin', 'outline-default', 'outline-thick'],
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
  typography: [
    'typography-heading-large',
    'typography-heading-medium',
    'typography-heading-small',
    'typography-heading-xsmall',
    'typography-heading-xxsmall',
    'typography-body-default',
    'typography-body-small',
    'typography-shortcut',
    'typography-label-default',
    'typography-label-small',
    'typography-label-caps',
    'typography-code-block',
    'typography-code-inline',
  ],
} satisfies Partial<Record<DefaultClassGroupIds | 'typography', string[]>>;

type NexusClassGroupId = keyof typeof NEXUS_CLASS_GROUPS;

/**
 * The atomic class groups a `typography-*` composite overwrites. Every CSS
 * property the generated composites declare must map to a group listed here.
 */
export const TYPOGRAPHY_CONFLICTS = [
  'font-family',
  'font-size',
  'font-weight',
  'leading',
  'tracking',
  'text-wrap',
] satisfies DefaultClassGroupIds[];

/** Tailwind-merge configured with `nx:` prefix and Nexus custom utility groups. */
const twMerge = extendTailwindMerge<NexusClassGroupId>({
  prefix: 'nx',
  extend: {
    theme: NEXUS_THEME_SCALES,
    classGroups: NEXUS_CLASS_GROUPS,
    conflictingClassGroups: {
      typography: TYPOGRAPHY_CONFLICTS,
    },
  },
});

/**
 * Combines class names using clsx and tailwind-merge
 * Supports nx: prefixed Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
