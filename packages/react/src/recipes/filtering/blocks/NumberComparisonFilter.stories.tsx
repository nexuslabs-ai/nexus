import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { IconHash } from '@tabler/icons-react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  DialogHost,
  dispatchStoryEvent,
  expectEditorClosed,
  expectFocus,
  expectMenuClosed,
  ParentForm,
  useStoryEvent,
} from '../../../stories/support/filter-block-test-utils';
import operatorSource from '../filter-operator.tsx?raw';

import {
  type NumberComparisonCondition,
  NumberComparisonFilter,
} from './number-comparison-filter';
import blockSource from './number-comparison-filter.tsx?raw';

const initial: NumberComparisonCondition = {
  operator: 'greaterThan',
  value: 500,
};
const replacement: NumberComparisonCondition = {
  operator: 'greaterThan',
  value: 100,
};
function Preview({
  initialValue = initial,
  disabled = false,
  onChange,
}: {
  initialValue?: NumberComparisonCondition | null;
  disabled?: boolean;
  onChange?: (value: NumberComparisonCondition | null) => void;
}) {
  const [value, setValue] = React.useState<NumberComparisonCondition | null>(
    initialValue
  );
  const [upperBound, setUpperBound] = React.useState<number>();
  useStoryEvent('story:tighten-bounds', () => setUpperBound(1000));
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: NumberComparisonCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <section
      aria-label="NumberComparisonFilter example"
      className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4"
    >
      <NumberComparisonFilter
        label="Amount"
        icon={<IconHash aria-hidden="true" />}
        value={value}
        onChange={change}
        disabled={isDisabled}
        upperBound={upperBound}
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
const usage =
  "import { useState } from 'react';\nimport { NumberComparisonFilter, type NumberComparisonCondition } from './blocks/number-comparison-filter';\n\nexport function Example() {\n const [value, setValue] = useState<NumberComparisonCondition | null>({ operator: 'greaterThan', value: 500 });\n return <NumberComparisonFilter label=\"Amount\" value={value} onChange={setValue}  />;\n}";
const valueShape = `type NumberComparisonCondition =
  | { operator: 'is' | 'isNot' | 'greaterThan' | 'lessThan'; value: number }
  | { operator: 'isEmpty' }
  | { operator: 'isNotEmpty' };`;
const meta = {
  title: 'Blocks/NumberComparisonFilter',
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
            Compare one number: equals, not equals, greater than or less than.
            The number is a draft until you press Apply.
          </p>
          <h2>When to use it</h2>
          <p>
            Use it for a single threshold such as an amount or a count. For a
            range with both ends, use NumberRangeFilter.
          </p>
          <h2>Minimal composition</h2>
          <Canvas of={Default} />
          <Source code={usage} language="tsx" />
          <h2>Value and changes</h2>
          <p>
            <code>value</code> is controlled: pass the current condition and
            update it in <code>onChange</code>. <code>null</code> means no
            filter.
          </p>
          <Source code={valueShape} language="tsx" />
          <ul>
            <li>
              Apply, or Enter in the field, emits a finite number. Zero,
              negatives and decimals work.
            </li>
            <li>
              Optional <code>lowerBound</code> and <code>upperBound</code> are
              inclusive; a value outside them cannot be applied.{' '}
              <code>unit</code> is display text only.
            </li>
            <li>
              Changing between comparison operators keeps the value and emits
              immediately.
            </li>
            <li>
              <em>Is empty</em> and <em>is not empty</em> emit immediately.
            </li>
            <li>
              Switching from an empty operator waits for a number and Apply.
            </li>
            <li>
              Pressing × emits <code>null</code>.
            </li>
          </ul>
          <p>
            The block owns the open editor, the draft and a pending operator.
            Bounds changing while the editor is open do not close it; the draft
            is re-checked against the new bounds.
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
              Copy <code>blocks/number-comparison-filter.tsx</code>,{' '}
              <code>filter-operator.tsx</code>, keeping the
              <code>recipes/filtering</code> layout.
            </li>
            <li>
              They import these Nexus component folders, which you need too:
              <code>button</code>, <code>dropdown-menu</code>,{' '}
              <code>filter-builder</code>, <code>filter-condition</code>,{' '}
              <code>input</code>, <code>label</code>, <code>popover</code>. If
              your copy lives elsewhere, update the relative imports.
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
          <p>
            Each behaviour above is tested on this page:{' '}
            <code>AddFromNothing</code>, <code>ApplyAndCancel</code>,{' '}
            <code>IncompleteDraft</code>, <code>DismissDiscardsDraft</code>,{' '}
            <code>OperatorKeepsValue</code>,{' '}
            <code>ValuelessOperatorCommits</code>,{' '}
            <code>PendingOperatorApplies</code>,{' '}
            <code>BoundsChangeWhileOpen</code>,{' '}
            <code>ExternalReplaceWhileOpen</code>,{' '}
            <code>DisabledWhileOpen</code>, <code>InsideParentForm</code>,{' '}
            <code>InsideDialog</code>, <code>Disabled</code>.
          </p>
          <p>
            Not supported: unit conversion and currency formatting. The
            application decides how the comparison matches.
          </p>
          <h2>Implementation</h2>
          <details>
            <summary>blocks/number-comparison-filter.tsx</summary>
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
export const Default: Story = { render: () => <Preview /> };
export const NotApplied: Story = {
  render: () => <Preview initialValue={null} />,
};
export const EmptyOperator: Story = {
  render: () => <Preview initialValue={{ operator: 'isEmpty' }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Amount operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is greater than' })
    );
    await expect(await page.findByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'isEmpty'
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Change Amount operator' })
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
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Amount:/ })
    );
    await userEvent.clear(page.getByRole('spinbutton', { name: 'Amount' }));
    await userEvent.type(
      page.getByRole('spinbutton', { name: 'Amount' }),
      '-12.5'
    );
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Amount:/ })
    );
    await userEvent.clear(page.getByRole('spinbutton', { name: 'Amount' }));
    await userEvent.type(
      page.getByRole('spinbutton', { name: 'Amount' }),
      '-12.5'
    );
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      '-12.5'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Amount filter' })
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add amount filter' })
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const value = canvas.getByRole('button', { name: /^Edit Amount:/ });
    const remove = canvas.getByRole('button', { name: 'Remove Amount filter' });
    const root = value.closest('[data-slot="filter-condition"]')!;
    const bounds = root.getBoundingClientRect();
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
    for (const button of [value, remove]) {
      await expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(
        bounds.right + 1
      );
    }
    await userEvent.click(value);
    await expect(
      within(canvasElement.ownerDocument.body).getByRole('spinbutton', {
        name: 'Amount',
      })
    ).toHaveValue(500);
    await userEvent.keyboard('{Escape}');
  },
};

