import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { type PropType, useId } from 'vue';

import { Checkbox } from '../checkbox';
import { FieldLegend, FieldSet } from '../field';
import { RadioGroup, RadioGroupItem } from '../radio-group';

import {
  ChoiceCard,
  ChoiceCardContent,
  ChoiceCardDescription,
  type ChoiceCardProps,
  ChoiceCardTitle,
} from '.';

const meta = {
  title: 'Components/ChoiceCard',
  component: ChoiceCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'ChoiceCard is a clickable card for a checkbox or radio choice with a title and description. The nested Checkbox or RadioGroupItem stays the only control. For a simple inline label use Label, and for compact options use ChoiceRow.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['bordered', 'borderless'],
    },
  },
} satisfies Meta<typeof ChoiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

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

const cardComponents = {
  ChoiceCard,
  ChoiceCardContent,
  ChoiceCardDescription,
  ChoiceCardTitle,
};

const PlanRadioCards = {
  components: {
    ...cardComponents,
    FieldLegend,
    FieldSet,
    RadioGroup,
    RadioGroupItem,
  },
  props: {
    idPrefix: { type: String, default: 'choice-card-radio' },
    variant: { type: String as PropType<ChoiceCardProps['variant']> },
  },
  setup: () => ({ legendId: useId() }),
  template: `
    <FieldSet class="nx:w-96 nx:max-w-full">
      <FieldLegend :id="legendId">Plan</FieldLegend>
      <RadioGroup :aria-labelledby="legendId">
        <ChoiceCard :for="idPrefix + '-standard'" :variant="variant">
          <RadioGroupItem
            :id="idPrefix + '-standard'"
            value="standard"
            :aria-labelledby="idPrefix + '-standard-title'"
            :aria-describedby="idPrefix + '-standard-description'"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle :id="idPrefix + '-standard-title'">Standard</ChoiceCardTitle>
            <ChoiceCardDescription :id="idPrefix + '-standard-description'">Best for most teams.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
        <ChoiceCard :for="idPrefix + '-priority'" :variant="variant">
          <RadioGroupItem
            :id="idPrefix + '-priority'"
            value="priority"
            :aria-labelledby="idPrefix + '-priority-title'"
            :aria-describedby="idPrefix + '-priority-description'"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle :id="idPrefix + '-priority-title'">Priority</ChoiceCardTitle>
            <ChoiceCardDescription :id="idPrefix + '-priority-description'">Faster response routing for urgent teams.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
      </RadioGroup>
    </FieldSet>
  `,
};

const CheckboxChoiceCard = {
  components: { ...cardComponents, Checkbox },
  props: {
    defaultChecked: Boolean,
    description: { type: String, required: true },
    disabled: Boolean,
    id: { type: String, required: true },
    invalid: Boolean,
    title: { type: String, required: true },
    trailing: Boolean,
    variant: { type: String as PropType<ChoiceCardProps['variant']> },
  },
  template: `
    <ChoiceCard :for="id" :variant="variant">
      <ChoiceCardContent v-if="trailing">
        <ChoiceCardTitle :id="id + '-title'">{{ title }}</ChoiceCardTitle>
        <ChoiceCardDescription :id="id + '-description'">{{ description }}</ChoiceCardDescription>
      </ChoiceCardContent>
      <Checkbox
        :id="id"
        :default-value="defaultChecked"
        :disabled="disabled"
        :aria-invalid="invalid || undefined"
        :aria-labelledby="id + '-title'"
        :aria-describedby="id + '-description'"
      />
      <ChoiceCardContent v-if="!trailing">
        <ChoiceCardTitle :id="id + '-title'">{{ title }}</ChoiceCardTitle>
        <ChoiceCardDescription :id="id + '-description'">{{ description }}</ChoiceCardDescription>
      </ChoiceCardContent>
    </ChoiceCard>
  `,
};

