import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { IconHash } from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  dispatchStoryEvent,
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
function Preview({
  initialValue = initial,
  disabled = false,
}: {
  initialValue?: NumberComparisonCondition | null;
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState<NumberComparisonCondition | null>(
    initialValue
  );
  const [upperBound, setUpperBound] = React.useState<number>();
  useStoryEvent('story:tighten-bounds', () => setUpperBound(1000));
  return (
    <section
      aria-label="NumberComparisonFilter example"
      className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4"
    >
      <NumberComparisonFilter
        label="Amount"
        icon={<IconHash aria-hidden="true" />}
        value={value}
        onChange={setValue}
        disabled={disabled}
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
const meta = {
  title: 'Blocks/NumberComparisonFilter',
  component: Preview,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { disable: true },
    docs: {
      page: () => (
        <>
          <Title />
          <p>
            Compare one finite number using equals, not equals, greater than or
            less than. Signed decimals are supported; optional lowerBound and
            upperBound constrain values. Unit is display text.
          </p>
          <Canvas of={Default} />
          <h2>Use this block</h2>
          <p>
            Copy blocks/number-comparison-filter.tsx and filter-operator.tsx
            from packages/react/src/recipes/filtering, keeping their relative
            paths. The block imports Nexus components from @nexus_ds/react.
            Include the copied files in your Tailwind source scan and use the
            Nexus theme setup.
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
            <summary>blocks/number-comparison-filter.tsx</summary>
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
