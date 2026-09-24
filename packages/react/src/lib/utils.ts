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
  // The two ring-safe colour transitions. Without this they land nowhere and a
  // later `transition-none` / `transition-all` fails to replace them.
  transition: ['transition-control', 'transition-field'],
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
  'border-w-s': [
    'border-s-thin',
    'border-s-default',
    'border-s-thick',
    'border-width-s-thin',
    'border-width-s-default',
    'border-width-s-thick',
  ],
  'border-w-e': [
    'border-e-thin',
    'border-e-default',
    'border-e-thick',
    'border-width-e-thin',
    'border-width-e-default',
    'border-width-e-thick',
  ],
  'border-w-bs': [
    'border-bs-thin',
    'border-bs-default',
    'border-bs-thick',
    'border-width-bs-thin',
    'border-width-bs-default',
    'border-width-bs-thick',
  ],
  'border-w-be': [
    'border-be-thin',
    'border-be-default',
    'border-be-thick',
    'border-width-be-thin',
    'border-width-be-default',
    'border-width-be-thick',
  ],
  // `outline-{thin,default,thick}` are widths, not colours. Without this they
  // land in tailwind-merge's `outline-color` group and a field's
  // `outline-focus-default` silently drops the width beside it.
  'outline-w': ['outline-thin', 'outline-default', 'outline-thick'],
  // Only the `@utility` aliases, which the emitted-utility drift guard in
  // `utils.test.ts` requires to declare a group. `border-border-*` is
  // Tailwind-generated from `--color-*` rather than emitted as a utility, and
  // tailwind-merge's default `theme.color` is `[isAny]`, so it needs no entry.
  'border-color': [
    'border-color-default',
    'border-color-default-alpha',
    'border-color-active',
    'border-color-disabled',
    'border-color-warning',
    'border-color-warning-active',
    'border-color-success',
    'border-color-success-active',
    'border-color-error',
    'border-color-error-active',
    'border-color-information',
    'border-color-information-active',
    'border-color-primary',
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
