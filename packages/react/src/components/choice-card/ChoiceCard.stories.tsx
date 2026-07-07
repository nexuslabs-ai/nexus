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
    controlPosition: {
      control: 'radio',
      options: ['before', 'after'],
    },
    floating: {
      control: 'boolean',
    },
    variant: {
      control: 'radio',
      options: ['default', 'outline'],
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
type ChoiceCardControlPosition = NonNullable<
  ChoiceCardProps['controlPosition']
>;

interface PlanRadioCardsProps {
  controlPosition?: ChoiceCardControlPosition;
  floating?: boolean;
  idPrefix?: string;
  variant?: ChoiceCardVariant;
}

function PlanRadioCards({
  controlPosition,
  floating,
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
        <ChoiceCard
          htmlFor={standardId}
          controlPosition={controlPosition}
          floating={floating}
          variant={variant}
        >
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
        <ChoiceCard
          htmlFor={priorityId}
          controlPosition={controlPosition}
          floating={floating}
          variant={variant}
        >
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
  checked?: React.ComponentProps<typeof Checkbox>['checked'];
  controlPosition?: ChoiceCardControlPosition;
  defaultChecked?: boolean;
  description: string;
  disabled?: boolean;
  floating?: boolean;
  id: string;
  invalid?: boolean;
  title: string;
  variant?: ChoiceCardVariant;
}

function CheckboxChoiceCard({
  checked,
  controlPosition,
  defaultChecked,
  description,
  disabled,
  floating,
  id,
  invalid,
  title,
  variant,
}: CheckboxChoiceCardProps) {
  const stateProps = checked === undefined ? { defaultChecked } : { checked };

  return (
    <ChoiceCard
      htmlFor={id}
      controlPosition={controlPosition}
      floating={floating}
      variant={variant}
    >
      <Checkbox
        id={id}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        {...stateProps}
      />
      <ChoiceCardContent>
        <ChoiceCardTitle id={`${id}-title`}>{title}</ChoiceCardTitle>
        <ChoiceCardDescription id={`${id}-description`}>
          {description}
        </ChoiceCardDescription>
      </ChoiceCardContent>
    </ChoiceCard>
  );
}

interface RadioChoiceCardProps {
  controlPosition?: ChoiceCardControlPosition;
  description: string;
  disabled?: boolean;
  floating?: boolean;
  id: string;
  invalid?: boolean;
  title: string;
  variant?: ChoiceCardVariant;
}

function RadioChoiceCard({
  controlPosition,
  description,
  disabled,
  floating,
  id,
  invalid,
  title,
  variant,
}: RadioChoiceCardProps) {
  return (
    <RadioGroup aria-label={title} defaultValue={id}>
      <ChoiceCard
        htmlFor={id}
        controlPosition={controlPosition}
        floating={floating}
        variant={variant}
      >
        <RadioGroupItem
          id={id}
          value={id}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id={`${id}-title`}>{title}</ChoiceCardTitle>
          <ChoiceCardDescription id={`${id}-description`}>
            {description}
          </ChoiceCardDescription>
        </ChoiceCardContent>
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

    await expect(checkbox).not.toBeChecked();
    await expect(checkbox).toHaveAccessibleName('Product updates');
    await expect(checkbox).toHaveAccessibleDescription(
      'News about features and improvements.'
    );
    await expect(checkbox).not.toHaveAccessibleName(
      /News about features and improvements/i
    );
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

    await userEvent.click(
      canvas.getByText('Faster response routing for urgent teams.')
    );
    await expect(priority).toHaveAttribute('data-state', 'checked');
    await expect(standard).toHaveAttribute('data-state', 'unchecked');
  },
};

export const VisualVariants: Story = {
  render: function VisualVariantsStory() {
    const variants = ['default', 'outline'] as const;
    const controlPositions = ['before', 'after'] as const;
    const floatingStates = [true, false] as const;

    return (
      <div className="nx:grid nx:w-[min(100%,64rem)] nx:grid-cols-1 nx:gap-6 nx:md:grid-cols-2">
        <div className="nx:grid nx:gap-3">
          {variants.flatMap((variant) =>
            controlPositions.flatMap((controlPosition) =>
              floatingStates.map((floating) => {
                const id = `choice-card-checkbox-${variant}-${controlPosition}-${floating ? 'floating' : 'attached'}`;

                return (
                  <CheckboxChoiceCard
                    key={id}
                    id={id}
                    variant={variant}
                    controlPosition={controlPosition}
                    floating={floating}
                    defaultChecked={variant === 'outline'}
                    title={`Checkbox ${variant} ${controlPosition} ${floating ? 'floating' : 'attached'}`}
                    description="Checkbox cards share the same visual variants."
                  />
                );
              })
            )
          )}
        </div>
        <div className="nx:grid nx:gap-3">
          {variants.flatMap((variant) =>
            controlPositions.flatMap((controlPosition) =>
              floatingStates.map((floating) => {
                const id = `choice-card-radio-${variant}-${controlPosition}-${floating ? 'floating' : 'attached'}`;

                return (
                  <RadioChoiceCard
                    key={id}
                    id={id}
                    variant={variant}
                    controlPosition={controlPosition}
                    floating={floating}
                    title={`Radio ${variant} ${controlPosition} ${floating ? 'floating' : 'attached'}`}
                    description="Radio cards use the same card shell."
                  />
                );
              })
            )
          )}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll('[data-slot="choice-card"]');
    const checkboxDefaultBefore = getCardFor(
      canvasElement,
      'choice-card-checkbox-default-before-floating'
    );
    const checkboxOutlineAfter = getCardFor(
      canvasElement,
      'choice-card-checkbox-outline-after-attached'
    );
    const radioDefaultAfter = getCardFor(
      canvasElement,
      'choice-card-radio-default-after-floating'
    );
    const radioOutlineBefore = getCardFor(
      canvasElement,
      'choice-card-radio-outline-before-attached'
    );
    const checkboxBeforeControl = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-card-checkbox-default-before-floating'
    );
    const checkboxAfterControl = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-card-checkbox-outline-after-attached'
    );
    const radioBeforeControl = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-card-radio-outline-before-attached'
    );
    const radioAfterControl = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-card-radio-default-after-floating'
    );

    await expect(cards).toHaveLength(16);
    await expect(checkboxDefaultBefore).toHaveAttribute(
      'data-variant',
      'default'
    );
    await expect(checkboxDefaultBefore).toHaveAttribute(
      'data-control-position',
      'before'
    );
    await expect(checkboxDefaultBefore).toHaveAttribute(
      'data-floating',
      'true'
    );
    await expect(checkboxOutlineAfter).toHaveAttribute(
      'data-variant',
      'outline'
    );
    await expect(checkboxOutlineAfter).toHaveAttribute(
      'data-control-position',
      'after'
    );
    await expect(checkboxOutlineAfter).toHaveAttribute(
      'data-floating',
      'false'
    );
    await expect(radioDefaultAfter).toHaveAttribute(
      'data-control-position',
      'after'
    );
    await expect(radioOutlineBefore).toHaveAttribute('data-variant', 'outline');
    await expect(getComputedStyle(checkboxBeforeControl).marginTop).toBe('2px');
    await expect(getComputedStyle(radioBeforeControl).marginTop).toBe('2px');
    await expect(getComputedStyle(checkboxAfterControl).marginTop).toBe('0px');
    await expect(getComputedStyle(radioAfterControl).marginTop).toBe('0px');
  },
};

