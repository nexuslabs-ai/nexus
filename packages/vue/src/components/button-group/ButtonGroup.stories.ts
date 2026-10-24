import type { Meta, StoryObj } from '@storybook/vue3-vite';
import {
  IconBold,
  IconItalic,
  IconLink,
  IconUnderline,
} from '@tabler/icons-vue';
import { expect, within } from 'storybook/test';

import { Button } from '../button';

import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '.';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    docs: {
      description: {
        component:
          'ButtonGroup joins related buttons into one cluster with shared borders. Use it for a set of related actions or a split button. For an input with addons, use InputGroup.',
      },
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// Three outline buttons joined into one horizontal cluster.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Button, ButtonGroup },
    template: `
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <Button variant="outline">Month</Button>
      </ButtonGroup>
    `,
  }),
};

export const Small: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `size="sm"` to shrink every member of the group.',
      },
    },
  },
  render: () => ({
    components: { Button, ButtonGroup, ButtonGroupText },
    template: `
      <ButtonGroup size="sm">
        <ButtonGroupText>View:</ButtonGroupText>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
      </ButtonGroup>
    `,
  }),
};

export const Large: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `size="lg"` to enlarge every member of the group.',
      },
    },
  },
  render: () => ({
    components: { Button, ButtonGroup, ButtonGroupText },
    template: `
      <ButtonGroup size="lg">
        <ButtonGroupText>View:</ButtonGroupText>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
      </ButtonGroup>
    `,
  }),
};

// Vertical orientation stacks the cluster.
export const Vertical: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Stack the buttons with `orientation="vertical"`.',
      },
    },
  },
  render: () => ({
    components: { Button, ButtonGroup },
    template: `
      <ButtonGroup orientation="vertical" size="sm">
        <Button variant="outline">Top</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Bottom</Button>
      </ButtonGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="button-group"]');
    await expect(group).toHaveAttribute('data-orientation', 'vertical');
    await expect(group).toHaveAttribute('data-size', 'sm');

    const canvas = within(canvasElement);
    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toHaveAttribute('data-size', 'sm');
    }
  },
};

// A text addon as a leading prefix.
export const WithText: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Add a text prefix with ButtonGroupText.',
      },
    },
  },
  render: () => ({
    components: { Button, ButtonGroup, ButtonGroupText },
    template: `
      <ButtonGroup>
        <ButtonGroupText>https://</ButtonGroupText>
        <Button variant="outline">nxds.dev</Button>
      </ButtonGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="button-group-text"]')
    ).toBeInTheDocument();
  },
};

// A separator divides sub-groups in a toolbar of borderless (ghost) controls.
export const WithSeparator: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Divide ghost buttons into sub-groups with ButtonGroupSeparator.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      ButtonGroup,
      ButtonGroupSeparator,
      IconBold,
      IconItalic,
      IconLink,
      IconUnderline,
    },
    template: `
      <ButtonGroup>
        <Button variant="ghost" size="icon" aria-label="Bold">
          <IconBold />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Italic">
          <IconItalic />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Underline">
          <IconUnderline />
        </Button>
        <ButtonGroupSeparator />
        <Button variant="ghost" size="icon" aria-label="Add link">
          <IconLink />
        </Button>
      </ButtonGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const separator = canvasElement.querySelector(
      '[data-slot="button-group-separator"]'
    );

    await expect(separator).toBeInTheDocument();
    await expect(separator).toHaveAttribute('data-orientation', 'vertical');
  },
};

// The group is a role=group region that advertises its orientation. The first
// group sets no `orientation` or `size`, a regression guard for the default
// emits. In the second, an explicit `size` beats the group's, and a Button
// nested in a wrapper still inherits it.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { Button, ButtonGroup },
    template: `
      <div class="nx:flex nx:flex-col nx:items-start nx:gap-4">
        <ButtonGroup>
          <Button variant="outline">One</Button>
          <Button variant="outline">Two</Button>
        </ButtonGroup>
        <ButtonGroup size="sm">
          <Button variant="outline" size="lg">Large</Button>
          <span>
            <Button variant="outline">Nested</Button>
          </span>
        </ButtonGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="button-group"]');
    await expect(group).toBeInTheDocument();
    await expect(group).toHaveAttribute('role', 'group');
    await expect(group).toHaveAttribute('data-orientation', 'horizontal');
    await expect(group).toHaveAttribute('data-size', 'default');

    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Large' })).toHaveAttribute(
      'data-size',
      'lg'
    );
    await expect(
      canvas.getByRole('button', { name: 'Nested' })
    ).toHaveAttribute('data-size', 'sm');
  },
};

