'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/tabs/tabs';

export default function TabsVariants() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-6">
      <Tabs defaultValue="overview">
        <TabsList aria-label="Project sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Goals, owners and deadlines.
          </p>
        </TabsContent>
        <TabsContent value="activity">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Recent changes by the team.
          </p>
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="all">
        <TabsList variant="underline" aria-label="Inbox filter">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Every message in your inbox.
          </p>
        </TabsContent>
        <TabsContent value="unread">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Messages you have not opened.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
