import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Kbd, KbdGroup } from './kbd';

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
};

export default meta;
type Story = StoryObj<typeof Kbd>;

// A single keycap next to a two-key chord composed with KbdGroup.
export const Default: Story = {
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-4">
      <Kbd>⌘</Kbd>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
  ),
};

// Single modifier keys render as square-ish caps (min-width floor); wider
// labels grow to fit.
export const SingleKeys: Story = {
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-2">
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>⌥</Kbd>
      <Kbd>⌃</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Enter</Kbd>
    </div>
  ),
};

// Both structural parts carry a data-slot hook for styling and inspection.
export const WithDataAttributes: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="kbd-group"]');
    await expect(group).toBeInTheDocument();

    const keys = within(canvasElement).getAllByText(/⌘|K/);
    await expect(keys.length).toBeGreaterThan(0);
    await expect(
      canvasElement.querySelector('[data-slot="kbd"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// The full anatomy: single modifier caps, wider labelled keys, and multi-key
// chords grouped with KbdGroup. Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⌃</Kbd>
        <Kbd>↵</Kbd>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Kbd>Esc</Kbd>
        <Kbd>Tab</Kbd>
        <Kbd>Enter</Kbd>
        <Kbd>Space</Kbd>
      </div>
      <div className="nx:flex nx:items-center nx:gap-4">
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>P</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
};
