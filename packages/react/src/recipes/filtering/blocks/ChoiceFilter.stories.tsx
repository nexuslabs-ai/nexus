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

const usage =
  "import { useState } from 'react';\nimport {\n  ChoiceFilter,\n  type ChoiceCondition,\n} from './blocks/choice-filter';\n\nexport function Example() {\n  const [value, setValue] = useState<ChoiceCondition | null>({\n    operator: 'is',\n    value: 'active',\n  });\n  return (\n    <ChoiceFilter\n      label=\"Status\"\n      value={value}\n      onChange={setValue}\n      options={[\n        { value: 'active', label: 'Active' },\n        { value: 'invited', label: 'Invited' },\n        { value: 'suspended', label: 'Suspended' },\n      ]}\n    />\n  );\n}\n";
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
            Choose one value and edit its operator independently. Choices apply
            immediately.
          </p>
          <Canvas of={Default} />
          <p>
            Built from FilterConditionField, FilterConditionSegment and
            FilterConditionRemove: the shared field / operator / value / ×
            structure. This block adds an options menu and immediate updates.
            <a
              href="/?path=/docs/components-filtercondition--docs"
              target="_top"
            >
              {' '}
              See the shared anatomy.
            </a>
          </p>
          <p>
            ChoiceFilter emits complete edits through onChange. Connect it to
            applied state for live results or to a panel draft for a shared
            Apply. The file also exports ChoiceEditor for use inside
            DropdownMenuContent; it supplies the controlled choices without
            owning commit state.
          </p>
          <h2>Use this block</h2>
          <p>
            This is copy-source code, not a package export. Copy{' '}
            <code>blocks/choice-filter.tsx</code> and{' '}
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
            Options use stable, unique nonempty IDs and separate display labels.
            Unknown IDs remain visible until replaced or removed. Empty
            operators hide the value; returning to a value operator asks for a
            choice before committing.
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
  render: () => <Preview />,
  parameters: { docs: { source: { code: usage } } },
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
    await waitFor(() => expect(canvas.getAllByRole('button')[0]).toBeEnabled());
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
