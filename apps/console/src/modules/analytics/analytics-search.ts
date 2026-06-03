import { z } from 'zod';

import { ANALYTICS_RANGES } from '../../lib/analytics-api';

/**
 * The `/m/analytics` view contract — a single `range` facet driving the period
 * toggle. `.default('30d')` keeps it optional for `<Link to="/m/analytics">`;
 * `.catch('30d')` recovers a stale/invalid `?range=foo` instead of erroring.
 */
export const analyticsSearchSchema = z.object({
  range: z.enum(ANALYTICS_RANGES).default('30d').catch('30d'),
});

export type AnalyticsView = z.infer<typeof analyticsSearchSchema>;