export const Default: Story = {
  tags: ['docs'],
  args: {
    variant: 'bordered',
  },
  render: () => ({
    components: {
      Checkbox,
      ChoiceCard,
      ChoiceCardContent,
      ChoiceCardDescription,
      ChoiceCardTitle,
    },
    template: `
      <div class="nx:w-96 nx:max-w-full">
        <ChoiceCard for="choice-card-default" variant="bordered">
          <Checkbox
            id="choice-card-default"
            aria-labelledby="choice-card-default-title"
            aria-describedby="choice-card-default-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-default-title">Product updates</ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-default-description">News about features and improvements.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Product updates',
    });
    const card = getCardFor(canvasElement, 'choice-card-default');

    await expect(card).toHaveAttribute(
      'data-variant',
      args.variant ?? 'bordered'
    );
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Pick one plan from a RadioGroup of cards.',
      },
    },
  },
  args: {
    variant: 'bordered',
  },
  render: () => ({
    components: {
      ChoiceCard,
      ChoiceCardContent,
      ChoiceCardDescription,
      ChoiceCardTitle,
      FieldLegend,
      FieldSet,
      RadioGroup,
      RadioGroupItem,
    },
    setup: () => ({ legendId: useId() }),
    template: `
      <FieldSet class="nx:w-96 nx:max-w-full">
        <FieldLegend :id="legendId">Plan</FieldLegend>
        <RadioGroup :aria-labelledby="legendId">
          <ChoiceCard for="choice-card-radio-standard" variant="bordered">
            <RadioGroupItem
              id="choice-card-radio-standard"
              value="standard"
              aria-labelledby="choice-card-radio-standard-title"
              aria-describedby="choice-card-radio-standard-description"
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id="choice-card-radio-standard-title">Standard</ChoiceCardTitle>
              <ChoiceCardDescription id="choice-card-radio-standard-description">Best for most teams.</ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
          <ChoiceCard for="choice-card-radio-priority" variant="bordered">
            <RadioGroupItem
              id="choice-card-radio-priority"
              value="priority"
              aria-labelledby="choice-card-radio-priority-title"
              aria-describedby="choice-card-radio-priority-description"
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id="choice-card-radio-priority-title">Priority</ChoiceCardTitle>
              <ChoiceCardDescription id="choice-card-radio-priority-description">Faster response routing for urgent teams.</ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
        </RadioGroup>
      </FieldSet>
    `,
  }),
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Put the content first to move the checkbox to the trailing edge.',
      },
    },
  },
  args: {
    variant: 'bordered',
  },
  render: () => ({
    components: {
      Checkbox,
      ChoiceCard,
      ChoiceCardContent,
      ChoiceCardDescription,
      ChoiceCardTitle,
    },
    template: `
      <div class="nx:w-96 nx:max-w-full">
        <ChoiceCard for="choice-card-trailing" variant="bordered">
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-trailing-title">Billing notices</ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-trailing-description">Invoices, receipts, and payment updates for every workspace seat in this account.</ChoiceCardDescription>
          </ChoiceCardContent>
          <Checkbox
            id="choice-card-trailing"
            :default-value="true"
            aria-labelledby="choice-card-trailing-title"
            aria-describedby="choice-card-trailing-description"
          />
        </ChoiceCard>
      </div>
    `,
  }),
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Disable the nested control to lock the choice and dim the card.',
      },
    },
  },
  render: () => ({
    components: {
      Checkbox,
      ChoiceCard,
      ChoiceCardContent,
      ChoiceCardDescription,
      ChoiceCardTitle,
      RadioGroup,
      RadioGroupItem,
    },
    template: `
      <div class="nx:grid nx:w-96 nx:max-w-full nx:gap-3">
        <ChoiceCard for="choice-card-disabled">
          <Checkbox
            id="choice-card-disabled"
            disabled
            aria-labelledby="choice-card-disabled-title"
            aria-describedby="choice-card-disabled-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-disabled-title">Locked notifications</ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-disabled-description">This setting is managed by your workspace.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
        <ChoiceCard for="choice-card-disabled-checked">
          <Checkbox
            id="choice-card-disabled-checked"
            :default-value="true"
            disabled
            aria-labelledby="choice-card-disabled-checked-title"
            aria-describedby="choice-card-disabled-checked-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-disabled-checked-title">Usage reports</ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-disabled-checked-description">Always on for workspace admins.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
        <ChoiceCard for="choice-card-disabled-invalid">
          <Checkbox
            id="choice-card-disabled-invalid"
            disabled
            aria-invalid="true"
            aria-labelledby="choice-card-disabled-invalid-title"
            aria-describedby="choice-card-disabled-invalid-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-disabled-invalid-title">Audit log export</ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-disabled-invalid-description">Unavailable until your billing details are fixed.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
        <RadioGroup aria-label="Enterprise plan" default-value="choice-card-disabled-radio">
          <ChoiceCard for="choice-card-disabled-radio">
            <RadioGroupItem
              id="choice-card-disabled-radio"
              value="choice-card-disabled-radio"
              disabled
              aria-labelledby="choice-card-disabled-radio-title"
              aria-describedby="choice-card-disabled-radio-description"
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id="choice-card-disabled-radio-title">Enterprise plan</ChoiceCardTitle>
              <ChoiceCardDescription id="choice-card-disabled-radio-description">Contact sales to switch to this plan.</ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
        </RadioGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabled = canvas.getByRole('checkbox', {
      name: 'Locked notifications',
    });
    const disabledChecked = canvas.getByRole('checkbox', {
      name: 'Usage reports',
    });
    const disabledInvalid = canvas.getByRole('checkbox', {
      name: 'Audit log export',
    });
    const disabledRadio = canvas.getByRole('radio', {
      name: 'Enterprise plan',
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `aria-invalid` on the nested control to give the card an error border.',
      },
    },
  },
  render: () => ({
    components: {
      Checkbox,
      ChoiceCard,
      ChoiceCardContent,
      ChoiceCardDescription,
      ChoiceCardTitle,
      RadioGroup,
      RadioGroupItem,
    },
    template: `
      <div class="nx:grid nx:w-96 nx:max-w-full nx:gap-3">
        <ChoiceCard for="choice-card-invalid-unselected">
          <Checkbox
            id="choice-card-invalid-unselected"
            aria-labelledby="choice-card-invalid-unselected-title"
            aria-describedby="choice-card-invalid-unselected-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-invalid-unselected-title">Product updates</ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-invalid-unselected-description">News about features and improvements.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
        <ChoiceCard for="choice-card-invalid-selected">
          <Checkbox
            id="choice-card-invalid-selected"
            :default-value="true"
            aria-labelledby="choice-card-invalid-selected-title"
            aria-describedby="choice-card-invalid-selected-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-invalid-selected-title">Security alerts</ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-invalid-selected-description">Sign-ins from new devices and password changes.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
        <ChoiceCard for="choice-card-invalid">
          <Checkbox
            id="choice-card-invalid"
            :default-value="true"
            aria-invalid="true"
            aria-labelledby="choice-card-invalid-title"
            aria-describedby="choice-card-invalid-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-invalid-title">Required policy</ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-invalid-description">Resolve this selection before continuing.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
        <RadioGroup aria-label="Annual billing" default-value="choice-card-invalid-radio">
          <ChoiceCard for="choice-card-invalid-radio">
            <RadioGroupItem
              id="choice-card-invalid-radio"
              value="choice-card-invalid-radio"
              aria-invalid="true"
              aria-labelledby="choice-card-invalid-radio-title"
              aria-describedby="choice-card-invalid-radio-description"
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id="choice-card-invalid-radio-title">Annual billing</ChoiceCardTitle>
              <ChoiceCardDescription id="choice-card-invalid-radio-description">Choose a billing period to continue.</ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
        </RadioGroup>
      </div>
    `,
  }),
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
    const invalidRadio = canvas.getByRole('radio', { name: 'Annual billing' });

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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Show a partly selected checkbox card with `model-value="indeterminate"`.',
      },
    },
  },
  render: () => ({
    components: {
      Checkbox,
      ChoiceCard,
      ChoiceCardContent,
      ChoiceCardDescription,
      ChoiceCardTitle,
    },
    template: `
      <div class="nx:grid nx:w-96 nx:max-w-full nx:gap-3">
        <ChoiceCard for="choice-card-indeterminate-unselected">
          <Checkbox
            id="choice-card-indeterminate-unselected"
            aria-labelledby="choice-card-indeterminate-unselected-title"
            aria-describedby="choice-card-indeterminate-unselected-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-indeterminate-unselected-title">Marketing</ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-indeterminate-unselected-description">Newsletters and event invitations.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
        <ChoiceCard for="choice-card-indeterminate-checked">
          <Checkbox
            id="choice-card-indeterminate-checked"
            :default-value="true"
            aria-labelledby="choice-card-indeterminate-checked-title"
            aria-describedby="choice-card-indeterminate-checked-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-indeterminate-checked-title">Account</ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-indeterminate-checked-description">Billing receipts and security notices.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
        <ChoiceCard for="choice-card-indeterminate">
          <Checkbox
            id="choice-card-indeterminate"
            model-value="indeterminate"
            aria-labelledby="choice-card-indeterminate-title"
            aria-describedby="choice-card-indeterminate-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-indeterminate-title">Product</ChoiceCardTitle>
            <ChoiceCardDescription id="choice-card-indeterminate-description">Some of these notifications are on.</ChoiceCardDescription>
          </ChoiceCardContent>
        </ChoiceCard>
      </div>
    `,
  }),
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
      name: 'Product',
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
  render: () => ({
    components: { CheckboxChoiceCard },
    template: `
      <div class="nx:w-96 nx:max-w-full">
        <CheckboxChoiceCard
          id="choice-card-click"
          title="Security alerts"
          description="Critical notices about your account."
        />
      </div>
    `,
  }),
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
  render: () => ({
    components: { CheckboxChoiceCard, PlanRadioCards },
    template: `
      <div class="nx:grid nx:w-96 nx:max-w-full nx:gap-6">
        <CheckboxChoiceCard
          id="choice-card-keyboard-checkbox"
          title="Keyboard checkbox"
          description="Tab lands on the checkbox, not the card."
        />
        <PlanRadioCards />
      </div>
    `,
  }),
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
  render: () => ({
    components: { CheckboxChoiceCard },
    template: `
      <div class="nx:w-96 nx:max-w-full">
        <CheckboxChoiceCard
          id="choice-card-data"
          default-checked
          variant="borderless"
          title="Billing"
          description="Invoices and payment receipts."
        />
      </div>
    `,
  }),
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
  render: () => ({
    components: { ...cardComponents, Checkbox, CheckboxChoiceCard },
    template: `
      <div class="nx:grid nx:w-52 nx:gap-3">
        <CheckboxChoiceCard
          id="choice-card-edge-reference"
          title="Reference"
          description="Plain unselected card."
        />
        <ChoiceCard for="choice-card-edge-decoy">
          <Checkbox
            id="choice-card-edge-decoy"
            aria-labelledby="choice-card-edge-decoy-title"
            aria-describedby="choice-card-edge-decoy-description"
          />
          <ChoiceCardContent>
            <ChoiceCardTitle id="choice-card-edge-decoy-title">Decoy state</ChoiceCardTitle>
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
    `,
  }),
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

