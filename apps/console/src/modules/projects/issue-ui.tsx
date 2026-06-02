import { Badge, type BadgeProps } from '@nexus/react';

import {
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  type IssuePriority,
  type IssueStatus,
} from '../../lib/projects-api';

const STATUS_META: Record<
  IssueStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  backlog: { label: 'Backlog', variant: 'outline' },
  todo: { label: 'Todo', variant: 'secondary' },
  in_progress: { label: 'In progress', variant: 'information' },
  done: { label: 'Done', variant: 'success' },
  canceled: { label: 'Canceled', variant: 'secondary' },
};

const PRIORITY_META: Record<
  IssuePriority,
  { label: string; variant: BadgeProps['variant'] }
> = {
  urgent: { label: 'Urgent', variant: 'error' },
  high: { label: 'High', variant: 'warning' },
  medium: { label: 'Medium', variant: 'information' },
  low: { label: 'Low', variant: 'secondary' },
  none: { label: 'No priority', variant: 'outline' },
};

/** The status badge, shared by the issues table and the detail page. */
export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  const { label, variant } = STATUS_META[status];
  return <Badge variant={variant}>{label}</Badge>;
}

/** The priority badge, shared by the issues table and the detail page. */
export function IssuePriorityBadge({ priority }: { priority: IssuePriority }) {
  const { label, variant } = PRIORITY_META[priority];
  return <Badge variant={variant}>{label}</Badge>;
}

/** The ordered status options for the create/edit form's Select. */
export const STATUS_OPTIONS = ISSUE_STATUSES.map((value) => ({
  value,
  label: STATUS_META[value].label,
}));

/** The ordered priority options for the create/edit form's Select. */
export const PRIORITY_OPTIONS = ISSUE_PRIORITIES.map((value) => ({
  value,
  label: PRIORITY_META[value].label,
}));
