import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { IconLetterCase } from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import operatorSource from '../filter-operator.tsx?raw';

import { type TextCondition, TextFilter } from './text-filter';
import blockSource from './text-filter.tsx?raw';

const initial: TextCondition = { operator: 'contains', value: 'design' };
function Preview({
  initialValue = initial,
  disabled = false,
}: {
  initialValue?: TextCondition | null;
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState<TextCondition | null>(initialValue);
  return (
    <section
      aria-label="TextFilter example"
      className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4"
    >
      <TextFilter
        label="Name"
        icon={<IconLetterCase aria-hidden="true" />}
        value={value}
        onChange={setValue}
        disabled={disabled}
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
  "import { useState } from 'react';\nimport { TextFilter, type TextCondition } from '@/blocks/filtering/text-filter/text-filter';\n\nexport function Example() {\n const [value, setValue] = useState<TextCondition | null>({ operator: 'contains', value: 'design' });\n return <TextFilter label=\"Name\" value={value} onChange={setValue}  />;\n}";
const meta = {
  title: 'Blocks/Filtering/TextFilter',
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
            Choose contains, equals, not equals or starts with. Apply commits
            trimmed, nonempty text. Matching rules such as case sensitivity
            belong to the application.
          </p>
          <Canvas of={Default} />
          <h2>Use this block</h2>
          <p>
            Copy blocks/filtering/text-filter/text-filter.tsx and
            blocks/filtering/filter-operator.tsx from packages/react/src,
            keeping their relative paths. The block imports Nexus components by
            relative path. Include the copied files in your Tailwind source scan
            and use the Nexus theme setup.
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
            <summary>blocks/filtering/text-filter/text-filter.tsx</summary>
            <Source code={blockSource} language="tsx" />
          </details>
          <details>
            <summary>
              blocks/filtering/filter-operator.tsx — required helper
            </summary>
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
export const Default: Story = {
  tags: ['docs'],
  render: () => <Preview />,
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
      canvas.getByRole('button', { name: 'Change Name operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'contains' })
    );
    await expect(await page.findByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'isEmpty'
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Change Name operator' })
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
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Name:/ }));
    await userEvent.clear(page.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(
      page.getByRole('textbox', { name: 'Name' }),
      'research'
    );
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Name:/ }));
    await userEvent.clear(page.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(
      page.getByRole('textbox', { name: 'Name' }),
      'research'
    );
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'research'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Name filter' })
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add name filter' })
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
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Name:/ }));
    await userEvent.clear(page.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(page.getByRole('textbox', { name: 'Name' }), '   ');
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /^Edit Name:/ })).toHaveFocus()
    );
  },
};
