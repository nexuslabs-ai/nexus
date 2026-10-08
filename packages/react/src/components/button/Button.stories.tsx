import type { FormEvent } from 'react';

import { DEFAULT_NEXUS_APPEARANCE } from '@nexus_ds/core';
import {
  Canvas,
  Controls,
  Description,
  Title,
} from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { IconArrowRight, IconRocket, IconStar } from '@tabler/icons-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { expectNativePress } from '../../stories/support/native-press';
import { expectHeightPinned } from '../../stories/support/story-height-test-utils';
import { NexusRoot } from '../appearance/provider';
import { ButtonGroup } from '../button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Description />
          <h2 id="playground">Playground</h2>
          <p>
            Change the variant, size and state here. Examples demonstrate
            presentation; your application owns action handlers and loading
            state.
          </p>
          <Canvas of={Default} />
          <Controls of={Default} />
          <h2 id="variants">Variants</h2>
          <p>
            Use default for the main action, outline or secondary for supporting
            actions, and ghost or link for low emphasis. Destructive is filled;
            error-outline is bordered; error is borderless.
          </p>
          <Canvas of={AllVariants} />
          <h2 id="sizes-and-icons">Sizes and icons</h2>
          <p>
            XS, Small, Default and Large use 12/13/14/14px text and
            12/14/16/16px icons. Density adjusts geometry, not these text or
            icon sizes. Shared density-scale corrections are tracked separately
            in PR #817.
          </p>
          <Canvas of={SizePairs} />
          <p>
            Use one decorative startIcon or endIcon. Icon-only sizes require an
            accessible name.
          </p>
          <Canvas of={StartIconSlot} />
          <Canvas of={EndIconSlot} />
          <h2 id="disabled-and-loading">Disabled and loading</h2>
          <p>
            Disabled controls are subdued. Loading retains variant colours,
            blocks repeated activation and preserves the accessible label and
            occupied width while showing a spinner. These comparisons explicitly
            render light and dark themes.
          </p>
          <Canvas of={DisabledAndLoadingThemes} />
          <h2 id="links">Links</h2>
          <p>
            Use asChild with an anchor for navigation. Compose its content
            inside the anchor; the loading spinner and icon-slot props apply to
            native buttons only. Disabled links are removed from keyboard focus
            and activation is blocked.
          </p>
          <Canvas of={AsLink} />
          <h2 id="press-feedback">Press feedback</h2>
          <p>
            Standalone buttons compress to 0.98 while pressed. Joined group
            members retain their size to keep borders connected. Both use
            existing active colours.
          </p>
          <Canvas of={PressFeedback} />
        </>
      ),
      description: {
        component:
          'Use Button for concise visible action labels. Use exactly one decorative icon slot when needed; loading buttons render spinner-only visually while preserving their label and icon space. Icon-only buttons must provide an accessible name with `aria-label` or `aria-labelledby`.',
      },
    },
  },
  args: {
    children: 'Save changes',
    onClick: fn(), // Spy function for testing
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'error',
        'error-outline',
        'destructive',
        'outline',
        'dashed',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'The visual style variant',
    },
    size: {
      control: 'select',
      options: [
        'xs',
        'sm',
        'default',
        'lg',
        'icon-xs',
        'icon-sm',
        'icon',
        'icon-lg',
      ],
      description:
        'Paired sizes: xs / icon-xs, sm / icon-sm, default / icon, lg / icon-lg. Density adjusts spacing and height. Text and icons remain stable: XS 12px/12px, Small 13px/14px, Default and Large 14px/16px.',
    },
    startIcon: {
      control: false,
      description: 'Decorative icon rendered before the button label',
    },
    endIcon: {
      control: false,
      description: 'Decorative icon rendered after the button label',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    asChild: {
      control: false,
      description:
        'Render as child element (for composition); see the Links example',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ============================================
// VARIANT STORIES (visual documentation)
// ============================================

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'default',
    children: 'Primary',
  },
};

export const Secondary: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Error: Story = {
  tags: ['!autodocs', '!dev'],
  parameters: {
    docs: {
      description: {
        story:
          'Low-emphasis destructive action: transparent at rest (a destructive-tinted ghost) with subtle error fills on hover/active. Use for secondary or in-context destructive actions; reach for the solid `destructive` variant for the primary destructive action in a view.',
      },
    },
  },
  args: {
    variant: 'error',
    children: 'Error',
  },
};

