import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Checkbox } from '../checkbox';
import { Input } from '../input';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldRequiredIndicator,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '.';

const meta = {
  title: 'Components/Field',
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          'Field lays out a label, control, description and error as one form field. Use it for any labeled form control. For a group of related fields, wrap them in FieldSet or FieldGroup.',
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

// A label + control + helper text — the canonical vertical field.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Field, FieldDescription, FieldLabel, Input },
    template: `
      <div class="nx:w-80">
        <Field>
          <FieldLabel for="field-email">Email</FieldLabel>
          <Input id="field-email" type="email" placeholder="you@example.com" />
          <FieldDescription>We never share it.</FieldDescription>
        </Field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Email');
    const input = canvas.getByLabelText('Email');
    const labelToInputGap = Math.round(
      input.getBoundingClientRect().top - label.getBoundingClientRect().bottom
    );

    // 8px is the Field label→control gap (gap-2).
    await expect(labelToInputGap).toBe(8);
  },
};

// The three orientations: vertical, horizontal, and container-responsive.
export const Orientations: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          "Set `orientation` to `vertical`, `horizontal` or `responsive`, which follows the FieldGroup's width.",
      },
    },
  },
  render: () => ({
    components: {
      Checkbox,
      Field,
      FieldContent,
      FieldDescription,
      FieldGroup,
      FieldLabel,
      Input,
    },
    template: `
      <FieldGroup class="nx:w-80">
        <Field orientation="vertical">
          <FieldLabel for="field-o-name">Name</FieldLabel>
          <Input id="field-o-name" placeholder="Ada Lovelace" />
        </Field>
        <Field orientation="horizontal">
          <FieldLabel for="field-o-newsletter">Newsletter</FieldLabel>
          <Checkbox id="field-o-newsletter" />
        </Field>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel for="field-o-bio">Bio</FieldLabel>
            <FieldDescription>Shown on your public profile.</FieldDescription>
          </FieldContent>
          <Input id="field-o-bio" placeholder="A short bio" />
        </Field>
      </FieldGroup>
    `,
  }),
};

// Both legend emphases: the larger fieldset `legend` and the label-sized one.
export const LegendVariants: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Caption a FieldSet with a FieldLegend in the `legend` or smaller `label` size.',
      },
    },
  },
  render: () => ({
    components: {
      Checkbox,
      Field,
      FieldDescription,
      FieldLabel,
      FieldLegend,
      FieldSet,
    },
    template: `
      <div class="nx:flex nx:w-80 nx:flex-col nx:gap-6">
        <FieldSet>
          <FieldLegend variant="legend">Notifications</FieldLegend>
          <FieldDescription>How should we reach you?</FieldDescription>
          <Field orientation="horizontal">
            <FieldLabel for="field-l-email">Email</FieldLabel>
            <Checkbox id="field-l-email" :default-value="true" />
          </Field>
        </FieldSet>
        <FieldSet>
          <FieldLegend variant="label">Smaller caption</FieldLegend>
          <Field orientation="horizontal">
            <FieldLabel for="field-l-sms">SMS</FieldLabel>
            <Checkbox id="field-l-sms" />
          </Field>
        </FieldSet>
      </div>
    `,
  }),
};

// An invalid field with an error message wired via the errors prop.
export const WithError: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `data-invalid` on the Field and `aria-invalid` on the control, then link the FieldError with `aria-errormessage`.',
      },
    },
  },
  render: () => ({
    components: { Field, FieldDescription, FieldError, FieldLabel, Input },
    template: `
      <div class="nx:w-80">
        <Field data-invalid="true">
          <FieldLabel for="field-err">Password</FieldLabel>
          <Input
            id="field-err"
            type="password"
            aria-describedby="field-err-help"
            aria-errormessage="field-err-message"
            aria-invalid="true"
          />
          <FieldDescription id="field-err-help">Use a memorable passphrase.</FieldDescription>
          <FieldError
            id="field-err-message"
            :errors="[{ message: 'Must be at least 8 characters.' }]"
          />
        </Field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Password');
    const error = canvas.getByText('Must be at least 8 characters.');

    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAttribute('aria-describedby', 'field-err-help');
    await expect(input).toHaveAttribute(
      'aria-errormessage',
      error.getAttribute('id')
    );
    await expect(error).toHaveAttribute('role', 'alert');
    await expect(error).toHaveAttribute('aria-atomic', 'true');
  },
};

