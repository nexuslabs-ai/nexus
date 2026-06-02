import { useState } from 'react';

import { Button, Skeleton } from '@nexus/react';
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

// App-local empty state — the polished @nexus/react EmptyState is tracked in #282.
function IssuesEmpty() {
  return (
    <div className="nx:border-border-default nx:flex nx:flex-col nx:items-center nx:justify-center nx:gap-3 nx:rounded-md nx:border nx:border-dashed nx:p-12 nx:text-center">
      <div className="nx:bg-muted nx:text-muted-foreground nx:flex nx:size-12 nx:items-center nx:justify-center nx:rounded-full">
        <IconBriefcase />
      </div>
      <h2 className="nx:typography-heading-medium nx:text-foreground">
        No issues yet
      </h2>
      <p className="nx:text-muted-foreground nx:max-w-sm">
        Issues you create will show up here, ready to sort, filter, and work
        through.
      </p>
    </div>
  );
}
