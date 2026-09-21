'use client';
import type * as React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nexus_ds/react';

function Example0() {
  return (
    <Tabs defaultValue="account" className="nx:w-full nx:max-w-md">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Make changes to your account here. Click save when you&apos;re done.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Change your password here. After saving, you&apos;ll be logged out.
        </p>
      </TabsContent>
    </Tabs>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Default Variant
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-full nx:max-w-md">
          <TabsList>
            <TabsTrigger value="tab1">Account</TabsTrigger>
            <TabsTrigger value="tab2">Password</TabsTrigger>
            <TabsTrigger value="tab3">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:typography-body-default nx:text-muted-foreground">
              Default variant (pill style)
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Underline Variant
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-full nx:max-w-md">
          <TabsList className="nx:bg-transparent nx:p-0">
            <TabsTrigger value="tab1" variant="underline">
              Account
            </TabsTrigger>
            <TabsTrigger value="tab2" variant="underline">
              Password
            </TabsTrigger>
            <TabsTrigger value="tab3" variant="underline">
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:typography-body-default nx:text-muted-foreground">
              Underline variant (border-bottom style)
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Sizes (Small, Default, Large)
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <Tabs defaultValue="tab1" className="nx:w-full nx:max-w-md">
            <TabsList>
              <TabsTrigger value="tab1" size="sm">
                Small
              </TabsTrigger>
              <TabsTrigger value="tab2" size="sm">
                Tabs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" />
            <TabsContent value="tab2" />
          </Tabs>
          <Tabs defaultValue="tab1" className="nx:w-full nx:max-w-md">
            <TabsList>
              <TabsTrigger value="tab1" size="default">
                Default
              </TabsTrigger>
              <TabsTrigger value="tab2" size="default">
                Tabs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" />
            <TabsContent value="tab2" />
          </Tabs>
          <Tabs defaultValue="tab1" className="nx:w-full nx:max-w-md">
            <TabsList>
              <TabsTrigger value="tab1" size="lg">
                Large
              </TabsTrigger>
              <TabsTrigger value="tab2" size="lg">
                Tabs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" />
            <TabsContent value="tab2" />
          </Tabs>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Disabled Tab
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-full nx:max-w-md">
          <TabsList>
            <TabsTrigger value="tab1">Active</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Disabled
            </TabsTrigger>
            <TabsTrigger value="tab3">Another</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:typography-body-default nx:text-muted-foreground">
              Active content
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Grid Layout
        </h3>
        <Tabs defaultValue="tab1" className="nx:w-full nx:max-w-md">
          <TabsList className="nx:grid nx:w-full nx:grid-cols-2">
            <TabsTrigger value="tab1">First</TabsTrigger>
            <TabsTrigger value="tab2">Second</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="nx:typography-body-default nx:text-muted-foreground">
              Grid layout content
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
    </div>
  );
}
