import type { Meta, StoryObj } from '@storybook/react';
import { IconUser } from '@tabler/icons-react';
import { expect, waitFor, within } from 'storybook/test';

import { expectInsetOutlinePseudoElement } from '../../stories/support/pseudo-element-style';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  AvatarStatus,
} from './avatar';
import { STARTER_AVATARS } from './avatar-fixtures';

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

// The 5 starter portraits double as the demo team roster.
const TEAM = STARTER_AVATARS;

// Default single-avatar fixture (Ada) for the size / shape / state stories.
const AVATAR_URL = STARTER_AVATARS[0].src;

// Deliberately wide (2:1) source so CroppedImage can demonstrate object-fit: cover.
const WIDE_AVATAR_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 90">
    <rect width="180" height="90" fill="#ddd6fe"/>
    <circle cx="45" cy="45" r="28" fill="#a78bfa"/>
    <rect x="88" y="16" width="68" height="58" rx="12" fill="#7c3aed"/>
  </svg>
`)}`;

function expectAvatarHairline(
  element: Element | null,
  missingMessage = 'avatar root not found'
) {
  expectInsetOutlinePseudoElement(element, {
    token: '--nx-color-border-hairline',
    missingMessage,
  });
}

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
      <AvatarImage src={person.src} alt={person.name} />
      <AvatarFallback>{person.initials}</AvatarFallback>
      {status ? <AvatarStatus status={status} /> : null}
    </Avatar>
  );
}

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  args: {
    size: 'md',
    shape: 'circle',
    ring: false,
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const MotionTokenBridge: Story = {
  render: (_args) => (
    <Avatar>
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const image = await waitFor(() => {
      const img = canvasElement.querySelector('[data-slot="avatar-image"]');
      if (!img) throw new Error('avatar image has not mounted yet');
      return img;
    });

    await expect(getComputedStyle(image).animationDuration).toBe('0.15s');
  },
};

export const DefaultDataAttributes: Story = {
  // With size/shape omitted, the cva defaults (md / circle) must still surface
  // on data-size / data-shape so CSS and test hooks can target the default.
  render: (_args) => (
    <Avatar role="img" aria-label="Default avatar">
      <AvatarFallback aria-hidden="true">AL</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[data-slot="avatar"]');
    await expect(avatar).toHaveAttribute('data-size', 'md');
    await expect(avatar).toHaveAttribute('data-shape', 'circle');
    // #496: initials text scales with the avatar diameter via arbitrary rem
    // (16px/36px have no composite, so the whole scale stays arbitrary, matching
    // the pre-existing 2xs/xs). md → text-[1rem], migrated from the raw named text-size utility.
    await expect(avatar).toHaveClass('nx:text-[1rem]');
  },
};

export const ImageHairline: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="avatar"]');
    const image = await waitFor(() => {
      const img = canvasElement.querySelector('[data-slot="avatar-image"]');
      if (!img) throw new Error('avatar image has not mounted yet');
      return img;
    });

    expectAvatarHairline(root);
    await expect(image).not.toHaveClass('nx:after:outline-border-hairline');
  },
};

