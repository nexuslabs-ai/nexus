'use client';
import type * as React from 'react';
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
} from 'recharts';
function AreaExample() {
  return (
    <ChartContainer config={config}>
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12 }}
      >
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
function BarExample() {
  const mobilePattern = useId();
  return (
    <ChartContainer config={config}>
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
function LineExample() {
  return (
    <ChartContainer config={config}>
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={shortMonth}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="desktop"
          type="natural"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="mobile"
          type="natural"
          stroke="var(--color-mobile)"
          strokeDasharray="6 4"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
const config = {
  desktop: {
    label: 'Desktop (solid)',
    color: 'var(--nx-color-chart-categorical-1)',
  },
  mobile: {
    label: 'Mobile (patterned)',
    color: 'var(--nx-color-chart-categorical-2)',
    icon: IconTexture,
  },
} satisfies ChartConfig;
const data = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 173, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 264, mobile: 140 },
];
const shortMonth = (value: string) => value.slice(0, 3);
function Example0() {
  return (
    <div className="nx:w-full nx:max-w-md nx:max-w-full">
      <AreaExample />
    </div>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-md nx:max-w-full nx:flex-col nx:gap-10">
      <AreaExample />
      <BarExample />
      <LineExample />
    </div>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
    </div>
  );
}
