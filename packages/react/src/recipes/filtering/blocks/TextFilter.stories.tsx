import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { IconLetterCase } from '@tabler/icons-react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  dispatchStoryEvent,
  expectEditorClosed,
  expectFocus,
  expectMenuClosed,
  ParentForm,
  useStoryEvent,
} from '../../../stories/support/filter-block-test-utils';
import operatorSource from '../filter-operator.tsx?raw';

import { type TextCondition, TextFilter } from './text-filter';
import blockSource from './text-filter.tsx?raw';
import { TextFilterExample } from './text-filter-example';
import exampleSource from './text-filter-example.tsx?raw';

const initial: TextCondition = { operator: 'contains', value: 'design' };
const replacement: TextCondition = {
  operator: 'contains',
  value: 'operations',
};
function Preview({
  initialValue = initial,
  disabled = false,
  onChange,
}: {
  initialValue?: TextCondition | null;
  disabled?: boolean;
  onChange?: (value: TextCondition | null) => void;
}) {
  const [value, setValue] = React.useState<TextCondition | null>(initialValue);
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: TextCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <section
      aria-label="TextFilter example"
      className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4"
    >
      <TextFilter
        label="Name"
        icon={<IconLetterCase aria-hidden="true" />}
        value={value}
        onChange={change}
        disabled={isDisabled}
      />
      <output
        aria-label="Applied condition"
        className="nx:max-w-full nx:break-all nx:typography-body-small nx:text-muted-foreground"
      >
        {JSON.stringify(value)}
      </output>
    </section>
  );
}
const valueShape = `type TextCondition =
  | { operator: 'contains' | 'is' | 'isNot' | 'startsWith'; value: string }
  | { operator: 'isEmpty' }
  | { operator: 'isNotEmpty' };`;
const meta = {
  title: 'Blocks/TextFilter',
  component: Preview,
  args: { onChange: fn() },
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { disable: true },
    docs: {
      page: () => (
        <>
          <Title />
          <p>
            Filter by text a record contains, starts with, or equals. The text
            is a draft until you press Apply.
          </p>
          <h2>When to use it</h2>
          <p>
            Use it for free-text fields such as names or titles. For a fixed set
            of values, use ChoiceFilter or MultiChoiceFilter.
          </p>
          <h2>Minimal composition</h2>
          <Canvas of={Default} />
          <Source code={exampleSource} language="tsx" />
          <h2>Value and changes</h2>
          <p>
            <code>value</code> is controlled: pass the current condition and
            update it in <code>onChange</code>. <code>null</code> means no
            filter.
          </p>
          <Source code={valueShape} language="tsx" />
          <ul>
            <li>
              Apply, or Enter in the field, emits the trimmed text. Blank text
              cannot be applied.
            </li>
            <li>
              Changing between text operators keeps the text and emits
              immediately.
            </li>
            <li>
              <em>Is empty</em> and <em>is not empty</em> emit immediately.
            </li>
            <li>Switching from an empty operator waits for text and Apply.</li>
            <li>
              Pressing × emits <code>null</code>.
            </li>
          </ul>
          <p>
            The block owns the open editor, the draft and a pending operator.
            Applying never submits a surrounding form.
          </p>
          <h2>States and dismissal</h2>
          <p>
            Cancel, Escape and clicking outside discard the draft; nothing is
            emitted. Focus returns to the value you edited, to the operator when
            you backed out of a pending operator, and to Add after you remove
            the filter. Replacing the value from outside, or disabling the
            block, closes an unfinished editor without emitting. An open
            operator menu is not closed when the block is disabled.
          </p>
          <h3>Not applied</h3>
          <Canvas of={NotApplied} />
          <h3>Empty operator</h3>
          <Canvas of={EmptyOperator} />
          <h3>Narrow container</h3>
          <Canvas of={NarrowContainer} />
          <h3>Disabled</h3>
          <Canvas of={Disabled} />
          <h2>Delivery</h2>
          <p>
            Manual guidance until the generated catalog lands (#798). This is
            copy-source, not a package export.
          </p>
          <ul>
            <li>
              Copy <code>blocks/text-filter.tsx</code> and{' '}
              <code>filter-operator.tsx</code>, keeping the{' '}
              <code>recipes/filtering</code> layout.
            </li>
            <li>
              They need these Nexus component folders, including the ones those
              folders import: <code>button</code>, <code>button-group</code>,{' '}
              <code>dropdown-menu</code>, <code>filter-condition</code>,{' '}
              <code>filter-model</code>, <code>input</code>, <code>label</code>,{' '}
              <code>overlay-layout</code>, <code>popover</code>,{' '}
              <code>spinner</code> and <code>lib/</code>. If your copy lives
              elsewhere, update the relative imports.
            </li>
            <li>
              No npm packages beyond those the Nexus components already use.
            </li>
            <li>
              Include the copied files in your Tailwind source scan and use the
              Nexus theme and styles setup.
            </li>
            <li>
              Your application owns the options and data, matching, fetching,
              loading and error states, and URL state. Lay several filters out
              with <code>blocks/applied-filters.tsx</code>.
            </li>
          </ul>
          <h2>Evidence and support boundary</h2>
          <p>The stories on this page test each behaviour above.</p>
          <p>
            Not supported: case sensitivity, normalization and query escaping.
            The application decides how text matches.
          </p>
          <h2>Implementation</h2>
          <details>
            <summary>blocks/text-filter.tsx</summary>
            <Source code={blockSource} language="tsx" />
          </details>
          <details>
            <summary>filter-operator.tsx — required shared helper</summary>
            <Source code={operatorSource} language="tsx" />
          </details>
          <p>
            <a href="/?path=/docs/patterns-filtering--docs" target="_top">
              See how this fits the Filtering pattern
            </a>
          </p>
        </>
      ),
    },
  },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => <TextFilterExample />,
  parameters: { docs: { source: { code: exampleSource } } },
};
export const NotApplied: Story = {
  render: () => <Preview initialValue={null} />,
};
export const EmptyOperator: Story = {
  render: () => <Preview initialValue={{ operator: 'isEmpty' }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Name operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'contains' })
    );
    await expect(await page.findByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'isEmpty'
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Change Name operator' })
      ).toHaveFocus()
    );
  },
};
export const Disabled: Story = {
  render: () => <Preview disabled />,
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole('button'))
      await expect(button).toBeDisabled();
  },
};
export const ApplyAndCancel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const before = canvas.getByLabelText('Applied condition').textContent ?? '';
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Name:/ }));
    await userEvent.clear(page.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(
      page.getByRole('textbox', { name: 'Name' }),
      'research'
    );
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Name:/ }));
    await userEvent.clear(page.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(
      page.getByRole('textbox', { name: 'Name' }),
      'research'
    );
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'research'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Name filter' })
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add name filter' })
      ).toHaveFocus()
    );
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'null'
    );
  },
};
export const NarrowContainer: Story = {
  render: () => (
    <div className="nx:w-64 nx:max-w-full">
      <Preview />
    </div>
  ),
};

