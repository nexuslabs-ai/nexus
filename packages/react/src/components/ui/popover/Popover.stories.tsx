import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { BusyOverlayStage } from '../../../stories/overlay-visuals';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from './popover';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Place content for the popover here.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  // Named function + useId so the label/input pairs are uniquely associated.
  render: function WithFormStory() {
    const widthId = React.useId();
    const maxWidthId = React.useId();
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Set dimensions</Button>
        </PopoverTrigger>
        <PopoverContent className="nx:w-80">
          <div className="nx:flex nx:flex-col nx:gap-4">
            <div className="nx:flex nx:flex-col nx:gap-1.5">
              <h4 className="nx:typography-label-default nx:leading-none">
                Dimensions
              </h4>
              <p className="nx:typography-body-default nx:text-muted-foreground">
                Set the dimensions for the layer.
              </p>
            </div>
            <div className="nx:flex nx:flex-col nx:gap-2">
              <div className="nx:grid nx:grid-cols-3 nx:items-center nx:gap-4">
                <Label htmlFor={widthId}>Width</Label>
                <Input
                  id={widthId}
                  defaultValue="100%"
                  className="nx:col-span-2"
                />
              </div>
              <div className="nx:grid nx:grid-cols-3 nx:items-center nx:gap-4">
                <Label htmlFor={maxWidthId}>Max. width</Label>
                <Input
                  id={maxWidthId}
                  defaultValue="300px"
                  className="nx:col-span-2"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};

export const Placements: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-wrap nx:gap-4">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline">side: {side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side}>
            <p className="nx:typography-body-default">Opens on {side}.</p>
          </PopoverContent>
        </Popover>
      ))}
      {(['start', 'center', 'end'] as const).map((align) => (
        <Popover key={align}>
          <PopoverTrigger asChild>
            <Button variant="outline">align: {align}</Button>
          </PopoverTrigger>
          <PopoverContent align={align}>
            <p className="nx:typography-body-default">Aligned {align}.</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

export const WithAnchor: Story = {
  render: (_args) => (
    <Popover>
      <PopoverAnchor asChild>
        <div className="nx:rounded-md nx:border nx:border-border-default nx:bg-muted nx:p-container nx:typography-label-default nx:text-muted-foreground">
          The popover positions against this anchor box.
        </div>
      </PopoverAnchor>
      <div className="nx:mt-4">
        <PopoverTrigger asChild>
          <Button variant="outline">Toggle popover</Button>
        </PopoverTrigger>
      </div>
      <PopoverContent>
        <p className="nx:typography-body-default">
          Positioned relative to the anchor box, not the trigger button.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

// ============================================
// INTERACTION TESTS
// ============================================

export const OpenCloseInteraction: Story = {
  render: (_args) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="nx:typography-body-default">Popover content</p>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open popover' });
    await expect(trigger).toBeInTheDocument();

    // Open the popover
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="popover-content"]')
      ).toBeInTheDocument();
    });

    // Close with Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="popover-content"]')
      ).toBeNull();
    });
  },
};

export const WithDataAttributes: Story = {
  render: (_args) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="nx:typography-body-default">Popover content</p>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open popover' });

    // Open the popover, then assert the content's data-slot hook
    await userEvent.click(trigger);
    await waitFor(() => {
      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toBeInTheDocument();
    });

    // Clean up so the portal doesn't leak into sibling stories
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="popover-content"]')
      ).toBeNull();
    });
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Trigger Variants
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Outline trigger</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="nx:typography-body-default">Popover content</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">Secondary trigger</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="nx:typography-body-default">Popover content</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost">Ghost trigger</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="nx:typography-body-default">Popover content</p>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Placements
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Top</Button>
            </PopoverTrigger>
            <PopoverContent side="top">
              <p className="nx:typography-body-default">Top</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Right</Button>
            </PopoverTrigger>
            <PopoverContent side="right">
              <p className="nx:typography-body-default">Right</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Bottom</Button>
            </PopoverTrigger>
            <PopoverContent side="bottom">
              <p className="nx:typography-body-default">Bottom</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Left</Button>
            </PopoverTrigger>
            <PopoverContent side="left">
              <p className="nx:typography-body-default">Left</p>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const BusyBackground: Story = {
  parameters: {
    a11y: { test: 'off' },
    layout: 'fullscreen',
  },
  render: () => (
    <BusyOverlayStage>
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Project settings" sideOffset={8}>
          <div className="nx:flex nx:flex-col nx:gap-3">
            <div>
              <h3 className="nx:typography-label-default nx:text-foreground">
                Project settings
              </h3>
              <p className="nx:typography-body-small nx:text-muted-foreground">
                Notifications and sharing preferences for this project.
              </p>
            </div>
            <Button size="sm">Apply</Button>
          </div>
        </PopoverContent>
      </Popover>
    </BusyOverlayStage>
  ),
};

