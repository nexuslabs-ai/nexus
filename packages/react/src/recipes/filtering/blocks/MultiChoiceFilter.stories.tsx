import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { IconUsers } from '@tabler/icons-react';
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
  type MultiChoiceCondition,
  MultiChoiceFilter,
} from './multi-choice-filter';
import blockSource from './multi-choice-filter.tsx?raw';

const initial: MultiChoiceCondition = {
  operator: 'isAnyOf',
  values: ['design'],
};
const replacement: MultiChoiceCondition = {
  operator: 'isAnyOf',
  values: ['engineering'],
};
function Preview({
  initialValue = initial,
  disabled = false,
  onChange,
}: {
  initialValue?: MultiChoiceCondition | null;
  disabled?: boolean;
  onChange?: (value: MultiChoiceCondition | null) => void;
}) {
  const [value, setValue] = React.useState<MultiChoiceCondition | null>(
    initialValue
  );
  const [options, setOptions] = React.useState([
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'operations', label: 'Operations', disabled: true },
  ]);
  useStoryEvent('story:load-options', () =>
    setOptions((current) => [
      ...current,
      { value: 'research', label: 'Research' },
    ])
  );
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: MultiChoiceCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <section
      aria-label="MultiChoiceFilter example"
      className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4"
    >
      <MultiChoiceFilter
        label="Team"
        icon={<IconUsers aria-hidden="true" />}
        value={value}
        onChange={change}
        disabled={isDisabled}
        options={options}
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
  'import { useState } from \'react\';\nimport { MultiChoiceFilter, type MultiChoiceCondition } from \'./blocks/multi-choice-filter\';\n\nexport function Example() {\n const [value, setValue] = useState<MultiChoiceCondition | null>({ operator: \'isAnyOf\', values: [\'design\'] });\n return <MultiChoiceFilter label="Team" value={value} onChange={setValue} options={[{ value: "design", label: "Design" }, { value: "engineering", label: "Engineering" }, { value: "operations", label: "Operations", disabled: true }]} />;\n}';
const meta = {
  title: 'Blocks/MultiChoiceFilter',
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
            Choose several options. Changes stay in the editor until Apply. An
            empty selection cannot be applied; remove the filter to allow all
            values.
          </p>
          <Canvas of={Default} />
          <h2>Use this block</h2>
          <p>
            Copy blocks/multi-choice-filter.tsx and filter-operator.tsx from
            packages/react/src/recipes/filtering, keeping their relative paths.
            The block imports Nexus components from @nexus_ds/react. Include the
            copied files in your Tailwind source scan and use the Nexus theme
            setup.
          </p>
          <Source code={usage} language="tsx" />
          <h2>Choose who owns Apply</h2>
          <p>
            MultiChoiceFilter is the standalone draft composition. The same file
            exports MultiChoiceEditor, a controlled checklist without a popover
            or footer. Connect that editor to applied state for live filtering,
            or a panel draft for one shared Apply. An empty editor selection is
            valid; its owner decides whether that means no condition.
          </p>
          <p>
            <a href="/?path=/docs/patterns-filtering--docs" target="_top">
              See individual filters with Apply
            </a>
          </p>
          <h2>State and behavior</h2>
          <p>
            Pass the updated value back through onChange. Null means no
            condition. Operator changes with an existing value apply
            immediately; returning from an empty operator opens an editor and
            commits only on Apply. Cancel, Escape and outside dismissal discard
            drafts. External value changes close an unfinished editor. Removing
            restores focus to the Add button.
          </p>
          <p>
            This uses the same FilterCondition field / operator / value / remove
            parts as ChoiceFilter and NumberRangeFilter. Your application
            supplies matching logic, data requests, URL persistence and
            pagination. The JSON output below the example is for inspecting the
            emitted condition, not product UI.
          </p>
          <h2>States</h2>
          <Canvas of={NotApplied} />
          <Canvas of={EmptyOperator} />
          <Canvas of={Disabled} />
          <h2>Copy implementation</h2>
          <details>
            <summary>blocks/multi-choice-filter.tsx</summary>
            <Source code={blockSource} language="tsx" />
          </details>
          <details>
            <summary>filter-operator.tsx — required helper</summary>
            <Source code={operatorSource} language="tsx" />
          </details>
          <p>
            <a href="/?path=/docs/patterns-filtering--docs" target="_top">
              Filtering pattern
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
      canvas.getByRole('button', { name: 'Change Team operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is any of' })
    );
    await expect(await page.findByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'isEmpty'
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Change Team operator' })
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
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Team:/ }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Engineering' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Team:/ }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Engineering' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      '"engineering"'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Team filter' })
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add team filter' })
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
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Team:/ }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Design' }));
    await expect(
      page.getByRole('checkbox', { name: 'Operations' })
    ).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /^Edit Team:/ })).toHaveFocus()
    );
  },
};

