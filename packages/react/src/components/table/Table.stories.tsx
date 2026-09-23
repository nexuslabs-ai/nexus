import { type ReactNode, useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import {
  IconAlertCircle,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconSearch,
} from '../../lib/icons';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Hide } from '../hide';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../input-group';
import { Show } from '../show';
import { Skeleton } from '../skeleton';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  type TableProps,
  TableRow,
  TableRowHeader,
  TableSelectionCell,
  TableSelectionHead,
} from './table';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

const rawTextSizeSentinelClass = ['nx', 'text-xs'].join(':');
const densityCellSelector = (density: string) =>
  `[data-slot="table"][data-table-density="${density}"] [data-slot="table-cell"]`;

// Representative fixture: a list of invoices with status, payment method, and
// amount — the shape a real billing table renders.
const invoices = [
  {
    invoice: 'INV001',
    status: 'Paid',
    method: 'Credit Card',
    amount: '$250.00',
  },
  { invoice: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  {
    invoice: 'INV003',
    status: 'Unpaid',
    method: 'Bank Transfer',
    amount: '$350.00',
  },
  {
    invoice: 'INV004',
    status: 'Paid',
    method: 'Credit Card',
    amount: '$450.00',
  },
  { invoice: 'INV005', status: 'Paid', method: 'PayPal', amount: '$550.00' },
];

// ============================================
// BASIC STORIES
// ============================================

// A basic data table: caption, column headers, and rows of cells. The amount
// column is right-aligned, as numeric columns usually are.
export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row) => (
          <TableRow key={row.invoice}>
            <TableCell className="nx:font-medium">{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell className="nx:text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// A footer holds a summary row — here, the total across all invoices. The
// muted fill and medium weight set it apart from the data rows.
export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row) => (
          <TableRow key={row.invoice}>
            <TableCell className="nx:font-medium">{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell className="nx:text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="nx:text-right">$1,750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

const selectionInvoices = invoices.map((row) => ({ ...row, id: row.invoice }));
const stickySelectionInvoices = Array.from({ length: 3 }, (_, page) =>
  invoices.map((row) => ({
    ...row,
    id: `${row.invoice}-${page + 1}`,
  }))
).flat();

interface SelectionTableDemoProps extends TableProps {
  rows?: typeof selectionInvoices;
  disabled?: boolean;
}

function SelectionTableDemo({
  rows = selectionInvoices,
  disabled = false,
  ...props
}: SelectionTableDemoProps) {
  const [selected, setSelected] = useState(
    () =>
      new Set(
        disabled
          ? []
          : rows
              .slice(0, 3)
              .filter((_, i) => i !== 1)
              .map((row) => row.id)
      )
  );
  const allSelected = rows.length > 0 && selected.size === rows.length;
  const checked = allSelected
    ? true
    : selected.size > 0
      ? 'indeterminate'
      : false;

  function toggleAll(value: boolean | 'indeterminate') {
    setSelected(
      value === true ? new Set(rows.map((row) => row.id)) : new Set()
    );
  }

  function toggleRow(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Table {...props}>
      <TableCaption>Recent invoices with row selection.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableSelectionHead>
            <Checkbox
              checked={checked}
              onCheckedChange={toggleAll}
              disabled={disabled || rows.length === 0}
              aria-label="Select all rows"
            />
          </TableSelectionHead>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4}>No invoices yet.</TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={selected.has(row.id) ? 'selected' : undefined}
            >
              <TableSelectionCell>
                <Checkbox
                  checked={selected.has(row.id)}
                  onCheckedChange={() => toggleRow(row.id)}
                  disabled={disabled}
                  aria-label={`Select ${row.id}`}
                />
              </TableSelectionCell>
              <TableRowHeader>{row.id}</TableRowHeader>
              <TableCell>{row.status}</TableCell>
              <TableCell className="nx:text-right nx:tabular-nums">
                {row.amount}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export const SelectableRows: Story = {
  render: () => <SelectionTableDemo selectable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('checkbox', { name: 'Select INV001' });
    const second = canvas.getByRole('checkbox', { name: 'Select INV002' });
    const header = canvas.getByRole('checkbox', { name: 'Select all rows' });
    await expect(first).toBeChecked();
    await expect(second).not.toBeChecked();
    await expect(header).toHaveAttribute('aria-checked', 'mixed');
    await expect(first.parentElement).toHaveStyle({ position: 'absolute' });
    if (
      matchMedia(
        '(hover: hover) and (pointer: fine) and (not (any-pointer: coarse))'
      ).matches
    ) {
      await expect(second.parentElement).toHaveStyle({ opacity: '0' });
    }
    await userEvent.click(second);
    await expect(second).toBeChecked();
    await expect(second.closest('tr')).toHaveAttribute(
      'data-state',
      'selected'
    );
    await userEvent.click(header);
    await expect(header).toBeChecked();
    await expect(
      canvasElement.querySelectorAll('tbody tr[data-state=selected]')
    ).toHaveLength(invoices.length);
    await userEvent.click(header);
    await expect(header).not.toBeChecked();
    await expect(
      canvasElement.querySelectorAll('tbody tr[data-state=selected]')
    ).toHaveLength(0);
  },
};

export const SelectionKeyboardInteraction: Story = {
  render: SelectableRows.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.querySelector(
      '[data-slot="table-container"]'
    );
    const header = canvas.getByRole('checkbox', { name: 'Select all rows' });
    const first = canvas.getByRole('checkbox', { name: 'Select INV001' });
    await userEvent.tab();
    await expect(container).toHaveFocus();
    await userEvent.tab();
    await expect(header).toHaveFocus();
    await userEvent.tab();
    await expect(first).toHaveFocus();
    await expect(first.parentElement).toHaveStyle({ opacity: '1' });
    await expect(first.parentElement).toHaveStyle({ transitionDuration: '0s' });
    await userEvent.keyboard(' ');
    await expect(first).not.toBeChecked();
    await expect(first.closest('tr')).not.toHaveAttribute('data-state');
    await userEvent.tab();
    const second = canvas.getByRole('checkbox', { name: 'Select INV002' });
    await expect(second).toHaveFocus();
    await expect(second.parentElement).toHaveStyle({
      opacity: '1',
      transitionDuration: '0s',
    });
    await userEvent.keyboard(' ');
    await expect(second).toBeChecked();
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    await expect(header).toHaveFocus();
  },
};

export const SelectionNarrowContainer: Story = {
  render: () => (
    <div className="nx:w-80">
      <SelectionTableDemo selectable />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('checkbox', {
      name: 'Select INV002',
    });
    await expect(control.parentElement).toHaveStyle({
      position: 'static',
      opacity: '1',
    });
  },
};

export const SelectionInlineFallback: Story = {
  render: () => <SelectionTableDemo />,
  play: SelectionNarrowContainer.play,
};

export const SelectionDisabled: Story = {
  render: () => <SelectionTableDemo selectable disabled />,
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('checkbox', {
      name: 'Select INV001',
    });
    await expect(control).toBeDisabled();
    await userEvent.click(control);
    await expect(control).not.toBeChecked();
    await expect(control.closest('tr')).not.toHaveAttribute('data-state');
  },
};

export const SelectionEmpty: Story = {
  render: () => <SelectionTableDemo selectable rows={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('checkbox', { name: 'Select all rows' });
    await expect(control).toBeDisabled();
    await expect(control).not.toBeChecked();
    await expect(canvas.getByText('No invoices yet.')).toBeVisible();
  },
};

export const SelectionLayoutMatrix: Story = {
  render: () => (
    <div className="nx:w-full nx:space-y-6">
      {(['ltr', 'rtl'] as const).map((dir) =>
        (['default', 'borderless', 'grid'] as const).map((variant) =>
          (['comfortable', 'compact'] as const).map((density) => (
            <div
              key={`${dir}-${variant}-${density}`}
              dir={dir}
              className="nx:w-full nx:overflow-hidden nx:border-default nx:border-border-default"
            >
              <SelectionTableDemo
                selectable
                variant={variant}
                density={density}
                striped
              />
            </div>
          ))
        )
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const containers = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="table-container"]'
    );
    await expect(containers).toHaveLength(12);
    for (const container of containers) {
      await expect(
        parseFloat(getComputedStyle(container).paddingInlineStart)
      ).toBeGreaterThan(0);
      const cells = container.querySelectorAll<HTMLElement>(
        '[data-table-selection-part]'
      );
      for (const cell of cells) {
        const control = cell.querySelector<HTMLElement>('[role="checkbox"]');
        if (!control) throw new Error('Selection control missing');
        await expect(control.parentElement).toHaveStyle({
          position: 'absolute',
        });
        await expect(cell.getBoundingClientRect().width).toBeLessThanOrEqual(1);
        const bounds = container.getBoundingClientRect();
        const box = control.getBoundingClientRect();
        await expect(box.left).toBeGreaterThanOrEqual(bounds.left + 4);
        await expect(box.right).toBeLessThanOrEqual(bounds.right - 4);
      }
    }
  },
};

export const SelectionDataAttributes: Story = {
  render: () => <SelectionTableDemo selectable />,
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('checkbox', {
      name: 'Select INV001',
    });
    await expect(control.closest('td')).toHaveAttribute(
      'data-slot',
      'table-selection-cell'
    );
    await expect(
      canvasElement.querySelector('[data-slot="table-selection-head"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="table-selection-container"]')
    ).toBeInTheDocument();
  },
};

