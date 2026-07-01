import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconItalic,
  IconUnderline,
} from '@tabler/icons-react';
import { expect, userEvent, within } from 'storybook/test';

import { ToggleGroup, ToggleGroupItem } from './toggle-group';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

// Single-select: behaves like a radio group (exactly one item pressed).
// Also guards invariant #3 — data-variant / data-size are emitted on the default.
export const Default: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <IconAlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="toggle-group"]');
    await expect(group).toHaveAttribute('data-variant', 'default');
    await expect(group).toHaveAttribute('data-size', 'default');
    const item = canvasElement.querySelector('[data-slot="toggle-group-item"]');
    await expect(item).toHaveAttribute('data-variant', 'default');
    await expect(item).toHaveAttribute('data-size', 'default');
  },
};

// Multiple-select: any number of items pressed at once.
export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={['bold']}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        <IconBold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <IconItalic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <IconUnderline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

// The outline variant, applied to the whole group via context.
export const Outline: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <IconAlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

// Joined (spacing 0, segmented) vs separated (spacing 2, individual pills).
export const Spacing: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <ToggleGroup type="single" variant="outline" defaultValue="left">
        <ToggleGroupItem value="left" aria-label="Align left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <IconAlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <IconAlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={2}
        defaultValue="left"
      >
        <ToggleGroupItem value="left" aria-label="Align left (spaced)">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center (spaced)">
          <IconAlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right (spaced)">
          <IconAlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

// Clicking an item selects it (and deselects the previously selected one).
export const ClickInteraction: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <IconAlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const center = canvas.getByRole('radio', { name: 'Align center' });
    await expect(center).toHaveAttribute('data-state', 'off');
    await userEvent.click(center);
    await expect(center).toHaveAttribute('data-state', 'on');
    await expect(
      canvas.getByRole('radio', { name: 'Align left' })
    ).toHaveAttribute('data-state', 'off');
  },
};

// Arrow keys move the roving focus within the group.
export const KeyboardInteraction: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(
      canvas.getByRole('radio', { name: 'Align left' })
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      canvas.getByRole('radio', { name: 'Align center' })
    ).toHaveFocus();
  },
};

// A disabled group disables all its items.
export const Disabled: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left" disabled>
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('radio', { name: 'Align left' })
    ).toBeDisabled();
  },
};

// The group carries data-variant / data-size; items inherit them through context.
export const WithDataAttributes: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" size="sm" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="toggle-group"]');
    await expect(group).toHaveAttribute('data-variant', 'outline');
    await expect(group).toHaveAttribute('data-size', 'sm');
    const item = canvasElement.querySelector('[data-slot="toggle-group-item"]');
    await expect(item).toHaveAttribute('data-variant', 'outline');
    await expect(item).toHaveAttribute('data-size', 'sm');
  },
};

// Item-wins precedence: a per-item variant overrides the group's. The group is
// outline; the first item opts back to the borderless default, the second inherits.
export const ItemOverridesGroup: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="left">
      <ToggleGroupItem value="left" variant="default" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const [override, inherited] = canvasElement.querySelectorAll(
      '[data-slot="toggle-group-item"]'
    );
    await expect(override).toHaveAttribute('data-variant', 'default');
    await expect(override).not.toHaveClass('nx:border-border-default');
    await expect(inherited).toHaveAttribute('data-variant', 'outline');
    await expect(inherited).toHaveClass('nx:border-border-default');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Single + multiple, default + outline, joined + spaced. Reused by the per-base
// variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <ToggleGroup type="single" defaultValue="left">
        <ToggleGroupItem value="left" aria-label="Align left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <IconAlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <IconAlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="multiple" variant="outline" defaultValue={['bold']}>
        <ToggleGroupItem value="bold" aria-label="Bold">
          <IconBold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <IconItalic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <IconUnderline />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={2}
        defaultValue="left"
      >
        <ToggleGroupItem value="left" aria-label="Spaced left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Spaced center">
          <IconAlignCenter />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};
