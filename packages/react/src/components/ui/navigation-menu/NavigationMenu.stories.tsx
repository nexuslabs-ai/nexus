import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './navigation-menu';

const meta: Meta<typeof NavigationMenu> = {
  title: 'Components/NavigationMenu',
  component: NavigationMenu,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#analytics">
                  Analytics
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#automation">
                  Automation
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#about">About</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#careers">Careers</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithSimpleLink: Story = {
  render: (_args) => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#docs"
            className={navigationMenuTriggerStyle()}
          >
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#pricing"
            className={navigationMenuTriggerStyle()}
          >
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithoutViewport: Story = {
  render: (_args) => (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#analytics">
                  Analytics
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithIndicator: Story = {
  render: (_args) => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#analytics">
                  Analytics
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#about">About</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const Disabled: Story = {
  render: (_args) => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger disabled>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#analytics">
                  Analytics
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Products/i });

    await expect(trigger).toBeDisabled();

    // Disabled trigger uses a semantic text token at full opacity (not a fade).
    await expect(trigger).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(trigger).opacity).toBe('1');
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const OpenCloseInteraction: Story = {
  render: (_args) => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#analytics">
                  Analytics
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: /Products/i });
    await expect(trigger).toHaveAttribute('data-state', 'closed');

    // Open the flyout by clicking the trigger
    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('data-state', 'open'));

    // The flyout links render in-tree (no portal)
    const link = await canvas.findByRole('link', { name: 'Analytics' });
    await expect(link).toBeInTheDocument();

    // Close with Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('data-state', 'closed')
    );
  },
};

export const KeyboardInteraction: Story = {
  render: (_args) => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#analytics">
                  Analytics
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Products/i });

    // Focus the trigger and open with the keyboard
    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveAttribute('data-state', 'open'));

    // Close with Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('data-state', 'closed')
    );
  },
};

export const WithDataAttributes: Story = {
  render: (_args) => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#analytics">
                  Analytics
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Root carries data-slot + data-viewport
    const root = canvasElement.querySelector('[data-slot="navigation-menu"]');
    await expect(root).toBeInTheDocument();
    await expect(root).toHaveAttribute('data-viewport', 'true');

    // List + Item slots present
    await expect(
      canvasElement.querySelector('[data-slot="navigation-menu-list"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="navigation-menu-item"]')
    ).toBeInTheDocument();

    // Trigger slot
    const trigger = canvas.getByRole('button', { name: /Products/i });
    await expect(trigger).toHaveAttribute(
      'data-slot',
      'navigation-menu-trigger'
    );
    // #470: trigger reuses navigationMenuTriggerStyle → typography-label-default
    // (migrated from raw nx:text-sm nx:font-medium).
    await expect(trigger).toHaveClass('nx:typography-label-default');

    // Open → content + link slots render
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-slot="navigation-menu-content"]')
      ).toBeInTheDocument();
      expect(
        canvasElement.querySelector('[data-slot="navigation-menu-link"]')
      ).toBeInTheDocument();
    });
    // #470: flyout link migrated raw nx:text-sm → typography-body-default.
    await expect(
      canvasElement.querySelector('[data-slot="navigation-menu-link"]')
    ).toHaveClass('nx:typography-body-default');

    await userEvent.keyboard('{Escape}');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          With Flyout Triggers
        </h3>
        <NavigationMenu aria-label="Flyout navigation">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                  <li>
                    <NavigationMenuLink href="#analytics">
                      Analytics
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#reports">
                      Reports
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Company</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                  <li>
                    <NavigationMenuLink href="#about">About</NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Simple Links (no flyout)
        </h3>
        <NavigationMenu aria-label="Simple links navigation">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#docs"
                className={navigationMenuTriggerStyle()}
              >
                Docs
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#pricing"
                className={navigationMenuTriggerStyle()}
              >
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
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
