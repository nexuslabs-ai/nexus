import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';
import { Checkbox } from '../checkbox';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from '../description-list';
import { Input } from '../input';
import { Separator } from '../separator';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldRequiredIndicator,
  FieldSet,
} from './field';

type SettingsValues = { name: string; email: string; updates: boolean };
type SettingsFormProps = {
  onSave: (values: SettingsValues) => Promise<void>;
};

function SettingsForm({ onSave }: SettingsFormProps) {
  const id = React.useId();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const [saved, setSaved] = React.useState<SettingsValues>({
    name: 'Priya Shah',
    email: 'priya@example.com',
    updates: false,
  });
  const [draft, setDraft] = React.useState(saved);
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>(
    {}
  );
  const [pending, setPending] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const savingRef = React.useRef(false);
  const dirty =
    draft.name !== saved.name ||
    draft.email !== saved.email ||
    draft.updates !== saved.updates;

  function changeName(event: React.ChangeEvent<HTMLInputElement>) {
    setDraft({ ...draft, name: event.target.value });
    setErrors({ ...errors, name: undefined });
    setMessage('');
    setSaveError('');
  }
  function changeEmail(event: React.ChangeEvent<HTMLInputElement>) {
    setDraft({ ...draft, email: event.target.value });
    setErrors({ ...errors, email: undefined });
    setMessage('');
    setSaveError('');
  }
  function changeUpdates(checked: boolean | 'indeterminate') {
    setDraft({ ...draft, updates: checked === true });
    setMessage('');
    setSaveError('');
  }
  function cancelChanges() {
    setDraft(saved);
    setErrors({});
    setSaveError('');
    setMessage('Changes discarded.');
    nameRef.current?.focus();
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current || !dirty) return;
    const nextErrors = {
      name: draft.name.trim() ? undefined : 'Enter your name.',
      email: emailRef.current?.validity.valid
        ? undefined
        : 'Enter a valid email address.',
    };
    setErrors(nextErrors);
    setMessage('');
    setSaveError('');
    if (nextErrors.name || nextErrors.email) {
      (nextErrors.name ? nameRef : emailRef).current?.focus();
      return;
    }
    const submitted = {
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim(),
    };
    savingRef.current = true;
    setPending(true);
    try {
      await onSave(submitted);
      setSaved(submitted);
      setDraft(submitted);
      setMessage('Changes saved in this demo.');
    } catch {
      setSaveError(
        'We could not save your changes. Your edits are still here. Try again.'
      );
    } finally {
      savingRef.current = false;
      setPending(false);
    }
  }
  const status = pending
    ? 'Saving changes…'
    : message || (dirty ? 'You have unsaved changes.' : 'No unsaved changes.');

  return (
    <form
      aria-label="Profile settings"
      noValidate
      onSubmit={submit}
      className="nx:grid nx:w-full nx:min-w-0 nx:gap-layout-section"
    >
      <div>
        <h2 className="nx:typography-heading-small">Profile settings</h2>
        <p className="nx:mt-1 nx:typography-body-default nx:text-muted-foreground">
          Update your details and preferences. Changes apply when you save.
        </p>
      </div>
      <FieldSet disabled={pending} className="nx:min-w-0">
        <FieldLegend>Personal details</FieldLegend>
        <FieldGroup className="nx:gap-container">
          <Field data-invalid={!!errors.name} data-disabled={pending}>
            <FieldLabel htmlFor={`${id}-name`}>
              Name <FieldRequiredIndicator />
            </FieldLabel>
            <Input
              ref={nameRef}
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              required
              value={draft.name}
              onChange={changeName}
              disabled={pending}
              aria-invalid={!!errors.name}
              aria-describedby={`${id}-name-help${errors.name ? ` ${id}-name-error` : ''}`}
            />
            <FieldDescription id={`${id}-name-help`}>
              The name other people see when you collaborate.
            </FieldDescription>
            <FieldError id={`${id}-name-error`}>{errors.name}</FieldError>
          </Field>
          <Field data-invalid={!!errors.email} data-disabled={pending}>
            <FieldLabel htmlFor={`${id}-email`}>
              Email <FieldRequiredIndicator />
            </FieldLabel>
            <Input
              ref={emailRef}
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={draft.email}
              onChange={changeEmail}
              disabled={pending}
              aria-invalid={!!errors.email}
              aria-describedby={`${id}-email-help${errors.email ? ` ${id}-email-error` : ''}`}
            />
            <FieldDescription id={`${id}-email-help`}>
              Used for account notices and the updates you choose below.
            </FieldDescription>
            <FieldError id={`${id}-email-error`}>{errors.email}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Separator />
      <FieldSet disabled={pending} className="nx:min-w-0">
        <FieldLegend>Preferences</FieldLegend>
        <FieldGroup>
          <Field orientation="horizontal" data-disabled={pending}>
            <Checkbox
              id={`${id}-updates`}
              name="updates"
              checked={draft.updates}
              onCheckedChange={changeUpdates}
              disabled={pending}
              aria-describedby={`${id}-updates-help`}
            />
            <FieldContent>
              <FieldLabel htmlFor={`${id}-updates`}>Product updates</FieldLabel>
              <FieldDescription id={`${id}-updates-help`}>
                Receive occasional news about new features. This preference is
                saved with your details.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
      <div className="nx:grid nx:gap-3 nx:border-t-default nx:border-border-default nx:pt-4">
        <p
          role="status"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          {status}
        </p>
        <FieldError>{saveError}</FieldError>
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <Button type="submit" loading={pending} disabled={!dirty}>
            Save changes
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!dirty || pending}
            onClick={cancelChanges}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

