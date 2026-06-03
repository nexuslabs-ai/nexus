import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './resizable';

const meta: Meta<typeof ResizablePanelGroup> = {
  title: 'Components/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ResizablePanelGroup>;

const groupClass =
  'nx:h-[220px] nx:max-w-md nx:overflow-hidden nx:rounded-lg nx:border nx:border-border-default';

// react-resizable-panels v4 makes each panel overflow:auto, which axe flags as a
// scrollable region (scrollable-region-focusable) that the library won't make
// keyboard-accessible (it doesn't forward tabIndex). Clip instead — the demo
// content fits, so there is nothing to scroll.
const panelStyle = { overflow: 'hidden' } as const;

function PanelBody({ label }: { label: string }) {
  return <div className="nx:p-6 nx:text-center nx:font-semibold">{label}</div>;
}

// ============================================
// BASIC STORIES
// ============================================

// Two horizontal panels with a visible grip handle.
export const Default: Story = {
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className={groupClass}>
      <ResizablePanel defaultSize={50} style={panelStyle}>
        <PanelBody label="One" />
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize panels" />
      <ResizablePanel defaultSize={50} style={panelStyle}>
        <PanelBody label="Two" />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

// Vertical split — the handle flips to a horizontal divider.
export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup orientation="vertical" className={groupClass}>
      <ResizablePanel defaultSize={50} style={panelStyle}>
        <PanelBody label="Top" />
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize panels" />
      <ResizablePanel defaultSize={50} style={panelStyle}>
        <PanelBody label="Bottom" />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

// Three panels with two handles.
export const ThreePanels: Story = {
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className={groupClass}>
      <ResizablePanel defaultSize={25} style={panelStyle}>
        <PanelBody label="Nav" />
      </ResizablePanel>
      <ResizableHandle aria-label="Resize nav" />
      <ResizablePanel defaultSize={50} style={panelStyle}>
        <PanelBody label="Content" />
      </ResizablePanel>
      <ResizableHandle aria-label="Resize aside" />
      <ResizablePanel defaultSize={25} style={panelStyle}>
        <PanelBody label="Aside" />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

// ============================================
// INTERACTION TESTS
// ============================================

// Arrow keys on the focused separator resize the panels (aria-valuenow moves).
export const KeyboardInteraction: Story = {
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className={groupClass}>
      <ResizablePanel defaultSize={50} style={panelStyle}>
        <PanelBody label="One" />
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize panels" />
      <ResizablePanel defaultSize={50} style={panelStyle}>
        <PanelBody label="Two" />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator');
    handle.focus();
    await expect(handle).toHaveFocus();
    const before = handle.getAttribute('aria-valuenow');
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(handle.getAttribute('aria-valuenow')).not.toBe(before);
    });
  },
};

// data-slot identifies the group, panels, and handle.
export const WithDataAttributes: Story = {
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className={groupClass}>
      <ResizablePanel defaultSize={50} style={panelStyle}>
        <PanelBody label="One" />
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize panels" />
      <ResizablePanel defaultSize={50} style={panelStyle}>
        <PanelBody label="Two" />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="resizable-panel-group"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="resizable-panel"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="resizable-handle"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Horizontal and vertical splits side by side. Reused by the per-base
// variant generator across 5 bases × 2 themes.
export const AllVariants: Story = {
  render: () => (
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
  ),
};
