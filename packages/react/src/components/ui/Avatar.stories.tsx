import type { Meta, StoryObj } from '@storybook/react';
import { IconUser } from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'padded',
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

// Sample avatar image URL
const AVATAR_URL =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face';

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <Avatar>
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: (_args) => (
    <Avatar>
      <AvatarImage src="/broken-image.jpg" alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackOnly: Story = {
  render: (_args) => (
    <Avatar>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const WithIcon: Story = {
  render: (_args) => (
    <Avatar>
      <AvatarFallback>
        <IconUser className="nx:size-5" />
      </AvatarFallback>
    </Avatar>
  ),
};

// ============================================
// SIZE STORIES
// ============================================

export const Size2xs: Story = {
  render: (_args) => (
    <Avatar size="2xs">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const SizeXs: Story = {
  render: (_args) => (
    <Avatar size="xs">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const SizeSm: Story = {
  render: (_args) => (
    <Avatar size="sm">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const SizeMd: Story = {
  render: (_args) => (
    <Avatar size="md">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const SizeLg: Story = {
  render: (_args) => (
    <Avatar size="lg">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const SizeXl: Story = {
  render: (_args) => (
    <Avatar size="xl">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Size2xl: Story = {
  render: (_args) => (
    <Avatar size="2xl">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Size3xl: Story = {
  render: (_args) => (
    <Avatar size="3xl">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Size4xl: Story = {
  render: (_args) => (
    <Avatar size="4xl">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

// ============================================
// SHAPE STORIES
// ============================================

export const ShapeCircle: Story = {
  render: (_args) => (
    <Avatar shape="circle">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const ShapeRounded: Story = {
  render: (_args) => (
    <Avatar shape="rounded">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

// ============================================
// DATA ATTRIBUTES TESTS
// ============================================

export const WithDataAttributes: Story = {
  render: (_args) => (
    <Avatar size="lg" shape="rounded">
      <AvatarImage src={AVATAR_URL} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[data-slot="avatar"]');
    const image = canvasElement.querySelector('[data-slot="avatar-image"]');

    await expect(avatar).toBeInTheDocument();
    await expect(avatar).toHaveAttribute('data-size', 'lg');
    await expect(avatar).toHaveAttribute('data-shape', 'rounded');
    await expect(image).toBeInTheDocument();
  },
};

export const FallbackDataAttributes: Story = {
  render: (_args) => (
    <Avatar>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const fallback = canvasElement.querySelector(
      '[data-slot="avatar-fallback"]'
    );

    await expect(fallback).toBeInTheDocument();

    // Check fallback text
    const canvas = within(canvasElement);
    const fallbackText = canvas.getByText('AB');
    await expect(fallbackText).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllSizes: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          All Sizes (Circle)
        </h3>
        <div className="nx:flex nx:items-end nx:gap-4">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="2xs">
              <AvatarImage src={AVATAR_URL} alt="User" />
              <AvatarFallback>2X</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">2xs</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xs">
              <AvatarImage src={AVATAR_URL} alt="User" />
              <AvatarFallback>XS</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">xs</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="sm">
              <AvatarImage src={AVATAR_URL} alt="User" />
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">sm</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="md">
              <AvatarImage src={AVATAR_URL} alt="User" />
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">md</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="lg">
              <AvatarImage src={AVATAR_URL} alt="User" />
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">lg</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl">
              <AvatarImage src={AVATAR_URL} alt="User" />
              <AvatarFallback>XL</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="2xl">
              <AvatarImage src={AVATAR_URL} alt="User" />
              <AvatarFallback>2X</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">2xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="3xl">
              <AvatarImage src={AVATAR_URL} alt="User" />
              <AvatarFallback>3X</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">3xl</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="4xl">
              <AvatarImage src={AVATAR_URL} alt="User" />
              <AvatarFallback>4X</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">4xl</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Shapes
        </h3>
        <div className="nx:flex nx:items-center nx:gap-4">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="circle">
              <AvatarImage src={AVATAR_URL} alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">circle</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="rounded">
              <AvatarImage src={AVATAR_URL} alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">rounded</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Fallback States
        </h3>
        <div className="nx:flex nx:items-center nx:gap-4">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">
              Initials
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl">
              <AvatarFallback>
                <IconUser className="nx:size-6" />
              </AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">Icon</span>
          </div>
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
