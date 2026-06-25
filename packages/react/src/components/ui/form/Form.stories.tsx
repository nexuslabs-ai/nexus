import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { z } from 'zod';

import { Button } from '../button';
import { Field, FieldDescription, FieldLabel } from '../field';
import { Input } from '../input';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';

const signUpSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.email('Enter a valid email address'),
});

type SignUpValues = z.infer<typeof signUpSchema>;

/**
 * A zod-validated sign-up form — the canonical Form composition reused across
 * the interaction stories. `onSubmit` runs only when validation passes.
 */
function SignUpForm({
  onSubmit,
}: {
  onSubmit?: (values: SignUpValues) => void;
}) {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: '', email: '' },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit?.(values))}
        className="nx:flex nx:flex-col nx:gap-6 nx:w-[360px]"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="janedoe" {...field} />
              </FormControl>
              <FormDescription>Your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="jane@example.com" {...field} />
              </FormControl>
              <FormDescription>Used for sign-in and receipts.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create account</Button>
      </form>
    </Form>
  );
}

/**
 * A single-field form with no resolver — the simplest possible composition.
 */
function UsernameForm({ extraDescriptionId }: { extraDescriptionId?: string }) {
  const form = useForm<{ username: string }>({
    defaultValues: { username: '' },
  });

  return (
    <Form {...form}>
      <div className="nx:w-[360px]">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl aria-describedby={extraDescriptionId}>
                <Input placeholder="janedoe" {...field} />
              </FormControl>
              <FormDescription>Your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}

function MessageLessErrorForm() {
  const form = useForm<{ code: string }>({
    defaultValues: { code: '' },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => undefined)}
        className="nx:w-[360px]"
      >
        <FormField
          control={form.control}
          name="code"
          rules={{ required: true }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invite code</FormLabel>
              <FormControl>
                <Input placeholder="NX-123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="nx:mt-4">
          Redeem code
        </Button>
      </form>
    </Form>
  );
}

/**
 * Showcase of the field anatomy across its resting configurations: a full
 * field, a label-plus-control field, and a disabled control. Every field keeps
 * a description so the control's `aria-describedby` always resolves.
 */
function AnatomyForm() {
  const form = useForm<{
    full: string;
    paired: string;
    locked: string;
  }>({
    defaultValues: { full: '', paired: '', locked: 'Read-only value' },
  });

  return (
    <Form {...form}>
      <div className="nx:flex nx:flex-col nx:gap-6 nx:w-[360px]">
        <FormField
          control={form.control}
          name="full"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label, control, description</FormLabel>
              <FormControl>
                <Input placeholder="Standard field" {...field} />
              </FormControl>
              <FormDescription>Helper text under the control.</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paired"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label and control</FormLabel>
              <FormControl>
                <Input placeholder="Compact field" {...field} />
              </FormControl>
              <FormDescription>Descriptions remain optional.</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locked"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disabled control</FormLabel>
              <FormControl>
                <Input disabled {...field} />
              </FormControl>
              <FormDescription>The control can be disabled.</FormDescription>
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}

function FieldVsFormErgonomicsExample() {
  const form = useForm<{ email: string }>({
    defaultValues: { email: '' },
  });

  return (
    <div className="nx:grid nx:max-w-3xl nx:gap-6 nx:lg:grid-cols-2">
      <section className="nx:grid nx:gap-3 nx:rounded-md nx:border nx:border-border-default nx:p-4">
        <h3 className="nx:typography-label-default nx:text-foreground">
          Field
        </h3>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          Low-level and library-agnostic. You own ids, validation state, and
          form-library wiring.
        </p>
        <Field>
          <FieldLabel htmlFor="field-library-email">Library email</FieldLabel>
          <Input
            id="field-library-email"
            type="email"
            placeholder="jane@example.com"
          />
          <FieldDescription>
            Use Field when the form library is not React Hook Form.
          </FieldDescription>
        </Field>
      </section>
      <section className="nx:grid nx:gap-3 nx:rounded-md nx:border nx:border-border-default nx:p-4">
        <h3 className="nx:typography-label-default nx:text-foreground">Form</h3>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          React Hook Form-specific. FormField and FormControl wire ids,
          descriptions, invalid state, and messages from RHF state.
        </p>
        <Form {...form}>
          <form className="nx:grid nx:gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RHF email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jane@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use Form when React Hook Form owns field state.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </section>
    </div>
  );
}

function RequiredOptionalHouseRuleExample() {
  return (
    <div className="nx:grid nx:max-w-3xl nx:gap-6 nx:lg:grid-cols-2">
      <section className="nx:grid nx:gap-4 nx:rounded-md nx:border nx:border-border-default nx:p-4">
        <div className="nx:grid nx:gap-1">
          <h3 className="nx:typography-label-default nx:text-foreground">
            Most fields required
          </h3>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            Mark only the exceptions as optional.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="required-house-company">Company</FieldLabel>
          <Input id="required-house-company" />
        </Field>
        <Field>
          <FieldLabel htmlFor="required-house-email">Work email</FieldLabel>
          <Input id="required-house-email" type="email" />
        </Field>
        <Field>
          <FieldLabel htmlFor="required-house-po">
            Purchase order{' '}
            <span className="nx:text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Input id="required-house-po" />
        </Field>
      </section>
      <section className="nx:grid nx:gap-4 nx:rounded-md nx:border nx:border-border-default nx:p-4">
        <div className="nx:grid nx:gap-1">
          <h3 className="nx:typography-label-default nx:text-foreground">
            Most fields optional
          </h3>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            Mark only the required fields.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="optional-house-linkedin">
            LinkedIn profile
          </FieldLabel>
          <Input id="optional-house-linkedin" type="url" />
        </Field>
        <Field>
          <FieldLabel htmlFor="optional-house-phone">Phone</FieldLabel>
          <Input id="optional-house-phone" type="tel" />
        </Field>
        <Field>
          <FieldLabel htmlFor="optional-house-email">
            Work email{' '}
            <span className="nx:text-muted-foreground">(required)</span>
          </FieldLabel>
          <Input id="optional-house-email" type="email" required />
        </Field>
      </section>
    </div>
  );
}

const meta = {
  title: 'Components/Form',
  component: Form,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Form>;

export default meta;

// Stories drive their own composition through `render`, so args are decoupled
// from FormProvider's (required) props; `onSubmit` is the only spy they pass.
type Story = StoryObj<{ onSubmit?: (values: SignUpValues) => void }>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: () => <UsernameForm />,
};

export const BasicValidation: Story = {
  render: () => <SignUpForm />,
  parameters: {
    docs: {
      description: {
        story:
          'Fields are validated with a Zod schema via `zodResolver`. Each FormItem composes a label, control, description, and message; FormMessage renders the resolver error when a field is invalid.',
      },
    },
  },
};

export const FieldVsFormErgonomics: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Field is the low-level, library-agnostic field anatomy. Form is the React Hook Form-specific binding layer. This story is documentation guidance only; read-only source semantics, warning source semantics, rich Select slots, and Combobox/MultiSelect boundaries remain on the roadmap.',
      },
    },
  },
  render: () => <FieldVsFormErgonomicsExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fieldInput = canvas.getByLabelText('Library email');
    const formInput = canvas.getByLabelText('RHF email');

    await expect(fieldInput).toHaveAttribute('id', 'field-library-email');
    await expect(formInput).toHaveAttribute('aria-describedby');
  },
};