export const ErrorOutline: Story = {
  tags: ['!autodocs', '!dev'],
  args: { variant: 'error-outline', children: 'Delete project' },
  parameters: {
    docs: {
      description: {
        story:
          'An outlined destructive action with existing error border, text and interaction tokens. Use destructive for a filled, high-emphasis action; error for a borderless action.',
      },
    },
  },
};

export const Outline: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Dashed: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'dashed',
    children: 'Dashed',
  },
};

export const Ghost: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
};

export const Link: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <Button variant="link" data-testid="button-link">
      Link
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Link' });

    await expect(button).toHaveClass('nx:underline-offset-4');
    await expect(button).toHaveClass('nx:hover:underline');
    await expect(button).toHaveClass('nx:border-0');
    await expect(button).toHaveClass('nx:p-0!');
    await expect(button).not.toHaveClass('nx:hover:bg-primary-subtle-hover');
    await expectHeightPinned(canvas, 'button-link', 20);
  },
};

// ============================================
// SIZE STORIES
// ============================================

export const ExtraSmall: Story = {
  tags: ['!autodocs', '!dev'],
  args: { size: 'xs', children: 'Extra small' },
};

export const Small: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    size: 'lg',
    children: 'Large',
  },
};

export const IconSize: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    size: 'icon',
    children: <IconStar />,
    'aria-label': 'Star',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Star' });

    await expect(button).toHaveClass('nx:size-10');
    await expect(button).toHaveClass('nx:p-0');
    await expect(button).toHaveAttribute('data-icon-only', 'true');
  },
};

export const IconSmallSize: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    size: 'icon-sm',
    children: <IconStar />,
    'aria-label': 'Small star',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Small star' });

    await expect(button).toHaveClass('nx:size-8');
    await expect(button).toHaveAttribute('data-icon-only', 'true');
  },
};

export const IconLargeSize: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    size: 'icon-lg',
    children: <IconStar />,
    'aria-label': 'Large star',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Large star' });

    await expect(button).toHaveClass('nx:size-12');
    await expect(button).toHaveAttribute('data-icon-only', 'true');
  },
};

export const SizePairs: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Extra small, small, default and large each pair a text button with an equally tall square icon button. Each row also shows an icon with a label and its loading state. Use the density toolbar to compare spacing. Text sizes are 12/13/14/14px and icon/spinner sizes are 12/14/16/16px. Density changes the surrounding space, not these sizes.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      {(
        [
          ['xs', 'icon-xs', 'Extra small'],
          ['sm', 'icon-sm', 'Small'],
          ['default', 'icon', 'Default'],
          ['lg', 'icon-lg', 'Large'],
        ] as const
      ).map(([size, iconSize, label]) => (
        <div
          key={size}
          role="group"
          aria-label={`${label} buttons`}
          className="nx:flex nx:flex-wrap nx:items-center nx:gap-2"
        >
          <Button size={size} variant="outline">
            {label}
          </Button>
          <Button
            size={iconSize}
            variant="outline"
            aria-label={`${label} next`}
          >
            <IconArrowRight />
          </Button>
          <Button size={size} variant="outline" startIcon={<IconArrowRight />}>
            Continue
          </Button>
          <Button size={size} variant="outline" endIcon={<IconArrowRight />}>
            Continue
          </Button>
          <Button
            size={size}
            variant="outline"
            endIcon={<IconArrowRight />}
            loading
          >
            Continue
          </Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const group of within(canvasElement).getAllByRole('group')) {
      const [text, icon, leading, withIcon, loading] =
        within(group).getAllByRole('button');
      if (!text || !icon || !leading || !withIcon || !loading)
        throw new globalThis.Error(
          'Each size pair must include all five button examples.'
        );
      const height = text.getBoundingClientRect().height;
      for (const button of [icon, leading, withIcon, loading]) {
        await expect(button.getBoundingClientRect().height).toBeCloseTo(
          height,
          2
        );
      }
      await expect(icon.getBoundingClientRect().width).toBeCloseTo(height, 2);
      await expect(loading.getBoundingClientRect().width).toBeCloseTo(
        withIcon.getBoundingClientRect().width,
        2
      );
      await expect(icon).toHaveAccessibleName();
      await expect(loading).toHaveAttribute('aria-disabled', 'true');
    }
  },
};

// ============================================
// STATE STORIES (with interaction tests)
// ============================================

