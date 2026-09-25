import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button';

import { InlineEdit, type InlineEditProps } from './inline-edit';

const meta: Meta<typeof InlineEdit> = {
  title: 'Components/InlineEdit',
  component: InlineEdit,
  parameters: {
    docs: {
      description: {
        component:
          'Single-line text editing with click or pencil activation. The consumer owns the committed value and persistence. Enter saves, Escape cancels, and blurBehavior selects keep-open (default), save, or cancel when focus leaves the entire editor. Exiting never steals focus from the next control. Optional values can be cleared; required values show an inline error. Read-only values have no editing controls.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof InlineEdit>;

function Example(props: Partial<InlineEditProps>) {
  const [value, setValue] = useState(props.value ?? 'Priya Shah');
  return (
    <div className="nx:w-full nx:max-w-sm">
      <InlineEdit
        label="Name"
        {...props}
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Example /> };
export const ClickToEdit: Story = {
  render: () => <Example variant="click" value="" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Edit Name' })
    ).toHaveTextContent('Add name…');
    await userEvent.tab();
    await userEvent.keyboard(' ');
    const input = canvas.getByRole('textbox', { name: 'Name' });
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'New name{Enter}');
    await expect(
      canvas.getByRole('button', { name: 'Edit Name' })
    ).toHaveTextContent('New name');
    await expect(
      canvas.getByRole('button', { name: 'Edit Name' })
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.clear(canvas.getByRole('textbox'));
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('button', { name: 'Edit Name' })
    ).toHaveTextContent('Add name…');
  },
};
export const Required: Story = {
  render: () => <Example required />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    const input = canvas.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, '   {Enter}');
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Name is required.'
    );
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByText('Priya Shah')).toBeVisible();
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
export const ReadOnly: Story = {
  render: () => <Example readOnly value="" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Not provided')).toBeVisible();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};
export const AllVariants: Story = {
  play: async ({ canvasElement }) => {
    const values = Array.from(
      canvasElement.querySelectorAll('[data-slot="inline-edit"] span')
    ).filter((element) => element.textContent === 'Priya Shah');
    const styles = values.map((element) => {
      const style = getComputedStyle(element);
      return {
        size: style.fontSize,
        weight: style.fontWeight,
        lineHeight: style.lineHeight,
        color: style.color,
      };
    });
    await expect(styles).toHaveLength(3);
    await expect(styles[0]).toEqual(styles[1]);
    await expect(styles[1]).toEqual(styles[2]);
  },
  render: () => (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-4">
      <Example variant="click" />
      <Example variant="click" value="" />
      <Example />
      <Example value="" />
      <Example readOnly />
      <Example readOnly value="" />
    </div>
  ),
};

function BlurExample({
  behavior = 'keep-open',
  required = false,
}: {
  behavior?: InlineEditProps['blurBehavior'];
  required?: boolean;
}) {
  return (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-4">
      <Example blurBehavior={behavior} required={required} />
      <Button variant="outline">Outside action</Button>
      <p>Click here to leave the editor without focusing a button.</p>
    </div>
  );
}

export const SaveOnExit: Story = {
  render: () => <BlurExample behavior="save" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const outside = canvas.getByRole('button', { name: 'Outside action' });
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.clear(canvas.getByRole('textbox'));
    await userEvent.type(canvas.getByRole('textbox'), 'Updated name');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Save Name' })
    ).toHaveFocus();
    await expect(canvas.getByRole('textbox')).toHaveValue('Updated name');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Cancel editing Name' })
    ).toHaveFocus();
    await userEvent.tab();
    await expect(outside).toHaveFocus();
    await expect(canvas.getByText('Updated name')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.clear(canvas.getByRole('textbox'));
    await userEvent.type(canvas.getByRole('textbox'), 'Discard me');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Cancel editing Name' })
    );
    await expect(canvas.getByText('Updated name')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.clear(canvas.getByRole('textbox'));
    await userEvent.click(
      canvas.getByText(
        'Click here to leave the editor without focusing a button.'
      )
    );
    await expect(canvas.getByText('Not provided')).toBeVisible();
  },
};
export const CancelOnExit: Story = {
  render: () => <BlurExample behavior="cancel" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.clear(canvas.getByRole('textbox'));
    await userEvent.type(canvas.getByRole('textbox'), 'Discard me');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside action' })
    );
    await expect(canvas.getByText('Priya Shah')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Outside action' })
    ).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.clear(canvas.getByRole('textbox'));
    await userEvent.type(canvas.getByRole('textbox'), 'Saved explicitly');
    await userEvent.click(canvas.getByRole('button', { name: 'Save Name' }));
    await expect(canvas.getByText('Saved explicitly')).toBeVisible();
  },
};
export const KeepOpenOnExit: Story = {
  render: () => <BlurExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.type(canvas.getByRole('textbox'), ' draft');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside action' })
    );
    await expect(canvas.getByRole('textbox')).toHaveValue('Priya Shah draft');
    await expect(
      canvas.getByRole('button', { name: 'Outside action' })
    ).toHaveFocus();
  },
};
export const InvalidOnExit: Story = {
  render: () => <BlurExample behavior="save" required />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.clear(canvas.getByRole('textbox'));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside action' })
    );
    await expect(canvas.getByRole('textbox')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Name is required.'
    );
    await expect(
      canvas.getByRole('button', { name: 'Outside action' })
    ).toHaveFocus();
    await userEvent.type(canvas.getByRole('textbox'), 'Valid name');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside action' })
    );
    await expect(canvas.getByText('Valid name')).toBeVisible();
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const StableEditingTypography: Story = {
  render: () => (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-4">
      <Example variant="click" />
      <Example variant="pencil" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const editors = canvasElement.querySelectorAll('[data-slot="inline-edit"]');
    for (const editor of editors) {
      const canvas = within(editor as HTMLElement);
      const value = canvas.getByText('Priya Shah');
      const textLeft = value.getBoundingClientRect().left;
      const style = getComputedStyle(value);
      const before = {
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontFamily: style.fontFamily,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
      };
      await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
      const input = canvas.getByRole('textbox');
      const inputStyle = getComputedStyle(input);
      const inputTextLeft =
        input.getBoundingClientRect().left +
        Number.parseFloat(inputStyle.paddingLeft) +
        Number.parseFloat(inputStyle.borderLeftWidth);
      await expect(Math.abs(inputTextLeft - textLeft)).toBeLessThan(1);
      for (const [property, expected] of Object.entries(before)) {
        await expect(inputStyle[property as keyof typeof before]).toBe(
          expected
        );
      }
      await userEvent.keyboard('{Escape}');
    }
  },
};
