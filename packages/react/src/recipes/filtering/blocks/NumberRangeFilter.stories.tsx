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

const usage =
  "import { useState } from 'react';\nimport {\n  NumberRangeFilter,\n  type NumberRangeCondition,\n} from './blocks/number-range-filter';\n\nexport function Example() {\n  const [value, setValue] = useState<NumberRangeCondition | null>({\n    operator: 'between',\n    min: 100,\n    max: 500,\n  });\n  return (\n    <NumberRangeFilter\n      label=\"Size\"\n      value={value}\n      onChange={setValue}\n      unit=\"KB\"\n      lowerBound={0}\n    />\n  );\n}\n";
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
            Edit two bounds as a draft. Apply commits them together; Cancel,
            Escape and outside dismissal discard edits.
          </p>
          <Canvas of={Default} />
          <p>
            Built from FilterConditionField, FilterConditionSegment and
            FilterConditionRemove: the shared field / operator / value / ×
            structure. This block adds minimum/maximum inputs, validation and
            Apply/Cancel.
            <a
              href="/?path=/docs/components-filtercondition--docs"
              target="_top"
            >
              {' '}
              See the shared anatomy.
            </a>
          </p>
          <h2>Use this block</h2>
          <p>
            This is copy-source code, not a package export. Copy{' '}
            <code>blocks/number-range-filter.tsx</code> and{' '}
            <code>filter-operator.tsx</code> from{' '}
            <code>packages/react/src/recipes/filtering</code>. Preserve their
            relative paths. The block imports its components from{' '}
            <code>@nexus_ds/react</code>.
          </p>
          <Source code={usage} language="tsx" />
          <h2>What your application owns</h2>
          <p>
            Pass the current condition as value and update it in onChange. Null
            means no filter. Your application supplies data, matching rules,
            fetching and URL state. Include the copied files in Tailwind
            scanning and use the existing Nexus theme and styles setup.
          </p>
          <p>
            Bounds must be finite and ordered. Signed decimals work by default;
            lowerBound and upperBound are optional limits. Unit is display text.
            Returning from an empty operator asks for valid bounds before
            committing.
          </p>
          <h2>States</h2>
          <h3>Not applied</h3>
          <Canvas of={NotApplied} />
          <h3>Empty operator</h3>
          <Canvas of={EmptyOperator} />
          <h3>Disabled</h3>
          <Canvas of={Disabled} />
          <h2>Copy the implementation</h2>
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
  render: () => <Preview />,
  parameters: { docs: { source: { code: usage } } },
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
    await waitFor(() => expect(canvas.getAllByRole('button')[0]).toBeEnabled());
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