export const Disabled: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    disabled: true,
    children: 'Disabled',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Verify disabled state
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('disabled');

    // Verify onClick was not attached or callable
    // Note: Can't test click with pointer-events: none, disabled state is sufficient
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    loading: true,
    children: 'Submitting',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Submitting' });
    const loadingLabel = button.querySelector(
      '[data-slot="button-loading-label"]'
    );

    // Loading stays focusable; the capture guard blocks activation.
    await expect(button).not.toBeDisabled();
    await expect(button).not.toHaveAttribute('data-disabled');
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toHaveAttribute('data-loading', 'true');
    await expect(
      button.querySelector('[data-slot="spinner"]')
    ).toBeInTheDocument();
    await expect(loadingLabel).toBeInTheDocument();
    await expect(loadingLabel).toHaveClass('nx:opacity-0');
    await expect(loadingLabel).toHaveTextContent('Submitting');
    await expect(button).toHaveAccessibleName('Submitting');

    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    button.click();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const LoadingPreservesDefaultWidth: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-2 nx:p-10 nx:bg-background">
      <Button data-testid="button-ready">Save changes</Button>
      <Button loading data-testid="button-loading">
        Save changes
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const readyButton = canvas.getByTestId('button-ready');
    const loadingButton = canvas.getByTestId('button-loading');
    const loadingContent = loadingButton.querySelector(
      '[data-slot="button-loading-content"]'
    );
    const loadingLabel = loadingButton.querySelector(
      '[data-slot="button-loading-label"]'
    );

    expect(Math.round(loadingButton.getBoundingClientRect().width)).toBe(
      Math.round(readyButton.getBoundingClientRect().width)
    );
    await expect(loadingContent).toBeInTheDocument();
    await expect(loadingLabel).toHaveClass('nx:opacity-0');
    await expect(loadingButton).toHaveAccessibleName('Save changes');
  },
};

export const TextButtonsStayContentWidth: Story = {
  tags: ['!autodocs', '!dev'],
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Decision sentinel: labeled Buttons do not carry a min-width floor. Text buttons remain content-width, while icon-only buttons keep their dedicated square size so width rules cannot leak between the two contracts.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-2 nx:p-10 nx:bg-background">
      <Button data-testid="button-content-short">Go</Button>
      <Button data-testid="button-content-long">Confirm transfer</Button>
      <Button size="icon" aria-label="Icon action">
        <IconStar />
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shortButton = canvas.getByTestId('button-content-short');
    const longButton = canvas.getByTestId('button-content-long');
    const iconButton = canvas.getByLabelText('Icon action');
    const hasMinWidthClass = (element: HTMLElement) =>
      Array.from(element.classList).some((className) =>
        className.startsWith('nx:min-w-')
      );

    expect(hasMinWidthClass(shortButton)).toBe(false);
    expect(hasMinWidthClass(longButton)).toBe(false);
    expect(Math.round(shortButton.getBoundingClientRect().width)).toBeLessThan(
      64
    );
    expect(
      Math.round(longButton.getBoundingClientRect().width)
    ).toBeGreaterThan(Math.round(shortButton.getBoundingClientRect().width));
    await expect(iconButton).toHaveClass('nx:size-10');
    expect(Math.round(iconButton.getBoundingClientRect().width)).toBe(
      parseFloat(
        getComputedStyle(iconButton).getPropertyValue('--nx-spacing-10')
      )
    );
  },
};

export const ManualBusyState: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    'aria-busy': true,
    children: 'Processing',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).not.toHaveAttribute('data-loading');
    await expect(button).not.toBeDisabled();
  },
};

export const LoadingWithVariants: Story = {
  tags: ['!autodocs', '!dev'],
  render: (_args) => (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Button loading variant="default">
        Default
      </Button>
      <Button loading variant="secondary">
        Secondary
      </Button>
      <Button loading variant="error">
        Error
      </Button>
      <Button loading variant="destructive">
        Destructive
      </Button>
      <Button loading variant="outline">
        Outline
      </Button>
      <Button loading variant="dashed">
        Dashed
      </Button>
    </div>
  ),
};

// ============================================
// INTERACTION TESTS
// ============================================

export const ClickInteraction: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Button should be clickable
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Multiple clicks should increment
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const KeyboardInteraction: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    children: 'Press Enter',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Tab to focus
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Enter triggers click
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Space triggers click
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

