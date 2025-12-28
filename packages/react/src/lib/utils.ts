import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Create a tailwind-merge instance configured for nx: prefix
 * This ensures proper class merging for Nexus prefixed utilities
 */
const twMerge = extendTailwindMerge({
  prefix: 'nx',
});

/**
 * Combines class names using clsx and tailwind-merge
 * Supports nx: prefixed Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
