/**
 * Internal Icons
 *
 * This barrel file re-exports icons used internally by the design system.
 * These are hardcoded icons for component states (loading, validation, navigation).
 *
 * User-facing icons should be passed via props by consumers.
 *
 * @example
 * ```tsx
 * import { IconLoader2 } from '@/lib/icons';
 * ```
 */

// Loading states
export { IconLoader2 } from '@tabler/icons-react';

// Navigation
export {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
} from '@tabler/icons-react';

// Actions
export { IconCheck, IconCircleFilled, IconX } from '@tabler/icons-react';

// Alerts/Status
export {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';

// Common UI
export { IconEye, IconEyeOff, IconSearch } from '@tabler/icons-react';
