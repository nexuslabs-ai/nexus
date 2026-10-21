import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-vue';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

import { Button } from '../button';

import {
  Alert,
  AlertActions,
  AlertClose,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '.';

const VARIANTS = [
  'default',
  'destructive',
  'success',
  'information',
  'warning',
] as const;

const meta = {
  title: 'Components/Alert',
  parameters: {
    docs: {
      description: {
        component:
          'Alert shows a status message inside the page. Use it for information, success, warning and error messages. Compose the icon, text, actions and close button as children.',
      },
    },
  },
  component: Alert,
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    presentation: { control: 'select', options: ['card', 'banner'] },
    layout: { control: 'select', options: ['stack', 'inline'] },
  },
  render: (args) => ({
    components: { Alert, AlertDescription, AlertTitle },
    setup: () => ({ args }),
    template: `
      <Alert v-bind="args" class="nx:max-w-lg">
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Your trial ends in three days.</AlertDescription>
      </Alert>
    `,
  }),
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Alert, AlertDescription, AlertTitle },
    template: `
      <Alert class="nx:max-w-lg">
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Your trial ends in three days.</AlertDescription>
      </Alert>
    `,
  }),
};

export const WithIconAndAction: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          '`role="alert"` announces an urgent message as soon as it appears.',
      },
    },
  },
  render: () => ({
    components: {
      Alert,
      AlertActions,
      AlertDescription,
      AlertIcon,
      AlertTitle,
      Button,
      IconAlertCircle,
    },
    template: `
      <Alert variant="destructive" role="alert" class="nx:max-w-lg">
        <AlertIcon><IconAlertCircle /></AlertIcon>
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Your card was declined. Update it to keep your plan.</AlertDescription>
        <AlertActions>
          <Button size="sm" variant="outline">Update card</Button>
        </AlertActions>
      </Alert>
    `,
  }),
};

export const InlineDismiss: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          '`layout="inline"` puts the actions beside the text. `AlertClose` fires `click`; remove the alert there.',
      },
    },
  },
  render: () => ({
    components: {
      Alert,
      AlertActions,
      AlertClose,
      AlertContent,
      AlertDescription,
      AlertIcon,
      AlertTitle,
      IconCircleCheck,
    },
    setup: () => ({ open: ref(true) }),
    template: `
      <Alert v-if="open" variant="success" layout="inline" class="nx:max-w-lg">
        <AlertIcon><IconCircleCheck /></AlertIcon>
        <AlertContent>
          <AlertTitle>Deployed</AlertTitle>
          <AlertDescription>Version 2.4 is live.</AlertDescription>
        </AlertContent>
        <AlertActions>
          <AlertClose @click="open = false" />
        </AlertActions>
      </Alert>
    `,
  }),
};

export const Banner: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          '`presentation="banner"` makes an edge-to-edge strip with a bottom border.',
      },
    },
  },
  render: () => ({
    components: { Alert, AlertDescription, AlertTitle },
    template: `
      <Alert variant="information" presentation="banner">
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>Sunday, 02:00 to 04:00 UTC.</AlertDescription>
      </Alert>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: {
      Alert,
      AlertDescription,
      AlertIcon,
      AlertTitle,
      IconAlertCircle,
    },
    setup: () => ({ variants: VARIANTS }),
    template: `
      <div class="nx:flex nx:w-full nx:max-w-lg nx:flex-col nx:gap-3">
        <Alert v-for="variant in variants" :key="variant" :variant="variant">
          <AlertIcon><IconAlertCircle /></AlertIcon>
          <AlertTitle>{{ variant }}</AlertTitle>
          <AlertDescription>Something you should know about.</AlertDescription>
        </Alert>
      </div>
    `,
  }),
};

export const BannerAttributes: Story = {
  args: { presentation: 'banner' },
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toHaveAttribute('data-presentation', 'banner');
    await expect(alert).toHaveClass('nx:rounded-none', 'nx:border-b-default');
  },
};

export const WithActions: Story = {
  render: () => ({
    components: {
      Alert,
      AlertActions,
      AlertDescription,
      AlertIcon,
      AlertTitle,
      Button,
      IconAlertCircle,
    },
    template: `
      <Alert variant="destructive" role="alert" class="nx:max-w-lg">
        <AlertIcon><IconAlertCircle /></AlertIcon>
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Your card was declined.</AlertDescription>
        <AlertActions>
          <Button size="sm" variant="outline">Update card</Button>
        </AlertActions>
      </Alert>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');
    const icon = alert.querySelector('[data-slot="alert-icon"]');

    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(
      canvas.getByRole('button', { name: 'Update card' })
    ).toBeVisible();
  },
};

export const DismissInteraction: Story = {
  render: () => ({
    components: {
      Alert,
      AlertActions,
      AlertClose,
      AlertContent,
      AlertDescription,
      AlertIcon,
      AlertTitle,
      IconCircleCheck,
    },
    setup: () => ({ open: ref(true) }),
    template: `
      <Alert v-if="open" variant="success" layout="inline" class="nx:max-w-lg">
        <AlertIcon><IconCircleCheck /></AlertIcon>
        <AlertContent>
          <AlertTitle>Deployed</AlertTitle>
          <AlertDescription>Version 2.4 is live.</AlertDescription>
        </AlertContent>
        <AlertActions>
          <AlertClose @click="open = false" />
        </AlertActions>
      </Alert>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await expect(close).toHaveAttribute('type', 'button');
    await userEvent.click(close);
    await expect(canvas.queryByText('Version 2.4 is live.')).toBeNull();
  },
};

export const KeyboardInteraction: Story = {
  render: () => ({
    components: { Alert, AlertActions, AlertClose, AlertContent, AlertTitle },
    setup: () => ({ open: ref(true) }),
    template: `
      <Alert v-if="open" layout="inline" class="nx:max-w-lg">
        <AlertContent><AlertTitle>Saved</AlertTitle></AlertContent>
        <AlertActions><AlertClose @click="open = false" /></AlertActions>
      </Alert>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await userEvent.tab();
    await expect(close).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.queryByText('Saved')).toBeNull();
  },
};

export const TitleAsHeading: Story = {
  render: () => ({
    components: { Alert, AlertDescription, AlertTitle },
    template: `
      <Alert class="nx:max-w-lg">
        <AlertTitle as-child><h2>Maintenance window</h2></AlertTitle>
        <AlertDescription>Sunday, 02:00 to 04:00 UTC.</AlertDescription>
      </Alert>
    `,
  }),
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', {
      level: 2,
      name: 'Maintenance window',
    });

    await expect(heading).toHaveAttribute('data-slot', 'alert-title');
  },
};

export const WithDataAttributes: Story = {
  args: { variant: 'information', layout: 'inline' },
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toHaveAttribute('data-variant', 'information');
    await expect(alert).toHaveAttribute('data-presentation', 'card');
    await expect(alert).toHaveAttribute('data-layout', 'inline');
  },
};
