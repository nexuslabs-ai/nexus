import { useState } from 'react';

import { Canvas, Description, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { IconChevronDown } from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectNativePress } from '../../stories/support/native-press';
import { expectHeightPinned } from '../../stories/support/story-height-test-utils';
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
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Description />
          <h2 id="joined-actions">One action with alternatives</h2>
          <p>
            Use a group for related actions with shared borders. It is not a
            selection control or toolbar: buttons retain normal Tab navigation.
            Use ToggleGroup for persistent selection.
          </p>
          <p>
            The main button sends and archives a conversation; the arrow opens
            alternative send actions. This example does not send email.
          </p>
          <Canvas of={SplitButton} />
          <h2 id="calendar-navigation">Calendar navigation</h2>
          <p>
            Move between months or return to the current month. These are
            commands, not persistent view choices such as Week or Month.
          </p>
          <Canvas of={CalendarNavigation} />
          <h2 id="sizes">Sizes</h2>
          <p>
            The group size is inherited by Button and ButtonGroupText, including
            buttons inside trigger wrappers. Set matching icon-only sizes
            explicitly. An explicit child size overrides inheritance.
          </p>
          <Canvas of={ExtraSmall} />
          <Canvas of={Small} />
          <Canvas of={Default} />
          <Canvas of={Large} />
          <h2 id="orientation">Orientation</h2>
          <Canvas of={Vertical} />
          <Canvas of={RightToLeft} />
          <h2 id="compositions">Compositions</h2>
          <p>
            Use Nexus menu and select triggers for split actions. The
            application owns selected values and action effects.
          </p>
          <Canvas of={WithSelectTrigger} />
          <h2 id="destructive-actions">Destructive actions</h2>
          <Canvas of={ErrorOutlineGroup} />
          <h2 id="addons">Supporting API examples</h2>
          <p>
            Use these optional parts only when the surrounding product needs
            them. A text addon can show how many items an action affects. A
            separator divides related commands, such as history and clipboard
            actions. These are composition examples; the application supplies
            the count and action handlers. Use ToggleGroup for persistent
            formatting choices and InputGroup for an editable field with addons.
          </p>
          <Canvas of={WithText} />
          <Canvas of={WithSeparator} />
        </>
      ),
      description: {
        component:
          'Joins related buttons into one control. Members keep their full size when pressed and use colour feedback; standalone Buttons shrink to 98%. Native press geometry is verified in the Vitest browser runner.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

const BUTTON_GROUP_SIZE_HEIGHTS = {
  xs: 28,
  sm: 32,
  default: 40,
  lg: 48,
} as const;

const BUTTON_GROUP_TEXT_SIZE_CLASSES = {
  xs: ['nx:h-7', 'nx:px-2', 'nx:typography-label-small'],
  sm: ['nx:h-8', 'nx:px-2.5', 'nx:typography-label-compact'],
  default: ['nx:h-10', 'nx:px-3', 'nx:typography-label-default'],
  lg: ['nx:h-12', 'nx:px-3.5', 'nx:typography-label-default'],
} as const;

function CalendarNavigationExample() {
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const previousMonth = () =>
    setMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1));
  const nextMonth = () =>
    setMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1));
  const resetMonth = () =>
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  return (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-3">
      <span role="status" className="nx:typography-label-default">
        {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </span>
      <ButtonGroup aria-label="Calendar navigation">
        <Button variant="outline" onClick={previousMonth}>
          Previous
        </Button>
        <Button variant="outline" onClick={resetMonth}>
          Today
        </Button>
        <Button variant="outline" onClick={nextMonth}>
          Next
        </Button>
      </ButtonGroup>
    </div>
  );
}

export const CalendarNavigation: Story = {
  render: () => <CalendarNavigationExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const current = canvas.getByRole('status').textContent;
    await userEvent.click(canvas.getByRole('button', { name: 'Previous' }));
    await expect(canvas.getByRole('status').textContent).not.toBe(current);
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.getByRole('status').textContent).toBe(current);
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.getByRole('status').textContent).not.toBe(current);
    await userEvent.click(canvas.getByRole('button', { name: 'Today' }));
    await expect(canvas.getByRole('status').textContent).toBe(current);
  },
};

// Three outline buttons joined into one horizontal cluster.
export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Copy</Button>
      <Button variant="outline">Paste</Button>
      <Button variant="outline">Duplicate</Button>
    </ButtonGroup>
  ),
};

export const ExtraSmall: Story = {
  render: () => (
    <ButtonGroup size="xs" aria-label="Extra small actions">
      <ButtonGroupText>Actions</ButtonGroupText>
      <Button variant="outline">Save</Button>
      <Button variant="outline" size="icon-xs" aria-label="More actions">
        <IconChevronDown />
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole('button');
    for (const button of buttons) {
      await expect(
        button.getBoundingClientRect().height
      ).toBeGreaterThanOrEqual(24);
    }
    await expect(buttons[0]).toHaveAttribute('data-size', 'xs');
  },
};

export const Small: Story = {
  render: () => (
    <ButtonGroup size="sm">
      <ButtonGroupText>Edit:</ButtonGroupText>
      <Button variant="outline">Copy</Button>
      <Button variant="outline">Paste</Button>
    </ButtonGroup>
  ),
};

