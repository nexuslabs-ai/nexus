import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { IconLetterCase } from '@tabler/icons-react';
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

import { type TextCondition, TextFilter } from './text-filter';
import blockSource from './text-filter.tsx?raw';

const initial: TextCondition = { operator: 'contains', value: 'design' };
const replacement: TextCondition = {
  operator: 'contains',
  value: 'operations',
};
function Preview({
  initialValue = initial,
  disabled = false,
  onChange,
}: {
  initialValue?: TextCondition | null;
  disabled?: boolean;
  onChange?: (value: TextCondition | null) => void;
}) {
  const [value, setValue] = React.useState<TextCondition | null>(initialValue);
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: TextCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <section
      aria-label="TextFilter example"
      className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4"
    >
      <TextFilter
        label="Name"
        icon={<IconLetterCase aria-hidden="true" />}
        value={value}
        onChange={change}
        disabled={isDisabled}
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
  "import { useState } from 'react';\nimport { TextFilter, type TextCondition } from './blocks/text-filter';\n\nexport function Example() {\n const [value, setValue] = useState<TextCondition | null>({ operator: 'contains', value: 'design' });\n return <TextFilter label=\"Name\" value={value} onChange={setValue}  />;\n}";
const meta = {
  title: 'Blocks/TextFilter',
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
            Choose contains, equals, not equals or starts with. Apply commits
            trimmed, nonempty text. Matching rules such as case sensitivity
            belong to the application.
          </p>
          <Canvas of={Default} />
          <h2>Use this block</h2>
          <p>
            Copy blocks/text-filter.tsx and filter-operator.tsx from
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
            <summary>blocks/text-filter.tsx</summary>
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
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add name filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by name' })
    );
    await expect(editor.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.type(
      editor.getByRole('textbox', { name: 'Name' }),
      ' ops '
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'contains',
      value: 'ops',
    });
    await expectEditorClosed(canvasElement, 'Filter by name');
  },
};
export const OperatorKeepsValue: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Name operator',
      })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'is' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'is',
      value: 'design',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const ValuelessOperatorCommits: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Name operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is empty' })
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isEmpty',
    });
    await expect(
      canvas.queryByRole('button', { name: /^Edit Name/ })
    ).not.toBeInTheDocument();
    await expectMenuClosed(canvasElement);
  },
};
export const PendingOperatorApplies: Story = {
  render: (args) => (
    <Preview initialValue={{ operator: 'isEmpty' }} onChange={args.onChange} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Name operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'starts with' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by name' })
    );
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.type(editor.getByRole('textbox', { name: 'Name' }), 'Ma');
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'startsWith',
      value: 'Ma',
    });
  },
};
export const DismissDiscardsDraft: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Edit Name: design' });
    await userEvent.click(trigger);
    let input = await page.findByRole('textbox', { name: 'Name' });
    await userEvent.type(input, ' draft');
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by name');
    await expectFocus(trigger);
    await userEvent.click(trigger);
    input = await page.findByRole('textbox', { name: 'Name' });
    await expect(input).toHaveValue('design');
    await userEvent.type(input, ' draft');
    await userEvent.click(canvas.getByLabelText('Applied condition'));
    await expectEditorClosed(canvasElement, 'Filter by name');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Name: design' })
    );
    await userEvent.type(
      await page.findByRole('textbox', { name: 'Name' }),
      ' draft'
    );
    dispatchStoryEvent('story:replace');
    await expectEditorClosed(canvasElement, 'Filter by name');
    await expect(
      canvas.getByRole('button', { name: 'Edit Name: operations' })
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
      canvas.getByRole('button', { name: 'Edit Name: design' })
    );
    await userEvent.type(
      await page.findByRole('textbox', { name: 'Name' }),
      ' draft'
    );
    dispatchStoryEvent('story:toggle-disabled');
    await expectEditorClosed(canvasElement, 'Filter by name');
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() => expect(canvas.getAllByRole('button')[0]).toBeEnabled());
    await expect(
      page.queryByRole('dialog', { name: 'Filter by name' })
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
      canvas.getByRole('button', { name: 'Edit Name: design' })
    );
    const input = await page.findByRole('textbox', { name: 'Name' });
    await userEvent.clear(input);
    await userEvent.type(input, 'Updated{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'contains',
      value: 'Updated',
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