// The selection column separator is a logical border. A physical `border-r-0`
// alongside it would win the cascade in LTR only, silently dropping the rule.
export const SelectionGridSeparator: Story = {
  render: () => (
    <div className="nx:w-full nx:space-y-6">
      {(['ltr', 'rtl'] as const).map((dir) => (
        <div key={dir} dir={dir} className="nx:w-full">
          <SelectionTableDemo variant="grid" />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cells = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="table-selection-cell"], [data-slot="table-selection-head"]'
    );
    await expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      const style = getComputedStyle(cell);
      await expect(parseFloat(style.borderInlineEndWidth)).toBeGreaterThan(0);
      // A physical `pr-0` beside the logical `pe-*` would zero this in LTR only.
      await expect(parseFloat(style.paddingInlineEnd)).toBe(
        parseFloat(style.paddingInlineStart)
      );
    }
  },
};

// Without `selectable` the gutter rule never matches, so container padding set
// through containerClassName survives on both sides.
export const SelectionFallbackKeepsContainerPadding: Story = {
  render: () => <SelectionTableDemo containerClassName="nx:px-3" />,
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector<HTMLElement>(
      '[data-slot="table-container"]'
    );
    if (!container) throw new Error('Table container missing');
    const style = getComputedStyle(container);
    await expect(parseFloat(style.paddingInlineStart)).toBeGreaterThan(0);
    await expect(parseFloat(style.paddingInlineStart)).toBe(
      parseFloat(style.paddingInlineEnd)
    );
  },
};

// A trailing actions column with per-row controls. Text buttons carry their own
// accessible names; a real app would wire these to edit/delete handlers.
export const WithActions: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 3).map((row) => (
          <TableRow key={row.invoice}>
            <TableCell className="nx:font-medium">{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>
              <div className="nx:flex nx:justify-end nx:gap-2">
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ============================================
// ATTRIBUTE TEST
// ============================================

export const WithDataAttributes: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV001</TableCell>
          <TableCell>$250.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector(
      '[data-slot="table-container"]'
    );
    const table = canvasElement.querySelector('[data-slot="table"]');

    await expect(container).toBeInTheDocument();
    await expect(table?.tagName).toBe('TABLE');

    // Every structural part carries its own data-slot hook.
    for (const slot of [
      'table-header',
      'table-body',
      'table-row',
      'table-head',
      'table-cell',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// The three border variants across the full anatomy — muted headers, a selected
// row, and a footer totals row — at the default comfortable density.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      {(['default', 'borderless', 'grid'] as const).map((variant) => (
        <Table key={variant} variant={variant}>
          <TableCaption>{variant}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="nx:text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.slice(0, 3).map((row, i) => (
              <TableRow
                key={row.invoice}
                data-state={i === 1 ? 'selected' : undefined}
              >
                <TableCell className="nx:font-medium">{row.invoice}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell className="nx:text-right">{row.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="nx:text-right">$750.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      ))}
    </div>
  ),
};

// Regression sentinel: each typography-bearing slot carries its canonical
// `nx:typography-*` composite and no longer the raw utility it replaced.
export const TokenizedTypography: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV001</TableCell>
          <TableCell className="nx:text-right">$250.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="nx:text-right">$250.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('[data-slot="table"]');
    const caption = canvasElement.querySelector('[data-slot="table-caption"]');
    const head = canvasElement.querySelector('[data-slot="table-head"]');
    const footer = canvasElement.querySelector('[data-slot="table-footer"]');

    await expect(table).toBeInTheDocument();
    await expect(table).toHaveClass('nx:typography-body-default');

    await expect(caption).toBeInTheDocument();
    await expect(caption).toHaveClass('nx:typography-body-small');

    await expect(head).toBeInTheDocument();
    await expect(head).toHaveClass('nx:typography-label-default');
    await expect(head).not.toHaveClass('nx:font-medium');

    await expect(footer).toBeInTheDocument();
    await expect(footer).toHaveClass('nx:typography-label-default');
    await expect(footer).not.toHaveClass('nx:font-medium');
  },
};

