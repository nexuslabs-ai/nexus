/**
 * Analytics module API contract. A read-only reporting dashboard — no
 * mutations, so this is just the range enum, the overview shape, the query-key
 * factory (keyed by range so the period toggle refetches), and the fetcher.
 */

export const ANALYTICS_RANGES = ['7d', '30d', '90d'] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

/** Human label for each range, shown on the period toggle. */
export const RANGE_LABELS: Record<AnalyticsRange, string> = {
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
};

/** How a KPI's raw number should be rendered in its stat card. */
export type KpiFormat = 'currency' | 'number' | 'percent';

export interface Kpi {
  key: string;
  label: string;
  value: number;
  format: KpiFormat;
  /** Change vs the preceding period of the same length; positive = up. */
  deltaPct: number;
}

/** One point on the shared time axis; drives all three trend charts. */
export interface TrendPoint {
  label: string;
  revenue: number;
  newUsers: number;
  returningUsers: number;
  sessions: number;
}

export interface TrafficSource {
  source: string;
  visits: number;
  /** Fraction of total visits (0–1). */
  share: number;
}

export interface AnalyticsOverview {
  range: AnalyticsRange;
  kpis: Kpi[];
  trend: TrendPoint[];
  sources: TrafficSource[];
}

export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (range: AnalyticsRange) =>
    ['analytics', 'overview', range] as const,
};

export async function fetchAnalytics(
  range: AnalyticsRange
): Promise<AnalyticsOverview> {
  const res = await fetch(`/api/analytics?range=${range}`);
  if (!res.ok) {
    throw new Error('Failed to load analytics');
  }
  return res.json();
}
