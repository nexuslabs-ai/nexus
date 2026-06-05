import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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
        <p className="nx:text-sm nx:text-muted-foreground">
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
              <h4 className="nx:text-sm nx:font-medium nx:leading-none">
                Dimensions
              </h4>
              <p className="nx:text-sm nx:text-muted-foreground">
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
            <p className="nx:text-sm">Opens on {side}.</p>
          </PopoverContent>
        </Popover>
      ))}
      {(['start', 'center', 'end'] as const).map((align) => (
        <Popover key={align}>
          <PopoverTrigger asChild>
            <Button variant="outline">align: {align}</Button>
          </PopoverTrigger>
          <PopoverContent align={align}>
            <p className="nx:text-sm">Aligned {align}.</p>
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
        <div className="nx:rounded-md nx:border nx:border-border-default nx:bg-muted nx:p-container nx:text-sm nx:text-muted-foreground">
          The popover positions against this anchor box.
        </div>
      </PopoverAnchor>
      <div className="nx:mt-4">
        <PopoverTrigger asChild>
          <Button variant="outline">Toggle popover</Button>
        </PopoverTrigger>
      </div>
      <PopoverContent>
        <p className="nx:text-sm">
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
        <p className="nx:text-sm">Popover content</p>
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
        <p className="nx:text-sm">Popover content</p>
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Trigger Variants
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Outline trigger</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="nx:text-sm">Popover content</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">Secondary trigger</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="nx:text-sm">Popover content</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost">Ghost trigger</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="nx:text-sm">Popover content</p>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Placements
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Top</Button>
            </PopoverTrigger>
            <PopoverContent side="top">
              <p className="nx:text-sm">Top</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Right</Button>
            </PopoverTrigger>
            <PopoverContent side="right">
              <p className="nx:text-sm">Right</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Bottom</Button>
            </PopoverTrigger>
            <PopoverContent side="bottom">
              <p className="nx:text-sm">Bottom</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Left</Button>
            </PopoverTrigger>
            <PopoverContent side="left">
              <p className="nx:text-sm">Left</p>
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

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
