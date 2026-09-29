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
import { DateRangeFilterExample } from './date-range-filter-example';
import exampleSource from './date-range-filter-example.tsx?raw';

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
const valueShape = `type DateRangeCondition =
  | { operator: 'between'; from: Date; to: Date }
  | { operator: 'isEmpty' }
  | { operator: 'isNotEmpty' };`;
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
            Filter by a range of calendar days. The range is a draft until you
            press Apply.
          </p>
          <h2>When to use it</h2>
          <p>
            Use it for created, updated or due dates. Presets cover common
            ranges; the calendar covers the rest.
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
              Apply emits an ordered, complete range of local calendar dates.
            </li>
            <li>
              Presets such as <em>Last 7 days</em> become fixed dates when
              applied, not rolling ranges. Pass <code>today</code> to fix the
              reference day.
            </li>
            <li>
              <em>Is empty</em> and <em>is not empty</em> emit immediately.
            </li>
            <li>
              Switching from an empty operator to <em>is between</em> waits for
              a range and Apply.
            </li>
            <li>
              Pressing × emits <code>null</code>.
            </li>
          </ul>
          <p>
            The block owns the open editor, the draft and a pending operator.
            Pass valid Date objects; rebuild them after reading URL or JSON
            state.
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
              Copy <code>blocks/date-range-filter.tsx</code> and{' '}
              <code>filter-operator.tsx</code>, keeping the{' '}
              <code>recipes/filtering</code> layout.
            </li>
            <li>
              They need these Nexus component folders, including the ones those
              folders import: <code>button</code>, <code>button-group</code>,{' '}
              <code>date-picker</code>, <code>dropdown-menu</code>,{' '}
              <code>filter-condition</code>, <code>filter-model</code>,{' '}
              <code>overlay-layout</code>, <code>popover</code>,{' '}
              <code>separator</code>, <code>spinner</code> and <code>lib/</code>
              . If your copy lives elsewhere, update the relative imports.
            </li>
            <li>
              The date picker needs the optional <code>react-day-picker</code>{' '}
              v9 peer dependency.
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
            Not supported: time of day, timezone conversion and relative ranges
            that keep moving. The application decides whether the end date is
            inclusive.
          </p>
          <h2>Implementation</h2>
          <details>
            <summary>blocks/date-range-filter.tsx</summary>
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
  render: () => <DateRangeFilterExample />,
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
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(
      await page.findByRole('button', { name: 'Last 7 days' })
    );
    dispatchStoryEvent('story:replace');
    await expectEditorClosed(canvasElement, 'Filter by created');
    await expect(
      canvas.getByRole('button', {
        name: `Edit Created: ${replacement.from.toLocaleDateString()} – ${replacement.to.toLocaleDateString()}`,
      })
    ).toBeVisible();
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
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: /^Edit Created:/ })
      ).toBeEnabled()
    );
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
