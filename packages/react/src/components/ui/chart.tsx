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
}: {
  active?: boolean;
  payload?: RechartsPrimitive.TooltipPayloadEntry[];
  className?: string;
  indicator?: 'line' | 'dot' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: React.ReactNode;
  labelFormatter?: (
    value: React.ReactNode,
    payload: RechartsPrimitive.TooltipPayloadEntry[]
  ) => React.ReactNode;
  labelClassName?: string;
  formatter?: (
    value: RechartsPrimitive.TooltipPayloadEntry['value'],
    name: RechartsPrimitive.TooltipPayloadEntry['name'],
    item: RechartsPrimitive.TooltipPayloadEntry,
    index: number,
    payload: RechartsPrimitive.TooltipPayloadEntry['payload']
  ) => React.ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

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

    if (!value) {
      return null;
    }

    return <div className={cn('nx:font-medium', labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot';

  return (
    <div
      className={cn(
        'nx:border-border-default nx:bg-popover nx:text-popover-foreground nx:grid nx:min-w-[8rem] nx:items-start nx:gap-control-sm nx:rounded-md nx:border nx:px-control-sm nx:py-control-sm nx:text-xs nx:shadow-lg',
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="nx:grid nx:gap-control-sm">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload?.fill || item.color;

          return (
            <div
              key={`${item.dataKey}`}
              className={cn(
                'nx:[&>svg]:text-muted-foreground nx:flex nx:w-full nx:flex-wrap nx:items-stretch nx:gap-control-md nx:[&>svg]:h-2.5 nx:[&>svg]:w-2.5',
                indicator === 'dot' && 'nx:items-center'
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
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
                            '--color-bg': indicatorColor,
                            '--color-border': indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      'nx:flex nx:flex-1 nx:justify-between nx:leading-none',
                      nestLabel ? 'nx:items-end' : 'nx:items-center'
                    )}
                  >
                    <div className="nx:grid nx:gap-control-sm">
                      {nestLabel ? tooltipLabel : null}
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
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: {
  className?: string;
  hideIcon?: boolean;
  payload?: RechartsPrimitive.LegendPayload[];
  verticalAlign?: 'top' | 'bottom';
  nameKey?: string;
}) {
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

/**
 * Resolve a series' {@link ChartConfig} entry from a recharts payload item.
 * recharts nests the row data under `payload.payload`, so we probe both the
 * outer item and the inner row for a string key before falling back to `key`.
 */
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
};
