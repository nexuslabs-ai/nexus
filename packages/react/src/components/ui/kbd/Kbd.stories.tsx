import type { Meta, StoryObj } from '@storybook/react';
import { IconSearch } from '@tabler/icons-react';
import { expect } from 'storybook/test';

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

// Existing child composition supports chords that use a literal separator.
export const SeparatedChord: Story = {
  render: () => (
    <KbdGroup className="nx:gap-2">
      <Kbd>⌘</Kbd>
      <span className="nx:text-muted-foreground">+</span>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
};

// SVG children inherit the keycap icon sizing hook.
export const WithIcon: Story = {
  render: () => (
    <Kbd>
      <IconSearch aria-hidden />K
    </Kbd>
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
    const group = canvasElement.querySelector<HTMLElement>(
      '[data-slot="kbd-group"]'
    );
    await expect(group).toBeInTheDocument();
    await expect(group?.tagName).toBe('KBD');
    await expect(group).not.toHaveAttribute('role');
    await expect(group).not.toHaveAttribute('tabindex');

    const keycaps = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="kbd"]')
    );
    await expect(keycaps).toHaveLength(2);

    const [commandKey, letterKey] = keycaps;
    await expect(commandKey?.tagName).toBe('KBD');
    await expect(commandKey?.textContent).toBe('⌘');
    await expect(commandKey).not.toHaveAttribute('role');
    await expect(commandKey).not.toHaveAttribute('tabindex');

    await expect(letterKey?.tagName).toBe('KBD');
    await expect(letterKey?.textContent).toBe('K');
    await expect(letterKey).not.toHaveAttribute('role');
    await expect(letterKey).not.toHaveAttribute('tabindex');
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
