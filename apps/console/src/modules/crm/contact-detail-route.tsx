import { useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
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
  IconFlag,
  IconMail,
  IconNote,
  IconPencil,
  IconUserPlus,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';

import { NotFoundState } from '../../components/not-found-state';
import {
  type ActivityKind,
  type ContactDetail,
  crmKeys,
  fetchContact,
} from '../../lib/crm-api';
import { formatCurrency, formatDate, initials } from '../../lib/format';

import { ContactFormSheet } from './contact-form-sheet';
import { ContactStatusBadge } from './contact-ui';

export function ContactDetailRoute() {
  const { id } = useParams({ from: '/app/m/crm/$id' });
  const { data, isPending, isError } = useQuery({
    queryKey: crmKeys.contact(id),
    queryFn: () => fetchContact(id),
  });

  return (
    <div className="nx:space-y-6 nx:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/m/crm">Contacts</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data?.contact.name ?? 'Contact'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isPending && <DetailSkeleton />}
      {isError && (
        <NotFoundState
          title="Contact not found"
          description="This contact doesn't exist, or may have been removed."
        >
          <Link to="/m/crm">Back to Contacts</Link>
        </NotFoundState>
      )}
      {data && <DetailContent contact={data.contact} />}
    </div>
  );
}

function DetailContent({ contact }: { contact: ContactDetail }) {
  const [editOpen, setEditOpen] = useState(false);

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
        <Button
          variant="outline"
          className="nx:ml-auto"
          onClick={() => setEditOpen(true)}
        >
          <IconPencil />
          Edit
        </Button>
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

      <ContactFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        contact={contact}
      />
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

export function DetailSkeleton() {
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
