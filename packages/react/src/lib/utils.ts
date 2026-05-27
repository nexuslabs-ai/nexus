import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Tailwind-merge with `nx:` prefix + Nexus role-utility groups (custom
 * `@utility` blocks in `packages/tailwind/spacing-utilities.css`). Registering
 * the role utilities in their natural Tailwind groups makes consumer overrides
 * deconflict — e.g. `<Button className="nx:px-6">` correctly replaces
 * `nx:px-control-md` rather than shipping both.
 */
const twMerge = extendTailwindMerge({
  prefix: 'nx',
  extend: {
    classGroups: {
      px: ['px-control-sm', 'px-control-md', 'px-control-lg'],
      py: ['py-control-sm', 'py-control-md', 'py-control-lg'],
      gap: [
        'gap-control',
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
