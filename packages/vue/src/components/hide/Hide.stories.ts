import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, waitFor, within } from 'storybook/test';

import { Hide } from '.';

const meta = {
  title: 'Primitives/Hide',
  component: Hide,
  parameters: {
    docs: {
      description: {
        component:
          'Hide removes its children from view above or below a viewport or container width. Use it for responsive visibility instead of toggling `nx:hidden` classes. To show content only at a width, use Show.',
      },
    },
    layout: 'padded',
  },
} satisfies Meta<typeof Hide>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// VISUAL
// ============================================

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Hide },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-2">
        <Hide above="lg" as="div">
          <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">
            Hidden when the viewport is <strong>lg</strong> (≥ 64rem) or wider.
          </div>
        </Hide>
        <Hide below="lg" as="div">
          <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">
            Hidden when the viewport is narrower than <strong>lg</strong>.
          </div>
        </Hide>
      </div>
    `,
  }),
};

export const AllAxes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Each of the four props hides its content at a different viewport or container width.',
      },
    },
  },
  render: () => ({
    components: { Hide },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <div>
          <span class="nx:text-muted-foreground nx:mb-1 nx:block">&lt;Hide above="lg"&gt; — hidden viewport ≥ lg</span>
          <Hide above="lg" as="div">
            <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">Hidden on wide viewports.</div>
          </Hide>
        </div>
        <div>
          <span class="nx:text-muted-foreground nx:mb-1 nx:block">&lt;Hide below="lg"&gt; — hidden viewport &lt; lg</span>
          <Hide below="lg" as="div">
            <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">Hidden on narrow viewports.</div>
          </Hide>
        </div>
        <div class="nx:@container nx:rounded-md nx:border-default nx:border-border-default nx:p-2" style="width: 600px">
          <span class="nx:text-muted-foreground nx:mb-1 nx:block">&lt;Hide containerAbove="md"&gt; — hidden in this 600px container</span>
          <Hide containerAbove="md" as="div">
            <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">Hidden because the container is wide.</div>
          </Hide>
        </div>
        <div class="nx:@container nx:rounded-md nx:border-default nx:border-border-default nx:p-2" style="width: 240px">
          <span class="nx:text-muted-foreground nx:mb-1 nx:block">&lt;Hide containerBelow="md"&gt; — hidden in this 240px container</span>
          <Hide containerBelow="md" as="div">
            <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">Hidden because the container is narrow.</div>
          </Hide>
        </div>
      </div>
    `,
  }),
};

// ============================================
// INTERACTION / PLAY TESTS  (inverse of <Show>)
// ============================================

// Confirms the `display: contents` mechanism also holds for <Hide>'s shown
// state: <Hide containerBelow="md"> is shown at ≥ md, so its child is a flex item.
export const FlexParent: Story = {
  render: () => ({
    components: { Hide },
    template: `
      <div class="nx:@container" style="width: 600px" data-testid="container">
        <div class="nx:flex nx:gap-4">
          <div
            data-testid="item-a"
            class="nx:rounded-md nx:border-default nx:border-border-default"
            style="width: 48px; height: 48px"
          />
          <Hide containerBelow="md" data-testid="wrap">
            <div
              data-testid="item-b"
              class="nx:rounded-md nx:border-default nx:border-primary-border"
              style="width: 48px; height: 48px"
            />
          </Hide>
          <div
            data-testid="item-c"
            class="nx:rounded-md nx:border-default nx:border-border-default"
            style="width: 48px; height: 48px"
          />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container');
    const wrap = canvas.getByTestId('wrap');
    const rect = (id: string) => canvas.getByTestId(id).getBoundingClientRect();

    // ≥ md: containerBelow is shown -> `contents`, item-b is a real flex sibling.
    await waitFor(() =>
      expect(getComputedStyle(wrap).display).toBe('contents')
    );
    expect(rect('item-b').top).toBe(rect('item-a').top);
    expect(rect('item-a').left).toBeLessThan(rect('item-b').left);
    expect(rect('item-b').left).toBeLessThan(rect('item-c').left);

    // toggle below md: now hidden.
    container.style.width = '300px';
    await waitFor(() => expect(getComputedStyle(wrap).display).toBe('none'));

    // toggle back ≥ md: flex child again (contents), not block.
    container.style.width = '600px';
    await waitFor(() => {
      expect(getComputedStyle(wrap).display).toBe('contents');
      expect(rect('item-b').top).toBe(rect('item-a').top);
    });
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: { Hide },
    template: `
      <Hide above="lg" data-testid="el">
        <span>content</span>
      </Hide>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('el')).toHaveAttribute('data-slot', 'hide');
  },
};
