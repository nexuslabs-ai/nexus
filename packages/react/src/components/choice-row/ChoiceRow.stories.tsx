import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Checkbox } from '../checkbox';
import { FieldLegend, FieldSet } from '../field';
import { RadioGroup, RadioGroupItem } from '../radio-group';

import {
  ChoiceRow,
  ChoiceRowContent,
  ChoiceRowDescription,
  ChoiceRowTitle,
} from './choice-row';

const meta: Meta<typeof ChoiceRow> = {
  title: 'Components/ChoiceRow',
  component: ChoiceRow,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ChoiceRow>;

function getRequiredElement<T extends HTMLElement>(
  root: ParentNode,
  selector: string
) {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element for selector: ${selector}`);
  return element;
}

function NotificationsRadioGroup() {
  const legendId = React.useId();

  return (
    <FieldSet className="nx:w-80">
      <FieldLegend id={legendId}>Delivery speed</FieldLegend>
      <RadioGroup aria-labelledby={legendId}>
        <ChoiceRow htmlFor="choice-radio-standard">
          <RadioGroupItem
            id="choice-radio-standard"
            value="standard"
            aria-labelledby="choice-radio-standard-title"
          />
          <ChoiceRowTitle id="choice-radio-standard-title">
            Standard
          </ChoiceRowTitle>
        </ChoiceRow>
        <ChoiceRow htmlFor="choice-radio-priority">
          <RadioGroupItem
            id="choice-radio-priority"
            value="priority"
            aria-labelledby="choice-radio-priority-title"
          />
          <ChoiceRowTitle id="choice-radio-priority-title">
            Priority
          </ChoiceRowTitle>
        </ChoiceRow>
      </RadioGroup>
    </FieldSet>
  );
}

export const Default: Story = {
  render: () => (
    <div className="nx:w-80">
      <ChoiceRow htmlFor="choice-default">
        <Checkbox id="choice-default" aria-labelledby="choice-default-title" />
        <ChoiceRowTitle id="choice-default-title">
          Product updates
        </ChoiceRowTitle>
      </ChoiceRow>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Product updates',
    });

    await expect(checkbox).not.toBeChecked();
    await expect(checkbox).toHaveAccessibleName('Product updates');
  },
};

export const WithRadioGroup: Story = {
  render: () => <NotificationsRadioGroup />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Delivery speed' });
    const standard = canvas.getByRole('radio', { name: 'Standard' });
    const priority = canvas.getByRole('radio', { name: 'Priority' });

    await expect(group).toHaveAccessibleName('Delivery speed');
    await expect(standard).toHaveAttribute('data-state', 'unchecked');
    await expect(priority).toHaveAttribute('data-state', 'unchecked');

    await userEvent.click(canvas.getByText('Priority'));
    await expect(priority).toHaveAttribute('data-state', 'checked');
    await expect(standard).toHaveAttribute('data-state', 'unchecked');
  },
};

export const ClickInteraction: Story = {
  render: () => (
    <div className="nx:w-80">
      <ChoiceRow htmlFor="choice-click">
        <Checkbox id="choice-click" aria-labelledby="choice-click-title" />
        <ChoiceRowTitle id="choice-click-title">Security alerts</ChoiceRowTitle>
      </ChoiceRow>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = getRequiredElement<HTMLLabelElement>(
      canvasElement,
      '[data-slot="choice-row"]'
    );
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Security alerts',
    });

    await expect(checkbox).not.toBeChecked();
    await userEvent.click(row);
    await expect(checkbox).toBeChecked();
    await userEvent.click(row);
    await expect(checkbox).not.toBeChecked();
  },
};

export const KeyboardInteraction: Story = {
  render: () => <NotificationsRadioGroup />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const standard = canvas.getByRole('radio', { name: 'Standard' });
    const priority = canvas.getByRole('radio', { name: 'Priority' });

    await userEvent.tab();
    await expect(standard).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect(priority).toHaveFocus();

    await userEvent.keyboard(' ');
    await waitFor(() =>
      expect(priority).toHaveAttribute('data-state', 'checked')
    );
    await expect(standard).toHaveAttribute('data-state', 'unchecked');
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="nx:w-80">
      <ChoiceRow htmlFor="choice-disabled">
        <Checkbox
          id="choice-disabled"
          disabled
          aria-labelledby="choice-disabled-title"
        />
        <ChoiceRowTitle id="choice-disabled-title">
          Locked notifications
        </ChoiceRowTitle>
      </ChoiceRow>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = getRequiredElement<HTMLLabelElement>(
      canvasElement,
      '[data-slot="choice-row"]'
    );
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Locked notifications',
    });

    await expect(row).not.toHaveAttribute('data-disabled');
    await expect(row).not.toHaveAttribute('aria-disabled');
    await expect(checkbox).toBeDisabled();
    await userEvent.click(row);
    await expect(checkbox).not.toBeChecked();
  },
};

export const WithDescription: Story = {
  render: () => (
    <div className="nx:w-96 nx:max-w-full">
      <ChoiceRow htmlFor="choice-description">
        <Checkbox
          id="choice-description"
          aria-labelledby="choice-description-title"
          aria-describedby="choice-description-help"
        />
        <ChoiceRowContent>
          <ChoiceRowTitle id="choice-description-title">
            Product updates
          </ChoiceRowTitle>
          <ChoiceRowDescription id="choice-description-help">
            News about features and improvements.
          </ChoiceRowDescription>
        </ChoiceRowContent>
      </ChoiceRow>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Product updates',
    });

    await expect(checkbox).toHaveAccessibleName('Product updates');
    await expect(checkbox).toHaveAccessibleDescription(
      'News about features and improvements.'
    );
  },
};

export const WithDataAttributes: Story = {
  render: () => (
    <div className="nx:w-96 nx:max-w-full">
      <ChoiceRow htmlFor="choice-data">
        <Checkbox
          id="choice-data"
          aria-labelledby="choice-data-title"
          aria-describedby="choice-data-help"
        />
        <ChoiceRowContent>
          <ChoiceRowTitle id="choice-data-title">Billing</ChoiceRowTitle>
          <ChoiceRowDescription id="choice-data-help">
            Invoices and payment receipts.
          </ChoiceRowDescription>
        </ChoiceRowContent>
      </ChoiceRow>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const row = getRequiredElement<HTMLLabelElement>(
      canvasElement,
      '[data-slot="choice-row"]'
    );
    const content = getRequiredElement(
      canvasElement,
      '[data-slot="choice-row-content"]'
    );
    const title = getRequiredElement(
      canvasElement,
      '[data-slot="choice-row-title"]'
    );
    const description = getRequiredElement(
      canvasElement,
      '[data-slot="choice-row-description"]'
    );

    await expect(row).toHaveAttribute('data-slot', 'choice-row');
    await expect(row).not.toHaveAttribute('role');
    await expect(row).not.toHaveAttribute('tabindex');
    await expect(content).toHaveAttribute('data-slot', 'choice-row-content');
    await expect(title).toHaveAttribute('data-slot', 'choice-row-title');
    await expect(description).toHaveAttribute(
      'data-slot',
      'choice-row-description'
    );

    await expect(
      Math.round(row.getBoundingClientRect().height)
    ).toBeGreaterThanOrEqual(32);
  },
};

export const EdgeCases: Story = {
  render: () => (
    <div className="nx:grid nx:w-52 nx:gap-1">
      <ChoiceRow htmlFor="choice-edge-long">
        <Checkbox
          id="choice-edge-long"
          aria-labelledby="choice-edge-long-title"
        />
        <ChoiceRowTitle id="choice-edge-long-title" className="nx:truncate">
          Very long notification preference title that should stay on one line
          in compact product settings
        </ChoiceRowTitle>
      </ChoiceRow>
      <ChoiceRow htmlFor="choice-edge-empty">
        <Checkbox id="choice-edge-empty" aria-label="Unnamed visual choice" />
        <ChoiceRowTitle id="choice-edge-empty-title" aria-hidden="true" />
      </ChoiceRow>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const longCheckbox = canvas.getByRole('checkbox', {
      name: /Very long notification preference title/i,
    });
    const emptyCheckbox = canvas.getByRole('checkbox', {
      name: 'Unnamed visual choice',
    });
    const longTitle = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-edge-long-title'
    );
    const emptyTitle = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-edge-empty-title'
    );

    await expect(longCheckbox).toHaveAccessibleName(
      /Very long notification preference title/i
    );
    await expect(longTitle.scrollWidth).toBeGreaterThan(longTitle.clientWidth);
    await expect(emptyCheckbox).toHaveAccessibleName('Unnamed visual choice');
    await expect(emptyTitle).toBeEmptyDOMElement();
  },
};

export const Dark: Story = {
  render: () => (
    <div className="dark nx:w-80 nx:rounded-md nx:bg-background nx:p-4 nx:text-foreground">
      <ChoiceRow htmlFor="choice-dark">
        <Checkbox
          id="choice-dark"
          defaultChecked
          aria-labelledby="choice-dark-title"
        />
        <ChoiceRowTitle id="choice-dark-title">Dark mode row</ChoiceRowTitle>
      </ChoiceRow>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:w-96 nx:max-w-full nx:flex-col nx:gap-6">
      <div className="nx:grid nx:gap-1">
        <ChoiceRow htmlFor="choice-all-unchecked">
          <Checkbox
            id="choice-all-unchecked"
            aria-labelledby="choice-all-unchecked-title"
          />
          <ChoiceRowTitle id="choice-all-unchecked-title">
            Unchecked checkbox
          </ChoiceRowTitle>
        </ChoiceRow>
        <ChoiceRow htmlFor="choice-all-checked">
          <Checkbox
            id="choice-all-checked"
            defaultChecked
            aria-labelledby="choice-all-checked-title"
          />
          <ChoiceRowTitle id="choice-all-checked-title">
            Checked checkbox
          </ChoiceRowTitle>
        </ChoiceRow>
        <ChoiceRow htmlFor="choice-all-disabled">
          <Checkbox
            id="choice-all-disabled"
            disabled
            aria-labelledby="choice-all-disabled-title"
          />
          <ChoiceRowTitle id="choice-all-disabled-title">
            Disabled checkbox
          </ChoiceRowTitle>
        </ChoiceRow>
      </div>
      <NotificationsRadioGroup />
      <ChoiceRow htmlFor="choice-all-description">
        <Checkbox
          id="choice-all-description"
          aria-labelledby="choice-all-description-title"
          aria-describedby="choice-all-description-help"
        />
        <ChoiceRowContent>
          <ChoiceRowTitle id="choice-all-description-title">
            With description
          </ChoiceRowTitle>
          <ChoiceRowDescription id="choice-all-description-help">
            Rows with helper text expand beyond the compact single-line rhythm.
          </ChoiceRowDescription>
        </ChoiceRowContent>
      </ChoiceRow>
    </div>
  ),
};
