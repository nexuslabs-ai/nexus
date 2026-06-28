import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '../field';
import { Label } from '../label';

import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    onCheckedChange: fn(),
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// A selectable card's *frame* is the wrapper's concern, not the checkbox's. In
// the old monolith these were the `variant` / `floating` props; here the inner
// `Field + Checkbox + FieldContent` core is identical and only `FieldLabel`'s
// border classes change. `FieldLabel`'s default is the floating rounded card;
// these two overrides collapse it to a bottom-border list row or a plain row.
const BOTTOM_BORDER_ROW =
  'nx:has-[>[data-slot=field]]:rounded-none nx:has-[>[data-slot=field]]:border-t-0 nx:has-[>[data-slot=field]]:border-x-0';
const BORDERLESS_ROW =
  'nx:has-[>[data-slot=field]]:rounded-none nx:has-[>[data-slot=field]]:border-0 nx:*:data-[slot=field]:p-0 nx:has-data-[state=checked]:bg-transparent';

function FrameSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="nx:flex nx:flex-col nx:gap-2">
      <h4 className="nx:typography-label-small nx:text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  args: {
    'aria-label': 'Accept terms',
  },
};

export const Checked: Story = {
  args: {
    'aria-label': 'Checked option',
    defaultChecked: true,
  },
  // Verifies the check indicator (not the minus) is the one that paints when
  // checked — i.e. the group-data CSS that drives the dual indicator emits.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toHaveAttribute('data-state', 'checked');
    await expect(
      checkbox.querySelector('[data-slot="checkbox-check"]')
    ).toBeVisible();
    await expect(
      checkbox.querySelector('[data-slot="checkbox-minus"]')
    ).not.toBeVisible();
  },
};

export const Indeterminate: Story = {
  args: {
    'aria-label': 'Indeterminate option',
    checked: 'indeterminate',
  },
  // The mirror of Checked: the minus paints, the check does not.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    await expect(
      checkbox.querySelector('[data-slot="checkbox-minus"]')
    ).toBeVisible();
    await expect(
      checkbox.querySelector('[data-slot="checkbox-check"]')
    ).not.toBeVisible();
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Disabled checkbox',
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toBeDisabled();

    // Disabled state uses a semantic border token at full opacity (not a fade).
    await expect(checkbox).toHaveClass('nx:disabled:border-border-disabled');
    await expect(getComputedStyle(checkbox).opacity).toBe('1');

    // Click should not toggle
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const WithLabel: Story = {
  render: function WithLabelStory(args) {
    const termsId = React.useId();

    return (
      <div className="nx:flex nx:items-center nx:gap-2">
        <Checkbox {...args} id={termsId} />
        <Label htmlFor={termsId}>Accept terms and conditions</Label>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Accept terms and conditions',
    });
    const label = canvas.getByText('Accept terms and conditions');

    await expect(checkbox).not.toBeChecked();

    await userEvent.click(label);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};

export const Invalid: Story = {
  args: {
    defaultChecked: true,
    'aria-invalid': true,
  },
  render: function InvalidStory(args) {
    const checkboxId = React.useId();
    const errorId = React.useId();

    return (
      <div className="nx:grid nx:gap-2">
        <div className="nx:flex nx:items-center nx:gap-2">
          <Checkbox {...args} id={checkboxId} aria-describedby={errorId} />
          <Label htmlFor={checkboxId}>Accept terms and conditions</Label>
        </div>
        <p
          id={errorId}
          className="nx:typography-body-default nx:text-error-subtle-foreground"
        >
          Choose at least one required option.
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Accept terms and conditions',
    });
    const error = canvas.getByText('Choose at least one required option.');

    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    await expect(checkbox).toHaveAttribute('aria-describedby', error.id);
    await expect(checkbox).toHaveAccessibleDescription(
      'Choose at least one required option.'
    );
  },
};

