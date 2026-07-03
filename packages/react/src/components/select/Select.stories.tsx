import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectHeightPinned } from '../../stories/support/story-height-test-utils';
import { NativeSelect, NativeSelectOption } from '../native-select';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <Select>
      <SelectTrigger className="nx:w-[180px]" aria-label="Select a fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
        <SelectItem value="grape">Grape</SelectItem>
        <SelectItem value="mango">Mango</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDefaultValue: Story = {
  render: (_args) => (
    <Select defaultValue="banana">
      <SelectTrigger className="nx:w-[180px]" aria-label="Select a fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const IndicatorCrossFade: Story = {
  render: () => (
    <Select defaultValue="apple">
      <SelectTrigger className="nx:w-[180px]" aria-label="Select a fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Select a fruit' });

    try {
      await userEvent.click(trigger);

      const listbox = await within(document.body).findByRole('listbox');
      const apple = within(listbox).getByRole('option', { name: 'Apple' });
      const banana = within(listbox).getByRole('option', { name: 'Banana' });
      const selectedCheck = apple.querySelector(
        '[data-slot="select-item-indicator-icon"]'
      );
      const unselectedCheck = banana.querySelector(
        '[data-slot="select-item-indicator-icon"]'
      );

      await expect(selectedCheck).toBeInTheDocument();
      await expect(unselectedCheck).toBeInTheDocument();
      await expect(selectedCheck).toHaveClass(
        'nx:transition-[opacity,transform]'
      );
      await expect(selectedCheck).toHaveClass(
        'nx:group-data-[state=checked]:opacity-100'
      );
      await expect(selectedCheck).toHaveClass(
        'nx:motion-reduce:transition-none'
      );
    } finally {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => {
        expect(document.querySelector('[role="listbox"]')).toBeNull();
      });
    }
  },
};

export const Disabled: Story = {
  render: (_args) => (
    <Select disabled>
      <SelectTrigger className="nx:w-[180px]" aria-label="Disabled select">
        <SelectValue placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const InvalidTrigger: Story = {
  render: () => (
    <Select defaultValue="apple">
      <SelectTrigger
        className="nx:w-[180px]"
        aria-label="Invalid select"
        aria-invalid
      >
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Invalid select' });

    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
    await expect(trigger).toHaveClass('nx:aria-invalid:border-border-error');
    await expect(trigger).toHaveClass(
      'nx:aria-invalid:focus-visible:outline-focus-error'
    );
  },
};

export const WithDisabledItems: Story = {
  render: (_args) => (
    <Select>
      <SelectTrigger className="nx:w-[180px]" aria-label="Select an option">
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Available</SelectItem>
        <SelectItem value="option2" disabled>
          Unavailable
        </SelectItem>
        <SelectItem value="option3">Available</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const BorderlessStates: Story = {
  render: () => (
    <div className="nx:flex nx:w-[220px] nx:flex-col nx:gap-3">
      <Select>
        <SelectTrigger
          data-testid="select-borderless-empty"
          variant="borderless"
          aria-label="Empty borderless select"
        >
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="apple">
        <SelectTrigger
          variant="borderless"
          aria-label="Filled borderless select"
        >
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="apple">
        <SelectTrigger
          data-testid="select-borderless-invalid"
          variant="borderless"
          aria-label="Invalid borderless select"
          aria-invalid
        >
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
      <Select disabled defaultValue="apple">
        <SelectTrigger
          data-testid="select-borderless-disabled"
          variant="borderless"
          aria-label="Disabled borderless select"
        >
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const empty = canvas.getByTestId('select-borderless-empty');
    const invalid = canvas.getByTestId('select-borderless-invalid');
    const disabled = canvas.getByTestId('select-borderless-disabled');

    await expect(empty).toHaveAttribute('data-variant', 'borderless');
    await expect(empty).toHaveClass('nx:border-transparent');
    await expect(empty).toHaveClass('nx:bg-control-background');
    await expect(empty).toHaveClass(
      'nx:enabled:hover:bg-control-background-hover'
    );

    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(invalid).toHaveClass('nx:aria-invalid:border-border-error');
    await expect(window.getComputedStyle(invalid).borderTopColor).not.toBe(
      'rgba(0, 0, 0, 0)'
    );

    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveClass('nx:disabled:bg-disabled');
    await expect(disabled).not.toHaveClass(
      'nx:disabled:border-border-disabled'
    );
  },
};

export const CapabilityLadder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Capability ladder: use NativeSelect for native form submission and OS pickers with simple text options; use Select for a styled trigger/listbox with groups, separators, and disabled items. Future Combobox and MultiSelect remain roadmap-only boundaries and are not implemented here.',
      },
    },
  },
  render: () => (
    <div className="nx:grid nx:max-w-3xl nx:gap-4 nx:md:grid-cols-2">
      <section className="nx:grid nx:gap-2 nx:rounded-md nx:border-default nx:border-border-default nx:p-4">
        <h3 className="nx:typography-label-default nx:text-foreground">
          NativeSelect
        </h3>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          Native picker, native form semantics, simple text options.
        </p>
        <NativeSelect aria-label="Native plan" defaultValue="pro">
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
          <NativeSelectOption value="team">Team</NativeSelectOption>
        </NativeSelect>
      </section>
      <section className="nx:grid nx:gap-2 nx:rounded-md nx:border-default nx:border-border-default nx:p-4">
        <h3 className="nx:typography-label-default nx:text-foreground">
          Select
        </h3>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          Styled trigger and listbox, groups, separators, disabled items.
        </p>
        <Select defaultValue="pro">
          <SelectTrigger aria-label="Styled plan">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Plans</SelectLabel>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="team" disabled>
                Team
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </section>
      <section className="nx:grid nx:gap-2 nx:rounded-md nx:border-default nx:border-dashed nx:border-border-default nx:p-4">
        <h3 className="nx:typography-label-default nx:text-foreground">
          Future Combobox
        </h3>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          Roadmap boundary for searchable or async single selection.
        </p>
      </section>
      <section className="nx:grid nx:gap-2 nx:rounded-md nx:border-default nx:border-dashed nx:border-border-default nx:p-4">
        <h3 className="nx:typography-label-default nx:text-foreground">
          Future MultiSelect
        </h3>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          Roadmap boundary for multiple selected values and chip summaries.
        </p>
      </section>
    </div>
  ),
};

