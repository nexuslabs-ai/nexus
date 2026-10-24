import type { Meta, StoryObj } from '@storybook/vue3-vite';
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconItalic,
  IconUnderline,
} from '@tabler/icons-vue';
import {
  expect,
  fn,
  type Mock,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';
import { ref, useId } from 'vue';

import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';

import { ToggleGroup, ToggleGroupItem } from '.';

type ToggleGroupArgs = InstanceType<typeof ToggleGroup>['$props'] & {
  'onUpdate:modelValue'?: Mock<(value: unknown) => void>;
};

const meta = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    docs: {
      description: {
        component:
          'ToggleGroup is a set of related toggles, such as text alignment or Bold, Italic and Underline. Use `type="single"` for one choice or `type="multiple"` for several. Icon-only items need an `aria-label`.',
      },
    },
  },
} satisfies Meta<ToggleGroupArgs>;

export default meta;
type Story = StoryObj<ToggleGroupArgs>;

const alignIcons = { IconAlignCenter, IconAlignLeft, IconAlignRight };
const formatIcons = { IconBold, IconItalic, IconUnderline };

// Single-select permits one selected item or an empty selection.
// Also guards invariant #3 — data-variant / data-size are emitted on the default.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      IconAlignCenter,
      IconAlignLeft,
      IconAlignRight,
      ToggleGroup,
      ToggleGroupItem,
    },
    template: `
      <ToggleGroup type="single" default-value="left">
        <ToggleGroupItem value="left" aria-label="Align left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <IconAlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <IconAlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="toggle-group"]');
    await expect(group).toHaveAttribute('data-variant', 'default');
    await expect(group).toHaveAttribute('data-size', 'default');
    const item = canvasElement.querySelector('[data-slot="toggle-group-item"]');
    await expect(item).toHaveAttribute('data-variant', 'default');
    await expect(item).toHaveAttribute('data-size', 'default');
  },
};

// Multiple-select: any number of items pressed at once.
export const Multiple: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `type="multiple"` to let users press several items at once.',
      },
    },
  },
  render: () => ({
    components: {
      IconBold,
      IconItalic,
      IconUnderline,
      ToggleGroup,
      ToggleGroupItem,
    },
    template: `
      <ToggleGroup type="multiple" :default-value="['bold']">
        <ToggleGroupItem value="bold" aria-label="Bold">
          <IconBold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <IconItalic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <IconUnderline />
        </ToggleGroupItem>
      </ToggleGroup>
    `,
  }),
};

// The outline variant, applied to the whole group via context.
export const Outline: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `variant="outline"` on the group to style every item.',
      },
    },
  },
  render: () => ({
    components: {
      IconAlignCenter,
      IconAlignLeft,
      IconAlignRight,
      ToggleGroup,
      ToggleGroupItem,
    },
    template: `
      <ToggleGroup type="single" variant="outline" default-value="left">
        <ToggleGroupItem value="left" aria-label="Align left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <IconAlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <IconAlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
    `,
  }),
};

// Joined (spacing 0, segmented) vs separated (spacing 2, individual pills).
export const Spacing: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Leave `spacing` at 0 for a joined control, or raise it for separate pills.',
      },
    },
  },
  render: () => ({
    components: {
      IconAlignCenter,
      IconAlignLeft,
      IconAlignRight,
      IconBold,
      IconItalic,
      IconUnderline,
      ToggleGroup,
      ToggleGroupItem,
    },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <ToggleGroup type="single" variant="outline" default-value="left">
          <ToggleGroupItem value="left" aria-label="Align left">
            <IconAlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <IconAlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <IconAlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" variant="outline" :spacing="2" default-value="left">
          <ToggleGroupItem value="left" aria-label="Align left (spaced)">
            <IconAlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center (spaced)">
            <IconAlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right (spaced)">
            <IconAlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          type="multiple"
          variant="outline-primary"
          :default-value="['bold', 'italic']"
        >
          <ToggleGroupItem value="bold" aria-label="Outline primary bold">
            <IconBold />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Outline primary italic">
            <IconItalic />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Outline primary underline">
            <IconUnderline />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    `,
  }),
};

