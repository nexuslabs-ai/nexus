import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nexus_ds/react';

import { PageHeader } from '../../components/page-header';

import { DraftTab } from './color-atlas/draft-tab';
import { InspectTab } from './color-atlas/inspect-tab';

export function ColorAtlasRoute() {
  return (
    <div className="nx:mx-auto nx:max-w-5xl nx:space-y-6 nx:p-6">
      <PageHeader
        title="Color Token Atlas"
        description="Inspect semantic color usage and preview local draft overrides across the Console."
      />
      <Tabs defaultValue="inspect" className="nx:space-y-6">
        <TabsList>
          <TabsTrigger value="inspect">Inspect</TabsTrigger>
          <TabsTrigger value="draft">Draft Theme</TabsTrigger>
        </TabsList>
        <TabsContent value="inspect">
          <InspectTab />
        </TabsContent>
        <TabsContent value="draft">
          <DraftTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
