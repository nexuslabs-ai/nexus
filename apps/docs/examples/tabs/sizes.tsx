'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/tabs/tabs';

export default function TabsSizes() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-6">
      <Tabs defaultValue="overview">
        <TabsList aria-label="Small tabs">
          <TabsTrigger value="overview" size="sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" size="sm">
            Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Small overview panel.
          </p>
        </TabsContent>
        <TabsContent value="activity">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Small activity panel.
          </p>
        </TabsContent>
      </Tabs>
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
        <TabsList aria-label="Large tabs">
          <TabsTrigger value="overview" size="lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" size="lg">
            Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Large overview panel.
          </p>
        </TabsContent>
        <TabsContent value="activity">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Large activity panel.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