const NAVIGATION = [
  { name: 'LTR', dir: 'ltr', orientation: 'horizontal', loop: true },
  { name: 'RTL', dir: 'rtl', orientation: 'horizontal', loop: true },
  { name: 'Vertical', dir: 'ltr', orientation: 'vertical', loop: true },
  { name: 'Vertical RTL', dir: 'rtl', orientation: 'vertical', loop: true },
  { name: 'No loop', dir: 'ltr', orientation: 'horizontal', loop: false },
  {
    name: 'Omitted orientation',
    dir: 'ltr',
    orientation: undefined,
    loop: true,
  },
] as const;

export const KeyboardContract: Story = {
  render: () => ({
    components: { ToggleGroup, ToggleGroupItem },
    setup: () => ({ navigation: NAVIGATION }),
    template: `
      <div class="nx:flex nx:flex-wrap nx:items-start nx:gap-8">
        <ToggleGroup
          v-for="config in navigation"
          :key="config.name"
          type="single"
          variant="outline-primary"
          :dir="config.dir"
          :orientation="config.orientation"
          :loop="config.loop"
          default-value="left"
          :aria-label="config.name"
        >
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center" disabled>Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const config of NAVIGATION) {
      const group = within(canvasElement).getByRole('group', {
        name: config.name,
      });
      const left = within(group).getByRole('radio', { name: 'Left' });
      const center = within(group).getByRole('radio', { name: 'Center' });
      const right = within(group).getByRole('radio', { name: 'Right' });
      const next =
        config.orientation === 'vertical'
          ? '{ArrowDown}'
          : config.dir === 'rtl'
            ? '{ArrowLeft}'
            : '{ArrowRight}';
      const previous =
        config.orientation === 'vertical'
          ? '{ArrowUp}'
          : config.dir === 'rtl'
            ? '{ArrowRight}'
            : '{ArrowLeft}';
      left.focus();
      await userEvent.keyboard(next);
      await waitFor(() => expect(right).toHaveFocus());
      await expect(center).toBeDisabled();
      await expect(left).toHaveAttribute('aria-checked', 'true');
      await expect(right).toHaveAttribute('aria-checked', 'false');
      await userEvent.keyboard(next);
      await waitFor(() => expect(config.loop ? left : right).toHaveFocus());
      await userEvent.keyboard('{Home}');
      await waitFor(() => expect(left).toHaveFocus());
      await userEvent.keyboard(previous);
      await waitFor(() => expect(config.loop ? right : left).toHaveFocus());
      await userEvent.keyboard('{End}');
      await waitFor(() => expect(right).toHaveFocus());
      await expect(left).toHaveAttribute('aria-checked', 'true');
      await userEvent.keyboard(' ');
      await expect(right).toHaveAttribute('aria-checked', 'true');
      await expect(left).toHaveAttribute('aria-checked', 'false');
      await userEvent.keyboard('{Enter}');
      await expect(right).toHaveAttribute('aria-checked', 'false');
      await expect(right).not.toHaveAttribute('aria-pressed');
      left.focus();
      await userEvent.keyboard(
        config.orientation === 'vertical' ? '{ArrowRight}' : '{ArrowDown}'
      );
      await expect(left).toHaveFocus();
      await expect(group).toHaveAttribute(
        'data-orientation',
        config.orientation ?? 'horizontal'
      );
    }
  },
};

export const WithoutRovingFocus: Story = {
  render: () => ({
    components: { ToggleGroup, ToggleGroupItem },
    template: `
      <ToggleGroup
        type="multiple"
        variant="outline-primary"
        orientation="vertical"
        :roving-focus="false"
      >
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
      </ToggleGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('button');
    const group = within(canvasElement).getByRole('group');
    await expect(group).toHaveAttribute('data-orientation', 'vertical');
    await expect(getComputedStyle(group).flexDirection).toBe('column');
    for (const item of items) {
      await userEvent.tab();
      await expect(item).toHaveFocus();
    }
  },
};

export const ControlledDisabledTransition: Story = {
  args: { 'onUpdate:modelValue': fn() },
  render: (args) => ({
    components: { Button, ToggleGroup, ToggleGroupItem },
    setup() {
      const value = ref<string | undefined>('bold');
      const disabled = ref(false);
      function update(next: string | undefined) {
        value.value = next;
        args['onUpdate:modelValue']?.(next);
      }
      return { disabled, update, value };
    },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <Button @click="disabled = !disabled">
          {{ disabled ? 'Enable formatting' : 'Disable formatting' }}
        </Button>
        <p id="group-format-error">Bold is not supported for this field.</p>
        <ToggleGroup
          type="single"
          variant="outline-primary"
          :model-value="value"
          :disabled="disabled"
          @update:model-value="update"
        >
          <ToggleGroupItem
            value="bold"
            aria-invalid="true"
            aria-describedby="group-format-error"
          >
            Bold
          </ToggleGroupItem>
          <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        </ToggleGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole('radio', { name: 'Bold' });
    const italic = canvas.getByRole('radio', { name: 'Italic' });
    const box = bold.getBoundingClientRect();
    const token = (name: string) =>
      getComputedStyle(bold).getPropertyValue(`--nx-color-${name}`).trim();
    await expect(getComputedStyle(bold).borderTopColor).toBe(
      token('border-error-active')
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Disable formatting' })
    );
    await expect(bold).toBeDisabled();
    await expect(italic).toBeDisabled();
    await expect(bold).toHaveAttribute('aria-checked', 'true');
    // border-color eases through transition-control; wait for it to settle.
    await waitFor(() =>
      expect(getComputedStyle(bold).borderTopColor).toBe(
        token('border-disabled')
      )
    );
    await expect(args['onUpdate:modelValue']).not.toHaveBeenCalled();
    await expect([
      bold.getBoundingClientRect().width,
      bold.getBoundingClientRect().height,
    ]).toEqual([box.width, box.height]);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Enable formatting' })
    );
    await expect(bold).not.toBeDisabled();
    await waitFor(() =>
      expect(getComputedStyle(bold).borderTopColor).toBe(
        token('border-error-active')
      )
    );
    await userEvent.click(bold);
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(undefined);
    await expect(bold).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(italic);
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith('italic');
  },
};

export const InvalidOwnership: Story = {
  render: () => ({
    components: { ToggleGroup, ToggleGroupItem },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <p id="group-selection-error">Choose supported formatting.</p>
        <ToggleGroup
          type="multiple"
          variant="outline-primary"
          aria-invalid="true"
          aria-describedby="group-selection-error"
          aria-label="Group error"
        >
          <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          type="multiple"
          variant="outline-primary"
          :default-value="['bold', 'italic']"
          aria-label="Item errors"
        >
          <ToggleGroupItem
            value="bold"
            aria-invalid="true"
            aria-describedby="group-selection-error"
          >
            Invalid bold
          </ToggleGroupItem>
          <ToggleGroupItem
            value="italic"
            aria-invalid="true"
            aria-describedby="group-selection-error"
          >
            Invalid italic
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const normal = canvas.getByRole('button', { name: 'Bold' });
    await expect(normal).not.toHaveAttribute('aria-invalid');
    await expect(getComputedStyle(normal).borderTopColor).toBe(
      getComputedStyle(normal)
        .getPropertyValue('--nx-color-border-default')
        .trim()
    );
    for (const item of within(
      canvas.getByRole('group', { name: 'Item errors' })
    ).getAllByRole('button')) {
      await expect(item).toHaveAccessibleDescription(
        'Choose supported formatting.'
      );
      await expect(getComputedStyle(item).borderTopColor).toBe(
        getComputedStyle(item)
          .getPropertyValue('--nx-color-border-error-active')
          .trim()
      );
    }
  },
};

export const EmptyAndSingle: Story = {
  render: () => ({
    components: { ToggleGroup, ToggleGroupItem },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <ToggleGroup
          type="multiple"
          variant="outline-primary"
          aria-label="Empty formatting"
        />
        <ToggleGroup type="multiple" variant="outline-primary" aria-label="One item">
          <ToggleGroupItem value="bold" as-child>
            <button type="button">Single composed bold</button>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      within(
        canvas.getByRole('group', { name: 'Empty formatting' })
      ).queryAllByRole('button')
    ).toHaveLength(0);
    const item = canvas.getByRole('button', { name: 'Single composed bold' });
    await userEvent.click(item);
    await expect(item).toHaveAttribute('aria-pressed', 'true');
    const style = getComputedStyle(item);
    const radius = style.getPropertyValue('--nx-radius-md').trim();
    await expect(style.borderTopLeftRadius).toBe(radius);
    await expect(style.borderTopRightRadius).toBe(radius);
  },
};

export const FormattingSettings: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Use toggle groups for text formatting and paragraph style inside a settings form.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      IconBold,
      IconItalic,
      IconUnderline,
      Input,
      Label,
      ToggleGroup,
      ToggleGroupItem,
    },
    setup: () => ({ titleId: useId() }),
    template: `
      <section
        class="nx:flex nx:max-w-full nx:flex-col nx:gap-6"
        aria-label="Formatting settings"
      >
        <div class="nx:flex nx:flex-col nx:gap-2">
          <Label :for="titleId">Document title</Label>
          <Input :id="titleId" default-value="Assessment instructions" />
        </div>
        <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
          <ToggleGroup
            type="multiple"
            variant="outline-primary"
            :default-value="['bold']"
            aria-label="Text formatting"
          >
            <ToggleGroupItem value="bold" aria-label="Bold">
              <IconBold />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <IconItalic />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <IconUnderline />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline">Reset formatting</Button>
          <Button>Save settings</Button>
        </div>
        <ToggleGroup
          type="single"
          variant="outline-primary"
          :spacing="2"
          aria-label="Paragraph style"
          class="nx:flex-wrap"
        >
          <ToggleGroupItem value="body">Body text</ToggleGroupItem>
          <ToggleGroupItem value="heading">Section heading</ToggleGroupItem>
        </ToggleGroup>
      </section>
    `,
  }),
};

