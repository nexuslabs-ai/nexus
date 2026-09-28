import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { IconList } from '@tabler/icons-react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

import {
  FilterCondition,
  FilterConditionField,
  FilterConditionRemove,
  FilterConditionSegment,
} from './filter-condition';

const operators = ['is', 'is not', 'is empty', 'is not empty'] as const;
type Operator = (typeof operators)[number];
const statuses = ['Active', 'Invited', 'Suspended'];

function OperatorMenu({
  value,
  onChange,
  children,
}: {
  value: Operator;
  onChange: (value: Operator) => void;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" aria-label="Status operators">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as Operator)}
        >
          {operators.map((operator) => (
            <DropdownMenuRadioItem key={operator} value={operator}>
              {operator}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusFilter() {
  const [operator, setOperator] = React.useState<Operator>('is');
  const [value, setValue] = React.useState('Active');
  const [open, setOpen] = React.useState(false);
  const [removed, setRemoved] = React.useState(false);
  const operatorRef = React.useRef<HTMLButtonElement>(null);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const needsValue = operator === 'is' || operator === 'is not';
  function changeOperator(next: Operator) {
    setOperator(next);
    if (next === 'is empty' || next === 'is not empty') setOpen(false);
  }
  function remove() {
    setOpen(false);
    setRemoved(true);
  }
  function add() {
    setOperator('is');
    setValue('Active');
    setRemoved(false);
  }
  function focusAdd(node: HTMLButtonElement | null) {
    addRef.current = node;
    if (node) node.focus();
  }
  function focusOperator(node: HTMLButtonElement | null) {
    operatorRef.current = node;
  }
  function closeFocus(event: Event) {
    if (!needsValue) {
      event.preventDefault();
      operatorRef.current?.focus();
    }
  }
  return (
    <section
      className="nx:grid nx:gap-4 nx:w-full nx:max-w-xl"
      aria-label="Status filter review"
    >
      <div>
        <h2 className="nx:typography-heading-small">Status filter</h2>
        <p className="nx:mt-1 nx:typography-body-default nx:text-muted-foreground">
          Change the operator and value independently.
        </p>
      </div>
      {removed ? (
        <Button
          ref={focusAdd}
          variant="outline"
          size="sm"
          className="nx:justify-self-start"
          onClick={add}
        >
          Add status filter
        </Button>
      ) : (
        <FilterCondition className="nx:justify-self-start">
          <FilterConditionField>
            <IconList aria-hidden="true" />
            Status
          </FilterConditionField>
          <OperatorMenu value={operator} onChange={changeOperator}>
            <FilterConditionSegment
              ref={focusOperator}
              className="nx:text-muted-foreground"
              aria-label="Change Status operator"
            >
              {operator}
            </FilterConditionSegment>
          </OperatorMenu>
          {needsValue && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FilterConditionSegment aria-label="Change Status value">
                  {value}
                </FilterConditionSegment>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                aria-label="Status value editor"
                onCloseAutoFocus={closeFocus}
                className="nx:w-64 nx:max-w-(--radix-popover-content-available-width) nx:overflow-hidden nx:p-0"
              >
                <div
                  role="group"
                  aria-label="Status choices"
                  className="nx:grid nx:p-1"
                >
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      variant="ghost"
                      aria-pressed={value === status}
                      className="nx:justify-start nx:aria-pressed:bg-control-background"
                      onClick={() => {
                        setValue(status);
                        setOpen(false);
                      }}
                    >
                      <span className="nx:flex-1 nx:text-left">{status}</span>
                      {value === status && <span aria-hidden="true">✓</span>}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <FilterConditionRemove
            aria-label="Remove Status filter"
            onClick={remove}
          />
        </FilterCondition>
      )}
      <p
        role="status"
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        {removed
          ? 'No status filter'
          : `Applied: Status ${operator}${needsValue ? ` ${value}` : ''}`}
      </p>
    </section>
  );
}

const meta = {
  title: 'Internal/Status filter review',
  tags: ['!dev', '!autodocs'],
  component: StatusFilter,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <main className="nx:mx-auto nx:w-full nx:max-w-3xl nx:p-4">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof StatusFilter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const IndependentControls: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Status operator' })
    );
    await expect(
      page.queryByRole('dialog', { name: 'Status value editor' })
    ).not.toBeInTheDocument();
    await userEvent.click(
      page.getByRole('menuitemradio', { name: /^is not$/ })
    );
    await expect(await canvas.findByRole('status')).toHaveTextContent(
      'Status is not Active'
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Change Status value' })
    );
    await userEvent.click(page.getByRole('button', { name: 'Invited' }));
    await expect(await canvas.findByRole('status')).toHaveTextContent(
      'Status is not Invited'
    );
  },
};
export const EmptyOperator: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: /^is empty$/ })
    );
    await expect(
      canvas.queryByRole('button', { name: 'Change Status value' })
    ).not.toBeInTheDocument();
    await expect(await canvas.findByRole('status')).toHaveTextContent(
      'Status is empty'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: /^is$/ }));
    await expect(
      await canvas.findByRole('button', { name: 'Change Status value' })
    ).toHaveTextContent('Active');
  },
};