export const TierAPolishEvidence: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Mix an addon link with loading and disabled buttons in one group, beside a small vertical group.',
      },
    },
  },
  render: () => ({
    components: { Button, ButtonGroup, ButtonGroupText },
    template: `
      <div class="nx:flex nx:flex-col nx:items-start nx:gap-4 nx:bg-background nx:p-10">
        <ButtonGroup aria-label="document actions">
          <ButtonGroupText as-child>
            <a href="https://example.com/docs">Docs</a>
          </ButtonGroupText>
          <Button variant="outline">Open</Button>
          <Button variant="outline" loading>Saving</Button>
          <Button variant="outline" disabled>Disabled</Button>
        </ButtonGroup>

        <ButtonGroup orientation="vertical" size="sm" aria-label="format density">
          <Button variant="outline">Bold</Button>
          <Button variant="outline">Italic</Button>
          <Button variant="outline">Underline</Button>
        </ButtonGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const horizontalGroup = canvas.getByRole('group', {
      name: 'document actions',
    });
    const verticalGroup = canvas.getByRole('group', {
      name: 'format density',
    });
    const link = canvas.getByRole('link', { name: 'Docs' });
    const loadingButton = canvas.getByRole('button', { name: 'Saving' });
    const disabledButton = canvas.getByRole('button', { name: 'Disabled' });

    await expect(horizontalGroup).toHaveAttribute(
      'data-orientation',
      'horizontal'
    );
    await expect(horizontalGroup).toHaveAttribute('data-size', 'default');
    await expect(verticalGroup).toHaveAttribute('data-orientation', 'vertical');
    await expect(verticalGroup).toHaveAttribute('data-size', 'sm');
    for (const button of within(verticalGroup).getAllByRole('button')) {
      await expect(button).toHaveAttribute('data-size', 'sm');
    }

    await expect(link).toHaveClass('nx:transition-control');
    await expect(link).toHaveClass('nx:duration-fast');
    await expect(link).toHaveClass('nx:focus-visible:outline-2');
    await expect(link).toHaveClass('nx:hover:bg-container-hover');
    await expect(link).toHaveClass('nx:active:bg-container-active');

    await expect(loadingButton).toHaveAttribute('data-loading', 'true');
    await expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    await expect(loadingButton).toHaveAttribute('aria-disabled', 'true');

    await expect(disabledButton).toBeDisabled();
    await expect(disabledButton).toHaveAttribute('aria-disabled', 'true');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Both orientations plus a text addon and a separator.
export const AllVariants: Story = {
  render: () => ({
    components: { Button, ButtonGroup, ButtonGroupText },
    template: `
      <div class="nx:flex nx:flex-col nx:items-start nx:gap-4">
        <ButtonGroup>
          <Button variant="outline">Day</Button>
          <Button variant="outline">Week</Button>
          <Button variant="outline">Month</Button>
        </ButtonGroup>
        <ButtonGroup>
          <ButtonGroupText>https://</ButtonGroupText>
          <Button variant="outline">nxds.dev</Button>
          <Button variant="outline">Go</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical" size="sm">
          <Button variant="outline">Top</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Bottom</Button>
        </ButtonGroup>
      </div>
    `,
  }),
};
