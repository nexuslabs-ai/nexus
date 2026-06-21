import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import {
  IconBook,
  IconCreditCard,
  IconFile,
  IconSettings,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useCommandState } from 'cmdk';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';
import { Spinner } from '../spinner';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  CommandShortcut,
} from './command';

const meta: Meta<typeof Command> = {
  title: 'Components/Command',
  component: Command,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Command>;

// Presentational chrome for the inline (non-dialog) palette stories — a fixed
// width with a bordered, elevated surface so the palette reads as a card.
const paletteClass =
  'nx:w-[480px] nx:rounded-lg nx:border nx:border-border-default nx:shadow-md';

const projectCommands = [
  {
    label: 'Open project plan',
    description: 'View roadmap, milestones, and project notes',
    value: 'open-project-plan',
    keywords: ['roadmap', 'milestones', 'docs'],
    icon: IconFile,
    shortcut: '⌘P',
  },
  {
    label: 'Search documentation',
    description: 'Find API references and implementation guides',
    value: 'search-documentation',
    keywords: ['docs', 'api', 'guide'],
    icon: IconBook,
    shortcut: '⌘D',
  },
  {
    label: 'Project settings',
    description: 'Update members, billing, and notifications',
    value: 'project-settings',
    keywords: ['preferences', 'configuration', 'admin'],
    icon: IconSettings,
    trailing: 'Admin',
  },
  {
    label: 'Invite teammate',
    description: 'Add a member to this workspace',
    value: 'invite-teammate',
    keywords: ['members', 'users', 'people'],
    icon: IconUsers,
  },
];

function QueryAwareEmptyMessage() {
  const search = useCommandState((state) => state.search);

  return (
    <CommandEmpty>
      {search ? `No results found for "${search}".` : 'No results found.'}
    </CommandEmpty>
  );
}

function CommandRichItem({
  command,
}: {
  command: (typeof projectCommands)[number];
}) {
  const Icon = command.icon;

  return (
    <CommandItem
      value={command.value}
      keywords={command.keywords}
      className="nx:items-start"
    >
      <Icon aria-hidden="true" className="nx:mt-0.5 nx:text-muted-foreground" />
      <span className="nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-0.5">
        <span className="nx:truncate">{command.label}</span>
        <span className="nx:truncate nx:typography-body-default nx:text-muted-foreground">
          {command.description}
        </span>
      </span>
      {command.shortcut ? (
        <CommandShortcut className="nx:mt-0.5">
          {command.shortcut}
        </CommandShortcut>
      ) : command.trailing ? (
        <span className="nx:mt-0.5 nx:ml-auto nx:shrink-0 nx:typography-label-small nx:text-muted-foreground">
          {command.trailing}
        </span>
      ) : null}
    </CommandItem>
  );
}

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: () => (
    <Command label="Command menu" className={paletteClass}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const Grouped: Story = {
  render: () => (
    <Command label="Command menu" className={paletteClass}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            Profile
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Billing
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const Empty: Story = {
  render: () => (
    <Command label="Command menu" className={paletteClass}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  parameters: {
    a11y: {
      // The no-results state legitimately renders an empty listbox; axe's
      // aria-required-children flags the transient absence of option children,
      // which is expected here. All other a11y rules stay enabled.
      config: { rules: [{ id: 'aria-required-children', enabled: false }] },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Typing a query that matches nothing surfaces the empty state.
    await userEvent.type(input, 'zzzzzz');
    await expect(canvas.getByText('No results found.')).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-empty"]')
    ).toBeInTheDocument();
  },
};

export const QueryAwareEmpty: Story = {
  render: () => (
    <Command label="Command menu" className={paletteClass}>
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <QueryAwareEmptyMessage />
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  parameters: {
    a11y: {
      config: { rules: [{ id: 'aria-required-children', enabled: false }] },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    await userEvent.type(input, 'roadmap');
    await expect(
      canvas.getByText('No results found for "roadmap".')
    ).toBeInTheDocument();
  },
};

export const AsyncLoading: Story = {
  render: () => (
    <Command label="Async command menu" className={paletteClass}>
      <CommandInput placeholder="Search commands..." />
      {/* Loading lives outside CommandList: cmdk's Loading carries
          role="progressbar", which is an invalid child of the list's
          role="listbox" (axe aria-required-children). */}
      <CommandLoading progress={60} label="Loading command results">
        <Spinner
          aria-hidden="true"
          role="presentation"
          className="nx:size-3.5"
        />
        Loading commands...
      </CommandLoading>
      <CommandList>
        <CommandGroup heading="Recent">
          {['Recent project', 'Team dashboard'].map((item) => (
            <CommandItem key={item} value={item}>
              {item}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole('progressbar');
    // The progressbar must not be a child of CommandList's role="listbox"
    // (axe aria-required-children).
    await expect(progressbar.closest('[role="listbox"]')).toBeNull();
  },
};

export const RichItems: Story = {
  render: () => (
    <Command label="Project command menu" className={paletteClass}>
      <CommandInput placeholder="Search project commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Project">
          {projectCommands.map((command) => (
            <CommandRichItem key={command.value} command={command} />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const AdvancedFiltering: Story = {
  render: function AdvancedFilteringStory() {
    const [search, setSearch] = React.useState('');
    const actionCommands = [
      {
        label: 'Invite teammate',
        value: 'invite-teammate',
        keywords: ['members', 'users', 'people'],
        icon: IconUsers,
      },
      {
        label: 'Open billing',
        value: 'open-billing',
        keywords: ['invoice', 'payment', 'card'],
        icon: IconCreditCard,
      },
    ];
    const destinationCommands = [
      {
        label: 'Profile',
        value: 'profile',
        keywords: ['account', 'user'],
        icon: IconUser,
      },
      {
        label: 'Settings',
        value: 'settings',
        keywords: ['preferences', 'configuration'],
        icon: IconSettings,
      },
    ];
    const matchesSearch = (command: { label: string; keywords: string[] }) => {
      const query = search.trim().toLowerCase();

      if (!query) return true;

      return [command.label, ...command.keywords].some((value) =>
        value.toLowerCase().includes(query)
      );
    };
    const visibleActions = actionCommands.filter(matchesSearch);
    const visibleDestinations = destinationCommands.filter(matchesSearch);

    return (
      <Command
        label="Advanced command menu"
        className={paletteClass}
        loop
        shouldFilter={false}
      >
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder="Try members, invoice, or preferences..."
        />
        <CommandList>
          <CommandEmpty>No matching command.</CommandEmpty>
          {visibleActions.length > 0 ? (
            <CommandGroup heading="Actions">
              {visibleActions.map((command) => {
                const Icon = command.icon;

                return (
                  <CommandItem key={command.value} value={command.value}>
                    <Icon aria-hidden="true" />
                    {command.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}
          {visibleActions.length > 0 && visibleDestinations.length > 0 ? (
            <CommandSeparator alwaysRender />
          ) : null}
          {visibleDestinations.length > 0 ? (
            <CommandGroup heading="Destinations">
              {visibleDestinations.map((command) => {
                const Icon = command.icon;

                return (
                  <CommandItem key={command.value} value={command.value}>
                    <Icon aria-hidden="true" />
                    {command.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    await userEvent.type(input, 'members');
    await expect(
      canvas.getByRole('option', { name: 'Invite teammate' })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('option', { name: 'Open billing' })
    ).not.toBeInTheDocument();
  },
};

// ============================================
// DIALOG (⌘K) STORY
// ============================================

export const WithDialog: Story = {
  render: function DialogStory() {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          setOpen((prev) => !prev);
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
      <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open Command Palette
        </Button>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Press <kbd className="nx:font-mono">⌘K</kbd> to toggle
        </p>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem onSelect={() => setOpen(false)}>
                Calendar
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                Search Emoji
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'Open Command Palette',
    });
    await userEvent.click(trigger);

    // Dialog content portals to document.body.
    const dialog = await within(document.body).findByRole('dialog');
    const input = within(dialog).getByRole('combobox');

    // Focusing the input confirms the dialog — and its Radix dismiss layer — is
    // fully mounted before we dismiss it.
    await userEvent.click(input);
    await expect(input).toHaveFocus();

    // Assert the dismissed state, not DOM removal: cmdk defers Radix's unmount
    // in the test runner, but data-state flips to "closed" on Escape.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog?.getAttribute('data-state') ?? 'closed').toBe('closed');
    });
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const Disabled: Story = {
  render: () => (
    <Command label="Command menu" className={paletteClass}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem disabled>Search Emoji (disabled)</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledItem = canvas.getByRole('option', {
      name: 'Search Emoji (disabled)',
    });

    // The item is non-interactive (pointer-events:none), so assert its state
    // attributes rather than clicking it.
    await expect(disabledItem).toHaveAttribute('data-disabled', 'true');
    await expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
  },
};

export const ClickInteraction: Story = {
  render: function ClickStory() {
    const [selected, setSelected] = React.useState('none');
    return (
      <div className="nx:flex nx:flex-col nx:gap-4">
        <Command label="Command menu" className={paletteClass}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandGroup heading="Suggestions">
              <CommandItem value="calendar" onSelect={setSelected}>
                Calendar
              </CommandItem>
              <CommandItem value="calculator" onSelect={setSelected}>
                Calculator
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <p data-testid="last-selected">Selected: {selected}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const calculator = canvas.getByRole('option', { name: 'Calculator' });

    await userEvent.click(calculator);
    await expect(canvas.getByTestId('last-selected')).toHaveTextContent(
      /calculator/i
    );
  },
};

export const KeyboardInteraction: Story = {
  render: function KeyboardStory() {
    const [selected, setSelected] = React.useState('none');
    return (
      <div className="nx:flex nx:flex-col nx:gap-4">
        <Command label="Command menu" className={paletteClass}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandGroup heading="Suggestions">
              <CommandItem value="calendar" onSelect={setSelected}>
                Calendar
              </CommandItem>
              <CommandItem value="calculator" onSelect={setSelected}>
                Calculator
              </CommandItem>
              <CommandItem value="settings" onSelect={setSelected}>
                Settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <p data-testid="last-selected">Selected: {selected}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // cmdk auto-selects the first item; ArrowDown moves to the second.
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');

    const options = canvas.getAllByRole('option');
    await waitFor(() =>
      expect(options[1]).toHaveAttribute('data-selected', 'true')
    );

    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('last-selected')).toHaveTextContent(
      /calculator/i
    );
  },
};

export const WithDataAttributes: Story = {
  render: () => (
    <Command label="Command menu" className={paletteClass}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            Profile
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('combobox');
    await expect(input).toHaveAttribute('data-slot', 'command-input');

    await expect(
      canvasElement.querySelector('[data-slot="command-input-wrapper"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-list"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-group"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-item"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-separator"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-shortcut"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Basic
        </h3>
        <Command label="Basic command menu" className={paletteClass}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Grouped with shortcuts
        </h3>
        <Command label="Grouped command menu" className={paletteClass}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                Profile
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem disabled>
                Billing
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  ),
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
