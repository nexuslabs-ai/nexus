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
import { IconUserPlus, IconUsers } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

import { DataTable } from '../../components/data-table';
import { ErrorState } from '../../components/error-state';
import { PageHeader } from '../../components/page-header';
import { useMediaQuery } from '../../hooks/use-media-query';
import { fetchMembers, peopleKeys } from '../../lib/people-api';

import { MemberFormSheet } from './member-form-sheet';
import { MemberCardList } from './people-card-list';
import { memberColumns } from './people-columns';
import type { PeopleView } from './people-search';
import { PeopleToolbar } from './people-toolbar';

const peopleRoute = getRouteApi('/app/m/people');

export function PeopleRoute() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: peopleKeys.members,
    queryFn: fetchMembers,
  });
  const members = data?.members;
  const { role, department, status } = peopleRoute.useSearch();
  const navigate = peopleRoute.useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 64rem)');

  const tableData = members
    ? members.filter(
        (m) =>
          (role.length === 0 || role.includes(m.role)) &&
          (department.length === 0 || department.includes(m.department)) &&
          (status.length === 0 || status.includes(m.status))
      )
    : [];

  const setSearch = (patch: Partial<PeopleView>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  return (
    <div className="nx:space-y-6 nx:p-6">
      <PageHeader
        title="People"
        description="Everyone in your workspace. Filter by role, department, or status."
      >
        <Button onClick={() => setInviteOpen(true)}>
          <IconUserPlus />
          Invite member
        </Button>
      </PageHeader>

      <PeopleToolbar
        role={role}
        department={department}
        status={status}
        setSearch={setSearch}
      />

      {isPending && <PeopleSkeleton />}
      {isError && (
        <ErrorState
          message="Couldn't load members."
          onRetry={refetch}
          bordered
        />
      )}
      {members &&
        (members.length === 0 ? (
          <PeopleEmpty />
        ) : isDesktop ? (
          <DataTable
            columns={memberColumns}
            data={tableData}
            filterColumn="name"
            filterPlaceholder="Filter by name…"
          />
        ) : (
          <MemberCardList members={tableData} />
        ))}

      <MemberFormSheet open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}

function PeopleSkeleton() {
  return (
    <div className="nx:space-y-4">
      <Skeleton className="nx:h-9 nx:max-w-xs" />
      <div className="nx:border-border-default nx:space-y-3 nx:rounded-md nx:border-default nx:p-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="nx:h-8 nx:w-full" />
        ))}
      </div>
    </div>
  );
}

function PeopleEmpty() {
  return (
    <EmptyState bordered>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconUsers />
        </EmptyStateMedia>
        <EmptyStateTitle>No members yet</EmptyStateTitle>
        <EmptyStateDescription>
          Invite teammates and they&apos;ll show up here, ready to filter by
          role, department, and status.
        </EmptyStateDescription>
      </EmptyStateHeader>
    </EmptyState>
  );
}