// Multiple errors render as a deduplicated list and ignore empty messages.
export const MultipleErrors: Story = {
  render: () => ({
    components: { Field, FieldError, FieldLabel, Input },
    template: `
      <div class="nx:w-80">
        <Field data-invalid="true">
          <FieldLabel for="field-errors">Password</FieldLabel>
          <Input id="field-errors" type="password" aria-invalid="true" />
          <FieldError
            :errors="[
              { message: 'Must include a symbol.' },
              { message: 'Must include a symbol.' },
              { message: 'Must include a number.' },
              { message: '' },
            ]"
          />
        </Field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const error = canvas.getByRole('alert');
    const items = canvas.getAllByRole('listitem');

    await expect(error).toHaveAttribute('aria-atomic', 'true');
    await expect(items).toHaveLength(2);
    await expect(items[0]).toHaveTextContent('Must include a symbol.');
    await expect(items[1]).toHaveTextContent('Must include a number.');
  },
};

// A divider between groups of fields, with centered content.
export const WithSeparator: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Split alternative fields with a FieldSeparator that shows centered text.',
      },
    },
  },
  render: () => ({
    components: { Field, FieldGroup, FieldLabel, FieldSeparator, Input },
    template: `
      <div class="nx:w-80 nx:rounded-lg nx:border nx:border-border-default nx:bg-container nx:p-6">
        <FieldGroup>
          <Field>
            <FieldLabel for="field-sep-email">Email</FieldLabel>
            <Input id="field-sep-email" type="email" />
          </Field>
          <FieldSeparator>OR</FieldSeparator>
          <Field>
            <FieldLabel for="field-sep-phone">Phone</FieldLabel>
            <Input id="field-sep-phone" type="tel" />
          </Field>
        </FieldGroup>
      </div>
    `,
  }),
};

export const RequiredAndOptionalIndicators: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Mark a required field with FieldRequiredIndicator, or an optional one with its `#fallback` text.',
      },
    },
  },
  render: () => ({
    components: {
      Field,
      FieldGroup,
      FieldLabel,
      FieldRequiredIndicator,
      Input,
    },
    template: `
      <FieldGroup class="nx:w-80">
        <Field>
          <FieldLabel for="field-required-email">Work email <FieldRequiredIndicator /></FieldLabel>
          <Input id="field-required-email" type="email" required />
        </Field>
        <Field>
          <FieldLabel for="field-optional-po">Purchase order
            <FieldRequiredIndicator>
              Required
              <template #fallback>Optional</template>
            </FieldRequiredIndicator>
          </FieldLabel>
          <Input id="field-optional-po" />
        </Field>
      </FieldGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const requiredInput = canvas.getByRole('textbox', { name: 'Work email' });
    const optionalInput = canvas.getByRole('textbox', {
      name: 'Purchase order Optional',
    });
    const indicators = Array.from(
      canvasElement.querySelectorAll<HTMLElement>(
        '[data-slot="field-required-indicator"]'
      )
    );
    const [requiredIndicator, optionalIndicator] = indicators;

    await expect(requiredInput).toHaveAttribute('required');
    await expect(optionalInput).not.toHaveAttribute('required');
    await expect(indicators).toHaveLength(2);

    await expect(requiredIndicator).toHaveTextContent('*');
    await expect(requiredIndicator).toHaveAttribute('aria-hidden', 'true');
    await expect(requiredIndicator).not.toHaveAttribute('data-optional');

    await expect(optionalIndicator).toHaveTextContent('Optional');
    await expect(optionalIndicator).toHaveAttribute('data-optional', 'true');
    await expect(optionalIndicator).not.toHaveAttribute('aria-hidden');
    await expect(optionalIndicator).toHaveClass(
      'nx:data-[optional=true]:typography-body-default'
    );
  },
};

// Lower-level field composition: ChoiceCard is the preferred rich checkbox/radio
// option-card API, while FieldLabel + Field remains available when a field needs
// custom structure.
export const LowerLevelCheckboxCard: Story = {
  render: () => ({
    components: {
      Checkbox,
      Field,
      FieldContent,
      FieldDescription,
      FieldLabel,
      FieldTitle,
    },
    template: `
      <div class="nx:w-80">
        <FieldLabel for="field-card">
          <Field orientation="horizontal">
            <Checkbox
              id="field-card"
              :default-value="true"
              aria-labelledby="field-card-title"
            />
            <FieldContent>
              <FieldTitle id="field-card-title">Enable two-factor auth</FieldTitle>
              <FieldDescription>Add an extra layer of security to your account.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
      </div>
    `,
  }),
};

// The group is role=group; parts carry data-slot hooks; orientation is reflected.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { Field, FieldDescription, FieldLabel, Input },
    template: `
      <div class="nx:w-80">
        <Field>
          <FieldLabel for="field-da">Username</FieldLabel>
          <Input id="field-da" />
          <FieldDescription>Your public handle.</FieldDescription>
        </Field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('group');
    await expect(field).toHaveAttribute('data-slot', 'field');
    await expect(field).toHaveAttribute('data-orientation', 'vertical');
    await expect(
      canvasElement.querySelector('[data-slot="field-label"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="field-description"]')
    ).toBeInTheDocument();
  },
};

