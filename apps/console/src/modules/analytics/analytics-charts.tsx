import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@nexus_ds/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';

import type { TrendPoint } from '../../lib/analytics-api';

// Fixed height overrides ChartContainer's default `aspect-video` so every
// dashboard chart is the same height regardless of its grid column's width.
const CHART_BOX = 'nx:h-[260px] nx:w-full nx:min-w-0';

// Single-series hero charts use the brand token; multi-series keep categorical.
const revenueConfig = {
  revenue: { label: 'Revenue', color: 'var(--nx-color-primary-background)' },
} satisfies ChartConfig;

/** Revenue over the period — the hero metric. Single series, so no legend. */
export function RevenueChart({ data }: { data: TrendPoint[] }) {
  return (
    <ChartContainer config={revenueConfig} className={CHART_BOX}>
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12, top: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Area
          dataKey="revenue"
          type="natural"
          fill="var(--color-revenue)"
          fillOpacity={0.3}
          stroke="var(--color-revenue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}

const audienceConfig = {
  newUsers: { label: 'New', color: 'var(--nx-color-chart-categorical-2)' },
  returningUsers: {
    label: 'Returning',
    color: 'var(--nx-color-chart-categorical-3)',
  },
} satisfies ChartConfig;

/** New vs returning users, stacked per bucket = total audience. Two series → legend. */
export function AudienceChart({ data }: { data: TrendPoint[] }) {
  return (
    <ChartContainer config={audienceConfig} className={CHART_BOX}>
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12, top: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="newUsers"
          stackId="audience"
          fill="var(--color-newUsers)"
          radius={[0, 0, 4, 4]}
        />
        <Bar
          dataKey="returningUsers"
          stackId="audience"
          fill="var(--color-returningUsers)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

const sessionsConfig = {
  sessions: { label: 'Sessions', color: 'var(--nx-color-primary-background)' },
} satisfies ChartConfig;

/** Session volume trend. Single series, so no legend. */
export function SessionsChart({ data }: { data: TrendPoint[] }) {
  return (
    <ChartContainer config={sessionsConfig} className={CHART_BOX}>
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12, top: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        {/* A trend line reads better scaled to its own range than to a 0
            baseline (which would squeeze this high, flat series into a thin
            top strip). Hidden — the tooltip carries exact values. */}
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Line
          dataKey="sessions"
          type="natural"
          stroke="var(--color-sessions)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