export const IncompleteDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const before = canvas.getByLabelText('Applied condition').textContent ?? '';
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Amount:/ })
    );
    await userEvent.clear(page.getByRole('spinbutton', { name: 'Amount' }));
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: /^Edit Amount:/ })
      ).toHaveFocus()
    );
  },
};
export const BoundsChangeWhileOpen: Story = {
  render: () => <Preview />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Edit Amount: 500' })
    );
    const dialog = await page.findByRole('dialog', {
      name: 'Filter by amount',
    });
    const editor = within(dialog);
    const input = editor.getByRole('spinbutton', { name: 'Amount' });
    await userEvent.clear(input);
    await userEvent.type(input, '750');
    dispatchStoryEvent('story:tighten-bounds');
    await expect(
      await editor.findByText('Allowed range: no minimum to 1000.')
    ).toBeVisible();
    await expect(dialog).toHaveAttribute('data-state', 'open');
    await expect(input).toHaveValue(750);
  },
};
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add amount filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by amount' })
    );
    await expect(editor.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Amount' }),
      '0'
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'greaterThan',
      value: 0,
    });
    await expectEditorClosed(canvasElement, 'Filter by amount');
  },
};
export const OperatorKeepsValue: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Amount operator',
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is less than' })
    );
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'lessThan',
      value: 500,
    });
    await expectMenuClosed(canvasElement);
  },
};
export const ValuelessOperatorCommits: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Amount operator',
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is not empty' })
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isNotEmpty',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const PendingOperatorApplies: Story = {
  render: (args) => (
    <Preview initialValue={{ operator: 'isEmpty' }} onChange={args.onChange} />
  ),
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Amount operator',
      })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'is not' }));
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by amount' })
    );
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Amount' }),
      '-7.5'
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isNot',
      value: -7.5,
    });
  },
};
export const DismissDiscardsDraft: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Edit Amount: 500' });
    await userEvent.click(trigger);
    let input = await page.findByRole('spinbutton', { name: 'Amount' });
    await userEvent.type(input, '9');
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by amount');
    await expectFocus(trigger);
    await userEvent.click(trigger);
    input = await page.findByRole('spinbutton', { name: 'Amount' });
    await expect(input).toHaveValue(500);
    await userEvent.type(input, '9');
    await userEvent.click(canvas.getByLabelText('Applied condition'));
    await expectEditorClosed(canvasElement, 'Filter by amount');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Amount: 500' })
    );
    await userEvent.type(
      await page.findByRole('spinbutton', { name: 'Amount' }),
      '9'
    );
    dispatchStoryEvent('story:replace');
    await expectEditorClosed(canvasElement, 'Filter by amount');
    await expect(
      canvas.getByRole('button', { name: 'Edit Amount: 100' })
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
      canvas.getByRole('button', { name: 'Edit Amount: 500' })
    );
    await userEvent.type(
      await page.findByRole('spinbutton', { name: 'Amount' }),
      '9'
    );
    dispatchStoryEvent('story:toggle-disabled');
    await expectEditorClosed(canvasElement, 'Filter by amount');
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() => expect(canvas.getAllByRole('button')[0]).toBeEnabled());
    await expect(
      page.queryByRole('dialog', { name: 'Filter by amount' })
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
      canvas.getByRole('button', { name: 'Edit Amount: 500' })
    );
    const input = await page.findByRole('spinbutton', { name: 'Amount' });
    await userEvent.clear(input);
    await userEvent.type(input, '42{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'greaterThan',
      value: 42,
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
export const InsideDialog: Story = {
  render: (args) => (
    <DialogHost>
      <Preview onChange={args.onChange} />
    </DialogHost>
  ),
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Open filter settings',
      })
    );
    const host = await page.findByRole('dialog', { name: 'Filter settings' });
    await expect(host).toBeVisible();
    const trigger = within(host).getByRole('button', {
      name: 'Edit Amount: 500',
    });
    await userEvent.click(trigger);
    await expect(
      await page.findByRole('dialog', { name: 'Filter by amount' })
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by amount');
    await expect(host).toHaveAttribute('data-state', 'open');
    await expectFocus(trigger);
    await userEvent.click(trigger);
    await expect(
      await page.findByRole('dialog', { name: 'Filter by amount' })
    ).toBeVisible();
    await userEvent.click(
      within(host).getByRole('heading', { name: 'Filter settings' })
    );
    await expectEditorClosed(canvasElement, 'Filter by amount');
    await expect(host).toHaveAttribute('data-state', 'open');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(host).toHaveAttribute('data-state', 'closed'));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