/**
 * Bug 2 from #726: the focus gap used to be an opaque
 * `0 0 0 2px var(--color-background)` shadow band, so a button sitting on any
 * surface other than the page painted the page fill into its own gap.
 * `outline-offset` leaves the gap unpainted, so the `muted` surface shows
 * through. Visual scene — `FocusManagement` asserts the absent `box-shadow`
 * that makes it true.
 */
export const FocusGapShowsSurfaceBehind: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:bg-background nx:p-6">
      <div className="nx:bg-muted nx:rounded-md nx:p-6">
        <Button>On a quiet surface</Button>
      </div>
    </div>
  ),
};

export const FocusManagement: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    children: 'Focus me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Initially not focused
    await expect(button).not.toHaveFocus();

    // Tab should focus
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // The ring is a real outline with a transparent 2px gap, so the gap shows
    // whatever surface the button sits on rather than an opaque page-background
    // band painted by a box-shadow.
    const focusStyles = getComputedStyle(button);
    await expect(focusStyles.outlineOffset).toBe('2px');
    await expect(focusStyles.outlineStyle).toBe('solid');
    await expect(focusStyles.outlineWidth).toBe('2px');
    await expect(focusStyles.boxShadow).toBe('none');

    // Shift+Tab should blur
    await userEvent.tab({ shift: true });
    await expect(button).not.toHaveFocus();
  },
};

export const PressFeedback: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Press feedback uses the existing duration-faster token (100ms) and ease-enter curve. Standalone buttons compress to 98%; joined ButtonGroup buttons keep their full size. Active colours use each variant’s existing tokens. Activation remains on click, and loading or disabled buttons do not compress.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:gap-2">
      {(
        [
          'default',
          'secondary',
          'outline',
          'error-outline',
          'error',
          'destructive',
          'dashed',
          'ghost',
          'link',
        ] as const
      ).map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole('button')) {
      await expectNativePress(
        `[data-slot=button][data-variant=${button.dataset.variant}]`,
        0.98
      );
    }
  },
};

export const ErrorOutlineInteraction: Story = {
  tags: ['!autodocs', '!dev'],
  args: { ...ErrorOutline.args },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Delete project',
    });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(getComputedStyle(button).borderTopStyle).toBe('solid');
  },
};

export const ErrorOutlineDisabled: Story = {
  tags: ['!autodocs', '!dev'],
  args: { ...ErrorOutline.args, disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

// ============================================
// PROPS & ATTRIBUTES TESTS
// ============================================

export const WithDataAttributes: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:gap-2">
      <Button>Default attrs</Button>
      <Button variant="secondary" size="lg">
        Explicit attrs
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaultButton = canvas.getByRole('button', {
      name: 'Default attrs',
    });
    const explicitButton = canvas.getByRole('button', {
      name: 'Explicit attrs',
    });

    await expect(defaultButton).toHaveAttribute('data-slot', 'button');
    await expect(defaultButton).toHaveAttribute('data-variant', 'default');
    await expect(defaultButton).toHaveAttribute('data-size', 'default');
    await expect(explicitButton).toHaveAttribute('data-slot', 'button');
    await expect(explicitButton).toHaveAttribute('data-variant', 'secondary');
    await expect(explicitButton).toHaveAttribute('data-size', 'lg');
  },
};

export const WithCustomClassName: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    children: 'Custom Class',
    className: 'nx:mt-2',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toHaveClass('nx:mt-2');
  },
};

export const WithAriaLabel: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    children: '×',
    'aria-label': 'Close dialog',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toHaveAccessibleName('Close dialog');
  },
};

export const DefaultType: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    children: 'Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Should default to type="button" to prevent accidental form submission
    await expect(button).toHaveAttribute('type', 'button');
  },
};

export const SubmitType: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    children: 'Submit',
    type: 'submit',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Can explicitly set type="submit" for forms
    await expect(button).toHaveAttribute('type', 'submit');
  },
};

// ============================================
// COMPOSITION (asChild)
// ============================================

export const AsLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="https://example.com">Visit Website</a>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveAttribute('data-slot', 'button');
  },
};

export const AsChildWithStringChild: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => <Button asChild>Plain text child</Button>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // asChild needs a single element to clone onto; a non-element child falls
    // back to the native <button> rather than rendering an unstyled fragment.
    const button = canvas.getByRole('button', { name: 'Plain text child' });

    await expect(button.tagName).toBe('BUTTON');
    await expect(button).toHaveAttribute('data-slot', 'button');
  },
};

const disabledChildClick = fn();
const disabledChildCapture = fn();