export const ReadOnlyBoundary: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Select has disabled state today, but no first-class read-only state. Use disabled when users cannot interact and the value should not behave like an editable control. If a locked value still needs to submit with a form, render a display-only value plus a hidden input.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:w-[360px] nx:flex-col nx:gap-4">
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Disabled Select
        </span>
        <Select disabled defaultValue="team">
          <SelectTrigger aria-label="Disabled team select">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <form className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Display-only submission value
        </span>
        <div
          data-testid="select-display-only-value"
          className="nx:rounded-md nx:border-default nx:border-border-default nx:bg-muted nx:px-3 nx:py-2 nx:typography-body-default nx:text-foreground"
        >
          Team
        </div>
        <input type="hidden" name="plan" value="team" />
        <p className="nx:typography-body-small nx:text-muted-foreground">
          Hidden input preserves form submission without exposing an editable
          select.
        </p>
      </form>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', {
      name: 'Disabled team select',
    });
    const hiddenInput = canvasElement.querySelector('input[type="hidden"]');

    await expect(trigger).toBeDisabled();
    await expect(
      canvas.getByTestId('select-display-only-value')
    ).toHaveTextContent('Team');
    await expect(hiddenInput).toHaveAttribute('name', 'plan');
    await expect(hiddenInput).toHaveAttribute('value', 'team');
  },
};

export const RichItemFutureBoundary: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Current Select items are text-first options with disabled support. Rich item affordances such as description, icon/avatar, metadata, and disabled reason belong to a future compositional-slot API, not render props, and are intentionally not implemented in this PR.',
      },
    },
  },
  render: () => (
    <div className="nx:grid nx:max-w-xl nx:gap-4">
      <Select defaultValue="owner">
        <SelectTrigger className="nx:w-[260px]" aria-label="Current role">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="admin" disabled>
            Billing admin unavailable
          </SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
      <div className="nx:grid nx:gap-2 nx:rounded-md nx:border-default nx:border-dashed nx:border-border-default nx:p-4">
        <h3 className="nx:typography-label-default nx:text-foreground">
          Future rich item slots
        </h3>
        <ul className="nx:ml-4 nx:list-disc nx:typography-body-small nx:text-muted-foreground">
          <li>Icon or avatar slot before item text.</li>
          <li>Description slot below the primary label.</li>
          <li>Metadata slot aligned to the far edge.</li>
          <li>Disabled reason slot for unavailable choices.</li>
        </ul>
      </div>
    </div>
  ),
};