export const ImageHairlineLightDark: Story = {
  render: () => (
    <div className="nx:grid nx:grid-cols-2 nx:gap-4">
      <div className="nx:flex nx:items-center nx:gap-3 nx:rounded-md nx:bg-background nx:p-4">
        <Avatar>
          <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar shape="rounded">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
      <div className="dark nx:flex nx:items-center nx:gap-3 nx:rounded-md nx:bg-background nx:p-4">
        <Avatar>
          <AvatarImage src={AVATAR_URL} alt="Ada Lovelace" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar shape="rounded">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const avatars = canvasElement.querySelectorAll('[data-slot="avatar"]');

    await expect(avatars).toHaveLength(4);
    expectAvatarHairline(avatars.item(0));
    expectAvatarHairline(avatars.item(1));
    expectAvatarHairline(avatars.item(2));
    expectAvatarHairline(avatars.item(3));
  },
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
      <span className="nx:typography-label-default nx:text-foreground">
        Ada Lovelace
      </span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Ada Lovelace');

    // Radix mounts the <img> only after its (async) load resolves, so wait for
    // it rather than querying synchronously — a sync read races the load.
    const image = await waitFor(() => {
      const img = canvasElement.querySelector('[data-slot="avatar-image"]');
      if (!img) throw new Error('avatar image has not mounted yet');
      return img;
    });
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
// ILLUSTRATED VARIANTS
// ============================================

export const StarterVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-wrap nx:items-start nx:gap-6">
      {STARTER_AVATARS.map((person) => (
        <div
          key={person.name}
          className="nx:flex nx:flex-col nx:items-center nx:gap-2"
        >
          <Avatar size="xl">
            <AvatarImage src={person.src} alt="" />
            <AvatarFallback aria-hidden="true">
              {person.initials}
            </AvatarFallback>
          </Avatar>
          <span className="nx:typography-label-small nx:text-muted-foreground">
            {person.name}
          </span>
        </div>
      ))}
    </div>
  ),
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
    // The dot is announced (not aria-hidden): it carries a visually-hidden label.
    await expect(statuses[0]).not.toHaveAttribute('aria-hidden');
    await expect(statuses[0]).toHaveTextContent('Online');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Each status carries a visually-hidden label, so presence is announced
    // rather than conveyed by colour alone (WCAG 1.4.1).
    for (const label of ['Online', 'Away', 'Busy', 'Offline']) {
      await expect(canvas.getByText(label)).toBeInTheDocument();
    }
  },
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
    // The overflow tile announces its count instead of a bare "+2" glyph.
    await expect(
      canvas.getByRole('img', { name: '2 more' })
    ).toBeInTheDocument();
  },
};

export const GroupSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A group sizes its members — and the `+N` overflow tile — in one place via `size`, and the overlap scales with that size. Members inherit it through the `TeamAvatar` wrapper via the size context.',
      },
    },
  },
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <AvatarGroup
          key={size}
          size={size}
          max={3}
          role="group"
          aria-label={`Project team ${size}`}
        >
          {TEAM.map((person) => (
            <TeamAvatar key={person.name} person={person} />
          ))}
        </AvatarGroup>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lgGroup = canvas.getByRole('group', { name: 'Project team lg' });
    const avatars = lgGroup.querySelectorAll('[data-slot="avatar"]');

    // Members inherit the group size through the TeamAvatar wrapper (context).
    await expect(avatars[0]).toHaveAttribute('data-size', 'lg');
    // The +N overflow tile inherits it too — no hardcoded md mismatch.
    const overflow = within(lgGroup)
      .getByText('+2')
      .closest('[data-slot="avatar"]');
    await expect(overflow).toHaveAttribute('data-size', 'lg');
  },
};

export const OnContainerSurface: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Avatars on a `container` surface (e.g. a card). The separator and status rings read `--avatar-surface` — set here to the container colour — so they match the card instead of leaving a `background`-coloured halo.',
      },
    },
  },
  render: (_args) => (
    <div className="nx:rounded-xl nx:bg-container nx:p-6 nx:[--avatar-surface:var(--nx-color-container)]">
      <AvatarGroup max={4} role="group" aria-label="Team on a card">
        {TEAM.map((person, index) => (
          <TeamAvatar
            key={person.name}
            person={person}
            status={STATUS_VALUES[index % STATUS_VALUES.length]}
          />
        ))}
      </AvatarGroup>
    </div>
  ),
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
    await expect(image).toHaveAttribute('decoding', 'async');
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
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
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
              <span className="nx:typography-label-small nx:text-muted-foreground">
                {size}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Shapes
        </h3>
        <div className="nx:flex nx:items-center nx:gap-4">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="circle">
              <AvatarImage src={AVATAR_URL} alt="Ada Lovelace circle" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span className="nx:typography-label-small nx:text-muted-foreground">
              circle
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" shape="rounded">
              <AvatarImage src={AVATAR_URL} alt="Ada Lovelace rounded" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span className="nx:typography-label-small nx:text-muted-foreground">
              rounded
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Fallback States
        </h3>
        <div className="nx:flex nx:items-center nx:gap-4">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" role="img" aria-label="Ada Lovelace">
              <AvatarFallback aria-hidden="true">AL</AvatarFallback>
            </Avatar>
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Initials
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Avatar size="xl" role="img" aria-label="Unknown user">
              <AvatarFallback aria-hidden="true">
                <IconUser aria-hidden="true" className="nx:size-6" />
              </AvatarFallback>
            </Avatar>
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Icon
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
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
