import { useId, useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { IconUsers } from '@tabler/icons-react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';

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
  parameters: {
    docs: {
      description: {
        component:
          'Use EmptyState after a successful request returns no content. Omit actions for informational emptiness; offer creation for an empty collection and clear-search recovery for no matches. Loading, request failures and permission restrictions are separate application states. The application owns data, callbacks, announcements and focus. Use Title asChild for the appropriate heading level, hide decorative media, and constrain illustrations to their container. The default has a subtle background; bordered adds a dashed frame. Inside an existing surface, className can remove the background. These examples use local state, not a backend. Copy the render function and its React hooks along with the EmptyState parts; Search Recovery also uses Nexus Input and Label, and action examples use Nexus Button. Keep the Nexus cn helper and theme setup when copying component source.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: { bordered: false },
  render: function ContactCollection(args) {
    const [created, setCreated] = useState(false);

    if (created) {
      return (
        <section>
          <h2
            tabIndex={-1}
            ref={(node) => node?.focus()}
            className="nx:typography-heading-xxsmall"
          >
            Contacts
          </h2>
          <ul>
            <li>Priya Shah</li>
          </ul>
        </section>
      );
    }

    return (
      <EmptyState {...args}>
        <EmptyStateHeader>
          <EmptyStateMedia variant="icon">
            <IconUsers aria-hidden />
          </EmptyStateMedia>
          <EmptyStateTitle asChild>
            <h2>No contacts yet</h2>
          </EmptyStateTitle>
          <EmptyStateDescription>
            Add a sample contact to see this collection fill up.
          </EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateContent>
          <Button type="button" onClick={() => setCreated(true)}>
            Add sample contact
          </Button>
        </EmptyStateContent>
      </EmptyState>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Add sample contact' })
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('listitem')).toHaveTextContent('Priya Shah');
    await expect(
      canvas.getByRole('heading', { name: 'Contacts' })
    ).toHaveFocus();
    await expect(canvas.queryByText('No contacts yet')).not.toBeInTheDocument();
  },
};

// Header only — an empty state with no call to action.
export const WithoutAction: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <EmptyState>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconUsers aria-hidden />
        </EmptyStateMedia>
        <EmptyStateTitle>You’re all caught up</EmptyStateTitle>
        <EmptyStateDescription>
          New notifications will appear here.
        </EmptyStateDescription>
      </EmptyStateHeader>
    </EmptyState>
  ),
};

export const TitleAsHeading: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <section aria-labelledby="empty-state-section-heading">
      <EmptyState>
        <EmptyStateHeader>
          <EmptyStateMedia variant="icon">
            <IconUsers aria-hidden />
          </EmptyStateMedia>
          <EmptyStateTitle asChild>
            <h2 id="empty-state-section-heading">No contacts yet</h2>
          </EmptyStateTitle>
          <EmptyStateDescription>
            The empty-state title can be the section heading without adding a
            duplicate hidden heading.
          </EmptyStateDescription>
        </EmptyStateHeader>
      </EmptyState>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {
      level: 2,
      name: 'No contacts yet',
    });

    await expect(heading).toHaveAttribute('data-slot', 'empty-state-title');
  },
};

// Every structural part carries a data-slot hook; the media advertises its
// variant.
export const WithDataAttributes: Story = {
  parameters: { controls: { disable: true } },
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

// Long copy stresses the centered text-balance wrapping; an inline link in the
// description exercises the [&>a] anchor hooks — the only story that does.
export const LongCopyWithLink: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <EmptyState>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconUsers aria-hidden />
        </EmptyStateMedia>
        <EmptyStateTitle>
          No team members match the filters you have applied to this view
        </EmptyStateTitle>
        <EmptyStateDescription>
          Try broadening your search, clearing a filter, or inviting someone
          new. You can also{' '}
          <a href="/docs/team">learn more about managing your team</a> in the
          docs.
        </EmptyStateDescription>
      </EmptyStateHeader>
    </EmptyState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /learn more/i });

    await expect(link.parentElement).toHaveAttribute(
      'data-slot',
      'empty-state-description'
    );
    // underline-offset-4 is unique to the hook — no anchor defaults to 4px.
    await expect(link).toHaveStyle({ textUnderlineOffset: '4px' });

    await userEvent.tab();
    await expect(link).toHaveFocus();

    await expect(
      canvas.getByText(/broadening your search/i)
    ).toBeInTheDocument();
  },
};

// The `bordered` prop renders the dashed frame and advertises via data-bordered.
export const Bordered: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <EmptyState bordered>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconUsers aria-hidden />
        </EmptyStateMedia>
        <EmptyStateTitle>No contacts yet</EmptyStateTitle>
        <EmptyStateDescription>
          Add your first contact to get started.
        </EmptyStateDescription>
      </EmptyStateHeader>
    </EmptyState>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="empty-state"]');
    await expect(root).toHaveAttribute('data-bordered', 'true');
    await expect(root).toHaveStyle({ borderStyle: 'dashed' });
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Both media variants — the muted icon medallion inside a dashed-bordered box
// with an action, and the borderless default wrapper holding a larger glyph.
// Reused by the per-base variant generator.
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <EmptyState bordered>
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

export const SearchRecovery: Story = {
  parameters: { controls: { disable: true } },
  render: function SearchRecoveryExample() {
    const id = useId();
    const search = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('Morgan');
    const contacts = ['Priya Shah', 'Alex Chen'].filter((name) =>
      name.toLowerCase().includes(query.trim().toLowerCase())
    );

    function clearSearch() {
      setQuery('');
      search.current?.focus();
    }

    return (
      <section className="nx:flex nx:w-80 nx:max-w-full nx:flex-col nx:gap-4">
        <h2 className="nx:typography-heading-xxsmall">Contacts</h2>
        <Label htmlFor={id}>Search contacts</Label>
        <Input
          id={id}
          ref={search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p role="status">
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}{' '}
          found
        </p>
        {contacts.length ? (
          <ul>
            {contacts.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          <EmptyState className="nx:bg-transparent">
            <EmptyStateHeader>
              <EmptyStateTitle asChild>
                <h3>No matching contacts</h3>
              </EmptyStateTitle>
              <EmptyStateDescription>
                Try another name or clear your search.
              </EmptyStateDescription>
            </EmptyStateHeader>
            <EmptyStateContent>
              <Button type="button" onClick={clearSearch}>
                Clear search
              </Button>
            </EmptyStateContent>
          </EmptyState>
        )}
      </section>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '0 contacts found'
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(canvas.getByLabelText('Search contacts')).toHaveValue('');
    await expect(canvas.getByLabelText('Search contacts')).toHaveFocus();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(
      canvas.queryByText('No matching contacts')
    ).not.toBeInTheDocument();
    await userEvent.type(canvas.getByLabelText('Search contacts'), 'Morgan');
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2 contacts found'
    );
    await expect(canvas.getByLabelText('Search contacts')).toHaveFocus();
    await userEvent.type(canvas.getByLabelText('Search contacts'), 'Priya');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '1 contact found'
    );
  },
};

export const ControlledBorder: Story = {
  ...Default,
  tags: ['!autodocs', '!dev'],
  args: { bordered: true },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="empty-state"]');
    await expect(root).toHaveAttribute('data-bordered', 'true');
    await expect(root).toHaveStyle({ borderStyle: 'dashed' });
  },
};