export const RawTextSizeReset: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Regression sentinel: a runtime raw named text-size utility no longer applies font-size, while a typography composite still resolves its intended size.',
      },
    },
  },
  render: () => (
    <div style={{ fontSize: '18px' }}>
      <span data-testid="raw-text-size" className={rawTextSizeSentinelClass}>
        Raw text size
      </span>
      <span
        data-testid="typography-composite"
        className="nx:typography-body-small"
      >
        Typography composite
      </span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await document.fonts.ready;

    const raw = canvasElement.querySelector<HTMLElement>(
      '[data-testid="raw-text-size"]'
    );
    const composite = canvasElement.querySelector<HTMLElement>(
      '[data-testid="typography-composite"]'
    );

    if (!raw || !composite) {
      throw new Error('Raw text-size reset sentinel elements are missing');
    }

    await expect(getComputedStyle(raw).fontSize).toBe('18px');
    await expect(getComputedStyle(composite).fontSize).toBe('12px');
  },
};

// Keyboard access for the horizontal scroll region: with no focusable cells, the
// container itself takes focus so a wide table can be scrolled into view.
export const ScrollRegionFocus: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row) => (
          <TableRow key={row.invoice}>
            <TableCell>{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell className="nx:text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector(
      '[data-slot="table-container"]'
    );

    await expect(container).toBeInTheDocument();
    await expect(container).toHaveAttribute('tabindex', '0');
    await expect(container).toHaveClass(
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );

    // The container is the only focusable element, so the first Tab lands on it.
    await userEvent.tab();
    await expect(container).toHaveFocus();
  },
};

// Column headers default to scope="col"; the row's identifying cell uses
// <TableRowHeader> (scope="row") so each row gets an accessible name. The blank
// top-left corner opts out with scope={undefined}.
export const SemanticScope: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope={undefined}>
            <span className="nx:sr-only">Invoice</span>
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row) => (
          <TableRow key={row.invoice}>
            <TableRowHeader>{row.invoice}</TableRowHeader>
            <TableCell>{row.status}</TableCell>
            <TableCell className="nx:text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const heads = canvasElement.querySelectorAll('[data-slot="table-head"]');
    const corner = heads[0];
    const columnHead = heads[1];
    const rowHeader = canvasElement.querySelector(
      '[data-slot="table-row-header"]'
    );

    // Column header defaults to scope="col".
    await expect(columnHead).toHaveAttribute('scope', 'col');
    // The blank corner drops scope via scope={undefined}.
    await expect(corner).not.toHaveAttribute('scope');
    // The row's identifying cell is a real <th scope="row">.
    await expect(rowHeader).toBeInTheDocument();
    await expect(rowHeader).toHaveProperty('tagName', 'TH');
    await expect(rowHeader).toHaveAttribute('scope', 'row');
  },
};

// A sorted column reads as active: TableHead emphasizes its text (muted to
// foreground) when it carries aria-sort="ascending"/"descending", but not for a
// merely-sortable "none". The interactive sort control is a recipe.
export const AriaSortIndicator: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead aria-sort="ascending">Invoice</TableHead>
          <TableHead aria-sort="none">Status</TableHead>
          <TableHead aria-sort="descending" className="nx:text-right">
            Amount
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableRowHeader>INV001</TableRowHeader>
          <TableCell>Paid</TableCell>
          <TableCell className="nx:text-right">$250.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const asc = canvasElement.querySelector('[aria-sort="ascending"]');
    const none = canvasElement.querySelector('[aria-sort="none"]');
    const desc = canvasElement.querySelector('[aria-sort="descending"]');

    // aria-sort carries only valid values — never asc/desc.
    await expect(asc).toBeInTheDocument();
    await expect(none).toBeInTheDocument();
    await expect(desc).toBeInTheDocument();

    await expect(asc).toHaveClass(
      'nx:[&[aria-sort=ascending]]:text-foreground'
    );
    await expect(desc).toHaveClass(
      'nx:[&[aria-sort=descending]]:text-foreground'
    );
  },
};

