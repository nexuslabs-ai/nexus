import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import operatorSource from '../filter-operator.tsx?raw';

import { type ChoiceCondition, ChoiceFilter } from './choice-filter';
import blockSource from './choice-filter.tsx?raw';

function Preview({
  initialValue = { operator: 'is', value: 'active' },
  disabled = false,
}: {
  initialValue?: ChoiceCondition | null;
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState<ChoiceCondition | null>(
    initialValue
  );
  return (
    <div className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4">
      <ChoiceFilter
        label="Status"
        value={value}
        onChange={setValue}
        disabled={disabled}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'invited', label: 'Invited' },
          { value: 'suspended', label: 'Suspended' },
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
  "import { useState } from 'react';\nimport {\n  ChoiceFilter,\n  type ChoiceCondition,\n} from '@/blocks/filtering/choice-filter/choice-filter';\n\nexport function Example() {\n  const [value, setValue] = useState<ChoiceCondition | null>({\n    operator: 'is',\n    value: 'active',\n  });\n  return (\n    <ChoiceFilter\n      label=\"Status\"\n      value={value}\n      onChange={setValue}\n      options={[\n        { value: 'active', label: 'Active' },\n        { value: 'invited', label: 'Invited' },\n        { value: 'suspended', label: 'Suspended' },\n      ]}\n    />\n  );\n}\n";
const meta = {
  title: 'Blocks/Filtering/ChoiceFilter',
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
            <code>blocks/filtering/choice-filter/choice-filter.tsx</code> and{' '}
            <code>blocks/filtering/filter-operator.tsx</code> from{' '}
            <code>packages/react/src</code>. Preserve their relative paths. The
            block imports its components from the component folders beside{' '}
            <code>blocks</code>.
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
            <summary>blocks/filtering/choice-filter/choice-filter.tsx</summary>
            <Source code={blockSource} language="tsx" />
          </details>
          <details>
            <summary>
              blocks/filtering/filter-operator.tsx — required shared helper
            </summary>
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
