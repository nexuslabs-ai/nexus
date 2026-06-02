/**
 * App-wide value formatters. CRM, Billing, and Analytics all render currency and
 * dates, so these live in `lib/` (per the plan's folder shape) rather than any
 * one module.
 *
 * Dates are formatted in **UTC**: an ISO date like `2026-05-28` parses as UTC
 * midnight, so rendering in the viewer's local zone would show the previous day
 * for anyone west of UTC. Pinning the formatter to UTC renders the authored
 * calendar day everywhere.
 */
const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

// Message timestamps carry a time of day; no year, since threads are recent.
const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
});

export const formatCurrency = (value: number) => currencyFmt.format(value);
export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) =>
  dateTimeFmt.format(new Date(iso));

/** First + last initial, e.g. "Ada Lovelace" → "AL". Used for avatar fallbacks. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}
