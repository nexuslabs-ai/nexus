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
    const rows = canvasElement.querySelectorAll(
      'tbody [data-slot="table-row"]'
    );
    const bg = (el: Element) => getComputedStyle(el).backgroundColor;
    const oddRest = rows[0] as Element; // 1st body row: odd, no stripe
    const evenSelected = rows[1] as Element; // 2nd body row: even + selected
    const evenRest = rows[3] as Element; // 4th body row: even, striped

    await expect(rows).toHaveLength(4);
    // Striping: an even (unselected) row is tinted; an odd row is not.
    await expect(bg(evenRest)).not.toBe(bg(oddRest));
    // Selection beats the stripe: the selected even row shows the selection tint.
    await expect(bg(evenSelected)).not.toBe(bg(evenRest));
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