export const OutsideDismissal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const output = canvas.getByLabelText('Applied condition');
    const before = output.textContent ?? '';
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Team:/ }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Engineering' }));
    await userEvent.click(output);
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await expect(output).toHaveTextContent(before);
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Team:/ }));
    await expect(
      page.getByRole('checkbox', { name: 'Engineering' })
    ).not.toBeChecked();
    await userEvent.keyboard('{Escape}');
  },
};
export const UnavailableOption: Story = {
  render: () => (
    <Preview
      initialValue={{ operator: 'isAnyOf', values: ['design', 'retired-id'] }}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', {
        name: 'Edit Team: Design, retired-id (unavailable)',
      })
    ).toBeInTheDocument();
  },
};
export const OptionsLoadWhileOpen: Story = {
  render: () => <Preview />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Edit Team: Design' })
    );
    const dialog = await page.findByRole('dialog', { name: 'Filter by team' });
    const editor = within(dialog);
    await userEvent.click(
      editor.getByRole('checkbox', { name: 'Engineering' })
    );
    dispatchStoryEvent('story:load-options');
    await expect(
      await editor.findByRole('checkbox', { name: 'Research' })
    ).toBeVisible();
    await expect(dialog).toHaveAttribute('data-state', 'open');
    await expect(
      editor.getByRole('checkbox', { name: 'Engineering' })
    ).toBeChecked();
  },
};
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add team filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by team' })
    );
    await expect(editor.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await expect(
      editor.getByRole('checkbox', { name: 'Operations' })
    ).toBeDisabled();
    await userEvent.click(editor.getByRole('checkbox', { name: 'Design' }));
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isAnyOf',
      values: ['design'],
    });
    await expectEditorClosed(canvasElement, 'Filter by team');
  },
};
export const OperatorKeepsValue: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Team operator',
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is none of' })
    );
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isNoneOf',
      values: ['design'],
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
        name: 'Change Team operator',
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
        name: 'Change Team operator',
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is none of' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by team' })
    );
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(
      editor.getByRole('checkbox', { name: 'Engineering' })
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isNoneOf',
      values: ['engineering'],
    });
  },
};
export const DismissDiscardsDraft: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Edit Team: Design' });
    await userEvent.click(trigger);
    await userEvent.click(
      await page.findByRole('checkbox', { name: 'Engineering' })
    );
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by team');
    await expectFocus(trigger);
    await userEvent.click(trigger);
    await expect(
      await page.findByRole('checkbox', { name: 'Engineering' })
    ).not.toBeChecked();
    await userEvent.click(page.getByRole('checkbox', { name: 'Engineering' }));
    await userEvent.click(canvas.getByLabelText('Applied condition'));
    await expectEditorClosed(canvasElement, 'Filter by team');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Team: Design' })
    );
    await userEvent.click(
      await page.findByRole('checkbox', { name: 'Engineering' })
    );
    dispatchStoryEvent('story:replace');
    await expectEditorClosed(canvasElement, 'Filter by team');
    await expect(
      canvas.getByRole('button', { name: 'Edit Team: Engineering' })
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
      canvas.getByRole('button', { name: 'Edit Team: Design' })
    );
    await userEvent.click(
      await page.findByRole('checkbox', { name: 'Engineering' })
    );
    dispatchStoryEvent('story:toggle-disabled');
    await expectEditorClosed(canvasElement, 'Filter by team');
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() => expect(canvas.getAllByRole('button')[0]).toBeEnabled());
    await expect(
      page.queryByRole('dialog', { name: 'Filter by team' })
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
      canvas.getByRole('button', { name: 'Edit Team: Design' })
    );
    await userEvent.click(
      await page.findByRole('checkbox', { name: 'Engineering' })
    );
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isAnyOf',
      values: ['design', 'engineering'],
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
