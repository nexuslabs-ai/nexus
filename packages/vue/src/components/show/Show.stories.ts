import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, waitFor, within } from 'storybook/test';

import { Show } from '.';

const meta: Meta<typeof Show> = {
  title: 'Primitives/Show',
  component: Show,
  parameters: {
    docs: {
      description: {
        component:
          'Show displays its children only above or below a viewport or container width. Use it for responsive visibility instead of toggling `nx:hidden` classes. To hide content at a width, use Hide.',
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Show>;

// ============================================
// VISUAL
// ============================================

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Show },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-2">
        <Show above="lg" as="div">
          <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">
            Visible when the viewport is <strong>lg</strong> (≥ 64rem) or wider.
          </div>
        </Show>
        <Show below="lg" as="div">
          <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">
            Visible when the viewport is narrower than <strong>lg</strong>.
          </div>
        </Show>
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
          'Each of the four props shows its content at a different viewport or container width.',
      },
    },
  },
  render: () => ({
    components: { Show },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <div>
          <span class="nx:text-muted-foreground nx:mb-1 nx:block">&lt;Show above="lg"&gt; — viewport ≥ lg</span>
          <Show above="lg" as="div">
            <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">Shown on wide viewports.</div>
          </Show>
        </div>
        <div>
          <span class="nx:text-muted-foreground nx:mb-1 nx:block">&lt;Show below="lg"&gt; — viewport &lt; lg</span>
          <Show below="lg" as="div">
            <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">Shown on narrow viewports.</div>
          </Show>
        </div>
        <div class="nx:@container nx:rounded-md nx:border-default nx:border-border-default nx:p-2" style="width: 600px">
          <span class="nx:text-muted-foreground nx:mb-1 nx:block">&lt;Show containerAbove="md"&gt; — this 600px container ≥ md</span>
          <Show containerAbove="md" as="div">
            <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">Shown because the container is wide.</div>
          </Show>
        </div>
        <div class="nx:@container nx:rounded-md nx:border-default nx:border-border-default nx:p-2" style="width: 240px">
          <span class="nx:text-muted-foreground nx:mb-1 nx:block">&lt;Show containerBelow="md"&gt; — this 240px container &lt; md</span>
          <Show containerBelow="md" as="div">
            <div class="nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground">Shown because the container is narrow.</div>
          </Show>
        </div>
      </div>
    `,
  }),
};

// ============================================
// INTERACTION / PLAY TESTS
// ============================================

// A shown wrapper is `display: contents`, never `block`, so its child stays a
// real flex item — verified across a toggle.
export const FlexParent: Story = {
  render: () => ({
    components: { Show },
    template: `
      <div class="nx:@container" style="width: 600px" data-testid="container">
        <div class="nx:flex nx:gap-4">
          <div
            data-testid="item-a"
            class="nx:rounded-md nx:border-default nx:border-border-default"
            style="width: 48px; height: 48px"
          />
          <Show containerAbove="md" data-testid="wrap">
            <div
              data-testid="item-b"
              class="nx:rounded-md nx:border-default nx:border-primary-border"
              style="width: 48px; height: 48px"
            />
          </Show>
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

    // ≥ md: wrapper is `contents`, so item-b is a real flex sibling of a and c.
    await waitFor(() =>
      expect(getComputedStyle(wrap).display).toBe('contents')
    );
    expect(rect('item-b').top).toBe(rect('item-a').top);
    expect(rect('item-a').left).toBeLessThan(rect('item-b').left);
    expect(rect('item-b').left).toBeLessThan(rect('item-c').left);

    // toggle below md: hidden.
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
    components: { Show },
    template: `
      <Show above="lg" data-testid="el">
        <span>content</span>
      </Show>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('el')).toHaveAttribute('data-slot', 'show');
  },
};
