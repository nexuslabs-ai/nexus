/* eslint-disable @nexus/no-render-prop-types -- this file adapts the recharts
   API, whose ChartConfig `icon` (ComponentType) and Tooltip `labelFormatter` /
   `formatter` (return ReactNode) shapes are third-party-mandated and out of
   scope per composition-over-render-props.md. */
import * as React from 'react';

import * as RechartsPrimitive from 'recharts';

import { cn } from '@/lib/utils';

/**
 * Per-series chart configuration. Each key matches a series `dataKey`; the
 * `color` is exposed as a `--color-{key}` CSS variable on the chart root so a
 * series can reference its colour with `fill="var(--color-{key})"`. Keys used
 * for generated color variables must contain only letters, numbers, `_`, or
 * `-`; other keys can still provide labels and icons.
 *
 * Nexus semantic tokens already adapt across light/dark, so — unlike shadcn —
 * there is no `theme: { light, dark }` split. Point `color` at a Nexus chart
 * token (`var(--nx-color-chart-categorical-N)`) and it tracks the theme for you.
 * Treat `color` as trusted component CSS, not user-provided data.
 */
export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);
const chartColorKeyPattern = /^[A-Za-z0-9_-]+$/;

type ChartRootStyle = React.CSSProperties & {
  [key: `--color-${string}`]: string | undefined;
};

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  style,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children'];
}) {
  const uniqueId = React.useId();
  // Strip the colons React emits in some runtimes (`:r0:`) so the data attribute
  // remains convenient to query in tests and consumer CSS.
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;
  const chartStyle = getChartStyle(config, style);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "nx:flex nx:aspect-video nx:justify-center nx:text-xs nx:[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground nx:[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border-default nx:[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border-default nx:[&_.recharts-dot[stroke='#fff']]:stroke-transparent nx:[&_.recharts-layer]:outline-hidden nx:[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border-default nx:[&_.recharts-radial-bar-background-sector]:fill-muted nx:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted nx:[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border-default nx:[&_.recharts-sector]:outline-hidden nx:[&_.recharts-sector[stroke='#fff']]:stroke-transparent nx:[&_.recharts-surface]:outline-hidden",
          className
        )}
        style={chartStyle}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function getChartStyle(
  config: ChartConfig,
  style: React.CSSProperties | undefined
) {
  const colorStyle = Object.entries(config).reduce<ChartRootStyle>(
    (acc, [key, conf]) => {
      if (!conf.color || !chartColorKeyPattern.test(key)) {
        return acc;
      }

      acc[`--color-${key}`] = conf.color;

      return acc;
    },
    {}
  );

  if (!Object.keys(colorStyle).length) {
    return style;
  }

  return { ...colorStyle, ...style };
}

const ChartTooltip = RechartsPrimitive.Tooltip;

type ChartIndicator = 'line' | 'dot' | 'dashed';

type ChartTooltipFormatter = (
  value: RechartsPrimitive.TooltipPayloadEntry['value'],
  name: RechartsPrimitive.TooltipPayloadEntry['name'],
  item: RechartsPrimitive.TooltipPayloadEntry,
  index: number,
  payload: RechartsPrimitive.TooltipPayloadEntry['payload']
) => React.ReactNode;

interface ChartTooltipContentProps extends Pick<
  RechartsPrimitive.DefaultTooltipContentProps,
  'payload' | 'label' | 'labelFormatter' | 'labelClassName'
> {
  active?: boolean;
  className?: string;
  indicator?: ChartIndicator;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  formatter?: ChartTooltipFormatter;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}

/** Shared class for one tooltip row (formatter row and default row alike). */
const tooltipRowClassName = (indicator: ChartIndicator) =>
  cn(
    'nx:[&>svg]:text-muted-foreground nx:flex nx:w-full nx:flex-wrap nx:items-stretch nx:gap-control-md nx:[&>svg]:h-2.5 nx:[&>svg]:w-2.5',
    indicator === 'dot' && 'nx:items-center'
  );

interface ChartTooltipLabelProps {
  payload: ReadonlyArray<RechartsPrimitive.TooltipPayloadEntry>;
  label?: React.ReactNode;
  labelKey?: string;
  labelFormatter?: ChartTooltipContentProps['labelFormatter'];
  labelClassName?: string;
}

