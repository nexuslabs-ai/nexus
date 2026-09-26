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
      <Tabs defaultValue="week">
        <TabsList size="sm" aria-label="Chart range">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
        <TabsContent value="week">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Visits over the last seven days.
          </p>
        </TabsContent>
        <TabsContent value="month">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Visits over the last thirty days.
          </p>
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="paid">
        <TabsList aria-label="Invoice status">
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        <TabsContent value="paid">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Invoices settled this quarter.
          </p>
        </TabsContent>
        <TabsContent value="pending">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Invoices awaiting payment.
          </p>
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="grid">
        <TabsList size="lg" aria-label="Library layout">
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Files shown as thumbnails.
          </p>
        </TabsContent>
        <TabsContent value="list">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Files shown as rows.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
