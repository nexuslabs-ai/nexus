'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

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
    icon: DesktopSwatch,
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--nx-color-chart-categorical-2)',
    icon: MobileSwatch,
  },
} satisfies ChartConfig;

const shortMonth = (value: string) => value.slice(0, 3);

function LineSwatch({ color, dashed }: { color: string; dashed?: boolean }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <line
        x1={0}
        y1={6}
        x2={12}
        y2={6}
        stroke={color}
        strokeWidth={2}
        strokeDasharray={dashed ? '3 2' : undefined}
      />
    </svg>
  );
}

function DesktopSwatch() {
  return <LineSwatch color="var(--color-desktop)" />;
}

function MobileSwatch() {
  return <LineSwatch color="var(--color-mobile)" dashed />;
}

export default function ChartLine() {
  return (
    <ChartContainer config={config} className="nx:w-full nx:max-w-md">
      <LineChart data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={shortMonth}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
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
