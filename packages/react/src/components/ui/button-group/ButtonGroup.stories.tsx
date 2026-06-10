import type { Meta, StoryObj } from '@storybook/react';
import {
  IconBold,
  IconChevronDown,
  IconItalic,
  IconLink,
  IconUnderline,
} from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';

import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from './button-group';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

// Three outline buttons joined into one horizontal cluster.
export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  ),
};

// Vertical orientation stacks the cluster.
export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="button-group"]');
    await expect(group).toHaveAttribute('data-orientation', 'vertical');
  },
};

// A text addon as a leading prefix.
export const WithText: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>https://</ButtonGroupText>
      <Button variant="outline">nexus.dev</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="button-group-text"]')
    ).toBeInTheDocument();
  },
};

// A separator divides sub-groups in a toolbar of borderless (ghost) controls —
// the rule is the only division, so it reads clearly. In a row of bordered
// (outline) buttons the per-button borders sit in the same color and hide it.
export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="ghost" size="icon" aria-label="Bold">
        <IconBold />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Italic">
        <IconItalic />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Underline">
        <IconUnderline />
      </Button>
      <ButtonGroupSeparator />
      <Button variant="ghost" size="icon" aria-label="Add link">
        <IconLink />
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const separator = canvasElement.querySelector(
      '[data-slot="button-group-separator"]'
    );

    await expect(separator).toBeInTheDocument();
    await expect(separator).toHaveAttribute('data-orientation', 'vertical');
  },
};

// The group is a role=group region that advertises its orientation. Rendered
// with no `orientation` prop so it exercises the default — a regression guard
// for the default `data-orientation` emit.
export const WithDataAttributes: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">One</Button>
      <Button variant="outline">Two</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="button-group"]');
    await expect(group).toBeInTheDocument();
    await expect(group).toHaveAttribute('role', 'group');
    await expect(group).toHaveAttribute('data-orientation', 'horizontal');
  },
};

// ButtonGroupText composes with a custom element via asChild — here a link
// addon — keeping the addon styling and data-slot hook.
export const AsChild: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText asChild>
        <a href="https://example.com">Docs</a>
      </ButtonGroupText>
      <Button variant="outline">Open</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Docs' });
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('data-slot', 'button-group-text');
  },
};

// A Select trigger joins the group as a button-shaped control, sharing the
// seam with the adjacent button.
export const WithSelectTrigger: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Filter</Button>
      <Select defaultValue="all">
        <SelectTrigger aria-label="Status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]'
    );
    await expect(trigger).toBeInTheDocument();
    if (!trigger) return;
    // The trigger joins the seam like a button: its left border is removed so
    // it doesn't double up against the previous control.
    await expect(getComputedStyle(trigger).borderLeftWidth).toBe('0px');
  },
};

// A split button: a primary action and a DropdownMenu trigger, divided by a
// separator. On the filled primary surface the default border-colored rule
// would vanish, so the divider is tinted from the button foreground.
export const SplitButton: Story = {
  render: () => (
    <ButtonGroup>
      <Button>Deploy</Button>
      <ButtonGroupSeparator className="nx:bg-primary-foreground/30" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" aria-label="Deployment options">
            <IconChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Deploy to staging</DropdownMenuItem>
          <DropdownMenuItem>Deploy to production</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    // The DropdownMenu trigger composes onto a Button via asChild (data-slot=
    // button) and opens a menu; a separator divides it from the primary action.
    const trigger = canvasElement.querySelector(
      '[data-slot="button-group"] [aria-haspopup="menu"]'
    );
    await expect(trigger).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('data-slot', 'button');
    await expect(
      canvasElement.querySelector('[data-slot="button-group-separator"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Both orientations plus a text addon and a separator. Reused by the per-base
// variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-4">
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <Button variant="outline">Month</Button>
      </ButtonGroup>
      <ButtonGroup>
        <ButtonGroupText>https://</ButtonGroupText>
        <Button variant="outline">nexus.dev</Button>
        <Button variant="outline">Go</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical">
        <Button variant="outline">Top</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Bottom</Button>
      </ButtonGroup>
    </div>
  ),
};
