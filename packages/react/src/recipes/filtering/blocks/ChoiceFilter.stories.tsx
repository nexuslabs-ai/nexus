import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  DialogHost,
  dispatchStoryEvent,
  expectFocus,
  expectMenuClosed,
  useStoryEvent,
} from '../../../stories/support/filter-block-test-utils';
import operatorSource from '../filter-operator.tsx?raw';

import { type ChoiceCondition, ChoiceFilter } from './choice-filter';
import blockSource from './choice-filter.tsx?raw';
import { ChoiceFilterExample } from './choice-filter-example';
import exampleSource from './choice-filter-example.tsx?raw';

const replacement: ChoiceCondition = { operator: 'is', value: 'suspended' };
function Preview({
  initialValue = { operator: 'is', value: 'active' },
  disabled = false,
  onChange,
}: {
  initialValue?: ChoiceCondition | null;
  disabled?: boolean;
  onChange?: (value: ChoiceCondition | null) => void;
}) {
  const [value, setValue] = React.useState<ChoiceCondition | null>(
    initialValue
  );
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: ChoiceCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <div className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4">
      <ChoiceFilter
        label="Status"
        value={value}
        onChange={change}
        disabled={isDisabled}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'invited', label: 'Invited' },
          { value: 'suspended', label: 'Suspended' },
          { value: 'restricted', label: 'Restricted', disabled: true },
        ]}
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

const valueShape = `type ChoiceCondition =
  | { operator: 'is' | 'isNot'; value: string }
  | { operator: 'isEmpty' }
  | { operator: 'isNotEmpty' };`;
const meta = {
  title: 'Blocks/ChoiceFilter',
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
            Filter by one value from a short list. Selecting a value applies it
            immediately.
          </p>
          <h2>When to use it</h2>
          <p>
            Use it for a short list of mutually exclusive options where each
            choice is cheap to apply. To match several values at once, use
            MultiChoiceFilter. For a long list, compose a searchable Command
            menu instead.
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
              Selecting a value emits a complete condition immediately and
              closes the menu.
            </li>
            <li>
              Choosing <em>Any</em> or pressing × emits <code>null</code>.
            </li>
            <li>
              Changing between <em>is</em> and <em>is not</em> keeps the value
              and emits immediately.
            </li>
            <li>
              <em>Is empty</em> and <em>is not empty</em> emit immediately and
              hide the value.
            </li>
            <li>
              Switching from an empty operator to <em>is</em> or <em>is not</em>{' '}
              waits until you choose a value; nothing incomplete is emitted.
            </li>
          </ul>
          <p>
            The block owns only its open menu and a pending operator. Option IDs
            are data and labels are display text; IDs must be unique, nonempty
            strings. ChoiceEditor is also exported for use inside your own
            DropdownMenuContent.
          </p>
          <h2>States and dismissal</h2>
          <p>
            Escape and clicking outside close the menu without a change. Focus
            returns to the value, to the operator after backing out of a pending
            operator, and to Add after removal. Replacing the value from
            outside, or disabling the block, closes the menu. An unknown ID
            stays visible as “(unavailable)” until you replace or remove it.
          </p>
          <h3>Not applied</h3>
          <Canvas of={NotApplied} />
          <h3>Empty operator</h3>
          <Canvas of={EmptyOperator} />
          <h3>Unavailable value</h3>
          <Canvas of={UnavailableOption} />
          <h3>Disabled</h3>
          <Canvas of={Disabled} />
          <h2>Delivery</h2>
          <p>
            Manual guidance until the generated catalog lands (#798). This is
            copy-source, not a package export.
          </p>
          <ul>
            <li>
              Copy <code>blocks/choice-filter.tsx</code> and{' '}
              <code>filter-operator.tsx</code>, keeping the{' '}
              <code>recipes/filtering</code> layout.
            </li>
            <li>
              They need these Nexus component folders, including the ones those
              folders import: <code>button</code>, <code>button-group</code>,{' '}
              <code>dropdown-menu</code>, <code>filter-condition</code>,{' '}
              <code>filter-model</code>, <code>overlay-layout</code>,{' '}
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
            Not supported: searching options, selecting several values, and
            loading states while options are fetched. The application decides
            how an ID matches a record.
          </p>
          <h2>Implementation</h2>
          <details>
            <summary>blocks/choice-filter.tsx</summary>
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
  render: () => <ChoiceFilterExample />,
  parameters: { docs: { source: { code: exampleSource } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Status filter' })
    );
    await expect(
      canvas.getByRole('button', { name: 'Add status filter' })
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
export const UnavailableOption: Story = {
  render: (args) => (
    <Preview
      initialValue={{ operator: 'is', value: 'retired-id' }}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Edit Status: retired-id (unavailable)',
    });
    await userEvent.click(trigger);
    await expect(
      await page.findByRole('menuitemradio', {
        name: 'retired-id (unavailable)',
      })
    ).toHaveAttribute('aria-checked', 'true');
    await expect(
      page.getByRole('menuitemradio', { name: 'retired-id (unavailable)' })
    ).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Active' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'is',
      value: 'active',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const ChooseAfterEmptyOperator: Story = {
  render: () => <Preview initialValue={{ operator: 'isEmpty' }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'is' }));
    await expect(
      await page.findByRole('menuitemradio', { name: 'Active' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', {
        name: 'Edit Status: Choose…',
        hidden: true,
      })
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument()
    );
    await expect(
      canvas.getByRole('button', { name: 'Change Status operator' })
    ).toHaveFocus();
  },
};
export const SelectCommits: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status: Active' })
    );
    await expect(
      await page.findByRole('menuitemradio', { name: 'Restricted' })
    ).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Invited' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'is',
      value: 'invited',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add status filter' })
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Suspended' })
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'is',
      value: 'suspended',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const OperatorKeepsValue: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Status operator',
      })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'is not' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isNot',
      value: 'active',
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
        name: 'Change Status operator',
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
        name: 'Change Status operator',
      })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'is not' }));
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Invited' })
    );
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isNot',
      value: 'invited',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const AnyRemovesFilter: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status: Active' })
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Any status' })
    );
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
    await expectMenuClosed(canvasElement);
    await expectFocus(
      canvas.getByRole('button', { name: 'Add status filter' })
    );
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status: Active' })
    );
    await expect(
      await page.findByRole('menuitemradio', { name: 'Invited' })
    ).toBeVisible();
    dispatchStoryEvent('story:replace');
    await expectMenuClosed(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Edit Status: Suspended' })
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
      canvas.getByRole('button', { name: 'Edit Status: Active' })
    );
    await expect(
      await page.findByRole('menuitemradio', { name: 'Invited' })
    ).toBeVisible();
    dispatchStoryEvent('story:toggle-disabled');
    await expectMenuClosed(canvasElement);
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Status: Active' })
      ).toBeEnabled()
    );
    await expect(page.queryByRole('menu')).not.toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
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
    const trigger = within(host).getByRole('button', {
      name: 'Edit Status: Active',
    });
    await userEvent.click(trigger);
    await expect(
      await page.findByRole('menuitemradio', { name: 'Invited' })
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expectMenuClosed(canvasElement);
    await expect(host).toHaveAttribute('data-state', 'open');
    await expectFocus(trigger);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(host).toHaveAttribute('data-state', 'closed'));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
