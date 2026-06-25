import { Link } from '@tanstack/react-router';

import { RecordCard } from '../../components/record-card';
import { formatDate } from '../../lib/format';
import type { Issue } from '../../lib/projects-api';

import { IssuePriorityBadge, IssueStatusBadge } from './issue-ui';

/** Mobile card for one issue — the `<lg` stand-in for an Issues table row. */
export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <RecordCard
      title={
        <Link
          to="/m/projects/$id"
          params={{ id: issue.id }}
          className="nx:hover:underline"
        >
          <span className="nx:text-muted-foreground nx:typography-label-default nx:tabular-nums">
            {issue.key}
          </span>{' '}
          <span className="nx:text-foreground nx:typography-label-default">
            {issue.title}
          </span>
        </Link>
      }
      badge={<IssueStatusBadge status={issue.status} />}
    >
      <div className="nx:flex nx:items-center nx:gap-2">
        <IssuePriorityBadge priority={issue.priority} />
        <span>{issue.assignee}</span>
      </div>
      <p>Updated {formatDate(issue.updatedAt)}</p>
    </RecordCard>
  );
}