export const DisabledAsLink: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    onClick: fn(),
    disabled: true,
    children: 'Disabled link',
  },
  render: ({ children, ...args }) => (
    <Button {...args} asChild>
      <a
        href="#disabled-as-link"
        onClick={disabledChildClick}
        onClickCapture={disabledChildCapture}
      >
        {children}
      </a>
    </Button>
  ),
  play: async ({ canvasElement, args }) => {
    disabledChildClick.mockClear();
    disabledChildCapture.mockClear();
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).not.toHaveAttribute('disabled');
    await expect(link).not.toHaveAttribute('type');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).toHaveAttribute('tabindex', '-1');
    await expect(link).toHaveClass('nx:aria-disabled:pointer-events-none');
    await expect(getComputedStyle(link).opacity).toBe('1');
    await expect(link).toHaveAttribute('data-disabled', 'true');
    await expect(link).toHaveClass('nx:data-disabled:bg-disabled');
    const initialHash = window.location.hash;
    link.click();
    link.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(disabledChildClick).not.toHaveBeenCalled();
    await expect(disabledChildCapture).not.toHaveBeenCalled();
    await expect(window.location.hash).toBe(initialHash);
  },
};

// ============================================
// AUTHORING CONTRACTS
// ============================================

export const StartIconSlot: Story = {
  args: {
    startIcon: <IconRocket data-testid="start-icon" />,
    children: 'Launch',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Launch' });
    const startIcon = button.querySelector('[data-slot="button-start-icon"]');

    await expect(startIcon).toBeInTheDocument();
    await expect(startIcon).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByTestId('start-icon')).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Launch');
  },
};

export const EndIconSlot: Story = {
  args: {
    endIcon: <IconArrowRight data-testid="end-icon" />,
    children: 'Continue',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Continue' });
    const endIcon = button.querySelector('[data-slot="button-end-icon"]');

    await expect(endIcon).toBeInTheDocument();
    await expect(endIcon).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByTestId('end-icon')).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Continue');
  },
};

export const LoadingUsesSpinnerOnly: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    loading: true,
    startIcon: <IconRocket />,
    endIcon: <IconArrowRight />,
    children: 'Launching',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Launching' });
    const loadingLabel = button.querySelector(
      '[data-slot="button-loading-label"]'
    );

    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(
      button.querySelector('[data-slot="button-start-icon"]')
    ).toBeInTheDocument();
    await expect(
      button.querySelector('[data-slot="button-end-icon"]')
    ).toBeInTheDocument();
    await expect(
      button.querySelector('[data-slot="spinner"]')
    ).toBeInTheDocument();
    await expect(loadingLabel).toBeInTheDocument();
    await expect(loadingLabel).toHaveClass('nx:opacity-0');
    await expect(loadingLabel).toHaveTextContent('Launching');
    await expect(button).toHaveAccessibleName('Launching');
  },
};

// ============================================
// ALL VARIANTS GRID (visual reference)
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      {(
        [
          'default',
          'secondary',
          'outline',
          'dashed',
          'ghost',
          'link',
          'destructive',
          'error-outline',
          'error',
        ] as const
      ).map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const VariantClassesMatchFigmaTokens: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="error">Error</Button>
      <Button variant="error-outline">Error outline</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="dashed">Dashed</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Default' })).toHaveClass(
      'nx:active:bg-primary-background-active'
    );
    await expect(canvas.getByRole('button', { name: 'Secondary' })).toHaveClass(
      'nx:active:bg-secondary-background-active'
    );
    await expect(canvas.getByRole('button', { name: 'Error' })).toHaveClass(
      'nx:text-error-subtle-foreground'
    );
    await expect(
      canvas.getByRole('button', { name: 'Destructive' })
    ).toHaveClass('nx:active:bg-error-background-active');
    await expect(canvas.getByRole('button', { name: 'Outline' })).toHaveClass(
      'nx:hover:bg-container-hover'
    );
    await expect(canvas.getByRole('button', { name: 'Dashed' })).toHaveClass(
      'nx:border-dashed'
    );
    await expect(canvas.getByRole('button', { name: 'Ghost' })).toHaveClass(
      'nx:hover:bg-container-hover'
    );
    await expect(canvas.getByRole('button', { name: 'Link' })).toHaveClass(
      'nx:hover:underline'
    );
  },
};

