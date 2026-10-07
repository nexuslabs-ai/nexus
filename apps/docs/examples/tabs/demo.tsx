'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/tabs/tabs';

export default function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="nx:w-full nx:max-w-sm">
      <TabsList aria-label="Account settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Update your name and email address.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Change the password you sign in with.
        </p>
      </TabsContent>
    </Tabs>
  );
}
