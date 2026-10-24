import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectInterruptibleOverlayMotion } from '../../stories/support/overlay-motion-test-utils';
import { Input } from '../input/input';

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
    docs: {
      description: {
        component:
          'Select lets users pick one option from a styled dropdown. Use it when the list needs a styled trigger and menu that match the rest of the UI. For native form submission and OS pickers with plain text options, use NativeSelect.',
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  tags: ['docs'],
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Open with an option already selected by setting `defaultValue`.',
      },
    },
  },
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

export const InvalidTrigger: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `aria-invalid` on the trigger to show an error border.',
      },
    },
  },
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
    await expect(trigger).toHaveClass('nx:aria-invalid:border-error-border');
    await expect(trigger).toHaveClass(
      'nx:aria-invalid:focus-visible:outline-focus-error'
    );
  },
};

export const WithDisabledItems: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Disable single items so users can see but not pick them.',
      },
    },
  },
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
    await expect(invalid).toHaveClass('nx:aria-invalid:border-error-border');
    // The stroke is a real border now, so a borderless field keeps a
    // transparent one and the invalid state recolours it in place.
    const restStyles = window.getComputedStyle(empty);
    await expect(Number.parseFloat(restStyles.borderTopWidth)).toBeGreaterThan(
      0
    );
    await expect(restStyles.borderTopColor).toBe('rgba(0, 0, 0, 0)');

    const invalidStyles = window.getComputedStyle(invalid);
    await expect(
      Number.parseFloat(invalidStyles.borderTopWidth)
    ).toBeGreaterThan(0);
    await expect(invalidStyles.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(invalidStyles.boxShadow).toBe('none');

    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveClass('nx:disabled:bg-disabled');
    await expect(disabled).not.toHaveClass(
      'nx:disabled:border-border-disabled'
    );
  },
};

// ============================================
// GROUPED STORIES
// ============================================

export const WithGroups: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Group items under labels and divide the groups with a separator.',
      },
    },
  },
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

// ============================================
// SIZE AND WIDTH STORIES
// ============================================

const SIZES = ['sm', 'default', 'lg'] as const;

export const Sizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Each trigger size matches the height of an Input at the same size.',
      },
    },
  },
  render: (_args) => (
    <div className="nx:flex nx:w-[420px] nx:flex-col nx:gap-3">
      {SIZES.map((size) => (
        <div key={size} className="nx:flex nx:items-center nx:gap-3">
          <Select>
            <SelectTrigger size={size} aria-label={`${size} select`}>
              <SelectValue placeholder={size} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectContent>
          </Select>
          <Input size={size} placeholder={size} aria-label={`${size} input`} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const height = (element: HTMLElement) =>
      Math.round(element.getBoundingClientRect().height);

    for (const size of SIZES) {
      const trigger = canvas.getByRole('combobox', { name: `${size} select` });
      const input = canvas.getByRole('textbox', { name: `${size} input` });

      await expect(trigger).toHaveAttribute('data-size', size);
      await expect(height(trigger)).toBe(height(input));
    }
  },
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
    const content = document.querySelector('[data-slot="select-content"]');
    await expectInterruptibleOverlayMotion(content);

    // Options should be visible
    const appleOption = within(listbox).getByRole('option', { name: 'Apple' });
    await expect(appleOption).toBeInTheDocument();

    // Close by clicking outside or pressing escape
    await userEvent.keyboard('{Escape}');

    // Radix Select renders closed content into a detached DocumentFragment, not
    // through Presence, so the visible listbox unmounts immediately on close.
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

    const trigger = canvas.getByRole('combobox');
    await expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
    await expect(trigger).toHaveAttribute('data-size', 'default');
    await expect(trigger).toHaveAttribute('data-variant', 'bordered');
    await expect(trigger).toHaveClass('nx:bg-container');
    await expect(trigger).toHaveClass('nx:enabled:hover:bg-container-hover');

    await userEvent.click(trigger);

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
              Bordered
            </span>
            <Select>
              <SelectTrigger
                className="nx:w-[180px]"
                aria-label="Bordered variant select"
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
          Sizes
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          {SIZES.map((size) => (
            <div key={size} className="nx:flex nx:items-center nx:gap-4">
              <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
                {size}
              </span>
              <Select>
                <SelectTrigger
                  size={size}
                  className="nx:w-[180px]"
                  aria-label={`${size} size select`}
                >
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
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

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