export const BorderedVariantsKeepFixedHeight: Story = {
  globals: { density: 'default' },
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Button variant="outline" size="sm" data-testid="outline-sm">
          Sm
        </Button>
        <Button variant="outline" data-testid="outline-default">
          Default
        </Button>
        <Button variant="outline" size="lg" data-testid="outline-lg">
          Lg
        </Button>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Button variant="dashed" size="sm" data-testid="dashed-sm">
          Sm
        </Button>
        <Button variant="dashed" data-testid="dashed-default">
          Default
        </Button>
        <Button variant="dashed" size="lg" data-testid="dashed-lg">
          Lg
        </Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectHeightPinned(canvas, 'outline-sm', 32);
    await expectHeightPinned(canvas, 'outline-default', 40);
    await expectHeightPinned(canvas, 'outline-lg', 48);
    await expectHeightPinned(canvas, 'dashed-sm', 32);
    await expectHeightPinned(canvas, 'dashed-default', 40);
    await expectHeightPinned(canvas, 'dashed-lg', 48);
  },
};

export const DefaultModeHeightPinned: Story = {
  globals: { density: 'default' },
  tags: ['!autodocs', '!dev'],
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the fixed-height outcome: in default mode, a default Button renders at exactly 40px via `h-10`.',
      },
    },
  },
  render: () => (
    <div data-testid="button-default-host" className="nx:p-10 nx:bg-background">
      <Button>Default</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'button-default-host', 40);
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================

