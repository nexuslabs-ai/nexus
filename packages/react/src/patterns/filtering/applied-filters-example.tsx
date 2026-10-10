import * as React from 'react';

import { Button } from '../../components/button';
import { Checkbox } from '../../components/checkbox';
import { FilterChip } from '../../components/filter-chip';
import { Label } from '../../components/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/popover';

export function AppliedFiltersExample() {
  const [paid, setPaid] = React.useState(true);
  const [india, setIndia] = React.useState(true);
  const filterRef = React.useRef<HTMLButtonElement>(null);
  const paidRef = React.useRef<HTMLButtonElement>(null);
  const indiaRef = React.useRef<HTMLButtonElement>(null);
  const id = React.useId();
  function removePaid() {
    (india ? indiaRef.current : filterRef.current)?.focus();
    setPaid(false);
  }
  function removeIndia() {
    (paid ? paidRef.current : filterRef.current)?.focus();
    setIndia(false);
  }
  return (
    <section
      aria-label="Applied invoice filters"
      className="nx:grid nx:w-full nx:max-w-xl nx:gap-4"
    >
      <div className="nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-3">
        <h2 className="nx:typography-heading-small">Invoice filters</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button ref={filterRef} variant="outline" size="sm">
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent
            aria-label="Choose invoice filters"
            className="nx:grid nx:gap-3"
            align="end"
          >
            <div className="nx:flex nx:items-center nx:gap-2">
              <Checkbox
                id={`${id}-paid`}
                checked={paid}
                onCheckedChange={(checked) => setPaid(checked === true)}
              />
              <Label htmlFor={`${id}-paid`}>Status: Paid</Label>
            </div>
            <div className="nx:flex nx:items-center nx:gap-2">
              <Checkbox
                id={`${id}-india`}
                checked={india}
                onCheckedChange={(checked) => setIndia(checked === true)}
              />
              <Label htmlFor={`${id}-india`}>Country: India</Label>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <p className="nx:typography-body-default nx:text-muted-foreground">
        Choose conditions in Filters. The chips below keep the applied
        conditions visible after the menu closes. Click a chip to remove that
        condition.
      </p>
      <div
        role="group"
        aria-label="Applied filters"
        className="nx:flex nx:flex-wrap nx:items-center nx:gap-2"
      >
        <span className="nx:typography-label-default nx:text-muted-foreground">
          Applied filters:
        </span>
        {paid && (
          <FilterChip
            ref={paidRef}
            aria-label="Remove status filter: Paid"
            onClick={removePaid}
          >
            Status: Paid
          </FilterChip>
        )}
        {india && (
          <FilterChip
            ref={indiaRef}
            aria-label="Remove country filter: India"
            onClick={removeIndia}
          >
            Country: India
          </FilterChip>
        )}
        {!paid && !india && (
          <span className="nx:typography-body-default nx:text-muted-foreground">
            None
          </span>
        )}
      </div>
      <p
        role="status"
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        {paid && india
          ? 'Showing paid invoices from India.'
          : paid
            ? 'Showing paid invoices from all countries.'
            : india
              ? 'Showing invoices with any status from India.'
              : 'Showing invoices with any status from all countries.'}
      </p>
    </section>
  );
}