export const TrailingControl: Story = {
  render: () => (
    <div className="nx:w-96 nx:max-w-full">
      <ChoiceCard htmlFor="choice-card-trailing" controlPosition="after">
        <Checkbox
          id="choice-card-trailing"
          defaultChecked
          aria-labelledby="choice-card-trailing-title"
          aria-describedby="choice-card-trailing-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-trailing-title">
            Billing notices
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-trailing-description">
            Invoices, receipts, and payment updates.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="nx:grid nx:w-96 nx:max-w-full nx:gap-3">
      <ChoiceCard htmlFor="choice-card-disabled">
        <Checkbox
          id="choice-card-disabled"
          disabled
          aria-labelledby="choice-card-disabled-title"
          aria-describedby="choice-card-disabled-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-disabled-title">
            Locked notifications
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-disabled-description">
            This setting is managed by your workspace.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
      <ChoiceCard htmlFor="choice-card-disabled-checked">
        <Checkbox
          id="choice-card-disabled-checked"
          disabled
          defaultChecked
          aria-labelledby="choice-card-disabled-checked-title"
          aria-describedby="choice-card-disabled-checked-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-disabled-checked-title">
            Disabled selected
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-disabled-checked-description">
            Selected state does not override disabled styling.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
      <ChoiceCard htmlFor="choice-card-disabled-invalid">
        <Checkbox
          id="choice-card-disabled-invalid"
          disabled
          aria-invalid
          aria-labelledby="choice-card-disabled-invalid-title"
          aria-describedby="choice-card-disabled-invalid-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-disabled-invalid-title">
            Disabled invalid
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-disabled-invalid-description">
            Invalid state does not override disabled styling.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
      <RadioGroup aria-label="Disabled radio cards" defaultValue="radio-locked">
        <ChoiceCard htmlFor="choice-card-disabled-radio" variant="outline">
          <RadioGroupItem
            id="choice-card-disabled-radio"
            value="radio-locked"
            disabled
            aria-labelledby="choice-card-disabled-radio-title"
            aria-describedby="choice-card-disabled-radio-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-disabled-radio-title">
              Disabled radio
            </ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-disabled-radio-description">
              Radio disabled state styles the card shell.
            </ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
      </RadioGroup>
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
      <ChoiceCard htmlFor="choice-card-invalid-unselected">
        <Checkbox
          id="choice-card-invalid-unselected"
          aria-labelledby="choice-card-invalid-unselected-title"
          aria-describedby="choice-card-invalid-unselected-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-invalid-unselected-title">
            Optional alerts
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-invalid-unselected-description">
            Unselected reference card.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
      <ChoiceCard htmlFor="choice-card-invalid-selected">
        <Checkbox
          id="choice-card-invalid-selected"
          defaultChecked
          aria-labelledby="choice-card-invalid-selected-title"
          aria-describedby="choice-card-invalid-selected-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-invalid-selected-title">
            Selected alerts
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-invalid-selected-description">
            Selected reference card.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
      <ChoiceCard htmlFor="choice-card-invalid">
        <Checkbox
          id="choice-card-invalid"
          defaultChecked
          aria-invalid
          aria-labelledby="choice-card-invalid-title"
          aria-describedby="choice-card-invalid-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-invalid-title">
            Required policy
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-invalid-description">
            Resolve this selection before continuing.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
      <RadioGroup aria-label="Invalid radio cards" defaultValue="invalid-radio">
        <ChoiceCard htmlFor="choice-card-invalid-radio" variant="outline">
          <RadioGroupItem
            id="choice-card-invalid-radio"
            value="invalid-radio"
            aria-invalid
            aria-labelledby="choice-card-invalid-radio-title"
            aria-describedby="choice-card-invalid-radio-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-invalid-radio-title">
              Invalid radio
            </ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-invalid-radio-description">
              Radio invalid state uses the error border.
            </ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
      </RadioGroup>
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
      <ChoiceCard htmlFor="choice-card-indeterminate-unselected">
        <Checkbox
          id="choice-card-indeterminate-unselected"
          aria-labelledby="choice-card-indeterminate-unselected-title"
          aria-describedby="choice-card-indeterminate-unselected-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-indeterminate-unselected-title">
            Unselected group
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-indeterminate-unselected-description">
            Reference card with no selection.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
      <ChoiceCard htmlFor="choice-card-indeterminate-checked">
        <Checkbox
          id="choice-card-indeterminate-checked"
          defaultChecked
          aria-labelledby="choice-card-indeterminate-checked-title"
          aria-describedby="choice-card-indeterminate-checked-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-indeterminate-checked-title">
            Selected group
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-indeterminate-checked-description">
            Reference card with selected styling.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
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
      <ChoiceCard htmlFor="choice-card-click">
        <Checkbox
          id="choice-card-click"
          aria-labelledby="choice-card-click-title"
          aria-describedby="choice-card-click-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-click-title">
            Security alerts
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-click-description">
            Critical notices about your account.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
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
      <ChoiceCard htmlFor="choice-card-keyboard-checkbox">
        <Checkbox
          id="choice-card-keyboard-checkbox"
          aria-labelledby="choice-card-keyboard-checkbox-title"
          aria-describedby="choice-card-keyboard-checkbox-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-keyboard-checkbox-title">
            Keyboard checkbox
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-keyboard-checkbox-description">
            Tab lands on the checkbox, not the card.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
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
      <ChoiceCard
        htmlFor="choice-card-data"
        controlPosition="after"
        floating={false}
        variant="outline"
      >
        <Checkbox
          id="choice-card-data"
          defaultChecked
          aria-labelledby="choice-card-data-title"
          aria-describedby="choice-card-data-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-data-title">Billing</ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-data-description">
            Invoices and payment receipts.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
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
    await expect(card).toHaveAttribute('data-control-position', 'after');
    await expect(card).toHaveAttribute('data-floating', 'false');
    await expect(card).toHaveAttribute('data-variant', 'outline');
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
      <ChoiceCard htmlFor="choice-card-edge-reference">
        <Checkbox
          id="choice-card-edge-reference"
          aria-labelledby="choice-card-edge-reference-title"
          aria-describedby="choice-card-edge-reference-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-edge-reference-title">
            Reference
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-edge-reference-description">
            Plain unselected card.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
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
      <ChoiceCard htmlFor="choice-card-edge-long">
        <Checkbox
          id="choice-card-edge-long"
          aria-labelledby="choice-card-edge-long-title"
          aria-describedby="choice-card-edge-long-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-edge-long-title">
            SupercalifragilisticexpialidociousNotificationPreferenceTitleThatShouldWrap
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-edge-long-description">
            PneumonoultramicroscopicsilicovolcanoconiosisDescriptionThatShouldStayInsideTheCard
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
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
      <ChoiceCard htmlFor="choice-card-dark" variant="outline">
        <Checkbox
          id="choice-card-dark"
          defaultChecked
          aria-labelledby="choice-card-dark-title"
          aria-describedby="choice-card-dark-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-dark-title">
            Dark mode card
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-dark-description">
            Semantic tokens adapt across themes.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
      <RadioGroup aria-label="Dark radio card" defaultValue="dark-radio">
        <ChoiceCard
          htmlFor="choice-card-dark-radio"
          controlPosition="after"
          variant="outline"
        >
          <RadioGroupItem
            id="choice-card-dark-radio"
            value="dark-radio"
            aria-labelledby="choice-card-dark-radio-title"
            aria-describedby="choice-card-dark-radio-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-dark-radio-title">
              Dark radio card
            </ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-dark-radio-description">
              Radio card states use the same semantic tokens.
            </ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
      </RadioGroup>
    </div>
  ),
};

