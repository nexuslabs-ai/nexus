import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectStaggeredItemMotion } from '../../stories/support/motion-test-utils';
import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './menubar';

const meta: Meta<typeof Menubar> = {
  title: 'Components/Menubar',
  component: Menubar,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Menubar>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab
            <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Reload</MenubarItem>
          <MenubarItem>Toggle Fullscreen</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithCheckboxItems: Story = {
  render: function CheckboxItemsStory() {
    const [showBookmarks, setShowBookmarks] = React.useState(true);
    const [showFullUrls, setShowFullUrls] = React.useState(false);

    return (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Appearance</MenubarLabel>
            <MenubarSeparator />
            <MenubarCheckboxItem
              checked={showBookmarks}
              onCheckedChange={setShowBookmarks}
            >
              Show Bookmarks
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={showFullUrls}
              onCheckedChange={setShowFullUrls}
            >
              Show Full URLs
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
  },
};

export const WithRadioItems: Story = {
  render: function RadioItemsStory() {
    const [profile, setProfile] = React.useState('benoit');

    return (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Profiles</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>People</MenubarLabel>
            <MenubarSeparator />
            <MenubarRadioGroup value={profile} onValueChange={setProfile}>
              <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
              <MenubarRadioItem value="luis">Luis</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
  },
};

export const IndicatorCrossFade: Story = {
  render: (_args) => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>Status Bar</MenubarCheckboxItem>
          <MenubarCheckboxItem checked={false}>
            Activity Bar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked="indeterminate">
            Bookmarks Bar
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup value="bottom">
            <MenubarRadioItem value="top">Top</MenubarRadioItem>
            <MenubarRadioItem value="bottom">Bottom</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('menuitem', { name: 'View' });

    try {
      await userEvent.click(trigger);

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
        '[data-slot="menubar-checkbox-indicator"]'
      );
      const checkedIcon = checkedItem.querySelector(
        '[data-slot="menubar-checkbox-indicator-icon"]'
      );
      const uncheckedIcon = uncheckedItem.querySelector(
        '[data-slot="menubar-checkbox-indicator-icon"]'
      );
      const indeterminateIcon = indeterminateItem.querySelector(
        '[data-slot="menubar-checkbox-indicator-icon"]'
      );
      const selectedIndicator = selectedRadio.querySelector(
        '[data-slot="menubar-radio-indicator"]'
      );
      const selectedDot = selectedRadio.querySelector(
        '[data-slot="menubar-radio-indicator-icon"]'
      );
      const unselectedDot = unselectedRadio.querySelector(
        '[data-slot="menubar-radio-indicator-icon"]'
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
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Tab</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email Link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>Notes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithInsetItems: Story = {
  render: (_args) => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel inset>Appearance</MenubarLabel>
          <MenubarSeparator />
          <MenubarItem inset>Reload</MenubarItem>
          <MenubarItem inset>Force Reload</MenubarItem>
          <MenubarItem inset>Toggle Fullscreen</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const StaggeredItems: Story = {
  render: (_args) => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Motion</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Tab</MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarItem>Save</MenubarItem>
          <MenubarItem>Share</MenubarItem>
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('menuitem', { name: 'Motion' });

    await userEvent.click(trigger);

    const menu = await within(document.body).findByRole('menu');
    const items = Array.from(
      menu.querySelectorAll('[data-slot="menubar-item"]')
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
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Tab</MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Menu should not be visible initially
    const trigger = canvas.getByRole('menuitem', { name: 'File' });
    await expect(trigger).toBeInTheDocument();

    // Open the menu by clicking its trigger
    await userEvent.click(trigger);

    // Menu content should now be visible
    const menu = await within(document.body).findByRole('menu');
    await expect(menu).toBeInTheDocument();
    await expect(menu).toHaveAttribute('data-slot', 'menubar-content');
    await expectInterruptibleOverlayMotion(menu);

    // Items should be visible
    const item = within(menu).getByRole('menuitem', { name: 'New Tab' });
    await expect(item).toBeInTheDocument();

    // Close the menu by pressing Escape
    await userEvent.keyboard('{Escape}');

    // Wait for menu to be removed from DOM
    await expectExitBeforeUnmount(document.querySelector('[role="menu"]'));
  },
};

export const KeyboardInteraction: Story = {
  render: (_args) => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Tab</MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the menu
    const trigger = canvas.getByRole('menuitem', { name: 'File' });
    await userEvent.click(trigger);

    // Menu should be open
    const menu = await within(document.body).findByRole('menu');
    await expect(menu).toBeInTheDocument();

    // Navigate with arrow keys
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');

    // The second item should be highlighted
    const secondItem = within(menu).getByRole('menuitem', {
      name: 'New Window',
    });
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
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Cut</MenubarItem>
          <MenubarItem disabled>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the menu
    const trigger = canvas.getByRole('menuitem', { name: 'Edit' });
    await userEvent.click(trigger);

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
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Actions</MenubarLabel>
          <MenubarSeparator />
          <MenubarItem>
            Open
            <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarItem variant="destructive">Delete</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the menu
    const trigger = canvas.getByRole('menuitem', { name: 'File' });
    await userEvent.click(trigger);

    // Wait for menu to be visible
    await within(document.body).findByRole('menu');

    // Check data-slot attributes
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="menubar-content"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="menubar-label"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="menubar-separator"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="menubar-item"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="menubar-shortcut"]')
      ).toBeInTheDocument();
    });

    const shortcut = document.querySelector('[data-slot="menubar-shortcut"]');
    const rawTextXsClass = ['nx:text', 'xs'].join('-');
    await expect(shortcut).toHaveClass('nx:typography-shortcut');
    await expect(shortcut).not.toHaveClass(rawTextXsClass);
    await expect(shortcut).not.toHaveClass('nx:tracking-widest');

    // Check destructive variant
    const destructiveItem = document.querySelector(
      '[data-slot="menubar-item"][data-variant="destructive"]'
    );
    await expect(destructiveItem).toBeInTheDocument();

    // The bar root owns a raised component surface; triggers hover/open within it.
    const menubar = canvas
      .getByRole('menubar')
      .closest('[data-slot="menubar"]');
    await expect(menubar).toBeInTheDocument();
    await expect(menubar).toHaveClass('nx:bg-container');
    await expect(trigger).toHaveClass(
      'nx:focus:bg-container-hover',
      'nx:data-[state=open]:bg-container-hover'
    );

    // Close the menu and wait for complete cleanup
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
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
          Standard Menubar
        </h3>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New Tab
                <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>New Window</MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Email Link</MenubarItem>
                  <MenubarItem>Messages</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem>Print</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Reload</MenubarItem>
              <MenubarItem>Toggle Fullscreen</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Destructive Item
        </h3>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Actions</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Edit</MenubarItem>
              <MenubarItem>Duplicate</MenubarItem>
              <MenubarSeparator />
              <MenubarItem variant="destructive">Delete</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
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