// Clicking a FieldLabel toggles its associated control (label `for` wiring).
export const ClickInteraction: Story = {
  render: () => ({
    components: { Checkbox, Field, FieldLabel },
    template: `
      <div class="nx:w-80">
        <Field orientation="horizontal">
          <Checkbox id="field-click" />
          <FieldLabel for="field-click">Accept the terms</FieldLabel>
        </Field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The control's accessible name resolves through the label's `for`, so
    // this query both proves the wiring and gives a stable click target.
    const checkbox = canvas.getByRole('checkbox', { name: 'Accept the terms' });
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
  },
};

// The control inside a field is keyboard-reachable via Tab.
export const KeyboardInteraction: Story = {
  render: () => ({
    components: { Field, FieldLabel, Input },
    template: `
      <div class="nx:w-80">
        <Field>
          <FieldLabel for="field-kbd">Email</FieldLabel>
          <Input id="field-kbd" type="email" />
        </Field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.tab();
    await expect(input).toHaveFocus();
  },
};

// A disabled field: data-disabled dims the label and the control is disabled.
export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `data-disabled` on the Field and `disabled` on the control to dim the label.',
      },
    },
  },
  render: () => ({
    components: { Field, FieldDescription, FieldLabel, Input },
    template: `
      <div class="nx:w-80">
        <Field data-disabled="true">
          <FieldLabel for="field-disabled">Email</FieldLabel>
          <Input id="field-disabled" type="email" disabled />
          <FieldDescription>This field is locked.</FieldDescription>
        </Field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toBeDisabled();

    // The FieldLabel dims via the field group's data-disabled, using a semantic
    // text token at full opacity (not a fade).
    const fieldLabel = canvasElement.querySelector<HTMLElement>(
      '[data-slot="field-label"]'
    )!;
    await expect(fieldLabel).toHaveClass(
      'nx:group-data-[disabled=true]/field:text-disabled-foreground'
    );
    await expect(getComputedStyle(fieldLabel).opacity).toBe('1');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// A fieldset with a legend, two fields, a description, and an error.
export const AllVariants: Story = {
  render: () => ({
    components: {
      Field,
      FieldDescription,
      FieldError,
      FieldLabel,
      FieldLegend,
      FieldSeparator,
      FieldSet,
      Input,
    },
    template: `
      <div class="nx:w-80 nx:rounded-lg nx:border nx:border-border-default nx:bg-container nx:p-6">
        <FieldSet>
          <FieldLegend variant="legend">Account</FieldLegend>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" aria-label="Email" placeholder="you@example.com" />
            <FieldDescription>We never share it.</FieldDescription>
          </Field>
          <FieldSeparator>OR</FieldSeparator>
          <Field data-invalid="true">
            <FieldLabel>Username</FieldLabel>
            <Input aria-label="Username" aria-invalid="true" />
            <FieldError :errors="[{ message: 'That username is taken.' }]" />
          </Field>
        </FieldSet>
      </div>
    `,
  }),
};