export const InvalidStates: Story = {
  render: function InvalidStatesStory() {
    const uncheckedId = React.useId();
    const checkedId = React.useId();
    const indeterminateId = React.useId();
    const uncheckedErrorId = `${uncheckedId}-error`;
    const checkedErrorId = `${checkedId}-error`;
    const indeterminateErrorId = `${indeterminateId}-error`;

    return (
      <div className="nx:flex nx:flex-col nx:gap-4">
        <div className="nx:grid nx:gap-2">
          <div className="nx:flex nx:items-center nx:gap-2">
            <Checkbox
              id={uncheckedId}
              aria-invalid
              aria-describedby={uncheckedErrorId}
            />
            <Label htmlFor={uncheckedId}>Unchecked required option</Label>
          </div>
          <p
            id={uncheckedErrorId}
            className="nx:typography-body-default nx:text-error-subtle-foreground"
          >
            Choose this option before continuing.
          </p>
        </div>

        <div className="nx:grid nx:gap-2">
          <div className="nx:flex nx:items-center nx:gap-2">
            <Checkbox
              id={checkedId}
              defaultChecked
              aria-invalid
              aria-describedby={checkedErrorId}
            />
            <Label htmlFor={checkedId}>Checked invalid option</Label>
          </div>
          <p
            id={checkedErrorId}
            className="nx:typography-body-default nx:text-error-subtle-foreground"
          >
            Resolve the related error before continuing.
          </p>
        </div>

        <div className="nx:grid nx:gap-2">
          <div className="nx:flex nx:items-center nx:gap-2">
            <Checkbox
              id={indeterminateId}
              checked="indeterminate"
              aria-invalid
              aria-describedby={indeterminateErrorId}
            />
            <Label htmlFor={indeterminateId}>
              Indeterminate invalid option
            </Label>
          </div>
          <p
            id={indeterminateErrorId}
            className="nx:typography-body-default nx:text-error-subtle-foreground"
          >
            Review the partially selected options.
          </p>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unchecked = canvas.getByRole('checkbox', {
      name: 'Unchecked required option',
    });
    const checked = canvas.getByRole('checkbox', {
      name: 'Checked invalid option',
    });
    const indeterminate = canvas.getByRole('checkbox', {
      name: 'Indeterminate invalid option',
    });

    await expect(unchecked).not.toBeChecked();
    await expect(unchecked).toHaveAttribute('aria-invalid', 'true');
    await expect(unchecked).toHaveAccessibleDescription(
      'Choose this option before continuing.'
    );

    await expect(checked).toBeChecked();
    await expect(checked).toHaveAttribute('aria-invalid', 'true');
    await expect(checked).toHaveAccessibleDescription(
      'Resolve the related error before continuing.'
    );

    await expect(indeterminate).toHaveAttribute('data-state', 'indeterminate');
    await expect(indeterminate).toHaveAttribute('aria-invalid', 'true');
    await expect(indeterminate).toHaveAccessibleDescription(
      'Review the partially selected options.'
    );

    // The invalid pressed state can't be triggered deterministically in a play
    // fn, so assert the press token resolves to the -active shade (not the rest
    // shade) via the class contract — for both checked and indeterminate, since
    // the source swaps both.
    await expect(checked).toHaveClass(
      'nx:enabled:aria-invalid:data-[state=checked]:active:bg-error-background-active'
    );
    await expect(indeterminate).toHaveClass(
      'nx:enabled:aria-invalid:data-[state=indeterminate]:active:bg-error-background-active'
    );
  },
};

// ============================================
// SELECTABLE CARD STORIES (composition)
// ============================================
// A selectable card is composed, not a bespoke primitive: a `FieldLabel`
// wrapping a `Field` turns the whole surface into a label for the real
// `Checkbox`. Clicking anywhere toggles the atom via native `htmlFor`, and the
// card highlights from the checkbox's own `data-state` (`FieldLabel`'s
// `has-data-[state=checked]`). The checkbox stays the single focusable control,
// so the description may hold links — no invalid button-in-button nesting.

export const SelectableCard: Story = {
  render: () => (
    <div className="nx:w-80">
      <FieldLabel htmlFor="card-2fa">
        <Field orientation="horizontal">
          <Checkbox id="card-2fa" aria-labelledby="card-2fa-title" />
          <FieldContent>
            <FieldTitle id="card-2fa-title">Enable two-factor auth</FieldTitle>
            <FieldDescription>
              Add an extra layer of security to your account.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </div>
  ),
  // Clicking the description — anywhere in the label — toggles the real control.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Enable two-factor auth',
    });

    await expect(checkbox).not.toBeChecked();

    await userEvent.click(
      canvas.getByText('Add an extra layer of security to your account.')
    );
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveAttribute('data-state', 'checked');
  },
};

