import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { IconCalendar } from '@tabler/icons-react';
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

import { type DateRangeCondition, DateRangeFilter } from './date-range-filter';
import blockSource from './date-range-filter.tsx?raw';

const initial: DateRangeCondition = {
  operator: 'between',
  from: new Date(2026, 8, 1),
  to: new Date(2026, 8, 10),
};
const replacement: DateRangeCondition = {
  operator: 'between',
  from: new Date(2026, 8, 2),
  to: new Date(2026, 8, 3),
};
function Preview({
  initialValue = initial,
  disabled = false,
  onChange,
}: {
  initialValue?: DateRangeCondition | null;
  disabled?: boolean;
  onChange?: (value: DateRangeCondition | null) => void;
}) {
  const [value, setValue] = React.useState<DateRangeCondition | null>(
    initialValue
  );
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: DateRangeCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <section
      aria-label="DateRangeFilter example"
      className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4"
    >
      <DateRangeFilter
        label="Created"
        icon={<IconCalendar aria-hidden="true" />}
        value={value}
        onChange={change}
        disabled={isDisabled}
        today={new Date(2026, 8, 27)}
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
  "import { useState } from 'react';\nimport { DateRangeFilter, type DateRangeCondition } from './blocks/date-range-filter';\n\nexport function Example() {\n const [value, setValue] = useState<DateRangeCondition | null>({ operator: 'between', from: new Date(2026, 8, 1), to: new Date(2026, 8, 10) });\n return <DateRangeFilter label=\"Created\" value={value} onChange={setValue} />;\n}";
const meta = {
  title: 'Blocks/DateRangeFilter',
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
            Choose dates or a Today / Last 7 days preset, then Apply. Presets
            include today and resolve to fixed dates when applied. Values are
            local calendar Date objects; the application owns timezone
            conversion and inclusive end-date query semantics.
          </p>
          <Canvas of={Default} />
          <h2>Use this block</h2>
          <p>
            Copy blocks/date-range-filter.tsx and filter-operator.tsx from
            packages/react/src/recipes/filtering, keeping their relative paths.
            The block imports Nexus components from @nexus_ds/react. Include the
            copied files in your Tailwind source scan and use the Nexus theme
            setup.
          </p>
          <Source code={usage} language="tsx" />
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
            <summary>blocks/date-range-filter.tsx</summary>
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
      canvas.getByRole('button', { name: 'Change Created operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is between' })
    );
    await expect(await page.findByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'isEmpty'
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Change Created operator' })
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
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(page.getByRole('button', { name: 'Last 7 days' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(page.getByRole('button', { name: 'Last 7 days' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(
      canvas.getByLabelText('Applied condition')
    ).not.toHaveTextContent(before);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Created filter' })
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add created filter' })
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
const lastSevenDays = {
  operator: 'between',
  from: new Date(2026, 8, 21),
  to: new Date(2026, 8, 27),
};
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add created filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by created' })
    );
    await expect(editor.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.click(editor.getByRole('button', { name: 'Last 7 days' }));
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith(lastSevenDays);
    await expectEditorClosed(canvasElement, 'Filter by created');
  },
};
export const ValuelessOperatorCommits: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Created operator',
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
        name: 'Change Created operator',
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is between' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by created' })
    );
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(editor.getByRole('button', { name: 'Last 7 days' }));
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith(lastSevenDays);
  },
};
export const DismissDiscardsDraft: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: /^Edit Created:/ });
    await userEvent.click(trigger);
    await userEvent.click(
      await page.findByRole('button', { name: 'Last 7 days' })
    );
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by created');
    await expectFocus(trigger);
    await userEvent.click(trigger);
    await userEvent.click(
      await page.findByRole('button', { name: 'Last 7 days' })
    );
    await userEvent.click(canvas.getByLabelText('Applied condition'));
    await expectEditorClosed(canvasElement, 'Filter by created');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: /^Edit Created:/ });
    const before = trigger.getAttribute('aria-label');
    await userEvent.click(trigger);
    await userEvent.click(
      await page.findByRole('button', { name: 'Last 7 days' })
    );
    dispatchStoryEvent('story:replace');
    await expectEditorClosed(canvasElement, 'Filter by created');
    await expect(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    ).not.toHaveAttribute('aria-label', before);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const DisabledWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(
      await page.findByRole('button', { name: 'Last 7 days' })
    );
    dispatchStoryEvent('story:toggle-disabled');
    await expectEditorClosed(canvasElement, 'Filter by created');
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() => expect(canvas.getAllByRole('button')[0]).toBeEnabled());
    await expect(
      page.queryByRole('dialog', { name: 'Filter by created' })
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
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(
      await page.findByRole('button', { name: 'Last 7 days' })
    );
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(lastSevenDays);
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
