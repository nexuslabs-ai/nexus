import type { Meta, StoryObj } from '@storybook/react';
import { IconUsers } from '@tabler/icons-react';
import { expect } from 'storybook/test';

import { Button } from '../button';

import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from './empty-state';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

// The canonical empty state: an icon medallion, a title, a description, and a
// primary action.
export const Default: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconUsers aria-hidden />
        </EmptyStateMedia>
        <EmptyStateTitle>No contacts yet</EmptyStateTitle>
        <EmptyStateDescription>
          Add your first contact to start building your CRM.
        </EmptyStateDescription>
      </EmptyStateHeader>
      <EmptyStateContent>
        <Button>Add contact</Button>
      </EmptyStateContent>
    </EmptyState>
  ),
};

// Header only — an empty state with no call to action.
export const WithoutAction: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconUsers aria-hidden />
        </EmptyStateMedia>
        <EmptyStateTitle>No results</EmptyStateTitle>
        <EmptyStateDescription>
          Try adjusting your filters or search terms.
        </EmptyStateDescription>
      </EmptyStateHeader>
    </EmptyState>
  ),
};

// Every structural part carries a data-slot hook; the media advertises its
// variant.
export const WithDataAttributes: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconUsers aria-hidden />
        </EmptyStateMedia>
        <EmptyStateTitle>No contacts yet</EmptyStateTitle>
        <EmptyStateDescription>Add your first contact.</EmptyStateDescription>
      </EmptyStateHeader>
      <EmptyStateContent>
        <Button>Add contact</Button>
      </EmptyStateContent>
    </EmptyState>
  ),
  play: async ({ canvasElement }) => {
    for (const slot of [
      'empty-state',
      'empty-state-header',
      'empty-state-media',
      'empty-state-title',
      'empty-state-description',
      'empty-state-content',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }

    const media = canvasElement.querySelector(
      '[data-slot="empty-state-media"]'
    );
    await expect(media).toHaveAttribute('data-variant', 'icon');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Both media variants — the muted icon medallion inside a dashed-bordered box
// with an action, and the borderless default wrapper holding a larger glyph.
// Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <EmptyState className="nx:border nx:border-border-default">
        <EmptyStateHeader>
          <EmptyStateMedia variant="icon">
            <IconUsers aria-hidden />
          </EmptyStateMedia>
          <EmptyStateTitle>No contacts yet</EmptyStateTitle>
          <EmptyStateDescription>
            Add your first contact to get started.
          </EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateContent>
          <Button>Add contact</Button>
        </EmptyStateContent>
      </EmptyState>

      <EmptyState>
        <EmptyStateHeader>
          <EmptyStateMedia variant="default">
            <IconUsers
              aria-hidden
              className="nx:size-12 nx:text-muted-foreground"
            />
          </EmptyStateMedia>
          <EmptyStateTitle>No results</EmptyStateTitle>
          <EmptyStateDescription>
            Try adjusting your filters.
          </EmptyStateDescription>
        </EmptyStateHeader>
      </EmptyState>
    </div>
  ),
};
