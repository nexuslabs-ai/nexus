import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Checkbox } from '../checkbox';
import { FieldLegend, FieldSet } from '../field';
import { RadioGroup, RadioGroupItem } from '../radio-group';

import {
  ChoiceCard,
  ChoiceCardContent,
  ChoiceCardDescription,
  type ChoiceCardProps,
  ChoiceCardTitle,
} from './choice-card';

const meta: Meta<typeof ChoiceCard> = {
  title: 'Components/ChoiceCard',
  component: ChoiceCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Use ChoiceCard for rich checkbox or radio choices with a title and description. The card is a native label surface wired with htmlFor, while the nested Checkbox or RadioGroupItem remains the only interactive control. Use Label for simple inline controls and ChoiceRow for compact options.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['bordered', 'borderless'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChoiceCard>;

function getRequiredElement<T extends HTMLElement>(
  root: ParentNode,
  selector: string
) {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element for selector: ${selector}`);
  return element;
}

function getCardFor(root: ParentNode, controlId: string) {
  return getRequiredElement<HTMLLabelElement>(
    root,
    `[data-slot="choice-card"][for="${controlId}"]`
  );
}

function getBorderColor(element: HTMLElement) {
  return getComputedStyle(element).borderTopColor;
}

function getBackgroundColor(element: HTMLElement) {
  return getComputedStyle(element).backgroundColor;
}

type ChoiceCardVariant = NonNullable<ChoiceCardProps['variant']>;

interface PlanRadioCardsProps {
  idPrefix?: string;
  variant?: ChoiceCardVariant;
}

function PlanRadioCards({
  idPrefix = 'choice-card-radio',
  variant,
}: PlanRadioCardsProps = {}) {
  const legendId = React.useId();
  const standardId = `${idPrefix}-standard`;
  const priorityId = `${idPrefix}-priority`;

  return (
    <FieldSet className="nx:w-96 nx:max-w-full">
      <FieldLegend id={legendId}>Plan</FieldLegend>
      <RadioGroup aria-labelledby={legendId}>
        <ChoiceCard htmlFor={standardId} variant={variant}>
          <RadioGroupItem
            id={standardId}
            value="standard"
            aria-labelledby={`${standardId}-title`}
            aria-describedby={`${standardId}-description`}
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id={`${standardId}-title`}>
              Standard
            </ChoiceCardTitle>
            <ChoiceCardDescription id={`${standardId}-description`}>
              Best for most teams.
            </ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
        <ChoiceCard htmlFor={priorityId} variant={variant}>
          <RadioGroupItem
            id={priorityId}
            value="priority"
            aria-labelledby={`${priorityId}-title`}
            aria-describedby={`${priorityId}-description`}
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id={`${priorityId}-title`}>
              Priority
            </ChoiceCardTitle>
            <ChoiceCardDescription id={`${priorityId}-description`}>
              Faster response routing for urgent teams.
            </ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
      </RadioGroup>
    </FieldSet>
  );
}

interface CheckboxChoiceCardProps {
  defaultChecked?: boolean;
  description: string;
  disabled?: boolean;
  id: string;
  invalid?: boolean;
  title: string;
  trailing?: boolean;
  variant?: ChoiceCardVariant;
}

function CheckboxChoiceCard({
  defaultChecked,
  description,
  disabled,
  id,
  invalid,
  title,
  trailing,
  variant,
}: CheckboxChoiceCardProps) {
  const checkbox = (
    <Checkbox
      id={id}
      defaultChecked={defaultChecked}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    />
  );
  const content = (
    <ChoiceCardContent>
      <ChoiceCardTitle id={`${id}-title`}>{title}</ChoiceCardTitle>
      <ChoiceCardDescription id={`${id}-description`}>
        {description}
      </ChoiceCardDescription>
    </ChoiceCardContent>
  );

  return (
    <ChoiceCard htmlFor={id} variant={variant}>
      {trailing ? content : checkbox}
      {trailing ? checkbox : content}
    </ChoiceCard>
  );
}

interface RadioChoiceCardProps {
  defaultValue?: string;
  description: string;
  disabled?: boolean;
  id: string;
  invalid?: boolean;
  title: string;
  trailing?: boolean;
  variant?: ChoiceCardVariant;
}

function RadioChoiceCard({
  defaultValue,
  description,
  disabled,
  id,
  invalid,
  title,
  trailing,
  variant,
}: RadioChoiceCardProps) {
  const item = (
    <RadioGroupItem
      id={id}
      value={id}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    />
  );
  const content = (
    <ChoiceCardContent>
      <ChoiceCardTitle id={`${id}-title`}>{title}</ChoiceCardTitle>
      <ChoiceCardDescription id={`${id}-description`}>
        {description}
      </ChoiceCardDescription>
    </ChoiceCardContent>
  );

  return (
    <RadioGroup aria-label={title} defaultValue={defaultValue ?? id}>
      <ChoiceCard htmlFor={id} variant={variant}>
        {trailing ? content : item}
        {trailing ? item : content}
      </ChoiceCard>
    </RadioGroup>
  );
}

export const Default: Story = {
  render: () => (
    <div className="nx:w-96 nx:max-w-full">
      <ChoiceCard htmlFor="choice-card-default">
        <Checkbox
          id="choice-card-default"
          aria-labelledby="choice-card-default-title"
          aria-describedby="choice-card-default-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-default-title">
            Product updates
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-default-description">
            News about features and improvements.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Product updates',
    });
    const card = getCardFor(canvasElement, 'choice-card-default');

    await expect(card).toHaveAttribute('data-variant', 'bordered');
    await expect(checkbox).not.toBeChecked();
    await expect(checkbox).toHaveAccessibleName('Product updates');
    await expect(checkbox).toHaveAccessibleDescription(
      'News about features and improvements.'
    );
    await expect(checkbox).not.toHaveAccessibleName(
      /News about features and improvements/i
    );
    await expect(getComputedStyle(checkbox).marginTop).toBe('2px');
  },
};

export const WithRadioGroup: Story = {
  render: () => <PlanRadioCards />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Plan' });
    const standard = canvas.getByRole('radio', { name: 'Standard' });
    const priority = canvas.getByRole('radio', { name: 'Priority' });

    await expect(group).toHaveAccessibleName('Plan');
    await expect(standard).toHaveAccessibleDescription('Best for most teams.');
    await expect(priority).toHaveAccessibleDescription(
      'Faster response routing for urgent teams.'
    );
    await expect(getComputedStyle(standard).marginTop).toBe('2px');

    await userEvent.click(
      canvas.getByText('Faster response routing for urgent teams.')
    );
    await expect(priority).toHaveAttribute('data-state', 'checked');
    await expect(standard).toHaveAttribute('data-state', 'unchecked');
  },
};

export const TrailingControl: Story = {
  render: () => (
    <div className="nx:w-96 nx:max-w-full">
      <CheckboxChoiceCard
        id="choice-card-trailing"
        defaultChecked
        trailing
        title="Billing notices"
        description="Invoices, receipts, and payment updates for every workspace seat in this account."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = getCardFor(canvasElement, 'choice-card-trailing');
    const content = getRequiredElement(
      canvasElement,
      '[data-slot="choice-card-content"]'
    );
    const checkbox = getRequiredElement<HTMLInputElement>(
      canvasElement,
      '#choice-card-trailing'
    );

    await expect(card.children[0]).toBe(content);
    await expect(card.children[1]).toBe(checkbox);
    await expect(getComputedStyle(checkbox).marginTop).toBe('2px');
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="nx:grid nx:w-96 nx:max-w-full nx:gap-3">
      <CheckboxChoiceCard
        id="choice-card-disabled"
        disabled
        title="Locked notifications"
        description="This setting is managed by your workspace."
      />
      <CheckboxChoiceCard
        id="choice-card-disabled-checked"
        disabled
        defaultChecked
        title="Disabled selected"
        description="Selected state does not override disabled styling."
      />
      <CheckboxChoiceCard
        id="choice-card-disabled-invalid"
        disabled
        invalid
        title="Disabled invalid"
        description="Invalid state does not override disabled styling."
      />
      <RadioChoiceCard
        id="choice-card-disabled-radio"
        disabled
        title="Disabled radio"
        description="Radio disabled state styles the card shell."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabled = canvas.getByRole('checkbox', {
      name: 'Locked notifications',
    });
    const disabledChecked = canvas.getByRole('checkbox', {
      name: 'Disabled selected',
    });
    const disabledInvalid = canvas.getByRole('checkbox', {
      name: 'Disabled invalid',
    });
    const disabledRadio = canvas.getByRole('radio', {
      name: 'Disabled radio',
    });
    const disabledCard = getCardFor(canvasElement, 'choice-card-disabled');
    const disabledCheckedCard = getCardFor(
      canvasElement,
      'choice-card-disabled-checked'
    );
    const disabledInvalidCard = getCardFor(
      canvasElement,
      'choice-card-disabled-invalid'
    );
    const disabledRadioCard = getCardFor(
      canvasElement,
      'choice-card-disabled-radio'
    );

    await expect(disabled).toBeDisabled();
    await expect(disabledChecked).toBeDisabled();
    await expect(disabledInvalid).toBeDisabled();
    await expect(disabledRadio).toBeDisabled();
    await expect(disabledChecked).toBeChecked();
    await expect(disabledInvalid).toHaveAttribute('aria-invalid', 'true');

    await userEvent.click(
      canvas.getByText('This setting is managed by your workspace.')
    );
    await expect(disabled).not.toBeChecked();

    await expect(getComputedStyle(disabledCard).cursor).toBe('not-allowed');
    await expect(getComputedStyle(disabledCheckedCard).cursor).toBe(
      'not-allowed'
    );
    await expect(getComputedStyle(disabledInvalidCard).cursor).toBe(
      'not-allowed'
    );
    await expect(getComputedStyle(disabledRadioCard).cursor).toBe(
      'not-allowed'
    );
    await expect(getBorderColor(disabledCheckedCard)).toBe(
      getBorderColor(disabledCard)
    );
    await expect(getBorderColor(disabledInvalidCard)).toBe(
      getBorderColor(disabledCard)
    );
    await expect(getBorderColor(disabledRadioCard)).toBe(
      getBorderColor(disabledCard)
    );
  },
};

export const Invalid: Story = {
  render: () => (
    <div className="nx:grid nx:w-96 nx:max-w-full nx:gap-3">
      <CheckboxChoiceCard
        id="choice-card-invalid-unselected"
        title="Optional alerts"
        description="Unselected reference card."
      />
      <CheckboxChoiceCard
        id="choice-card-invalid-selected"
        defaultChecked
        title="Selected alerts"
        description="Selected reference card."
      />
      <CheckboxChoiceCard
        id="choice-card-invalid"
        defaultChecked
        invalid
        title="Required policy"
        description="Resolve this selection before continuing."
      />
      <RadioChoiceCard
        id="choice-card-invalid-radio"
        invalid
        title="Invalid radio"
        description="Radio invalid state uses the error border."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unselectedCard = getCardFor(
      canvasElement,
      'choice-card-invalid-unselected'
    );
    const selectedCard = getCardFor(
      canvasElement,
      'choice-card-invalid-selected'
    );
    const invalidCard = getCardFor(canvasElement, 'choice-card-invalid');
    const invalidRadioCard = getCardFor(
      canvasElement,
      'choice-card-invalid-radio'
    );
    const invalid = canvas.getByRole('checkbox', { name: 'Required policy' });
    const invalidRadio = canvas.getByRole('radio', { name: 'Invalid radio' });

    await expect(invalid).toBeChecked();
    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(invalidRadio).toHaveAttribute('aria-invalid', 'true');
    await expect(invalid).toHaveAccessibleDescription(
      'Resolve this selection before continuing.'
    );

    await expect(getBorderColor(selectedCard)).not.toBe(
      getBorderColor(unselectedCard)
    );
    await expect(getBorderColor(invalidCard)).not.toBe(
      getBorderColor(selectedCard)
    );
    await expect(getBorderColor(invalidRadioCard)).toBe(
      getBorderColor(invalidCard)
    );
  },
};

export const Indeterminate: Story = {
  render: () => (
    <div className="nx:grid nx:w-96 nx:max-w-full nx:gap-3">
      <CheckboxChoiceCard
        id="choice-card-indeterminate-unselected"
        title="Unselected group"
        description="Reference card with no selection."
      />
      <CheckboxChoiceCard
        id="choice-card-indeterminate-checked"
        defaultChecked
        title="Selected group"
        description="Reference card with selected styling."
      />
      <ChoiceCard htmlFor="choice-card-indeterminate">
        <Checkbox
          id="choice-card-indeterminate"
          checked="indeterminate"
          aria-labelledby="choice-card-indeterminate-title"
          aria-describedby="choice-card-indeterminate-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-indeterminate-title">
            Partial group
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-indeterminate-description">
            Some nested settings are selected.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unselectedCard = getCardFor(
      canvasElement,
      'choice-card-indeterminate-unselected'
    );
    const checkedCard = getCardFor(
      canvasElement,
      'choice-card-indeterminate-checked'
    );
    const indeterminateCard = getCardFor(
      canvasElement,
      'choice-card-indeterminate'
    );
    const indeterminate = canvas.getByRole('checkbox', {
      name: 'Partial group',
    });

    await expect(indeterminate).toHaveAttribute('data-state', 'indeterminate');
    await expect(getBorderColor(checkedCard)).not.toBe(
      getBorderColor(unselectedCard)
    );
    await expect(getBorderColor(indeterminateCard)).toBe(
      getBorderColor(checkedCard)
    );
    await expect(getBackgroundColor(indeterminateCard)).toBe(
      getBackgroundColor(checkedCard)
    );
  },
};

export const ClickInteraction: Story = {
  render: () => (
    <div className="nx:w-96 nx:max-w-full">
      <CheckboxChoiceCard
        id="choice-card-click"
        title="Security alerts"
        description="Critical notices about your account."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Security alerts',
    });

    await expect(checkbox).not.toBeChecked();
    await userEvent.click(
      canvas.getByText('Critical notices about your account.')
    );
    await expect(checkbox).toBeChecked();

    await userEvent.click(canvas.getByText('Security alerts'));
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
  },
};

export const KeyboardInteraction: Story = {
  render: () => (
    <div className="nx:grid nx:w-96 nx:max-w-full nx:gap-6">
      <CheckboxChoiceCard
        id="choice-card-keyboard-checkbox"
        title="Keyboard checkbox"
        description="Tab lands on the checkbox, not the card."
      />
      <PlanRadioCards />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxCard = getCardFor(
      canvasElement,
      'choice-card-keyboard-checkbox'
    );
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Keyboard checkbox',
    });
    const standard = canvas.getByRole('radio', { name: 'Standard' });
    const priority = canvas.getByRole('radio', { name: 'Priority' });

    await expect(checkboxCard).not.toHaveAttribute('tabindex');
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();

    await userEvent.keyboard(' ');
    await expect(checkbox).toBeChecked();

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

export const WithDataAttributes: Story = {
  render: () => (
    <div className="nx:w-96 nx:max-w-full">
      <CheckboxChoiceCard
        id="choice-card-data"
        defaultChecked
        variant="borderless"
        title="Billing"
        description="Invoices and payment receipts."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = getCardFor(canvasElement, 'choice-card-data');
    const content = getRequiredElement(
      canvasElement,
      '[data-slot="choice-card-content"]'
    );
    const title = getRequiredElement(
      canvasElement,
      '[data-slot="choice-card-title"]'
    );
    const description = getRequiredElement(
      canvasElement,
      '[data-slot="choice-card-description"]'
    );

    await expect(card).toHaveAttribute('data-slot', 'choice-card');
    await expect(card).toHaveAttribute('data-variant', 'borderless');
    await expect(card).not.toHaveAttribute('role');
    await expect(card).not.toHaveAttribute('tabindex');
    await expect(content).toHaveAttribute('data-slot', 'choice-card-content');
    await expect(title).toHaveAttribute('data-slot', 'choice-card-title');
    await expect(description).toHaveAttribute(
      'data-slot',
      'choice-card-description'
    );
    await expect(
      Math.round(card.getBoundingClientRect().height)
    ).toBeGreaterThanOrEqual(44);
  },
};

export const EdgeCases: Story = {
  render: () => (
    <div className="nx:grid nx:w-52 nx:gap-3">
      <CheckboxChoiceCard
        id="choice-card-edge-reference"
        title="Reference"
        description="Plain unselected card."
      />
      <ChoiceCard htmlFor="choice-card-edge-decoy">
        <Checkbox
          id="choice-card-edge-decoy"
          aria-labelledby="choice-card-edge-decoy-title"
          aria-describedby="choice-card-edge-decoy-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-edge-decoy-title">
            Decoy state
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-edge-decoy-description">
            <span data-state="checked">Nested data-state checked</span>
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
      <CheckboxChoiceCard
        id="choice-card-edge-long"
        title="SupercalifragilisticexpialidociousNotificationPreferenceTitleThatShouldWrap"
        description="PneumonoultramicroscopicsilicovolcanoconiosisDescriptionThatShouldStayInsideTheCard"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const referenceCard = getCardFor(
      canvasElement,
      'choice-card-edge-reference'
    );
    const decoyCard = getCardFor(canvasElement, 'choice-card-edge-decoy');
    const decoy = getRequiredElement(canvasElement, '[data-state="checked"]');
    const longTitle = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-card-edge-long-title'
    );
    const longDescription = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-card-edge-long-description'
    );

    await expect(decoy).toHaveTextContent('Nested data-state checked');
    await expect(getBorderColor(decoyCard)).toBe(getBorderColor(referenceCard));
    await expect(getBackgroundColor(decoyCard)).toBe(
      getBackgroundColor(referenceCard)
    );
    await expect(longTitle.scrollWidth).toBeLessThanOrEqual(
      longTitle.clientWidth + 1
    );
    await expect(longDescription.scrollWidth).toBeLessThanOrEqual(
      longDescription.clientWidth + 1
    );
  },
};

export const Dark: Story = {
  render: () => (
    <div className="dark nx:grid nx:w-96 nx:max-w-full nx:gap-3 nx:rounded-md nx:bg-background nx:p-4 nx:text-foreground">
      <CheckboxChoiceCard
        id="choice-card-dark"
        defaultChecked
        title="Dark mode card"
        description="Semantic tokens adapt across themes."
      />
      <RadioChoiceCard
        id="choice-card-dark-radio"
        trailing
        variant="borderless"
        title="Dark radio card"
        description="Radio card states use the same semantic tokens."
      />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:w-[min(100%,56rem)] nx:grid-cols-1 nx:gap-6 nx:md:grid-cols-2">
      <div className="nx:grid nx:gap-3">
        <CheckboxChoiceCard
          id="choice-card-checkbox-bordered"
          title="Checkbox bordered"
          description="Default rich option card with a visible frame."
        />
        <CheckboxChoiceCard
          id="choice-card-checkbox-borderless"
          variant="borderless"
          title="Checkbox borderless"
          description="Quiet option card that still shows selected state."
        />
      </div>
      <div className="nx:grid nx:gap-3">
        <RadioChoiceCard
          id="choice-card-radio-bordered"
          title="Radio bordered"
          description="Radio choices use the same card shell."
        />
        <RadioChoiceCard
          id="choice-card-radio-borderless"
          variant="borderless"
          trailing
          title="Radio borderless"
          description="Trailing controls use child order and top alignment."
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll('[data-slot="choice-card"]');
    const checkboxBordered = getCardFor(
      canvasElement,
      'choice-card-checkbox-bordered'
    );
    const checkboxBorderless = getCardFor(
      canvasElement,
      'choice-card-checkbox-borderless'
    );
    const radioBordered = getCardFor(
      canvasElement,
      'choice-card-radio-bordered'
    );
    const radioBorderless = getCardFor(
      canvasElement,
      'choice-card-radio-borderless'
    );
    const trailingRadio = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-card-radio-borderless'
    );

    await expect(cards).toHaveLength(4);
    await expect(checkboxBordered).toHaveAttribute('data-variant', 'bordered');
    await expect(checkboxBorderless).toHaveAttribute(
      'data-variant',
      'borderless'
    );
    await expect(radioBordered).toHaveAttribute('data-variant', 'bordered');
    await expect(radioBorderless).toHaveAttribute('data-variant', 'borderless');
    await expect(getBorderColor(checkboxBorderless)).not.toBe(
      getBorderColor(checkboxBordered)
    );
    await expect(getComputedStyle(trailingRadio).marginTop).toBe('2px');
  },
};
