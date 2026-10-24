import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { IconBold, IconItalic } from '@tabler/icons-vue';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

import { Toggle } from '.';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component:
          'Toggle is a button that stays pressed until clicked again, such as Bold. Icon-only toggles need an `aria-label`. For a set of related toggles, use ToggleGroup.',
      },
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

function tokenColor(element: Element, name: string) {
  return getComputedStyle(element)
    .getPropertyValue(`--nx-color-${name}`)
    .trim();
}

// A single two-state button.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { IconBold, Toggle },
    template: `
      <Toggle aria-label="Bold">
        <IconBold />
      </Toggle>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('data-slot', 'toggle');
    await expect(toggle).toHaveAttribute('data-variant', 'default');
    await expect(toggle).toHaveAttribute('data-size', 'default');
  },
};

// Borderless, bordered and transparent stroke-only variants.
export const Variants: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Pick `default`, `outline` or `outline-primary` for the border style.',
      },
    },
  },
  render: () => ({
    components: { IconBold, IconItalic, Toggle },
    template: `
      <div class="nx:flex nx:gap-3">
        <Toggle variant="default" aria-label="Bold">
          <IconBold />
        </Toggle>
        <Toggle variant="outline" aria-label="Italic">
          <IconItalic />
        </Toggle>
        <Toggle variant="outline-primary" aria-label="Outline primary bold" :default-value="true">
          <IconBold />
        </Toggle>
      </div>
    `,
  }),
};

// The three sizes.
export const Sizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `size` to `sm`, `default` or `lg`.',
      },
    },
  },
  render: () => ({
    components: { IconBold, Toggle },
    template: `
      <div class="nx:flex nx:items-center nx:gap-3">
        <Toggle size="sm" aria-label="Small">
          <IconBold />
        </Toggle>
        <Toggle size="default" aria-label="Default">
          <IconBold />
        </Toggle>
        <Toggle size="lg" aria-label="Large">
          <IconBold />
        </Toggle>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sm = canvas.getByRole('button', { name: 'Small' });
    const md = canvas.getByRole('button', { name: 'Default' });
    const lg = canvas.getByRole('button', { name: 'Large' });

    await expect(sm).toHaveClass('nx:typography-label-small');
    await expect(sm).toHaveClass('nx:px-3', 'nx:py-1.5', 'nx:gap-1.5');

    await expect(md).toHaveClass('nx:typography-label-default');
    await expect(md).toHaveClass('nx:px-4', 'nx:py-2', 'nx:gap-2');
    await expect(lg).toHaveClass('nx:typography-label-default');
    await expect(lg).toHaveClass('nx:px-8', 'nx:py-3', 'nx:gap-2.5');
  },
};

// A toggle with text alongside the icon, shown pressed.
export const WithText: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Put an icon and a text label in the same toggle.',
      },
    },
  },
  render: () => ({
    components: { IconBold, Toggle },
    template: `
      <Toggle aria-label="Bold" :default-value="true">
        <IconBold />
        Bold
      </Toggle>
    `,
  }),
};

// Clicking toggles the pressed state and emits the new model value.
export const ClickInteraction: Story = {
  args: { 'onUpdate:modelValue': fn() },
  render: (args) => ({
    components: { IconBold, Toggle },
    setup: () => ({ args }),
    template: `
      <Toggle v-bind="args" aria-label="Bold">
        <IconBold />
      </Toggle>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('data-state', 'off');
    await userEvent.click(toggle);
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(true);
    await expect(toggle).toHaveAttribute('data-state', 'on');
  },
};

// Enter/Space toggles when focused. Pressed outline-primary keeps a transparent
// background, takes the primary active border, and never changes size.
export const KeyboardInteraction: Story = {
  args: { 'onUpdate:modelValue': fn() },
  render: (args) => ({
    components: { IconItalic, Toggle },
    setup: () => ({ args }),
    template: `
      <Toggle v-bind="args" variant="outline-primary" aria-label="Italic">
        <IconItalic />
      </Toggle>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Italic' });
    const initial = toggle.getBoundingClientRect();
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await expect(getComputedStyle(toggle).outlineWidth).toBe('2px');
    await expect(getComputedStyle(toggle).outlineColor).toBe(
      tokenColor(toggle, 'focus-default')
    );
    await userEvent.keyboard('{Enter}');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(true);
    await expect(toggle).toHaveAttribute('data-state', 'on');
    await expect(getComputedStyle(toggle).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)'
    );
    // border-color eases through transition-control; wait for it to settle.
    await waitFor(() =>
      expect(getComputedStyle(toggle).borderTopColor).toBe(
        tokenColor(toggle, 'primary-border-active')
      )
    );
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    const final = toggle.getBoundingClientRect();
    await expect([final.width, final.height]).toEqual([
      initial.width,
      initial.height,
    ]);
  },
};