export const SelectableCardTrailing: Story = {
  render: () => (
    <div className="nx:w-80">
      <FieldLabel htmlFor="card-trailing">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle id="card-trailing-title">Email updates</FieldTitle>
            <FieldDescription>
              Receive product updates and security alerts.
            </FieldDescription>
          </FieldContent>
          <Checkbox
            id="card-trailing"
            defaultChecked
            aria-labelledby="card-trailing-title"
          />
        </Field>
      </FieldLabel>
    </div>
  ),
};

export const SelectableCardGroup: Story = {
  render: () => (
    <FieldSet className="nx:w-80">
      <FieldLegend>Notifications</FieldLegend>
      <FieldGroup data-slot="checkbox-group">
        <FieldLabel htmlFor="card-grp-product">
          <Field orientation="horizontal">
            <Checkbox
              id="card-grp-product"
              defaultChecked
              aria-labelledby="card-grp-product-title"
            />
            <FieldContent>
              <FieldTitle id="card-grp-product-title">
                Product updates
              </FieldTitle>
              <FieldDescription>
                News about features and improvements.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="card-grp-security">
          <Field orientation="horizontal">
            <Checkbox
              id="card-grp-security"
              aria-labelledby="card-grp-security-title"
            />
            <FieldContent>
              <FieldTitle id="card-grp-security-title">
                Security alerts
              </FieldTitle>
              <FieldDescription>
                Critical notices about your account.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
      </FieldGroup>
    </FieldSet>
  ),
};

export const SelectableCardInvalid: Story = {
  render: () => (
    <div className="nx:w-80">
      <FieldLabel htmlFor="card-invalid">
        <Field orientation="horizontal" data-invalid="true">
          <Checkbox
            id="card-invalid"
            aria-invalid
            aria-labelledby="card-invalid-title"
            aria-describedby="card-invalid-error"
          />
          <FieldContent>
            <FieldTitle id="card-invalid-title">Accept the policy</FieldTitle>
            <FieldDescription>
              You must accept before continuing.
            </FieldDescription>
            <FieldError
              id="card-invalid-error"
              errors={[{ message: 'This selection is required.' }]}
            />
          </FieldContent>
        </Field>
      </FieldLabel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Accept the policy',
    });
    const error = canvas.getByText('This selection is required.');

    await expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    await expect(checkbox).toHaveAttribute('aria-describedby', error.id);
    await expect(error).toHaveAttribute('role', 'alert');
  },
};

