import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import {
  AllModesGrid,
  AllModesRow,
  SPACING_MODES,
} from '../../stories/spacing-modes';
import {
  expectHeightPinned,
  expectModeCascadeWorks,
} from '../../stories/test-utils';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Whether single or multiple items can be opened at once',
    },
    collapsible: {
      control: 'boolean',
      description:
        'When type is "single", allows closing content when clicking trigger of open item',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the accordion is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <Accordion type="single" collapsible className="nx:w-full nx:max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that match the Nexus design system.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It has smooth open/close animations built-in.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: (_args) => (
    <Accordion type="multiple" className="nx:w-full nx:max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>First Section</AccordionTrigger>
        <AccordionContent>
          This is the content for the first section. Multiple sections can be
          open at the same time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second Section</AccordionTrigger>
        <AccordionContent>
          This is the content for the second section. Try opening both!
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third Section</AccordionTrigger>
        <AccordionContent>
          This is the content for the third section.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  render: (_args) => (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-2"
      className="nx:w-full nx:max-w-md"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Closed by default</AccordionTrigger>
        <AccordionContent>This section starts closed.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Open by default</AccordionTrigger>
        <AccordionContent>
          This section is open when the page loads because its value matches the
          defaultValue prop.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Also closed by default</AccordionTrigger>
        <AccordionContent>This section also starts closed.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Disabled: Story = {
  render: (_args) => (
    <Accordion
      type="single"
      collapsible
      disabled
      className="nx:w-full nx:max-w-md"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Disabled Item 1</AccordionTrigger>
        <AccordionContent>
          This content cannot be accessed when disabled.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Disabled Item 2</AccordionTrigger>
        <AccordionContent>
          This content cannot be accessed when disabled.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole('button');

    // All triggers should be disabled
    for (const trigger of triggers) {
      await expect(trigger).toBeDisabled();
    }
  },
};

export const DisabledItem: Story = {
  render: (_args) => (
    <Accordion type="single" collapsible className="nx:w-full nx:max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Enabled Item</AccordionTrigger>
        <AccordionContent>This item can be toggled.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>Disabled Item</AccordionTrigger>
        <AccordionContent>This item cannot be toggled.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Another Enabled Item</AccordionTrigger>
        <AccordionContent>This item can also be toggled.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole('button');

    // First and third triggers should be enabled
    await expect(triggers[0]).not.toBeDisabled();
    await expect(triggers[2]).not.toBeDisabled();

    // Second trigger should be disabled
    await expect(triggers[1]).toBeDisabled();
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const ExpandInteraction: Story = {
  render: (_args) => (
    <Accordion type="single" collapsible className="nx:w-full nx:max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Click to expand</AccordionTrigger>
        <AccordionContent>
          This content appears when you click the trigger.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Another section</AccordionTrigger>
        <AccordionContent>This is another section content.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [firstTrigger, secondTrigger] = canvas.getAllByRole('button');
    if (!firstTrigger || !secondTrigger) {
      throw new Error('Expected 2 accordion triggers');
    }

    // Initially both should be closed
    await expect(firstTrigger).toHaveAttribute('data-state', 'closed');
    await expect(secondTrigger).toHaveAttribute('data-state', 'closed');

    // Click first trigger to expand
    await userEvent.click(firstTrigger);
    await expect(firstTrigger).toHaveAttribute('data-state', 'open');
    await expect(secondTrigger).toHaveAttribute('data-state', 'closed');

    // Click second trigger - first should close, second should open (single mode)
    await userEvent.click(secondTrigger);
    await expect(firstTrigger).toHaveAttribute('data-state', 'closed');
    await expect(secondTrigger).toHaveAttribute('data-state', 'open');

    // Click second trigger again to collapse (collapsible mode)
    await userEvent.click(secondTrigger);
    await expect(secondTrigger).toHaveAttribute('data-state', 'closed');
  },
};

export const MultipleExpandInteraction: Story = {
  render: (_args) => (
    <Accordion type="multiple" className="nx:w-full nx:max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Content for section 1.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Content for section 2.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [firstTrigger, secondTrigger] = canvas.getAllByRole('button');
    if (!firstTrigger || !secondTrigger) {
      throw new Error('Expected 2 accordion triggers');
    }

    // Click first trigger
    await userEvent.click(firstTrigger);
    await expect(firstTrigger).toHaveAttribute('data-state', 'open');

    // Click second trigger - both should be open (multiple mode)
    await userEvent.click(secondTrigger);
    await expect(firstTrigger).toHaveAttribute('data-state', 'open');
    await expect(secondTrigger).toHaveAttribute('data-state', 'open');

    // Click first trigger to close it
    await userEvent.click(firstTrigger);
    await expect(firstTrigger).toHaveAttribute('data-state', 'closed');
    await expect(secondTrigger).toHaveAttribute('data-state', 'open');
  },
};

export const KeyboardInteraction: Story = {
  render: (_args) => (
    <Accordion type="single" collapsible className="nx:w-full nx:max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>First Item</AccordionTrigger>
        <AccordionContent>First item content.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second Item</AccordionTrigger>
        <AccordionContent>Second item content.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third Item</AccordionTrigger>
        <AccordionContent>Third item content.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole('button');

    // Tab to first trigger
    await userEvent.tab();
    await expect(triggers[0]).toHaveFocus();

    // Enter expands
    await userEvent.keyboard('{Enter}');
    await expect(triggers[0]).toHaveAttribute('data-state', 'open');

    // Arrow down moves to next trigger
    await userEvent.keyboard('{ArrowDown}');
    await expect(triggers[1]).toHaveFocus();

    // Space expands (and closes first due to single mode)
    await userEvent.keyboard(' ');
    await expect(triggers[1]).toHaveAttribute('data-state', 'open');
    await expect(triggers[0]).toHaveAttribute('data-state', 'closed');

    // Arrow up moves to previous trigger
    await userEvent.keyboard('{ArrowUp}');
    await expect(triggers[0]).toHaveFocus();

    // Home moves to first trigger
    await userEvent.keyboard('{End}');
    await expect(triggers[2]).toHaveFocus();

    // End moves to last trigger
    await userEvent.keyboard('{Home}');
    await expect(triggers[0]).toHaveFocus();
  },
};

// ============================================
// DATA ATTRIBUTES TESTS
// ============================================

export const WithDataAttributes: Story = {
  render: (_args) => (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-1"
      className="nx:w-full nx:max-w-md"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Test Item</AccordionTrigger>
        <AccordionContent>Test content.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check data-slot attributes using querySelector (AccordionItem doesn't have a specific ARIA role)
    const accordion = canvasElement.querySelector('[data-slot="accordion"]');
    const item = canvasElement.querySelector('[data-slot="accordion-item"]');
    const trigger = canvas.getByRole('button');
    const content = canvasElement.querySelector(
      '[data-slot="accordion-content"]'
    );

    await expect(accordion).toBeInTheDocument();
    await expect(item).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('data-slot', 'accordion-trigger');
    await expect(content).toBeInTheDocument();
  },
};

// ============================================
// EDGE CASES
// ============================================

export const LongContent: Story = {
  render: (_args) => (
    <Accordion type="single" collapsible className="nx:w-full nx:max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          This is a very long trigger text that might wrap to multiple lines
          depending on the container width
        </AccordionTrigger>
        <AccordionContent>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const NestedContent: Story = {
  render: (_args) => (
    <Accordion type="single" collapsible className="nx:w-full nx:max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Item with nested content</AccordionTrigger>
        <AccordionContent>
          <div className="nx:space-y-4">
            <p>This content has nested elements:</p>
            <ul className="nx:list-disc nx:pl-4">
              <li>First list item</li>
              <li>Second list item</li>
              <li>Third list item</li>
            </ul>
            <p className="nx:text-muted-foreground">
              And some muted text at the bottom.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const SingleItem: Story = {
  render: (_args) => (
    <Accordion type="single" collapsible className="nx:w-full nx:max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Single accordion item</AccordionTrigger>
        <AccordionContent>This accordion has only one item.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Single (Collapsible)
        </h3>
        <Accordion type="single" collapsible className="nx:w-full nx:max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>First Item</AccordionTrigger>
            <AccordionContent>Content for the first item.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Second Item</AccordionTrigger>
            <AccordionContent>Content for the second item.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Multiple
        </h3>
        <Accordion
          type="multiple"
          defaultValue={['item-1', 'item-2']}
          className="nx:w-full nx:max-w-md"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>First Item (Open)</AccordionTrigger>
            <AccordionContent>Content for the first item.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Second Item (Open)</AccordionTrigger>
            <AccordionContent>Content for the second item.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          Disabled
        </h3>
        <Accordion
          type="single"
          collapsible
          disabled
          className="nx:w-full nx:max-w-md"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Disabled Item</AccordionTrigger>
            <AccordionContent>Content is not accessible.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
          With Default Value
        </h3>
        <Accordion
          type="single"
          collapsible
          defaultValue="item-1"
          className="nx:w-full nx:max-w-md"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Default Open Item</AccordionTrigger>
            <AccordionContent>This item is open by default.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Closed Item</AccordionTrigger>
            <AccordionContent>This item starts closed.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};

// ============================================
// MODE BEHAVIOUR (density stability)
// ============================================

export const AllModes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Accordion stays on the document spacing scale (`nx:py-4`) rather than migrating to `py-control-lg` — see `spacing-tokens.md` Accordion note. Accordion still mode-couples through `--nx-spacing-4` (nova 14 / vega-cluster 16 / maia 18), so the trigger height shifts between nova / vega-cluster / maia rows. The point is item-tier rhythm distinct from controls or containers, not density stability.',
      },
    },
  },
  render: () => (
    <AllModesGrid>
      {SPACING_MODES.map((mode) => (
        <AllModesRow key={mode} mode={mode}>
          <Accordion type="single" collapsible className="nx:w-[260px]">
            <AccordionItem value="a">
              <AccordionTrigger>Section · {mode}</AccordionTrigger>
              <AccordionContent>Content not measured.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </AllModesRow>
      ))}
    </AllModesGrid>
  ),
};

export const AccordionTriggerModesProduceDifferentHeights: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Cascade sentinel for AccordionTrigger. Uses the `nova` + `maia` pair — the two modes where `--nx-spacing-4` diverges from the vega cluster (nova 14, maia 18). An AccordionTrigger scoped to `nova` must render shorter than the same trigger scoped to `maia`.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-start nx:gap-4 nx:p-10 nx:bg-background">
      <div data-style="nova" data-testid="accordion-mode-host-nova">
        <Accordion type="single" collapsible className="nx:w-[200px]">
          <AccordionItem value="a">
            <AccordionTrigger>Nova</AccordionTrigger>
            <AccordionContent>x</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div data-style="maia" data-testid="accordion-mode-host-maia">
        <Accordion type="single" collapsible className="nx:w-[200px]">
          <AccordionItem value="a">
            <AccordionTrigger>Maia</AccordionTrigger>
            <AccordionContent>x</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectModeCascadeWorks(
      within(canvasElement),
      'accordion-mode-host-nova',
      'accordion-mode-host-maia',
      '[data-slot="accordion-trigger"]'
    );
  },
};

export const AccordionTriggerVegaHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the stays-numeric outcome: in vega mode, AccordionTrigger renders at exactly 52px (= `text-sm` line-height 20 + `py-4` 16 × 2). If a future PR migrates `py-4` → `py-control-lg`, vega rendering shifts to 44px (= 20 + 12 × 2) and this test fails — the regression signal is that Accordion was promoted out of item-tier rhythm into control-lg rhythm.',
      },
    },
  },
  render: () => (
    <div
      data-style="vega"
      data-testid="accordion-vega-host"
      className="nx:p-10 nx:bg-background"
    >
      <Accordion type="single" collapsible className="nx:w-[200px]">
        <AccordionItem value="a">
          <AccordionTrigger>Vega</AccordionTrigger>
          <AccordionContent>x</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(
      within(canvasElement),
      'accordion-vega-host',
      52,
      '[data-slot="accordion-trigger"]'
    );
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
