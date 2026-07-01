import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { expectHeightPinned } from '../../../stories/story-height-test-utils';

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
  args: {
    variant: 'stacked',
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
    variant: {
      control: 'select',
      options: ['stacked', 'floating'],
      description: 'Visual treatment for accordion items',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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

export const Stacked: Story = {
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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
  render: ({ variant }) => (
    <Accordion
      type="multiple"
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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

export const Floating: Story = {
  args: {
    variant: 'floating',
  },
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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

export const MultipleFloating: Story = {
  args: {
    variant: 'floating',
  },
  render: ({ variant }) => (
    <Accordion
      type="multiple"
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
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
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      disabled
      variant={variant}
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

    // Disabled state uses a semantic text token at full opacity (not a fade).
    await expect(triggers[0]).toHaveClass(
      'nx:disabled:text-disabled-foreground'
    );
    await expect(getComputedStyle(triggers[0]!).opacity).toBe('1');
  },
};

export const DisabledItem: Story = {
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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
  render: ({ variant }) => (
    <Accordion
      type="multiple"
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
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
    const chevron = trigger.querySelector('svg');
    const content = canvasElement.querySelector(
      '[data-slot="accordion-content"]'
    );

    await expect(accordion).toBeInTheDocument();
    await expect(accordion).toHaveAttribute('data-variant', 'stacked');
    await expect(item).toBeInTheDocument();
    await expect(item).toHaveClass('nx:duration-fast');
    await expect(trigger).toHaveAttribute('data-slot', 'accordion-trigger');
    await expect(trigger).toHaveClass('nx:transition-colors');
    await expect(trigger).toHaveClass('nx:duration-fast');
    await expect(trigger).not.toHaveClass('nx:transition-all');
    await expect(chevron).toHaveClass('nx:duration-default');
    await expect(chevron).toHaveClass('nx:motion-reduce:transition-none');
    await expect(content).toBeInTheDocument();
    await expect(content).toHaveClass('nx:duration-default');
    await expect(content).toHaveClass(
      'nx:data-[state=open]:animate-accordion-down'
    );
    await expect(content).toHaveClass(
      'nx:motion-reduce:data-[state=open]:animate-none'
    );
    await expect(content).not.toHaveClass('nx:transition-all');
  },
};

export const WithFloatingDataAttributes: Story = {
  args: {
    variant: 'floating',
  },
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
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
    const accordion = canvasElement.querySelector('[data-slot="accordion"]');

    await expect(accordion).toBeInTheDocument();
    await expect(accordion).toHaveAttribute('data-variant', 'floating');
  },
};

// ============================================
// EDGE CASES
// ============================================

export const LongContent: Story = {
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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
  render: ({ variant }) => (
    <Accordion
      type="single"
      collapsible
      variant={variant}
      className="nx:w-full nx:max-w-md"
    >
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
    <div className="nx:grid nx:gap-8 nx:lg:grid-cols-2">
      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Single Stacked
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
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Multiple Stacked
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
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Single Floating
        </h3>
        <Accordion
          type="single"
          collapsible
          variant="floating"
          className="nx:w-full nx:max-w-md"
        >
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
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Multiple Floating
        </h3>
        <Accordion
          type="multiple"
          variant="floating"
          defaultValue={['item-1', 'item-2']}
          className="nx:w-full nx:max-w-md"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Floating First Item (Open)</AccordionTrigger>
            <AccordionContent>This item is open by default.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Floating Second Item (Open)</AccordionTrigger>
            <AccordionContent>
              This item is also open by default.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};

export const AccordionTriggerDefaultHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the numeric-spacing outcome: in default mode, AccordionTrigger renders at exactly 52px (= `typography-label-default` line-height 20 + `py-4` 16 x 2).',
      },
    },
  },
  render: () => (
    <div
      data-testid="accordion-default-host"
      className="nx:p-10 nx:bg-background"
    >
      <Accordion type="single" collapsible className="nx:w-[200px]">
        <AccordionItem value="a">
          <AccordionTrigger>Default</AccordionTrigger>
          <AccordionContent>x</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(
      within(canvasElement),
      'accordion-default-host',
      52,
      {
        selector: '[data-slot="accordion-trigger"]',
      }
    );
  },
};

export const AccordionFloatingTriggerDefaultHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the floating visual variant: the item chrome changes, but the AccordionTrigger remains exactly 52px in default mode.',
      },
    },
  },
  render: () => (
    <div
      data-testid="accordion-floating-default-host"
      className="nx:p-10 nx:bg-background"
    >
      <Accordion
        type="single"
        collapsible
        variant="floating"
        className="nx:w-[200px]"
      >
        <AccordionItem value="a">
          <AccordionTrigger>Default</AccordionTrigger>
          <AccordionContent>x</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(
      within(canvasElement),
      'accordion-floating-default-host',
      52,
      {
        selector: '[data-slot="accordion-trigger"]',
      }
    );
  },
};

export const AccordionExpandedItemDefaultHeightPinned: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the expanded item anatomy: one body-small content line should keep the open item close to the 88px Figma baseline.',
      },
    },
  },
  render: () => (
    <div className="nx:p-10 nx:bg-background">
      <Accordion
        type="single"
        collapsible
        defaultValue="a"
        className="nx:w-[200px]"
      >
        <AccordionItem value="a" data-testid="accordion-expanded-item">
          <AccordionTrigger>Default</AccordionTrigger>
          <AccordionContent>x</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await document.fonts.ready;

    const item = within(canvasElement).getByTestId('accordion-expanded-item');
    const actualHeight = Math.round(item.getBoundingClientRect().height);

    await expect(actualHeight).toBeGreaterThanOrEqual(88);
    await expect(actualHeight).toBeLessThanOrEqual(89);
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
