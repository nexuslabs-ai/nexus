import { type ClassValue, clsx } from 'clsx';
import {
  type DefaultClassGroupIds,
  type DefaultThemeGroupIds,
  extendTailwindMerge,
} from 'tailwind-merge';

/**
 * Tailwind-merge registration for Nexus custom utilities. Hand-mirrors the
 * `@utility` sets and custom `@theme` scale keys emitted by `@nexus_ds/core`
 * (see `packages/tailwind`) and by co-located component CSS, so a new custom
 * utility cannot silently drop out of `cn()`'s last-wins collapse.
 */
const NEXUS_THEME_SCALES = {
  radius: ['base'],
  ease: ['enter', 'exit', 'move'],
  shadow: ['base', 'inner'],
  animate: ['progress-indeterminate'],
} satisfies Partial<Record<DefaultThemeGroupIds, string[]>>;

const MOTION_CLASS_GROUPS = {
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
} satisfies Partial<Record<DefaultClassGroupIds, string[]>>;

const Z_INDEX_CLASS_GROUPS = {
  z: ['z-overlay', 'z-sticky', 'z-modal', 'z-popover', 'z-toast', 'z-max'],
} satisfies Partial<Record<DefaultClassGroupIds, string[]>>;

const ROLE_CLASS_GROUPS = {
  gap: ['gap-container', 'gap-layout-section', 'gap-layout-stack'],
  p: ['p-container'],
} satisfies Partial<Record<DefaultClassGroupIds, string[]>>;

const BORDER_WIDTH_CLASS_GROUPS = {
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
} satisfies Partial<Record<DefaultClassGroupIds, string[]>>;

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
} satisfies Partial<Record<DefaultClassGroupIds, string[]>>;

const TYPOGRAPHY_CLASS_GROUPS = {
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
};

export const NEXUS_CLASS_GROUPS = {
  ...MOTION_CLASS_GROUPS,
  ...Z_INDEX_CLASS_GROUPS,
  ...ROLE_CLASS_GROUPS,
  ...BORDER_WIDTH_CLASS_GROUPS,
  ...BORDER_COLOR_CLASS_GROUPS,
  ...TYPOGRAPHY_CLASS_GROUPS,
};

type NexusClassGroupId = keyof typeof NEXUS_CLASS_GROUPS;

/** Tailwind-merge configured with `nx:` prefix and Nexus custom utility groups. */
const twMerge = extendTailwindMerge<NexusClassGroupId>({
  prefix: 'nx',
  extend: {
    theme: NEXUS_THEME_SCALES,
    classGroups: NEXUS_CLASS_GROUPS,
    conflictingClassGroups: {
      typography: [
        'font-family',
        'font-size',
        'font-weight',
        'leading',
        'tracking',
      ],
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