// ============================================
// GROUPED STORIES
// ============================================

export const WithGroups: Story = {
  render: (_args) => (
    <Select>
      <SelectTrigger className="nx:w-[200px]" aria-label="Select a food">
        <SelectValue placeholder="Select a food" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithSeparators: Story = {
  render: (_args) => (
    <Select>
      <SelectTrigger className="nx:w-[200px]" aria-label="Select a timezone">
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="utc">UTC</SelectItem>
        <SelectSeparator />
        <SelectItem value="est">Eastern Time (EST)</SelectItem>
        <SelectItem value="cst">Central Time (CST)</SelectItem>
        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
        <SelectSeparator />
        <SelectItem value="gmt">GMT</SelectItem>
        <SelectItem value="cet">Central European Time</SelectItem>
      </SelectContent>
    </Select>
  ),
};

// ============================================
// WIDTH STORIES
// ============================================

export const SmallWidth: Story = {
  render: (_args) => (
    <Select>
      <SelectTrigger className="nx:w-[120px]" aria-label="Select size">
        <SelectValue placeholder="Size" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="xs">XS</SelectItem>
        <SelectItem value="sm">SM</SelectItem>
        <SelectItem value="md">MD</SelectItem>
        <SelectItem value="lg">LG</SelectItem>
        <SelectItem value="xl">XL</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const FullWidth: Story = {
  render: (_args) => (
    <div className="nx:w-[300px]">
      <Select>
        <SelectTrigger className="nx:w-full" aria-label="Select a country">
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="uk">United Kingdom</SelectItem>
          <SelectItem value="ca">Canada</SelectItem>
          <SelectItem value="au">Australia</SelectItem>
          <SelectItem value="de">Germany</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

// ============================================
// SCROLLABLE STORIES
// ============================================

export const Scrollable: Story = {
  render: (_args) => (
    <Select>
      <SelectTrigger className="nx:w-[200px]" aria-label="Select a timezone">
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
          <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
          <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
          <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
          <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
          <SelectItem value="hst">Hawaii Standard Time (HST)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
          <SelectItem value="cet">Central European Time (CET)</SelectItem>
          <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
          <SelectItem value="wet">Western European Time (WET)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Asia</SelectLabel>
          <SelectItem value="msk">Moscow Time (MSK)</SelectItem>
          <SelectItem value="ist">India Standard Time (IST)</SelectItem>
          <SelectItem value="cst-asia">China Standard Time (CST)</SelectItem>
          <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

// ============================================
// INTERACTION TESTS
// ============================================

export const OpenCloseInteraction: Story = {
  render: (_args) => (
    <Select>
      <SelectTrigger className="nx:w-[180px]" aria-label="Select a fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the trigger
    const trigger = canvas.getByRole('combobox');
    await expect(trigger).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('data-slot', 'select-trigger');

    // With no value selected, Radix marks the trigger data-placeholder — the
    // hook the muted-placeholder style targets (a button has no ::placeholder).
    await expect(trigger).toHaveAttribute('data-placeholder');

    // Open the select
    await userEvent.click(trigger);

    // Wait for listbox to appear
    const listbox = await within(document.body).findByRole('listbox');
    await expect(listbox).toBeInTheDocument();

    // Options should be visible
    const appleOption = within(listbox).getByRole('option', { name: 'Apple' });
    await expect(appleOption).toBeInTheDocument();

    // Close by clicking outside or pressing escape
    await userEvent.keyboard('{Escape}');

    // Wait for listbox to be removed
    await waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    });
  },
};

export const SelectItemInteraction: Story = {
  render: (_args) => (
    <Select>
      <SelectTrigger className="nx:w-[180px]" aria-label="Select a fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the select
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);

    // Wait for listbox
    const listbox = await within(document.body).findByRole('listbox');

    // Click on Banana
    const bananaOption = within(listbox).getByRole('option', {
      name: 'Banana',
    });
    await userEvent.click(bananaOption);

    // Listbox should close
    await waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    });

    // Trigger should now show "Banana"
    await expect(trigger).toHaveTextContent('Banana');
  },
};

export const KeyboardInteraction: Story = {
  render: (_args) => (
    <Select>
      <SelectTrigger className="nx:w-[180px]" aria-label="Select a fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Focus the trigger
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);

    // Wait for listbox
    await within(document.body).findByRole('listbox');

    // Navigate down with arrow keys
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');

    // Press Enter to select
    await userEvent.keyboard('{Enter}');

    // Wait for listbox to close
    await waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    });

    // Trigger should show selected value
    await expect(trigger).toHaveTextContent(/Apple|Banana|Orange/);
  },
};

