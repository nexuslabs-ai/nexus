import { type ReactNode, useState } from 'react';

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  cn,
  EmptyState,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
  toast,
} from '@nexus/react';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';

import { NotFound } from '../../app/not-found';
import { DataTable } from '../../components/data-table';
import { ErrorState } from '../../components/error-state';
import { NotFoundState } from '../../components/not-found-state';
import type { Subscription, UsageMeter } from '../../lib/billing-api';
import {
  NotificationsError,
  NotificationsSkeleton,
} from '../../shell/notifications-menu';
import { AnalyticsSkeleton } from '../analytics/analytics-route';
import {
  BillingSkeleton,
  CancelButton,
  InvoicesSkeleton,
  UsageMeterBar,
} from '../billing/billing-route';
import { PlanSheet } from '../billing/plan-sheet';
import { DetailSkeleton as ContactDetailSkeleton } from '../crm/contact-detail-route';
import { ContactFormSheet } from '../crm/contact-form-sheet';
import { ContactsEmpty, ContactsSkeleton } from '../crm/contacts-route';
import { ThreadSkeleton } from '../inbox/conversation-thread';
import { EmptyPane, ListSkeleton } from '../inbox/inbox-route';
import { DetailSkeleton as IssueDetailSkeleton } from '../projects/issue-detail-route';

// Mocks for the components that take data props — the gallery renders them in
// isolation, with no live query behind them.
const MOCK_SUBSCRIPTION: Subscription = {
  tier: 'pro',
  cycle: 'monthly',
  status: 'active',
  renewsAt: '2026-07-01',
};

const USAGE_NORMAL: UsageMeter = {
  id: 'seats',
  label: 'Seats',
  used: 12,
  limit: 25,
  unit: 'seats',
};
const USAGE_NEAR_CAP: UsageMeter = {
  id: 'storage',
  label: 'Storage',
  used: 96,
  limit: 100,
  unit: 'GB',
};

type DemoRow = { name: string; email: string };
const DEMO_COLUMNS: ColumnDef<DemoRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];

const retryNoop = () => toast.info('Retry is a no-op in the gallery.');

/**
 * The Flows gallery — a design/QA catalog of the console's conditional UI
 * states (loading, error, not-found, empty, form-validation, dialogs, toasts,
 * auth, status). One cell per unique pattern: a layout shared across modules
 * (e.g. the list skeleton, used by Contacts/Issues/People) appears once. Each
 * cell renders the real component imported from its module.
 */