export const DisabledAndLoadingThemes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Compare normal, disabled and loading states. Disabled surfaces use the neutral disabled tokens. Loading retains the normal variant colours while blocking repeat activation; its spinner replaces the visible label without changing the accessible name.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:w-full nx:flex-col nx:gap-4">
      {(['light', 'dark'] as const).map((mode) => (
        <NexusRoot
          key={mode}
          data-testid="button-state-theme"
          state={{ ...DEFAULT_NEXUS_APPEARANCE, mode }}
          className="nx:overflow-x-auto nx:rounded-base nx:bg-background nx:p-4 nx:text-foreground"
        >
          <span
            data-testid="disabled-reference"
            className="nx:sr-only nx:bg-disabled nx:text-disabled-foreground"
          />
          <table className="nx:w-full nx:text-start nx:typography-label-default">
            <caption className="nx:pb-3 nx:text-start">
              {mode === 'light' ? 'Light' : 'Dark'} appearance
            </caption>
            <thead>
              <tr>
                {['Variant', 'Normal', 'Disabled', 'Loading'].map((label) => (
                  <th
                    key={label}
                    scope="col"
                    className="nx:p-2 nx:text-start nx:font-medium nx:text-muted-foreground"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  'default',
                  'secondary',
                  'destructive',
                  'error-outline',
                  'outline',
                  'dashed',
                  'ghost',
                  'error',
                  'link',
                ] as const
              ).map((variant) => (
                <tr key={variant} data-testid="button-state-row">
                  <th
                    scope="row"
                    className="nx:p-2 nx:text-start nx:font-medium"
                  >
                    {variant}
                  </th>
                  <td className="nx:p-2">
                    <Button variant={variant}>Save changes</Button>
                  </td>
                  <td className="nx:p-2">
                    <Button variant={variant} disabled>
                      Save changes
                    </Button>
                  </td>
                  <td className="nx:p-2">
                    <Button variant={variant} loading>
                      Save changes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </NexusRoot>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const roots = canvasElement.querySelectorAll(
      '[data-testid="button-state-theme"]'
    );
    await expect(roots).toHaveLength(2);
    for (const root of roots) {
      const reference = getComputedStyle(
        root.querySelector('[data-testid="disabled-reference"]')!
      );
      for (const row of root.querySelectorAll(
        '[data-testid="button-state-row"]'
      )) {
        const buttons = within(row as HTMLElement).getAllByRole('button');
        const normal = buttons[0]!;
        const disabled = buttons[1]!;
        const loading = buttons[2]!;
        await Promise.all(
          buttons.flatMap((button) =>
            button.getAnimations().map((animation) => animation.finished)
          )
        );
        await expect(disabled).toBeDisabled();
        await expect(loading).toHaveAttribute('aria-disabled', 'true');
        await expect(loading).toHaveAttribute('aria-busy', 'true');
        await expect(loading).toHaveAccessibleName('Save changes');
        await expect(getComputedStyle(disabled).color).toBe(reference.color);
        if (!['ghost', 'error', 'link'].includes(disabled.dataset.variant!)) {
          await expect(getComputedStyle(disabled).backgroundColor).toBe(
            reference.backgroundColor
          );
        }
        for (const property of [
          'color',
          'backgroundColor',
          'borderTopColor',
        ] as const) {
          await expect(getComputedStyle(loading)[property]).toBe(
            getComputedStyle(normal)[property]
          );
        }
        const spinner = loading.querySelector('[data-slot="spinner"]')!;
        await expect(spinner).toBeVisible();
        await expect(getComputedStyle(spinner).color).toBe(
          getComputedStyle(normal).color
        );
      }
    }
  },
};

export const LoadingPreservesIconWidth: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      {(
        [
          'xs',
          'sm',
          'default',
          'lg',
          'icon-xs',
          'icon-sm',
          'icon',
          'icon-lg',
        ] as const
      ).map((size) => (
        <div
          key={size}
          data-testid="loading-width-row"
          className="nx:flex nx:items-center nx:gap-2"
        >
          <Button
            size={size}
            aria-label="Launch"
            startIcon={size.startsWith('icon') ? undefined : <IconRocket />}
          >
            {size.startsWith('icon') ? <IconRocket /> : 'Launch'}
          </Button>
          <Button
            size={size}
            aria-label="Launch"
            loading
            startIcon={size.startsWith('icon') ? undefined : <IconRocket />}
          >
            {size.startsWith('icon') ? <IconRocket /> : 'Launch'}
          </Button>
        </div>
      ))}
      <div
        data-testid="loading-width-row"
        className="nx:flex nx:items-center nx:gap-2"
      >
        <Button endIcon={<IconArrowRight />}>Continue</Button>
        <Button endIcon={<IconArrowRight />} loading>
          Continue
        </Button>
      </div>
      <div
        data-testid="loading-width-row"
        className="nx:flex nx:items-center nx:gap-2"
      >
        <Button className="nx:gap-4" startIcon={<IconRocket />}>
          Launch
        </Button>
        <Button className="nx:gap-4" startIcon={<IconRocket />} loading>
          Launch
        </Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const row of within(canvasElement).getAllByTestId(
      'loading-width-row'
    )) {
      const [ready, loading] = within(row).getAllByRole('button');
      await expect(loading!.offsetWidth).toBe(ready!.offsetWidth);
      await expect(loading!.offsetHeight).toBe(ready!.offsetHeight);
      await expect(loading!).toHaveAttribute('aria-disabled', 'true');
      await expect(
        loading!.querySelector('[data-slot="spinner"]')
      ).toBeVisible();
    }
  },
};

export const SizeDensityContract: Story = {
  tags: ['!autodocs', '!dev'],
  parameters: {
    docs: {
      description: {
        story:
          'All six densities use the same text and icon mapping. Density changes button geometry only. Each row includes the matching icon-only and loading buttons.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      {(
        [
          'tight',
          'compact',
          'default',
          'comfortable',
          'relaxed',
          'spacious',
        ] as const
      ).map((density) => (
        <NexusRoot
          key={density}
          state={{ ...DEFAULT_NEXUS_APPEARANCE, mode: 'light', density }}
          className="nx:flex nx:flex-col nx:gap-2"
        >
          <span className="nx:typography-label-default">{density}</span>
          {(
            [
              ['xs', 'icon-xs', 12, 12],
              ['sm', 'icon-sm', 13, 14],
              ['default', 'icon', 14, 16],
              ['lg', 'icon-lg', 14, 16],
            ] as const
          ).map(([size, iconSize, font, icon]) => (
            <div
              key={size}
              data-testid="size-density-row"
              data-density={density}
              data-size={size}
              data-font={font}
              data-icon={icon}
              className="nx:flex nx:flex-wrap nx:items-center nx:gap-2"
            >
              <Button size={size} variant="outline" startIcon={<IconStar />}>
                {size}
              </Button>
              <Button
                size={iconSize}
                variant="outline"
                aria-label={`${size} star`}
              >
                <IconStar />
              </Button>
              <Button
                size={size}
                variant="outline"
                startIcon={<IconStar />}
                loading
              >
                {size}
              </Button>
            </div>
          ))}
        </NexusRoot>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const row of within(canvasElement).getAllByTestId(
      'size-density-row'
    )) {
      const densityIndex = [
        'tight',
        'compact',
        'default',
        'comfortable',
        'relaxed',
        'spacious',
      ].indexOf(row.dataset.density!);
      const defaultHeight = { xs: 28, sm: 32, default: 40, lg: 48 }[
        row.dataset.size as 'xs' | 'sm' | 'default' | 'lg'
      ];
      for (const button of row.querySelectorAll('button')) {
        await expect(Math.round(button.getBoundingClientRect().height)).toBe(
          defaultHeight + [-4, -2, 0, 2, 4, 6][densityIndex]!
        );
      }
      for (const svg of row.querySelectorAll('svg')) {
        await expect(parseFloat(getComputedStyle(svg).width)).toBe(
          Number(row.dataset.icon)
        );
        await expect(parseFloat(getComputedStyle(svg).height)).toBe(
          Number(row.dataset.icon)
        );
      }
      for (const button of row.querySelectorAll(
        'button:not([data-icon-only])'
      )) {
        await expect(getComputedStyle(button).fontSize).toBe(
          `${row.dataset.font}px`
        );
      }
    }
  },
};

export const AriaDisabledActivation: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    children: 'Unavailable action',
    'aria-disabled': true,
    onClick: fn(),
    onClickCapture: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    button.focus();
    await expect(button).toHaveFocus();
    await expect(button).not.toBeDisabled();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    button.click();
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(args.onClickCapture).not.toHaveBeenCalled();
  },
};

const loadingSubmit = fn((event: FormEvent) => event.preventDefault());

// Loading no longer sets native `disabled`, so the capture guard alone must stop
// implicit submission (Enter in a field clicks the form's default button).
export const LoadingBlocksFormSubmit: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <form onSubmit={loadingSubmit} className="nx:flex nx:gap-2">
      <input aria-label="Email" className="nx:border-default" />
      <Button type="submit" loading>
        Subscribe
      </Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    loadingSubmit.mockClear();
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'a@b.co{Enter}');
    canvas.getByRole('button', { name: 'Subscribe' }).click();
    await expect(loadingSubmit).not.toHaveBeenCalled();
  },
};

