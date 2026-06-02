import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@nexus/react';
import {
  IconArrowLeft,
  IconFlag,
  IconMail,
  IconNote,
  IconUserPlus,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';

import {
  type ActivityKind,
  type ContactDetail,
  fetchContact,
} from '../../lib/crm-api';
import { formatCurrency, formatDate } from '../../lib/format';

import { ContactStatusBadge, initials } from './contact-ui';

export function ContactDetailRoute() {
  const { id } = useParams({ from: '/app/m/crm/$id' });
  const { data, isPending, isError } = useQuery({
    queryKey: ['crm', 'contact', id],
    queryFn: () => fetchContact(id),
  });

  return (
    <div className="nx:space-y-6 nx:p-6">
      <Link
        to="/m/crm"
        className="nx:text-muted-foreground nx:hover:text-foreground nx:inline-flex nx:items-center nx:gap-1 nx:text-sm"
      >
        <IconArrowLeft className="nx:size-4" />
        Contacts
      </Link>

      {isPending && <DetailSkeleton />}
      {isError && <NotFound />}
      {data && <DetailContent contact={data.contact} />}
    </div>
  );
}

function DetailContent({ contact }: { contact: ContactDetail }) {
  return (
    <>
      <header className="nx:flex nx:items-center nx:gap-4">
        <Avatar className="nx:size-12">
          <AvatarFallback>{initials(contact.name)}</AvatarFallback>
        </Avatar>
        <div className="nx:space-y-1">
          <div className="nx:flex nx:items-center nx:gap-3">
            <h1 className="nx:typography-heading-large nx:text-foreground">
              {contact.name}
            </h1>
            <ContactStatusBadge status={contact.status} />
          </div>
          <p className="nx:text-muted-foreground">{contact.company}</p>
        </div>
      </header>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Field label="Email" value={contact.email} />
              <Separator />
              <Field label="Owner" value={contact.owner} />
              <Separator />
              <Field label="Open value" value={formatCurrency(contact.value)} />
              <Separator />
              <Field
                label="Last contacted"
                value={formatDate(contact.lastContacted)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="nx:space-y-4">
                {contact.activity.map((item) => (
                  <li key={item.id} className="nx:flex nx:gap-3">
                    <div className="nx:bg-muted nx:text-muted-foreground nx:flex nx:size-8 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-full">
                      <ActivityIcon kind={item.kind} />
                    </div>
                    <div className="nx:space-y-0.5">
                      <p className="nx:text-foreground nx:text-sm">
                        {item.summary}
                      </p>
                      <p className="nx:text-muted-foreground nx:text-xs">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="nx:flex nx:items-center nx:justify-between nx:py-3">
      <span className="nx:text-muted-foreground nx:text-sm">{label}</span>
      <span className="nx:text-foreground nx:text-sm nx:font-medium">
        {value}
      </span>
    </div>
  );
}

const ACTIVITY_ICON: Record<ActivityKind, typeof IconMail> = {
  email: IconMail,
  note: IconNote,
  status: IconFlag,
  created: IconUserPlus,
};

function ActivityIcon({ kind }: { kind: ActivityKind }) {
  const Icon = ACTIVITY_ICON[kind];
  return <Icon className="nx:size-4" />;
}

function DetailSkeleton() {
  return (
    <div className="nx:space-y-6">
      <div className="nx:flex nx:items-center nx:gap-4">
        <Skeleton className="nx:size-12 nx:rounded-full" />
        <div className="nx:space-y-2">
          <Skeleton className="nx:h-6 nx:w-48" />
          <Skeleton className="nx:h-4 nx:w-32" />
        </div>
      </div>
      <Skeleton className="nx:h-64 nx:w-full" />
    </div>
  );
}

// App-local not-found — the polished @nexus/react EmptyState is tracked in #282.
function NotFound() {
  return (
    <div className="nx:border-border-default nx:flex nx:flex-col nx:items-center nx:justify-center nx:gap-3 nx:rounded-md nx:border nx:border-dashed nx:p-12 nx:text-center">
      <h2 className="nx:typography-heading-medium nx:text-foreground">
        Contact not found
      </h2>
      <p className="nx:text-muted-foreground nx:max-w-sm">
        This contact doesn&apos;t exist, or may have been removed.
      </p>
      <Link
        to="/m/crm"
        className="nx:text-primary-subtle-foreground nx:hover:underline"
      >
        Back to Contacts
      </Link>
    </div>
  );
}
