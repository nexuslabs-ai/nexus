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
type ChartIndex = (typeof CHART_SERIES)[number];

const CHART_NAMES: Record<ChartIndex, string> = {
  '1': 'teal',
  '2': 'lime',
  '3': 'orange',
  '4': 'rose',
  '5': 'indigo',
};

// Literal class strings so Tailwind's content scanner emits the utilities.
const CHART_BG_CLASS: Record<ChartIndex, string> = {
  '1': 'nx:bg-chart-1',
  '2': 'nx:bg-chart-2',
  '3': 'nx:bg-chart-3',
  '4': 'nx:bg-chart-4',
  '5': 'nx:bg-chart-5',
};
const CHART_TEXT_CLASS: Record<ChartIndex, string> = {
  '1': 'nx:text-chart-1',
  '2': 'nx:text-chart-2',
  '3': 'nx:text-chart-3',
  '4': 'nx:text-chart-4',
  '5': 'nx:text-chart-5',
};
const CHART_BORDER_CLASS: Record<ChartIndex, string> = {
  '1': 'nx:border-chart-1',
  '2': 'nx:border-chart-2',
  '3': 'nx:border-chart-3',
  '4': 'nx:border-chart-4',
  '5': 'nx:border-chart-5',
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

function Swatch({ index }: { index: ChartIndex }) {
  return (
    <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
      <div
        className={`nx:rounded-md nx:border nx:border-border-default nx:size-24 ${CHART_BG_CLASS[index]}`}
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

export const UtilityClasses: Story = {
  name: 'Tailwind Utilities',
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:p-10 nx:bg-background nx:min-h-screen">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Tailwind utilities
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Chart tokens emit standard color utilities under the <code>nx:</code>{' '}
          prefix. Background, text, and border variants are demonstrated per
          series.
        </p>
      </div>

      <table className="nx:typography-body-small">
        <thead>
          <tr className="nx:text-left nx:text-muted-foreground">
            <th className="nx:p-2">Series</th>
            <th className="nx:p-2">nx:bg-chart-N</th>
            <th className="nx:p-2">nx:text-chart-N</th>
            <th className="nx:p-2">nx:border-chart-N</th>
          </tr>
        </thead>
        <tbody>
          {CHART_SERIES.map((n) => (
            <tr key={n} className="nx:text-foreground">
              <td className="nx:p-2 nx:font-mono">chart.{n}</td>
              <td className="nx:p-2">
                <span
                  className={`nx:inline-block nx:size-8 nx:rounded-sm ${CHART_BG_CLASS[n]}`}
                />
              </td>
              <td className={`nx:p-2 nx:font-mono ${CHART_TEXT_CLASS[n]}`}>
                Aa {CHART_NAMES[n]}
              </td>
              <td className="nx:p-2">
                <span
                  className={`nx:inline-block nx:size-8 nx:rounded-sm nx:border-2 ${CHART_BORDER_CLASS[n]}`}
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
