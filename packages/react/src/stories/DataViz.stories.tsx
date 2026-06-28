import type { Meta, StoryObj } from '@storybook/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  CHART_CATEGORICAL_SERIES,
  type ChartCategoricalIndex,
} from '@/lib/chart';

const CHART_NAMES: Record<ChartCategoricalIndex, string> = {
  '1': 'teal',
  '2': 'lime',
  '3': 'orange',
  '4': 'rose',
  '5': 'indigo',
};

// Literal class strings so Tailwind's content scanner emits the utilities.
const CHART_CLASSES: Record<
  ChartCategoricalIndex,
  { bg: string; text: string; border: string }
> = {
  '1': {
    bg: 'nx:bg-chart-categorical-1',
    text: 'nx:text-chart-categorical-1',
    border: 'nx:border-chart-categorical-1',
  },
  '2': {
    bg: 'nx:bg-chart-categorical-2',
    text: 'nx:text-chart-categorical-2',
    border: 'nx:border-chart-categorical-2',
  },
  '3': {
    bg: 'nx:bg-chart-categorical-3',
    text: 'nx:text-chart-categorical-3',
    border: 'nx:border-chart-categorical-3',
  },
  '4': {
    bg: 'nx:bg-chart-categorical-4',
    text: 'nx:text-chart-categorical-4',
    border: 'nx:border-chart-categorical-4',
  },
  '5': {
    bg: 'nx:bg-chart-categorical-5',
    text: 'nx:text-chart-categorical-5',
    border: 'nx:border-chart-categorical-5',
  },
};

const BAR_DATA = [
  { period: 'Q1', s1: 42, s2: 28, s3: 19, s4: 33, s5: 24 },
  { period: 'Q2', s1: 51, s2: 35, s3: 22, s4: 41, s5: 30 },
  { period: 'Q3', s1: 48, s2: 39, s3: 27, s4: 38, s5: 35 },
  { period: 'Q4', s1: 56, s2: 44, s3: 31, s4: 46, s5: 39 },
];

const PIE_DATA = CHART_CATEGORICAL_SERIES.map((n) => ({
  name: CHART_NAMES[n],
  value: 20,
  fill: `var(--nx-color-chart-categorical-${n})`,
}));

function Swatch({ index }: { index: ChartCategoricalIndex }) {
  return (
    <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
      <div
        className={`nx:rounded-md nx:border nx:border-border-default nx:size-24 ${CHART_CLASSES[index].bg}`}
      />
      <div className="nx:flex nx:flex-col nx:items-center">
        <span className="nx:text-foreground nx:typography-label-default nx:font-mono">
          chart.categorical.{index}
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
          'Five-color categorical chart palette for data visualization. Tokens are emitted by the runtime Appearance provider and stay theme-aware across light and dark mode. Each chart × surface pair is APCA-validated at Lc ≥ 60 (UI tier) across all five base palettes.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Swatches: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:p-10 nx:bg-background nx:min-h-svh nx:w-full">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Chart Palette
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Hues are rotated (teal → lime → orange → rose → indigo) to maximize
          perceptual distance between adjacent series in stacked or grouped
          marks. None of the chart hues collide with status semantics
          (success/warning/error), so a red bar reads as series 4, not as an
          error.
        </p>
      </div>

      <div className="nx:flex nx:flex-wrap nx:gap-6">
        {CHART_CATEGORICAL_SERIES.map((n) => (
          <Swatch key={n} index={n} />
        ))}
      </div>
    </div>
  ),
};

export const UtilityClasses: Story = {
  name: 'Tailwind Utilities',
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:p-10 nx:bg-background nx:min-h-svh nx:w-full">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Tailwind utilities
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Chart tokens emit standard color utilities under the <code>nx:</code>{' '}
          prefix. Background, text, and border variants are demonstrated per
          series.
        </p>
      </div>

      <table className="nx:typography-body-default">
        <thead>
          <tr className="nx:text-left nx:text-muted-foreground">
            <th className="nx:p-2">Series</th>
            <th className="nx:p-2">nx:bg-chart-categorical-N</th>
            <th className="nx:p-2">nx:text-chart-categorical-N</th>
            <th className="nx:p-2">nx:border-chart-categorical-N</th>
          </tr>
        </thead>
        <tbody>
          {CHART_CATEGORICAL_SERIES.map((n) => (
            <tr key={n} className="nx:text-foreground">
              <td className="nx:p-2 nx:font-mono">chart.categorical.{n}</td>
              <td className="nx:p-2">
                <span
                  className={`nx:inline-block nx:size-8 nx:rounded-sm ${CHART_CLASSES[n].bg}`}
                />
              </td>
              <td className={`nx:p-2 nx:font-mono ${CHART_CLASSES[n].text}`}>
                Aa {CHART_NAMES[n]}
              </td>
              <td className="nx:p-2">
                <span
                  className={`nx:inline-block nx:size-8 nx:rounded-sm nx:border-2 ${CHART_CLASSES[n].border}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

export const BarChartExample: Story = {
  name: 'Bar Chart',
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background nx:min-h-svh nx:w-full">
      <h2 className="nx:text-foreground nx:typography-heading-medium">
        Grouped Bar Chart
      </h2>
      <div className="nx:bg-container nx:rounded-lg nx:p-6 nx:border nx:border-border-default nx:w-full">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={BAR_DATA}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--nx-color-border-default)"
            />
            <XAxis dataKey="period" stroke="var(--nx-color-muted-foreground)" />
            <YAxis stroke="var(--nx-color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--nx-color-popover)',
                border: '1px solid var(--nx-color-border-default)',
                borderRadius: 'var(--nx-radius-md)',
                color: 'var(--nx-color-popover-foreground)',
              }}
            />
            <Legend />
            <Bar
              dataKey="s1"
              name="teal"
              fill="var(--nx-color-chart-categorical-1)"
            />
            <Bar
              dataKey="s2"
              name="lime"
              fill="var(--nx-color-chart-categorical-2)"
            />
            <Bar
              dataKey="s3"
              name="orange"
              fill="var(--nx-color-chart-categorical-3)"
            />
            <Bar
              dataKey="s4"
              name="rose"
              fill="var(--nx-color-chart-categorical-4)"
            />
            <Bar
              dataKey="s5"
              name="indigo"
              fill="var(--nx-color-chart-categorical-5)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  ),
};

export const PieChartExample: Story = {
  name: 'Pie Chart',
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background nx:min-h-svh nx:w-full">
      <h2 className="nx:text-foreground nx:typography-heading-medium">
        Pie Chart
      </h2>
      <div className="nx:bg-container nx:rounded-lg nx:p-6 nx:border nx:border-border-default nx:w-full">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={PIE_DATA}
              dataKey="value"
              nameKey="name"
              outerRadius={140}
              label
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--nx-color-popover)',
                border: '1px solid var(--nx-color-border-default)',
                borderRadius: 'var(--nx-radius-md)',
                color: 'var(--nx-color-popover-foreground)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  ),
};