const TEXT_HEAVY_ACTIVITY = [
  {
    title: 'Northstar onboarding',
    owner: 'Maya Chen',
    status: 'Draft shared with enterprise success for final notes.',
  },
  {
    title: 'Usage review',
    owner: 'Jon Bell',
    status: 'Summary ready, waiting on finance export verification.',
  },
  {
    title: 'Quarterly roadmap',
    owner: 'Ana Silva',
    status: 'Three open risks remain around integration sequencing.',
  },
  {
    title: 'Contract renewal',
    owner: 'Ravi Patel',
    status: 'Legal comments merged and pricing appendix is updated.',
  },
] as const;

const TEXT_HEAVY_NOTES = [
  'The customer team is consolidating workspace-level permissions before the migration window opens next week.',
  'Analytics should preserve the existing weekly rollup names so historical exports remain comparable for the renewal deck.',
  'Support requested a shorter escalation path for administrators who manage more than twenty connected workspaces.',
] as const;

function TextHeavyProductStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="nx:relative nx:min-h-screen nx:overflow-hidden nx:bg-background nx:text-foreground">
      <div className="nx:grid nx:min-h-screen nx:grid-cols-1 nx:md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="nx:border-b nx:border-border-default nx:bg-muted nx:p-6 nx:md:border-r nx:md:border-b-0">
          <div className="nx:typography-label-default">Atlas Console</div>
          <nav className="nx:mt-6 nx:grid nx:gap-3 nx:typography-body-small nx:text-muted-foreground">
            <span>Overview</span>
            <span>Accounts</span>
            <span>Workflows</span>
            <span>Reports</span>
            <span>Settings</span>
          </nav>
        </aside>
        <main className="nx:min-w-0 nx:p-8">
          <div className="nx:max-w-5xl">
            <div className="nx:flex nx:flex-col nx:gap-2 nx:border-b nx:border-border-default nx:pb-5">
              <p className="nx:typography-label-small nx:text-muted-foreground">
                Enterprise workspace
              </p>
              <h2 className="nx:typography-title-small nx:text-foreground">
                Account operations
              </h2>
              <p className="nx:max-w-3xl nx:typography-body-default nx:text-muted-foreground">
                Review active implementation work, approval history, and
                customer-facing notes before publishing the weekly update.
              </p>
            </div>

            <div className="nx:grid nx:gap-5 nx:py-6 nx:lg:grid-cols-[minmax(0,1fr)_280px]">
              <section className="nx:min-w-0">
                <div className="nx:grid nx:grid-cols-1 nx:gap-1 nx:border-b nx:border-border-default nx:pb-2 nx:typography-label-small nx:text-muted-foreground nx:sm:grid-cols-[minmax(0,1fr)_120px_120px]">
                  <span>Workstream</span>
                  <span>Owner</span>
                  <span>Status</span>
                </div>
                <div className="nx:divide-y nx:divide-border-default">
                  {TEXT_HEAVY_ACTIVITY.map((item) => (
                    <div
                      key={item.title}
                      className="nx:grid nx:grid-cols-1 nx:gap-1 nx:py-4 nx:sm:grid-cols-[minmax(0,1fr)_120px_120px] nx:sm:gap-4"
                    >
                      <div className="nx:min-w-0">
                        <p className="nx:truncate nx:typography-label-default">
                          {item.title}
                        </p>
                        <p className="nx:mt-1 nx:typography-body-small nx:text-muted-foreground">
                          {item.status}
                        </p>
                      </div>
                      <span className="nx:typography-body-small nx:text-muted-foreground">
                        {item.owner}
                      </span>
                      <span className="nx:typography-body-small nx:text-muted-foreground">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="nx:min-w-0 nx:border-t nx:border-border-default nx:pt-4 nx:lg:border-t-0 nx:lg:border-l nx:lg:pl-5">
                <h3 className="nx:typography-label-default">Notes</h3>
                <div className="nx:mt-3 nx:grid nx:gap-3">
                  {TEXT_HEAVY_NOTES.map((note) => (
                    <p
                      key={note}
                      className="nx:typography-body-small nx:text-muted-foreground"
                    >
                      {note}
                    </p>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      <div className="nx:absolute nx:inset-0 nx:flex nx:items-center nx:justify-center nx:p-8">
        {children}
      </div>
    </div>
  );
}

export const TextHeavyBackground: Story = {
  parameters: {
    a11y: { test: 'off' },
    layout: 'fullscreen',
  },
  render: () => (
    <TextHeavyProductStage>
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="outline">Open details</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Publish details" sideOffset={8}>
          <div className="nx:flex nx:flex-col nx:gap-3">
            <div>
              <h3 className="nx:typography-label-default nx:text-foreground">
                Publish details
              </h3>
              <p className="nx:typography-body-small nx:text-muted-foreground">
                Weekly update includes account activity, risk notes, and owner
                assignments.
              </p>
            </div>
            <Button size="sm">Publish</Button>
          </div>
        </PopoverContent>
      </Popover>
    </TextHeavyProductStage>
  ),
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
