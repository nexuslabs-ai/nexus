import {
  ArgTypes,
  Canvas,
  Description,
  Title,
} from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { IconChevronDown } from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CalendarNavigationExample } from '../../stories/examples/calendar-navigation-example';
import CalendarNavigationExampleSource from '../../stories/examples/calendar-navigation-example.tsx?raw';
import { ReplyExample } from '../../stories/examples/reply-example';
import ReplyExampleSource from '../../stories/examples/reply-example.tsx?raw';
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
import { Toggle } from '../toggle';

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
          <h2 id="split-action">Send a reply</h2>
          <p>
            Keep a frequent action one click away, with alternatives in the
            adjoining menu. Try the buttons: feedback is simulated and no email
            is sent.
          </p>
          <Canvas of={SplitButton} />
          <h2 id="navigation">Browse a calendar</h2>
          <p>
            Previous, Today and Next act on the same calendar. The month changes
            below; there is no selected button.
          </p>
          <Canvas of={CalendarNavigation} />
          <h2 id="sizes">Size comparison</h2>
          <p>
            Set size on the group to size its Button and text-addon children
            together. Explicit child sizes override it; icon-only buttons need
            their matching icon size.
          </p>
          <Canvas of={SizeComparison} />
          <h2 id="separators">Separators</h2>
          <p>
            Use ButtonGroupSeparator between filled buttons when each action
            needs a visible boundary, or between clusters of ghost actions.
            Outline, error-outline and dashed buttons already have border seams;
            an extra separator is usually unnecessary. Present link buttons
            separately, without a ButtonGroupSeparator.
          </p>
          <p>
            The full-length separator overlaps the following button and uses
            that button’s fill: primary-border-on-solid for default,
            error-border-on-solid for destructive, and border-default otherwise.
            The on-solid tokens are decorative dividers at 24% opacity, not
            focus indicators or required control boundaries. For a vertical
            group, set the separator orientation to horizontal.
          </p>
          <Canvas of={SeparatorVariants} />
          <h2 id="vertical">Vertical groups</h2>
          <p>
            Use a vertical group for related commands in a narrow side panel.
            This composition shows history and clipboard commands separated by a
            horizontal rule. Buttons use normal Tab navigation; application code
            supplies the action handlers.
          </p>
          <Canvas of={Vertical} />
          <h2 id="api">API</h2>
          <ArgTypes />
          <p>
            ButtonGroupText adds non-interactive context. ButtonGroupSeparator
            divides command clusters. Use these parts only when the product
            needs them. Buttons keep normal Tab navigation; application code
            owns their effects.
          </p>
        </>
      ),
      description: {
        component:
          'Visually joins closely related actions. Use a split action or navigation cluster when the shared boundary helps explain the relationship. Ordinary adjacent actions can remain separate. Use ToggleGroup for persistent choices and InputGroup for editable fields.',
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

export const SizeComparison: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-end nx:gap-6">
      {(['xs', 'sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="nx:flex nx:flex-col nx:items-start nx:gap-2">
          <span className="nx:typography-label-small nx:text-muted-foreground">
            {size}
          </span>
          <ButtonGroup size={size} aria-label={`${size} history commands`}>
            <Button variant="outline">Undo</Button>
            <Button variant="outline">Redo</Button>
          </ButtonGroup>
        </div>
      ))}
    </div>
  ),
};

