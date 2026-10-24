import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { IconSearch } from '@tabler/icons-vue';
import { expect } from 'storybook/test';

import { Kbd, KbdGroup } from '.';

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: {
    docs: {
      description: {
        component:
          'Kbd shows a keyboard key, such as `Esc` or `⌘`. Use it to document shortcuts. For a key combination, wrap several Kbd elements in KbdGroup.',
      },
    },
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

// A single keycap next to a two-key chord composed with KbdGroup.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Kbd, KbdGroup },
    template: `
      <div class="nx:flex nx:items-center nx:gap-4">
        <Kbd>⌘</Kbd>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
    `,
  }),
};

// Single modifier keys render as square-ish caps (min-width floor); wider
// labels grow to fit.
export const SingleKeys: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show single keys as caps that widen to fit longer labels.',
      },
    },
  },
  render: () => ({
    components: { Kbd },
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⌃</Kbd>
        <Kbd>Esc</Kbd>
        <Kbd>Enter</Kbd>
      </div>
    `,
  }),
};

export const SeparatedChord: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Put a literal `+` between keys inside a KbdGroup.',
      },
    },
  },
  render: () => ({
    components: { Kbd, KbdGroup },
    template: `
      <KbdGroup class="nx:gap-2">
        <Kbd>⌘</Kbd>
        <span class="nx:text-muted-foreground">+</span>
        <Kbd>K</Kbd>
      </KbdGroup>
    `,
  }),
};

// SVG children inherit the keycap icon sizing hook.
export const WithIcon: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Place an icon inside a key cap, sized to match the text.',
      },
    },
  },
  render: () => ({
    components: { IconSearch, Kbd },
    template: `
      <Kbd><IconSearch aria-hidden="true" />K</Kbd>
    `,
  }),
};

// Both structural parts carry a data-slot hook for styling and inspection.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { Kbd, KbdGroup },
    template: `
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    `,
  }),
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

export const AllVariants: Story = {
  render: () => ({
    components: { Kbd, KbdGroup },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <div class="nx:flex nx:items-center nx:gap-2">
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>⌥</Kbd>
          <Kbd>⌃</Kbd>
          <Kbd>↵</Kbd>
        </div>
        <div class="nx:flex nx:items-center nx:gap-2">
          <Kbd>Esc</Kbd>
          <Kbd>Tab</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd>Space</Kbd>
        </div>
        <div class="nx:flex nx:items-center nx:gap-4">
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
    `,
  }),
};