export const DisabledInteraction: Story = {
  render: (_args) => (
    <Select disabled>
      <SelectTrigger className="nx:w-[180px]" aria-label="Disabled select">
        <SelectValue placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Trigger should be disabled
    const trigger = canvas.getByRole('combobox');
    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveClass('nx:disabled:border-border-disabled');
    await expect(trigger).toHaveClass('nx:disabled:bg-disabled');
    await expect(trigger).toHaveClass('nx:disabled:text-disabled-foreground');

    const icon = trigger.querySelector('svg');
    await expect(icon).toHaveClass(
      'nx:group-disabled/select-trigger:text-disabled-foreground'
    );

    // Try to click - should not open
    await userEvent.click(trigger);

    // Listbox should not appear
    await expect(document.querySelector('[role="listbox"]')).toBeNull();
  },
};

export const WithDataAttributes: Story = {
  render: (_args) => (
    <Select>
      <SelectTrigger className="nx:w-[180px]" aria-label="Select a fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check trigger data-slot
    const trigger = canvas.getByRole('combobox');
    await expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
    await expect(trigger).toHaveAttribute('data-variant', 'default');
    await expect(trigger).toHaveClass('nx:enabled:hover:bg-background-hover');

    // Open the select
    await userEvent.click(trigger);

    // Wait for content and check data-slots
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="select-content"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="select-label"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="select-item"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="select-separator"]')
      ).toBeInTheDocument();
    });

    // Close
    await userEvent.keyboard('{Escape}');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Variants
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Default
            </span>
            <Select>
              <SelectTrigger
                className="nx:w-[180px]"
                aria-label="Default variant select"
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Borderless
            </span>
            <Select>
              <SelectTrigger
                variant="borderless"
                className="nx:w-[180px]"
                aria-label="Borderless variant select"
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Basic States
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Default
            </span>
            <Select>
              <SelectTrigger
                className="nx:w-[180px]"
                aria-label="Default select"
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              With value
            </span>
            <Select defaultValue="option1">
              <SelectTrigger
                className="nx:w-[180px]"
                aria-label="Select with value"
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Disabled
            </span>
            <Select disabled>
              <SelectTrigger
                className="nx:w-[180px]"
                aria-label="Disabled select"
              >
                <SelectValue placeholder="Disabled" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Groups
        </h3>
        <Select>
          <SelectTrigger className="nx:w-[200px]" aria-label="Grouped select">
            <SelectValue placeholder="Select a food" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="broccoli">Broccoli</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Widths
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Small (120px)
            </span>
            <Select>
              <SelectTrigger
                className="nx:w-[120px]"
                aria-label="Small width select"
              >
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">SM</SelectItem>
                <SelectItem value="md">MD</SelectItem>
                <SelectItem value="lg">LG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Medium (180px)
            </span>
            <Select>
              <SelectTrigger
                className="nx:w-[180px]"
                aria-label="Medium width select"
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Large (280px)
            </span>
            <Select>
              <SelectTrigger
                className="nx:w-[280px]"
                aria-label="Large width select"
              >
                <SelectValue placeholder="Select a longer option here" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">
                  A much longer option text
                </SelectItem>
                <SelectItem value="option2">
                  Another long option here
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const DefaultModeHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Regression sentinel: pins the `SelectTrigger` height in default mode to the default single-line control scale.',
      },
    },
  },
  render: () => (
    <div data-testid="select-default-host" className="nx:p-10 nx:bg-background">
      <Select>
        <SelectTrigger aria-label="default select" className="nx:w-[200px]">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'select-default-host', 40);
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
