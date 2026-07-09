import type { Meta, StoryObj } from '@storybook/react';
import { IconEye, IconMail, IconSearch, IconX } from '@tabler/icons-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Spinner } from '../spinner';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group';

const meta: Meta<typeof InputGroup> = {
  title: 'Components/InputGroup',
  component: InputGroup,
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

// A search field: a leading icon addon and the input.
export const Default: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupAddon>
        <IconSearch aria-hidden />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" placeholder="Search…" />
    </InputGroup>
  ),
};

// A trailing button addon.
export const WithButton: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupInput aria-label="Email" placeholder="you@example.com" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Subscribe</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

// A text prefix addon.
export const WithText: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Site URL" placeholder="nexus.dev" />
    </InputGroup>
  ),
};

// Addons at each alignment — inline start/end and stacked block start/end.
export const Alignments: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <IconMail aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Inline start" placeholder="inline-start" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Inline end" placeholder="inline-end" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear">
            <IconX aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Bio</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Bio" placeholder="block-start" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="With counter" placeholder="block-end" />
        <InputGroupAddon align="block-end">
          <InputGroupText>0 / 200</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

// The compact in-field button sizes.
export const ButtonSizes: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup>
        <InputGroupInput aria-label="Text buttons" placeholder="xs / sm" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="xs">xs</InputGroupButton>
          <InputGroupButton size="sm">sm</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Icon buttons" placeholder="icon sizes" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Show">
            <IconEye aria-hidden />
          </InputGroupButton>
          <InputGroupButton size="icon-sm" aria-label="Clear">
            <IconX aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');

    await document.fonts.ready;
    buttons.forEach((button) => {
      expect(getComputedStyle(button).paddingTop).toBe('0px');
      expect(getComputedStyle(button).paddingBottom).toBe('0px');
    });
  },
};

// A textarea with a stacked footer addon.
export const WithTextarea: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupTextarea aria-label="Message" placeholder="Your message…" />
      <InputGroupAddon align="block-end">
        <InputGroupText>Markdown supported</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const FocusBorderOwnership: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup data-testid="ig-focus-with-button">
        <InputGroupInput aria-label="Email" placeholder="you@example.com" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Subscribe</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-testid="ig-focus-block-start">
        <InputGroupAddon align="block-start">
          <InputGroupText>Bio</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Bio" placeholder="block-start" />
      </InputGroup>
      <InputGroup data-testid="ig-focus-textarea">
        <InputGroupTextarea aria-label="Message" placeholder="Your message…" />
        <InputGroupAddon align="block-end">
          <InputGroupText>Markdown supported</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    async function focusAsKeyboard(element: HTMLElement) {
      element.focus({ focusVisible: true } as FocusOptions);
      await new Promise((resolve) => {
        requestAnimationFrame(() => setTimeout(resolve, 300));
      });
    }

    async function expectGroupOwnsFocusBorder(
      testId: string,
      controlName: string
    ) {
      const group = canvas.getByTestId(testId);
      const control = canvas.getByRole('textbox', { name: controlName });

      await focusAsKeyboard(control);

      const groupStyles = getComputedStyle(group);
      const controlStyles = getComputedStyle(control);

      await expect(groupStyles.borderTopWidth).toBe('0px');
      await expect(groupStyles.borderTopColor).toBe('rgba(0, 0, 0, 0)');
      await expect(groupStyles.boxShadow).not.toBe('none');
      await expect(groupStyles.boxShadow).toContain('inset');
      await expect(controlStyles.borderTopWidth).toBe('0px');
      await expect(controlStyles.boxShadow).toBe('none');
    }

    await expectGroupOwnsFocusBorder('ig-focus-with-button', 'Email');
    const subscribeButton = canvas.getByRole('button', { name: 'Subscribe' });
    await expect(document.activeElement).not.toBe(subscribeButton);
    await expect(subscribeButton.matches(':focus-visible')).toBe(false);
    await expectGroupOwnsFocusBorder('ig-focus-block-start', 'Bio');
    await expectGroupOwnsFocusBorder('ig-focus-textarea', 'Message');
  },
};

