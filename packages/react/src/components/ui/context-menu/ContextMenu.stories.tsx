import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu';

const triggerClass =
  'nx:flex nx:h-[96px] nx:w-full nx:max-w-md nx:select-none nx:items-center nx:justify-center nx:rounded-md nx:border nx:border-dashed nx:border-border-default nx:typography-body-default nx:text-muted-foreground';

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Back</ContextMenuItem>
        <ContextMenuItem>Forward</ContextMenuItem>
        <ContextMenuItem>Reload</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithLabelsAndSeparators: Story = {
  render: (_args) => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="nx:w-56">
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem>
            Back
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Forward
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Reload
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem>
          View Source
          <ContextMenuShortcut>⌘U</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithCheckboxItems: Story = {
  render: function CheckboxItemsStory() {
    const [showBookmarks, setShowBookmarks] = React.useState(true);
    const [showFullUrls, setShowFullUrls] = React.useState(false);

    return (
      <ContextMenu>
        <ContextMenuTrigger className={triggerClass}>
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent className="nx:w-56">
          <ContextMenuLabel>Appearance</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem
            checked={showBookmarks}
            onCheckedChange={setShowBookmarks}
          >
            Show Bookmarks
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={showFullUrls}
            onCheckedChange={setShowFullUrls}
          >
            Show Full URLs
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
};

export const WithRadioItems: Story = {
  render: function RadioItemsStory() {
    const [person, setPerson] = React.useState('pedro');

    return (
      <ContextMenu>
        <ContextMenuTrigger className={triggerClass}>
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent className="nx:w-56">
          <ContextMenuLabel>People</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
            <ContextMenuRadioItem value="pedro">
              Pedro Duarte
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
};

export const WithSubMenu: Story = {
  render: (_args) => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="nx:w-56">
        <ContextMenuItem>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Save Page As...</ContextMenuItem>
            <ContextMenuItem>Create Shortcut...</ContextMenuItem>
            <ContextMenuItem>Name Window...</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Developer Tools</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithDestructiveItem: Story = {
  render: (_args) => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Edit</ContextMenuItem>
        <ContextMenuItem>Duplicate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithInsetItems: Story = {
  render: (_args) => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="nx:w-56">
        <ContextMenuLabel inset>Actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem inset>Back</ContextMenuItem>
        <ContextMenuItem inset>Forward</ContextMenuItem>
        <ContextMenuItem inset>Reload</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

// ============================================
// INTERACTION TESTS
// ============================================

export const OpenCloseInteraction: Story = {
  render: (_args) => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Item 1</ContextMenuItem>
        <ContextMenuItem>Item 2</ContextMenuItem>
        <ContextMenuItem>Item 3</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Menu should not be visible initially
    const trigger = canvas.getByText('Right click here');
    await expect(trigger).toBeInTheDocument();

    // Open via right-click — context menus open on `contextmenu`, not click
    await fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 });

    // Menu content should now be visible
    const menu = await within(document.body).findByRole('menu');
    await expect(menu).toBeInTheDocument();
    await expect(menu).toHaveAttribute('data-slot', 'context-menu-content');

    // Items should be visible
    const item1 = within(menu).getByRole('menuitem', { name: 'Item 1' });
    await expect(item1).toBeInTheDocument();

    // Close the menu by pressing Escape
    await userEvent.keyboard('{Escape}');

    // Wait for menu to be removed from DOM
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
  },
};

export const KeyboardInteraction: Story = {
  render: (_args) => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>First</ContextMenuItem>
        <ContextMenuItem>Second</ContextMenuItem>
        <ContextMenuItem>Third</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open via right-click
    const trigger = canvas.getByText('Right click here');
    await fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 });

    // Menu should be open
    const menu = await within(document.body).findByRole('menu');
    await expect(menu).toBeInTheDocument();

    // Navigate with arrow keys
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');

    // The second item should be highlighted
    const secondItem = within(menu).getByRole('menuitem', { name: 'Second' });
    await expect(secondItem).toHaveAttribute('data-highlighted');

    // Close with Escape
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
  },
};

export const WithDisabledItems: Story = {
  render: (_args) => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Undo</ContextMenuItem>
        <ContextMenuItem>Redo</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>Cut</ContextMenuItem>
        <ContextMenuItem disabled>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open via right-click
    const trigger = canvas.getByText('Right click here');
    await fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 });

    const menu = await within(document.body).findByRole('menu');

    // The disabled item is present and marked disabled. Do NOT click it —
    // a disabled item has pointer-events: none, which makes click throw.
    const disabledItem = within(menu).getByRole('menuitem', { name: 'Cut' });
    await expect(disabledItem).toHaveAttribute('data-disabled');
    await expect(disabledItem).toHaveAttribute('aria-disabled', 'true');

    // An enabled item is reachable
    const enabledItem = within(menu).getByRole('menuitem', { name: 'Paste' });
    await expect(enabledItem).not.toHaveAttribute('data-disabled');

    // Close
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
  },
};

export const WithDataAttributes: Story = {
  render: (_args) => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Label</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>Item</ContextMenuItem>
        <ContextMenuItem variant="destructive">Destructive</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open via right-click
    const trigger = canvas.getByText('Right click here');
    await fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 });

    // Wait for menu to be visible
    await within(document.body).findByRole('menu');

    // Check data-slot attributes
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="context-menu-content"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="context-menu-label"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="context-menu-separator"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="context-menu-item"]')
      ).toBeInTheDocument();
    });

    // Check destructive variant
    const destructiveItem = document.querySelector(
      '[data-slot="context-menu-item"][data-variant="destructive"]'
    );
    await expect(destructiveItem).toBeInTheDocument();

    // Close the menu and wait for complete cleanup
    await userEvent.keyboard('{Escape}');

    // Wait for menu to be fully removed from DOM (including aria-hidden cleanup)
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
      // Ensure no lingering aria-hidden elements from Radix
      expect(document.querySelector('[data-aria-hidden="true"]')).toBeNull();
    });
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Basic Menu
        </h3>
        <ContextMenu>
          <ContextMenuTrigger className={triggerClass}>
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Back</ContextMenuItem>
            <ContextMenuItem>Forward</ContextMenuItem>
            <ContextMenuItem>Reload</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Shortcuts
        </h3>
        <ContextMenu>
          <ContextMenuTrigger className={triggerClass}>
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="nx:w-48">
            <ContextMenuItem>
              Back
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Reload
              <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Inspect
              <ContextMenuShortcut>⌘I</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Destructive
        </h3>
        <ContextMenu>
          <ContextMenuTrigger className={triggerClass}>
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Edit</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Submenu
        </h3>
        <ContextMenu>
          <ContextMenuTrigger className={triggerClass}>
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Item 1</ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>More Options</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Sub Item 1</ContextMenuItem>
                <ContextMenuItem>Sub Item 2</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem>Item 2</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
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
