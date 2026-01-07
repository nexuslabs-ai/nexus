import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { themeOnlyModes } from '@/storybook/modes';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {
    size: {
      control: 'select',
      options: ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
      description: 'The size of the avatar',
    },
    shape: {
      control: 'select',
      options: ['circle', 'rounded'],
      description: 'The shape of the avatar',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// Sample image URL for testing
const SAMPLE_IMAGE = 'https://github.com/shadcn.png';

// ============================================
// DEFAULT STORIES
// ============================================

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/invalid-image.jpg" alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackOnly: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

// ============================================
// SIZE STORIES
// ============================================

export const Size2xs: Story = {
  args: { size: '2xs' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const SizeXs: Story = {
  args: { size: 'xs' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const SizeSm: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const SizeMd: Story = {
  args: { size: 'md' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const SizeLg: Story = {
  args: { size: 'lg' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const SizeXl: Story = {
  args: { size: 'xl' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Size2xl: Story = {
  args: { size: '2xl' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Size3xl: Story = {
  args: { size: '3xl' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Size4xl: Story = {
  args: { size: '4xl' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

// ============================================
// SHAPE STORIES
// ============================================

export const Circle: Story = {
  args: { shape: 'circle', size: 'lg' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Rounded: Story = {
  args: { shape: 'rounded', size: 'lg' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

// ============================================
// PROPS & ATTRIBUTES TESTS
// ============================================

export const WithDataAttributes: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: { size: 'lg', shape: 'rounded' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMAGE} alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img').closest('[data-slot="avatar"]');

    await expect(avatar).toHaveAttribute('data-slot', 'avatar');
    await expect(avatar).toHaveAttribute('data-size', 'lg');
    await expect(avatar).toHaveAttribute('data-shape', 'rounded');
  },
};

export const ImageAltText: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <Avatar>
      <AvatarImage src={SAMPLE_IMAGE} alt="John Doe profile picture" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = canvas.getByRole('img');

    await expect(image).toHaveAttribute('alt', 'John Doe profile picture');
  },
};

export const FallbackRendering: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <Avatar>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fallback = canvas.getByText('AB');

    await expect(fallback).toBeInTheDocument();
    await expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback');
  },
};

// ============================================
// ALL VARIANTS GRID (visual reference)
// ============================================

export const AllSizes: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Circle Shape - With Image
        </h3>
        <div className="nx:flex nx:items-end nx:gap-4">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="2xs">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">2xs</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xs">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">xs</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="sm">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">sm</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="md">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">md</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="lg">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">lg</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="2xl">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">2xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="3xl">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">3xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="4xl">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">4xl</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Rounded Shape - With Image
        </h3>
        <div className="nx:flex nx:items-end nx:gap-4">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="2xs" shape="rounded">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">2xs</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xs" shape="rounded">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">xs</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="sm" shape="rounded">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">sm</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="md" shape="rounded">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">md</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="lg" shape="rounded">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">lg</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="rounded">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="2xl" shape="rounded">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">2xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="3xl" shape="rounded">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">3xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="4xl" shape="rounded">
              <AvatarImage src={SAMPLE_IMAGE} alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">4xl</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Circle Shape - Fallback
        </h3>
        <div className="nx:flex nx:items-end nx:gap-4">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="2xs">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">2xs</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xs">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">xs</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="sm">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">sm</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="md">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">md</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="lg">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">lg</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="2xl">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">2xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="3xl">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">3xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="4xl">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">4xl</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Rounded Shape - Fallback
        </h3>
        <div className="nx:flex nx:items-end nx:gap-4">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="2xs" shape="rounded">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">2xs</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xs" shape="rounded">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">xs</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="sm" shape="rounded">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">sm</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="md" shape="rounded">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">md</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="lg" shape="rounded">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">lg</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="rounded">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="2xl" shape="rounded">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">2xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="3xl" shape="rounded">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">3xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="4xl" shape="rounded">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">4xl</span>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    chromatic: {
      modes: themeOnlyModes,
    },
  },
};

// ============================================
// EDGE CASES
// ============================================

export const LongInitials: Story = {
  render: () => (
    <div className="nx:flex nx:gap-4">
      <Avatar size="2xs">
        <AvatarFallback>ABC</AvatarFallback>
      </Avatar>
      <Avatar size="md">
        <AvatarFallback>ABC</AvatarFallback>
      </Avatar>
      <Avatar size="4xl">
        <AvatarFallback>ABC</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    chromatic: {
      modes: themeOnlyModes,
    },
  },
};

export const CustomClassName: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <Avatar className="nx:border-2 nx:border-primary-background">
      <AvatarImage src={SAMPLE_IMAGE} alt="User" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img').closest('[data-slot="avatar"]');

    await expect(avatar).toHaveClass('nx:border-2');
    await expect(avatar).toHaveClass('nx:border-primary-background');
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