export const RequiredOptionalHouseRule: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'House rule: when most fields are required, mark optional exceptions. When most fields are optional, mark required exceptions. Avoid marking every field in both directions.',
      },
    },
  },
  render: () => <RequiredOptionalHouseRuleExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('(optional)')).toBeInTheDocument();
    await expect(canvas.getByText('(required)')).toBeInTheDocument();
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const SubmitSuccess: Story = {
  args: { onSubmit: fn() },
  render: (args) => <SignUpForm onSubmit={args.onSubmit} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Username'), 'janedoe');
    await userEvent.type(canvas.getByLabelText('Email'), 'jane@example.com');
    await userEvent.click(
      canvas.getByRole('button', { name: /create account/i })
    );

    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
    await expect(args.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'janedoe',
        email: 'jane@example.com',
      })
    );
  },
};

export const ShowErrors: Story = {
  args: { onSubmit: fn() },
  render: (args) => <SignUpForm onSubmit={args.onSubmit} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const username = canvas.getByLabelText('Username');
    const usernameDescription = canvas.getByText('Your public display name.');

    await expect(
      canvas.queryByText('Username must be at least 2 characters')
    ).not.toBeInTheDocument();
    await expect(username).not.toHaveAttribute('aria-errormessage');

    // Submit with empty fields — the resolver should surface messages.
    await userEvent.click(
      canvas.getByRole('button', { name: /create account/i })
    );

    await waitFor(() =>
      expect(
        canvas.getByText('Username must be at least 2 characters')
      ).toBeInTheDocument()
    );

    const usernameMessage = canvas.getByText(
      'Username must be at least 2 characters'
    );
    await expect(username).toHaveAttribute('aria-invalid', 'true');
    await expect(username).toHaveAttribute(
      'aria-describedby',
      usernameDescription.getAttribute('id')
    );
    await expect(username).toHaveAttribute(
      'aria-errormessage',
      usernameMessage.getAttribute('id')
    );
    await expect(usernameMessage).toHaveAttribute('role', 'alert');
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const WithMergedDescription: Story = {
  render: () => (
    <div className="nx:flex nx:w-[360px] nx:flex-col nx:gap-2">
      <p id="username-extra-description" className="nx:typography-body-default">
        Use letters, numbers, and underscores.
      </p>
      <UsernameForm extraDescriptionId="username-extra-description" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Username');
    const description = canvas.getByText('Your public display name.');

    await expect(input).toHaveAttribute(
      'aria-describedby',
      `${description.getAttribute('id')} username-extra-description`
    );
  },
};

export const WithoutErrorMessage: Story = {
  render: () => <MessageLessErrorForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Invite code');

    await userEvent.click(canvas.getByRole('button', { name: /redeem code/i }));

    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    await expect(input).not.toHaveAttribute('aria-errormessage');
    await expect(
      canvasElement.querySelector('[data-slot="form-message"]')
    ).toHaveAttribute('role', 'alert');
  },
};

export const WithDataAttributes: Story = {
  render: () => <SignUpForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const label = canvas.getByText('Username');
    await expect(label).toHaveAttribute('data-slot', 'form-label');

    const description = canvas.getByText('Your public display name.');
    await expect(description).toHaveAttribute('data-slot', 'form-description');

    // FormControl wires the control's id + helper description to the FormItem.
    const input = canvas.getByLabelText('Username');
    await expect(input).toHaveAttribute('id', label.getAttribute('for'));
    await expect(input).toHaveAttribute(
      'aria-describedby',
      description.getAttribute('id')
    );
    await expect(input).not.toHaveAttribute('aria-errormessage');

    await expect(
      canvasElement.querySelector('[data-slot="form-item"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => <AnatomyForm />,
};
