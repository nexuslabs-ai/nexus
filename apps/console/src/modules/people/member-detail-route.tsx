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
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateTitle,
  Separator,
  Skeleton,
} from '@nexus/react';
import { IconPencil } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';

import { formatDate, initials } from '../../lib/format';
import {
  fetchMember,
  type MemberDetail,
  peopleKeys,
} from '../../lib/people-api';

import { MemberFormSheet } from './member-form-sheet';
import { MemberStatusBadge, RoleBadge } from './people-ui';

export function MemberDetailRoute() {
  const { id } = useParams({ from: '/app/m/people/$id' });
  const { data, isPending, isError } = useQuery({
    queryKey: peopleKeys.member(id),
    queryFn: () => fetchMember(id),
  });

  return (
    <div className="nx:space-y-6 nx:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/m/people">People</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data?.member.name ?? 'Member'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isPending && <DetailSkeleton />}
      {isError && <NotFound />}
      {data && <DetailContent member={data.member} />}
    </div>
  );
}

function DetailContent({ member }: { member: MemberDetail }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <header className="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
        <Avatar className="nx:size-12">
          <AvatarFallback>{initials(member.name)}</AvatarFallback>
        </Avatar>
        <div className="nx:space-y-1">
          <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
            <h1 className="nx:typography-heading-large nx:text-foreground">
              {member.name}
            </h1>
            <RoleBadge role={member.role} />
            <MemberStatusBadge status={member.status} />
          </div>
          <p className="nx:text-muted-foreground">{member.title}</p>
        </div>
        <Button
          variant="outline"
          className="nx:ml-auto"
          onClick={() => setEditOpen(true)}
        >
          <IconPencil />
          Edit
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Email" value={member.email} />
          <Separator />
          <Field label="Department" value={member.department} />
          <Separator />
          <Field label="Joined" value={formatDate(member.joinedAt)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          {member.bio ? (
            <p className="nx:text-foreground nx:text-sm">{member.bio}</p>
          ) : (
            <p className="nx:text-muted-foreground nx:text-sm">No bio yet.</p>
          )}
        </CardContent>
      </Card>

      <MemberFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        member={member}
      />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="nx:flex nx:items-center nx:justify-between nx:py-3">
      <span className="nx:text-muted-foreground nx:text-sm">{label}</span>
      <span className="nx:text-foreground nx:text-sm nx:font-medium">
        {value}
      </span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="nx:space-y-6">
      <div className="nx:flex nx:items-center nx:gap-4">
        <Skeleton className="nx:size-12 nx:rounded-full" />
        <div className="nx:space-y-2">
          <Skeleton className="nx:h-6 nx:w-48" />
          <Skeleton className="nx:h-4 nx:w-32" />
        </div>
      </div>
      <Skeleton className="nx:h-48 nx:w-full" />
    </div>
  );
}

function NotFound() {
  return (
    <EmptyState className="nx:border nx:border-border-default">
      <EmptyStateHeader>
        <EmptyStateTitle>Member not found</EmptyStateTitle>
        <EmptyStateDescription>
          This member doesn&apos;t exist, or may have been removed.
        </EmptyStateDescription>
      </EmptyStateHeader>
      <EmptyStateContent>
        <Link
          to="/m/people"
          className="nx:text-primary-subtle-foreground nx:hover:underline"
        >
          Back to People
        </Link>
      </EmptyStateContent>
    </EmptyState>
  );
}
