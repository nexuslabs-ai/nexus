import { Badge, type BadgeProps } from '@nexus_ds/react';

import {
  type BillingCycle,
  type InvoiceStatus,
  PLAN_TIERS,
  type PlanTier,
  type PlanTierId,
} from '../../lib/billing-api';

const INVOICE_STATUS_META: Record<
  InvoiceStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  paid: { label: 'Paid', variant: 'success' },
  open: { label: 'Open', variant: 'information' },
  failed: { label: 'Failed', variant: 'error' },
};

/** The invoice status badge, shared by the invoices table. */
export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, variant } = INVOICE_STATUS_META[status];
  return <Badge variant={variant}>{label}</Badge>;
}

/** The catalog entry for a tier id — every id is present in {@link PLAN_TIERS}. */
export function planTier(id: PlanTierId): PlanTier {
  const tier = PLAN_TIERS.find((t) => t.id === id);
  if (!tier) throw new Error(`Unknown plan tier: ${id}`);
  return tier;
}

/** The effective per-month price for a tier on a given billing cycle. */
export const tierPrice = (tier: PlanTier, cycle: BillingCycle) =>
  cycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
