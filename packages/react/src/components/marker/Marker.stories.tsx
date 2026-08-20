import type { Meta, StoryObj } from '@storybook/react';
import {
  BookOpenCheckIcon,
  CheckIcon,
  FileTextIcon,
  GitBranchIcon,
  PencilIcon,
  RotateCcwIcon,
  SearchIcon,
} from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Spinner } from '../spinner';

import { Marker, MarkerContent, MarkerIcon, type MarkerProps } from './marker';

const meta: Meta<typeof Marker> = {
  title: 'Components/Marker',
  component: Marker,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Marker>;

const stack = 'nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-6';

const row =
  'nx:rounded-md nx:border-default nx:border-border-default nx:bg-container nx:p-3 nx:typography-body-default nx:text-container-foreground';

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: () => (
    <Marker>
      <MarkerContent>Edited 2 minutes ago</MarkerContent>
    </Marker>
  ),
};

export const Separator: Story = {
  render: () => (
    <div className={stack}>
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Worked for 42s</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Conversation compacted</MarkerContent>
      </Marker>
    </div>
  ),
};

export const Border: Story = {
  render: () => (
    <div className={stack}>
      <Marker variant="border">
        <MarkerIcon>
          <GitBranchIcon />
        </MarkerIcon>
        <MarkerContent>Switched to release-candidate</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <SearchIcon />
        </MarkerIcon>
        <MarkerContent>Reviewed 8 related files</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <FileTextIcon />
        </MarkerIcon>
        <MarkerContent>Opened implementation notes</MarkerContent>
      </Marker>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className={stack}>
      <Marker>
        <MarkerIcon>
          <PencilIcon />
        </MarkerIcon>
        <MarkerContent>Edited 2 minutes ago</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerIcon>
          <SearchIcon />
        </MarkerIcon>
        <MarkerContent>Explored 4 files</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <BookOpenCheckIcon />
        </MarkerIcon>
        <MarkerContent>Syncing completed</MarkerContent>
      </Marker>
    </div>
  ),
};

/**
 * `role="status"` announces the row as it changes, so a live progress marker
 * reaches assistive tech without stealing focus.
 */
export const Status: Story = {
  render: () => (
    <div className={stack}>
      <Marker role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>Compacting conversation</MarkerContent>
      </Marker>
      <Marker variant="separator" role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>Running tests</MarkerContent>
      </Marker>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first] = canvas.getAllByRole('status');

    await expect(first).toHaveTextContent('Compacting conversation');
  },
};

// ============================================
// EDGE CASES
// ============================================

export const LongContent: Story = {
  render: () => (
    <div className="nx:max-w-64">
      <Marker variant="separator">
        <MarkerContent>
          Everything below this point was synced from a device that has been
          offline since last Tuesday
        </MarkerContent>
      </Marker>
    </div>
  ),
};

export const WithLink: Story = {
  render: () => (
    <Marker>
      <MarkerContent>
        Draft saved. <a href="#restore">Restore the previous version</a>
      </MarkerContent>
    </Marker>
  ),
};

// ============================================
// COMPOSITION
// ============================================

export const InContext: Story = {
  render: () => (
    <div className="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-3">
      <div className={row}>Rewrote the onboarding copy</div>
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <div className={row}>Shipped the appearance provider</div>
      <div className={row}>Reviewed the token audit</div>
      <Marker>
        <MarkerIcon>
          <PencilIcon />
        </MarkerIcon>
        <MarkerContent>Edited 2 minutes ago</MarkerContent>
      </Marker>
    </div>
  ),
};

export const AsChild: Story = {
  render: () => (
    <Marker asChild variant="border">
      <h3>
        <MarkerContent>Yesterday</MarkerContent>
      </h3>
    </Marker>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', { name: 'Yesterday' });

    await expect(heading).toHaveAttribute('data-slot', 'marker');
    await expect(heading).toHaveAttribute('data-variant', 'border');
  },
};

export const AsChildLink: Story = {
  render: () => (
    <Marker asChild>
      <a href="#pull-request">
        <MarkerIcon>
          <GitBranchIcon />
        </MarkerIcon>
        <MarkerContent>View the pull request</MarkerContent>
      </a>
    </Marker>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'View the pull request' });

    await expect(link).toHaveAttribute('data-slot', 'marker');
  },
};

export const ClickInteraction: StoryObj<
  MarkerProps & { onRevert: () => void }
> = {
  args: { onRevert: fn() },
  render: (args) => (
    <Marker asChild>
      <button type="button" onClick={args.onRevert}>
        <MarkerIcon>
          <RotateCcwIcon />
        </MarkerIcon>
        <MarkerContent>Revert this change</MarkerContent>
      </button>
    </Marker>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Revert this change' });

    await userEvent.click(button);
    await expect(args.onRevert).toHaveBeenCalledTimes(1);
  },
};

export const KeyboardInteraction: StoryObj<
  MarkerProps & { onRevert: () => void }
> = {
  args: { onRevert: fn() },
  render: (args) => (
    <Marker asChild>
      <button type="button" onClick={args.onRevert}>
        <MarkerContent>Revert this change</MarkerContent>
      </button>
    </Marker>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Revert this change' });

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onRevert).toHaveBeenCalledTimes(1);
  },
};

// ============================================
// DATA ATTRIBUTES
// ============================================

export const WithDataAttributes: Story = {
  render: () => (
    <Marker variant="separator">
      <MarkerIcon>
        <CheckIcon />
      </MarkerIcon>
      <MarkerContent>Today</MarkerContent>
    </Marker>
  ),
  play: async ({ canvasElement }) => {
    const marker = canvasElement.querySelector('[data-slot="marker"]');
    const icon = canvasElement.querySelector('[data-slot="marker-icon"]');
    const content = canvasElement.querySelector('[data-slot="marker-content"]');

    await expect(marker).toHaveAttribute('data-variant', 'separator');
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(content).toHaveTextContent('Today');
  },
};

// ============================================
// ALL VARIANTS
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-6">
      {(['default', 'separator', 'border'] as const).map((variant) => (
        <div key={variant} className="nx:flex nx:flex-col nx:gap-2">
          <span className="nx:typography-label-small nx:text-muted-foreground-subtle">
            variant=&quot;{variant}&quot;
          </span>
          <Marker variant={variant}>
            <MarkerContent>Today</MarkerContent>
          </Marker>
          <Marker variant={variant}>
            <MarkerIcon>
              <CheckIcon />
            </MarkerIcon>
            <MarkerContent>Today, with an icon</MarkerContent>
          </Marker>
        </div>
      ))}
    </div>
  ),
};
