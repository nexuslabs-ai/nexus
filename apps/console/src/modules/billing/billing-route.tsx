import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@nexus/react';
import { IconCreditCard } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ErrorState } from '../../components/error-state';
import { PageHeader } from '../../components/page-header';
import {
  billingKeys,
  type BillingOverview,
  cancelSubscription,
  fetchBilling,
  fetchInvoices,
  type Invoice,
  type PaymentMethod,
  reactivateSubscription,
  type Subscription,
  type UsageMeter,
} from '../../lib/billing-api';
import { formatCurrency, formatDate, formatMoney } from '../../lib/format';

import { InvoiceStatusBadge, planTier, tierPrice } from './billing-ui';
import { PlanSheet } from './plan-sheet';

export function BillingRoute() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: billingKeys.overview,
    queryFn: fetchBilling,
  });

  return (
    <div className="nx:space-y-6 nx:p-6">
      <PageHeader
        title="Billing"
        description="Your plan, usage, payment method, and invoice history."
      />

      {isPending && <BillingSkeleton />}
      {isError && (
        <ErrorState message="Couldn't load billing." onRetry={refetch} />
      )}
      {data && <BillingContent overview={data} />}
    </div>
  );
}

function BillingContent({ overview }: { overview: BillingOverview }) {
  const [planOpen, setPlanOpen] = useState(false);

  return (
    <>
      <div className="nx:grid nx:gap-6 nx:lg:grid-cols-3">
        <PlanCard
          subscription={overview.subscription}
          onChangePlan={() => setPlanOpen(true)}
        />
        <PaymentCard method={overview.paymentMethod} />
      </div>

      <UsageCard usage={overview.usage} />
      <InvoicesCard />

      <PlanSheet
        open={planOpen}
        onOpenChange={setPlanOpen}
        subscription={overview.subscription}
      />
    </>
  );
}