// The group is a role=group field; control, addon, text, and button carry
// data-slot hooks, and the control mirrors Input's data-size.
export const WithDataAttributes: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Site URL" placeholder="nexus.dev" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton aria-label="Clear">Clear</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="input-group"]');
    await expect(group).toBeInTheDocument();
    await expect(group).toHaveAttribute('role', 'group');
    await expect(group).toHaveAttribute('data-variant', 'bordered');
    await expect(group).toHaveClass('nx:bg-container');
    await expect(group).toHaveClass(
      'nx:not-data-[disabled=true]:hover:bg-container-hover'
    );
    await expect(
      canvasElement.querySelector('[data-slot="input-group-addon"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="input-group-text"]')
    ).toBeInTheDocument();

    const control = canvasElement.querySelector(
      '[data-slot="input-group-control"]'
    );
    await expect(control).toBeInTheDocument();
    await expect(control).toHaveAttribute('data-size', 'default');

    const button = canvasElement.querySelector(
      '[data-slot="input-group-button"]'
    );
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('data-size', 'xs');
  },
};

// Clicking an in-field button fires its handler (event bubbles to the group).
export const ClickInteraction: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <InputGroup className="nx:w-80" onClick={args.onClick}>
      <InputGroupInput aria-label="Email" placeholder="you@example.com" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Subscribe</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

// Typing into the control updates its value.
export const KeyboardInteraction: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupAddon>
        <IconSearch aria-hidden />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" placeholder="Search…" />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Search' });
    await userEvent.type(input, 'nexus');
    await expect(input).toHaveValue('nexus');
  },
};

// A disabled control + button; the group dims its addons via data-disabled.
export const Disabled: Story = {
  render: () => (
    <InputGroup className="nx:w-80" data-disabled="true">
      <InputGroupInput
        aria-label="Email"
        placeholder="you@example.com"
        disabled
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton disabled>Subscribe</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Subscribe' })
    ).toBeDisabled();
  },
};

export const BorderlessStates: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup data-testid="ig-borderless-empty" variant="borderless">
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Borderless search" placeholder="Search…" />
      </InputGroup>
      <InputGroup data-testid="ig-borderless-filled" variant="borderless">
        <InputGroupInput
          aria-label="Filled borderless URL"
          defaultValue="nexus.dev"
        />
      </InputGroup>
      <InputGroup data-testid="ig-borderless-readonly" variant="borderless">
        <InputGroupInput
          aria-label="Read-only borderless URL"
          defaultValue="nexus.dev"
          readOnly
        />
      </InputGroup>
      <InputGroup data-testid="ig-borderless-invalid" variant="borderless">
        <InputGroupInput
          aria-label="Invalid borderless email"
          defaultValue="jane@"
          aria-invalid
        />
      </InputGroup>
      <InputGroup
        data-testid="ig-borderless-disabled"
        variant="borderless"
        data-disabled="true"
      >
        <InputGroupInput
          aria-label="Disabled borderless email"
          defaultValue="jane@example.com"
          disabled
        />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const empty = canvas.getByTestId('ig-borderless-empty');
    const readOnly = canvas.getByRole('textbox', {
      name: 'Read-only borderless URL',
    });
    const invalid = canvas.getByTestId('ig-borderless-invalid');
    const disabled = canvas.getByTestId('ig-borderless-disabled');

    await expect(empty).toHaveAttribute('data-variant', 'borderless');
    await expect(empty).toHaveClass('nx:border-transparent');
    await expect(empty).toHaveClass('nx:bg-control-background');
    await expect(empty).toHaveClass(
      'nx:not-data-[disabled=true]:hover:bg-control-background-hover'
    );

    await expect(readOnly).toHaveAttribute('readonly');
    await expect(readOnly).not.toBeDisabled();

    await expect(
      canvas.getByRole('textbox', { name: 'Invalid borderless email' })
    ).toHaveAttribute('aria-invalid', 'true');
    await expect(invalid).toHaveClass(
      'nx:has-[[data-slot][aria-invalid=true]]:border-border-error'
    );
    await expect(window.getComputedStyle(invalid).borderTopWidth).toBe('0px');
    await expect(window.getComputedStyle(invalid).boxShadow).not.toBe('none');

    await expect(
      canvas.getByRole('textbox', { name: 'Disabled borderless email' })
    ).toBeDisabled();
    await expect(disabled).toHaveClass('nx:data-[disabled=true]:bg-disabled');
    await expect(disabled).not.toHaveClass(
      'nx:data-[disabled=true]:border-border-disabled'
    );
  },
};

