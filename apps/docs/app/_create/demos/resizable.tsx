'use client';
import type * as React from 'react';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@nexus_ds/react';
const groupClass =
  'nx:h-56 nx:max-w-md nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default';
const panelStyle = { overflow: 'hidden' } as const;
function PanelBody({ label }: { label: string }) {
  return <div className="nx:p-6 nx:text-center nx:font-semibold">{label}</div>;
}
function Example0() {
  return (
    <ResizablePanelGroup orientation="horizontal" className={groupClass}>
      <ResizablePanel defaultSize={50} style={panelStyle}>
        <PanelBody label="One" />
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize panels" />
      <ResizablePanel defaultSize={50} style={panelStyle}>
        <PanelBody label="Two" />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-wrap nx:gap-4">
      <ResizablePanelGroup orientation="horizontal" className={groupClass}>
        <ResizablePanel defaultSize={50} style={panelStyle}>
          <PanelBody label="One" />
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize columns" />
        <ResizablePanel defaultSize={50} style={panelStyle}>
          <PanelBody label="Two" />
        </ResizablePanel>
      </ResizablePanelGroup>
      <ResizablePanelGroup orientation="vertical" className={groupClass}>
        <ResizablePanel defaultSize={50} style={panelStyle}>
          <PanelBody label="Top" />
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize rows" />
        <ResizablePanel defaultSize={50} style={panelStyle}>
          <PanelBody label="Bottom" />
        </ResizablePanel>
      </ResizablePanelGroup>
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