/** Appearance reference; these buttons do not execute product actions. */
export const SeparatorVariants: Story = {
  name: 'Separator variants',
  parameters: {
    docs: {
      description: {
        story:
          'Appearance reference only. Filled and ghost-style pairs use full-length separators. Bordered pairs use their existing border seam.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-start nx:gap-6">
      {(
        [
          'default',
          'secondary',
          'destructive',
          'error',
          'outline',
          'error-outline',
          'dashed',
          'ghost',
        ] as const
      ).map((variant) => (
        <div
          key={variant}
          className="nx:flex nx:flex-col nx:items-start nx:gap-2"
        >
          <span className="nx:typography-label-small nx:text-muted-foreground">
            {variant}
          </span>
          <ButtonGroup aria-label={`${variant} separator appearance`}>
            <Button variant={variant}>Action</Button>
            {!['outline', 'error-outline', 'dashed'].includes(variant) && (
              <ButtonGroupSeparator />
            )}
            <Button variant={variant}>More</Button>
          </ButtonGroup>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const group of canvas.getAllByRole('group')) {
      const first = within(group).getByRole('button', { name: 'Action' });
      const second = within(group).getByRole('button', { name: 'More' });
      const firstBounds = first.getBoundingClientRect();
      const secondBounds = second.getBoundingClientRect();
      await expect(firstBounds.right).toBe(secondBounds.left);
      const divider = group.querySelector(
        '[data-slot="button-group-separator"]'
      );
      if (divider) {
        const bounds = divider.getBoundingClientRect();
        await expect(bounds.top).toBe(firstBounds.top);
        await expect(bounds.bottom).toBe(firstBounds.bottom);
        await expect(divider).toHaveAttribute('role', 'none');
      }
    }
  },
};

export const CalendarNavigation: Story = {
  render: () => <CalendarNavigationExample />,
  parameters: {
    docs: { source: { type: 'code', code: CalendarNavigationExampleSource } },
  },
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
  tags: ['!autodocs', '!dev'],
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Copy</Button>
      <Button variant="outline">Paste</Button>
      <Button variant="outline">Duplicate</Button>
    </ButtonGroup>
  ),
};

export const ExtraSmall: Story = {
  tags: ['!autodocs', '!dev'],
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
  tags: ['!autodocs', '!dev'],
  render: () => (
    <ButtonGroup size="sm">
      <ButtonGroupText>Edit:</ButtonGroupText>
      <Button variant="outline">Copy</Button>
      <Button variant="outline">Paste</Button>
    </ButtonGroup>
  ),
};

export const Large: Story = {
  tags: ['!autodocs', '!dev'],
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
    <ButtonGroup
      orientation="vertical"
      size="sm"
      aria-label="Document commands"
    >
      <Button variant="ghost">Undo</Button>
      <Button variant="ghost">Redo</Button>
      <ButtonGroupSeparator orientation="horizontal" />
      <Button variant="ghost">Copy</Button>
      <Button variant="ghost">Paste</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="button-group"]');
    await expect(group).toHaveAttribute('data-orientation', 'vertical');
    await expect(group).toHaveAttribute('data-size', 'sm');
    const divider = group?.querySelector(
      '[data-slot="button-group-separator"]'
    );
    await expect(divider).toHaveAttribute('data-orientation', 'horizontal');
    const dividerBounds = divider!.getBoundingClientRect();
    await expect(dividerBounds.width).toBeGreaterThan(dividerBounds.height);

    const canvas = within(canvasElement);
    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toHaveAttribute('data-size', 'sm');
    }
  },
};

// The selection count supplies context for the adjacent bulk actions.
export const WithText: Story = {
  tags: ['!autodocs', '!dev'],
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
  tags: ['!autodocs', '!dev'],
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

// Navigation composes through Button, alongside action buttons.
export const AsChild: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <ButtonGroup>
      <Button asChild variant="outline">
        <a href="https://example.com">Docs</a>
      </Button>
      <Button variant="outline">Open</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Docs' });
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('data-slot', 'button');
    await expect(link).toHaveClass('nx:focus-visible:outline-2');
    await expect(link).toHaveClass('nx:focus-visible:outline-focus-default');
    await expect(link).toHaveClass(
      'nx:transition-[color,background-color,border-color,scale]'
    );
    await expect(link).toHaveClass('nx:duration-faster');
    await expect(link).toHaveClass('nx:hover:bg-container-hover');
    await expect(link).toHaveClass('nx:active:bg-container-active');
  },
};

// A Select trigger joins the group as a button-shaped control, sharing the
// seam with the adjacent button.
export const WithSelectTrigger: Story = {
  tags: ['!autodocs', '!dev'],
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
  render: () => <ReplyExample />,
  parameters: { docs: { source: { type: 'code', code: ReplyExampleSource } } },
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
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Send & archive' })
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Demo: reply sent and conversation archived.'
    );
    menuButton.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(
      await within(document.body).findByRole('menuitem', { name: 'Send only' })
    );
    await waitFor(() => expect(menuButton).toHaveFocus());
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Conversation stays in the inbox.'
    );
  },
};

