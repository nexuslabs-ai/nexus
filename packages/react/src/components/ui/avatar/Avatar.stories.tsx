import type { Meta, StoryObj } from '@storybook/react';
import { IconUser } from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  AvatarStatus,
} from './avatar';

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
    ring: {
      control: 'boolean',
      description: 'Adds a non-interactive emphasis ring',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

const AVATAR_SIZES = [
  '2xs',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
] as const;

const STATUS_VALUES = ['online', 'away', 'busy', 'offline'] as const;

const TEAM = [
  { name: 'Ada Lovelace', initials: 'AL' },
  { name: 'Grace Hopper', initials: 'GH' },
  { name: 'Katherine Johnson', initials: 'KJ' },
  { name: 'Mary Jackson', initials: 'MJ' },
  { name: 'Dorothy Vaughan', initials: 'DV' },
] as const;

const AVATAR_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" fill="#dbeafe"/>
    <circle cx="60" cy="48" r="24" fill="#60a5fa"/>
    <path d="M24 112c7-29 65-29 72 0" fill="#1d4ed8"/>
  </svg>
`)}`;

const WIDE_AVATAR_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 90">
    <rect width="180" height="90" fill="#dcfce7"/>
    <circle cx="45" cy="45" r="28" fill="#22c55e"/>
    <rect x="88" y="16" width="68" height="58" rx="12" fill="#166534"/>
  </svg>
`)}`;

function avatarLabel(size: (typeof AVATAR_SIZES)[number]) {
  if (size === '2xs') return '2X';
  if (size === 'xs') return 'XS';
  return size.toUpperCase();
}

function TeamAvatar({
  person,
  status,
}: {
  person: (typeof TEAM)[number];
  status?: (typeof STATUS_VALUES)[number];
}) {
  return (
    <Avatar>
      <AvatarImage src={AVATAR_URL} alt={person.name} />
      <AvatarFallback>{person.initials}</AvatarFallback>
      {status ? <AvatarStatus status={status} /> : null}
    </Avatar>
  );
}

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <Avatar>
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: (_args) => (
    <Avatar role="img" aria-label="Ada Lovelace">
      <AvatarImage src="/broken-image.jpg" alt="" />
      <AvatarFallback aria-hidden="true">AL</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackOnly: Story = {
  render: (_args) => (
    <Avatar role="img" aria-label="Ada Byron">
      <AvatarFallback aria-hidden="true">AB</AvatarFallback>
    </Avatar>
  ),
};

export const WithIcon: Story = {
  render: (_args) => (
    <Avatar role="img" aria-label="Unknown user">
      <AvatarFallback aria-hidden="true">
        <IconUser aria-hidden="true" className="nx:size-5" />
      </AvatarFallback>
    </Avatar>
  ),
};

export const CroppedImage: Story = {
  render: (_args) => (
    <Avatar size="4xl" shape="rounded">
      <AvatarImage src={WIDE_AVATAR_URL} alt="Wide portrait crop" />
      <AvatarFallback>WC</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByAltText('Wide portrait crop');

    await expect(getComputedStyle(image).objectFit).toBe('cover');
  },
};

export const Decorative: Story = {
  render: (_args) => (
    <div className="nx:flex nx:items-center nx:gap-3">
      <Avatar size="sm">
        <AvatarImage src={AVATAR_URL} alt="" />
        <AvatarFallback aria-hidden="true">AL</AvatarFallback>
      </Avatar>
      <span className="nx:text-sm nx:font-medium nx:text-foreground">
        Ada Lovelace
      </span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Ada Lovelace');

    const image = canvasElement.querySelector('[data-slot="avatar-image"]');
    await expect(image).toHaveAttribute('alt', '');
  },
};

export const StandaloneFallbackAccessible: Story = {
  render: (_args) => (
    <Avatar role="img" aria-label="Ada Lovelace">
      <AvatarFallback aria-hidden="true">AL</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img', { name: 'Ada Lovelace' });

    await expect(avatar).toHaveAttribute('data-slot', 'avatar');
  },
};

// ============================================
// SIZE STORIES
// ============================================

export const Size2xs: Story = {
  render: (_args) => (
    <Avatar size="2xs">
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const SizeXs: Story = {
  render: (_args) => (
    <Avatar size="xs">
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const SizeSm: Story = {
  render: (_args) => (
    <Avatar size="sm">
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const SizeMd: Story = {
  render: (_args) => (
    <Avatar size="md">
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const SizeLg: Story = {
  render: (_args) => (
    <Avatar size="lg">
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const SizeXl: Story = {
  render: (_args) => (
    <Avatar size="xl">
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const Size2xl: Story = {
  render: (_args) => (
    <Avatar size="2xl">
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const Size3xl: Story = {
  render: (_args) => (
    <Avatar size="3xl">
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const Size4xl: Story = {
  render: (_args) => (
    <Avatar size="4xl">
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

// ============================================
// SHAPE STORIES
// ============================================

export const ShapeCircle: Story = {
  render: (_args) => (
    <Avatar shape="circle">
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const ShapeRounded: Story = {
  render: (_args) => (
    <Avatar shape="rounded">
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

// ============================================
// STATUS, RING, AND GROUP STORIES
// ============================================

export const WithStatus: Story = {
  render: (_args) => (
    <div className="nx:flex nx:items-end nx:gap-4">
      {AVATAR_SIZES.map((size) => (
        <Avatar key={size} size={size}>
          <AvatarImage src={AVATAR_URL} alt={`Ada Lovelace ${size}`} />
          <AvatarFallback>{avatarLabel(size)}</AvatarFallback>
          <AvatarStatus />
        </Avatar>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const statuses = canvasElement.querySelectorAll(
      '[data-slot="avatar-status"]'
    );

    await expect(statuses).toHaveLength(AVATAR_SIZES.length);
    await expect(statuses[0]).toHaveAttribute('data-status', 'online');
  },
};

export const StatusVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:items-center nx:gap-4">
      {STATUS_VALUES.map((status, index) => (
        <Avatar key={status} size="lg">
          <AvatarFallback>{TEAM[index]?.initials ?? 'NA'}</AvatarFallback>
          <AvatarStatus status={status} />
        </Avatar>
      ))}
    </div>
  ),
};

export const WithRing: Story = {
  render: (_args) => (
    <Avatar ring>
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[data-slot="avatar"]');

    await expect(avatar).toHaveAttribute('data-ring', 'true');
  },
};

export const Group: Story = {
  render: (_args) => (
    <AvatarGroup role="group" aria-label="Project team">
      {TEAM.slice(0, 4).map((person, index) => (
        <TeamAvatar
          key={person.name}
          person={person}
          status={STATUS_VALUES[index]}
        />
      ))}
    </AvatarGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', {
      name: 'Project team',
    });
    const avatars = group.querySelectorAll('[data-slot="avatar"]');

    await expect(avatars).toHaveLength(4);
  },
};

export const GroupWithMax: Story = {
  render: (_args) => (
    <AvatarGroup max={3} role="group" aria-label="Project team">
      {TEAM.map((person, index) => (
        <TeamAvatar
          key={person.name}
          person={person}
          status={STATUS_VALUES[index % STATUS_VALUES.length]}
        />
      ))}
    </AvatarGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Project team' });
    const avatars = group.querySelectorAll('[data-slot="avatar"]');

    await expect(avatars).toHaveLength(4);
    await expect(canvas.getByText('+2')).toBeInTheDocument();
  },
};

// ============================================
// DATA ATTRIBUTES TESTS
// ============================================

export const WithDataAttributes: Story = {
  render: (_args) => (
    <Avatar size="lg" shape="rounded" ring>
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
      <AvatarStatus status="busy" />
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByAltText('Ada Lovelace');
    const avatar = canvasElement.querySelector('[data-slot="avatar"]');
    const status = canvasElement.querySelector('[data-slot="avatar-status"]');

    await expect(avatar).toBeInTheDocument();
    await expect(avatar).toHaveAttribute('data-size', 'lg');
    await expect(avatar).toHaveAttribute('data-shape', 'rounded');
    await expect(avatar).toHaveAttribute('data-ring', 'true');
    await expect(image).toHaveAttribute('data-slot', 'avatar-image');
    await expect(status).toHaveAttribute('data-status', 'busy');
  },
};

export const FallbackDataAttributes: Story = {
  render: (_args) => (
    <Avatar role="img" aria-label="Ada Byron">
      <AvatarFallback aria-hidden="true">AB</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const fallback = canvasElement.querySelector(
      '[data-slot="avatar-fallback"]'
    );
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img', { name: 'Ada Byron' });

    await expect(fallback).toBeInTheDocument();
    await expect(avatar).toHaveAttribute('data-slot', 'avatar');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllSizes: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:mb-4 nx:text-sm nx:font-medium nx:text-foreground">
          All Sizes (Circle)
        </h3>
        <div className="nx:flex nx:items-end nx:gap-4">
          {AVATAR_SIZES.map((size) => (
            <div
              key={size}
              className="nx:flex nx:flex-col nx:items-center nx:gap-2"
            >
              <Avatar size={size}>
                <AvatarImage src={AVATAR_URL} alt={`Ada Lovelace ${size}`} />
                <AvatarFallback>{avatarLabel(size)}</AvatarFallback>
              </Avatar>
              <span className="nx:text-xs nx:text-muted-foreground">
                {size}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:text-sm nx:font-medium nx:text-foreground">
          Shapes
        </h3>
        <div className="nx:flex nx:items-center nx:gap-4">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="circle">
              <AvatarImage src={AVATAR_URL} alt="Ada Lovelace circle" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">circle</span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="rounded">
              <AvatarImage src={AVATAR_URL} alt="Ada Lovelace rounded" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">rounded</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:text-sm nx:font-medium nx:text-foreground">
          Fallback States
        </h3>
        <div className="nx:flex nx:items-center nx:gap-4">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" role="img" aria-label="Ada Lovelace">
              <AvatarFallback aria-hidden="true">AL</AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">
              Initials
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" role="img" aria-label="Unknown user">
              <AvatarFallback aria-hidden="true">
                <IconUser aria-hidden="true" className="nx:size-6" />
              </AvatarFallback>
            </Avatar>
            <span className="nx:text-xs nx:text-muted-foreground">Icon</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:text-sm nx:font-medium nx:text-foreground">
          Status, Ring, and Group
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-6">
          <Avatar size="xl" ring>
            <AvatarImage src={AVATAR_URL} alt="Ada Lovelace selected" />
            <AvatarFallback>AL</AvatarFallback>
            <AvatarStatus status="online" />
          </Avatar>
          <AvatarGroup max={3}>
            {TEAM.map((person, index) => (
              <TeamAvatar
                key={person.name}
                person={person}
                status={STATUS_VALUES[index % STATUS_VALUES.length]}
              />
            ))}
          </AvatarGroup>
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
