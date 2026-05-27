import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SPACING_MODES } from '../../stories/spacing-modes';
import {
  expectHeightPinned,
  expectModeCascadeWorks,
} from '../../stories/test-utils';

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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Basic States
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-24">
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
            <span className="nx:text-xs nx:text-muted-foreground nx:w-24">
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
            <span className="nx:text-xs nx:text-muted-foreground nx:w-24">
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Widths
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:text-xs nx:text-muted-foreground nx:w-24">
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
            <span className="nx:text-xs nx:text-muted-foreground nx:w-24">
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
            <span className="nx:text-xs nx:text-muted-foreground nx:w-24">
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
// MODE BEHAVIOUR (per-mode spacing variance)
// ============================================

export const AllModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          "Each row scopes `data-style` locally on the trigger wrapper. `SelectTrigger` migrates `py-2 gap-2` → `py-control-md gap-control-md` (matches vega byte-identically) and so responds to mode. `px-3` stays numeric per the Input/Select coupling-table note (form fields are narrower than buttons by design; per-mode gap drift between Input/Select and adjacent Buttons is accepted — see `spacing-tokens.md` cross-mode visual consequence note). `SelectContent` portals to `document.body`, so opened items pick up document-level mode, not the row's wrapper.",
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:p-10 nx:bg-background nx:min-w-fit">
      {SPACING_MODES.map((mode) => (
        <div
          key={mode}
          data-style={mode}
          className="nx:flex nx:gap-2 nx:items-center"
        >
          <span className="nx:w-[64px] nx:typography-label-default nx:font-mono nx:text-muted-foreground">
            {mode}
          </span>
          <Select>
            <SelectTrigger
              aria-label={`${mode} select`}
              className="nx:w-[200px]"
            >
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Option A</SelectItem>
              <SelectItem value="b">Option B</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  ),
};

export const ModesProduceDifferentHeights: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Cascade sentinel on `SelectTrigger`. Uses the `maia` + `sera` pair to spread coverage away from the Button/Input nova+sera and Tabs nova+maia pairs — between them the suite covers `control-md-y` at every distinct value (nova 6 / vega-tier 8 / maia 10 / sera 12). Trigger is not portaled so dimensional measurement on the wrapper works directly.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-4 nx:p-10 nx:bg-background">
      <div data-style="maia" data-testid="select-mode-host-maia">
        <Select>
          <SelectTrigger aria-label="maia select" className="nx:w-[160px]">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div data-style="sera" data-testid="select-mode-host-sera">
        <Select>
          <SelectTrigger aria-label="sera select" className="nx:w-[160px]">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectModeCascadeWorks(
      within(canvasElement),
      'select-mode-host-maia',
      'select-mode-host-sera'
    );
  },
};

export const VegaDefaultHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the migration outcome: in vega mode, the `SelectTrigger` renders at exactly 38px (= `text-sm` 20px line-height + `py-control-md` 8px × 2 + border 1px × 2 — same intrinsic shape as Input default). If a designer retunes `--control-padding-y-md`, the body type ramp, or the border-width token, this test fails.',
      },
    },
  },
  render: () => (
    <div
      data-style="vega"
      data-testid="select-vega-host"
      className="nx:p-10 nx:bg-background"
    >
      <Select>
        <SelectTrigger aria-label="vega select" className="nx:w-[200px]">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'select-vega-host', 38);
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
