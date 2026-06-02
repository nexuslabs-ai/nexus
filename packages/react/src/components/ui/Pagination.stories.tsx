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
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#" onClick={args.onClick}>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive onClick={args.onClick}>
            2
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
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
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#" onClick={args.onClick}>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
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