// Clicking an item selects it (and deselects the previously selected one).
export const ClickInteraction: Story = {
  render: () => ({
    components: { ...alignIcons, ToggleGroup, ToggleGroupItem },
    template: `
      <ToggleGroup type="single" default-value="left">
        <ToggleGroupItem value="left" aria-label="Align left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <IconAlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <IconAlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const center = canvas.getByRole('radio', { name: 'Align center' });
    await expect(center).toHaveAttribute('data-state', 'off');
    await userEvent.click(center);
    await expect(center).toHaveAttribute('data-state', 'on');
    await expect(
      canvas.getByRole('radio', { name: 'Align left' })
    ).toHaveAttribute('data-state', 'off');
  },
};

// A disabled group disables all its items.
export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Disable the group to disable every item in it.',
      },
    },
  },
  render: () => ({
    components: {
      IconAlignCenter,
      IconAlignLeft,
      ToggleGroup,
      ToggleGroupItem,
    },
    template: `
      <ToggleGroup type="single" default-value="left" disabled>
        <ToggleGroupItem value="left" aria-label="Align left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <IconAlignCenter />
        </ToggleGroupItem>
      </ToggleGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('radio', { name: 'Align left' })
    ).toBeDisabled();
  },
};

// The group carries data-variant / data-size; items inherit them through
// the injected group, and a per-item variant overrides the group's.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { ...alignIcons, ToggleGroup, ToggleGroupItem },
    template: `
      <ToggleGroup type="single" variant="outline" size="sm" default-value="left">
        <ToggleGroupItem value="left" aria-label="Align left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" variant="default" aria-label="Align center">
          <IconAlignCenter />
        </ToggleGroupItem>
      </ToggleGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="toggle-group"]');
    await expect(group).toHaveAttribute('data-variant', 'outline');
    await expect(group).toHaveAttribute('data-size', 'sm');
    const [inherited, override] = canvasElement.querySelectorAll(
      '[data-slot="toggle-group-item"]'
    );
    await expect(inherited).toHaveAttribute('data-variant', 'outline');
    await expect(inherited).toHaveAttribute('data-size', 'sm');
    await expect(inherited).toHaveClass('nx:border-border-default');
    await expect(override).toHaveAttribute('data-variant', 'default');
    await expect(override).not.toHaveClass('nx:border-border-default');
  },
};

// v-model keeps the parent's value in step with the pressed item.
export const VModel: Story = {
  render: () => ({
    components: { ...alignIcons, ToggleGroup, ToggleGroupItem },
    setup: () => ({ alignment: ref('left') }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-2">
        <ToggleGroup v-model="alignment" type="single">
          <ToggleGroupItem value="left" aria-label="Align left">
            <IconAlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <IconAlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
        <output data-testid="alignment">{{ alignment }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Align right' }));
    await expect(canvas.getByTestId('alignment')).toHaveTextContent('right');
    await expect(
      canvas.getByRole('radio', { name: 'Align right' })
    ).toHaveAttribute('aria-checked', 'true');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Single + multiple, all variants, joined + spaced.
export const AllVariants: Story = {
  render: () => ({
    components: { ...alignIcons, ...formatIcons, ToggleGroup, ToggleGroupItem },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <ToggleGroup
          type="multiple"
          variant="outline-primary"
          :default-value="['bold', 'italic']"
        >
          <ToggleGroupItem value="bold" aria-label="Outline primary bold">
            <IconBold />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Outline primary italic">
            <IconItalic />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Outline primary underline">
            <IconUnderline />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" default-value="left">
          <ToggleGroupItem value="left" aria-label="Align left">
            <IconAlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <IconAlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <IconAlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" variant="outline" :default-value="['bold']">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <IconBold />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <IconItalic />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <IconUnderline />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" variant="outline" :spacing="2" default-value="left">
          <ToggleGroupItem value="left" aria-label="Spaced left">
            <IconAlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Spaced center">
            <IconAlignCenter />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    `,
  }),
};

