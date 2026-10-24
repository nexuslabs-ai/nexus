import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { IconEye, IconMail, IconSearch, IconX } from '@tabler/icons-vue';
import { expect, fn, type Mock, userEvent, within } from 'storybook/test';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';
import { Spinner } from '../spinner';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '.';

// `click` falls through to the native element, so it is not a declared prop.
type InputGroupArgs = InstanceType<typeof InputGroup>['$props'] & {
  onClick?: Mock<(event: MouseEvent) => void>;
};

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  parameters: {
    docs: {
      description: {
        component:
          'InputGroup frames an input or textarea with icons, text, buttons or key hints in one field. Use it for search boxes, URL prefixes and inline actions. For a plain field, use Input.',
      },
    },
  },
} satisfies Meta<InputGroupArgs>;

export default meta;
type Story = StoryObj<InputGroupArgs>;

// A search field: a leading icon addon and the input.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { IconSearch, InputGroup, InputGroupAddon, InputGroupInput },
    template: `
      <InputGroup class="nx:w-80">
        <InputGroupAddon>
          <IconSearch aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search…" />
      </InputGroup>
    `,
  }),
};

// A trailing button addon.
export const WithButton: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: "Add a trailing button for an action on the field's value.",
      },
    },
  },
  render: () => ({
    components: {
      InputGroup,
      InputGroupAddon,
      InputGroupButton,
      InputGroupInput,
    },
    template: `
      <InputGroup class="nx:w-80">
        <InputGroupInput aria-label="Email" placeholder="you@example.com" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Subscribe</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
};

// A text prefix addon.
export const WithText: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Show a fixed text prefix, such as a URL scheme, before the input.',
      },
    },
  },
  render: () => ({
    components: {
      InputGroup,
      InputGroupAddon,
      InputGroupInput,
      InputGroupText,
    },
    template: `
      <InputGroup class="nx:w-80">
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Site URL" placeholder="nxds.dev" />
      </InputGroup>
    `,
  }),
};

// Addons at each alignment — inline start/end and stacked block start/end.
export const Alignments: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Place addons at the start, end, top or bottom of the field.',
      },
    },
  },
  render: () => ({
    components: {
      IconMail,
      IconX,
      InputGroup,
      InputGroupAddon,
      InputGroupButton,
      InputGroupInput,
      InputGroupText,
    },
    template: `
      <div class="nx:flex nx:w-80 nx:flex-col nx:gap-3">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <IconMail aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput aria-label="Email" placeholder="you@example.com" />
        </InputGroup>
        <InputGroup>
          <InputGroupInput aria-label="Search" placeholder="Search projects" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Clear">
              <IconX aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupAddon align="block-start">
            <InputGroupText>Bio</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput aria-label="Bio" placeholder="A few words about you" />
        </InputGroup>
        <InputGroup>
          <InputGroupInput
            aria-label="Status"
            placeholder="What are you working on?"
          />
          <InputGroupAddon align="block-end">
            <InputGroupText>0 / 200</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    `,
  }),
};

// The compact in-field button sizes.
export const ButtonSizes: Story = {
  render: () => ({
    components: {
      IconEye,
      IconX,
      InputGroup,
      InputGroupAddon,
      InputGroupButton,
      InputGroupInput,
    },
    template: `
      <div class="nx:flex nx:w-80 nx:flex-col nx:gap-3">
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
              <IconEye aria-hidden="true" />
            </InputGroupButton>
            <InputGroupButton size="icon-sm" aria-label="Clear">
              <IconX aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    `,
  }),
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: { story: 'Pair a textarea with a footer addon below it.' },
    },
  },
  render: () => ({
    components: {
      InputGroup,
      InputGroupAddon,
      InputGroupText,
      InputGroupTextarea,
    },
    template: `
      <InputGroup class="nx:w-80">
        <InputGroupTextarea aria-label="Message" placeholder="Your message…" />
        <InputGroupAddon align="block-end">
          <InputGroupText>Markdown supported</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole('textbox', {
      name: 'Message',
    });
    await expectAutofillPaired(textarea);
  },
};