export const StateMatrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Form-field state guidance using current APIs only. Default, read-only, disabled, error, warning, and loading are composed in stories; warning remains advisory and does not use `aria-invalid`, while loading uses InputGroup plus Spinner rather than adding a loading prop.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:w-[420px] nx:flex-col nx:gap-4">
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Default
        </span>
        <InputGroup>
          <InputGroupInput
            aria-label="Default email"
            placeholder="jane@example.com"
          />
        </InputGroup>
      </div>
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Read-only
        </span>
        <InputGroup>
          <InputGroupInput
            aria-label="Read-only email"
            aria-describedby="state-readonly-message"
            defaultValue="jane@example.com"
            readOnly
          />
          <InputGroupAddon align="block-end">
            <InputGroupText id="state-readonly-message">
              Submitted value; selectable, focusable, and not editable here.
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Disabled
        </span>
        <InputGroup data-disabled="true">
          <InputGroupInput
            aria-label="Disabled email"
            defaultValue="jane@example.com"
            disabled
          />
        </InputGroup>
      </div>
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Warning
        </span>
        <InputGroup className="nx:border-border-warning">
          <InputGroupInput
            aria-label="Warning email"
            aria-describedby="state-warning-message"
            defaultValue="jane@contractor.example"
          />
          <InputGroupAddon align="block-end">
            <InputGroupText
              id="state-warning-message"
              className="nx:text-warning-subtle-foreground"
            >
              External domain. You can continue after review.
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Error
        </span>
        <InputGroup>
          <InputGroupInput
            aria-label="Invalid email"
            aria-errormessage="state-error-message"
            aria-invalid
            defaultValue="jane@"
          />
          <InputGroupAddon align="block-end">
            <InputGroupText
              id="state-error-message"
              role="alert"
              className="nx:text-error-subtle-foreground"
            >
              Enter a complete email address.
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Loading
        </span>
        <InputGroup data-testid="state-loading-group" aria-busy="true">
          <InputGroupInput
            aria-label="Loading username"
            aria-describedby="state-loading-message"
            defaultValue="janedoe"
          />
          <InputGroupAddon align="inline-end">
            <Spinner
              aria-label="Checking username"
              className="nx:text-muted-foreground"
            />
          </InputGroupAddon>
          <InputGroupAddon align="block-end">
            <InputGroupText id="state-loading-message">
              Checking availability...
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const readOnly = canvas.getByRole('textbox', { name: 'Read-only email' });
    const disabled = canvas.getByRole('textbox', { name: 'Disabled email' });
    const warning = canvas.getByRole('textbox', { name: 'Warning email' });
    const error = canvas.getByRole('textbox', { name: 'Invalid email' });

    await expect(readOnly).toHaveAttribute('readonly');
    await expect(readOnly).not.toBeDisabled();
    await expect(disabled).toBeDisabled();
    await expect(warning).not.toHaveAttribute('aria-invalid');
    await expect(warning).toHaveAttribute(
      'aria-describedby',
      'state-warning-message'
    );
    await expect(error).toHaveAttribute('aria-invalid', 'true');
    await expect(error).toHaveAttribute(
      'aria-errormessage',
      'state-error-message'
    );
    await expect(canvas.getByTestId('state-loading-group')).toHaveAttribute(
      'aria-busy',
      'true'
    );
    await expect(
      canvas.getByRole('status', { name: 'Checking username' })
    ).toBeInTheDocument();
  },
};

export const BorderlessHoverSurface: Story = {
  render: () => (
    <InputGroup
      data-testid="ig-borderless-hover"
      variant="borderless"
      className="nx:w-80"
    >
      <InputGroupAddon>
        <IconSearch aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        data-testid="ig-borderless-hover-input"
        aria-label="Search"
        placeholder="Search…"
      />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByTestId('ig-borderless-hover');
    const input = canvas.getByTestId('ig-borderless-hover-input');

    await expect(group).toHaveClass('nx:bg-control-background');
    await expect(group).toHaveClass(
      'nx:not-data-[disabled=true]:hover:bg-control-background-hover'
    );
    await expect(input).toHaveClass('nx:enabled:hover:bg-transparent');
  },
};

