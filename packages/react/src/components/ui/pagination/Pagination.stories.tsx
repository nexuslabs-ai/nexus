import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

// The canonical row: previous/next edge controls, a run of page numbers with
// the current page active, and an ellipsis standing in for the pages skipped
// before the last one.
export const Default: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

// A short pager with no overflow — every page fits, so no ellipsis is needed.
export const FewPages: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

// Clicking a page link fires its handler — the consumer wires this to its
// paging state.
export const ClickInteraction: Story = {
  args: { onClick: fn() },
  render: (args) => {
    // Pagination links are anchors; with no router in a story, activating one
    // performs the default navigation and tears down the test page. Cancel it,
    // then let the spy observe the click.
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      args.onClick?.(event);
    };
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" onClick={handleClick}>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive onClick={handleClick}>
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page1 = canvas.getByRole('link', { name: '1' });

    await userEvent.click(page1);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

// Page links are reachable by Tab and activate on Enter — keyboard parity with
// pointer users.
export const KeyboardInteraction: Story = {
  args: { onClick: fn() },
  render: (args) => {
    // Enter on a focused anchor dispatches a click that would navigate; cancel
    // the default so the test page survives and the spy still records the call.
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      args.onClick?.(event);
    };
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" onClick={handleClick}>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page1 = canvas.getByRole('link', { name: '1' });

    await userEvent.tab();
    await expect(page1).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

// Every structural part carries a data-slot hook; the active page advertises
// itself to assistive tech via aria-current and exposes a data-active hook.
export const WithDataAttributes: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    for (const slot of [
      'pagination',
      'pagination-content',
      'pagination-item',
      'pagination-link',
      'pagination-ellipsis',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }

    const active = canvasElement.querySelector('[data-active="true"]');
    await expect(active).toHaveAttribute('aria-current', 'page');
  },
};

// The pagination root is a navigation landmark named by its aria-label — the
// <nav> element already is that landmark, so it carries no redundant `role`.
export const NavigationLandmark: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'pagination' });

    await expect(nav).not.toHaveAttribute('role');
  },
};

// The ellipsis stands in at the same footprint as an icon page link, tracking
// the link's live size token rather than a hand-copied value; a consumer
// className can still override it.
export const EllipsisFootprint: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis className="nx:size-8" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: '1' });
    const [ellipsis, overridden] = canvasElement.querySelectorAll(
      '[data-slot="pagination-ellipsis"]'
    );
    if (!ellipsis || !overridden) {
      throw new Error('EllipsisFootprint expects two ellipsis slots');
    }

    // Parity: the ellipsis carries the icon link's own size token, so this
    // breaks if buttonVariants' icon size ever moves.
    const linkSize = link.className.match(/nx:size-\d+/)?.[0];
    const ellipsisSize = ellipsis.className.match(/nx:size-\d+/)?.[0];
    await expect(linkSize).toBe('nx:size-10');
    await expect(ellipsisSize).toBe(linkSize);

    // A consumer className still overrides the footprint.
    await expect(overridden).toHaveClass('nx:size-8');
    await expect(overridden).not.toHaveClass('nx:size-10');
  },
};

// Composition: `asChild` routes the link styling onto a framework router link
// (next/link, TanStack Router) instead of the native <a>. The router link
// renders its own <a>, so the styling merges onto it — no nested <a><a>. The
// bare <a> here stands in for that router link.
export const AsChild: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious asChild>
            <a href="#prev">Previous</a>
          </PaginationPrevious>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink asChild>
            <a href="#page-1">1</a>
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink asChild isActive>
            <a href="#page-2">2</a>
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext asChild>
            <a href="#next">Next</a>
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The styling merges onto the slotted <a>: it carries the data-slot hook,
    // aria-current, and its own href — with no nested <a><a>.
    const page2 = canvas.getByRole('link', { name: '2' });
    await expect(page2).toHaveAttribute('href', '#page-2');
    await expect(page2).toHaveAttribute('data-slot', 'pagination-link');
    await expect(page2).toHaveAttribute('aria-current', 'page');
    await expect(page2.querySelector('a')).toBeNull();

    // Edge controls forward their slotted child too, keeping the preset label.
    const prev = canvas.getByRole('link', { name: 'Go to previous page' });
    await expect(prev).toHaveAttribute('href', '#prev');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// The full anatomy in one row: edge controls, ghost page links, the active
// page in its outline treatment, and the overflow ellipsis. Reused by the
// per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
