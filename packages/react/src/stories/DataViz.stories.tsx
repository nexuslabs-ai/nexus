import type { Meta, StoryObj } from '@storybook/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CHART_SERIES = ['1', '2', '3', '4', '5'] as const;

const CHART_NAMES: Record<(typeof CHART_SERIES)[number], string> = {
  '1': 'teal',
  '2': 'lime',
  '3': 'orange',
  '4': 'rose',
  '5': 'indigo',
};

const BAR_DATA = [
  { period: 'Q1', s1: 42, s2: 28, s3: 19, s4: 33, s5: 24 },
  { period: 'Q2', s1: 51, s2: 35, s3: 22, s4: 41, s5: 30 },
  { period: 'Q3', s1: 48, s2: 39, s3: 27, s4: 38, s5: 35 },
  { period: 'Q4', s1: 56, s2: 44, s3: 31, s4: 46, s5: 39 },
];

const PIE_DATA = CHART_SERIES.map((n) => ({
  name: CHART_NAMES[n],
  value: 20,
  fill: `var(--color-chart-${n})`,
}));

function Swatch({ index }: { index: (typeof CHART_SERIES)[number] }) {
  return (
    <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
      <div
        className="nx:rounded-md nx:border nx:border-border-default"
        style={{
          backgroundColor: `var(--color-chart-${index})`,
          width: 96,
          height: 96,
        }}
      />
      <div className="nx:flex nx:flex-col nx:items-center">
        <span className="nx:text-foreground nx:typography-label-default nx:font-mono">
          chart.{index}
        </span>
        <span className="nx:text-muted-foreground nx:typography-label-small">
          {CHART_NAMES[index]}
        </span>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Tokens/Data Viz',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Five-color categorical chart palette for data visualization. Tokens are theme-aware — light mode uses shade 600–700 primitives (dark colors on a near-white canvas), dark mode uses shade 200–300 primitives (light colors on a near-black canvas). Each chart × surface pair is APCA-validated at Lc ≥ 60 (UI tier) across all five base palettes. Source: packages/core/tokens/semantic/chart-default-{light,dark}.json.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Swatches: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:p-10 nx:bg-background nx:min-h-screen">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Chart Palette
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Hues are rotated (teal → lime → orange → rose → indigo) to maximize
          perceptual distance between adjacent series in stacked or grouped
          marks. None of the chart hues collide with status semantics
          (success/warning/error), so a red bar reads as series 4, not as an
          error.
        </p>
      </div>

      <div className="nx:flex nx:flex-wrap nx:gap-6">
        {CHART_SERIES.map((n) => (
          <Swatch key={n} index={n} />
        ))}
      </div>
    </div>
  ),
};

export const BarChartExample: Story = {
  name: 'Bar Chart',
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background nx:min-h-screen">
      <h2 className="nx:text-foreground nx:typography-heading-medium">
        Grouped Bar Chart
      </h2>
      <div className="nx:bg-container nx:rounded-lg nx:p-6 nx:border nx:border-border-default">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={BAR_DATA}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-default)"
            />
            <XAxis dataKey="period" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-popover-foreground)',
              }}
            />
            <Legend />
            <Bar dataKey="s1" name="teal" fill="var(--color-chart-1)" />
            <Bar dataKey="s2" name="lime" fill="var(--color-chart-2)" />
            <Bar dataKey="s3" name="orange" fill="var(--color-chart-3)" />
            <Bar dataKey="s4" name="rose" fill="var(--color-chart-4)" />
            <Bar dataKey="s5" name="indigo" fill="var(--color-chart-5)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  ),
};

export const PieChartExample: Story = {
  name: 'Pie Chart',
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background nx:min-h-screen">
      <h2 className="nx:text-foreground nx:typography-heading-medium">
        Pie Chart
      </h2>
      <div className="nx:bg-container nx:rounded-lg nx:p-6 nx:border nx:border-border-default">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={PIE_DATA}
              dataKey="value"
              nameKey="name"
              outerRadius={140}
              label
            >
              {PIE_DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-popover-foreground)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  ),
};
