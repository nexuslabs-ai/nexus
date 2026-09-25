import { useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { Button } from '../button';

import { InlineEdit, type InlineEditProps } from './inline-edit';

const meta: Meta<typeof InlineEdit> = {
  title: 'Components/InlineEdit',
  component: InlineEdit,
  parameters: {
    docs: {
      description: {
        component:
          'Single-line text editing with pencil or click activation. The consumer owns the committed value, persistence, and any error. `onCommit` receives the trimmed draft; return a promise to keep the editor open until it settles — rejecting keeps the draft open for the consumer to show `error`. `editing` / `onEditingChange` control when the editor is open. Enter saves, Escape cancels, and blurBehavior selects keep-open (default), save, or cancel when focus leaves the entire editor. Exiting never steals focus from the next control. Optional values can be cleared; required values show `requiredMessage`. Read-only values have no editing controls.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof InlineEdit>;

type ExampleProps = Partial<Omit<InlineEditProps, 'readOnly' | 'onCommit'>> & {
  onCommit?: (value: string) => void;
};

function Example({ onCommit, ...props }: ExampleProps) {
  const [value, setValue] = useState(props.value ?? 'Priya Shah');

  function handleCommit(next: string) {
    onCommit?.(next);
    setValue(next);
  }

  return (
    <div className="nx:w-full nx:max-w-sm">
      <InlineEdit
        label="Name"
        {...props}
        value={value}
        onCommit={handleCommit}
      />
    </div>
  );
}

function ReadOnlyExample({ value = 'Priya Shah' }: { value?: string }) {
  return (
    <div className="nx:w-full nx:max-w-sm">
      <InlineEdit readOnly label="Name" value={value} />
    </div>
  );
}

async function clickWithoutFocusingTarget(target: HTMLElement) {
  const focused = document.activeElement;
  const defaultAllowed = await fireEvent.mouseDown(target);
  if (defaultAllowed && focused instanceof HTMLElement) focused.blur();
  await fireEvent.mouseUp(target);
  await fireEvent.click(target);
}

export const Default: Story = { render: () => <Example /> };

export const ClickActivation: Story = {
  render: () => <Example activation="click" value="" emptyText="Add a name" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Edit Name Add a name' })
    ).toBeVisible();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    const input = canvas.getByRole('textbox', { name: 'Name' });
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'New name{Enter}');
    const trigger = canvas.getByRole('button', { name: 'Edit Name New name' });
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.clear(canvas.getByRole('textbox'));
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('button', { name: 'Edit Name Add a name' })
    ).toHaveFocus();
  },
};

export const CommitInteraction: Story = {
  args: { onCommit: fn() },
  render: (args) => <Example onCommit={args.onCommit} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.clear(canvas.getByRole('textbox'));
    await userEvent.type(
      canvas.getByRole('textbox'),
      '  Priya Sharma  {Enter}'
    );
    await expect(args.onCommit).toHaveBeenCalledTimes(1);
    await expect(args.onCommit).toHaveBeenCalledWith('Priya Sharma');
    await expect(canvas.getByText('Priya Sharma')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.type(canvas.getByRole('textbox'), ' discarded');
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await userEvent.type(canvas.getByRole('textbox'), ' discarded');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Cancel editing Name' })
    );
    await expect(args.onCommit).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText('Priya Sharma')).toBeVisible();
  },
};

export const Required: Story = {
  render: () => <Example required requiredMessage="Enter a name." />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    const input = canvas.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, '   {Enter}');
    await expect(canvas.getByRole('alert')).toHaveTextContent('Enter a name.');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(input, 'P');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expect(input).not.toHaveAttribute('aria-invalid');
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByText('Priya Shah')).toBeVisible();
  },
};

