import * as React from 'react';

import { IconChevronDown, IconSearch } from '@tabler/icons-react';

import { Button } from '../../components/button';
import { Input } from '../../components/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table';

import { MultiChoiceEditor } from './blocks/multi-choice-filter';

type Filters = { statuses: string[]; countries: string[] };
const empty: Filters = { statuses: [], countries: [] };
const statuses = [
  { value: 'paid', label: 'Paid' },
  { value: 'open', label: 'Open' },
  { value: 'overdue', label: 'Overdue' },
];
const countries = [
  { value: 'in', label: 'India' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
];
const invoices = [
  {
    id: 'INV-1048',
    customer: 'Acme Studio',
    email: 'billing@acme.example',
    country: 'in',
    status: 'paid',
    date: '24 Sep 2026',
    amount: 48000,
  },
  {
    id: 'INV-1047',
    customer: 'Northstar Labs',
    email: 'finance@northstar.example',
    country: 'us',
    status: 'open',
    date: '23 Sep 2026',
    amount: 125000,
  },
  {
    id: 'INV-1046',
    customer: 'Forma Design',
    email: 'accounts@forma.example',
    country: 'gb',
    status: 'paid',
    date: '22 Sep 2026',
    amount: 72000,
  },
  {
    id: 'INV-1045',
    customer: 'Common Ground',
    email: 'billing@common.example',
    country: 'in',
    status: 'overdue',
    date: '18 Sep 2026',
    amount: 36000,
  },
  {
    id: 'INV-1044',
    customer: 'Acme Studio',
    email: 'billing@acme.example',
    country: 'in',
    status: 'open',
    date: '16 Sep 2026',
    amount: 24000,
  },
  {
    id: 'INV-1043',
    customer: 'Fieldwork',
    email: 'accounts@fieldwork.example',
    country: 'us',
    status: 'paid',
    date: '15 Sep 2026',
    amount: 96000,
  },
];
function countryLabel(value: string) {
  return countries.find((option) => option.value === value)?.label ?? value;
}
function statusLabel(value: string) {
  return (
    statuses.find((option) => option.value === value)?.label ?? 'Any status'
  );
}
function matching(filters: Filters, search: string) {
  const query = search.trim().toLowerCase();
  return invoices.filter(
    (invoice) =>
      (!filters.statuses.length || filters.statuses.includes(invoice.status)) &&
      (!filters.countries.length ||
        filters.countries.includes(invoice.country)) &&
      `${invoice.id} ${invoice.customer} ${invoice.email}`
        .toLowerCase()
        .includes(query)
  );
}

function InvoiceChoiceFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: readonly { value: string; label: string }[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<string[]>([]);
  function changeOpen(next: boolean) {
    setDraft(value);
    setOpen(next);
  }
  function apply(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    onChange(draft);
    setOpen(false);
  }
  const selected = value
    .map(
      (item) => options.find((option) => option.value === item)?.label ?? item
    )
    .join(', ');
  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          aria-label={selected ? `${label}: ${selected}` : label}
          className="nx:h-(--nx-spacing-8) nx:max-w-full"
        >
          {label}
          {selected && (
            <span className="nx:min-w-0 nx:truncate nx:text-muted-foreground">
              {selected}
            </span>
          )}
          <IconChevronDown aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={`Filter by ${label}`}
        className="nx:w-64 nx:max-w-(--radix-popover-content-available-width) nx:max-h-(--radix-popover-content-available-height) nx:overflow-y-auto nx:p-0"
      >
        <form onSubmit={apply}>
          <h3 className="nx:px-3 nx:pt-3 nx:pb-1 nx:typography-label-default">
            Filter by {label.toLowerCase()}
          </h3>
          <MultiChoiceEditor
            label={label}
            value={draft}
            options={options}
            onChange={setDraft}
          />
          <div className="nx:p-2">
            <Button type="submit" size="sm" className="nx:w-full">
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

/** Local data illustrates state ownership; applications supply records and query execution. */
export function InvoiceFilteringExample() {
  const [applied, setApplied] = React.useState<Filters>(empty);
  const [search, setSearch] = React.useState('');
  const rows = matching(applied, search);
  const hasFilters =
    applied.statuses.length > 0 || applied.countries.length > 0;
  function clear() {
    setApplied(empty);
  }
  function reset() {
    clear();
    setSearch('');
  }

  return (
    <section
      aria-label="Invoice filtering"
      className="nx:mx-auto nx:grid nx:w-full nx:min-w-0 nx:max-w-5xl nx:gap-5 nx:typography-body-default"
    >
      <header className="nx:grid nx:gap-1">
        <h2 className="nx:typography-heading-medium">Invoices</h2>
        <p className="nx:text-muted-foreground">
          Track payments and find invoices that need your attention.
        </p>
      </header>
      <div
        className="nx:flex nx:flex-wrap nx:items-center nx:gap-2"
        role="group"
        aria-label="Invoice filters"
      >
        <div className="nx:relative nx:w-64 nx:max-w-full">
          <IconSearch
            aria-hidden="true"
            className="nx:pointer-events-none nx:absolute nx:start-2.5 nx:top-1/2 nx:size-4 nx:-translate-y-1/2 nx:text-muted-foreground"
          />
          <Input
            aria-label="Search invoices"
            type="search"
            size="sm"
            placeholder="Search customer or invoice…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="nx:h-(--nx-spacing-8) nx:ps-9"
          />
        </div>
        <InvoiceChoiceFilter
          label="Status"
          options={statuses}
          value={applied.statuses}
          onChange={(statuses) => setApplied({ ...applied, statuses })}
        />
        <InvoiceChoiceFilter
          label="Country"
          options={countries}
          value={applied.countries}
          onChange={(countries) => setApplied({ ...applied, countries })}
        />
        {hasFilters && (
          <Button
            className="nx:h-(--nx-spacing-8)"
            size="sm"
            variant="ghost"
            onClick={clear}
          >
            Clear filters
          </Button>
        )}
      </div>
      <div className="nx:grid nx:gap-3">
        <p
          role="status"
          aria-label="Invoice count"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          {rows.length} of {invoices.length} invoices
        </p>
        <div className="nx:min-w-0 nx:rounded-base nx:border nx:border-border-default">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead className="nx:text-end">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="nx:typography-label-default">
                      {invoice.customer}
                    </div>
                    <div className="nx:typography-body-small nx:text-muted-foreground">
                      {countryLabel(invoice.country)}
                    </div>
                  </TableCell>
                  <TableCell className="nx:text-muted-foreground">
                    {invoice.id}
                  </TableCell>
                  <TableCell>
                    <span className="nx:inline-flex nx:items-center nx:gap-2">
                      <span
                        aria-hidden="true"
                        className="nx:size-1.5 nx:rounded-full nx:bg-current"
                      />
                      {statusLabel(invoice.status)}
                    </span>
                  </TableCell>
                  <TableCell className="nx:whitespace-nowrap nx:text-muted-foreground">
                    {invoice.date}
                  </TableCell>
                  <TableCell className="nx:whitespace-nowrap nx:text-end nx:tabular-nums">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(invoice.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!rows.length && (
            <div className="nx:grid nx:justify-items-center nx:gap-2 nx:px-4 nx:py-10">
              <h3 className="nx:typography-label-default">No invoices found</h3>
              <p className="nx:text-muted-foreground">
                Try another search or remove a filter.
              </p>
              <Button
                className="nx:h-(--nx-spacing-8)"
                variant="outline"
                size="sm"
                onClick={reset}
              >
                Reset search and filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
