import type {
  AnalyticsOverview,
  AnalyticsRange,
  TrendPoint,
} from '../lib/analytics-api';

/**
 * Deterministic trend builder — a pure function of the point index (sin/cos
 * ripple + gentle upward drift), so the curves look organic but never change
 * between runs. NOT random data: no `Math.random`, no `Date.now`.
 */
function buildTrend(
  labels: string[],
  base: Omit<TrendPoint, 'label'>
): TrendPoint[] {
  return labels.map((label, i) => {
    const ripple = Math.sin(i * 0.9) * 0.16 + Math.cos(i * 0.5) * 0.09;
    const f = 1 + ripple + i * 0.018;
    return {
      label,
      revenue: Math.round(base.revenue * f),
      newUsers: Math.round(base.newUsers * f),
      returningUsers: Math.round(base.returningUsers * f),
      sessions: Math.round(base.sessions * f),
    };
  });
}

const OVERVIEWS: Record<AnalyticsRange, AnalyticsOverview> = {
  '7d': {
    range: '7d',
    kpis: [
      {
        key: 'revenue',
        label: 'Revenue',
        value: 78400,
        format: 'currency',
        deltaPct: 12.4,
      },
      {
        key: 'activeUsers',
        label: 'Active users',
        value: 8420,
        format: 'number',
        deltaPct: 5.2,
      },
      {
        key: 'signups',
        label: 'Signups',
        value: 1128,
        format: 'number',
        deltaPct: 18.1,
      },
      {
        key: 'conversion',
        label: 'Conversion',
        value: 3.8,
        format: 'percent',
        deltaPct: 6.2,
      },
    ],
    trend: buildTrend(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], {
      revenue: 9600,
      newUsers: 134,
      returningUsers: 312,
      sessions: 1980,
    }),
    sources: [
      { source: 'Organic search', visits: 3240, share: 0.38 },
      { source: 'Direct', visits: 2130, share: 0.25 },
      { source: 'Referral', visits: 1280, share: 0.15 },
      { source: 'Social', visits: 1024, share: 0.12 },
      { source: 'Email', visits: 853, share: 0.1 },
    ],
  },
  '30d': {
    range: '30d',
    kpis: [
      {
        key: 'revenue',
        label: 'Revenue',
        value: 342800,
        format: 'currency',
        deltaPct: 8.7,
      },
      {
        key: 'activeUsers',
        label: 'Active users',
        value: 24180,
        format: 'number',
        deltaPct: 6.4,
      },
      {
        key: 'signups',
        label: 'Signups',
        value: 4690,
        format: 'number',
        deltaPct: 11.2,
      },
      {
        key: 'conversion',
        label: 'Conversion',
        value: 4.1,
        format: 'percent',
        deltaPct: 3.1,
      },
    ],
    trend: buildTrend(
      [
        'May 5',
        'May 8',
        'May 11',
        'May 14',
        'May 17',
        'May 20',
        'May 23',
        'May 26',
        'May 29',
        'Jun 1',
      ],
      { revenue: 29800, newUsers: 392, returningUsers: 948, sessions: 5760 }
    ),
    sources: [
      { source: 'Organic search', visits: 12840, share: 0.4 },
      { source: 'Direct', visits: 7710, share: 0.24 },
      { source: 'Referral', visits: 4820, share: 0.15 },
      { source: 'Social', visits: 3850, share: 0.12 },
      { source: 'Email', visits: 2890, share: 0.09 },
    ],
  },
  '90d': {
    range: '90d',
    kpis: [
      {
        key: 'revenue',
        label: 'Revenue',
        value: 1084500,
        format: 'currency',
        deltaPct: 15.3,
      },
      {
        key: 'activeUsers',
        label: 'Active users',
        value: 58640,
        format: 'number',
        deltaPct: 9.8,
      },
      {
        key: 'signups',
        label: 'Signups',
        value: 13240,
        format: 'number',
        deltaPct: 7.5,
      },
      {
        key: 'conversion',
        label: 'Conversion',
        value: 3.9,
        format: 'percent',
        deltaPct: -1.4,
      },
    ],
    trend: buildTrend(
      ['Mar 9', 'Mar 23', 'Apr 6', 'Apr 20', 'May 4', 'May 18', 'Jun 1'],
      { revenue: 138000, newUsers: 1960, returningUsers: 4720, sessions: 27600 }
    ),
    sources: [
      { source: 'Organic search', visits: 41200, share: 0.41 },
      { source: 'Direct', visits: 23100, share: 0.23 },
      { source: 'Referral', visits: 15080, share: 0.15 },
      { source: 'Social', visits: 12060, share: 0.12 },
      { source: 'Email', visits: 9040, share: 0.09 },
    ],
  },
};

/** Read-only — the dashboard never mutates analytics data, so no store. */
export function analyticsOverview(range: AnalyticsRange): AnalyticsOverview {
  return OVERVIEWS[range];
}
