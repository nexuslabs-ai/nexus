/**
 * Icon Registry
 *
 * Maps internal DS icon names to their equivalents in each supported library.
 * This enables the playground to preview components with different icon libraries.
 *
 * Supported libraries:
 * - Tabler (DS default): https://tabler.io/icons
 * - Lucide (shadcn default): https://lucide.dev
 * - Phosphor: https://phosphoricons.com
 */

// Tabler Icons
import type { ComponentType, SVGProps } from 'react';

// Phosphor Icons
import {
  CaretDown as PhosphorChevronDown,
  CaretLeft as PhosphorChevronLeft,
  CaretRight as PhosphorChevronRight,
  CaretUp as PhosphorChevronUp,
  Check as PhosphorCheck,
  CheckCircle as PhosphorCircleCheck,
  Eye as PhosphorEye,
  EyeSlash as PhosphorEyeOff,
  Info as PhosphorInfoCircle,
  MagnifyingGlass as PhosphorSearch,
  SpinnerGap as PhosphorLoader2,
  Warning as PhosphorAlertTriangle,
  WarningCircle as PhosphorAlertCircle,
  X as PhosphorX,
} from '@phosphor-icons/react';
import {
  IconAlertCircle as TablerAlertCircle,
  IconAlertTriangle as TablerAlertTriangle,
  IconCheck as TablerCheck,
  IconChevronDown as TablerChevronDown,
  IconChevronLeft as TablerChevronLeft,
  IconChevronRight as TablerChevronRight,
  IconChevronUp as TablerChevronUp,
  IconCircleCheck as TablerCircleCheck,
  IconEye as TablerEye,
  IconEyeOff as TablerEyeOff,
  IconInfoCircle as TablerInfoCircle,
  IconLoader2 as TablerLoader2,
  IconSearch as TablerSearch,
  IconX as TablerX,
} from '@tabler/icons-react';
// Lucide Icons
import {
  AlertCircle as LucideAlertCircle,
  AlertTriangle as LucideAlertTriangle,
  Check as LucideCheck,
  CheckCircle2 as LucideCircleCheck,
  ChevronDown as LucideChevronDown,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  ChevronUp as LucideChevronUp,
  Eye as LucideEye,
  EyeOff as LucideEyeOff,
  Info as LucideInfoCircle,
  Loader2 as LucideLoader2,
  Search as LucideSearch,
  X as LucideX,
} from 'lucide-react';

/**
 * Supported icon library identifiers
 */
export type IconLibrary = 'tabler' | 'lucide' | 'phosphor';

/**
 * Internal icon names used by the DS
 */
export type IconName =
  | 'loader'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'check'
  | 'x'
  | 'alert-circle'
  | 'alert-triangle'
  | 'circle-check'
  | 'info-circle'
  | 'search'
  | 'eye'
  | 'eye-off';

/**
 * Icon component type (compatible with all three libraries)
 */
export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

/**
 * Icon registry mapping internal names to library-specific components
 */
export const iconRegistry: Record<IconLibrary, Record<IconName, IconComponent>> = {
  tabler: {
    'loader': TablerLoader2,
    'chevron-down': TablerChevronDown,
    'chevron-left': TablerChevronLeft,
    'chevron-right': TablerChevronRight,
    'chevron-up': TablerChevronUp,
    'check': TablerCheck,
    'x': TablerX,
    'alert-circle': TablerAlertCircle,
    'alert-triangle': TablerAlertTriangle,
    'circle-check': TablerCircleCheck,
    'info-circle': TablerInfoCircle,
    'search': TablerSearch,
    'eye': TablerEye,
    'eye-off': TablerEyeOff,
  },
  lucide: {
    'loader': LucideLoader2,
    'chevron-down': LucideChevronDown,
    'chevron-left': LucideChevronLeft,
    'chevron-right': LucideChevronRight,
    'chevron-up': LucideChevronUp,
    'check': LucideCheck,
    'x': LucideX,
    'alert-circle': LucideAlertCircle,
    'alert-triangle': LucideAlertTriangle,
    'circle-check': LucideCircleCheck,
    'info-circle': LucideInfoCircle,
    'search': LucideSearch,
    'eye': LucideEye,
    'eye-off': LucideEyeOff,
  },
  phosphor: {
    'loader': PhosphorLoader2,
    'chevron-down': PhosphorChevronDown,
    'chevron-left': PhosphorChevronLeft,
    'chevron-right': PhosphorChevronRight,
    'chevron-up': PhosphorChevronUp,
    'check': PhosphorCheck,
    'x': PhosphorX,
    'alert-circle': PhosphorAlertCircle,
    'alert-triangle': PhosphorAlertTriangle,
    'circle-check': PhosphorCircleCheck,
    'info-circle': PhosphorInfoCircle,
    'search': PhosphorSearch,
    'eye': PhosphorEye,
    'eye-off': PhosphorEyeOff,
  },
};

/**
 * Library metadata for UI display
 */
export const iconLibraryMeta: Record<IconLibrary, { label: string; iconCount: string; url: string }> = {
  tabler: {
    label: 'Tabler',
    iconCount: '5,700+',
    url: 'https://tabler.io/icons',
  },
  lucide: {
    label: 'Lucide',
    iconCount: '1,500+',
    url: 'https://lucide.dev',
  },
  phosphor: {
    label: 'Phosphor',
    iconCount: '7,400+',
    url: 'https://phosphoricons.com',
  },
};

/**
 * Get an icon component by name and library
 */
export function getIcon(name: IconName, library: IconLibrary): IconComponent {
  return iconRegistry[library][name];
}

/**
 * Get all icon names
 */
export function getAllIconNames(): IconName[] {
  return Object.keys(iconRegistry.tabler) as IconName[];
}
