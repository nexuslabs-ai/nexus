import type { Meta, StoryObj } from '@storybook/react';
import {
  IconBold,
  IconChevronDown,
  IconItalic,
  IconLink,
  IconUnderline,
} from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import { expectHeightPinned } from '../../../stories/test-utils';
import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Input } from '../input';
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

const BUTTON_GROUP_SIZE_HEIGHTS = {
  sm: 32,
  default: 40,
  lg: 48,
} as const;

const BUTTON_GROUP_TEXT_SIZE_CLASSES = {
  sm: ['nx:h-8', 'nx:px-2.5', 'nx:typography-label-default'],
  default: ['nx:h-10', 'nx:px-3', 'nx:typography-label-default'],
  lg: ['nx:h-12', 'nx:px-3.5', 'nx:typography-label-default'],
} as const;

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

export const Small: Story = {
  render: () => (
    <ButtonGroup size="sm">
      <ButtonGroupText>View:</ButtonGroupText>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
    </ButtonGroup>
  ),
};

export const Large: Story = {
  render: () => (
    <ButtonGroup size="lg">
      <ButtonGroupText>View:</ButtonGroupText>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
    </ButtonGroup>
  ),
};

// Vertical orientation stacks the cluster.
export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical" size="sm">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="button-group"]');
    await expect(group).toHaveAttribute('data-orientation', 'vertical');
    await expect(group).toHaveAttribute('data-size', 'sm');

    const canvas = within(canvasElement);
    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toHaveAttribute('data-size', 'sm');
    }
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
    await expect(group).toHaveAttribute('data-size', 'default');
  },
};

export const SizeAlignment: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Vega height sentinel for ButtonGroup size propagation. Text addons use `h-8` / `h-10` / `h-12` without Button min-widths, while direct Button children receive the matching semantic size.',
      },
    },
  },
  render: () => (
    <div
      data-style="vega"
      className="nx:flex nx:flex-col nx:items-start nx:gap-4 nx:bg-background nx:p-10"
    >
      {Object.keys(BUTTON_GROUP_SIZE_HEIGHTS).map((size) => (
        <ButtonGroup
          key={size}
          size={size as keyof typeof BUTTON_GROUP_SIZE_HEIGHTS}
          aria-label={`${size} button group`}
        >
          <ButtonGroupText
            data-testid={`button-group-text-${size}`}
          >{`${size}:`}</ButtonGroupText>
          <Button variant="outline" data-testid={`button-group-button-${size}`}>
            Action
          </Button>
        </ButtonGroup>
      ))}

      <ButtonGroup size="lg" aria-label="explicit child size">
        <ButtonGroupText data-testid="button-group-text-explicit">
          Explicit:
        </ButtonGroupText>
        <Button
          variant="outline"
          size="sm"
          data-testid="button-group-button-explicit-sm"
        >
          Small
        </Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const [size, expectedHeight] of Object.entries(
      BUTTON_GROUP_SIZE_HEIGHTS
    )) {
      const text = canvas.getByTestId(`button-group-text-${size}`);
      const button = canvas.getByTestId(`button-group-button-${size}`);

      await expect(text).toHaveAttribute('data-size', size);
      await expect(button).toHaveAttribute('data-size', size);
      for (const className of BUTTON_GROUP_TEXT_SIZE_CLASSES[
        size as keyof typeof BUTTON_GROUP_TEXT_SIZE_CLASSES
      ]) {
        await expect(text).toHaveClass(className);
      }

      await expectHeightPinned(
        canvas,
        `button-group-text-${size}`,
        expectedHeight,
        {
          selector: '[data-slot="button-group-text"]',
        }
      );
      await expectHeightPinned(
        canvas,
        `button-group-button-${size}`,
        expectedHeight
      );
    }

    await expect(
      canvas.getByTestId('button-group-button-explicit-sm')
    ).toHaveAttribute('data-size', 'sm');
    await expectHeightPinned(canvas, 'button-group-button-explicit-sm', 32);
  },
};

// Compatibility sentinel: raw input layouts should generally use InputGroup,
// but ButtonGroup must not mutate or break non-Button children.
export const MixedChildren: Story = {
  render: () => (
    <ButtonGroup size="lg" aria-label="mixed button-shaped controls">
      <ButtonGroupText data-testid="button-group-mixed-text">
        Status
      </ButtonGroupText>
      <Input
        data-testid="button-group-input"
        aria-label="Search status"
        className="nx:w-40"
      />
      <Select defaultValue="active">
        <SelectTrigger
          data-testid="button-group-select-trigger"
          aria-label="Status"
          className="nx:w-32"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" data-testid="button-group-mixed-button">
        Save
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByTestId('button-group-mixed-text');
    const input = canvas.getByTestId('button-group-input');
    const selectTrigger = canvas.getByTestId('button-group-select-trigger');

    await expect(text).toHaveAttribute('data-size', 'lg');
    await expect(input).toHaveAttribute('data-size', 'default');
    await expect(selectTrigger).not.toHaveAttribute('data-size');
    await expect(
      canvas.getByTestId('button-group-mixed-button')
    ).toHaveAttribute('data-size', 'lg');
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

// A split button: a primary action joined to a DropdownMenu trigger. The
// trigger renders as a button via asChild, so it joins the seam like any
// other button-shaped control.
export const SplitButton: Story = {
  render: () => (
    <ButtonGroup>
      <Button>Deploy</Button>
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
    // The DropdownMenu trigger composes onto a Button via asChild, so it lands
    // in the group as a button-shaped control (data-slot=button) that opens a
    // menu.
    const trigger = canvasElement.querySelector(
      '[data-slot="button-group"] [aria-haspopup="menu"]'
    );
    await expect(trigger).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('data-slot', 'button');
  },
};

// Regression guard for context-based size propagation: a Button nested inside a
// trigger wrapper (a DropdownMenu trigger, asChild) is not a direct child of the
// group, yet it inherits the group size — the case the old cloneElement walk
// over direct children missed.
export const NestedTriggerInheritsSize: Story = {
  render: () => (
    <ButtonGroup size="sm">
      <Button data-testid="nested-direct">Deploy</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button data-testid="nested-wrapped">Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Staging</DropdownMenuItem>
          <DropdownMenuItem>Production</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The wrapped trigger sets no size of its own; it inherits the group's "sm"
    // through context despite not being a direct child.
    await expect(canvas.getByTestId('nested-wrapped')).toHaveAttribute(
      'data-size',
      'sm'
    );
    // A direct child resolves the same way.
    await expect(canvas.getByTestId('nested-direct')).toHaveAttribute(
      'data-size',
      'sm'
    );
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
      <ButtonGroup orientation="vertical" size="sm">
        <Button variant="outline">Top</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Bottom</Button>
      </ButtonGroup>
    </div>
  ),
};