export const Large: Story = {
  render: () => (
    <ButtonGroup size="lg">
      <ButtonGroupText>Edit:</ButtonGroupText>
      <Button variant="outline">Copy</Button>
      <Button variant="outline">Paste</Button>
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

// The selection count supplies context for the adjacent bulk actions.
export const WithText: Story = {
  name: 'Selection actions',
  render: () => (
    <ButtonGroup aria-label="Actions for 3 selected items">
      <ButtonGroupText>3 selected</ButtonGroupText>
      <Button variant="outline">Archive</Button>
      <Button variant="error-outline">Delete</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', {
      name: 'Actions for 3 selected items',
    });
    await expect(within(group).getByText('3 selected')).toHaveAttribute(
      'data-slot',
      'button-group-text'
    );
    await expect(within(group).getAllByRole('button')).toHaveLength(2);
    await expect(
      within(group).getByRole('button', { name: 'Archive' })
    ).toBeEnabled();
    await expect(
      within(group).getByRole('button', { name: 'Delete' })
    ).toBeEnabled();
  },
};

// Ghost controls let the separator distinguish history from clipboard commands.
export const WithSeparator: Story = {
  name: 'Command clusters',
  render: () => (
    <ButtonGroup aria-label="Editing commands">
      <Button variant="ghost">Undo</Button>
      <Button variant="ghost">Redo</Button>
      <ButtonGroupSeparator />
      <Button variant="ghost">Copy</Button>
      <Button variant="ghost">Paste</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Editing commands' });
    const separator = group.querySelector(
      '[data-slot="button-group-separator"]'
    );
    await expect(separator).toHaveAttribute('data-orientation', 'vertical');
    for (const name of ['Undo', 'Redo', 'Copy', 'Paste']) {
      const button = within(group).getByRole('button', { name });
      await expect(button).toBeEnabled();
      await expect(button).not.toHaveAttribute('aria-pressed');
    }
  },
};

// The group is a role=group region that advertises its orientation. Rendered
// with no `orientation` prop so it exercises the default — a regression guard
// for the default `data-orientation` emit.
export const WithDataAttributes: Story = {
  tags: ['!autodocs', '!dev'],
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
  tags: ['!autodocs', '!dev'],
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Default-mode height sentinel for ButtonGroup size propagation. Text addons use `h-8` / `h-10` / `h-12` without Button min-widths, while direct Button children receive the matching semantic size.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-4 nx:bg-background nx:p-10">
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
  tags: ['!autodocs', '!dev'],
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
  tags: ['!autodocs', '!dev'],
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
    await expect(link).toHaveClass('nx:focus-visible:outline-2');
    await expect(link).toHaveClass('nx:focus-visible:outline-focus-default');
    await expect(link).toHaveClass('nx:transition-control');
    await expect(link).toHaveClass('nx:duration-fast');
    await expect(link).toHaveClass('nx:hover:bg-container-hover');
    await expect(link).toHaveClass('nx:active:bg-container-active');
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
    <ButtonGroup aria-label="Send email">
      <Button>Send &amp; archive</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" aria-label="Send options">
            <IconChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Send only</DropdownMenuItem>
          <DropdownMenuItem>Send later</DropdownMenuItem>
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
    const menuButton = within(canvasElement).getByRole('button', {
      name: 'Send options',
    });
    menuButton.focus();
    await userEvent.keyboard('{Enter}');
    await expect(
      await within(document.body).findByRole('menuitem', {
        name: 'Send only',
      })
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(menuButton).toHaveFocus());
  },
};

export const TierAPolishEvidence: Story = {
  tags: ['!autodocs', '!dev'],
  parameters: {
    docs: {
      description: {
        story:
          'ButtonGroup Tier-A polish contract: focus-visible addon links, tokenized color motion, inherited loading/disabled button states, and vertical density evidence.',
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

// Regression guard for context-based size propagation: a Button nested inside a
// trigger wrapper (a DropdownMenu trigger, asChild) is not a direct child of the
// group, yet it inherits the group size — the case the old cloneElement walk
// over direct children missed.
export const NestedTriggerInheritsSize: Story = {
  tags: ['!autodocs', '!dev'],
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
        <Button variant="outline">Copy</Button>
        <Button variant="outline">Paste</Button>
        <Button variant="outline">Duplicate</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Actions for 3 selected items">
        <ButtonGroupText>3 selected</ButtonGroupText>
        <Button variant="outline">Archive</Button>
        <Button variant="error-outline">Delete</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" size="sm">
        <Button variant="outline">Top</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Bottom</Button>
      </ButtonGroup>
    </div>
  ),
};

export const ErrorOutlineGroup: Story = {
  render: () => (
    <ButtonGroup aria-label="Project actions">
      <Button variant="outline">Archive</Button>
      <Button variant="error-outline">Delete</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const archive = canvas.getByRole('button', { name: 'Archive' });
    const remove = canvas.getByRole('button', { name: 'Delete' });
    const before = remove.offsetWidth;
    await expect(archive.getBoundingClientRect().right).toBe(
      remove.getBoundingClientRect().left
    );
    await expectNativePress(
      '[data-slot=button-group] [data-variant=error-outline]',
      1
    );
    await expect(archive.getBoundingClientRect().right).toBe(
      remove.getBoundingClientRect().left
    );
    await expect(remove.offsetWidth).toBe(before);
  },
};

export const RightToLeft: Story = {
  render: () => (
    <ButtonGroup
      dir="rtl"
      aria-label="Document actions"
      className="nx:rounded-md"
    >
      <Button variant="outline">First</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Last</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'First' });
    const middle = canvas.getByRole('button', { name: 'Middle' });
    const last = canvas.getByRole('button', { name: 'Last' });
    await expect(first.getBoundingClientRect().left).toBe(
      middle.getBoundingClientRect().right
    );
    await expect(middle.getBoundingClientRect().left).toBe(
      last.getBoundingClientRect().right
    );
    await expect(getComputedStyle(first).borderLeftWidth).not.toBe('0px');
    await expect(getComputedStyle(middle).borderRightWidth).toBe('0px');
    await expect(getComputedStyle(last).borderRightWidth).toBe('0px');
  },
};
