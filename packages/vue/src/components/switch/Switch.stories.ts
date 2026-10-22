import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { IconCheck } from '@tabler/icons-vue';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ref, useId } from 'vue';

import { Switch } from '.';

const meta = {
  title: 'Components/Switch',
  parameters: {
    docs: {
      description: {
        component:
          'Switch turns a setting on or off right away, with no save step. Pair it with a label so the label text is clickable too.',
      },
    },
  },
  component: Switch,
  args: {
    'onUpdate:modelValue': fn(),
  },
  argTypes: {
    size: { control: 'select', options: ['default', 'sm'] },
    disabled: { control: 'boolean' },
  },
  render: (args) => ({
    components: { Switch },
    setup: () => ({ args }),
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Switch id="airplane-mode" v-bind="args" />
        <label for="airplane-mode">Airplane mode</label>
      </div>
    `,
  }),
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const WithLabel: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Switch },
    setup: () => ({ switchId: useId() }),
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Switch :id="switchId" />
        <label :for="switchId">Airplane mode</label>
      </div>
    `,
  }),
};

export const Checked: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `default-value` to start the switch in the on position.',
      },
    },
  },
  render: () => ({
    components: { Switch },
    template: `
      <Switch aria-label="Toggle switch" :default-value="true" />
    `,
  }),
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'A disabled switch shows muted colors and ignores clicks.',
      },
    },
  },
  render: () => ({
    components: { Switch },
    template: `
      <Switch aria-label="Toggle switch" disabled />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toBeDisabled();
    // An unchecked-disabled switch recolors its border via a semantic disabled
    // token at full opacity (not a fade).
    await expect(switchEl).toHaveClass('nx:disabled:border-border-disabled');
    await expect(getComputedStyle(switchEl).opacity).toBe('1');
  },
};

export const Small: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `size="sm"` for dense rows.',
      },
    },
  },
  render: () => ({
    components: { Switch },
    template: `
      <Switch size="sm" aria-label="Toggle switch" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toHaveAttribute('data-size', 'sm');

    // The smaller control still toggles (geometry-only size change).
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'checked');
  },
};

export const LabelOnLeft: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Put the label and description on the left of a settings row.',
      },
    },
  },
  render: () => ({
    components: { Switch },
    setup: () => ({ switchId: useId(), descriptionId: useId() }),
    template: `
      <div class="nx:flex nx:items-center nx:justify-between nx:gap-4 nx:rounded-lg nx:border-default nx:border-border-default nx:p-4">
        <div class="nx:space-y-0.5">
          <label :for="switchId">Marketing emails</label>
          <p :id="descriptionId" class="nx:typography-body-default nx:text-muted-foreground">
            Receive emails about new products and features.
          </p>
        </div>
        <Switch :id="switchId" :aria-describedby="descriptionId" />
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    components: { Switch },
    template: `
      <div class="nx:flex nx:items-center nx:gap-4">
        <Switch aria-label="Default size" :default-value="true" />
        <Switch aria-label="Small size" size="sm" :default-value="true" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('switch', { name: 'Small size' })
    ).toHaveAttribute('data-size', 'sm');
    await expect(
      canvas.getByRole('switch', { name: 'Default size' })
    ).toHaveAttribute('data-size', 'default');
  },
};

export const ClickInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const toggle = within(canvasElement).getByRole('switch', {
      name: 'Airplane mode',
    });

    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(toggle).toHaveAttribute('data-state', 'checked');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(true);
  },
};

export const LabelClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Airplane mode'));
    await expect(canvas.getByRole('switch')).toHaveAttribute(
      'aria-checked',
      'true'
    );
  },
};

export const KeyboardInteraction: Story = {
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch');

    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  },
};

export const VModel: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ enabled: ref(true) }),
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Switch id="emails" v-model="enabled" />
        <label for="emails">Emails {{ enabled ? 'on' : 'off' }}</label>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Emails on')).toBeVisible();
    await userEvent.click(canvas.getByRole('switch'));
    await expect(canvas.getByText('Emails off')).toBeVisible();
  },
};

export const DisabledInteraction: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const toggle = within(canvasElement).getByRole('switch');

    await expect(toggle).toBeDisabled();
    await userEvent.click(toggle, { pointerEventsCheck: 0 });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(args['onUpdate:modelValue']).not.toHaveBeenCalled();
  },
};

export const WithDataAttributes: Story = {
  args: { size: 'sm', defaultValue: true },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch');
    const thumb = toggle.querySelector('[data-slot="switch-thumb"]');

    await expect(toggle).toHaveAttribute('data-slot', 'switch');
    await expect(toggle).toHaveAttribute('data-size', 'sm');
    await expect(toggle).toHaveAttribute('data-state', 'checked');
    await expect(thumb).toHaveAttribute('data-state', 'checked');
  },
};

export const ThumbSlot: Story = {
  render: () => ({
    components: { IconCheck, Switch },
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Switch id="auto-save">
          <template #thumb="{ checked }">
            <IconCheck
              v-if="checked"
              aria-hidden="true"
              class="nx:size-4 nx:p-0.5 nx:text-primary-background"
            />
          </template>
        </Switch>
        <label for="auto-save">Auto-save</label>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch');
    const thumb = toggle.querySelector('[data-slot="switch-thumb"]');

    await expect(thumb?.querySelector('svg')).toBeNull();
    await userEvent.click(toggle);
    await expect(thumb?.querySelector('svg')).not.toBeNull();
  },
};
