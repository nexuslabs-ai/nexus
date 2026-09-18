import { useId } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
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
import { expect, waitFor, within } from 'storybook/test';

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './chart';

const meta: Meta<typeof ChartContainer> = {
  title: 'Components/Chart',
  component: ChartContainer,
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

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
    label: 'Desktop (solid)',
    color: 'var(--nx-color-chart-categorical-1)',
  },
  mobile: {
    label: 'Mobile (patterned)',
    color: 'var(--nx-color-chart-categorical-2)',
    icon: IconTexture,
  },
} satisfies ChartConfig;

const unsafeKey = 'desktop; background: red';
const guardedConfig = {
  [unsafeKey]: {
    label: 'Unsafe key',
    color: 'var(--nx-color-chart-categorical-1)',
  },
  safe: { label: 'Safe', color: 'var(--nx-color-chart-categorical-2)' },
} satisfies ChartConfig;

const shortMonth = (value: string) => value.slice(0, 3);

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

export const Default: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <AreaExample />
    </div>
  ),
};

export const AreaChartStory: Story = {
  name: 'Area',
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <AreaExample />
    </div>
  ),
};

export const BarChartStory: Story = {
  name: 'Bar',
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarExample />
    </div>
  ),
};

export const LineChartStory: Story = {
  name: 'Line',
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <LineExample />
    </div>
  ),
};

export const WithDataAttributes: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <ChartContainer config={config}>
        <BarChart accessibilityLayer data={data}>
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const chart = canvasElement.querySelector('[data-slot="chart"]');
    await expect(chart).toBeInTheDocument();
    await expect(chart).toHaveAttribute('data-chart');
    // #497: chart base text migrated from the raw named text-size utility.
    await expect(chart).toHaveClass('nx:typography-body-small');
  },
};

export const AxisTicksTabular: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
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
          <Line
            dataKey="desktop"
            type="natural"
            stroke="var(--color-desktop)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const chart = canvasElement.querySelector('[data-slot="chart"]');

    await expect(chart).toHaveClass(
      'nx:[&_.recharts-cartesian-axis-tick_text]:tabular-nums'
    );
  },
};

export const DynamicStyleGuard: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <ChartContainer config={guardedConfig}>
        <BarChart accessibilityLayer data={data}>
          <Bar dataKey="safe" fill="var(--color-safe)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const chart = canvasElement.querySelector<HTMLElement>(
      '[data-slot="chart"]'
    );
    const style = chart?.getAttribute('style') || '';

    await expect(chart).toBeInTheDocument();
    await expect(canvasElement.querySelector('style')).not.toBeInTheDocument();
    await expect(style).toContain('--color-safe');
    await expect(style).not.toContain(unsafeKey);
    await expect(style).not.toContain('background');
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:w-[600px] nx:max-w-full nx:flex-col nx:gap-10">
      <AreaExample />
      <BarExample />
      <LineExample />
    </div>
  ),
};

export const Grayscale: Story = {
  render: () => (
    <div
      data-testid="grayscale-preview"
      className="nx:w-[600px] nx:max-w-full nx:space-y-6 nx:grayscale"
    >
      <p className="nx:typography-body-default">
        Desktop uses solid marks. Mobile uses dashed lines and striped bars.
      </p>
      <LineExample />
      <BarExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('Desktop (solid)').length).toBeGreaterThan(
      0
    );
    await expect(
      canvas.getAllByText('Mobile (patterned)').length
    ).toBeGreaterThan(0);
    await waitFor(() => {
      const dashes = Array.from(
        canvasElement.querySelectorAll('[stroke-dasharray]')
      ).map((path) =>
        path
          .getAttribute('stroke-dasharray')
          ?.split(/[,\s]+/)
          .map(parseFloat)
      );
      expect(dashes.some((dash) => dash?.[0] === 6 && dash[1] === 4)).toBe(
        true
      );
      expect(
        getComputedStyle(canvas.getByTestId('grayscale-preview')).filter
      ).toContain('grayscale(1)');
    });
    const pattern = canvasElement.querySelector('pattern');
    await expect(pattern).toBeInTheDocument();
    await expect(
      canvasElement.querySelector(`[fill="url(#${pattern?.id})"]`)
    ).toBeInTheDocument();
  },
};
