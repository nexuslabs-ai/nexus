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
        <TabsList aria-label="Default tabs">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Default overview panel.
          </p>
        </TabsContent>
        <TabsContent value="activity">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Default activity panel.
          </p>
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="overview">
        <TabsList variant="underline" aria-label="Underline tabs">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Underline overview panel.
          </p>
        </TabsContent>
        <TabsContent value="activity">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Underline activity panel.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
