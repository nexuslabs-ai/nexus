import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { themeOnlyModes } from '@/storybook/modes';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
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

// Sample image URL for stories
const sampleImageUrl =
  'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=128&h=128&fit=crop&crop=faces';

// =============================================================================
// Default Stories
// =============================================================================

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/broken-image.jpg" alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackOnly: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

// =============================================================================
// Size Stories
// =============================================================================

export const Size2XS: Story = {
  args: { size: '2xs' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const SizeXS: Story = {
  args: { size: 'xs' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const SizeSM: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const SizeMD: Story = {
  args: { size: 'md' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const SizeLG: Story = {
  args: { size: 'lg' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const SizeXL: Story = {
  args: { size: 'xl' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Size2XL: Story = {
  args: { size: '2xl' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Size3XL: Story = {
  args: { size: '3xl' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Size4XL: Story = {
  args: { size: '4xl' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

// =============================================================================
// Shape Stories
// =============================================================================

export const ShapeCircle: Story = {
  args: { shape: 'circle', size: 'lg' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const ShapeRounded: Story = {
  args: { shape: 'rounded', size: 'lg' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

// =============================================================================
// Play Function Tests
// =============================================================================

export const WithDataAttributes: Story = {
  args: { size: 'lg', shape: 'circle' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImageUrl} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img').closest('[data-slot="avatar"]');

    await expect(avatar).toHaveAttribute('data-slot', 'avatar');
    await expect(avatar).toHaveAttribute('data-size', 'lg');
    await expect(avatar).toHaveAttribute('data-shape', 'circle');
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export const FallbackDataAttributes: Story = {
  render: () => (
    <Avatar size="md" shape="rounded">
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fallback = canvas.getByText('AB');

    await expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback');
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export const ImageAccessibility: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarImage src={sampleImageUrl} alt="John Doe's profile picture" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = canvas.getByRole('img');

    await expect(image).toHaveAccessibleName("John Doe's profile picture");
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

// =============================================================================
// All Variants Grid
// =============================================================================

export const AllSizes: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <h3 className="nx:mb-3 nx:text-sm nx:font-medium nx:text-foreground">
          Circle Shape - All Sizes
        </h3>
        <div className="nx:flex nx:items-end nx:gap-3">
          {(['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map(
            (size) => (
              <div key={size} className="nx:flex nx:flex-col nx:items-center nx:gap-1">
                <Avatar size={size} shape="circle">
                  <AvatarImage src={sampleImageUrl} alt="User avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="nx:text-xs nx:text-muted-foreground">{size}</span>
              </div>
            )
          )}
        </div>
      </div>
      <div>
        <h3 className="nx:mb-3 nx:text-sm nx:font-medium nx:text-foreground">
          Rounded Shape - All Sizes
        </h3>
        <div className="nx:flex nx:items-end nx:gap-3">
          {(['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map(
            (size) => (
              <div key={size} className="nx:flex nx:flex-col nx:items-center nx:gap-1">
                <Avatar size={size} shape="rounded">
                  <AvatarImage src={sampleImageUrl} alt="User avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="nx:text-xs nx:text-muted-foreground">{size}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    chromatic: { modes: themeOnlyModes },
  },
};

export const AllFallbacks: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <h3 className="nx:mb-3 nx:text-sm nx:font-medium nx:text-foreground">
          Fallback - Circle Shape
        </h3>
        <div className="nx:flex nx:items-end nx:gap-3">
          {(['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map(
            (size) => (
              <div key={size} className="nx:flex nx:flex-col nx:items-center nx:gap-1">
                <Avatar size={size} shape="circle">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="nx:text-xs nx:text-muted-foreground">{size}</span>
              </div>
            )
          )}
        </div>
      </div>
      <div>
        <h3 className="nx:mb-3 nx:text-sm nx:font-medium nx:text-foreground">
          Fallback - Rounded Shape
        </h3>
        <div className="nx:flex nx:items-end nx:gap-3">
          {(['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map(
            (size) => (
              <div key={size} className="nx:flex nx:flex-col nx:items-center nx:gap-1">
                <Avatar size={size} shape="rounded">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="nx:text-xs nx:text-muted-foreground">{size}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    chromatic: { modes: themeOnlyModes },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:mb-3 nx:text-sm nx:font-medium nx:text-foreground">
          With Image
        </h3>
        <div className="nx:flex nx:gap-6">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="circle">
              <AvatarImage src={sampleImageUrl} alt="User avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">Circle</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="rounded">
              <AvatarImage src={sampleImageUrl} alt="User avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">Rounded</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="nx:mb-3 nx:text-sm nx:font-medium nx:text-foreground">
          With Fallback
        </h3>
        <div className="nx:flex nx:gap-6">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="circle">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">Circle</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="rounded">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">Rounded</span>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    chromatic: { modes: themeOnlyModes },
  },
};