export const TierAPolishEvidence: Story = {
  tags: ['!autodocs', '!dev'],
  parameters: {
    docs: {
      description: {
        story:
          'ButtonGroup Tier-A polish contract: focus-visible Button links, tokenized color motion, inherited loading/disabled button states, and vertical density evidence.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-4 nx:bg-background nx:p-10">
      <ButtonGroup aria-label="document actions">
        <Button asChild variant="outline">
          <a href="https://example.com/docs">Docs</a>
        </Button>
        <Button variant="outline">Open</Button>
        <Button variant="outline" loading>
          Saving
        </Button>
        <Button variant="outline" disabled>
          Disabled
        </Button>
      </ButtonGroup>

      <ButtonGroup
        orientation="vertical"
        size="sm"
        aria-label="history commands"
      >
        <Button variant="outline">Undo</Button>
        <Button variant="outline">Redo</Button>
        <Button variant="outline">Restore</Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const horizontalGroup = canvas.getByRole('group', {
      name: 'document actions',
    });
    const verticalGroup = canvas.getByRole('group', {
      name: 'history commands',
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

    await expect(link).toHaveClass(
      'nx:transition-[color,background-color,border-color,scale]'
    );
    await expect(link).toHaveClass('nx:duration-faster');
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
  tags: ['!autodocs', '!dev'],
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
  tags: ['!autodocs', '!dev'],
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
  tags: ['!autodocs', '!dev'],
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

export const MixedSeparatorSurfaces: Story = {
  globals: { mode: 'dark' },
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-start nx:gap-4">
      {(['horizontal', 'vertical'] as const).map((orientation) => (
        <div
          key={orientation}
          className="nx:flex nx:flex-wrap nx:items-start nx:gap-4"
        >
          {(['ltr', 'rtl'] as const).map((dir) => (
            <div
              key={dir}
              dir={dir}
              className="nx:flex nx:flex-wrap nx:items-start nx:gap-4"
            >
              {(
                [
                  ['default', 'default'],
                  ['destructive', 'destructive'],
                  ['secondary', 'secondary'],
                  ['default', 'destructive'],
                  ['destructive', 'default'],
                  ['default', 'secondary'],
                ] as const
              ).map(([first, next]) => (
                <ButtonGroup
                  key={`${first}-${next}`}
                  orientation={orientation}
                  aria-label={`${orientation} ${dir} ${first} to ${next}`}
                >
                  <Button variant={first}>Action</Button>
                  <ButtonGroupSeparator
                    orientation={
                      orientation === 'horizontal' ? 'vertical' : 'horizontal'
                    }
                  />
                  <Button variant={next}>More</Button>
                </ButtonGroup>
              ))}
            </div>
          ))}
        </div>
      ))}
      <ButtonGroup aria-label="secondary to toggle">
        <Button variant="secondary">Bold</Button>
        <ButtonGroupSeparator />
        <Toggle aria-label="Italic">I</Toggle>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const neutral = (label: string) =>
      getComputedStyle(
        canvas
          .getByRole('group', { name: label })
          .querySelector('[data-slot="button-group-separator"]')!
      ).backgroundColor;
    // Toggle also renders data-variant="default"; it must keep the neutral rule.
    await expect(neutral('secondary to toggle')).toBe(
      neutral('horizontal ltr secondary to secondary')
    );
    for (const orientation of ['horizontal', 'vertical']) {
      for (const dir of ['ltr', 'rtl']) {
        const dividerColour = (pair: string) => {
          const group = canvas.getByRole('group', {
            name: `${orientation} ${dir} ${pair}`,
          });
          const divider = group.querySelector(
            '[data-slot="button-group-separator"]'
          )!;
          return getComputedStyle(divider).backgroundColor;
        };
        await expect(dividerColour('default to destructive')).toBe(
          dividerColour('destructive to destructive')
        );
        await expect(dividerColour('destructive to default')).toBe(
          dividerColour('default to default')
        );
        await expect(dividerColour('default to secondary')).toBe(
          dividerColour('secondary to secondary')
        );
        // Solid fills take their on-solid divider, not the neutral border.
        await expect(dividerColour('default to default')).not.toBe(
          dividerColour('secondary to secondary')
        );
        await expect(dividerColour('destructive to destructive')).not.toBe(
          dividerColour('secondary to secondary')
        );
      }
    }
  },
};