// A disabled toggle does not respond to clicks.
export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'A disabled toggle shows muted colors and ignores clicks.',
      },
    },
  },
  render: () => ({
    components: { IconBold, Toggle },
    template: `
      <Toggle aria-label="Bold" disabled>
        <IconBold />
      </Toggle>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toBeDisabled();

    // Disabled state uses a semantic text token at full opacity (not a fade).
    await expect(toggle).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(toggle).opacity).toBe('1');
  },
};

// data-slot identifies the component; data-variant / data-size reflect props.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { IconBold, Toggle },
    template: `
      <Toggle aria-label="Bold" variant="outline" size="sm">
        <IconBold />
      </Toggle>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('data-slot', 'toggle');
    await expect(toggle).toHaveAttribute('data-variant', 'outline');
    await expect(toggle).toHaveAttribute('data-size', 'sm');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Variants × on/off states, then the three sizes. The pressed (on) row
// exercises the data-[state=on] fill.
export const AllVariants: Story = {
  render: () => ({
    components: { IconBold, IconItalic, Toggle },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <div class="nx:flex nx:items-center nx:gap-3">
          <Toggle aria-label="Default off">
            <IconBold />
          </Toggle>
          <Toggle aria-label="Default on" :default-value="true">
            <IconBold />
          </Toggle>
          <Toggle variant="outline" aria-label="Outline off">
            <IconItalic />
          </Toggle>
          <Toggle variant="outline" aria-label="Outline on" :default-value="true">
            <IconItalic />
          </Toggle>
          <Toggle variant="outline-primary" aria-label="Outline primary off">
            <IconBold />
          </Toggle>
          <Toggle variant="outline-primary" aria-label="Outline primary on" :default-value="true">
            <IconBold />
          </Toggle>
        </div>
        <div class="nx:flex nx:items-center nx:gap-3">
          <Toggle size="sm" aria-label="Small">
            <IconBold />
          </Toggle>
          <Toggle size="default" aria-label="Medium">
            <IconBold />
          </Toggle>
          <Toggle size="lg" aria-label="Large">
            <IconBold />
          </Toggle>
        </div>
      </div>
    `,
  }),
};

export const InvalidOutlinePrimary: Story = {
  render: () => ({
    components: { Toggle },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <p id="toggle-invalid-error">This formatting is not supported.</p>
        <Toggle
          v-for="pressed in [false, true]"
          :key="String(pressed)"
          variant="outline-primary"
          :default-value="pressed"
          aria-invalid="true"
          aria-describedby="toggle-invalid-error"
        >
          {{ pressed ? 'Invalid selected' : 'Invalid resting' }}
        </Toggle>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const resting = canvas.getByRole('button', { name: 'Invalid resting' });
    const selected = canvas.getByRole('button', { name: 'Invalid selected' });
    await expect(getComputedStyle(resting).borderTopColor).toBe(
      tokenColor(resting, 'error-border')
    );
    await expect(getComputedStyle(selected).borderTopColor).toBe(
      tokenColor(selected, 'border-error-active')
    );
    for (const toggle of [resting, selected]) {
      await userEvent.tab();
      await expect(toggle).toHaveFocus();
      await expect(getComputedStyle(toggle).outlineColor).toBe(
        tokenColor(toggle, 'focus-error')
      );
    }
  },
};

export const Controlled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Drive the pressed state with `v-model`.',
      },
    },
  },
  render: () => ({
    components: { Toggle },
    setup: () => ({ bold: ref(false) }),
    template: `
      <Toggle v-model="bold" variant="outline-primary">
        Controlled bold
      </Toggle>
    `,
  }),
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('button', {
      name: 'Controlled bold',
    });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  },
};

export const AsChild: Story = {
  render: () => ({
    components: { Toggle },
    template: `
      <Toggle as-child variant="outline-primary">
        <button type="button">Composed bold</button>
      </Toggle>
    `,
  }),
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('button', {
      name: 'Composed bold',
    });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(canvasElement.querySelectorAll('button')).toHaveLength(1);
  },
};

export const LongContent: Story = {
  render: () => ({
    components: { Toggle },
    template: `
      <Toggle variant="outline-primary">
        Apply formatting to all selected paragraphs
      </Toggle>
    `,
  }),
};