export const AllVariants: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Compare bordered and borderless cards for checkboxes and radios.',
      },
    },
  },
  render: () => ({
    components: {
      Checkbox,
      ChoiceCard,
      ChoiceCardContent,
      ChoiceCardDescription,
      ChoiceCardTitle,
      RadioGroup,
      RadioGroupItem,
    },
    template: `
      <div class="nx:grid nx:w-[min(100%,56rem)] nx:grid-cols-1 nx:gap-6 nx:md:grid-cols-2">
        <div class="nx:grid nx:gap-3">
          <ChoiceCard for="choice-card-checkbox-bordered">
            <Checkbox
              id="choice-card-checkbox-bordered"
              aria-labelledby="choice-card-checkbox-bordered-title"
              aria-describedby="choice-card-checkbox-bordered-description"
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id="choice-card-checkbox-bordered-title">Checkbox bordered</ChoiceCardTitle>
              <ChoiceCardDescription id="choice-card-checkbox-bordered-description">Default rich option card with a visible frame.</ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
          <ChoiceCard for="choice-card-checkbox-borderless" variant="borderless">
            <Checkbox
              id="choice-card-checkbox-borderless"
              aria-labelledby="choice-card-checkbox-borderless-title"
              aria-describedby="choice-card-checkbox-borderless-description"
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id="choice-card-checkbox-borderless-title">Checkbox borderless</ChoiceCardTitle>
              <ChoiceCardDescription id="choice-card-checkbox-borderless-description">Quiet option card with no resting frame.</ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
        </div>
        <div class="nx:grid nx:gap-3">
          <RadioGroup aria-label="Radio bordered" default-value="choice-card-radio-bordered">
            <ChoiceCard for="choice-card-radio-bordered">
              <RadioGroupItem
                id="choice-card-radio-bordered"
                value="choice-card-radio-bordered"
                aria-labelledby="choice-card-radio-bordered-title"
                aria-describedby="choice-card-radio-bordered-description"
              />
              <ChoiceCardContent>
                <ChoiceCardTitle id="choice-card-radio-bordered-title">Radio bordered</ChoiceCardTitle>
                <ChoiceCardDescription id="choice-card-radio-bordered-description">Radio choices use the same card shell.</ChoiceCardDescription>
              </ChoiceCardContent>
            </ChoiceCard>
          </RadioGroup>
          <RadioGroup aria-label="Radio borderless" default-value="choice-card-radio-borderless">
            <ChoiceCard for="choice-card-radio-borderless" variant="borderless">
              <ChoiceCardContent>
                <ChoiceCardTitle id="choice-card-radio-borderless-title">Radio borderless</ChoiceCardTitle>
                <ChoiceCardDescription id="choice-card-radio-borderless-description">Trailing controls use child order and top alignment.</ChoiceCardDescription>
              </ChoiceCardContent>
              <RadioGroupItem
                id="choice-card-radio-borderless"
                value="choice-card-radio-borderless"
                aria-labelledby="choice-card-radio-borderless-title"
                aria-describedby="choice-card-radio-borderless-description"
              />
            </ChoiceCard>
          </RadioGroup>
        </div>
      </div>
    `,
  }),
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
    await expect(getBorderColor(radioBorderless)).toBe(
      getBorderColor(radioBordered)
    );
    await expect(getComputedStyle(trailingRadio).marginTop).toBe('2px');
  },
};
