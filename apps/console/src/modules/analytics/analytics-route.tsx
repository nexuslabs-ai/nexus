import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
} from '@nexus/react';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

import { ErrorState } from '../../components/error-state';
import { PageHeader } from '../../components/page-header';
import {
  ANALYTICS_RANGES,
  analyticsKeys,
  type AnalyticsOverview,
  type AnalyticsRange,
  fetchAnalytics,
  type Kpi,
  RANGE_LABELS,
  type TrafficSource,
} from '../../lib/analytics-api';
import { formatCurrency } from '../../lib/format';

import { AudienceChart, RevenueChart, SessionsChart } from './analytics-charts';

const analyticsRoute = getRouteApi('/app/m/analytics');

export function AnalyticsRoute() {
  const { range } = analyticsRoute.useSearch();
  const navigate = analyticsRoute.useNavigate();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: analyticsKeys.overview(range),
    queryFn: () => fetchAnalytics(range),
  });

  // Radix single-select emits '' when the active item is re-clicked; ignore it
  // so the range can never wipe to blank.
  const onRangeChange = (value: string) => {
    if (value) {
      navigate({ search: { range: value as AnalyticsRange } });
    }
  };

  return (
    <div className="nx:space-y-6 nx:p-6">
      <PageHeader
        title="Analytics"
        description="Revenue, audience, and traffic across your workspace."
      >
        <ToggleGroup
          type="single"
          variant="outline"
          value={range}
          onValueChange={onRangeChange}
          aria-label="Date range"
        >
          {ANALYTICS_RANGES.map((r) => (
            <ToggleGroupItem key={r} value={r}>
              {RANGE_LABELS[r]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </PageHeader>

      {isPending && <AnalyticsSkeleton />}
      {isError && (
        <ErrorState message="Couldn't load analytics." onRetry={refetch} />
      )}
      {data && <AnalyticsContent overview={data} />}
    </div>
  );
}

function AnalyticsContent({ overview }: { overview: AnalyticsOverview }) {
  return (
    <>
      <div className="nx:grid nx:gap-6 nx:sm:grid-cols-2 nx:xl:grid-cols-4">
        {overview.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      <div className="nx:grid nx:gap-6 nx:lg:grid-cols-2">
        <ChartCard title="Revenue">
          <RevenueChart data={overview.trend} />
        </ChartCard>
        <ChartCard title="New vs returning users">
          <AudienceChart data={overview.trend} />
        </ChartCard>
      </div>

      <ChartCard title="Sessions">
        <SessionsChart data={overview.trend} />
      </ChartCard>

      <SourcesCard sources={overview.sources} />
    </>
  );
}

function formatKpi(kpi: Kpi): string {
  if (kpi.format === 'currency') {
    return formatCurrency(kpi.value);
  }
  if (kpi.format === 'percent') {
    return `${kpi.value}%`;
  }
  return kpi.value.toLocaleString();
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.deltaPct >= 0;
  const TrendIcon = up ? IconTrendingUp : IconTrendingDown;

  return (
    <Card className="nx:space-y-1 nx:p-6">
      <p className="nx:text-muted-foreground nx:typography-body-default">
        {kpi.label}
      </p>
      <p className="nx:typography-heading-medium nx:text-foreground nx:tabular-nums">
        {formatKpi(kpi)}
      </p>
      <p
        className={`nx:flex nx:items-center nx:gap-1 nx:typography-label-small nx:tabular-nums ${
          up
            ? 'nx:text-success-subtle-foreground'
            : 'nx:text-error-subtle-foreground'
        }`}
      >
        <TrendIcon className="nx:size-3.5 nx:shrink-0" />
        <span>
          {up ? '+' : ''}
          {kpi.deltaPct}% vs previous period
        </span>
      </p>
    </Card>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="nx:min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SourcesCard({ sources }: { sources: TrafficSource[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top traffic sources</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="nx:text-right">Visits</TableHead>
              <TableHead className="nx:text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.source}>
                <TableCell className="nx:text-foreground nx:font-medium">
                  {source.source}
                </TableCell>
                <TableCell className="nx:text-right nx:tabular-nums">
                  {source.visits.toLocaleString()}
                </TableCell>
                <TableCell className="nx:text-right nx:tabular-nums">
                  {Math.round(source.share * 100)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="nx:space-y-6">
      <div className="nx:grid nx:gap-6 nx:sm:grid-cols-2 nx:xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="nx:h-28" />
        ))}
      </div>
      <div className="nx:grid nx:gap-6 nx:lg:grid-cols-2">
        <Skeleton className="nx:h-80" />
        <Skeleton className="nx:h-80" />
      </div>
      <Skeleton className="nx:h-80" />
      <Skeleton className="nx:h-64" />
    </div>
  );
}