export const ReadOnly: Story = {
  render: () => <ReadOnlyExample value="" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Not provided')).toBeVisible();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};

export const WithDataAttributes: Story = {
  render: () => (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-4">
      <Example />
      <Example activation="click" />
      <ReadOnlyExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const roots = canvasElement.querySelectorAll('[data-slot="inline-edit"]');
    await expect(roots).toHaveLength(3);
    await expect(roots[0]).toHaveAttribute('data-activation', 'pencil');
    await expect(roots[1]).toHaveAttribute('data-activation', 'click');
    await expect(roots[0]).not.toHaveAttribute('data-readonly');
    await expect(roots[2]).toHaveAttribute('data-readonly', 'true');
    for (const root of roots) {
      await expect(
        root.querySelector('[data-slot="inline-edit-value"]')
      ).toHaveTextContent('Priya Shah');
    }
  },
};

export const AllVariants: Story = {
  play: async ({ canvasElement }) => {
    const values = Array.from(
      canvasElement.querySelectorAll('[data-slot="inline-edit-value"]')
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
      <Example activation="click" />
      <Example activation="click" value="" />
      <Example />
      <Example value="" />
      <ReadOnlyExample />
      <ReadOnlyExample value="" />
    </div>
  ),
};

function BlurExample({
  behavior = 'keep-open',
  required = false,
  onCommit,
}: {
  behavior?: InlineEditProps['blurBehavior'];
  required?: boolean;
  onCommit?: (value: string) => void;
}) {
  return (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-4">
      <Example
        blurBehavior={behavior}
        required={required}
        onCommit={onCommit}
      />
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
    await expect(await canvas.findByText('Updated name')).toBeVisible();
    await expect(outside).toHaveFocus();
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
    await expect(await canvas.findByText('Not provided')).toBeVisible();
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
    await expect(await canvas.findByText('Saved explicitly')).toBeVisible();
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
    await expect(await canvas.findByText('Valid name')).toBeVisible();
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const ActionsWithoutButtonFocus: Story = {
  args: { onCommit: fn() },
  render: (args) => (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-4">
      <Example label="Title" value="Draft title" blurBehavior="cancel" />
      <Example
        label="Owner"
        value="Priya Shah"
        blurBehavior="save"
        onCommit={args.onCommit}
      />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Title' }));
    await userEvent.clear(canvas.getByRole('textbox', { name: 'Title' }));
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Title' }),
      'Final title'
    );
    await clickWithoutFocusingTarget(
      canvas.getByRole('button', { name: 'Save Title' })
    );
    await expect(await canvas.findByText('Final title')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Edit Owner' }));
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Owner' }),
      ' discarded'
    );
    await clickWithoutFocusingTarget(
      canvas.getByRole('button', { name: 'Cancel editing Owner' })
    );
    await expect(
      canvas.queryByRole('textbox', { name: 'Owner' })
    ).not.toBeInTheDocument();
    await expect(args.onCommit).not.toHaveBeenCalled();
    await expect(canvas.getByText('Priya Shah')).toBeVisible();
  },
};

function AsyncCommitExample() {
  const [value, setValue] = useState('Priya Shah');
  const [error, setError] = useState<string>();
  const finishSave = useRef<() => void>(undefined);

  async function handleCommit(next: string) {
    setError(undefined);
    if (next === 'Taken name') {
      setError('That name is already taken.');
      throw new Error('Name taken');
    }
    await new Promise<void>((resolve) => {
      finishSave.current = resolve;
    });
    setValue(next);
  }

  return (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-4">
      <InlineEdit
        label="Name"
        value={value}
        error={error}
        onCommit={handleCommit}
      />
      <Button variant="outline" onClick={() => finishSave.current?.()}>
        Finish saving
      </Button>
    </div>
  );
}

export const AsyncCommit: Story = {
  render: () => <AsyncCommitExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    const input = canvas.getByRole('textbox', { name: 'Name' });
    await userEvent.clear(input);
    await userEvent.type(input, 'Taken name{Enter}');
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'That name is already taken.'
    );
    await expect(input).toHaveValue('Taken name');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).not.toHaveAttribute('readonly');

    await userEvent.clear(input);
    await userEvent.type(input, 'Priya Sharma{Enter}');
    const group = canvas.getByRole('group', { name: 'Edit Name' });
    await expect(group).toHaveAttribute('aria-busy', 'true');
    await expect(input).toHaveAttribute('readonly');
    await userEvent.keyboard('{Escape}');
    await expect(input).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Finish saving' })
    );
    await expect(await canvas.findByText('Priya Sharma')).toBeVisible();
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Finish saving' })
    ).toHaveFocus();
  },
};

