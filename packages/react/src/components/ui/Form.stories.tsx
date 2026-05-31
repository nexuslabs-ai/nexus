import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { z } from 'zod';

import { Button } from './button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Input } from './input';

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
function UsernameForm() {
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
              <FormControl>
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

    // Submit with empty fields — the resolver should surface messages.
    await userEvent.click(
      canvas.getByRole('button', { name: /create account/i })
    );

    await waitFor(() =>
      expect(
        canvas.getByText('Username must be at least 2 characters')
      ).toBeInTheDocument()
    );

    const username = canvas.getByLabelText('Username');
    await expect(username).toHaveAttribute('aria-invalid', 'true');
    await expect(args.onSubmit).not.toHaveBeenCalled();
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

    // FormControl wires the control's id + aria-describedby to the FormItem.
    const input = canvas.getByLabelText('Username');
    await expect(input).toHaveAttribute('id', label.getAttribute('for'));
    await expect(input).toHaveAttribute(
      'aria-describedby',
      description.getAttribute('id')
    );

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
