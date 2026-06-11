import type { Meta, StoryObj } from '@storybook/react';
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
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './field';

const meta: Meta<typeof Field> = {
  title: 'Components/Field',
  component: Field,
};

export default meta;
type Story = StoryObj<typeof Field>;

// A label + control + helper text — the canonical vertical field.
export const Default: Story = {
  render: () => (
    <div className="nx:w-80">
      <Field>
        <FieldLabel htmlFor="field-email">Email</FieldLabel>
        <Input id="field-email" type="email" placeholder="you@example.com" />
        <FieldDescription>We never share it.</FieldDescription>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Email');
    const input = canvas.getByLabelText('Email');
    const labelToInputGap = Math.round(
      input.getBoundingClientRect().top - label.getBoundingClientRect().bottom
    );

    // 8px is the Field label→control gap (gap-2); update if that token changes.
    await expect(labelToInputGap).toBe(8);
  },
};

// The three orientations: vertical, horizontal, and container-responsive.
export const Orientations: Story = {
  render: () => (
    <FieldGroup className="nx:w-80">
      <Field orientation="vertical">
        <FieldLabel htmlFor="field-o-name">Name</FieldLabel>
        <Input id="field-o-name" placeholder="Ada Lovelace" />
      </Field>
      <Field orientation="horizontal">
        <FieldLabel htmlFor="field-o-newsletter">Newsletter</FieldLabel>
        <Checkbox id="field-o-newsletter" />
      </Field>
      <Field orientation="responsive">
        <FieldContent>
          <FieldLabel htmlFor="field-o-bio">Bio</FieldLabel>
          <FieldDescription>Shown on your public profile.</FieldDescription>
        </FieldContent>
        <Input id="field-o-bio" placeholder="A short bio" />
      </Field>
    </FieldGroup>
  ),
};

// Both legend emphases: the larger fieldset `legend` and the label-sized one.
export const LegendVariants: Story = {
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-6">
      <FieldSet>
        <FieldLegend variant="legend">Notifications</FieldLegend>
        <FieldDescription>How should we reach you?</FieldDescription>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="field-l-email">Email</FieldLabel>
          <Checkbox id="field-l-email" defaultChecked />
        </Field>
      </FieldSet>
      <FieldSet>
        <FieldLegend variant="label">Smaller caption</FieldLegend>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="field-l-sms">SMS</FieldLabel>
          <Checkbox id="field-l-sms" />
        </Field>
      </FieldSet>
    </div>
  ),
};

// An invalid field with an error message wired via the errors prop.
export const WithError: Story = {
  render: () => (
    <div className="nx:w-80">
      <Field data-invalid="true">
        <FieldLabel htmlFor="field-err">Password</FieldLabel>
        <Input
          id="field-err"
          type="password"
          aria-describedby="field-err-help"
          aria-errormessage="field-err-message"
          aria-invalid
        />
        <FieldDescription id="field-err-help">
          Use a memorable passphrase.
        </FieldDescription>
        <FieldError
          id="field-err-message"
          errors={[{ message: 'Must be at least 8 characters.' }]}
        />
      </Field>
    </div>
  ),
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
  render: () => (
    <div className="nx:w-80">
      <Field data-invalid="true">
        <FieldLabel htmlFor="field-errors">Password</FieldLabel>
        <Input id="field-errors" type="password" aria-invalid />
        <FieldError
          errors={[
            { message: 'Must include a symbol.' },
            { message: 'Must include a symbol.' },
            { message: 'Must include a number.' },
            { message: '' },
          ]}
        />
      </Field>
    </div>
  ),
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
  render: () => (
    <FieldGroup className="nx:w-80">
      <Field>
        <FieldLabel htmlFor="field-sep-email">Email</FieldLabel>
        <Input id="field-sep-email" type="email" />
      </Field>
      <FieldSeparator>OR</FieldSeparator>
      <Field>
        <FieldLabel htmlFor="field-sep-phone">Phone</FieldLabel>
        <Input id="field-sep-phone" type="tel" />
      </Field>
    </FieldGroup>
  ),
};

// The checkbox-card pattern: a FieldLabel wrapping a Field becomes a selectable card.
export const CheckboxCard: Story = {
  render: () => (
    <div className="nx:w-80">
      <FieldLabel htmlFor="field-card">
        <Field orientation="horizontal">
          <Checkbox
            id="field-card"
            defaultChecked
            aria-labelledby="field-card-title"
          />
          <FieldContent>
            <FieldTitle id="field-card-title">
              Enable two-factor auth
            </FieldTitle>
            <FieldDescription>
              Add an extra layer of security to your account.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </div>
  ),
};

// The group is role=group; parts carry data-slot hooks; orientation is reflected.
export const WithDataAttributes: Story = {
  render: () => (
    <div className="nx:w-80">
      <Field>
        <FieldLabel htmlFor="field-da">Username</FieldLabel>
        <Input id="field-da" />
        <FieldDescription>Your public handle.</FieldDescription>
      </Field>
    </div>
  ),
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

// Clicking a FieldLabel toggles its associated control (label htmlFor wiring).
export const ClickInteraction: Story = {
  render: () => (
    <div className="nx:w-80">
      <Field orientation="horizontal">
        <Checkbox id="field-click" />
        <FieldLabel htmlFor="field-click">Accept the terms</FieldLabel>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The control's accessible name resolves through the label's htmlFor, so
    // this query both proves the wiring and gives a stable click target.
    const checkbox = canvas.getByRole('checkbox', { name: 'Accept the terms' });
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
  },
};

// The control inside a field is keyboard-reachable via Tab.
export const KeyboardInteraction: Story = {
  render: () => (
    <div className="nx:w-80">
      <Field>
        <FieldLabel htmlFor="field-kbd">Email</FieldLabel>
        <Input id="field-kbd" type="email" />
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.tab();
    await expect(input).toHaveFocus();
  },
};

// A disabled field: data-disabled dims the label and the control is disabled.
export const Disabled: Story = {
  render: () => (
    <div className="nx:w-80">
      <Field data-disabled="true">
        <FieldLabel htmlFor="field-disabled">Email</FieldLabel>
        <Input id="field-disabled" type="email" disabled />
        <FieldDescription>This field is locked.</FieldDescription>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toBeDisabled();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// A fieldset with a legend, two fields, a description, and an error. Reused by
// the per-base variant generator — aria-label (not htmlFor/id) avoids id
// collisions across the generated cells.
export const AllVariants: Story = {
  render: () => (
    <FieldSet className="nx:w-80">
      <FieldLegend variant="legend">Account</FieldLegend>
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" aria-label="Email" placeholder="you@example.com" />
        <FieldDescription>We never share it.</FieldDescription>
      </Field>
      <FieldSeparator>OR</FieldSeparator>
      <Field data-invalid="true">
        <FieldLabel>Username</FieldLabel>
        <Input aria-label="Username" aria-invalid />
        <FieldError errors={[{ message: 'That username is taken.' }]} />
      </Field>
    </FieldSet>
  ),
};
