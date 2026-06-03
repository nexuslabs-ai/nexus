import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@nexus/react';
import { IconFilter } from '@tabler/icons-react';

import {
  type Department,
  DEPARTMENTS,
  type MemberRole,
  type MemberStatus,
} from '../../lib/people-api';

import type { PeopleView } from './people-search';

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'guest', label: 'Guest' },
];

// Departments are their own labels — no mapping table to keep in sync.
const DEPARTMENT_OPTIONS = DEPARTMENTS.map((value) => ({
  value,
  label: value,
}));

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'suspended', label: 'Suspended' },
];

interface PeopleToolbarProps {
  role: MemberRole[];
  department: Department[];
  status: MemberStatus[];
  setSearch: (patch: Partial<PeopleView>) => void;
}

export function PeopleToolbar({
  role,
  department,
  status,
  setSearch,
}: PeopleToolbarProps) {
  const hasFilters =
    role.length > 0 || department.length > 0 || status.length > 0;

  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
      <FacetFilter
        label="Role"
        options={ROLE_OPTIONS}
        selected={role}
        onChange={(role) => setSearch({ role })}
      />
      <FacetFilter
        label="Department"
        options={DEPARTMENT_OPTIONS}
        selected={department}
        onChange={(department) => setSearch({ department })}
      />
      <FacetFilter
        label="Status"
        options={STATUS_OPTIONS}
        selected={status}
        onChange={(status) => setSearch({ status })}
      />
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSearch({ role: [], department: [], status: [] })}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}

/**
 * A single multi-select filter facet. Generic over the option union (`T`) so each
 * facet keeps its own typed value array end-to-end — no casts at the call site.
 * People-local: three facets earned the abstraction; CRM's single status facet
 * stays hand-rolled.
 */
function FacetFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  selected: T[];
  onChange: (next: T[]) => void;
}) {
  const toggle = (value: T, on: boolean) =>
    onChange(on ? [...selected, value] : selected.filter((s) => s !== value));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <IconFilter />
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary">{selected.length}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={(checked) => toggle(option.value, !!checked)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onChange([])}>
              Clear
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
