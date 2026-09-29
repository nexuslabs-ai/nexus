import * as React from 'react';

import {
  Canvas,
  Controls,
  Description,
  Title,
} from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectHeightPinned } from '../../stories/support/story-height-test-utils';
import { Button } from '../button';

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
      page: () => (
        <>
          <Title />
          <Description />
          <h2 id="playground">Playground</h2>
          <p>
            Explore the composition here. These controls change this example
            only; icon, text and action controls assemble children rather than
            adding Alert props.
          </p>
          <Canvas of={Playground} />
          <Controls of={Playground} />
          <h2 id="layouts">Layouts</h2>
          <p>
            Stack places actions below the message. Inline places them beside it
            when space permits and below it in narrow containers. The title and
            description stay together.
          </p>
          <h3 id="stack-layout">Stack layout</h3>
          <Canvas of={Default} />
          <h3 id="inline-layout">Inline layout</h3>
          <Canvas of={InlineContent} />
          <h2 id="status-colours">Status colours</h2>
          <p>
            Choose the message meaning independently of layout. Colour does not
            add an announcement role.
          </p>
          <Canvas of={AllVariants} />
          <h2 id="content">Content</h2>
          <h3 id="title-only">Title only</h3>
          <Canvas of={WithTitle} />
          <h3 id="description-only">Description only</h3>
          <Canvas of={WithDescription} />
          <h3 id="semantic-heading">Semantic heading</h3>
          <Canvas of={TitleAsHeading} />
          <h3 id="long-message">Long message</h3>
          <Canvas of={LongContent} />
          <h3 id="link-in-the-message">Link in the message</h3>
          <Canvas of={DescriptionLinkAction} />
          <h2 id="actions">Actions</h2>
          <p>
            Nexus renders the controls. Your application owns their effects,
            alert visibility and focus after dismissal. Action buttons below are
            composition examples unless explicitly demonstrated as dismissible.
          </p>
          <h3 id="actions-below-the-message">Actions below the message</h3>
          <Canvas of={ActionsBelowDescription} />
          <h3 id="inline-action-and-close">Inline action and close</h3>
          <Canvas of={InlineActionsWithClose} />
          <h3 id="dismiss-with-an-icon">Dismiss with an icon</h3>
          <Canvas of={DismissibleCloseButton} />
          <h3 id="dismiss-with-text">Dismiss with text</h3>
          <Canvas of={TextDismissAction} />
          <h3 id="custom-close-icon">Custom close icon</h3>
          <Canvas of={CustomCloseIconLabel} />
          <p>
            Give custom icon-only controls an accessible name. Text children can
            supply their own name.
          </p>
          <h3 id="text-close-label">Text close label</h3>
          <Canvas of={TextCloseLabel} />
          <h2 id="banners">Banners</h2>
          <p>
            The banner treatment has square corners and a bottom border. Its
            parent determines placement; it is not automatically sticky or
            page-wide.
          </p>
          <h3 id="banner-with-actions">Banner with actions</h3>
          <Canvas of={BannerInlineActions} />
          <h3 id="short-helper-message">Short helper message</h3>
          <Canvas of={HelperBanner} />
          <h3 id="banner-colours">Banner colours</h3>
          <Canvas of={AllBannerVariants} />
        </>
      ),
      description: {
        component: `
Use Alert for an informational message, warning, error or success confirmation. Compose its icon, title, description and optional actions as children.

Nexus owns presentation and layout. Your application owns visibility, action handlers, focus after dismissal and announcement timing. Alerts are passive by default; supply a role when an announcement is needed.
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
      description: 'The visual style variant',
      table: {
        category: 'Controls',
      },
    },
    presentation: {
      control: 'select',
      options: ['card', 'banner'],
      description: 'The alert presentation style',
      table: {
        category: 'Controls',
      },
    },
    layout: {
      control: 'select',
      options: ['stack', 'inline'],
      description:
        'Action placement: stack below the message; inline beside it when space permits. Title and description remain grouped. Narrow inline alerts move actions below.',
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

type PlaygroundIcon =
  | 'none'
  | 'information'
  | 'warning'
  | 'success'
  | 'destructive';
type PlaygroundActions =
  | 'none'
  | 'close'
  | 'primary'
  | 'primary + close'
  | 'primary + secondary'
  | 'primary + secondary + close';
type PlaygroundStackActions = Extract<
  PlaygroundActions,
  'none' | 'primary' | 'primary + secondary'
>;
type PlaygroundButtonVariant = NonNullable<
  React.ComponentProps<typeof Button>['variant']
>;
type PlaygroundArgs = React.ComponentProps<typeof Alert> & {
  icon: PlaygroundIcon;
  actionsInline?: PlaygroundActions;
  actionsStack?: PlaygroundStackActions;
  title: string;
  description: string;
  primaryActionLabel: string;
  primaryActionVariant: PlaygroundButtonVariant;
  secondaryActionLabel: string;
  secondaryActionVariant: PlaygroundButtonVariant;
};
type PlaygroundStory = StoryObj<PlaygroundArgs>;

function renderPlaygroundIcon(icon: PlaygroundIcon) {
  if (icon === 'none') return null;
  if (icon === 'destructive') {
    return (
      <AlertIcon>
        <IconAlertCircle />
      </AlertIcon>
    );
  }
  if (icon === 'success') {
    return (
      <AlertIcon>
        <IconCircleCheck />
      </AlertIcon>
    );
  }
  if (icon === 'warning') {
    return (
      <AlertIcon>
        <IconAlertTriangle />
      </AlertIcon>
    );
  }

  return (
    <AlertIcon>
      <IconInfoCircle />
    </AlertIcon>
  );
}

function AlertPlaygroundExample({
  actionsInline = 'none',
  actionsStack = 'none',
  description,
  icon,
  layout,
  presentation,
  primaryActionLabel,
  primaryActionVariant,
  secondaryActionLabel,
  secondaryActionVariant,
  title,
  variant,
}: PlaygroundArgs) {
  const [visible, setVisible] = React.useState(true);
  const actions = layout === 'inline' ? actionsInline : actionsStack;
  const hasPrimaryAction = actions.includes('primary');
  const hasSecondaryAction = actions.includes('secondary');
  const hasCloseAction = actions.includes('close');
  const hasActions = actions !== 'none';

  if (!visible) {
    return (
      <Button variant="outline" onClick={() => setVisible(true)}>
        Reset alert
      </Button>
    );
  }

  return (
    <Alert
      layout={layout}
      presentation={presentation}
      variant={variant}
      className="nx:max-w-2xl"
    >
      {renderPlaygroundIcon(icon)}
      <AlertContent>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </AlertContent>
      {hasActions ? (
        <AlertActions>
          {hasPrimaryAction ? (
            <Button variant={primaryActionVariant}>{primaryActionLabel}</Button>
          ) : null}
          {hasSecondaryAction ? (
            <Button variant={secondaryActionVariant}>
              {secondaryActionLabel}
            </Button>
          ) : null}
          {hasCloseAction ? (
            <AlertClose onClick={() => setVisible(false)} />
          ) : null}
        </AlertActions>
      ) : null}
    </Alert>
  );
}

function DismissibleCloseButtonExample(
  props: React.ComponentProps<typeof Alert>
) {
  const [visible, setVisible] = React.useState(true);

  const continueButton = React.useRef<HTMLButtonElement>(null);

  function dismiss() {
    setVisible(false);
    continueButton.current?.focus();
  }

  return (
    <div className="nx:flex nx:w-full nx:max-w-xl nx:flex-col nx:items-start nx:gap-4">
      {visible && (
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
            <AlertClose onClick={dismiss} />
          </AlertActions>
        </Alert>
      )}
      <Button
        ref={continueButton}
        type="button"
        variant="outline"
        onClick={() => setVisible(true)}
      >
        Review invitation
      </Button>
    </div>
  );
}

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-2xl">
      <AlertContent>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the CLI.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">View details</Button>
      </AlertActions>
    </Alert>
  ),
  play: async ({ canvasElement, args }) => {
    const title = canvasElement.querySelector<HTMLElement>(
      '[data-slot="alert-title"]'
    )!;
    const description = canvasElement.querySelector<HTMLElement>(
      '[data-slot="alert-description"]'
    )!;
    await expect(
      description.getBoundingClientRect().top
    ).toBeGreaterThanOrEqual(title.getBoundingClientRect().bottom);
    const content = canvasElement.querySelector<HTMLElement>(
      '[data-slot="alert-content"]'
    )!;
    const actions = canvasElement.querySelector<HTMLElement>(
      '[data-slot="alert-actions"]'
    )!;
    if (args.layout === 'stack') {
      await expect(actions.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        content.getBoundingClientRect().bottom
      );
    } else if (getComputedStyle(actions).gridRowStart === 'auto') {
      await expect(actions.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        content.getBoundingClientRect().right
      );
    }
    await expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth);
    await expect(description.scrollWidth).toBeLessThanOrEqual(
      description.clientWidth
    );
  },
};

export const InlineContent: Story = {
  name: 'Inline Layout',
  ...Default,
  args: { layout: 'inline' },
};

export const Playground: PlaygroundStory = {
  args: {
    actionsInline: 'primary + close',
    actionsStack: 'primary',
    icon: 'information',
    layout: 'inline',
    presentation: 'card',
    primaryActionLabel: 'Manage',
    primaryActionVariant: 'outline',
    secondaryActionLabel: 'View details',
    secondaryActionVariant: 'ghost',
    title: 'Storage almost full',
    description: 'Uploads may fail soon.',
    variant: 'information',
  },
  argTypes: {
    actionsInline: {
      name: 'actions (inline story only)',
      control: 'select',
      options: [
        'none',
        'close',
        'primary',
        'primary + close',
        'primary + secondary',
        'primary + secondary + close',
      ],
      description:
        'Story-only inline action pattern. Inline permits close-only, one action, two actions, and close combinations.',
      table: {
        category: 'Controls',
      },
      if: {
        arg: 'layout',
        eq: 'inline',
      },
    },
    actionsStack: {
      name: 'actions (stack story only)',
      control: 'select',
      options: ['none', 'primary', 'primary + secondary'],
      description:
        'Story-only stack action pattern. AlertClose is intentionally omitted because the close icon should not sit below the message.',
      table: {
        category: 'Controls',
      },
      if: {
        arg: 'layout',
        eq: 'stack',
      },
    },
    icon: {
      name: 'icon (story only)',
      control: 'select',
      options: ['none', 'information', 'warning', 'success', 'destructive'],
      description:
        'Story-only control that renders an icon child before AlertContent.',
      table: {
        category: 'Controls',
      },
    },
    title: {
      control: 'text',
      description: 'Story-only alert title text.',
      table: {
        category: 'Controls',
      },
    },
    description: {
      control: 'text',
      description: 'Story-only alert description text.',
      table: {
        category: 'Controls',
      },
    },
    primaryActionLabel: {
      name: 'primary label (story only)',
      control: 'text',
      description: 'Story-only primary Button children.',
      table: {
        category: 'Controls',
      },
    },
    primaryActionVariant: {
      name: 'primary variant (story only)',
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost'],
      description: 'Story-only primary Button variant.',
      table: {
        category: 'Controls',
      },
    },
    secondaryActionLabel: {
      name: 'secondary label (story only)',
      control: 'text',
      description: 'Story-only secondary Button children.',
      table: {
        category: 'Controls',
      },
    },
    secondaryActionVariant: {
      name: 'secondary variant (story only)',
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost'],
      description: 'Story-only secondary Button variant.',
      table: {
        category: 'Controls',
      },
    },
  },
  parameters: {
    controls: {
      sort: 'alpha',
    },
    docs: {
      description: {
        story:
          'Story-only controls render the recommended slot composition. They are not Alert props; production usage still composes icons, Button, AlertActions, and AlertClose as children. The visible action control changes by layout so stack omits AlertClose patterns while inline keeps them available.',
      },
      source: {
        code: `<Alert variant="information" layout="inline">
  <AlertIcon>
    <IconInfoCircle />
  </AlertIcon>
  <AlertContent>
    <AlertTitle>Storage almost full</AlertTitle>
    <AlertDescription>Uploads may fail soon.</AlertDescription>
  </AlertContent>
  <AlertActions>
    <Button variant="outline">Manage</Button>
    <AlertClose onClick={() => setVisible(false)} />
  </AlertActions>
</Alert>`,
      },
    },
  },
  render: (args) => (
    <AlertPlaygroundExample key={JSON.stringify(args)} {...args} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvasElement.querySelector('[data-slot="alert"]');
    const content = canvasElement.querySelector('[data-slot="alert-content"]');
    const actions = canvasElement.querySelector('[data-slot="alert-actions"]');
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });
    const primaryAction = canvas.getByRole('button', { name: 'Manage' });

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-layout', 'inline');
    await expect(content).toBeInTheDocument();
    await expect(actions).toBeInTheDocument();
    await expect(close).toBeInTheDocument();
    await expect(primaryAction).toBeInTheDocument();
  },
};

export const ClearedActionControls: PlaygroundStory = {
  ...Playground,
  tags: ['!autodocs', '!dev'],
  args: {
    ...Playground.args,
    actionsInline: undefined,
    actionsStack: undefined,
  },
  render: (args) => (
    <div className="nx:flex nx:w-full nx:flex-col nx:gap-4">
      <AlertPlaygroundExample {...args} layout="inline" />
      <AlertPlaygroundExample {...args} layout="stack" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('Storage almost full')).toHaveLength(2);
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
    await expect(
      canvasElement.querySelectorAll('[data-slot="alert-actions"]')
    ).toHaveLength(0);
  },
};

export const Destructive: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'destructive',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertContent>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const Information: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertContent>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          New workspace invitations are available for review.
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const Success: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'success',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertContent>
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          Your changes have been saved successfully.
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const Warning: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'warning',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertContent>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Your account is about to expire. Please renew your subscription.
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const BannerPresentation: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    presentation: 'banner',
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconInfoCircle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          New workspace invitations are available for review.
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-variant', 'information');
    await expect(alert).toHaveAttribute('data-presentation', 'banner');
  },
};

// ============================================
// WITH ICON STORIES
// ============================================

export const WithIcon: Story = {
  tags: ['!autodocs', '!dev'],
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconInfoCircle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          This is an informational alert with an icon.
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const DestructiveWithIcon: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'destructive',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconAlertCircle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong. Please try again later.
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const InformationWithIcon: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'information',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconInfoCircle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          New workspace invitations are available for review.
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const SuccessWithIcon: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'success',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconCircleCheck />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          Your payment was processed successfully.
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const WarningWithIcon: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'warning',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconAlertTriangle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Your storage is almost full. Consider upgrading your plan.
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

// ============================================
// CONTENT VARIATIONS
// ============================================

export const WithTitle: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertContent>
        <AlertTitle>This is just a title</AlertTitle>
      </AlertContent>
    </Alert>
  ),
};

export const TitleAsHeading: Story = {
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertContent>
        <AlertTitle asChild>
          <h2 id="semantic-heading">Semantic heading</h2>
        </AlertTitle>
        <AlertDescription>
          Use this pattern when the alert title belongs in the page outline.
        </AlertDescription>
      </AlertContent>
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
      <AlertContent>
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription>
          <p>
            Your workspace is approaching its storage limit. Existing files
            remain available, but new uploads will pause when the limit is
            reached.
          </p>
          <p className="nx:mt-2">
            Remove files you no longer need or ask a workspace administrator to
            increase your storage before starting another upload.
          </p>
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

// ============================================
// ACTION PATTERNS
// ============================================

export const DismissibleCloseButton: Story = {
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
    const title = canvas.getByText('Invite ready');
    await expect(title.getBoundingClientRect().height).toBeLessThanOrEqual(
      parseFloat(getComputedStyle(title).lineHeight) * 2
    );
    await userEvent.tab();
    await expect(close).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('button', { name: 'Review invitation' })
    ).toHaveFocus();
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-slot="alert"]')
      ).not.toBeInTheDocument();
    });
  },
};

function TextDismissExample(props: React.ComponentProps<typeof Alert>) {
  const [visible, setVisible] = React.useState(true);
  const reviewButton = React.useRef<HTMLButtonElement>(null);
  function dismiss() {
    setVisible(false);
    reviewButton.current?.focus();
  }
  return (
    <div className="nx:flex nx:w-full nx:max-w-xl nx:flex-col nx:items-start nx:gap-4">
      {visible && (
        <Alert {...props}>
          <AlertIcon>
            <IconInfoCircle />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>Import completed</AlertTitle>
            <AlertDescription>
              Review the imported contacts before publishing them.
            </AlertDescription>
          </AlertContent>
          <AlertActions>
            <Button type="button" variant="ghost" onClick={dismiss}>
              Dismiss
            </Button>
          </AlertActions>
        </Alert>
      )}
      <Button
        ref={reviewButton}
        type="button"
        variant="outline"
        onClick={() => setVisible(true)}
      >
        Review imported contacts
      </Button>
    </div>
  );
}

export const TextDismissAction: Story = {
  args: { layout: 'inline', variant: 'information' },
  render: (args) => <TextDismissExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Dismiss' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.queryByText('Import completed')
    ).not.toBeInTheDocument();
    const review = canvas.getByRole('button', {
      name: 'Review imported contacts',
    });
    await expect(review).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Import completed')).toBeInTheDocument();
  },
};

export const CriticalNoClose: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'destructive',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconAlertCircle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>
          Update the billing method before the workspace is paused.
        </AlertDescription>
      </AlertContent>
    </Alert>
  ),
};

export const InlineAction: Story = {
  tags: ['!autodocs', '!dev'],
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
      <AlertContent>
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
      </AlertContent>
    </Alert>
  ),
};

export const ActionsBelowDescription: Story = {
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
    <div data-testid="reflow-host" style={{ width: 672, maxWidth: '100%' }}>
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
    </div>
  ),
  play: async ({ canvasElement }) => {
    const host = within(canvasElement).getByTestId('reflow-host');
    const root = host.querySelector<HTMLElement>('[data-slot="alert"]')!;
    const content = host.querySelector<HTMLElement>(
      '[data-slot="alert-content"]'
    )!;
    const actions = host.querySelector<HTMLElement>(
      '[data-slot="alert-actions"]'
    )!;
    const close = host.querySelector<HTMLElement>('[data-slot="alert-close"]')!;
    const button = within(actions).getByRole('button', {
      name: 'View release',
    });
    const icon = host.querySelector<HTMLElement>('[data-slot="alert-icon"]')!;
    const title = host.querySelector<HTMLElement>('[data-slot="alert-title"]')!;
    function expectIconAtTitle() {
      const iconRect = icon.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      expect(iconRect.top).toBeGreaterThanOrEqual(titleRect.top);
      expect(iconRect.bottom).toBeLessThanOrEqual(
        titleRect.top + parseFloat(getComputedStyle(title).lineHeight)
      );
    }
    const originalWidth = host.style.width;
    try {
      for (const width of [288, 358]) {
        host.style.width = `${width}px`;
        await waitFor(() => {
          expectIconAtTitle();
          expect(button.getBoundingClientRect().top).toBeGreaterThanOrEqual(
            content.getBoundingClientRect().bottom
          );
          expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth);
          expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
          expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(
            root.getBoundingClientRect().right
          );
          expect(close.getBoundingClientRect().left).toBeGreaterThanOrEqual(
            content.getBoundingClientRect().right -
              parseFloat(getComputedStyle(content).paddingRight)
          );
        });
      }
      host.style.width = originalWidth;
      if (host.clientWidth >= 672) {
        await waitFor(() => {
          expectIconAtTitle();
          expect(actions.getBoundingClientRect().left).toBeGreaterThanOrEqual(
            content.getBoundingClientRect().right
          );
        });
      }
    } finally {
      host.style.width = originalWidth;
    }
  },
};

export const DisabledClose: Story = {
  tags: ['!autodocs', '!dev'],
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

export const BannerInlineActions: Story = {
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
        <AlertTitle>New policy available</AlertTitle>
        <AlertDescription>
          Review the updated workspace retention policy.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">Review</Button>
        <AlertClose />
      </AlertActions>
    </Alert>
  ),
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

export const CustomCloseIconLabel: Story = {
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
        <AlertTitle>Custom close icon</AlertTitle>
        <AlertDescription>
          Icon-only custom children need an explicit accessible name.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <AlertClose aria-label="Dismiss alert">
          <IconX aria-hidden="true" />
        </AlertClose>
      </AlertActions>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await expect(close).toBeInTheDocument();
    await expect(close).toHaveAttribute('aria-label', 'Dismiss alert');
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
  tags: ['!autodocs', '!dev'],
  render: (_args) => (
    <Alert variant="destructive" className="nx:max-w-md">
      <AlertContent>
        <AlertTitle>Test Alert</AlertTitle>
        <AlertDescription>Testing data attributes.</AlertDescription>
      </AlertContent>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    // Check data-slot attributes
    const alert = canvasElement.querySelector('[data-slot="alert"]');
    const title = canvasElement.querySelector('[data-slot="alert-title"]');
    const description = canvasElement.querySelector(
      '[data-slot="alert-description"]'
    );

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-variant', 'destructive');
    await expect(alert).toHaveAttribute('data-presentation', 'card');
    await expect(alert).toHaveAttribute('data-layout', 'stack');
    await expect(alert).not.toHaveAttribute(DATA_DENSITY_ATTRIBUTE);
    await expect(alert).not.toHaveAttribute('role');
    await expect(title).toBeInTheDocument();
    await expect(description).toBeInTheDocument();
  },
};

export const ActionSlotDataAttributes: Story = {
  tags: ['!autodocs', '!dev'],
  render: (_args) => (
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
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');
    const content = canvasElement.querySelector('[data-slot="alert-content"]');
    const actions = canvasElement.querySelector('[data-slot="alert-actions"]');
    const close = canvasElement.querySelector('[data-slot="alert-close"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-layout', 'inline');
    await expect(content).toBeInTheDocument();
    await expect(actions).toBeInTheDocument();
    await expect(close).toBeInTheDocument();
    await expect(close).toHaveAttribute('type', 'button');
  },
};

export const DefaultDataAttributes: Story = {
  tags: ['!autodocs', '!dev'],
  render: (_args) => (
    <Alert className="nx:max-w-md">
      <AlertContent>
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>Testing default variant.</AlertDescription>
      </AlertContent>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-variant', 'default');
    await expect(alert).toHaveAttribute('data-presentation', 'card');
    await expect(alert).not.toHaveAttribute(DATA_DENSITY_ATTRIBUTE);
    await expect(alert).not.toHaveAttribute('role');
  },
};

export const RolePassThrough: Story = {
  tags: ['!autodocs', '!dev'],
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <Alert role="alert" variant="destructive" className="nx:max-w-md">
        <AlertContent>
          <AlertTitle>Session expired</AlertTitle>
          <AlertDescription>
            Sign in again before continuing this task.
          </AlertDescription>
        </AlertContent>
      </Alert>
      <Alert role="status" variant="information" className="nx:max-w-md">
        <AlertContent>
          <AlertTitle>Changes saved</AlertTitle>
          <AlertDescription>
            Your workspace settings were updated.
          </AlertDescription>
        </AlertContent>
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[role="alert"]');
    const status = canvasElement.querySelector('[role="status"]');

    await expect(alert).toBeInTheDocument();
    await expect(status).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
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
          <AlertContent>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a default informational alert.
            </AlertDescription>
          </AlertContent>
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
          <AlertContent>
            <AlertTitle>Information Alert</AlertTitle>
            <AlertDescription>This is an informational alert.</AlertDescription>
          </AlertContent>
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
          <AlertContent>
            <AlertTitle>Destructive Alert</AlertTitle>
            <AlertDescription>
              This is a destructive/error alert.
            </AlertDescription>
          </AlertContent>
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
          <AlertContent>
            <AlertTitle>Success Alert</AlertTitle>
            <AlertDescription>This is a success alert.</AlertDescription>
          </AlertContent>
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
          <AlertContent>
            <AlertTitle>Warning Alert</AlertTitle>
            <AlertDescription>This is a warning alert.</AlertDescription>
          </AlertContent>
        </Alert>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
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
          <AlertContent>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a default informational alert.
            </AlertDescription>
          </AlertContent>
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
          <AlertContent>
            <AlertTitle>Information Alert</AlertTitle>
            <AlertDescription>This is an informational alert.</AlertDescription>
          </AlertContent>
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
          <AlertContent>
            <AlertTitle>Destructive Alert</AlertTitle>
            <AlertDescription>
              This is a destructive/error alert.
            </AlertDescription>
          </AlertContent>
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
          <AlertContent>
            <AlertTitle>Success Alert</AlertTitle>
            <AlertDescription>This is a success alert.</AlertDescription>
          </AlertContent>
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
          <AlertContent>
            <AlertTitle>Warning Alert</AlertTitle>
            <AlertDescription>This is a warning alert.</AlertDescription>
          </AlertContent>
        </Alert>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const DefaultModeHeightPinned: Story = {
  tags: ['!autodocs', '!dev'],
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Pin on the stays-numeric outcome: in default mode, an Alert with a single 40px fixed-height child renders at exactly 74px (= border 1 × 2 + `p-4` 16 × 2 + child 40). If a future PR migrates `p-4` to `p-container`, default rendering shifts to 90px (= 2 + 24 × 2 + 40) and this test fails — the regression signal is that Alert was promoted out of the document scale into the container scale.',
      },
    },
  },
  render: () => (
    <div data-testid="alert-default-host" className="nx:p-10 nx:bg-background">
      <Alert className="nx:w-[200px]">
        <div className="nx:h-10" aria-hidden="true" />
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeightPinned(within(canvasElement), 'alert-default-host', 74, {
      selector: '[data-slot="alert"]',
    });
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
