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

    // The cursor rule rides the same static cva string as everywhere else, so
    // a non-interactive row proves the `:is(button)` scoping actually bites.
    await expect(heading).not.toHaveStyle({ cursor: 'pointer' });
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

/**
 * A `disabled` or `aria-disabled` `asChild` child is inert — the row drops
 * pointer events, so neither the hover recolour nor the pointer cursor fires,
 * and its foreground mutes to `text-disabled-foreground`. The enabled row is
 * rendered alongside so the two are comparable.
 */
export const Disabled: StoryObj<MarkerProps & { onRevert: () => void }> = {
  args: { onRevert: fn() },
  render: (args) => (
    <div className={stack}>
      <Marker asChild>
        <button type="button" onClick={args.onRevert}>
          <MarkerIcon>
            <RotateCcwIcon />
          </MarkerIcon>
          <MarkerContent>Revert this change</MarkerContent>
        </button>
      </Marker>
      <Marker asChild>
        <button type="button" disabled onClick={args.onRevert}>
          <MarkerIcon>
            <RotateCcwIcon />
          </MarkerIcon>
          <MarkerContent>Delete this draft</MarkerContent>
        </button>
      </Marker>
      <Marker asChild>
        <a href="#pull-request" aria-disabled="true" tabIndex={-1}>
          <MarkerIcon>
            <GitBranchIcon />
          </MarkerIcon>
          <MarkerContent>View the pull request</MarkerContent>
        </a>
      </Marker>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const enabled = canvas.getByRole('button', { name: 'Revert this change' });
    const disabled = canvas.getByRole('button', { name: 'Delete this draft' });
    const link = canvas.getByRole('link', { name: 'View the pull request' });

    const enabledColor = getComputedStyle(enabled).color;

    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveStyle({ pointerEvents: 'none' });
    await expect(disabled).not.toHaveStyle({ color: enabledColor });

    // user-event refuses to click through `pointer-events: none`, so the check
    // is bypassed to prove the handler stays silent on the native path too.
    await userEvent.click(disabled, { pointerEventsCheck: 0 });
    await expect(args.onRevert).not.toHaveBeenCalled();

    // An `a` ignores native `disabled`, so the row's inertness rests entirely
    // on the aria-disabled pair.
    await expect(link).toHaveStyle({ pointerEvents: 'none' });
    await expect(link).not.toHaveStyle({ color: enabledColor });
  },
};

/**
 * The two `variant="separator"` rules are painted with `background-color` on
 * `::before` / `::after`, which the forced-color adjustment flattens to
 * `Canvas`. Both carry a `CanvasText` fallback so the divider survives Windows
 * High Contrast Mode; `Separator` carries the same fallback. HCM itself is
 * visual evidence — the play function only guards that the rules paint at all.
 */
export const ForcedColors: Story = {
  render: () => (
    <Marker variant="separator">
      <MarkerContent>Today</MarkerContent>
    </Marker>
  ),
  play: async ({ canvasElement }) => {
    const marker = canvasElement.querySelector('[data-slot="marker"]');
    const before = getComputedStyle(marker!, '::before').backgroundColor;
    const after = getComputedStyle(marker!, '::after').backgroundColor;

    await expect(before).toBe(after);
    await expect(before).not.toBe('rgba(0, 0, 0, 0)');
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

    // A bare <button> has no UA pointer cursor, so this is the row's own
    // `:is(button)` rule — the AsChild heading proves the negative case.
    await expect(button).toHaveStyle({ cursor: 'pointer' });

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
