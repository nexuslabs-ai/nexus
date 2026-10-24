import type { Meta, StoryObj } from '@storybook/react';
import {
  IconBold,
  IconChevronDown,
  IconItalic,
  IconLink,
  IconUnderline,
} from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import { Button } from '../button/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu';
import { Input } from '../input/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select/select';

import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from './button-group';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    docs: {
      description: {
        component:
          'ButtonGroup joins related buttons into one cluster with shared borders. Use it for a set of related actions or a split button. For an input with addons, use InputGroup.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

// Three outline buttons joined into one horizontal cluster.
export const Default: Story = {
  tags: ['docs'],
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  ),
};

export const Small: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `size="sm"` to shrink every member of the group.',
      },
    },
  },
  render: () => (
    <ButtonGroup size="sm">
      <ButtonGroupText>View:</ButtonGroupText>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
    </ButtonGroup>
  ),
};

export const Large: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `size="lg"` to enlarge every member of the group.',
      },
    },
  },
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Stack the buttons with `orientation="vertical"`.',
      },
    },
  },
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Add a text prefix with ButtonGroupText.',
      },
    },
  },
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>https://</ButtonGroupText>
      <Button variant="outline">nxds.dev</Button>
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Divide ghost buttons into sub-groups with ButtonGroupSeparator.',
      },
    },
  },
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

// The group is a role=group region that advertises its orientation. The first
// group sets no `orientation` or `size`, a regression guard for the default
// emits. In the second, an explicit `size` beats the group's, and a Button
// nested in a wrapper still inherits it.
export const WithDataAttributes: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-4">
      <ButtonGroup>
        <Button variant="outline">One</Button>
        <Button variant="outline">Two</Button>
      </ButtonGroup>
      <ButtonGroup size="sm">
        <Button variant="outline" size="lg">
          Large
        </Button>
        <span>
          <Button variant="outline">Nested</Button>
        </span>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="button-group"]');
    await expect(group).toBeInTheDocument();
    await expect(group).toHaveAttribute('role', 'group');
    await expect(group).toHaveAttribute('data-orientation', 'horizontal');
    await expect(group).toHaveAttribute('data-size', 'default');

    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Large' })).toHaveAttribute(
      'data-size',
      'lg'
    );
    await expect(
      canvas.getByRole('button', { name: 'Nested' })
    ).toHaveAttribute('data-size', 'sm');
  },
};

// A Select trigger joins the group as a button-shaped control, sharing the
// seam with the previous control. The group size reaches Buttons and
// ButtonGroupText only: the Input and Select trigger keep their own size.
export const WithSelectTrigger: Story = {
  render: () => (
    <ButtonGroup size="lg">
      <ButtonGroupText>Status</ButtonGroupText>
      <Button variant="outline">Filter</Button>
      <Input aria-label="Search" className="nx:w-40" />
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

    const canvas = within(canvasElement);
    await expect(trigger).toHaveAttribute('data-size', 'default');
    await expect(
      canvas.getByRole('textbox', { name: 'Search' })
    ).toHaveAttribute('data-size', 'default');
    await expect(
      canvas.getByRole('button', { name: 'Filter' })
    ).toHaveAttribute('data-size', 'lg');
    await expect(canvas.getByText('Status')).toHaveAttribute('data-size', 'lg');
  },
};

// A split button: a primary action joined to a DropdownMenu trigger. The
// trigger renders as a button via asChild, so it joins the seam like any
// other button-shaped control and inherits the group size.
export const SplitButton: Story = {
  render: () => (
    <ButtonGroup size="sm">
      <Button>Deploy</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button endIcon={<IconChevronDown />}>Options</Button>
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
    // The trigger sets no size of its own, so the group's "sm" reaches it.
    await expect(trigger).toHaveAttribute('data-size', 'sm');
  },
};

export const TierAPolishEvidence: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Mix an addon link with loading and disabled buttons in one group, beside a small vertical group.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-4 nx:bg-background nx:p-10">
      <ButtonGroup aria-label="document actions">
        <ButtonGroupText asChild>
          <a href="https://example.com/docs">Docs</a>
        </ButtonGroupText>
        <Button variant="outline">Open</Button>
        <Button variant="outline" loading>
          Saving
        </Button>
        <Button variant="outline" disabled>
          Disabled
        </Button>
      </ButtonGroup>

      <ButtonGroup orientation="vertical" size="sm" aria-label="format density">
        <Button variant="outline">Bold</Button>
        <Button variant="outline">Italic</Button>
        <Button variant="outline">Underline</Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const horizontalGroup = canvas.getByRole('group', {
      name: 'document actions',
    });
    const verticalGroup = canvas.getByRole('group', {
      name: 'format density',
    });
    const link = canvas.getByRole('link', { name: 'Docs' });
    const loadingButton = canvas.getByRole('button', { name: 'Saving' });
    const disabledButton = canvas.getByRole('button', { name: 'Disabled' });

    await expect(horizontalGroup).toHaveAttribute(
      'data-orientation',
      'horizontal'
    );
    await expect(horizontalGroup).toHaveAttribute('data-size', 'default');
    await expect(verticalGroup).toHaveAttribute('data-orientation', 'vertical');
    await expect(verticalGroup).toHaveAttribute('data-size', 'sm');
    for (const button of within(verticalGroup).getAllByRole('button')) {
      await expect(button).toHaveAttribute('data-size', 'sm');
    }

    await expect(link).toHaveClass('nx:transition-control');
    await expect(link).toHaveClass('nx:duration-fast');
    await expect(link).toHaveClass('nx:focus-visible:outline-2');
    await expect(link).toHaveClass('nx:hover:bg-container-hover');
    await expect(link).toHaveClass('nx:active:bg-container-active');

    await expect(loadingButton).toHaveAttribute('data-loading', 'true');
    await expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    await expect(loadingButton).toHaveAttribute('aria-disabled', 'true');

    await expect(disabledButton).toBeDisabled();
    await expect(disabledButton).toHaveAttribute('aria-disabled', 'true');
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
        <Button variant="outline">nxds.dev</Button>
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
