import type { ReactNode } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './nxds';

/** The same install steps for an app on React 19 and one on React 18. */
export function ReactVersionTabs({
  react19,
  react18,
}: {
  react19: ReactNode;
  react18: ReactNode;
}) {
  return (
    <Tabs defaultValue="19" className="nx:mt-4">
      <TabsList size="sm" aria-label="React version">
        <TabsTrigger value="19">React 19</TabsTrigger>
        <TabsTrigger value="18">React 18</TabsTrigger>
      </TabsList>
      <TabsContent value="19">{react19}</TabsContent>
      <TabsContent value="18">{react18}</TabsContent>
    </Tabs>
  );
}
