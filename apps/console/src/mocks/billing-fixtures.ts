import type { BillingOverview, Invoice } from '../lib/billing-api';

/**
 * Deterministic seed billing state. The customer is on Pro / monthly, active,
 * renewing on a fixed future date (no `new Date()` — keeps the demo stable and
 * lets a fresh invoice sort predictably). Usage spans a comfortable, a high, and
 * a near-cap meter so the bars and the at-capacity label treatment both show.
 */
export const BILLING_OVERVIEW: BillingOverview = {
  subscription: {
    tier: 'pro',
    cycle: 'monthly',
    status: 'active',
    renewsAt: '2026-07-01',
  },
  usage: [
    { id: 'seats', label: 'Seats', used: 18, limit: 25, unit: 'seats' },
    { id: 'storage', label: 'Storage', used: 88, limit: 100, unit: 'GB' },
    { id: 'projects', label: 'Projects', used: 9, limit: 10, unit: 'projects' },
  ],
  paymentMethod: { brand: 'Visa', last4: '4242', expMonth: 8, expYear: 2027 },
};

/**
 * Past invoices, newest first. Amounts carry cents (rendered with `formatMoney`,
 * not the whole-dollar `formatCurrency`); statuses span paid / open / failed so
 * the table's status badge has variety.
 */
export const INVOICES: Invoice[] = [
  {
    id: 'inv-08',
    number: 'INV-0008',
    date: '2026-06-01',
    amount: 29.0,
    status: 'open',
  },
  {
    id: 'inv-07',
    number: 'INV-0007',
    date: '2026-05-01',
    amount: 29.0,
    status: 'paid',
  },
  {
    id: 'inv-06',
    number: 'INV-0006',
    date: '2026-04-01',
    amount: 43.5,
    status: 'paid',
  },
  {
    id: 'inv-05',
    number: 'INV-0005',
    date: '2026-03-01',
    amount: 29.0,
    status: 'failed',
  },
  {
    id: 'inv-04',
    number: 'INV-0004',
    date: '2026-02-01',
    amount: 29.0,
    status: 'paid',
  },
  {
    id: 'inv-03',
    number: 'INV-0003',
    date: '2026-01-01',
    amount: 29.0,
    status: 'paid',
  },
  {
    id: 'inv-02',
    number: 'INV-0002',
    date: '2025-12-01',
    amount: 35.2,
    status: 'paid',
  },
  {
    id: 'inv-01',
    number: 'INV-0001',
    date: '2025-11-01',
    amount: 29.0,
    status: 'paid',
  },
];
