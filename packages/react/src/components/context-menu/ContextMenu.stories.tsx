import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { expectStaggeredItemMotion } from '../../stories/support/motion-test-utils';
import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';

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
  'nx:flex nx:h-[96px] nx:w-full nx:max-w-md nx:select-none nx:items-center nx:justify-center nx:rounded-md nx:border-default nx:border-dashed nx:border-border-default nx:typography-body-default nx:text-muted-foreground';

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

export const IndicatorCrossFade: Story = {
  render: (_args) => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Indicator Motion
      </ContextMenuTrigger>
      <ContextMenuContent className="nx:w-56">
        <ContextMenuCheckboxItem checked>Status Bar</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={false}>
          Activity Bar
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked="indeterminate">
          Bookmarks Bar
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="bottom">
          <ContextMenuRadioItem value="top">Top</ContextMenuRadioItem>
          <ContextMenuRadioItem value="bottom">Bottom</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Indicator Motion');

    try {
      await fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 });

      const menu = await within(document.body).findByRole('menu');
      const checkedItem = within(menu).getByRole('menuitemcheckbox', {
        name: 'Status Bar',
      });
      const uncheckedItem = within(menu).getByRole('menuitemcheckbox', {
        name: 'Activity Bar',
      });
      const indeterminateItem = within(menu).getByRole('menuitemcheckbox', {
        name: 'Bookmarks Bar',
      });
      const selectedRadio = within(menu).getByRole('menuitemradio', {
        name: 'Bottom',
      });
      const unselectedRadio = within(menu).getByRole('menuitemradio', {
        name: 'Top',
      });

      const checkedIndicator = checkedItem.querySelector(
        '[data-slot="context-menu-checkbox-indicator"]'
      );
      const checkedIcon = checkedItem.querySelector(
        '[data-slot="context-menu-checkbox-indicator-icon"]'
      );
      const uncheckedIcon = uncheckedItem.querySelector(
        '[data-slot="context-menu-checkbox-indicator-icon"]'
      );
      const indeterminateIcon = indeterminateItem.querySelector(
        '[data-slot="context-menu-checkbox-indicator-icon"]'
      );
      const selectedIndicator = selectedRadio.querySelector(
        '[data-slot="context-menu-radio-indicator"]'
      );
      const selectedDot = selectedRadio.querySelector(
        '[data-slot="context-menu-radio-indicator-icon"]'
      );
      const unselectedDot = unselectedRadio.querySelector(
        '[data-slot="context-menu-radio-indicator-icon"]'
      );

      await expect(checkedIndicator).toBeInTheDocument();
      await expect(checkedIcon).toBeInTheDocument();
      await expect(uncheckedIcon).toBeInTheDocument();
      await expect(indeterminateIcon).toBeInTheDocument();
      await expect(selectedIndicator).toBeInTheDocument();
      await expect(selectedDot).toBeInTheDocument();
      await expect(unselectedDot).toBeInTheDocument();
      await expect(checkedItem).toHaveAttribute('data-state', 'checked');
      await expect(uncheckedItem).toHaveAttribute('data-state', 'unchecked');
      await expect(indeterminateItem).toHaveAttribute(
        'data-state',
        'indeterminate'
      );
      await expect(checkedItem).toHaveClass('nx:group');
      await expect(selectedRadio).toHaveClass('nx:group');
      await expect(checkedIcon).toHaveAttribute('aria-hidden', 'true');
      await expect(selectedDot).toHaveAttribute('aria-hidden', 'true');
      await expect(checkedIcon).toHaveClass('nx:transition-[opacity,scale]');
      await expect(uncheckedIcon).toHaveClass('nx:scale-50');
      await expect(uncheckedIcon).toHaveClass('nx:opacity-0');
      await expect(checkedIcon).toHaveClass(
        'nx:group-data-[state=checked]:opacity-100'
      );
      await expect(indeterminateIcon).toHaveClass(
        'nx:group-data-[state=indeterminate]:opacity-100'
      );
      await expect(checkedIcon).toHaveClass('nx:motion-reduce:transition-none');
      await expect(unselectedDot).toHaveClass('nx:scale-50');
      await expect(unselectedDot).toHaveClass('nx:opacity-0');
      await expect(selectedDot).toHaveClass(
        'nx:group-data-[state=checked]:opacity-100'
      );
    } finally {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).toBeNull();
        expect(document.querySelector('[data-aria-hidden="true"]')).toBeNull();
      });
    }
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

export const StaggeredItems: Story = {
  render: (_args) => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click for staggered items
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Back</ContextMenuItem>
        <ContextMenuItem>Forward</ContextMenuItem>
        <ContextMenuItem>Reload</ContextMenuItem>
        <ContextMenuItem>Save Page</ContextMenuItem>
        <ContextMenuItem>Inspect</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Right click for staggered items');

    await fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 });

    const menu = await within(document.body).findByRole('menu');
    const items = Array.from(
      menu.querySelectorAll('[data-slot="context-menu-item"]')
    );
    await expectStaggeredItemMotion(menu, items);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
  },
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
    await expectInterruptibleOverlayMotion(menu);

    // Items should be visible
    const item1 = within(menu).getByRole('menuitem', { name: 'Item 1' });
    await expect(item1).toBeInTheDocument();

    // Close the menu by pressing Escape
    await userEvent.keyboard('{Escape}');

    // Wait for menu to be removed from DOM
    await expectExitBeforeUnmount(document.querySelector('[role="menu"]'));
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

    // Disabled items use a semantic text token at full opacity (not a fade).
    await expect(disabledItem).toHaveClass(
      'nx:data-disabled:text-disabled-foreground'
    );
    await expect(getComputedStyle(disabledItem).opacity).toBe('1');

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
        <ContextMenuItem>
          Item
          <ContextMenuShortcut>⌘I</ContextMenuShortcut>
        </ContextMenuItem>
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
      expect(
        document.querySelector('[data-slot="context-menu-shortcut"]')
      ).toBeInTheDocument();
    });

    const shortcut = document.querySelector(
      '[data-slot="context-menu-shortcut"]'
    );
    await expect(shortcut).toHaveClass('nx:typography-shortcut');
    await expect(shortcut).not.toHaveClass('nx:typography-body-small');
    await expect(shortcut).not.toHaveClass('nx:tracking-widest');

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