const SIZES = ['sm', 'default', 'lg'] as const;

// outline-primary shares the outline variant's box at every size — only the
// border colour differs.
export const OutlinePrimarySizes: Story = {
  render: () => ({
    components: { ToggleGroup, ToggleGroupItem },
    setup: () => ({
      groups: SIZES.flatMap((size) =>
        (['outline', 'outline-primary'] as const).map((variant) => ({
          size,
          variant,
        }))
      ),
    }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <ToggleGroup
          v-for="group in groups"
          :key="group.variant + '-' + group.size"
          type="multiple"
          :variant="group.variant"
          :size="group.size"
          :default-value="['bold']"
          :aria-label="group.variant + ' ' + group.size"
        >
          <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
          <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        </ToggleGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const size of SIZES) {
      const outline = canvas.getByRole('group', { name: `outline ${size}` });
      const primary = canvas.getByRole('group', {
        name: `outline-primary ${size}`,
      });
      for (const item of within(primary).getAllByRole('button')) {
        await expect(item).toHaveAttribute('data-size', size);
        await expect(item).toHaveAttribute('data-variant', 'outline-primary');
      }
      const outlineBox = outline.getBoundingClientRect();
      const primaryBox = primary.getBoundingClientRect();
      await expect([primaryBox.width, primaryBox.height]).toEqual([
        outlineBox.width,
        outlineBox.height,
      ]);
    }
  },
};