function ControlledExample({
  onEditingChange,
}: {
  onEditingChange?: (editing: boolean) => void;
}) {
  const [value, setValue] = useState('Priya Shah');
  const [editing, setEditing] = useState(false);

  function handleEditingChange(next: boolean) {
    onEditingChange?.(next);
    setEditing(next);
  }

  return (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-4">
      <InlineEdit
        label="Name"
        value={value}
        editing={editing}
        onEditingChange={handleEditingChange}
        onCommit={setValue}
      />
      <Button variant="outline" onClick={() => setEditing(true)}>
        Rename
      </Button>
    </div>
  );
}

export const ControlledEditing: Story = {
  args: { onEditingChange: fn() },
  render: (args) => (
    <ControlledExample onEditingChange={args.onEditingChange} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Rename' }));
    const input = canvas.getByRole('textbox', { name: 'Name' });
    await expect(input).toHaveFocus();
    await expect(args.onEditingChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    await expect(args.onEditingChange).toHaveBeenLastCalledWith(false);
    await expect(input).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    await expect(args.onEditingChange).toHaveBeenLastCalledWith(true);
    await userEvent.type(canvas.getByRole('textbox'), ' Rao{Enter}');
    await expect(await canvas.findByText('Priya Shah Rao')).toBeVisible();
    await expect(args.onEditingChange).toHaveBeenLastCalledWith(false);
  },
};

function StaysOpenExample({
  onEditingChange,
}: {
  onEditingChange?: (editing: boolean) => void;
}) {
  const [value, setValue] = useState('Priya Shah');
  const [editing, setEditing] = useState(false);

  function handleEditingChange(next: boolean) {
    onEditingChange?.(next);
    if (next) setEditing(true);
  }

  return (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-4">
      <InlineEdit
        label="Name"
        value={value}
        editing={editing}
        onEditingChange={handleEditingChange}
        onCommit={setValue}
      />
      <Button variant="outline" onClick={() => setEditing(false)}>
        Done
      </Button>
    </div>
  );
}

export const ControlledEditingStaysOpen: Story = {
  args: { onEditingChange: fn() },
  render: (args) => <StaysOpenExample onEditingChange={args.onEditingChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    const input = canvas.getByRole('textbox', { name: 'Name' });
    await userEvent.type(input, ' Rao{Enter}');
    await expect(args.onEditingChange).toHaveBeenLastCalledWith(false);
    await expect(input).toBeInTheDocument();
    await expect(input).not.toHaveAttribute('readonly');
    await expect(
      canvas.getByRole('group', { name: 'Edit Name' })
    ).not.toHaveAttribute('aria-busy');

    await userEvent.type(input, 'o');
    await expect(input).toHaveValue('Priya Shah Raoo');
    await userEvent.keyboard('{Escape}');
    await expect(args.onEditingChange).toHaveBeenCalledTimes(3);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Cancel editing Name' })
    );
    await expect(args.onEditingChange).toHaveBeenCalledTimes(4);

    const done = canvas.getByRole('button', { name: 'Done' });
    await userEvent.click(done);
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(done).toHaveFocus();
  },
};

function ExternalCloseExample() {
  const [editing, setEditing] = useState(false);

  function handleEditingChange(next: boolean) {
    if (next) setEditing(true);
  }

  return (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-4">
      <InlineEdit
        label="Name"
        value="Priya Shah"
        editing={editing}
        blurBehavior="cancel"
        onEditingChange={handleEditingChange}
        onCommit={fn()}
      />
      <Button variant="outline">Elsewhere</Button>
      <Button
        variant="outline"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setEditing(false)}
      >
        Close from toolbar
      </Button>
    </div>
  );
}

export const ExternalCloseReturnsFocus: Story = {
  render: () => <ExternalCloseExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Name' }));
    const input = canvas.getByRole('textbox', { name: 'Name' });
    await userEvent.click(canvas.getByRole('button', { name: 'Elsewhere' }));
    await expect(input).toBeInTheDocument();

    await userEvent.click(input);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Close from toolbar' })
    );
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Edit Name' })
    ).toHaveFocus();
  },
};

export const StableEditingTypography: Story = {
  render: () => (
    <div className="nx:grid nx:w-full nx:max-w-sm nx:gap-4">
      <Example activation="click" />
      <Example activation="pencil" />
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
      await userEvent.click(canvas.getByRole('button', { name: /^Edit Name/ }));
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