// The non-floating "row" frame: the same FieldLabel cards with their border
// collapsed to a bottom rule, stacked flush so they read as a divided list. Only
// the wrapper's border classes change — see BOTTOM_BORDER_ROW.
export const SelectableRowList: Story = {
  render: () => (
    <FieldSet className="nx:w-96 nx:max-w-full">
      <FieldLegend>Notifications</FieldLegend>
      <div className="nx:flex nx:flex-col">
        <FieldLabel htmlFor="row-product" className={BOTTOM_BORDER_ROW}>
          <Field orientation="horizontal">
            <Checkbox
              id="row-product"
              defaultChecked
              aria-labelledby="row-product-title"
            />
            <FieldContent>
              <FieldTitle id="row-product-title">Product updates</FieldTitle>
              <FieldDescription>
                News about features and improvements.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="row-security" className={BOTTOM_BORDER_ROW}>
          <Field orientation="horizontal">
            <Checkbox id="row-security" aria-labelledby="row-security-title" />
            <FieldContent>
              <FieldTitle id="row-security-title">Security alerts</FieldTitle>
              <FieldDescription>
                Critical notices about your account.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="row-billing" className={BOTTOM_BORDER_ROW}>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle id="row-billing-title">Billing</FieldTitle>
              <FieldDescription>
                Invoices and payment receipts.
              </FieldDescription>
            </FieldContent>
            <Checkbox id="row-billing" aria-labelledby="row-billing-title" />
          </Field>
        </FieldLabel>
      </div>
    </FieldSet>
  ),
  // The whole row is the label — clicking the description toggles the control.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const security = canvas.getByRole('checkbox', { name: 'Security alerts' });

    await expect(security).not.toBeChecked();
    await userEvent.click(
      canvas.getByText('Critical notices about your account.')
    );
    await expect(security).toBeChecked();
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const ClickInteraction: Story = {
  args: {
    'aria-label': 'Toggle checkbox',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    // Initially unchecked
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');

    // Click to check
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('data-state', 'checked');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Click to uncheck
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);
  },
};

export const KeyboardInteraction: Story = {
  args: {
    'aria-label': 'Toggle checkbox',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    // Tab to focus
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();

    // Space to check (checkboxes toggle on Space, not Enter)
    await userEvent.keyboard(' ');
    await expect(checkbox).toHaveAttribute('data-state', 'checked');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Space to uncheck
    await userEvent.keyboard(' ');
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);
  },
};