// The group is a role=group field; control, addon, text, and button carry
// data-slot hooks, and the control mirrors Input's data-size.
export const WithDataAttributes: Story = {
  render: () => ({
    components: {
      InputGroup,
      InputGroupAddon,
      InputGroupButton,
      InputGroupInput,
      InputGroupText,
    },
    template: `
      <InputGroup class="nx:w-80">
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Site URL" placeholder="nxds.dev" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Clear">Clear</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
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
  render: (args) => ({
    components: {
      InputGroup,
      InputGroupAddon,
      InputGroupButton,
      InputGroupInput,
    },
    setup: () => ({ args }),
    template: `
      <InputGroup class="nx:w-80" @click="args.onClick">
        <InputGroupInput aria-label="Email" placeholder="you@example.com" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Subscribe</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

// Typing into the control updates its value.
export const KeyboardInteraction: Story = {
  render: () => ({
    components: { IconSearch, InputGroup, InputGroupAddon, InputGroupInput },
    template: `
      <InputGroup class="nx:w-80">
        <InputGroupAddon>
          <IconSearch aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search…" />
      </InputGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Search' });
    await userEvent.type(input, 'nxds');
    await expect(input).toHaveValue('nxds');
  },
};

// A disabled control + button; the group dims its addons via data-disabled.
export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `data-disabled="true"` on the group to dim its addons along with the disabled control.',
      },
    },
  },
  render: () => ({
    components: {
      InputGroup,
      InputGroupAddon,
      InputGroupButton,
      InputGroupInput,
    },
    template: `
      <InputGroup class="nx:w-80" data-disabled="true">
        <InputGroupInput
          aria-label="Email"
          placeholder="you@example.com"
          disabled
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton disabled>Subscribe</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(input).toBeDisabled();
    await expect(window.getComputedStyle(input).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)'
    );
    await expectAutofillPaired(input);
    await expect(
      canvas.getByRole('button', { name: 'Subscribe' })
    ).toBeDisabled();
  },
};

export const BorderlessStates: Story = {
  render: () => ({
    components: { IconSearch, InputGroup, InputGroupAddon, InputGroupInput },
    template: `
      <div class="nx:flex nx:w-80 nx:flex-col nx:gap-3">
        <InputGroup data-testid="ig-borderless-empty" variant="borderless">
          <InputGroupAddon>
            <IconSearch aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput aria-label="Borderless search" placeholder="Search…" />
        </InputGroup>
        <InputGroup data-testid="ig-borderless-filled" variant="borderless">
          <InputGroupInput aria-label="Filled borderless URL" default-value="nxds.dev" />
        </InputGroup>
        <InputGroup data-testid="ig-borderless-readonly" variant="borderless">
          <InputGroupInput
            aria-label="Read-only borderless URL"
            default-value="nxds.dev"
            readonly
          />
        </InputGroup>
        <InputGroup data-testid="ig-borderless-invalid" variant="borderless">
          <InputGroupInput
            aria-label="Invalid borderless email"
            default-value="jane@"
            aria-invalid="true"
          />
        </InputGroup>
        <InputGroup
          data-testid="ig-borderless-disabled"
          variant="borderless"
          data-disabled="true"
        >
          <InputGroupInput
            aria-label="Disabled borderless email"
            default-value="jane@example.com"
            disabled
          />
        </InputGroup>
      </div>
    `,
  }),
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
      'nx:has-[[data-slot][aria-invalid=true]]:border-error-border'
    );
    const invalidStyles = window.getComputedStyle(invalid);
    await expect(
      Number.parseFloat(invalidStyles.borderTopWidth)
    ).toBeGreaterThan(0);
    await expect(invalidStyles.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(invalidStyles.boxShadow).toBe('none');

    const disabledInput = canvas.getByRole('textbox', {
      name: 'Disabled borderless email',
    });
    await expect(disabledInput).toBeDisabled();
    await expect(window.getComputedStyle(disabledInput).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)'
    );
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
          'Compose every field state from InputGroup parts, with no `aria-invalid` on warning and a Spinner addon for loading.',
      },
    },
  },
  render: () => ({
    components: {
      InputGroup,
      InputGroupAddon,
      InputGroupInput,
      InputGroupText,
      Spinner,
    },
    template: `
      <div class="nx:flex nx:w-[420px] nx:flex-col nx:gap-4">
        <div class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">Default</span>
          <InputGroup>
            <InputGroupInput aria-label="Default email" placeholder="jane@example.com" />
          </InputGroup>
        </div>
        <div class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">Read-only</span>
          <InputGroup>
            <InputGroupInput
              aria-label="Read-only email"
              aria-describedby="state-readonly-message"
              default-value="jane@example.com"
              readonly
            />
            <InputGroupAddon align="block-end">
              <InputGroupText id="state-readonly-message">
                Submitted value; selectable, focusable, and not editable here.
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">Disabled</span>
          <InputGroup data-disabled="true">
            <InputGroupInput
              aria-label="Disabled email"
              default-value="jane@example.com"
              disabled
            />
          </InputGroup>
        </div>
        <div class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">Warning</span>
          <InputGroup class="nx:border-warning-border">
            <InputGroupInput
              aria-label="Warning email"
              aria-describedby="state-warning-message"
              default-value="jane@contractor.example"
            />
            <InputGroupAddon align="block-end">
              <InputGroupText
                id="state-warning-message"
                class="nx:text-warning-subtle-foreground"
              >
                External domain. You can continue after review.
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">Error</span>
          <InputGroup>
            <InputGroupInput
              aria-label="Invalid email"
              aria-errormessage="state-error-message"
              aria-invalid="true"
              default-value="jane@"
            />
            <InputGroupAddon align="block-end">
              <InputGroupText
                id="state-error-message"
                role="alert"
                class="nx:text-error-subtle-foreground"
              >
                Enter a complete email address.
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div class="nx:grid nx:gap-1.5">
          <span class="nx:typography-label-default nx:text-foreground">Loading</span>
          <InputGroup data-testid="state-loading-group" aria-busy="true">
            <InputGroupInput
              aria-label="Loading username"
              aria-describedby="state-loading-message"
              default-value="janedoe"
            />
            <InputGroupAddon align="inline-end">
              <Spinner aria-label="Checking username" class="nx:text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupAddon align="block-end">
              <InputGroupText id="state-loading-message">Checking availability...</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    `,
  }),
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