export function FlowsRoute() {
  const [contactOpen, setContactOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  return (
    <div className="nx:space-y-10 nx:p-6">
      <header className="nx:space-y-1">
        <h1 className="nx:typography-heading-large nx:text-foreground">
          Flows
        </h1>
        <p className="nx:text-muted-foreground nx:max-w-2xl">
          One example of each unique UI state in the console — rendered from the
          real components so you can review states you’d otherwise only see by
          triggering the runtime condition. Patterns shared across modules (a
          list skeleton, a “no records” empty) appear once.
        </p>
      </header>

      <Section
        title="Loading skeletons"
        description="Shown for ~500ms while a query resolves, then replaced — hard to catch in normal use."
      >
        <Sample label="List / table · Contacts, Issues, People">
          <ContactsSkeleton />
        </Sample>
        <Sample label="Record detail · Contacts, People">
          <ContactDetailSkeleton />
        </Sample>
        <Sample label="Issue detail">
          <IssueDetailSkeleton />
        </Sample>
        <Sample label="Invoices card">
          <InvoicesSkeleton />
        </Sample>
        <Sample label="Analytics dashboard" span>
          <AnalyticsSkeleton />
        </Sample>
        <Sample label="Billing page" span>
          <BillingSkeleton />
        </Sample>
        <Sample label="Notifications panel" className="nx:max-w-sm nx:p-0">
          <NotificationsSkeleton />
        </Sample>
        <Sample
          label="Inbox list"
          className="nx:flex nx:h-96 nx:flex-col nx:p-0"
        >
          <ListSkeleton />
        </Sample>
        <Sample
          label="Inbox thread"
          span
          className="nx:flex nx:h-96 nx:flex-col nx:p-0"
        >
          <ThreadSkeleton />
        </Sample>
      </Section>

      <Section
        title="Error states"
        description="A load-error needs a fetch to fail, so these are effectively unreachable in normal use. ErrorState is bordered at a bordered-skeleton slot, borderless inside an already-framed container."
      >
        <Sample label="ErrorState · bordered + borderless" span>
          <div className="nx:grid nx:gap-4 nx:sm:grid-cols-2">
            <ErrorState
              message="Couldn't load contacts."
              onRetry={retryNoop}
              bordered
            />
            <ErrorState
              message="Couldn't load analytics."
              onRetry={retryNoop}
            />
          </div>
        </Sample>
        <Sample label="Notifications · cold-load error (popover chrome)" span>
          <NotificationsError />
        </Sample>
      </Section>

      <Section
        title="Not found · 404"
        description="Reached by an invalid record id (detail routes) or an unmatched URL (route-level)."
      >
        <Sample label="NotFoundState · record detail">
          <NotFoundState
            title="Contact not found"
            description="This contact doesn't exist, or may have been removed."
          >
            <Link to="/m/crm">Back to Contacts</Link>
          </NotFoundState>
        </Sample>
        <Sample label="Route-level 404 · unmatched URL">
          <NotFound />
        </Sample>
      </Section>

      <Section
        title="Empty states"
        description="Unreachable today — fixtures always seed rows — so this is the only way to see a zeroed module."
      >
        <Sample label="Module list · no records (Contacts, Issues, People)">
          <ContactsEmpty />
        </Sample>
        <Sample
          label="Inbox · no conversation selected"
          className="nx:flex nx:min-h-64 nx:p-0"
        >
          <EmptyPane />
        </Sample>
        <Sample label="Data table · filtered to zero (“No results.”)" span>
          <DataTable
            columns={DEMO_COLUMNS}
            data={[]}
            filterColumn="name"
            filterPlaceholder="Filter by name…"
          />
        </Sample>
        <Sample label="Coming soon · unbuilt module">
          <EmptyState className="nx:min-h-64">
            <EmptyStateHeader>
              <EmptyStateMedia variant="icon">
                <IconLayoutDashboard />
              </EmptyStateMedia>
              <EmptyStateTitle>Dashboard</EmptyStateTitle>
              <EmptyStateDescription>
                This module isn’t built yet — it lands in a later Atlas phase.
                The shell, routing, theming, and mock-API layer are already
                wired for it.
              </EmptyStateDescription>
            </EmptyStateHeader>
          </EmptyState>
        </Sample>
      </Section>

      <Section
        title="Form validation"
        description="Open a sheet and submit with empty fields to see inline + root-level errors. Submitting valid data creates a throwaway record that resets on reload."
      >
        <Sample label="Form sheet · Contacts, Issues, People share this" span>
          <div className="nx:flex nx:flex-wrap nx:gap-2">
            <Button variant="outline" onClick={() => setContactOpen(true)}>
              Open form sheet
            </Button>
            <Button variant="outline" onClick={() => setPlanOpen(true)}>
              Open plan picker
            </Button>
          </div>
        </Sample>
      </Section>

      <Section
        title="Dialogs"
        description="Destructive confirmation — the real AlertDialog flow."
      >
        <Sample label="AlertDialog · destructive confirm">
          <CancelButton
            planName="Pro"
            renewsAt="2026-07-01"
            onConfirm={() => toast.success('Subscription canceled (demo).')}
          />
        </Sample>
      </Section>

      <Section
        title="Toasts"
        description="Transient feedback — fires and auto-dismisses. Click to trigger."
      >
        <Sample label="success / error / info" span>
          <div className="nx:flex nx:flex-wrap nx:gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success('Contact created')}
            >
              Success toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.error('Something went wrong')}
            >
              Error toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('Updates are disabled in this demo.')}
            >
              Info toast
            </Button>
          </div>
        </Sample>
      </Section>

      <Section
        title="Auth errors"
        description="The bad-credentials / bad-OTP alert shared by the login, signup, and verify screens."
      >
        <Sample label="Sign-in error" span>
          <Alert variant="destructive">
            <AlertDescription>
              Incorrect email or password. Please try again.
            </AlertDescription>
          </Alert>
        </Sample>
      </Section>

      <Section
        title="Status & meters"
        description="The subscription badges and the usage meter’s near-cap warning tint."
      >
        <Sample label="Subscription status badges">
          <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Canceling</Badge>
          </div>
        </Sample>
        <Sample label="Usage meters · normal vs near-cap">
          <div className="nx:grid nx:gap-6 nx:sm:grid-cols-2">
            <UsageMeterBar meter={USAGE_NORMAL} />
            <UsageMeterBar meter={USAGE_NEAR_CAP} />
          </div>
        </Sample>
      </Section>

      {/* Live form sheets, mounted once and toggled by the triggers above. */}
      <ContactFormSheet open={contactOpen} onOpenChange={setContactOpen} />
      <PlanSheet
        open={planOpen}
        onOpenChange={setPlanOpen}
        subscription={MOCK_SUBSCRIPTION}
      />
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="nx:space-y-4">
      <div className="nx:space-y-1">
        <h2 className="nx:typography-heading-medium nx:text-foreground">
          {title}
        </h2>
        {description && (
          <p className="nx:text-muted-foreground nx:max-w-3xl nx:text-sm">
            {description}
          </p>
        )}
      </div>
      <div className="nx:grid nx:gap-4 nx:lg:grid-cols-2">{children}</div>
    </section>
  );
}

function Sample({
  label,
  span,
  className,
  children,
}: {
  label: string;
  /** Span both columns of the section grid. */
  span?: boolean;
  /** Extra classes for the framing box — e.g. a fixed height + flex for
   * skeletons that assume a sized parent, or `nx:p-0` to drop the default pad. */
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(span && 'nx:lg:col-span-2')}>
      <p className="nx:typography-label-small nx:text-muted-foreground nx:mb-2">
        {label}
      </p>
      <div
        className={cn(
          'nx:border-border-default nx:bg-background nx:rounded-lg nx:border nx:p-4',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
