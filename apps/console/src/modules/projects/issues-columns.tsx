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
import type { Issue } from '../../lib/projects-api';

import { IssuePriorityBadge, IssueStatusBadge } from './issue-ui';

/** A clickable column header that cycles the column's sort and shows its state. */
function SortHeader({
  column,
  children,
}: {
  column: Column<Issue, unknown>;
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

export const issueColumns: ColumnDef<Issue>[] = [
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
        aria-label={`Select ${row.original.key}`}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'key',
    header: ({ column }) => <SortHeader column={column}>ID</SortHeader>,
    cell: ({ row }) => (
      <span className="nx:text-muted-foreground nx:typography-label-default nx:tabular-nums">
        {row.original.key}
      </span>
    ),
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <SortHeader column={column}>Title</SortHeader>,
    cell: ({ row }) => (
      <Link
        to="/m/projects/$id"
        params={{ id: row.original.id }}
        className="nx:text-foreground nx:font-medium nx:hover:underline"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortHeader column={column}>Status</SortHeader>,
    cell: ({ row }) => <IssueStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => <SortHeader column={column}>Priority</SortHeader>,
    cell: ({ row }) => <IssuePriorityBadge priority={row.original.priority} />,
  },
  {
    accessorKey: 'assignee',
    header: 'Assignee',
    cell: ({ row }) => (
      <div className="nx:flex nx:items-center nx:gap-2">
        <Avatar className="nx:size-6">
          <AvatarFallback className="nx:typography-label-small">
            {initials(row.original.assignee)}
          </AvatarFallback>
        </Avatar>
        <span>{row.original.assignee}</span>
      </div>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <SortHeader column={column}>Updated</SortHeader>,
    cell: ({ row }) => (
      <span className="nx:text-muted-foreground">
        {formatDate(row.original.updatedAt)}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => <span className="nx:sr-only">Actions</span>,
    cell: ({ row }) => <RowActions issue={row.original} />,
    enableSorting: false,
  },
];

function RowActions({ issue }: { issue: Issue }) {
  const copyId = () => {
    if (!navigator.clipboard) {
      toast.error('Clipboard is unavailable in this context.');
      return;
    }
    navigator.clipboard
      .writeText(issue.key)
      .then(() => toast.success('Issue ID copied'))
      .catch(() => toast.error("Couldn't copy issue ID"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${issue.key}`}
        >
          <IconDots />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/m/projects/$id" params={{ id: issue.id }}>
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={copyId}>Copy issue ID</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