export const IncompleteDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const before = canvas.getByLabelText('Applied condition').textContent ?? '';
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Name:/ }));
    await userEvent.clear(page.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(page.getByRole('textbox', { name: 'Name' }), '   ');
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /^Edit Name:/ })).toHaveFocus()
    );
  },
};
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add name filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by name' })
    );
    await expect(editor.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.type(
      editor.getByRole('textbox', { name: 'Name' }),
      ' ops '
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'contains',
      value: 'ops',
    });
    await expectEditorClosed(canvasElement, 'Filter by name');
  },
};
export const OperatorKeepsValue: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Name operator',
      })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'is' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'is',
      value: 'design',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const ValuelessOperatorCommits: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Name operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is empty' })
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isEmpty',
    });
    await expect(
      canvas.queryByRole('button', { name: /^Edit Name/ })
    ).not.toBeInTheDocument();
    await expectMenuClosed(canvasElement);
  },
};
export const PendingOperatorApplies: Story = {
  render: (args) => (
    <Preview initialValue={{ operator: 'isEmpty' }} onChange={args.onChange} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Name operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'starts with' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by name' })
    );
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.type(editor.getByRole('textbox', { name: 'Name' }), 'Ma');
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'startsWith',
      value: 'Ma',
    });
  },
};
export const DismissDiscardsDraft: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Edit Name: design' });
    await userEvent.click(trigger);
    let input = await page.findByRole('textbox', { name: 'Name' });
    await userEvent.type(input, ' draft');
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by name');
    await expectFocus(trigger);
    await userEvent.click(trigger);
    input = await page.findByRole('textbox', { name: 'Name' });
    await expect(input).toHaveValue('design');
    await userEvent.type(input, ' draft');
    await userEvent.click(canvas.getByLabelText('Applied condition'));
    await expectEditorClosed(canvasElement, 'Filter by name');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Name: design' })
    );
    await userEvent.type(
      await page.findByRole('textbox', { name: 'Name' }),
      ' draft'
    );
    dispatchStoryEvent('story:replace');
    await expectEditorClosed(canvasElement, 'Filter by name');
    await expect(
      canvas.getByRole('button', { name: 'Edit Name: operations' })
    ).toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const DisabledWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Name: design' })
    );
    await userEvent.type(
      await page.findByRole('textbox', { name: 'Name' }),
      ' draft'
    );
    dispatchStoryEvent('story:toggle-disabled');
    await expectEditorClosed(canvasElement, 'Filter by name');
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Name: design' })
      ).toBeEnabled()
    );
    await expect(
      page.queryByRole('dialog', { name: 'Filter by name' })
    ).not.toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const InsideParentForm: Story = {
  render: (args) => (
    <ParentForm>
      <Preview onChange={args.onChange} />
    </ParentForm>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Name: design' })
    );
    const input = await page.findByRole('textbox', { name: 'Name' });
    await userEvent.clear(input);
    await userEvent.type(input, 'Updated{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'contains',
      value: 'Updated',
    });
    await expect(canvas.getByLabelText('Parent submissions')).toHaveTextContent(
      '0'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Submit search' })
    );
    await expect(canvas.getByLabelText('Parent submissions')).toHaveTextContent(
      '1'
    );
  },
};
