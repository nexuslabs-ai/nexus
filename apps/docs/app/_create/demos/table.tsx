'use client';
import type * as React from 'react';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@nexus_ds/react';
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
function Example0() {
  return (
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
  );
}
function Example1() {
  return (
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
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
    </div>
  );
}
