import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** Tailwind-merge configured with `nx:` prefix and Nexus role-utility class groups. */
const twMerge = extendTailwindMerge({
  prefix: 'nx',
  extend: {
    classGroups: {
      px: ['px-control-sm', 'px-control-md', 'px-control-lg'],
      py: ['py-control-sm', 'py-control-md', 'py-control-lg'],
      gap: [
        'gap-control-sm',
        'gap-control-md',
        'gap-control-lg',
        'gap-container',
        'gap-layout-section',
        'gap-layout-stack',
      ],
      p: ['p-container'],
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