// Radix opens a menu on keydown, before any click, so only the keydown guard
// keeps an aria-disabled trigger closed.
export const AriaDisabledMenuTrigger: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-disabled>Export</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>CSV</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Export',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(
      within(document.body).queryByRole('menuitem', { name: 'CSV' })
    ).not.toBeInTheDocument();
  },
};

export const AsChildIgnoresLoading: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <Button asChild loading>
      <a href="#as-child-loading">Open docs</a>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Open docs' });
    await expect(link).not.toHaveAttribute('data-loading');
    await expect(link).not.toHaveAttribute('aria-busy');
    await expect(link).not.toHaveAttribute('aria-disabled');
    await expect(link).not.toHaveAttribute('tabindex');
  },
};

export const PrimaryHoverComparison: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Brand seeds are comparison inputs. Normal and Hover are pinned previews of the existing primary background tokens; Try hover remains interactive. No theme tokens are overridden.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-start nx:gap-4">
      {(['light', 'dark'] as const).map((mode) => (
        <div key={mode} className="nx:flex nx:flex-col nx:gap-2">
          {(
            [
              ['Black', '#000000'],
              ['Charcoal', '#171717'],
              ['Deep blue', '#0b1730'],
              ['Deep violet', '#200b30'],
              ['Blue', '#2563eb'],
              ['Violet', '#7c3aed'],
              ['Green', '#15803d'],
            ] as const
          ).map(([name, brandColor]) => (
            <NexusRoot
              key={name}
              state={{ ...DEFAULT_NEXUS_APPEARANCE, mode, brandColor }}
              className="nx:flex nx:flex-col nx:gap-3 nx:bg-background nx:p-4 nx:text-foreground"
            >
              <span className="nx:typography-label-default">
                {name} · {mode}
              </span>
              <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
                <Button className="nx:pointer-events-none" tabIndex={-1}>
                  Normal
                </Button>
                <Button
                  className="nx:pointer-events-none nx:bg-primary-background-hover"
                  tabIndex={-1}
                >
                  Hover
                </Button>
                <Button
                  className="nx:pointer-events-none nx:bg-primary-background-active"
                  tabIndex={-1}
                >
                  Pressed
                </Button>
                <ButtonGroup aria-label={`${name} ${mode} live hover`}>
                  <Button>Try hover</Button>
                  <Button>More</Button>
                </ButtonGroup>
              </div>
            </NexusRoot>
          ))}
        </div>
      ))}
    </div>
  ),
};