export const AllVariants: Story = {
  render: function AllVariantsShowcase() {
    const uid = React.useId();

    return (
      <div className="nx:flex nx:w-96 nx:max-w-full nx:flex-col nx:gap-6">
        <div className="nx:grid nx:gap-3">
          <ChoiceCard htmlFor={`${uid}-unchecked`}>
            <Checkbox
              id={`${uid}-unchecked`}
              aria-labelledby={`${uid}-unchecked-title`}
              aria-describedby={`${uid}-unchecked-description`}
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id={`${uid}-unchecked-title`}>
                Unchecked
              </ChoiceCardTitle>
              <ChoiceCardDescription id={`${uid}-unchecked-description`}>
                Default rich checkbox card.
              </ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
          <ChoiceCard htmlFor={`${uid}-checked`}>
            <Checkbox
              id={`${uid}-checked`}
              defaultChecked
              aria-labelledby={`${uid}-checked-title`}
              aria-describedby={`${uid}-checked-description`}
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id={`${uid}-checked-title`}>
                Checked
              </ChoiceCardTitle>
              <ChoiceCardDescription id={`${uid}-checked-description`}>
                Selected card shell is decorative.
              </ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
          <ChoiceCard htmlFor={`${uid}-indeterminate`}>
            <Checkbox
              id={`${uid}-indeterminate`}
              checked="indeterminate"
              aria-labelledby={`${uid}-indeterminate-title`}
              aria-describedby={`${uid}-indeterminate-description`}
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id={`${uid}-indeterminate-title`}>
                Indeterminate
              </ChoiceCardTitle>
              <ChoiceCardDescription id={`${uid}-indeterminate-description`}>
                Mixed state uses selected-like card styling.
              </ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
          <ChoiceCard htmlFor={`${uid}-invalid`}>
            <Checkbox
              id={`${uid}-invalid`}
              defaultChecked
              aria-invalid
              aria-labelledby={`${uid}-invalid-title`}
              aria-describedby={`${uid}-invalid-description`}
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id={`${uid}-invalid-title`}>
                Invalid checked
              </ChoiceCardTitle>
              <ChoiceCardDescription id={`${uid}-invalid-description`}>
                Invalid border wins over selected styling.
              </ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
          <ChoiceCard htmlFor={`${uid}-disabled`}>
            <Checkbox
              id={`${uid}-disabled`}
              disabled
              defaultChecked
              aria-labelledby={`${uid}-disabled-title`}
              aria-describedby={`${uid}-disabled-description`}
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id={`${uid}-disabled-title`}>
                Disabled checked
              </ChoiceCardTitle>
              <ChoiceCardDescription id={`${uid}-disabled-description`}>
                Disabled styling wins over other states.
              </ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
        </div>
        <PlanRadioCards />
      </div>
    );
  },
};
