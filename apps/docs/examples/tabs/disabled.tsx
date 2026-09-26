'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/tabs/tabs';

export default function TabsDisabled() {
  return (
    <Tabs defaultValue="account" className="nx:w-full nx:max-w-sm">
      <TabsList aria-label="Workspace settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Billing is locked on the free plan.
        </p>
      </TabsContent>
      <TabsContent value="billing">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Manage invoices and payment methods.
        </p>
      </TabsContent>
      <TabsContent value="team">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Invite people to your workspace.
        </p>
      </TabsContent>
    </Tabs>
  );
}
