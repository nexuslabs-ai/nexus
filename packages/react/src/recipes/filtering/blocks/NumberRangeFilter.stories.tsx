import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
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

import {
  type NumberRangeCondition,
  NumberRangeFilter,
} from './number-range-filter';
import blockSource from './number-range-filter.tsx?raw';
import { NumberRangeFilterExample } from './number-range-filter-example';
import exampleSource from './number-range-filter-example.tsx?raw';

const replacement: NumberRangeCondition = {
  operator: 'between',
  min: 1,
  max: 2,
};
function Preview({
  initialValue = { operator: 'between', min: 100, max: 500 },
  disabled = false,
  lowerBound = 0,
  onChange,
}: {
  initialValue?: NumberRangeCondition | null;
  disabled?: boolean;
  lowerBound?: number;
  onChange?: (value: NumberRangeCondition | null) => void;
}) {
  const [value, setValue] = React.useState<NumberRangeCondition | null>(
    initialValue
  );
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: NumberRangeCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <div className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4">
      <NumberRangeFilter
        label="Size"
        value={value}
        onChange={change}
        disabled={isDisabled}
        unit="KB"
        lowerBound={lowerBound}
      />
      <p
        role="status"
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        {value
          ? 'A filter is applied. Edit a segment or remove it with ×.'
          : 'No filter applied. Add a condition to begin.'}
      </p>
    </div>
  );
}

const valueShape = `type NumberRangeCondition =
  | { operator: 'between'; min: number; max: number }
  | { operator: 'isEmpty' }
  | { operator: 'isNotEmpty' };`;
