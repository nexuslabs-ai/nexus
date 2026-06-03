/**
 * Billing API client. Thin typed wrappers over the mock endpoints served by MSW
 * (`src/mocks/handlers.ts`) — there is no real backend. Mirrors the CRM /
 * Projects / Inbox shape: a single query-key object, `as const` enums, and
 * fetch/mutate fns.
 *
 * Two deliberately distinct shapes (the list/detail discipline again): the
 * static {@link PLAN_TIERS} catalog (what the change-plan picker renders — every
 * tier with both prices + features) vs the live {@link Subscription} (what the
 * overview renders — the current tier, cycle, status, and renewal date).
 */

/** Plan tiers — the single source for {@link PlanTierId} and the catalog order. */
export const PLAN_TIER_IDS = ['starter', 'pro', 'scale'] as const;
export type PlanTierId = (typeof PLAN_TIER_IDS)[number];

/** A catalog entry — static product data, not the customer's subscription. */
export type PlanTier = {
  id: PlanTierId;
  name: string;
  /** Whole-dollar price per month, billed monthly. */
  monthlyPrice: number;
  /** Whole-dollar effective price per month, billed annually. */
  annualPrice: number;
  blurb: string;
  features: string[];
};

/** The plan catalog the change-plan picker renders. */
export const PLAN_TIERS: PlanTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 0,
    annualPrice: 0,
    blurb: 'For trying things out.',
    features: ['1 workspace', 'Up to 3 seats', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29,
    annualPrice: 24,
    blurb: 'For growing teams that need room to scale.',
    features: [
      'Unlimited workspaces',
      'Up to 25 seats',
      'Priority support',
      'Advanced analytics',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    monthlyPrice: 99,
    annualPrice: 79,
    blurb: 'For larger orgs with security and compliance needs.',
    features: [
      'Everything in Pro',
      'Unlimited seats',
      'SSO & SAML',
      'Dedicated manager',
      'Audit log',
    ],
  },
];

export type BillingCycle = 'monthly' | 'annual';

/** Live, or canceling at period end — still active until {@link Subscription.renewsAt}. */
export type SubscriptionStatus = 'active' | 'canceling';

/** The customer's live subscription — what the overview renders. */
export type Subscription = {
  tier: PlanTierId;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  /** ISO date the current period ends — the renewal date, or end-of-access. */
  renewsAt: string;
};

/** A metered resource — rendered as a labelled Progress bar. */
export type UsageMeter = {
  id: string;
  label: string;
  used: number;
  limit: number;
  /** Display suffix, e.g. `seats`, `GB`. */
  unit: string;
};

/** The card on file — masked, like every payment UI. */
export type PaymentMethod = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

/** Invoice lifecycle — single source for {@link InvoiceStatus} + the badge. */
export const INVOICE_STATUSES = ['paid', 'open', 'failed'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export type Invoice = {
  id: string;
  /** Human-readable identifier, e.g. `INV-2026-0007`. */
  number: string;
  /** ISO date (YYYY-MM-DD) the invoice was issued. */
  date: string;
  /** Amount in dollars, with cents — render with {@link formatMoney}. */
  amount: number;
  status: InvoiceStatus;
};

/** The billing overview payload — current subscription + usage + card on file. */
export type BillingOverview = {
  subscription: Subscription;
  usage: UsageMeter[];
  paymentMethod: PaymentMethod;
};

/** The editable subscription fields — `status` and `renewsAt` are server-set. */
export type PlanSelection = {
  tier: PlanTierId;
  cycle: BillingCycle;
};

/**
 * TanStack Query keys for the Billing module — declared once so the overview,
 * invoices, and mutations can't drift apart.
 */
export const billingKeys = {
  all: ['billing'] as const,
  overview: ['billing', 'overview'] as const,
  invoices: ['billing', 'invoices'] as const,
};

export async function fetchBilling(): Promise<BillingOverview> {
  const res = await fetch('/api/billing');
  if (!res.ok) {
    throw new Error('Failed to load billing. Please try again.');
  }
  return (await res.json()) as BillingOverview;
}

export async function fetchInvoices(): Promise<{ invoices: Invoice[] }> {
  const res = await fetch('/api/billing/invoices');
  if (!res.ok) {
    throw new Error('Failed to load invoices. Please try again.');
  }
  return (await res.json()) as { invoices: Invoice[] };
}

async function mutateSubscription(
  url: string,
  method: 'POST' | 'PATCH',
  body?: PlanSelection
): Promise<{ subscription: Subscription }> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error('Failed to update your subscription. Please try again.');
  }
  return (await res.json()) as { subscription: Subscription };
}

/** Switch tier and/or billing cycle — also reactivates a canceling subscription. */
export const changePlan = (selection: PlanSelection) =>
  mutateSubscription('/api/billing/subscription', 'PATCH', selection);

/** Wind down at period end — stays active until `renewsAt`. */
export const cancelSubscription = () =>
  mutateSubscription('/api/billing/cancel', 'POST');

/** Undo a pending cancellation — back to `active`. */
export const reactivateSubscription = () =>
  mutateSubscription('/api/billing/reactivate', 'POST');
