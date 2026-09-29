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
import { MultiChoiceFilterExample } from './multi-choice-filter-example';
import exampleSource from './multi-choice-filter-example.tsx?raw';

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
const valueShape = `type MultiChoiceCondition =
  | { operator: 'isAnyOf' | 'isNoneOf'; values: string[] }
  | { operator: 'isEmpty' }
  | { operator: 'isNotEmpty' };`;
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
            Filter by several values from a list. Choices are a draft until you
            press Apply.
          </p>
          <h2>When to use it</h2>
          <p>
            Use it when a record can match any, or none, of several values and
            people want to review the set before results change. For one cheap
            choice, use ChoiceFilter.
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
              Apply emits the checked IDs, without duplicates. At least one is
              required.
            </li>
            <li>Checking a box only edits the draft.</li>
            <li>
              Changing between <em>is any of</em> and <em>is none of</em> keeps
              the values and emits immediately.
            </li>
            <li>
              <em>Is empty</em> and <em>is not empty</em> emit immediately.
            </li>
            <li>
              Switching from an empty operator waits for a checked value and
              Apply.
            </li>
            <li>
              Pressing × emits <code>null</code>.
            </li>
          </ul>
          <p>
            The block owns the open editor, the draft and a pending operator.
            Options loading while the editor is open do not close it or reset
            the draft. MultiChoiceEditor is also exported for use inside your
            own popover and Apply footer.
          </p>
          <h2>States and dismissal</h2>
          <p>
            Cancel, Escape and clicking outside discard the draft; nothing is
            emitted. Focus returns to the value you edited, to the operator when
            you backed out of a pending operator, and to Add after you remove
            the filter. Replacing the value from outside, or disabling the
            block, closes an unfinished editor without emitting. An open
            operator menu is not closed when the block is disabled. Unknown IDs
            stay visible as “(unavailable)” and can be unchecked.
          </p>
          <h3>Not applied</h3>
          <Canvas of={NotApplied} />
          <h3>Empty operator</h3>
          <Canvas of={EmptyOperator} />
          <h3>Unavailable value</h3>
          <Canvas of={UnavailableOption} />
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
              Copy <code>blocks/multi-choice-filter.tsx</code> and{' '}
              <code>filter-operator.tsx</code>, keeping the{' '}
              <code>recipes/filtering</code> layout.
            </li>
            <li>
              They need these Nexus component folders, including the ones those
              folders import: <code>button</code>, <code>button-group</code>,{' '}
              <code>checkbox</code>, <code>choice-row</code>,{' '}
              <code>dropdown-menu</code>, <code>filter-condition</code>,{' '}
              <code>filter-model</code>, <code>label</code>,{' '}
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
            Not supported: searching options and applying each checkbox
            immediately. The application decides how a record with several
            values matches.
          </p>
          <h2>Implementation</h2>
          <details>
            <summary>blocks/multi-choice-filter.tsx</summary>
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
  render: () => <MultiChoiceFilterExample />,
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
    await userEvent.click(trigger);
    await expect(
      await page.findByRole('checkbox', { name: 'Engineering' })
    ).not.toBeChecked();
    await userEvent.keyboard('{Escape}');
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
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Team: Design' })
      ).toBeEnabled()
    );
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
