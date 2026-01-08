import { create } from 'zustand';

import {
  getAllIconNames,
  getIcon,
  type IconComponent,
  type IconLibrary,
  iconLibraryMeta,
  type IconName,
} from '../lib/icon-registry';

/**
 * Icon store state
 */
interface IconState {
  /** Current icon library */
  library: IconLibrary;
  /** Set the icon library */
  setLibrary: (library: IconLibrary) => void;
}

/**
 * Icon Store
 *
 * Zustand store for managing icon library state in the playground.
 * Uses selective subscriptions to prevent unnecessary re-renders.
 *
 * @example
 * ```tsx
 * // Only re-renders when library changes
 * const library = useIconStore((s) => s.library);
 *
 * // Only re-renders when setLibrary changes (never)
 * const setLibrary = useIconStore((s) => s.setLibrary);
 *
 * // Get both (re-renders on library change)
 * const { library, setLibrary } = useIconStore();
 * ```
 */
export const useIconStore = create<IconState>((set) => ({
  library: 'tabler',
  setLibrary: (library) => set({ library }),
}));

/**
 * Helper hook to get an icon component by name
 *
 * @example
 * ```tsx
 * const CheckIcon = useIcon('check');
 * return <CheckIcon size={16} />;
 * ```
 */
export function useIcon(name: IconName): IconComponent {
  const library = useIconStore((s) => s.library);
  return getIcon(name, library);
}

/**
 * Helper hook to get the icon getter function
 *
 * @example
 * ```tsx
 * const getIconComponent = useIconGetter();
 * const CheckIcon = getIconComponent('check');
 * ```
 */
export function useIconGetter(): (name: IconName) => IconComponent {
  const library = useIconStore((s) => s.library);
  return (name: IconName) => getIcon(name, library);
}

/**
 * Get all available icon names
 */
export const iconNames = getAllIconNames();

/**
 * Library metadata for UI display
 */
export { iconLibraryMeta };

// Re-export types for convenience
export type { IconComponent,IconLibrary, IconName };