const meta = {
  title: 'Patterns/Forms and Settings',
  component: SettingsForm,
  args: { onSave: fn(async () => {}) },
  argTypes: { onSave: { control: false } },
  decorators: [
    (Story) => (
      <main className="nx:w-full nx:max-w-2xl nx:p-4">
        <Story />
      </main>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A copyable composition of existing Nexus components, not a new form framework. Use Field for a label, control, help and error; FieldSet + FieldLegend for related fields; and native form submission for Save. Wire htmlFor, required, aria-invalid and aria-describedby explicitly. This example owns draft, validation, pending, saved and error states locally. Cancel restores the latest saved values. Checkboxes participate in Save; switches are for immediate changes. The demo callback does not persist data. Applications own validation rules, authorization, API errors, navigation guards and persistence. Section and field spacing use density-aware layout tokens. See https://www.w3.org/WAI/tutorials/forms/ and https://react.dev/reference/react-dom/components/form.',
      },
    },
  },
} satisfies Meta<typeof SettingsForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const GroupedSettings: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole('textbox', { name: 'Name' });
    const updates = canvas.getByRole('checkbox', { name: 'Product updates' });
    const save = canvas.getByRole('button', { name: 'Save changes' });
    await expect(save).toBeDisabled();
    await userEvent.clear(name);
    await userEvent.type(name, 'Priya Patel');
    await userEvent.click(updates);
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'You have unsaved changes.'
    );
    await userEvent.click(save);
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        'Changes saved in this demo.'
      )
    );
    await expect(args.onSave).toHaveBeenCalledWith({
      name: 'Priya Patel',
      email: 'priya@example.com',
      updates: true,
    });
    await userEvent.clear(name);
    await userEvent.type(name, 'Unsaved name');
    await userEvent.click(updates);
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(name).toHaveValue('Priya Patel');
    await expect(updates).toBeChecked();
    await expect(name).toHaveFocus();
    await expect(save).toBeDisabled();
  },
};

export const Validation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole('textbox', { name: 'Name' });
    const email = canvas.getByRole('textbox', { name: 'Email' });
    await userEvent.clear(name);
    await userEvent.clear(email);
    await userEvent.type(email, 'invalid');
    await userEvent.keyboard('{Enter}');
    await expect(name).toHaveFocus();
    await expect(name).toHaveAccessibleDescription(/Enter your name/);
    await expect(email).toHaveAccessibleDescription(
      /Enter a valid email address/
    );
    await expect(args.onSave).not.toHaveBeenCalled();
    await userEvent.type(name, 'Priya Shah');
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await expect(email).toHaveFocus();
    await userEvent.clear(email);
    await userEvent.type(email, 'priya.shah@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
    );
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const Saving: Story = {
  args: {
    onSave: fn(() => new Promise<void>((resolve) => setTimeout(resolve, 1000))),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Simulates a one-second save. Fields and actions are disabled until it completes; edits cannot race with the submitted values.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    let completeSave: () => void = () => {};
    const result = new Promise<void>((resolve) => {
      completeSave = resolve;
    });
    const callback = args.onSave as ReturnType<
      typeof fn<SettingsFormProps['onSave']>
    >;
    callback.mockImplementationOnce(() => result);
    const name = canvas.getByRole('textbox', { name: 'Name' });
    await userEvent.type(name, ' Jr');
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Saving changes'
    );
    await expect(name).toBeDisabled();
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeDisabled();
    await expect(canvas.getByRole('checkbox')).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Save changes' })
    ).toBeDisabled();
    completeSave();
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
    );
    await expect(name).toBeEnabled();
  },
};

