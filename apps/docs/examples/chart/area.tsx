'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/chart/chart';

const data = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 173, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 264, mobile: 140 },
];

const config = {
  desktop: {
    label: 'Desktop',
    color: 'var(--nx-color-chart-categorical-1)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--nx-color-chart-categorical-2)',
  },
} satisfies ChartConfig;

const shortMonth = (value: string) => value.slice(0, 3);

export default function ChartArea() {
  return (
    <ChartContainer config={config} className="nx:w-full nx:max-w-md">
      <AreaChart data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={shortMonth}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="desktop"
          type="natural"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
        />
        <Area
          dataKey="mobile"
          type="natural"
          fill="var(--color-mobile)"
          fillOpacity={0.4}
          stroke="var(--color-mobile)"
          strokeDasharray="6 4"
        />
      </AreaChart>
    </ChartContainer>
  );
}
