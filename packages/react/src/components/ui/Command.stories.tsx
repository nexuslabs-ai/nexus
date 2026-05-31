import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from './button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
  'nx:w-[420px] nx:rounded-lg nx:border nx:border-border-default nx:shadow-md';

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
        <p className="nx:text-sm nx:text-muted-foreground">
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

    // Escape closes the palette.
    await userEvent.keyboard('{Escape}');
    await waitFor(
      () => expect(document.querySelector('[role="dialog"]')).toBeNull(),
      { timeout: 3000 }
    );
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
          <CommandItem>Profile</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('combobox');
    await expect(input).toHaveAttribute('data-slot', 'command-input');

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
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:mb-4 nx:text-sm nx:font-medium nx:text-foreground">
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
        <h3 className="nx:mb-4 nx:text-sm nx:font-medium nx:text-foreground">
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