function PlanCard({
  subscription,
  onChangePlan,
}: {
  subscription: Subscription;
  onChangePlan: () => void;
}) {
  const queryClient = useQueryClient();
  const tier = planTier(subscription.tier);
  const price = tierPrice(tier, subscription.cycle);
  const canceling = subscription.status === 'canceling';

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: billingKeys.overview });

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      invalidate();
      toast.success('Subscription canceled', {
        description: `Active until ${formatDate(subscription.renewsAt)}.`,
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateSubscription,
    onSuccess: () => {
      invalidate();
      toast.success('Subscription resumed');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card className="nx:lg:col-span-2">
      <CardHeader>
        <CardTitle>Current plan</CardTitle>
      </CardHeader>
      <CardContent className="nx:space-y-4">
        <div className="nx:flex nx:flex-wrap nx:items-baseline nx:gap-x-3 nx:gap-y-1">
          <span className="nx:typography-heading-medium nx:text-foreground">
            {tier.name}
          </span>
          <span className="nx:text-muted-foreground">
            {price === 0
              ? 'Free'
              : `${formatCurrency(price)}/mo · billed ${subscription.cycle}`}
          </span>
          {canceling ? (
            <Badge variant="warning">Canceling</Badge>
          ) : (
            <Badge variant="success">Active</Badge>
          )}
        </div>

        <p className="nx:text-muted-foreground nx:text-sm">
          {canceling
            ? `Your plan is set to cancel on ${formatDate(subscription.renewsAt)}. You'll keep access until then.`
            : `Renews on ${formatDate(subscription.renewsAt)}.`}
        </p>

        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <Button variant="outline" onClick={onChangePlan}>
            Change plan
          </Button>
          {canceling ? (
            <Button
              variant="secondary"
              onClick={() => reactivateMutation.mutate()}
              loading={reactivateMutation.isPending}
            >
              Resume plan
            </Button>
          ) : (
            <CancelButton
              planName={tier.name}
              renewsAt={subscription.renewsAt}
              onConfirm={() => cancelMutation.mutate()}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CancelButton({
  planName,
  renewsAt,
  onConfirm,
}: {
  planName: string;
  renewsAt: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="nx:text-error-foreground nx:hover:bg-error-background nx:hover:text-error-foreground"
        >
          Cancel subscription
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            Your {planName} plan stays active until {formatDate(renewsAt)}.
            After that your workspace moves to the free Starter tier.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep plan</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="nx:bg-error-background nx:text-error-foreground nx:hover:bg-error-background-hover"
          >
            Cancel subscription
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PaymentCard({ method }: { method: PaymentMethod }) {
  const update = () =>
    toast.info('Payment method updates are disabled in this demo.');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment method</CardTitle>
      </CardHeader>
      <CardContent className="nx:space-y-4">
        <div className="nx:flex nx:items-center nx:gap-3">
          <div className="nx:bg-muted nx:text-muted-foreground nx:flex nx:size-10 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-md">
            <IconCreditCard />
          </div>
          <div className="nx:min-w-0">
            <p className="nx:text-foreground nx:font-medium">
              {method.brand} ···· {method.last4}
            </p>
            <p className="nx:text-muted-foreground nx:text-sm nx:tabular-nums">
              Expires {String(method.expMonth).padStart(2, '0')}/
              {method.expYear}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={update}>
          Update
        </Button>
      </CardContent>
    </Card>
  );
}

function UsageCard({ usage }: { usage: UsageMeter[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage this period</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="nx:grid nx:gap-6 nx:sm:grid-cols-3">
          {usage.map((meter) => (
            <UsageMeterBar key={meter.id} meter={meter} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function UsageMeterBar({ meter }: { meter: UsageMeter }) {
  const pct = Math.min(100, Math.round((meter.used / meter.limit) * 100));
  // Tint the figure near the cap — the bar itself has no warning variant.
  const nearCap = meter.used / meter.limit >= 0.9;

  return (
    <div className="nx:space-y-2">
      <div className="nx:flex nx:items-baseline nx:justify-between nx:gap-2">
        <span className="nx:text-foreground nx:text-sm nx:font-medium">
          {meter.label}
        </span>
        <span
          className={`nx:text-xs nx:tabular-nums ${nearCap ? 'nx:text-warning-foreground' : 'nx:text-muted-foreground'}`}
        >
          {meter.used} / {meter.limit} {meter.unit}
        </span>
      </div>
      <Progress value={pct} aria-label={`${meter.label} usage`} />
    </div>
  );
}

function InvoicesCard() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: billingKeys.invoices,
    queryFn: fetchInvoices,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {isPending && <InvoicesSkeleton />}
        {isError && (
          <ErrorState message="Couldn't load invoices." onRetry={refetch} />
        )}
        {data && <InvoicesTable invoices={data.invoices} />}
      </CardContent>
    </Card>
  );
}

function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  const download = (number: string) =>
    toast.info(`Downloading ${number} is disabled in this demo.`);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-right">Receipt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="nx:text-muted-foreground nx:tabular-nums">
              {invoice.number}
            </TableCell>
            <TableCell>{formatDate(invoice.date)}</TableCell>
            <TableCell className="nx:tabular-nums">
              {formatMoney(invoice.amount)}
            </TableCell>
            <TableCell>
              <InvoiceStatusBadge status={invoice.status} />
            </TableCell>
            <TableCell className="nx:text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => download(invoice.number)}
              >
                Download
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BillingSkeleton() {
  return (
    <div className="nx:space-y-6">
      <div className="nx:grid nx:gap-6 nx:lg:grid-cols-3">
        <Skeleton className="nx:h-48 nx:lg:col-span-2" />
        <Skeleton className="nx:h-48" />
      </div>
      <Skeleton className="nx:h-32" />
      <Skeleton className="nx:h-64" />
    </div>
  );
}

function InvoicesSkeleton() {
  return (
    <div className="nx:space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="nx:h-9 nx:w-full" />
      ))}
    </div>
  );
}
