import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

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
    docs: {
      description: {
        component:
          'Accordion shows and hides stacked sections of content. Use it when readers need only some sections of a long page. For a single section, use Collapsible.',
      },
    },
  },
  args: {
    variant: 'stacked',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Lets one item or several items open at once.',
    },
    collapsible: {
      control: 'boolean',
      description: 'With `type="single"`, lets a click close the open item.',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents interaction with every item.',
    },
    variant: {
      control: 'select',
      options: ['stacked', 'floating'],
      description: 'Item style: divided rows or separate cards.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  tags: ['docs'],
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
          Yes. It comes with default styles that match the nxds design system.
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Open several sections at once with `type="multiple"`.',
      },
    },
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

export const Floating: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show each section as a separate bordered card.',
      },
    },
  },
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
          Yes. It comes with default styles that match the nxds design system.
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Disable one item so its section cannot open.',
      },
    },
  },
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
    await expect(item).toHaveClass('nx:bg-container');
    await expect(item).toHaveClass('nx:duration-fast');
    await expect(item).toHaveClass('nx:hover:bg-container-hover');
    await expect(item).toHaveClass('nx:data-disabled:hover:bg-container');
    await expect(trigger).toHaveAttribute('data-slot', 'accordion-trigger');
    await expect(trigger).toHaveClass('nx:transition-control');
    await expect(trigger).toHaveClass('nx:duration-fast');
    await expect(trigger).not.toHaveClass('nx:transition-all');
    await expect(chevron).toHaveClass('nx:duration-default');
    await expect(content).toBeInTheDocument();
    await expect(content).toHaveClass('nx:duration-default');
    await expect(content).toHaveClass(
      'nx:data-[state=open]:animate-accordion-down'
    );
    await expect(content).not.toHaveClass('nx:transition-all');
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

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
