import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  FilterCondition,
  FilterConditionField,
  FilterConditionRemove,
  FilterConditionSegment,
} from './filter-condition';

const anatomySource = `import { FilterCondition, FilterConditionField, FilterConditionSegment, FilterConditionRemove } from '.';

// Connect each callback to your editor or application state.
<FilterCondition>
  <FilterConditionField>Status</FilterConditionField>
  <FilterConditionSegment aria-label="Edit status operator" onClick={openOperator}>is</FilterConditionSegment>
  <FilterConditionSegment aria-label="Edit status value" onClick={openValue}>Paid</FilterConditionSegment>
  <FilterConditionRemove aria-label="Remove status filter" onClick={removeCondition} />
</FilterCondition>`;

function ConditionExample({
  field = 'Status',
  operator = 'is',
  value = 'Paid',
  disabled = false,
  onOperatorClick,
  onValueClick,
  onRemove,
}: {
  field?: string;
  operator?: string;
  value?: string;
  disabled?: boolean;
  onOperatorClick?: () => void;
  onValueClick?: () => void;
  onRemove?: () => void;
}) {
  return (
    <FilterCondition data-testid="condition">
      <FilterConditionField>{field}</FilterConditionField>
      <FilterConditionSegment
        aria-label={`Edit ${field} operator`}
        className="nx:shrink-0 nx:text-muted-foreground"
        disabled={disabled}
        onClick={onOperatorClick}
      >
        {operator}
      </FilterConditionSegment>
      <FilterConditionSegment
        aria-label={`Edit ${field} value: ${value}`}
        data-testid="condition-value"
        disabled={disabled}
        onClick={onValueClick}
      >
        {value}
      </FilterConditionSegment>
      <FilterConditionRemove
        aria-label={`Remove ${field} filter`}
        disabled={disabled}
        onClick={onRemove}
      />
    </FilterCondition>
  );
}

const meta = {
  title: 'Components/FilterCondition',
  component: ConditionExample,
  args: {
    field: 'Status',
    operator: 'is',
    value: 'Paid',
    disabled: false,
    onOperatorClick: fn(),
    onValueClick: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <p>
            The shared parts of an editable condition: field, operator, value
            and removal. ChoiceFilter and NumberRangeFilter use these same parts
            and add working editors. FilterCondition alone does not select
            values or filter data.
          </p>
          <Canvas of={Anatomy} />
          <p>
            One compact size follows Nexus density. The field, operator, value
            and remove button share the h-8 height token; there is no size prop.
            Change density in the toolbar to see them adapt together. Inputs
            inside an editor retain their own appropriate control size.
          </p>
          <p>
            Field names identify the condition. The operator and value are
            separate buttons; each opens its own editor. The final button
            removes it. This anatomy example demonstrates button callbacks only.
          </p>
          <Source code={anatomySource} language="tsx" />
          <h2>Use a working block</h2>
          <p>
            <a
              href="/?path=/docs/blocks-filtering-choicefilter--docs"
              target="_top"
            >
              ChoiceFilter
            </a>{' '}
            adds a choice menu and immediate updates.{' '}
            <a
              href="/?path=/docs/blocks-filtering-numberrangefilter--docs"
              target="_top"
            >
              NumberRangeFilter
            </a>{' '}
            adds draft bounds, validation and Apply/Cancel.
          </p>
          <h2>Compose a custom editor</h2>
          <p>
            Use these parts directly for an editor the blocks do not provide,
            such as Location / within / a distance opening a location-and-radius
            editor. Import the parts from @nexus_ds/react. Supply your own
            editor, controlled values, open state, validation, and focus after
            removal. Use FilterChip when editing happens elsewhere and the chip
            only removes.
          </p>
          <p>
            <a href="/?path=/docs/patterns-filtering--docs" target="_top">
              Compare both approaches in the Filtering pattern
            </a>
          </p>
        </>
      ),
      description: {
        component:
          'Separate field, operator, value and removal parts. Compose FilterConditionSegment with PopoverTrigger or DropdownMenuTrigger asChild. FilterCondition does not own open state, draft values, application timing or focus after removal. All parts use one compact, density-aware height (h-8). Change density to adjust the whole condition; there is no size prop. Editor inputs choose their own appropriate sizing. Native buttons preserve Enter/Space activation. The full summary remains accessible when visually truncated. See Patterns/Filtering for immediate and Apply-based recipes. Use FilterChip when the entire chip should only remove.',
      },
    },
  },
  render: (args) => <ConditionExample {...args} />,
} satisfies Meta<typeof ConditionExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { tags: ['docs'] };
export const Anatomy: Story = {};
export const ClickInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status operator' })
    );
    await expect(args.onOperatorClick).toHaveBeenCalledTimes(1);
    await expect(args.onValueClick).not.toHaveBeenCalled();
    await expect(args.onRemove).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status value: Paid' })
    );
    await expect(args.onValueClick).toHaveBeenCalledTimes(1);
    await expect(args.onRemove).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Status filter' })
    );
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await expect(args.onOperatorClick).toHaveBeenCalledTimes(1);
    await expect(args.onValueClick).toHaveBeenCalledTimes(1);
  },
};
export const KeyboardInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: 'Edit Status operator' }).focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Edit Status value: Paid' })
    ).toHaveFocus();
    await userEvent.keyboard(' ');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Remove Status filter' })
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onOperatorClick).toHaveBeenCalledTimes(1);
    await expect(args.onValueClick).toHaveBeenCalledTimes(1);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    for (const button of within(canvasElement).getAllByRole('button')) {
      await expect(button).toBeDisabled();
      button.focus();
      await expect(button).not.toHaveFocus();
    }
    await expect(args.onOperatorClick).not.toHaveBeenCalled();
    await expect(args.onValueClick).not.toHaveBeenCalled();
    await expect(args.onRemove).not.toHaveBeenCalled();
  },
};
export const LongContent: Story = {
  args: {
    field: 'Workspace',
    value: 'Design, Engineering, Research and Customer Operations',
  },
  render: (args) => (
    <div className="nx:w-80 nx:max-w-full">
      <ConditionExample {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: `Edit Workspace value: ${args.value}`,
    });
    await expect(trigger.scrollWidth).toBeLessThanOrEqual(
      trigger.clientWidth + 1
    );
    await expect(
      canvas.getByRole('button', { name: 'Remove Workspace filter' })
    ).toBeVisible();
    const condition = canvas.getByTestId('condition');
    await expect(condition.scrollWidth).toBeLessThanOrEqual(
      condition.clientWidth + 1
    );
  },
};
export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('condition')).toHaveAttribute(
      'data-slot',
      'filter-condition'
    );
    await expect(canvas.getByTestId('condition-value')).toHaveAttribute(
      'data-slot',
      'filter-condition-segment'
    );
    await expect(
      canvas
        .getByTestId('condition')
        .querySelector('[data-slot="filter-condition-field"]')
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Remove Status filter' })
    ).toHaveAttribute('data-slot', 'filter-condition-remove');
  },
};
export const AllVariants: Story = {
  render: (args) => (
    <div className="nx:grid nx:justify-items-start nx:gap-4">
      <ConditionExample {...args} />
      <ConditionExample {...args} disabled value="Locked" />
      <div className="nx:w-80 nx:max-w-full">
        <ConditionExample
          {...args}
          field="Workspace"
          value="Design, Engineering, Research and Customer Operations"
        />
      </div>
    </div>
  ),
};