/** The tooltip's leading label, resolved from config / `labelKey` / `labelFormatter`. */
function ChartTooltipLabel({
  payload,
  label,
  labelKey,
  labelFormatter,
  labelClassName,
}: ChartTooltipLabelProps) {
  const { config } = useChart();
  const [item] = payload;
  const key = `${labelKey || item?.dataKey || item?.name || 'value'}`;
  const itemConfig = getPayloadConfigFromPayload(config, item, key);
  const value =
    !labelKey && typeof label === 'string'
      ? config[label]?.label || label
      : itemConfig?.label;

  if (labelFormatter) {
    return (
      <div className={cn('nx:font-medium', labelClassName)}>
        {labelFormatter(value, payload)}
      </div>
    );
  }
  if (!value) return null;
  return <div className={cn('nx:font-medium', labelClassName)}>{value}</div>;
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  const nestLabel = payload.length === 1 && indicator !== 'dot';
  const tooltipLabel = hideLabel ? null : (
    <ChartTooltipLabel
      payload={payload}
      label={label}
      labelKey={labelKey}
      labelFormatter={labelFormatter}
      labelClassName={labelClassName}
    />
  );

  return (
    <div
      className={cn(
        'nx:border-border-default nx:bg-popover nx:text-popover-foreground nx:grid nx:min-w-32 nx:items-start nx:gap-control-sm nx:rounded-md nx:border nx:px-control-sm nx:py-control-sm nx:text-xs nx:shadow-lg',
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="nx:grid nx:gap-control-sm">
        {payload.map((item, index) =>
          formatter && item.value !== undefined && item.name ? (
            <div
              key={`${item.dataKey}`}
              className={tooltipRowClassName(indicator)}
            >
              {formatter(item.value, item.name, item, index, item.payload)}
            </div>
          ) : (
            <ChartTooltipItem
              key={`${item.dataKey}`}
              item={item}
              indicator={indicator}
              hideIndicator={hideIndicator}
              color={color}
              nameKey={nameKey}
              nestLabel={nestLabel}
            >
              {nestLabel ? tooltipLabel : null}
            </ChartTooltipItem>
          )
        )}
      </div>
    </div>
  );
}

interface ChartTooltipIndicatorProps {
  itemConfig: ChartConfig[string] | undefined;
  hideIndicator: boolean;
  indicator: ChartIndicator;
  nestLabel: boolean;
  color: string | undefined;
}

/** The leading swatch for a tooltip row: a config icon, or the dot/line/dashed mark. */
function ChartTooltipIndicator({
  itemConfig,
  hideIndicator,
  indicator,
  nestLabel,
  color,
}: ChartTooltipIndicatorProps) {
  if (itemConfig?.icon) {
    const Icon = itemConfig.icon;
    return <Icon />;
  }
  if (hideIndicator) return null;

  return (
    <div
      className={cn(
        'nx:shrink-0 nx:rounded-[2px] nx:border-(--color-border) nx:bg-(--color-bg)',
        {
          'nx:h-2.5 nx:w-2.5': indicator === 'dot',
          'nx:w-1': indicator === 'line',
          'nx:w-0 nx:border-[1.5px] nx:border-dashed nx:bg-transparent':
            indicator === 'dashed',
          'nx:my-0.5': nestLabel && indicator === 'dashed',
        }
      )}
      style={
        {
          '--color-bg': color,
          '--color-border': color,
        } as React.CSSProperties
      }
    />
  );
}

interface ChartTooltipItemProps {
  item: RechartsPrimitive.TooltipPayloadEntry;
  indicator: ChartIndicator;
  hideIndicator: boolean;
  color?: string;
  nameKey?: string;
  nestLabel: boolean;
  /** The nested tooltip label, shown before the series name on a single line/dashed row. */
  children?: React.ReactNode;
}

/** One default tooltip row: indicator + series name + value. */
function ChartTooltipItem({
  item,
  indicator,
  hideIndicator,
  color,
  nameKey,
  nestLabel,
  children,
}: ChartTooltipItemProps) {
  const { config } = useChart();
  const key = `${nameKey || item.name || item.dataKey || 'value'}`;
  const itemConfig = getPayloadConfigFromPayload(config, item, key);

  return (
    <div className={tooltipRowClassName(indicator)}>
      <ChartTooltipIndicator
        itemConfig={itemConfig}
        hideIndicator={hideIndicator}
        indicator={indicator}
        nestLabel={nestLabel}
        color={color || item.payload?.fill || item.color}
      />
      <div
        className={cn(
          'nx:flex nx:flex-1 nx:justify-between nx:leading-none',
          nestLabel ? 'nx:items-end' : 'nx:items-center'
        )}
      >
        <div className="nx:grid nx:gap-control-sm">
          {children}
          <span className="nx:text-muted-foreground">
            {itemConfig?.label || item.name}
          </span>
        </div>
        {item.value !== undefined && (
          <span className="nx:text-foreground nx:font-mono nx:font-medium nx:tabular-nums">
            {item.value.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

interface ChartLegendContentProps extends Pick<
  RechartsPrimitive.DefaultLegendContentProps,
  'payload'
> {
  className?: string;
  hideIcon?: boolean;
  verticalAlign?: 'top' | 'bottom';
  nameKey?: string;
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'nx:flex nx:items-center nx:justify-center nx:gap-control-lg',
        verticalAlign === 'top' ? 'nx:pb-3' : 'nx:pt-3',
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || 'value'}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={`${item.value}`}
            className="nx:[&>svg]:text-muted-foreground nx:flex nx:items-center nx:gap-control-sm nx:[&>svg]:h-3 nx:[&>svg]:w-3"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="nx:size-2 nx:shrink-0 nx:rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

/** A recharts tooltip or legend payload item; the raw data row sits under `.payload`. */
type ChartPayloadItem =
  | RechartsPrimitive.TooltipPayloadEntry
  | RechartsPrimitive.LegendPayload;

/** Read `key` off an unknown object as a string, else `undefined`. */
function readKey(source: unknown, key: string): string | undefined {
  if (typeof source !== 'object' || source === null) return undefined;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Resolve a series' {@link ChartConfig} entry from a recharts payload item.
 * recharts nests the row data under `.payload`, so we probe the outer item then
 * the inner row for a string key before falling back to `key`.
 */
function getPayloadConfigFromPayload(
  config: ChartConfig,
  item: ChartPayloadItem | undefined,
  key: string
) {
  if (!item) return undefined;
  const configKey = readKey(item, key) ?? readKey(item.payload, key) ?? key;
  return config[configKey] ?? config[key];
}

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
};
