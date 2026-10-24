import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/button';

import {
  Alert,
  AlertActions,
  AlertClose,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from './alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Alert shows a status message inside the page. Use it for information, success, warning and error messages. Compose the icon, text, actions and close button as children.

- Stack layout: use no actions, or one or two Button actions. Leave out AlertClose.
- Inline layout: use AlertClose alone, one or two Button actions, or Buttons plus AlertClose.
- AlertClose doesn't remove the alert. Remove it in your own \`onClick\` handler.
        `,
      },
    },
  },
  args: {
    layout: 'stack',
    presentation: 'card',
    variant: 'default',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'information', 'destructive', 'success', 'warning'],
      description: 'Status color.',
      table: {
        category: 'Controls',
      },
    },
    presentation: {
      control: 'select',
      options: ['card', 'banner'],
      description: 'Rounded card, or edge-to-edge banner.',
      table: {
        category: 'Controls',
      },
    },
    layout: {
      control: 'select',
      options: ['stack', 'inline'],
      description: 'Actions under the text, or inline at the end.',
      table: {
        category: 'Controls',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

const dataAttribute = (name: string) => `data-${name}`;
const DATA_DENSITY_ATTRIBUTE = dataAttribute('density');

function DismissibleCloseButtonExample(
  props: React.ComponentProps<typeof Alert>
) {
  const [visible, setVisible] = React.useState(true);

  if (!visible) return <div data-testid="dismissed-alert" />;

  return (
    <Alert {...props} className="nx:max-w-xl">
      <AlertIcon>
        <IconInfoCircle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Invite ready</AlertTitle>
        <AlertDescription>
          The workspace invitation can now be sent.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <AlertClose onClick={() => setVisible(false)} />
      </AlertActions>
    </Alert>
  );
}

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the CLI.
      </AlertDescription>
    </Alert>
  ),
};

// ============================================
// WITH ICON STORIES
// ============================================

export const WithIcon: Story = {
  tags: ['docs'],
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconInfoCircle />
      </AlertIcon>
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is an informational alert with an icon.
      </AlertDescription>
    </Alert>
  ),
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
  args: {
    presentation: 'banner',
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconInfoCircle />
      </AlertIcon>
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        New workspace invitations are available for review.
      </AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-variant', 'information');
    await expect(alert).toHaveAttribute('data-presentation', 'banner');
  },
};

export const DestructiveWithIcon: Story = {
  args: {
    variant: 'destructive',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconAlertCircle />
      </AlertIcon>
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Something went wrong. Please try again later.
      </AlertDescription>
    </Alert>
  ),
};

export const InformationWithIcon: Story = {
  args: {
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconInfoCircle />
      </AlertIcon>
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        New workspace invitations are available for review.
      </AlertDescription>
    </Alert>
  ),
};

export const SuccessWithIcon: Story = {
  args: {
    variant: 'success',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconCircleCheck />
      </AlertIcon>
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your payment was processed successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const WarningWithIcon: Story = {
  args: {
    variant: 'warning',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconAlertTriangle />
      </AlertIcon>
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Your storage is almost full. Consider upgrading your plan.
      </AlertDescription>
    </Alert>
  ),
};

// ============================================
// CONTENT VARIATIONS
// ============================================

export const WithTitle: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle>This is just a title</AlertTitle>
    </Alert>
  ),
};

export const TitleAsHeading: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle asChild>
        <h2>Semantic heading</h2>
      </AlertTitle>
      <AlertDescription>
        Use this pattern when the alert title belongs in the page outline.
      </AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {
      name: 'Semantic heading',
    });

    await expect(heading).toBeInTheDocument();
    await expect(heading).toHaveAttribute('data-slot', 'alert-title');
  },
};

export const WithDescription: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertDescription>
        This alert has only a description without a title.
      </AlertDescription>
    </Alert>
  ),
};

export const LongContent: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle>Important Information</AlertTitle>
      <AlertDescription>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p className="nx:mt-2">
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat.
        </p>
      </AlertDescription>
    </Alert>
  ),
};

// ============================================
// ACTION PATTERNS
// ============================================

export const DismissibleCloseButton: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Remove the alert from state when the reader clicks AlertClose.',
      },
    },
  },
  args: {
    layout: 'inline',
    variant: 'information',
  },
  render: (args) => <DismissibleCloseButtonExample {...args} />,
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

export const InlineAction: Story = {
  args: {
    layout: 'inline',
    variant: 'warning',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-xl">
      <AlertIcon>
        <IconAlertTriangle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>Uploads may fail soon.</AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">Manage</Button>
      </AlertActions>
    </Alert>
  ),
};

export const DescriptionLinkAction: Story = {
  args: {
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconInfoCircle />
      </AlertIcon>
      <AlertTitle>Sync is paused</AlertTitle>
      <AlertDescription>
        Reconnect the integration from{' '}
        <a
          className="nx:font-medium nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline"
          href="/settings"
        >
          workspace settings
        </a>
        .
      </AlertDescription>
    </Alert>
  ),
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
  args: {
    variant: 'warning',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconAlertTriangle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Plan limit reached</AlertTitle>
        <AlertDescription>
          Upgrade the workspace or remove unused seats before inviting more
          members.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button>Upgrade</Button>
        <Button variant="outline">View usage</Button>
      </AlertActions>
    </Alert>
  ),
};

export const InlineActionsWithClose: Story = {
  args: {
    layout: 'inline',
    variant: 'success',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-2xl">
      <AlertIcon>
        <IconCircleCheck />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Deployment complete</AlertTitle>
        <AlertDescription>
          Version 2.4.0 is live in the production environment.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">View release</Button>
        <AlertClose />
      </AlertActions>
    </Alert>
  ),
};

export const DisabledClose: Story = {
  args: {
    layout: 'inline',
    variant: 'success',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-2xl">
      <AlertIcon>
        <IconCircleCheck />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Deployment complete</AlertTitle>
        <AlertDescription>
          Version 2.4.0 is live in the production environment.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">View release</Button>
        <AlertClose disabled />
      </AlertActions>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await expect(close).toBeDisabled();

    // Disabled close uses a semantic text token at full opacity (not a fade).
    await expect(close).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(close).opacity).toBe('1');
  },
};

export const HelperBanner: Story = {
  args: {
    layout: 'inline',
    presentation: 'banner',
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-3xl">
      <AlertIcon>
        <IconInfoCircle />
      </AlertIcon>
      <AlertContent>
        <AlertDescription>
          Scheduled maintenance begins at 9 PM.{' '}
          <a
            className="nx:font-medium nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline"
            href="/status"
          >
            View status
          </a>
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <AlertClose />
      </AlertActions>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-layout', 'inline');
  },
};

export const TextCloseLabel: Story = {
  args: {
    layout: 'inline',
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-xl">
      <AlertIcon>
        <IconInfoCircle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Text close control</AlertTitle>
        <AlertDescription>
          Text children self-label, so the button keeps its visible name.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <AlertClose className="nx:size-auto nx:px-2 nx:typography-label-small">
          Close
        </AlertClose>
      </AlertActions>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Close' });

    await expect(close).toBeInTheDocument();
    await expect(close).not.toHaveAttribute('aria-label');
  },
};

// ============================================
// DATA ATTRIBUTES TESTS
// ============================================

export const WithDataAttributes: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <Alert variant="destructive" className="nx:max-w-md">
        <AlertTitle>Test Alert</AlertTitle>
        <AlertDescription>Testing data attributes.</AlertDescription>
      </Alert>
      <Alert variant="warning" layout="inline" className="nx:max-w-xl">
        <AlertIcon>
          <IconAlertTriangle />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Storage almost full</AlertTitle>
          <AlertDescription>Uploads may fail soon.</AlertDescription>
        </AlertContent>
        <AlertActions>
          <Button variant="outline">Manage</Button>
          <AlertClose />
        </AlertActions>
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [alert, inlineAlert] = canvasElement.querySelectorAll(
      '[data-slot="alert"]'
    );
    const title = canvasElement.querySelector('[data-slot="alert-title"]');
    const description = canvasElement.querySelector(
      '[data-slot="alert-description"]'
    );
    const content = canvasElement.querySelector('[data-slot="alert-content"]');
    const actions = canvasElement.querySelector('[data-slot="alert-actions"]');
    const close = canvasElement.querySelector('[data-slot="alert-close"]');

    await expect(alert).toHaveAttribute('data-variant', 'destructive');
    await expect(alert).toHaveAttribute('data-presentation', 'card');
    await expect(alert).toHaveAttribute('data-layout', 'stack');
    await expect(alert).not.toHaveAttribute(DATA_DENSITY_ATTRIBUTE);
    await expect(alert).not.toHaveAttribute('role');
    await expect(title).toBeInTheDocument();
    await expect(description).toBeInTheDocument();
    await expect(inlineAlert).toHaveAttribute('data-layout', 'inline');
    await expect(content).toBeInTheDocument();
    await expect(actions).toBeInTheDocument();
    await expect(close).toHaveAttribute('type', 'button');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

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
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Default
        </div>
        <Alert className="nx:max-w-md">
          <AlertIcon>
            <IconInfoCircle />
          </AlertIcon>
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>
            This is a default informational alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Information
        </div>
        <Alert variant="information" className="nx:max-w-md">
          <AlertIcon>
            <IconInfoCircle />
          </AlertIcon>
          <AlertTitle>Information Alert</AlertTitle>
          <AlertDescription>This is an informational alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Destructive
        </div>
        <Alert variant="destructive" className="nx:max-w-md">
          <AlertIcon>
            <IconAlertCircle />
          </AlertIcon>
          <AlertTitle>Destructive Alert</AlertTitle>
          <AlertDescription>
            This is a destructive/error alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Success
        </div>
        <Alert variant="success" className="nx:max-w-md">
          <AlertIcon>
            <IconCircleCheck />
          </AlertIcon>
          <AlertTitle>Success Alert</AlertTitle>
          <AlertDescription>This is a success alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Warning
        </div>
        <Alert variant="warning" className="nx:max-w-md">
          <AlertIcon>
            <IconAlertTriangle />
          </AlertIcon>
          <AlertTitle>Warning Alert</AlertTitle>
          <AlertDescription>This is a warning alert.</AlertDescription>
        </Alert>
      </div>
    </div>
  ),
};

export const AllBannerVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Default Banner
        </div>
        <Alert presentation="banner" className="nx:max-w-md">
          <AlertIcon>
            <IconInfoCircle />
          </AlertIcon>
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>
            This is a default informational alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Information Banner
        </div>
        <Alert
          presentation="banner"
          variant="information"
          className="nx:max-w-md"
        >
          <AlertIcon>
            <IconInfoCircle />
          </AlertIcon>
          <AlertTitle>Information Alert</AlertTitle>
          <AlertDescription>This is an informational alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Destructive Banner
        </div>
        <Alert
          presentation="banner"
          variant="destructive"
          className="nx:max-w-md"
        >
          <AlertIcon>
            <IconAlertCircle />
          </AlertIcon>
          <AlertTitle>Destructive Alert</AlertTitle>
          <AlertDescription>
            This is a destructive/error alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Success Banner
        </div>
        <Alert presentation="banner" variant="success" className="nx:max-w-md">
          <AlertIcon>
            <IconCircleCheck />
          </AlertIcon>
          <AlertTitle>Success Alert</AlertTitle>
          <AlertDescription>This is a success alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Warning Banner
        </div>
        <Alert presentation="banner" variant="warning" className="nx:max-w-md">
          <AlertIcon>
            <IconAlertTriangle />
          </AlertIcon>
          <AlertTitle>Warning Alert</AlertTitle>
          <AlertDescription>This is a warning alert.</AlertDescription>
        </Alert>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Compare every status color in card and banner presentation.',
      },
    },
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================

function KeyboardDismissExample() {
  const [open, setOpen] = React.useState(true);

  if (!open) return null;

  return (
    <Alert layout="inline" className="nx:max-w-lg">
      <AlertContent>
        <AlertTitle>Saved</AlertTitle>
      </AlertContent>
      <AlertActions>
        <AlertClose onClick={() => setOpen(false)} />
      </AlertActions>
    </Alert>
  );
}

export const KeyboardInteraction: Story = {
  render: () => <KeyboardDismissExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await userEvent.tab();
    await expect(close).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.queryByText('Saved')).toBeNull();
  },
};
