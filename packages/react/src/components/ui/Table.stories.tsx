import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { Button } from './button';
import { Checkbox } from './checkbox';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
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

// The full anatomy in one table: muted column headers, a selected row, hover
// highlight, a footer totals row, and a caption.
export const AllVariants: Story = {
  render: () => (
    <Table>
      <TableCaption>Recent invoices — full table anatomy.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="nx:text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 4).map((row, i) => (
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
          <TableCell className="nx:text-right">$1,400.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};