// The three sizes — sm / default (implicit) / lg — match standalone Input.
export const Sizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Match the height of a standalone Input at each control size.',
      },
    },
  },
  render: () => ({
    components: { IconSearch, InputGroup, InputGroupAddon, InputGroupInput },
    template: `
      <div class="nx:flex nx:w-80 nx:flex-col nx:gap-3">
        <InputGroup>
          <InputGroupAddon>
            <IconSearch aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput size="sm" aria-label="Search, small" placeholder="Search" />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <IconSearch aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput aria-label="Search, default" placeholder="Search" />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <IconSearch aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput size="lg" aria-label="Search, large" placeholder="Search" />
        </InputGroup>
      </div>
    `,
  }),
};

// A trailing kbd hint pulls toward the field edge by the canonical −1.5 step.
export const WithKbd: Story = {
  render: () => ({
    components: { InputGroup, InputGroupAddon, InputGroupInput },
    template: `
      <InputGroup class="nx:w-80">
        <InputGroupInput aria-label="Search" placeholder="Search…" />
        <InputGroupAddon align="inline-end" data-testid="ig-kbd-addon">
          <kbd>⌘K</kbd>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
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
// textarea with a footer addon.
export const AllVariants: Story = {
  render: () => ({
    components: {
      IconSearch,
      IconX,
      InputGroup,
      InputGroupAddon,
      InputGroupButton,
      InputGroupInput,
      InputGroupText,
      InputGroupTextarea,
    },
    template: `
      <div class="nx:flex nx:w-80 nx:flex-col nx:gap-3">
        <InputGroup>
          <InputGroupAddon>
            <IconSearch aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput aria-label="Search" placeholder="Search…" />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput aria-label="URL" placeholder="nxds.dev" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Clear">
              <IconX aria-hidden="true" />
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
            <IconSearch aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput aria-label="Borderless search" placeholder="Borderless search…" />
        </InputGroup>
      </div>
    `,
  }),
};
