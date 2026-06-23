import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from 'storybook/test';

import { Button } from '../button';
import { Checkbox } from '../checkbox';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableRowHeader,
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

// Rows carry a leading checkbox column. Selected rows set
// `data-state="selected"` for the highlight; the header checkbox is
// indeterminate because the selection is partial. Every checkbox has an
// `aria-label` so screen readers announce what it selects.
export const SelectableRows: Story = {
  render: () => {
    const selected = new Set(['INV001', 'INV003']);
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                defaultChecked="indeterminate"
                aria-label="Select all rows"
              />
            </TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="nx:text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((row) => (
            <TableRow
              key={row.invoice}
              data-state={selected.has(row.invoice) ? 'selected' : undefined}
            >
              <TableCell>
                <Checkbox
                  defaultChecked={selected.has(row.invoice)}
                  aria-label={`Select ${row.invoice}`}
                />
              </TableCell>
              <TableCell className="nx:font-medium">{row.invoice}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell className="nx:text-right">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
    await expect(table).not.toHaveClass('nx:text-sm');

    await expect(caption).toBeInTheDocument();
    await expect(caption).toHaveClass('nx:typography-body-small');
    await expect(caption).not.toHaveClass('nx:text-sm');

    await expect(head).toBeInTheDocument();
    await expect(head).toHaveClass('nx:typography-label-default');
    await expect(head).not.toHaveClass('nx:font-medium');

    await expect(footer).toBeInTheDocument();
    await expect(footer).toHaveClass('nx:typography-label-default');
    await expect(footer).not.toHaveClass('nx:font-medium');
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

// A sorted column reads as active: TableHead emphasizes its text (muted →
// foreground) when it carries aria-sort="ascending"/"descending", but not for a
// merely-sortable "none". The interactive sort control is a recipe (SortableHeader).
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

    // The emphasis fires for an actively-sorted column, not a sortable-but-unsorted one.
    await expect(getComputedStyle(asc as Element).color).not.toBe(
      getComputedStyle(none as Element).color
    );
    await expect(getComputedStyle(desc as Element).color).not.toBe(
      getComputedStyle(none as Element).color
    );
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
    await expect(row).not.toHaveClass('nx:border-b');
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
      'nx:border-b',
      'nx:border-border-default-alpha'
    );
    await expect(cell).toHaveClass('nx:border-r');
  },
};

// Row density. `comfortable` (the default) gives roomier ~44px rows; `compact`
// tightens to ~36px for dense data.
export const Density: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
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
    const comfyCell = canvasElement.querySelector(
      '[data-density="comfortable"] [data-slot="table-cell"]'
    );
    const compactCell = canvasElement.querySelector(
      '[data-density="compact"] [data-slot="table-cell"]'
    );

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
      <TableHeader className="nx:[&_th]:bg-container">
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
    await expect(header).toHaveClass('nx:[&_th]:bg-container');
    await expect(head).toBeInTheDocument();
    await expect(head).toHaveClass('nx:sticky', 'nx:top-0');
    await expect(getComputedStyle(head as Element).position).toBe('sticky');
  },
};
