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

import type { Contact } from '../../lib/crm-api';
import { formatCurrency, formatDate } from '../../lib/format';

import { ContactStatusBadge, initials } from './contact-ui';

/** A clickable column header that cycles the column's sort and shows its state. */
function SortHeader({
  column,
  children,
}: {
  column: Column<Contact, unknown>;
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

export const contactColumns: ColumnDef<Contact>[] = [
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
      <Link
        to="/m/crm/$id"
        params={{ id: row.original.id }}
        className="nx:text-foreground nx:font-medium nx:hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'company',
    header: ({ column }) => <SortHeader column={column}>Company</SortHeader>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortHeader column={column}>Status</SortHeader>,
    cell: ({ row }) => <ContactStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    cell: ({ row }) => (
      <div className="nx:flex nx:items-center nx:gap-2">
        <Avatar className="nx:size-6">
          <AvatarFallback className="nx:text-xs">
            {initials(row.original.owner)}
          </AvatarFallback>
        </Avatar>
        <span>{row.original.owner}</span>
      </div>
    ),
  },
  {
    accessorKey: 'value',
    header: ({ column }) => <SortHeader column={column}>Open value</SortHeader>,
    cell: ({ row }) => (
      <span className="nx:tabular-nums">
        {formatCurrency(row.original.value)}
      </span>
    ),
  },
  {
    accessorKey: 'lastContacted',
    header: ({ column }) => (
      <SortHeader column={column}>Last contacted</SortHeader>
    ),
    cell: ({ row }) => (
      <span className="nx:text-muted-foreground">
        {formatDate(row.original.lastContacted)}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions contact={row.original} />,
    enableSorting: false,
  },
];

function RowActions({ contact }: { contact: Contact }) {
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
          aria-label={`Actions for ${contact.name}`}
        >
          <IconDots />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/m/crm/$id" params={{ id: contact.id }}>
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copy('Email', contact.email)}>
          Copy email
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copy('Contact ID', contact.id)}>
          Copy contact ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
