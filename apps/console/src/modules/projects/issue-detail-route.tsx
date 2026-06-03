import type { ReactNode } from 'react';
import { useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from '@nexus/react';
import { IconPencil } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';

import { NotFoundState } from '../../components/not-found-state';
import { formatDate, initials } from '../../lib/format';
import {
  fetchIssue,
  type IssueDetail,
  projectKeys,
} from '../../lib/projects-api';

import { IssueFormSheet } from './issue-form-sheet';
import { IssuePriorityBadge, IssueStatusBadge } from './issue-ui';

export function IssueDetailRoute() {
  const { id } = useParams({ from: '/app/m/projects/$id' });
  const { data, isPending, isError } = useQuery({
    queryKey: projectKeys.issue(id),
    queryFn: () => fetchIssue(id),
  });

  return (
    <div className="nx:space-y-6 nx:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/m/projects">Issues</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data?.issue.title ?? 'Issue'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isPending && <DetailSkeleton />}
      {isError && (
        <NotFoundState
          title="Issue not found"
          description="This issue doesn't exist, or may have been removed."
        >
          <Link to="/m/projects">Back to Issues</Link>
        </NotFoundState>
      )}
      {data && <DetailContent issue={data.issue} />}
    </div>
  );
}

function DetailContent({ issue }: { issue: IssueDetail }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <header className="nx:space-y-3">
        <div className="nx:flex nx:items-start nx:justify-between nx:gap-4">
          <div className="nx:space-y-1">
            <p className="nx:text-muted-foreground nx:text-sm nx:tabular-nums">
              {issue.key}
            </p>
            <h1 className="nx:typography-heading-large nx:text-foreground">
              {issue.title}
            </h1>
          </div>
          <Button
            variant="outline"
            className="nx:shrink-0"
            onClick={() => setEditOpen(true)}
          >
            <IconPencil />
            Edit
          </Button>
        </div>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <IssueStatusBadge status={issue.status} />
          <IssuePriorityBadge priority={issue.priority} />
        </div>
      </header>

      <div className="nx:grid nx:gap-6 nx:lg:grid-cols-3">
        <Card className="nx:lg:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            {issue.description ? (
              <p className="nx:text-foreground nx:text-sm nx:leading-relaxed nx:whitespace-pre-wrap">
                {issue.description}
              </p>
            ) : (
              <p className="nx:text-muted-foreground nx:text-sm">
                No description.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Assignee">
              <div className="nx:flex nx:items-center nx:gap-2">
                <Avatar className="nx:size-6">
                  <AvatarFallback className="nx:text-xs">
                    {initials(issue.assignee)}
                  </AvatarFallback>
                </Avatar>
                <span>{issue.assignee}</span>
              </div>
            </Row>
            <Separator />
            <Row label="Status">
              <IssueStatusBadge status={issue.status} />
            </Row>
            <Separator />
            <Row label="Priority">
              <IssuePriorityBadge priority={issue.priority} />
            </Row>
            <Separator />
            <Row label="Created">{formatDate(issue.createdAt)}</Row>
            <Separator />
            <Row label="Updated">{formatDate(issue.updatedAt)}</Row>
          </CardContent>
        </Card>
      </div>

      <IssueFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        issue={issue}
      />
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="nx:flex nx:items-center nx:justify-between nx:gap-4 nx:py-3">
      <span className="nx:text-muted-foreground nx:text-sm">{label}</span>
      <div className="nx:text-foreground nx:text-sm nx:font-medium">
        {children}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="nx:space-y-6">
      <div className="nx:space-y-2">
        <Skeleton className="nx:h-4 nx:w-20" />
        <Skeleton className="nx:h-7 nx:w-96 nx:max-w-full" />
      </div>
      <div className="nx:grid nx:gap-6 nx:lg:grid-cols-3">
        <Skeleton className="nx:h-48 nx:lg:col-span-2" />
        <Skeleton className="nx:h-48" />
      </div>
    </div>
  );
}
