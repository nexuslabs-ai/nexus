import type { Meta, StoryObj } from '@storybook/vue3-vite';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-vue';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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

export const WithIcon: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Alert,
      AlertDescription,
      AlertIcon,
      AlertTitle,
      IconInfoCircle,
    },
    template: `
      <Alert class="nx:max-w-md">
        <AlertIcon><IconInfoCircle /></AlertIcon>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>This is an informational alert with an icon.</AlertDescription>
      </Alert>
    `,
  }),
};

export const BannerPresentation: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Show a full-width banner with square corners and a bottom border.',
      },
    },
  },
  render: () => ({
    components: {
      Alert,
      AlertDescription,
      AlertIcon,
      AlertTitle,
      IconInfoCircle,
    },
    template: `
      <Alert variant="information" presentation="banner" class="nx:max-w-md">
        <AlertIcon><IconInfoCircle /></AlertIcon>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>New workspace invitations are available for review.</AlertDescription>
      </Alert>
    `,
  }),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-variant', 'information');
    await expect(alert).toHaveAttribute('data-presentation', 'banner');
  },
};

export const DismissibleCloseButton: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Remove the alert from state when the reader clicks AlertClose.',
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
      IconInfoCircle,
    },
    setup: () => ({ visible: ref(true) }),
    template: `
      <Alert v-if="visible" variant="information" layout="inline" class="nx:max-w-xl">
        <AlertIcon><IconInfoCircle /></AlertIcon>
        <AlertContent>
          <AlertTitle>Invite ready</AlertTitle>
          <AlertDescription>The workspace invitation can now be sent.</AlertDescription>
        </AlertContent>
        <AlertActions>
          <AlertClose @click="visible = false" />
        </AlertActions>
      </Alert>
      <div v-else data-testid="dismissed-alert" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvasElement.querySelector('[data-slot="alert"]');
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-layout', 'inline');
    await userEvent.click(close);
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-slot="alert"]')
      ).not.toBeInTheDocument();
    });
  },
};

export const ActionsBelowDescription: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Place two Button actions under the message in the stack layout.',
      },
    },
  },
  render: () => ({
    components: {
      Alert,
      AlertActions,
      AlertContent,
      AlertDescription,
      AlertIcon,
      AlertTitle,
      Button,
      IconAlertTriangle,
    },
    template: `
      <Alert variant="warning" class="nx:max-w-md">
        <AlertIcon><IconAlertTriangle /></AlertIcon>
        <AlertContent>
          <AlertTitle>Plan limit reached</AlertTitle>
          <AlertDescription>Upgrade the workspace or remove unused seats before inviting more members.</AlertDescription>
        </AlertContent>
        <AlertActions>
          <Button>Upgrade</Button>
          <Button variant="outline">View usage</Button>
        </AlertActions>
      </Alert>
    `,
  }),
};

export const AllVariants: Story = {
  tags: ['docs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Compare the five status variants side by side.',
      },
    },
  },
  render: () => ({
    components: {
      Alert,
      AlertDescription,
      AlertIcon,
      AlertTitle,
      IconAlertCircle,
      IconAlertTriangle,
      IconCircleCheck,
      IconInfoCircle,
    },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6">
        <div>
          <div class="nx:mb-4 nx:typography-label-default nx:text-foreground">Default</div>
          <Alert class="nx:max-w-md">
            <AlertIcon><IconInfoCircle /></AlertIcon>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>This is a default informational alert.</AlertDescription>
          </Alert>
        </div>
        <div>
          <div class="nx:mb-4 nx:typography-label-default nx:text-foreground">Information</div>
          <Alert variant="information" class="nx:max-w-md">
            <AlertIcon><IconInfoCircle /></AlertIcon>
            <AlertTitle>Information Alert</AlertTitle>
            <AlertDescription>This is an informational alert.</AlertDescription>
          </Alert>
        </div>
        <div>
          <div class="nx:mb-4 nx:typography-label-default nx:text-foreground">Destructive</div>
          <Alert variant="destructive" class="nx:max-w-md">
            <AlertIcon><IconAlertCircle /></AlertIcon>
            <AlertTitle>Destructive Alert</AlertTitle>
            <AlertDescription>This is a destructive/error alert.</AlertDescription>
          </Alert>
        </div>
        <div>
          <div class="nx:mb-4 nx:typography-label-default nx:text-foreground">Success</div>
          <Alert variant="success" class="nx:max-w-md">
            <AlertIcon><IconCircleCheck /></AlertIcon>
            <AlertTitle>Success Alert</AlertTitle>
            <AlertDescription>This is a success alert.</AlertDescription>
          </Alert>
        </div>
        <div>
          <div class="nx:mb-4 nx:typography-label-default nx:text-foreground">Warning</div>
          <Alert variant="warning" class="nx:max-w-md">
            <AlertIcon><IconAlertTriangle /></AlertIcon>
            <AlertTitle>Warning Alert</AlertTitle>
            <AlertDescription>This is a warning alert.</AlertDescription>
          </Alert>
        </div>
      </div>
    `,
  }),
};

export const Default: Story = {};

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
