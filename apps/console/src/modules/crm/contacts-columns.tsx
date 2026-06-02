import type { ReactNode } from 'react';

import {
  Avatar,
  AvatarFallback,
  Badge,
  type BadgeProps,
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
import type { Column, ColumnDef } from '@tanstack/react-table';

import type { Contact, ContactStatus } from '../../lib/crm-api';

const currencyUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

const STATUS_META: Record<
  ContactStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  active: { label: 'Active', variant: 'success' },
  lead: { label: 'Lead', variant: 'information' },
  churned: { label: 'Churned', variant: 'secondary' },
};

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
      <span className="nx:text-foreground nx:font-medium">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: 'company',
    header: ({ column }) => <SortHeader column={column}>Company</SortHeader>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortHeader column={column}>Status</SortHeader>,
    cell: ({ row }) => {
      const { label, variant } = STATUS_META[row.original.status];
      return <Badge variant={variant}>{label}</Badge>;
    },
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
        {currencyUSD.format(row.original.value)}
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
        {dateFmt.format(new Date(row.original.lastContacted))}
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
    void navigator.clipboard?.writeText(value);
    toast.success(`${label} copied`);
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
