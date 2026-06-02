import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Button } from './button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from './button-group';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

// Three outline buttons joined into one horizontal cluster.
export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  ),
};

// Vertical orientation stacks the cluster.
export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
};

// A text addon as a leading prefix.
export const WithText: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>https://</ButtonGroupText>
      <Button variant="outline">nexus.dev</Button>
    </ButtonGroup>
  ),
};

// A separator divides two sub-clusters.
export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Undo</Button>
      <Button variant="outline">Redo</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Save</Button>
    </ButtonGroup>
  ),
};

// The group is a role=group region that advertises its orientation.
export const WithDataAttributes: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal">
      <Button variant="outline">One</Button>
      <Button variant="outline">Two</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="button-group"]');
    await expect(group).toBeInTheDocument();
    await expect(group).toHaveAttribute('role', 'group');
    await expect(group).toHaveAttribute('data-orientation', 'horizontal');
  },
};

// ButtonGroupText composes with a custom element via asChild — here a link
// addon — keeping the addon styling and data-slot hook.
export const AsChild: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText asChild>
        <a href="https://example.com">Docs</a>
      </ButtonGroupText>
      <Button variant="outline">Open</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Docs' });
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('data-slot', 'button-group-text');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Both orientations plus a text addon and a separator. Reused by the per-base
// variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-4">
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <Button variant="outline">Month</Button>
      </ButtonGroup>
      <ButtonGroup>
        <ButtonGroupText>https://</ButtonGroupText>
        <Button variant="outline">nexus.dev</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Go</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical">
        <Button variant="outline">Top</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Bottom</Button>
      </ButtonGroup>
    </div>
  ),
};