export const SaveFailure: Story = {
  args: {
    onSave: fn(async () => {
      throw new Error('Demo service unavailable');
    }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole('textbox', { name: 'Name' });
    await userEvent.type(name, ' Jr');
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Your edits are still here'
    );
    await expect(name).toHaveValue('Priya Shah Jr');
    await expect(
      canvas.getByRole('button', { name: 'Save changes' })
    ).toBeEnabled();
    const callback = args.onSave as ReturnType<
      typeof fn<SettingsFormProps['onSave']>
    >;
    callback.mockResolvedValueOnce(undefined);
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
    );
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const NarrowContainer: Story = {
  render: (args) => (
    <div className="nx:w-full" style={{ maxWidth: 280 }}>
      <SettingsForm {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.clear(canvas.getByRole('textbox', { name: 'Name' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await expect(canvas.getByRole('alert')).toBeVisible();
    const form = canvas.getByRole('form', { name: 'Profile settings' });
    await expect(form.scrollWidth).toBeLessThanOrEqual(form.clientWidth + 1);
  },
};

function ReadOnlyDetails() {
  return (
    <section className="nx:grid nx:gap-container">
      <div>
        <h2 className="nx:typography-heading-small">Account details</h2>
        <p className="nx:mt-1 nx:typography-body-default nx:text-muted-foreground">
          These details are managed by your organization. Contact an
          administrator to change them.
        </p>
      </div>
      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Name</DescriptionListTerm>
          <DescriptionListDescription>Priya Shah</DescriptionListDescription>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Email</DescriptionListTerm>
          <DescriptionListDescription>
            priya@example.com
          </DescriptionListDescription>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Team</DescriptionListTerm>
          <DescriptionListDescription>
            <span className="nx:text-muted-foreground">Not provided</span>
          </DescriptionListDescription>
        </DescriptionListItem>
      </DescriptionList>
    </section>
  );
}
export const ReadOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use a DescriptionList when values are information rather than editable controls. Explain who can change them; keep empty values explicit.',
      },
    },
  },
  render: () => <ReadOnlyDetails />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(canvas.getByText('Not provided')).toBeVisible();
  },
};

function DisabledSettings() {
  const id = React.useId();
  return (
    <FieldSet disabled className="nx:min-w-0">
      <FieldLegend>Delivery settings</FieldLegend>
      <FieldDescription id={`${id}-reason`}>
        Delivery is paused while your address is being verified.
      </FieldDescription>
      <FieldGroup className="nx:gap-container">
        <Field data-disabled="true">
          <FieldLabel htmlFor={`${id}-address`}>Delivery address</FieldLabel>
          <Input
            id={`${id}-address`}
            defaultValue="24 Riverside Road"
            disabled
            aria-describedby={`${id}-reason`}
          />
        </Field>
        <Field orientation="horizontal" data-disabled="true">
          <Checkbox
            id={`${id}-tracking`}
            disabled
            defaultChecked
            aria-describedby={`${id}-reason`}
          />
          <FieldLabel htmlFor={`${id}-tracking`}>
            Send tracking updates
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Disabled controls are temporarily unavailable. Give a visible reason and connect it with aria-describedby. Apply disabled to the controls and data-disabled to their Field wrappers.',
      },
    },
  },
  render: () => <DisabledSettings />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toBeDisabled();
    await expect(canvas.getByRole('checkbox')).toBeDisabled();
    await expect(canvas.getByRole('textbox')).toHaveAccessibleDescription(
      /Delivery is paused/
    );
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="nx:grid nx:gap-layout-section">
      <SettingsForm {...args} />
      <Separator />
      <ReadOnlyDetails />
      <Separator />
      <DisabledSettings />
    </div>
  ),
};
