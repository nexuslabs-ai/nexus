import { useId } from 'react';

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@nexus_ds/react';
import { IconTexture } from '@tabler/icons-react';
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
  newUsers: {
    label: 'New (solid, lower)',
    color: 'var(--nx-color-chart-categorical-2)',
  },
  returningUsers: {
    label: 'Returning (striped, upper)',
    color: 'var(--nx-color-chart-categorical-3)',
    icon: IconTexture,
  },
} satisfies ChartConfig;

/** New vs returning users, stacked per bucket = total audience. Two series → legend. */
export function AudienceChart({ data }: { data: TrendPoint[] }) {
  const returningPattern = useId();
  return (
    <ChartContainer config={audienceConfig} className={CHART_BOX}>
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12, top: 8 }}
      >
        <defs>
          <pattern
            id={returningPattern}
            width={6}
            height={6}
            patternUnits="userSpaceOnUse"
          >
            <rect width={6} height={6} fill="var(--color-returningUsers)" />
            <path
              d="M0 0L6 6M-3 3L3 9M3 -3L9 3"
              stroke="var(--nx-color-container)"
              strokeWidth={1.5}
            />
          </pattern>
        </defs>
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
          fill={`url(#${returningPattern})`}
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