// The three sizes — sm / default (implicit) / lg — match standalone Input.
export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup>
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput size="sm" aria-label="Small" placeholder="sm" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Default"
          placeholder="default (implicit)"
        />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput size="lg" aria-label="Large" placeholder="lg" />
      </InputGroup>
    </div>
  ),
};

// Hover + disabled map to Input's semantic state tokens — no opacity dimming.
export const VisualStateTokens: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup data-testid="ig-hover">
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Hover surface" placeholder="hover" />
      </InputGroup>
      <InputGroup data-testid="ig-disabled" data-disabled="true">
        <InputGroupAddon data-testid="ig-disabled-addon">
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupText data-testid="ig-disabled-text">USD</InputGroupText>
        <InputGroupInput
          aria-label="Disabled"
          placeholder="disabled"
          disabled
        />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hover = canvas.getByTestId('ig-hover');
    const disabled = canvas.getByTestId('ig-disabled');
    const addon = canvas.getByTestId('ig-disabled-addon');
    const text = canvas.getByTestId('ig-disabled-text');

    // Token-name sentinel: synthetic userEvent can't toggle CSS :hover.
    await expect(hover).toHaveClass(
      'nx:not-data-[disabled=true]:hover:bg-container-hover'
    );

    // Disabled = semantic tokens, not opacity (opacity stays 1). No computed
    // bg check: bg-disabled / background / -hover collapse in dark mode.
    await expect(disabled).toHaveClass('nx:data-[disabled=true]:bg-disabled');
    await expect(disabled).toHaveClass(
      'nx:data-[disabled=true]:border-border-disabled'
    );
    await expect(window.getComputedStyle(addon).opacity).toBe('1');
    await expect(addon).toHaveClass(
      'nx:group-data-[disabled=true]/input-group:text-disabled-foreground'
    );
    await expect(text).toHaveClass(
      'nx:group-data-[disabled=true]/input-group:text-disabled-foreground'
    );
  },
};

// An invalid control reddens the group border (always-on, focus-independent).
export const Invalid: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup data-testid="ig-valid">
        <InputGroupAddon>
          <IconMail aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Valid email" placeholder="valid" />
      </InputGroup>
      <InputGroup data-testid="ig-invalid">
        <InputGroupAddon>
          <IconMail aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Invalid email"
          placeholder="invalid"
          aria-invalid
        />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('textbox', { name: 'Invalid email' })
    ).toHaveAttribute('aria-invalid', 'true');

    // Error boundary fires: the invalid group's visual stroke differs from valid.
    const valid = canvas.getByTestId('ig-valid');
    const invalid = canvas.getByTestId('ig-invalid');
    await expect(window.getComputedStyle(invalid).boxShadow).not.toBe(
      window.getComputedStyle(valid).boxShadow
    );
  },
};

// A trailing kbd hint pulls toward the field edge by the canonical −1.5 step.
export const WithKbd: Story = {
  render: () => (
    <InputGroup className="nx:w-80">
      <InputGroupInput aria-label="Search" placeholder="Search…" />
      <InputGroupAddon align="inline-end" data-testid="ig-kbd-addon">
        <kbd>⌘K</kbd>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // has-[>kbd]:-mr-1.5 → −6px (spacing-1.5 is mode-invariant).
    await expect(
      window.getComputedStyle(canvas.getByTestId('ig-kbd-addon')).marginRight
    ).toBe('-6px');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Icon-prefixed search, a text prefix with a trailing clear button, and a
// textarea with a footer addon. Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <InputGroup>
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search…" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="URL" placeholder="nexus.dev" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear">
            <IconX aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea aria-label="Message" placeholder="Your message…" />
        <InputGroupAddon align="block-end">
          <InputGroupText>0 / 200</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup variant="borderless">
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Borderless search"
          placeholder="Borderless search…"
        />
      </InputGroup>
    </div>
  ),
};