export const WithDataAttributes: Story = {
  args: {
    'aria-label': 'Checkbox',
    defaultChecked: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toHaveAttribute('data-slot', 'checkbox');
    await expect(checkbox).toHaveAttribute('data-state', 'checked');

    // Indicator renders (and carries its slot) when checked
    const indicator = checkbox.querySelector(
      '[data-slot="checkbox-indicator"]'
    );
    await expect(indicator).toBeInTheDocument();
    await expect(indicator).toHaveAttribute('data-slot', 'checkbox-indicator');

    const check = checkbox.querySelector('[data-slot="checkbox-check"]');
    await expect(check).toBeVisible();
    await expect(check).toHaveAttribute('aria-hidden', 'true');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  // Named function + useId keeps the repeated id/htmlFor pairs unique within
  // this showcase.
  render: function AllVariantsShowcase() {
    const uid = React.useId();
    const termsDescriptionId = `${uid}-terms-description`;

    return (
      <div className="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            States
          </h3>
          <div className="nx:flex nx:items-center nx:gap-6">
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox aria-label="Unchecked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Unchecked
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox defaultChecked aria-label="Checked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Checked
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox checked="indeterminate" aria-label="Indeterminate" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Indeterminate
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox disabled aria-label="Disabled unchecked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Disabled
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox disabled defaultChecked aria-label="Disabled checked" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Disabled Checked
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox
                disabled
                checked="indeterminate"
                aria-label="Disabled indeterminate"
              />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Disabled Mixed
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            Validation
          </h3>
          <div className="nx:flex nx:items-center nx:gap-6">
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox aria-invalid aria-label="Unchecked invalid" />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Invalid
              </span>
            </div>
            <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Checkbox
                defaultChecked
                aria-invalid
                aria-label="Checked invalid"
              />
              <span className="nx:typography-label-small nx:text-muted-foreground">
                Invalid Checked
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            Selectable Cards
          </h3>
          <div className="nx:grid nx:max-w-3xl nx:grid-cols-1 nx:items-start nx:gap-6 nx:md:grid-cols-3">
            <FrameSection title="Floating card">
              <div className="nx:flex nx:flex-col nx:gap-3">
                <FieldLabel htmlFor={`${uid}-card-a`}>
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`${uid}-card-a`}
                      aria-labelledby={`${uid}-card-a-title`}
                    />
                    <FieldContent>
                      <FieldTitle id={`${uid}-card-a-title`}>
                        Default
                      </FieldTitle>
                      <FieldDescription>Description for label</FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor={`${uid}-card-b`}>
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`${uid}-card-b`}
                      defaultChecked
                      aria-labelledby={`${uid}-card-b-title`}
                    />
                    <FieldContent>
                      <FieldTitle id={`${uid}-card-b-title`}>
                        Selected
                      </FieldTitle>
                      <FieldDescription>
                        Highlights when checked
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldLabel>
              </div>
            </FrameSection>
            <FrameSection title="Bottom-border row">
              <div className="nx:flex nx:flex-col">
                <FieldLabel
                  htmlFor={`${uid}-card-c`}
                  className={BOTTOM_BORDER_ROW}
                >
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`${uid}-card-c`}
                      aria-labelledby={`${uid}-card-c-title`}
                    />
                    <FieldContent>
                      <FieldTitle id={`${uid}-card-c-title`}>Row</FieldTitle>
                      <FieldDescription>Only a bottom border</FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldLabel>
                <FieldLabel
                  htmlFor={`${uid}-card-d`}
                  className={BOTTOM_BORDER_ROW}
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle id={`${uid}-card-d-title`}>
                        Trailing row
                      </FieldTitle>
                      <FieldDescription>
                        Checkbox after content
                      </FieldDescription>
                    </FieldContent>
                    <Checkbox
                      id={`${uid}-card-d`}
                      defaultChecked
                      aria-labelledby={`${uid}-card-d-title`}
                    />
                  </Field>
                </FieldLabel>
              </div>
            </FrameSection>
            <FrameSection title="Borderless row">
              <div className="nx:flex nx:flex-col nx:gap-3">
                <FieldLabel
                  htmlFor={`${uid}-card-e`}
                  className={BORDERLESS_ROW}
                >
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`${uid}-card-e`}
                      aria-labelledby={`${uid}-card-e-title`}
                    />
                    <FieldContent>
                      <FieldTitle id={`${uid}-card-e-title`}>Plain</FieldTitle>
                      <FieldDescription>No frame at all</FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldLabel>
                <FieldLabel
                  htmlFor={`${uid}-card-f`}
                  className={BORDERLESS_ROW}
                >
                  <Field orientation="horizontal" data-disabled="true">
                    <Checkbox
                      id={`${uid}-card-f`}
                      disabled
                      defaultChecked
                      aria-labelledby={`${uid}-card-f-title`}
                    />
                    <FieldContent>
                      <FieldTitle id={`${uid}-card-f-title`}>
                        Disabled
                      </FieldTitle>
                      <FieldDescription>Not selectable</FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldLabel>
              </div>
            </FrameSection>
          </div>
        </div>

        <div>
          <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
            With Labels
          </h3>
          <div className="nx:flex nx:flex-col nx:gap-4">
            <div className="nx:flex nx:items-center nx:gap-2">
              <Checkbox id={`${uid}-newsletter`} defaultChecked />
              <Label htmlFor={`${uid}-newsletter`}>
                Subscribe to newsletter
              </Label>
            </div>
            <div className="nx:flex nx:items-start nx:gap-2">
              <Checkbox
                id={`${uid}-terms`}
                aria-describedby={termsDescriptionId}
                className="nx:mt-0.5"
              />
              <div className="nx:grid nx:gap-1.5">
                <Label htmlFor={`${uid}-terms`}>
                  Accept terms and conditions
                </Label>
                <p
                  id={termsDescriptionId}
                  className="nx:typography-body-default nx:text-muted-foreground"
                >
                  You agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