const meta = {
  title: 'Blocks/NumberRangeFilter',
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
            Filter by a number between a minimum and a maximum. The range is a
            draft until you press Apply.
          </p>
          <h2>When to use it</h2>
          <p>
            Use it when both ends matter, such as a size or price band. For a
            single threshold, use NumberComparisonFilter.
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
              Apply, or Enter in a field, emits both ends together. Both are
              required, finite and ordered; signed decimals work.
            </li>
            <li>
              Optional <code>lowerBound</code> and <code>upperBound</code> limit
              the range. <code>unit</code> is display text only.
            </li>
            <li>
              An error appears only when both ends are filled and the range is
              wrong.
            </li>
            <li>
              <em>Is empty</em> and <em>is not empty</em> emit immediately.
            </li>
            <li>
              Switching from an empty operator to <em>is between</em> waits for
              a valid range and Apply.
            </li>
            <li>
              Pressing × emits <code>null</code>.
            </li>
          </ul>
          <p>
            The block owns the open editor, the draft and a pending operator.
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
          <h3>Disabled</h3>
          <Canvas of={Disabled} />
          <h2>Delivery</h2>
          <p>
            Manual guidance until the generated catalog lands (#798). This is
            copy-source, not a package export.
          </p>
          <ul>
            <li>
              Copy <code>blocks/number-range-filter.tsx</code> and{' '}
              <code>filter-operator.tsx</code>, keeping the{' '}
              <code>recipes/filtering</code> layout.
            </li>
            <li>
              They need these Nexus component folders, including the ones those
              folders import: <code>button</code>, <code>button-group</code>,{' '}
              <code>dropdown-menu</code>, <code>filter-condition</code>,{' '}
              <code>input</code>, <code>label</code>,{' '}
              <code>overlay-layout</code>, <code>popover</code>,{' '}
              <code>separator</code>, <code>spinner</code> and <code>lib/</code>
              . If your copy lives elsewhere, update the relative imports.
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
            Not supported: unit conversion and open-ended ranges. The
            application decides whether the ends are inclusive.
          </p>
          <h2>Implementation</h2>
          <details>
            <summary>blocks/number-range-filter.tsx</summary>
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
  tags: ['docs'],
  render: () => <NumberRangeFilterExample />,
  parameters: { docs: { source: { code: exampleSource } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Size filter' })
    );
    await expect(
      canvas.getByRole('button', { name: 'Add size filter' })
    ).toHaveFocus();
  },
};
export const NotApplied: Story = {
  render: () => <Preview initialValue={null} />,
};
export const EmptyOperator: Story = {
  render: () => <Preview initialValue={{ operator: 'isEmpty' }} />,
};
export const Disabled: Story = {
  render: () => <Preview disabled />,
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole('button'))
      await expect(button).toBeDisabled();
  },
};
export const PendingOperator: Story = {
  render: () => <Preview initialValue={{ operator: 'isEmpty' }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const operator = canvas.getByRole('button', {
      name: 'Change Size operator',
    });
    await userEvent.click(operator);
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is between' })
    );
    await expect(
      await page.findByRole('dialog', { name: 'Filter by size' })
    ).toBeVisible();
    await expect(operator).toHaveTextContent('is between');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        page.queryByRole('dialog', { name: 'Filter by size' })
      ).not.toBeInTheDocument()
    );
    await expect(operator).toHaveTextContent('is empty');
    await waitFor(() => expect(operator).toHaveFocus());
  },
};
export const ErrorOnlyForWrongRange: Story = {
  render: () => <Preview initialValue={null} />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add size filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    const minimum = editor.getByRole('spinbutton', { name: 'Minimum' });
    const maximum = editor.getByRole('spinbutton', { name: 'Maximum' });
    const apply = editor.getByRole('button', { name: 'Apply' });
    await expect(minimum).toHaveAccessibleDescription('');
    await expect(minimum).toHaveAttribute('aria-invalid', 'false');
    await expect(apply).toBeDisabled();
    await userEvent.type(minimum, '10');
    await expect(minimum).toHaveAccessibleDescription('');
    await expect(minimum).toHaveAttribute('aria-invalid', 'false');
    await expect(apply).toBeDisabled();
    await userEvent.type(maximum, '5');
    await expect(minimum).toHaveAccessibleDescription(
      'Enter an ordered range from 0.'
    );
    await expect(minimum).toHaveAttribute('aria-invalid', 'true');
    await expect(maximum).toHaveAttribute('aria-invalid', 'true');
    await expect(apply).toBeDisabled();
  },
};
export const ReapplySameRange: Story = {
  render: () => <Preview />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const operator = canvas.getByRole('button', {
      name: 'Change Size operator',
    });
    await userEvent.click(operator);
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is between' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await waitFor(() =>
      expect(
        page.queryByRole('dialog', { name: 'Filter by size' })
      ).not.toBeInTheDocument()
    );
    await userEvent.click(operator);
    await expect(
      await page.findByRole('menuitemradio', { name: 'is between' })
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(operator).toHaveFocus());
    await expect(
      page.queryByRole('dialog', { name: 'Filter by size' })
    ).not.toBeInTheDocument();
  },
};
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add size filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Minimum' }),
      '5'
    );
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Maximum' }),
      '50'
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'between',
      min: 5,
      max: 50,
    });
    await expectEditorClosed(canvasElement, 'Filter by size');
  },
};
export const SignedDecimalsAndCancel: Story = {
  render: (args) => (
    <Preview
      lowerBound={-100}
      initialValue={{ operator: 'between', min: -10.5, max: 12.5 }}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Edit Size: -10.5–12.5 KB',
    });
    await userEvent.click(trigger);
    let editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    await userEvent.clear(editor.getByRole('spinbutton', { name: 'Minimum' }));
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Minimum' }),
      '-25.5'
    );
    await userEvent.click(editor.getByRole('button', { name: 'Cancel' }));
    await expectEditorClosed(canvasElement, 'Filter by size');
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(trigger);
    editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    await expect(
      editor.getByRole('spinbutton', { name: 'Minimum' })
    ).toHaveValue(-10.5);
    await userEvent.clear(editor.getByRole('spinbutton', { name: 'Maximum' }));
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Maximum' }),
      '-20'
    );
    await expect(editor.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.clear(editor.getByRole('spinbutton', { name: 'Minimum' }));
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Minimum' }),
      '-25.5'
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'between',
      min: -25.5,
      max: -20,
    });
  },
};
export const ValuelessOperatorCommits: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Size operator',
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is empty' })
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isEmpty',
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
        name: 'Change Size operator',
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is between' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Minimum' }),
      '1'
    );
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Maximum' }),
      '5'
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'between',
      min: 1,
      max: 5,
    });
  },
};
export const DismissDiscardsDraft: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Edit Size: 100–500 KB',
    });
    await userEvent.click(trigger);
    let minimum = await page.findByRole('spinbutton', { name: 'Minimum' });
    await userEvent.type(minimum, '9');
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by size');
    await expectFocus(trigger);
    await userEvent.click(trigger);
    minimum = await page.findByRole('spinbutton', { name: 'Minimum' });
    await expect(minimum).toHaveValue(100);
    await userEvent.type(minimum, '9');
    await userEvent.click(
      canvas.getByText(/A filter is applied|No filter applied/)
    );
    await expectEditorClosed(canvasElement, 'Filter by size');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Size: 100–500 KB' })
    );
    await userEvent.type(
      await page.findByRole('spinbutton', { name: 'Minimum' }),
      '9'
    );
    dispatchStoryEvent('story:replace');
    await expectEditorClosed(canvasElement, 'Filter by size');
    await expect(
      canvas.getByRole('button', { name: 'Edit Size: 1–2 KB' })
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
      canvas.getByRole('button', { name: 'Edit Size: 100–500 KB' })
    );
    await userEvent.type(
      await page.findByRole('spinbutton', { name: 'Minimum' }),
      '9'
    );
    dispatchStoryEvent('story:toggle-disabled');
    await expectEditorClosed(canvasElement, 'Filter by size');
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Size: 100–500 KB' })
      ).toBeEnabled()
    );
    await expect(
      page.queryByRole('dialog', { name: 'Filter by size' })
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
      canvas.getByRole('button', { name: 'Edit Size: 100–500 KB' })
    );
    const maximum = await page.findByRole('spinbutton', { name: 'Maximum' });
    await userEvent.clear(maximum);
    await userEvent.type(maximum, '800{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'between',
      min: 100,
      max: 800,
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