// Zebra striping tints alternating body rows. Selection and hover beat the
// stripe — a selected even row shows the selection tint, not the stripe.
export const Striped: Story = {
  render: () => (
    <Table striped>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 4).map((row, i) => (
          <TableRow
            key={row.invoice}
            data-state={i === 1 ? 'selected' : undefined}
          >
            <TableRowHeader>{row.invoice}</TableRowHeader>
            <TableCell>{row.status}</TableCell>
            <TableCell className="nx:text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('[data-slot="table"]');
    const rows = canvasElement.querySelectorAll(
      'tbody [data-slot="table-row"]'
    );
    const bg = (el: Element) => getComputedStyle(el).backgroundColor;
    const TRANSPARENT = 'rgba(0, 0, 0, 0)';

    await expect(table).toHaveAttribute('data-striped');
    await expect(rows).toHaveLength(4);

    // Even (unselected) rows are tinted; odd rows are bare.
    await expect(bg(rows[3] as Element)).not.toBe(TRANSPARENT); // even, striped
    await expect(bg(rows[0] as Element)).toBe(TRANSPARENT); // odd, no stripe
    // Precondition for selection-beats-stripe: the even row is marked selected,
    // which the zebra selector excludes ([data-state=selected]).
    await expect(rows[1] as Element).toHaveAttribute('data-state', 'selected');
  },
};

// The three border treatments: `borderless` drops the internal rules (Stripe /
// Linear feel), `default` keeps softened row rules + a header underline, and
// `grid` adds column rules for a full cell grid (Notion).
export const Borderless: Story = {
  render: () => (
    <Table variant="borderless">
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 3).map((row) => (
          <TableRow key={row.invoice}>
            <TableCell>{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell className="nx:text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('[data-slot="table"]');
    const row = canvasElement.querySelector('[data-slot="table-row"]');

    await expect(table).toHaveAttribute('data-variant', 'borderless');
    await expect(row).not.toHaveClass('nx:border-b-default');
  },
};

// A full cell grid — row rules plus column rules — for spreadsheet-style data.
export const Grid: Story = {
  render: () => (
    <Table variant="grid">
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 3).map((row) => (
          <TableRow key={row.invoice}>
            <TableCell>{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell className="nx:text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('[data-slot="table"]');
    const row = canvasElement.querySelector('[data-slot="table-row"]');
    const cell = canvasElement.querySelector('[data-slot="table-cell"]');

    await expect(table).toHaveAttribute('data-variant', 'grid');
    await expect(row).toHaveClass(
      'nx:border-b-default',
      'nx:border-border-default-alpha'
    );
    await expect(
      parseFloat(getComputedStyle(cell as Element).borderInlineEndWidth)
    ).toBeGreaterThan(0);
  },
};

// Row density. `comfortable` (the default) gives roomier ~44px rows; `compact`
// tightens to ~36px for dense data.
export const Density: Story = {
  render: () => (
    <div data-density="compact" className="nx:flex nx:flex-col nx:gap-6">
      {(['comfortable', 'compact'] as const).map((density) => (
        <Table key={density} density={density}>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead className="nx:text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.slice(0, 2).map((row) => (
              <TableRow key={row.invoice}>
                <TableCell>{row.invoice}</TableCell>
                <TableCell className="nx:text-right">{row.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const comfyTable = canvasElement.querySelector(
      '[data-slot="table"][data-table-density="comfortable"]'
    );
    const compactTable = canvasElement.querySelector(
      '[data-slot="table"][data-table-density="compact"]'
    );
    const comfyCell = canvasElement.querySelector(
      densityCellSelector('comfortable')
    );
    const compactCell = canvasElement.querySelector(
      densityCellSelector('compact')
    );

    await expect(comfyTable).toBeInTheDocument();
    await expect(comfyTable).not.toHaveAttribute('data-density');
    await expect(compactTable).toBeInTheDocument();
    await expect(compactTable).not.toHaveAttribute('data-density');
    await expect(comfyCell).toBeInTheDocument();
    await expect(comfyCell).toHaveClass('nx:py-3');
    await expect(compactCell).toBeInTheDocument();
    await expect(compactCell).toHaveClass('nx:py-2');
  },
};

// A pinned header: the body scrolls within a height-capped container while the
// column headers stay visible.
export const StickyHeader: Story = {
  render: () => (
    <Table stickyHeader containerClassName="nx:max-h-64">
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...invoices, ...invoices, ...invoices].map((row, i) => (
          <TableRow key={`${row.invoice}-${i}`}>
            <TableCell>{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell className="nx:text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('[data-slot="table"]');
    const header = canvasElement.querySelector('[data-slot="table-header"]');
    const head = canvasElement.querySelector('[data-slot="table-head"]');

    await expect(table).toHaveAttribute('data-sticky-header', 'true');
    await expect(header).toBeInTheDocument();
    await expect(head).toBeInTheDocument();
    await expect(head).toHaveClass('nx:sticky', 'nx:top-0', 'nx:bg-container');
    await expect(getComputedStyle(head as Element).position).toBe('sticky');
  },
};

export const StickyHeaderWithSelection: Story = {
  render: () => (
    <SelectionTableDemo
      selectable
      stickyHeader
      rows={stickySelectionInvoices}
      containerClassName="nx:max-h-64"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('checkbox', { name: 'Select INV001-1' });
    const copy = canvas.getByRole('checkbox', { name: 'Select INV001-2' });
    const header = canvas.getByRole('checkbox', { name: 'Select all rows' });
    await expect(first).toBeChecked();
    await expect(copy).not.toBeChecked();
    await userEvent.click(first);
    await expect(first).not.toBeChecked();
    await expect(copy).not.toBeChecked();
    await userEvent.click(header);
    await expect(
      canvasElement.querySelectorAll('tbody tr[data-state=selected]')
    ).toHaveLength(stickySelectionInvoices.length);
    const head = header.closest('th');
    if (!head) throw new Error('Selection header missing');
    await expect(getComputedStyle(head).position).toBe('sticky');
    const container = canvasElement.querySelector<HTMLElement>(
      '[data-slot="table-container"]'
    );
    if (!container) throw new Error('Selection scroll container missing');
    const top = head.getBoundingClientRect().top;
    container.scrollTop = 100;
    await expect(head.getBoundingClientRect().top).toBe(top);
  },
};

// ============================================
// RECIPES — patterns a consumer composes; zero added to the published bundle
// ============================================

// Numeric columns right-align and use tabular figures so digits line up by place
// value. Apply `nx:text-right nx:tabular-nums` to the header and its cells.
export const NumericColumn: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead className="nx:text-right nx:tabular-nums">
            Amount
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row) => (
          <TableRow key={row.invoice}>
            <TableRowHeader>{row.invoice}</TableRowHeader>
            <TableCell className="nx:text-right nx:tabular-nums">
              {row.amount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// Cells default to nowrap. To clip overflow with an ellipsis, wrap the content in
// a width-bounded `nx:truncate` box — truncate is inert without a constrained
// width (table-layout is auto), so the box, not the cell, sets the bound.
export const TruncatedCells: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Note</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableRowHeader>INV001</TableRowHeader>
          <TableCell>
            <div className="nx:max-w-[16ch] nx:truncate">
              A long memo that exceeds the cell width and must be clipped
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const clip = canvasElement.querySelector('[data-slot="table-cell"] div');
    await expect(clip).toBeInTheDocument();
    // The text genuinely overflows its box — proves real clipping, not just the class.
    await expect((clip as Element).scrollWidth).toBeGreaterThan(
      (clip as Element).clientWidth
    );
  },
};

// Pin a column during horizontal scroll with data-sticky + sticky utilities. The
// row carries an opaque surface bg and the sticky cell uses `nx:bg-inherit`, so
// the pinned cell tracks the row's hover/selected/stripe state instead of a flat
// fill that would mismatch on a tinted row.
export const StickyColumn: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow className="nx:bg-background">
          <TableHead
            data-sticky="start"
            className="nx:sticky nx:left-0 nx:z-10 nx:bg-inherit"
          >
            Invoice
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row, i) => (
          <TableRow
            key={row.invoice}
            className="nx:bg-background"
            data-state={i === 0 ? 'selected' : undefined}
          >
            <TableRowHeader
              data-sticky="start"
              className="nx:sticky nx:left-0 nx:z-10 nx:bg-inherit"
            >
              {row.invoice}
            </TableRowHeader>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell className="nx:text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const selectedRow = canvasElement.querySelector(
      'tbody [data-slot="table-row"][data-state="selected"]'
    );
    const stickyCell = selectedRow?.querySelector('[data-sticky="start"]');

    await expect(stickyCell).toBeInTheDocument();
    // The column is actually pinned.
    await expect(getComputedStyle(stickyCell as Element).position).toBe(
      'sticky'
    );
    // bg-inherit makes the sticky cell resolve to its row's bg — the selection
    // tint here, not a flat fill that would show a mismatched stripe.
    await expect(getComputedStyle(stickyCell as Element).backgroundColor).toBe(
      getComputedStyle(selectedRow as Element).backgroundColor
    );
  },
};

// Drop low-priority columns on a narrow container. Apply a container-query hide
// (`nx:@max-md:hidden`) to BOTH the column's header and its cells, so the column
// vanishes cleanly instead of leaving a gap. Drive it off `@container` (the
// table's own width), not the viewport.
export const ColumnPriority: Story = {
  render: () => (
    <div className="nx:@container nx:w-[20rem]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead className="nx:@max-md:hidden">Method</TableHead>
            <TableHead className="nx:text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.slice(0, 3).map((row) => (
            <TableRow key={row.invoice}>
              <TableRowHeader>{row.invoice}</TableRowHeader>
              <TableCell className="nx:@max-md:hidden">{row.method}</TableCell>
              <TableCell className="nx:text-right">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const heads = canvasElement.querySelectorAll('[data-slot="table-head"]');
    const methodHead = heads[1]; // the @max-md:hidden Method column header
    await expect(methodHead).toBeInTheDocument();
    // At a 20rem container (< md) the low-priority column is hidden.
    await expect(getComputedStyle(methodHead as Element).display).toBe('none');
  },
};

// `bleed`: let the scroll area run flush to the edge on a narrow screen via a
// single `--gutter` var on the container — negative margin out, padding back in.
export const Bleed: Story = {
  render: () => (
    <Table containerClassName="nx:[--gutter:1rem] nx:-mx-(--gutter) nx:px-(--gutter)">
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 3).map((row) => (
          <TableRow key={row.invoice}>
            <TableRowHeader>{row.invoice}</TableRowHeader>
            <TableCell>{row.status}</TableCell>
            <TableCell className="nx:text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// Sortable header: a <button> in the <th>, with aria-sort mapped from the app's
// sort state to the valid ascending/descending/none values (never the 'asc'/'desc'
// a sort lib returns). The chevron is aria-hidden; sort logic stays the consumer's
// (a local useState here; TanStack Table in production).
function SortableHeaderDemo() {
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const ariaSort = sort === 'asc' ? 'ascending' : 'descending';
  const Icon = sort === 'asc' ? IconChevronUp : IconChevronDown;
  const rows = [...invoices].sort((a, b) =>
    sort === 'asc'
      ? a.amount.localeCompare(b.amount)
      : b.amount.localeCompare(a.amount)
  );
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead aria-sort={ariaSort} className="nx:text-right">
            <button
              type="button"
              onClick={() => setSort((s) => (s === 'asc' ? 'desc' : 'asc'))}
              className="nx:ml-auto nx:inline-flex nx:items-center nx:gap-1 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
            >
              Amount
              <Icon className="nx:size-4" aria-hidden />
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.invoice}>
            <TableRowHeader>{row.invoice}</TableRowHeader>
            <TableCell className="nx:text-right nx:tabular-nums">
              {row.amount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const SortableHeader: Story = {
  render: () => <SortableHeaderDemo />,
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector('[aria-sort]');
    const button = canvasElement.querySelector('th button');
    // aria-sort carries the valid token, never the lib's 'asc'/'desc'.
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(button as Element);
    await expect(header).toHaveAttribute('aria-sort', 'descending');
  },
};

// Multi-select with a partial-state header checkbox and a bulk-action bar that
// appears on selection. Select-all toggles every row; the header checkbox reads
// indeterminate while the selection is partial. Selection state is local here;
// in production it's TanStack Table's row-selection model.
function SelectionDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLButtonElement>(null);
  const allSelected = selected.size === invoices.length;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(invoices.map((r) => r.invoice))
    );
  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  function clearSelection() {
    setSelected(new Set());
    selectAllRef.current?.focus();
  }
  return (
    <div className="nx:w-full nx:space-y-2">
      <div role="status" className="nx:sr-only">
        {selected.size > 0
          ? `${selected.size} selected`
          : 'No invoices selected'}
      </div>
      {selected.size > 0 && (
        <div className="nx:flex nx:items-center nx:gap-3 nx:rounded-md nx:bg-muted nx:px-3 nx:py-2 nx:typography-label-default">
          <span>{selected.size} selected</span>
          <Button size="sm" variant="secondary">
            Export
          </Button>
          <Button size="sm" variant="destructive">
            Delete
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelection}
            aria-label="Clear selection"
          >
            Clear
          </Button>
        </div>
      )}
      <Table selectable>
        <TableHeader>
          <TableRow>
            <TableSelectionHead>
              <Checkbox
                ref={selectAllRef}
                checked={
                  allSelected ? true : someSelected ? 'indeterminate' : false
                }
                onCheckedChange={toggleAll}
                aria-label="Select all rows"
              />
            </TableSelectionHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((row) => (
            <TableRow
              key={row.invoice}
              data-state={selected.has(row.invoice) ? 'selected' : undefined}
            >
              <TableSelectionCell>
                <Checkbox
                  checked={selected.has(row.invoice)}
                  onCheckedChange={() => toggleRow(row.invoice)}
                  aria-label={`Select ${row.invoice}`}
                />
              </TableSelectionCell>
              <TableRowHeader>{row.invoice}</TableRowHeader>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const SelectionWithBulkActions: Story = {
  render: () => <SelectionDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole('checkbox', { name: 'Select all rows' });
    await userEvent.click(selectAll);
    // Select-all selects every row and reveals the bulk-action bar.
    const selectedRows = canvasElement.querySelectorAll(
      'tbody [data-slot="table-row"][data-state="selected"]'
    );
    await expect(selectedRows).toHaveLength(invoices.length);
    await expect(canvasElement).toHaveTextContent(
      `${invoices.length} selected`
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      `${invoices.length} selected`
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear selection' })
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'No invoices selected'
    );
    await expect(selectAll).toHaveFocus();
    await expect(selectAll).not.toBeChecked();
  },
};

// Whole-row link: an <a> in the row header whose absolutely-positioned ::after
// covers the positioned row, so a click anywhere on the row follows the link —
// without nesting other interactive controls under the overlay.
export const RowLink: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 3).map((row) => (
          <TableRow
            key={row.invoice}
            className="nx:relative nx:hover:bg-background-hover nx:focus-within:bg-background-hover"
          >
            <TableRowHeader>
              <a
                href={`#/invoices/${row.invoice}`}
                className="nx:after:absolute nx:after:inset-0 nx:after:content-[''] nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
              >
                {row.invoice}
              </a>
            </TableRowHeader>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector('a[href^="#/invoices/"]');
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAccessibleName('INV001');
    // after:content-[''] is required for ::after to generate a box at all.
    const overlay = getComputedStyle(link as Element, '::after');
    await expect(overlay.content).not.toBe('none');
    await expect(overlay.position).toBe('absolute');
  },
};

// Stacked cards on a narrow screen. Rather than restyle tr/td to display:block
// (which strips <table> semantics for screen readers and would need ARIA grid
// roles re-applied), swap structures by container width: a real <table> when
// roomy, a real card list when narrow. Each is correct on its own; neither
// relies on display:block. (Shown here at a fixed 20rem container = card state.)
export const StackedCard: Story = {
  render: () => (
    <div className="nx:@container nx:w-[20rem]">
      <Hide as="div" containerBelow="sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="nx:text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.slice(0, 3).map((row) => (
              <TableRow key={row.invoice}>
                <TableRowHeader>{row.invoice}</TableRowHeader>
                <TableCell>{row.status}</TableCell>
                <TableCell className="nx:text-right nx:tabular-nums">
                  {row.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Hide>
      <Show as="div" containerBelow="sm">
        <ul className="nx:flex nx:flex-col nx:gap-2">
          {invoices.slice(0, 3).map((row) => (
            <li
              key={row.invoice}
              className="nx:space-y-1 nx:rounded-md nx:border-default nx:border-border-default-alpha nx:p-3"
            >
              <div className="nx:flex nx:justify-between">
                <span className="nx:text-muted-foreground">Invoice</span>
                <span className="nx:font-medium">{row.invoice}</span>
              </div>
              <div className="nx:flex nx:justify-between">
                <span className="nx:text-muted-foreground">Status</span>
                <span>{row.status}</span>
              </div>
              <div className="nx:flex nx:justify-between">
                <span className="nx:text-muted-foreground">Amount</span>
                <span className="nx:tabular-nums">{row.amount}</span>
              </div>
            </li>
          ))}
        </ul>
      </Show>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelector('ul');
    const table = canvasElement.querySelector('[data-slot="table-container"]');
    // At a narrow container the card list shows and the table is hidden — each a
    // correct structure, so table semantics are never stripped by display:block.
    await expect(cards).toBeVisible();
    await expect(table).not.toBeVisible();
  },
};

// An empty body renders cleanly: the header keeps its scope, and a single
// column-spanning row carries the empty-state message. Striping is a no-op here.
export const EmptyState: Story = {
  render: () => (
    <Table striped>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={3}
            className="nx:py-8 nx:text-center nx:text-muted-foreground"
          >
            No invoices yet.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const head = canvasElement.querySelector('[data-slot="table-head"]');
    await expect(head).toHaveAttribute('scope', 'col');
    await expect(
      canvasElement.querySelector('[colspan="3"]')
    ).toBeInTheDocument();
  },
};

// Announce async table changes (sort, filter, load) to screen readers via an
// aria-live region. Debounce the announcement (~750ms) in production so a burst
// of fast updates doesn't flood the buffer; this demo announces immediately.
function LiveRegionDemo() {
  const [dir, setDir] = useState<'ascending' | 'descending'>('ascending');
  const rows = [...invoices.slice(0, 3)].sort((a, b) =>
    dir === 'ascending'
      ? a.amount.localeCompare(b.amount)
      : b.amount.localeCompare(a.amount)
  );
  return (
    <div className="nx:space-y-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          setDir((d) => (d === 'ascending' ? 'descending' : 'ascending'))
        }
      >
        Toggle sort
      </Button>
      <div role="status" aria-live="polite" className="nx:sr-only">
        Sorted by amount, {dir}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead aria-sort={dir} className="nx:text-right">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.invoice}>
              <TableRowHeader>{row.invoice}</TableRowHeader>
              <TableCell className="nx:text-right nx:tabular-nums">
                {row.amount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const LiveRegionAnnouncements: Story = {
  render: () => <LiveRegionDemo />,
  play: async ({ canvasElement }) => {
    const status = canvasElement.querySelector('[role="status"]');
    await expect(status).toHaveTextContent('Sorted by amount, ascending');
    await userEvent.click(canvasElement.querySelector('button') as Element);
    await expect(status).toHaveTextContent('Sorted by amount, descending');
  },
};

// Canonical product-table recipe: filter + sortable header + row selection +
// pagination + empty state, assembled over the Table primitives. State is plain
// useState (TanStack Table in production; see the console adapter note below);
// no @tanstack/react-table dependency enters the package.
interface RecipeRow {
  invoice: string;
  status: string;
  amount: number;
}

const recipeRows: RecipeRow[] = [
  { invoice: 'INV-001', status: 'Paid', amount: 250 },
  { invoice: 'INV-002', status: 'Pending', amount: 150 },
  { invoice: 'INV-003', status: 'Unpaid', amount: 350 },
  { invoice: 'INV-004', status: 'Paid', amount: 450 },
  { invoice: 'INV-005', status: 'Pending', amount: 550 },
  { invoice: 'INV-006', status: 'Paid', amount: 200 },
  { invoice: 'INV-007', status: 'Unpaid', amount: 300 },
];

const RECIPE_PAGE_SIZE = 3;
const formatRecipeAmount = (amount: number) => `$${amount.toFixed(2)}`;
type RecipeSortKey = 'invoice' | 'status' | 'amount';
type RecipeSortDirection = 'ascending' | 'descending';

function compareRecipeRows(
  a: RecipeRow,
  b: RecipeRow,
  key: RecipeSortKey,
  direction: RecipeSortDirection
) {
  const result =
    key === 'amount' ? a.amount - b.amount : a[key].localeCompare(b[key]);

  return direction === 'ascending' ? result : -result;
}

function DataTableRecipeDemo() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  const ariaSort = sort === 'asc' ? 'ascending' : 'descending';
  const SortIcon = sort === 'asc' ? IconChevronUp : IconChevronDown;
  const filtered = recipeRows
    .filter((row) => row.invoice.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) =>
      sort === 'asc' ? a.amount - b.amount : b.amount - a.amount
    );
  const pageCount = Math.max(1, Math.ceil(filtered.length / RECIPE_PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(
    safePage * RECIPE_PAGE_SIZE,
    safePage * RECIPE_PAGE_SIZE + RECIPE_PAGE_SIZE
  );

  function changeQuery(value: string) {
    setQuery(value);
    setPage(0);
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="nx:space-y-4">
      <InputGroup className="nx:max-w-xs">
        <InputGroupAddon>
          <IconSearch />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Filter by invoice..."
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
          aria-label="Filter by invoice"
        />
      </InputGroup>

      <div className="nx:overflow-hidden nx:rounded-md nx:border-default nx:border-border-default">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <span className="nx:sr-only">Select</span>
              </TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead aria-sort={ariaSort} className="nx:text-right">
                <button
                  type="button"
                  onClick={() => setSort((s) => (s === 'asc' ? 'desc' : 'asc'))}
                  className="nx:ml-auto nx:inline-flex nx:items-center nx:gap-1 nx:typography-label-default nx:text-inherit nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
                >
                  Amount
                  <SortIcon className="nx:size-4" aria-hidden />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="nx:py-8 nx:text-center nx:text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => (
                <TableRow
                  key={row.invoice}
                  data-state={
                    selected.has(row.invoice) ? 'selected' : undefined
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(row.invoice)}
                      onCheckedChange={() => toggleRow(row.invoice)}
                      aria-label={`Select ${row.invoice}`}
                    />
                  </TableCell>
                  <TableRowHeader>{row.invoice}</TableRowHeader>
                  <TableCell>{row.status}</TableCell>
                  <TableCell className="nx:text-right nx:tabular-nums">
                    {formatRecipeAmount(row.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
        <p className="nx:text-muted-foreground nx:typography-body-default">
          {selected.size > 0
            ? `${selected.size} of ${filtered.length} row(s) selected.`
            : `${filtered.length} row(s)`}
        </p>
        <div className="nx:flex nx:items-center nx:gap-3">
          <span className="nx:text-muted-foreground nx:typography-label-default">
            Page {safePage + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            aria-label="Previous page"
          >
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            aria-label="Next page"
          >
            <IconChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export const DataTableRecipe: Story = {
  render: () => <DataTableRecipeDemo />,
  play: async ({ canvasElement }) => {
    const filter = canvasElement.querySelector(
      '[aria-label="Filter by invoice"]'
    ) as HTMLInputElement;
    await userEvent.type(filter, 'INV-002');
    await expect(canvasElement).toHaveTextContent('1 row(s)');
    await userEvent.clear(filter);
    await expect(canvasElement).toHaveTextContent('7 row(s)');

    const amountHeader = canvasElement.querySelector('[aria-sort]');
    await expect(amountHeader).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(canvasElement.querySelector('th button') as Element);
    await expect(amountHeader).toHaveAttribute('aria-sort', 'descending');

    await userEvent.click(
      canvasElement.querySelector('tbody [role="checkbox"]') as Element
    );
    await expect(canvasElement).toHaveTextContent('1 of 7 row(s) selected.');
  },
};

interface SortableRecipeHeadProps {
  label: string;
  sortKey: RecipeSortKey;
  activeKey: RecipeSortKey;
  direction: RecipeSortDirection;
  align?: 'left' | 'right';
  onSort: (key: RecipeSortKey) => void;
}

function SortableRecipeHead({
  label,
  sortKey,
  activeKey,
  direction,
  align = 'left',
  onSort,
}: SortableRecipeHeadProps) {
  const isActive = activeKey === sortKey;
  const ariaSort = isActive ? direction : 'none';
  const SortIcon =
    isActive && direction === 'descending' ? IconChevronDown : IconChevronUp;

  return (
    <TableHead
      aria-sort={ariaSort}
      className={align === 'right' ? 'nx:text-right' : undefined}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={[
          'nx:inline-flex nx:items-center nx:gap-1 nx:typography-label-default nx:text-inherit',
          'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
          align === 'right' ? 'nx:ml-auto' : '',
        ].join(' ')}
      >
        {label}
        <SortIcon
          className={isActive ? 'nx:size-4' : 'nx:size-4 nx:opacity-40'}
          aria-hidden
        />
      </button>
    </TableHead>
  );
}

function DataTableSortableHeaderRecipeDemo() {
  const [sortKey, setSortKey] = useState<RecipeSortKey>('invoice');
  const [direction, setDirection] = useState<RecipeSortDirection>('ascending');

  function sortBy(nextKey: RecipeSortKey) {
    if (nextKey !== sortKey) {
      setSortKey(nextKey);
      setDirection('ascending');
      return;
    }

    setDirection((current) =>
      current === 'ascending' ? 'descending' : 'ascending'
    );
  }

  const rows = [...recipeRows].sort((a, b) =>
    compareRecipeRows(a, b, sortKey, direction)
  );

  return (
    <div className="nx:overflow-hidden nx:rounded-md nx:border-default nx:border-border-default">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableRecipeHead
              label="Invoice"
              sortKey="invoice"
              activeKey={sortKey}
              direction={direction}
              onSort={sortBy}
            />
            <SortableRecipeHead
              label="Status"
              sortKey="status"
              activeKey={sortKey}
              direction={direction}
              onSort={sortBy}
            />
            <SortableRecipeHead
              label="Amount"
              sortKey="amount"
              activeKey={sortKey}
              direction={direction}
              align="right"
              onSort={sortBy}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(0, 4).map((row) => (
            <TableRow key={row.invoice}>
              <TableRowHeader>{row.invoice}</TableRowHeader>
              <TableCell>{row.status}</TableCell>
              <TableCell className="nx:text-right nx:tabular-nums">
                {formatRecipeAmount(row.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const DataTableSortableHeaderRecipe: Story = {
  render: () => <DataTableSortableHeaderRecipeDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const invoiceButton = canvas.getByRole('button', { name: /Invoice/ });
    const amountButton = canvas.getByRole('button', { name: /Amount/ });
    const amountHead = amountButton.closest('th');
    const invoiceHead = invoiceButton.closest('th');

    await expect(invoiceHead).toHaveAttribute('aria-sort', 'ascending');

    amountButton.focus();
    await expect(amountButton).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(amountHead).toHaveAttribute('aria-sort', 'ascending');
    await expect(
      canvasElement.querySelector('tbody [data-slot="table-row"]')
    ).toHaveTextContent('INV-002');

    await userEvent.click(amountButton);
    await expect(amountHead).toHaveAttribute('aria-sort', 'descending');
    await expect(
      canvasElement.querySelector('tbody [data-slot="table-row"]')
    ).toHaveTextContent('INV-005');
  },
};

function DataTableSelectionRecipeDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLButtonElement>(null);
  const allSelected = selected.size === recipeRows.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll(checked: boolean | 'indeterminate') {
    setSelected(
      checked === true
        ? new Set(recipeRows.map((row) => row.invoice))
        : new Set()
    );
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    selectAllRef.current?.focus();
  }

  return (
    <div className="nx:space-y-3">
      <div role="status" className="nx:sr-only">
        {selected.size > 0
          ? `${selected.size} selected`
          : 'No invoices selected'}
      </div>
      {selected.size > 0 && (
        <div className="nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-2 nx:rounded-md nx:border-default nx:border-border-default nx:bg-background-hover nx:px-3 nx:py-2">
          <span className="nx:typography-label-default">
            {selected.size} selected
          </span>
          <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Button size="sm" variant="secondary">
              Export
            </Button>
            <Button size="sm" variant="destructive">
              Archive
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              aria-label="Clear selection"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="nx:overflow-hidden nx:rounded-md nx:border-default nx:border-border-default">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? 'indeterminate' : false
                  }
                  onCheckedChange={toggleAll}
                  aria-label="Select all invoices"
                  ref={selectAllRef}
                />
              </TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="nx:text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipeRows.map((row) => (
              <TableRow
                key={row.invoice}
                data-state={selected.has(row.invoice) ? 'selected' : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.has(row.invoice)}
                    onCheckedChange={() => toggleRow(row.invoice)}
                    aria-label={`Select ${row.invoice}`}
                  />
                </TableCell>
                <TableRowHeader>{row.invoice}</TableRowHeader>
                <TableCell>{row.status}</TableCell>
                <TableCell className="nx:text-right nx:tabular-nums">
                  {formatRecipeAmount(row.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export const DataTableSelectionRecipe: Story = {
  render: () => <DataTableSelectionRecipeDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByLabelText('Select all invoices');
    const firstRow = canvas.getByLabelText('Select INV-001');

    await userEvent.click(firstRow);
    await expect(selectAll).toHaveAttribute('data-state', 'indeterminate');
    await expect(canvas.getByRole('status')).toHaveTextContent('1 selected');

    await userEvent.click(selectAll);
    await expect(selectAll).toHaveAttribute('data-state', 'checked');
    await expect(canvas.getByRole('status')).toHaveTextContent('7 selected');
    await expect(
      canvasElement.querySelectorAll(
        'tbody [data-slot="table-row"][data-state="selected"]'
      )
    ).toHaveLength(recipeRows.length);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear selection' })
    );
    await expect(selectAll).toHaveAttribute('data-state', 'unchecked');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'No invoices selected'
    );
    await expect(selectAll).toHaveFocus();
  },
};

interface DataTableStateFrameProps {
  title: string;
  children: ReactNode;
}

function DataTableStateFrame({ title, children }: DataTableStateFrameProps) {
  return (
    <section aria-label={title} className="nx:space-y-2">
      <h3 className="nx:typography-label-default nx:text-muted-foreground">
        {title}
      </h3>
      <div className="nx:overflow-hidden nx:rounded-md nx:border-default nx:border-border-default">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="nx:text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          {children}
        </Table>
      </div>
    </section>
  );
}

function DataTableLoadingRows() {
  return (
    <TableBody aria-busy="true" aria-live="polite">
      {Array.from({ length: 3 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="nx:h-4 nx:w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="nx:h-4 nx:w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="nx:ml-auto nx:h-4 nx:w-20" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

function DataTableErrorRows() {
  const [retried, setRetried] = useState(false);

  return (
    <TableBody>
      <TableRow>
        <TableCell
          colSpan={3}
          className="nx:py-8 nx:text-center nx:text-muted-foreground"
        >
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-3">
            <IconAlertCircle aria-hidden className="nx:size-5" />
            <span>
              {retried ? 'Retry queued.' : 'Could not load invoices.'}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setRetried(true)}
              aria-label="Retry loading invoices"
            >
              Retry
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

function DataTableEmptyRows({ children }: { children: ReactNode }) {
  return (
    <TableBody>
      <TableRow>
        <TableCell
          colSpan={3}
          className="nx:py-8 nx:text-center nx:text-muted-foreground"
        >
          {children}
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

function DataTableStatesRecipeDemo() {
  return (
    <div className="nx:grid nx:gap-4">
      <DataTableStateFrame title="Loading rows">
        <DataTableLoadingRows />
      </DataTableStateFrame>
      <DataTableStateFrame title="Error row">
        <DataTableErrorRows />
      </DataTableStateFrame>
      <DataTableStateFrame title="No data yet">
        <DataTableEmptyRows>No invoices yet.</DataTableEmptyRows>
      </DataTableStateFrame>
      <DataTableStateFrame title="No filtered results">
        <DataTableEmptyRows>
          No invoices match &quot;INV-999&quot;.
        </DataTableEmptyRows>
      </DataTableStateFrame>
    </div>
  );
}

export const DataTableStatesRecipe: Story = {
  render: () => <DataTableStatesRecipeDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loadingSection = canvas.getByLabelText('Loading rows');

    await expect(
      loadingSection.querySelector('[aria-busy="true"]')
    ).toBeInTheDocument();
    await expect(
      loadingSection.querySelectorAll('[data-slot="skeleton"]')
    ).toHaveLength(9);

    await expect(canvas.getByText('Could not load invoices.')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Retry loading invoices' })
    );
    await expect(canvas.getByText('Retry queued.')).toBeVisible();
    await expect(canvas.getByText('No invoices yet.')).toBeVisible();
    await expect(
      canvas.getByText('No invoices match "INV-999".')
    ).toBeVisible();
  },
};

// These recipe stories show the assembled shell, focused sortable headers,
// selection, pagination, and state rows over the Table primitives with plain
// React state. The production version wires TanStack Table over the same markup
// in apps/console/src/components/data-table.tsx; the engine stays a consumer
// dependency, out of the published bundle.
