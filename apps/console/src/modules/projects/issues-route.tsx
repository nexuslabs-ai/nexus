import { useState } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
  Skeleton,
} from '@nexus/react';
import { IconBriefcase, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { DataTable } from '../../components/data-table';
import { fetchIssues, projectKeys } from '../../lib/projects-api';

import { IssueFormSheet } from './issue-form-sheet';
import { issueColumns } from './issues-columns';

export function IssuesRoute() {
  const { data, isPending, isError } = useQuery({
    queryKey: projectKeys.issues,
    queryFn: fetchIssues,
  });
  const issues = data?.issues;
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="nx:space-y-6 nx:p-6">
      <header className="nx:flex nx:items-start nx:justify-between nx:gap-4">
        <div className="nx:space-y-1">
          <h1 className="nx:typography-heading-large nx:text-foreground">
            Issues
          </h1>
          <p className="nx:text-muted-foreground">
            Track work across the team. Sort, filter, and open an issue for the
            full details.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <IconPlus />
          New issue
        </Button>
      </header>

      {isPending && <IssuesSkeleton />}
      {isError && (
        <p className="nx:text-error-foreground nx:text-sm">
          Couldn&apos;t load issues. Please try again.
        </p>
      )}
      {issues &&
        (issues.length === 0 ? (
          <IssuesEmpty />
        ) : (
          <DataTable
            columns={issueColumns}
            data={issues}
            filterColumn="title"
            filterPlaceholder="Filter by title…"
          />
        ))}

      <IssueFormSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function IssuesSkeleton() {
  return (
    <div className="nx:space-y-4">
      <Skeleton className="nx:h-9 nx:max-w-xs" />
      <div className="nx:border-border-default nx:space-y-3 nx:rounded-md nx:border nx:p-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="nx:h-8 nx:w-full" />
        ))}
      </div>
    </div>
  );
}

function IssuesEmpty() {
  return (
    <EmptyState className="nx:border nx:border-border-default">
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconBriefcase />
        </EmptyStateMedia>
        <EmptyStateTitle>No issues yet</EmptyStateTitle>
        <EmptyStateDescription>
          Issues you create will show up here, ready to sort, filter, and work
          through.
        </EmptyStateDescription>
      </EmptyStateHeader>
    </EmptyState>
  );
}
