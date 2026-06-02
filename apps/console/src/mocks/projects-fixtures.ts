import type { Issue } from '../lib/projects-api';

/**
 * Deterministic seed issues for the Projects module. Stored shape is
 * {@link Issue} plus the long-form `description` the detail page renders; the
 * list endpoint returns the same records (the extra field is harmless). 24 rows
 * span every status and priority so the table, badges, and pager all have
 * variety. Assignees reuse the CRM owner names for a consistent demo workspace.
 */
export const ISSUES: (Issue & { description: string })[] = [
  {
    id: 'i-01',
    key: 'ATL-101',
    title: 'Persisted theme drops stale mode values on load',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Ada Lovelace',
    createdAt: '2026-05-02',
    updatedAt: '2026-06-01',
    description:
      'A workspace that saved a now-removed typography mode 404s on the theme CSS fetch. Sanitize persisted theme against the live axis values before loading.',
  },
  {
    id: 'i-02',
    key: 'ATL-102',
    title: 'Saved-view delete is unreachable by keyboard',
    status: 'done',
    priority: 'urgent',
    assignee: 'Grace Hopper',
    createdAt: '2026-04-18',
    updatedAt: '2026-05-30',
    description:
      'The per-row delete control sat inside a menu item and never received keyboard focus. Rebuilt the list as a popover with sibling buttons.',
  },
  {
    id: 'i-03',
    key: 'ATL-103',
    title: 'Contact dates render a day early west of UTC',
    status: 'done',
    priority: 'high',
    assignee: 'Alan Turing',
    createdAt: '2026-04-10',
    updatedAt: '2026-05-21',
    description:
      'ISO dates parsed as UTC midnight shifted back a day in US time zones. Pin the date formatter to UTC so the authored calendar day renders everywhere.',
  },
  {
    id: 'i-04',
    key: 'ATL-104',
    title: 'Kanban board: add swimlanes by assignee',
    status: 'backlog',
    priority: 'medium',
    assignee: 'Katherine Johnson',
    createdAt: '2026-05-12',
    updatedAt: '2026-05-12',
    description:
      'Group the pipeline board into horizontal lanes per owner, collapsible, with a per-lane count.',
  },
  {
    id: 'i-05',
    key: 'ATL-105',
    title: 'Command palette: fuzzy search across modules',
    status: 'todo',
    priority: 'high',
    assignee: 'Ada Lovelace',
    createdAt: '2026-05-20',
    updatedAt: '2026-05-28',
    description:
      'Wire the ⌘K palette to search contacts, issues, and settings with a ranked, debounced fuzzy match.',
  },
  {
    id: 'i-06',
    key: 'ATL-106',
    title: 'Invoices table exceeds viewport on mobile',
    status: 'backlog',
    priority: 'low',
    assignee: 'Grace Hopper',
    createdAt: '2026-05-08',
    updatedAt: '2026-05-15',
    description:
      'Below the md breakpoint the billing table overflows horizontally. Collapse low-priority columns into an expandable row.',
  },
  {
    id: 'i-07',
    key: 'ATL-107',
    title: 'Analytics: date-range picker resets on tab switch',
    status: 'todo',
    priority: 'medium',
    assignee: 'Alan Turing',
    createdAt: '2026-05-22',
    updatedAt: '2026-05-29',
    description:
      'Switching report tabs discards the selected range. Lift the range into the URL search params so it survives navigation.',
  },
  {
    id: 'i-08',
    key: 'ATL-108',
    title: 'People directory: bulk role assignment',
    status: 'backlog',
    priority: 'low',
    assignee: 'Katherine Johnson',
    createdAt: '2026-05-03',
    updatedAt: '2026-05-09',
    description:
      'Select multiple members and assign a role in one action, with an undo toast.',
  },
  {
    id: 'i-09',
    key: 'ATL-109',
    title: 'Sidebar collapse state not persisted',
    status: 'done',
    priority: 'low',
    assignee: 'Ada Lovelace',
    createdAt: '2026-03-28',
    updatedAt: '2026-04-30',
    description:
      'Collapsing the sidebar resets on reload. Persist the open/closed flag to localStorage via the shell store.',
  },
  {
    id: 'i-10',
    key: 'ATL-110',
    title: 'Focus ring invisible on primary buttons in dark mode',
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'Grace Hopper',
    createdAt: '2026-05-25',
    updatedAt: '2026-06-01',
    description:
      'The focus outline blends into the primary fill on a near-blue dark canvas. Use the dedicated theme-split focus token at a 2px offset.',
  },
  {
    id: 'i-11',
    key: 'ATL-111',
    title: 'Inbox: collapse quoted reply history',
    status: 'todo',
    priority: 'medium',
    assignee: 'Alan Turing',
    createdAt: '2026-05-19',
    updatedAt: '2026-05-26',
    description:
      'Long threads repeat quoted history. Collapse prior quotes behind a "show trimmed content" toggle.',
  },
  {
    id: 'i-12',
    key: 'ATL-112',
    title: 'Table column visibility config menu',
    status: 'backlog',
    priority: 'medium',
    assignee: 'Katherine Johnson',
    createdAt: '2026-05-06',
    updatedAt: '2026-05-14',
    description:
      'Let users hide and reorder columns from a dropdown, persisted per table per workspace.',
  },
  {
    id: 'i-13',
    key: 'ATL-113',
    title: 'Drag-drop pipeline flickers on slow networks',
    status: 'canceled',
    priority: 'low',
    assignee: 'Ada Lovelace',
    createdAt: '2026-04-02',
    updatedAt: '2026-04-22',
    description:
      'Optimistic move then server roll-back caused a flash. Superseded by the cache-write approach in the kanban rework.',
  },
  {
    id: 'i-14',
    key: 'ATL-114',
    title: 'Notifications center: mark-all-as-read',
    status: 'todo',
    priority: 'low',
    assignee: 'Grace Hopper',
    createdAt: '2026-05-21',
    updatedAt: '2026-05-27',
    description:
      'Add a single action to clear all unread badges, with an optimistic update and a confirm for >50 items.',
  },
  {
    id: 'i-15',
    key: 'ATL-115',
    title: 'Onboarding checklist persists across sessions',
    status: 'backlog',
    priority: 'medium',
    assignee: 'Alan Turing',
    createdAt: '2026-05-10',
    updatedAt: '2026-05-18',
    description:
      'Track first-run steps (create workspace, invite team, choose plan) and resume where the user left off.',
  },
  {
    id: 'i-16',
    key: 'ATL-116',
    title: 'Empty states need a shared illustration slot',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Katherine Johnson',
    createdAt: '2026-05-24',
    updatedAt: '2026-05-31',
    description:
      'Each module hand-rolls its empty state. Extract a Nexus EmptyState with icon, title, body, and action slots.',
  },
  {
    id: 'i-17',
    key: 'ATL-117',
    title: 'Search input debounce drops fast keystrokes',
    status: 'done',
    priority: 'high',
    assignee: 'Ada Lovelace',
    createdAt: '2026-04-14',
    updatedAt: '2026-05-11',
    description:
      'The 300ms debounce dropped the trailing character on fast typists. Switch to a trailing-edge debounce that always flushes the latest value.',
  },
  {
    id: 'i-18',
    key: 'ATL-118',
    title: 'Billing: proration preview before plan change',
    status: 'backlog',
    priority: 'high',
    assignee: 'Grace Hopper',
    createdAt: '2026-05-05',
    updatedAt: '2026-05-13',
    description:
      'Show the prorated amount and next-invoice date in a confirm dialog before applying an upgrade or downgrade.',
  },
  {
    id: 'i-19',
    key: 'ATL-119',
    title: 'Tooltip clips inside scrollable table cells',
    status: 'todo',
    priority: 'low',
    assignee: 'Alan Turing',
    createdAt: '2026-05-17',
    updatedAt: '2026-05-23',
    description:
      'Tooltips on truncated cells get cut by the cell overflow. Portal the tooltip content to the body so it escapes the clip.',
  },
  {
    id: 'i-20',
    key: 'ATL-120',
    title: 'Audit log export to CSV',
    status: 'backlog',
    priority: 'low',
    assignee: 'Katherine Johnson',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-07',
    description:
      'Stream the filtered audit log to a downloadable CSV with the active date range and actor filters applied.',
  },
  {
    id: 'i-21',
    key: 'ATL-121',
    title: 'Avatar group overflow count for >5 members',
    status: 'done',
    priority: 'medium',
    assignee: 'Ada Lovelace',
    createdAt: '2026-04-20',
    updatedAt: '2026-05-19',
    description:
      'Stacked avatars beyond five should collapse into a "+N" chip with a tooltip listing the remaining names.',
  },
  {
    id: 'i-22',
    key: 'ATL-122',
    title: 'Unsaved-changes guard on slide-over forms',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Grace Hopper',
    createdAt: '2026-05-23',
    updatedAt: '2026-05-31',
    description:
      'Closing a dirty create/edit sheet should prompt before discarding. Wire a confirm dialog to the dirty form state.',
  },
  {
    id: 'i-23',
    key: 'ATL-123',
    title: 'Keyboard shortcuts cheat-sheet overlay',
    status: 'backlog',
    priority: 'none',
    assignee: 'Alan Turing',
    createdAt: '2026-05-04',
    updatedAt: '2026-05-04',
    description:
      'A "?" shortcut opens a modal listing the app shortcuts grouped by area, rendered with the Kbd component.',
  },
  {
    id: 'i-24',
    key: 'ATL-124',
    title: 'Dashboard KPI cards: sparkline trend lines',
    status: 'todo',
    priority: 'medium',
    assignee: 'Katherine Johnson',
    createdAt: '2026-05-16',
    updatedAt: '2026-05-22',
    description:
      'Each KPI card should show a 14-day sparkline and a percent-change pill versus the prior period.',
  },
];
