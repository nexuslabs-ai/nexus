'use client';

import { useId } from 'react';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

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

export default function ChartDemo() {
  const mobilePattern = useId();

  return (
    <ChartContainer config={config} className="nx:w-full nx:max-w-md">
      <BarChart accessibilityLayer data={data}>
        <defs>
          <pattern
            id={mobilePattern}
            width={6}
            height={6}
            patternUnits="userSpaceOnUse"
          >
            <rect width={6} height={6} fill="var(--color-mobile)" />
            <path
              d="M0 0L6 6M-3 3L3 9M3 -3L9 3"
              stroke="var(--nx-color-container)"
              strokeWidth={1.5}
            />
          </pattern>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={shortMonth}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill={`url(#${mobilePattern})`} radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
