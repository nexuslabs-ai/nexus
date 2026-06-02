import {
  IconAddressBook,
  IconBriefcase,
  IconChartBar,
  IconCreditCard,
  IconInbox,
  IconLayoutDashboard,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';

/**
 * Canonical Atlas workspace-module IA. The sidebar renders these as nav entries
 * and the `ComingSoon` placeholder resolves a module's label by slug — both read
 * this one list, so a new module shows up in the nav and the placeholder together
 * instead of being kept in sync by hand.
 *
 * A built module carries an explicit `route` (its static path) — the sidebar
 * links straight there; unbuilt modules fall through to the `/m/$module`
 * placeholder.
 */
export const MODULE_ITEMS = [
  { label: 'Dashboard', module: 'dashboard', icon: IconLayoutDashboard },
  { label: 'CRM', module: 'crm', icon: IconUsers, route: '/m/crm' },
  { label: 'Projects', module: 'projects', icon: IconBriefcase },
  { label: 'Inbox', module: 'inbox', icon: IconInbox },
  { label: 'Billing', module: 'billing', icon: IconCreditCard },
  { label: 'Analytics', module: 'analytics', icon: IconChartBar },
  { label: 'People', module: 'people', icon: IconAddressBook },
  { label: 'Settings', module: 'settings', icon: IconSettings },
] as const;
