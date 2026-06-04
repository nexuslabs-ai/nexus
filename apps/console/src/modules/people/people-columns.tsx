import type { ReactNode } from 'react';

import {
  Avatar,
  AvatarFallback,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast,
} from '@nexus/react';
import {
  IconChevronDown,
  IconChevronUp,
  IconDots,
  IconSelector,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import type { Column, ColumnDef } from '@tanstack/react-table';

import { formatDate, initials } from '../../lib/format';
import type { Member } from '../../lib/people-api';

import { MemberStatusBadge, RoleBadge } from './people-ui';

/** A clickable column header that cycles the column's sort and shows its state. */
function SortHeader({
  column,
  children,
}: {
  column: Column<Member, unknown>;
  children: ReactNode;
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="nx:-ml-2"
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {children}
      {sorted === 'asc' ? (
        <IconChevronUp />
      ) : sorted === 'desc' ? (
        <IconChevronDown />
      ) : (
        <IconSelector className="nx:text-muted-foreground" />
      )}
    </Button>
  );
}

export const memberColumns: ColumnDef<Member>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select ${row.original.name}`}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <SortHeader column={column}>Name</SortHeader>,
    cell: ({ row }) => (
      <div className="nx:flex nx:items-center nx:gap-3">
        <Avatar className="nx:size-8">
          <AvatarFallback className="nx:text-xs">
            {initials(row.original.name)}
          </AvatarFallback>
        </Avatar>
        <Link
          to="/m/people/$id"
          params={{ id: row.original.id }}
          className="nx:text-foreground nx:font-medium nx:hover:underline"
        >
          {row.original.name}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <SortHeader column={column}>Title</SortHeader>,
    cell: ({ row }) => (
      <span className="nx:text-muted-foreground">{row.original.title}</span>
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <SortHeader column={column}>Role</SortHeader>,
    cell: ({ row }) => <RoleBadge role={row.original.role} />,
  },
  {
    accessorKey: 'department',
    header: ({ column }) => <SortHeader column={column}>Department</SortHeader>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortHeader column={column}>Status</SortHeader>,
    cell: ({ row }) => <MemberStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'joinedAt',
    header: ({ column }) => <SortHeader column={column}>Joined</SortHeader>,
    cell: ({ row }) => (
      <span className="nx:text-muted-foreground">
        {formatDate(row.original.joinedAt)}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => <span className="nx:sr-only">Actions</span>,
    cell: ({ row }) => <RowActions member={row.original} />,
    enableSorting: false,
  },
];

function RowActions({ member }: { member: Member }) {
  const copy = (label: string, value: string) => {
    if (!navigator.clipboard) {
      toast.error('Clipboard is unavailable in this context.');
      return;
    }
    navigator.clipboard
      .writeText(value)
      .then(() => toast.success(`${label} copied`))
      .catch(() => toast.error(`Couldn't copy ${label.toLowerCase()}`));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Actions for ${member.name}`}
        >
          <IconDots />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/m/people/$id" params={{ id: member.id }}>
            View profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copy('Email', member.email)}>
          Copy email
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copy('Member ID', member.id)}>
          Copy member ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
