import * as React from 'react';

import { DEFAULT_NEXUS_APPEARANCE, DENSITY_OPTIONS } from '@nexus_ds/core';
import {
  Canvas,
  Controls,
  Description,
  Title,
} from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import {
  IconAlertCircleFilled,
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconInfoCircleFilled,
  IconX,
} from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectHeightPinned } from '../../stories/support/story-height-test-utils';
import { NexusRoot } from '../appearance/provider';
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
          <h3 id="inline-layout-width">Inline layout width</h3>
          <p>
            An inline alert reflows by its own width, so it needs a definite
            one. It fills a block parent; inside a shrink-to-fit parent such as
            an inline-block, a <code>w-fit</code> box or a non-growing flex
            item, set its width.
          </p>
          <Canvas of={InlineInShrinkToFitParent} />
          <h3 id="close-in-stack-layout">Close in stack layout</h3>
          <Canvas of={StackWithClose} />
          <h2 id="status-colours">Status colours</h2>
          <p>
            Choose the message meaning independently of layout. Colour does not
            add an announcement role.
          </p>
          <Canvas of={AllVariants} />
          <h2 id="surface-treatments">Surface treatments</h2>
          <p>
            Light is the default. None keeps the neutral container surface with
            a status border; solid uses the status background and its paired
            foreground. Icons are composed from Tabler filled icons; custom
            icons remain supported.
          </p>
          <Canvas of={NoFill} />
          <Canvas of={Solid} />
          <h2 id="neutral-message-text">Neutral message text</h2>
          <p>
            Use <code>{'textTone="neutral"'}</code> with light or none to keep
            message text neutral while the icon and frame convey status. Solid
            does not take this option; it keeps its paired foreground. On solid
            surfaces, AlertActions defaults its Buttons to the opaque outline
            variant; avoid ghost actions or bare links there.
          </p>
          <Canvas of={NeutralText} />
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
            Give custom icon-only controls an accessible name. Use Nexus Button
            for a visible text dismissal action.
          </p>
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
    fill: 'light',
    textTone: 'status',
  },
  argTypes: {
    fill: {
      control: 'select',
      options: ['light', 'none', 'solid'],
      description: 'Surface treatment, independent of status.',
      table: { category: 'Controls' },
    },
    textTone: {
      control: 'select',
      options: ['status', 'neutral'],
      description:
        'Message colour for light and none fills. Solid takes no textTone.',
      if: { arg: 'fill', neq: 'solid' },
      table: { category: 'Controls' },
    },
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
        'Action placement: stack below the message; inline beside it when space permits. Title and description remain grouped. Narrow inline alerts move actions below. AlertClose sits at the top end in both.',
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
type PlaygroundButtonVariant = NonNullable<
  React.ComponentProps<typeof Button>['variant']
>;
type PlaygroundArgs = Omit<
  React.ComponentProps<typeof Alert>,
  'fill' | 'textTone'
> & {
  fill?: 'light' | 'none' | 'solid';
  textTone?: 'status' | 'neutral';
  icon: PlaygroundIcon;
  actions?: PlaygroundActions;
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
        <IconAlertCircleFilled />
      </AlertIcon>
    );
  }
  if (icon === 'success') {
    return (
      <AlertIcon>
        <IconCircleCheckFilled />
      </AlertIcon>
    );
  }
  if (icon === 'warning') {
    return (
      <AlertIcon>
        <IconAlertTriangleFilled />
      </AlertIcon>
    );
  }

  return (
    <AlertIcon>
      <IconInfoCircleFilled />
    </AlertIcon>
  );
}

function AlertPlaygroundExample({
  actions = 'none',
  description,
  icon,
  primaryActionLabel,
  primaryActionVariant,
  secondaryActionLabel,
  secondaryActionVariant,
  title,
  fill,
  textTone,
  ...alertProps
}: PlaygroundArgs) {
  const [visible, setVisible] = React.useState(true);
  const restoreCloseFocus = React.useRef(false);
  const hasPrimaryAction = actions.includes('primary');
  const hasSecondaryAction = actions.includes('secondary');
  const hasCloseAction = actions.includes('close');
  // Solid alerts take no textTone and leave the action variant to AlertActions.
  const solid = fill === 'solid';

  function resetAlert() {
    restoreCloseFocus.current = true;
    setVisible(true);
  }

  function focusResetButton(button: HTMLButtonElement | null) {
    button?.focus();
  }

  function focusRestoredClose(button: HTMLButtonElement | null) {
    if (!button || !restoreCloseFocus.current) return;
    restoreCloseFocus.current = false;
    button.focus();
  }

  if (!visible) {
    return (
      <Button ref={focusResetButton} variant="outline" onClick={resetAlert}>
        Reset alert
      </Button>
    );
  }

  return (
    <Alert
      {...alertProps}
      {...(solid ? { fill } : { fill, textTone })}
      className="nx:max-w-2xl"
    >
      {renderPlaygroundIcon(icon)}
      <AlertContent>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </AlertContent>
      {hasPrimaryAction ? (
        <AlertActions>
          <Button variant={solid ? undefined : primaryActionVariant}>
            {primaryActionLabel}
          </Button>
          {hasSecondaryAction ? (
            <Button variant={solid ? undefined : secondaryActionVariant}>
              {secondaryActionLabel}
            </Button>
          ) : null}
        </AlertActions>
      ) : null}
      {hasCloseAction ? (
        <AlertClose
          ref={focusRestoredClose}
          onClick={() => setVisible(false)}
        />
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
            <IconInfoCircleFilled />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>Invite ready</AlertTitle>
            <AlertDescription>
              The workspace invitation can now be sent.
            </AlertDescription>
          </AlertContent>
          <AlertClose onClick={dismiss} />
        </Alert>
      )}
      <Button
        ref={continueButton}
        type="button"
        variant="outline"
        onClick={() => setVisible(true)}
      >
        Show invitation alert
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
    } else {
      await expect(getComputedStyle(actions).gridColumnStart).toBe('3');
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

export const InlineInShrinkToFitParent: Story = {
  args: { layout: 'inline', variant: 'information' },
  render: (args) => (
    <div className="nx:inline-flex">
      <Alert {...args} className="nx:w-md nx:max-w-full">
        <AlertIcon>
          <IconInfoCircleFilled />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Storage almost full</AlertTitle>
          <AlertDescription>Uploads may fail soon.</AlertDescription>
        </AlertContent>
        <AlertActions>
          <Button variant="outline">Manage</Button>
        </AlertActions>
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector<HTMLElement>(
      '[data-slot="alert"]'
    )!;
    const title = canvasElement.querySelector<HTMLElement>(
      '[data-slot="alert-title"]'
    )!;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    await expect(alert.getBoundingClientRect().width).toBeCloseTo(28 * rem, 0);
    await expect(title.getBoundingClientRect().height).toBeLessThanOrEqual(
      parseFloat(getComputedStyle(title).lineHeight)
    );
  },
};

export const StackWithClose: Story = {
  args: { variant: 'information' },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconInfoCircleFilled />
      </AlertIcon>
      <AlertTitle>Invitation sent</AlertTitle>
      <AlertDescription>Your teammate will receive an email.</AlertDescription>
      <AlertActions>
        <Button variant="outline">View invitation</Button>
      </AlertActions>
      <AlertClose />
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector<HTMLElement>(
      '[data-slot="alert"]'
    )!;
    const title = canvasElement.querySelector<HTMLElement>(
      '[data-slot="alert-title"]'
    )!;
    const description = canvasElement.querySelector<HTMLElement>(
      '[data-slot="alert-description"]'
    )!;
    const close = within(canvasElement).getByRole('button', {
      name: 'Dismiss alert',
    });
    const closeRect = close.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    await expect(closeRect.left).toBeGreaterThanOrEqual(titleRect.right);
    await expect(closeRect.right).toBeLessThanOrEqual(
      alert.getBoundingClientRect().right
    );
    await expect(closeRect.top).toBeLessThan(titleRect.bottom);
    await expect(description.getBoundingClientRect().top).toBeCloseTo(
      titleRect.bottom + parseFloat(getComputedStyle(title).marginBottom),
      0
    );
  },
};

export const Playground: PlaygroundStory = {
  args: {
    actions: 'primary + close',
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
    actions: {
      name: 'actions (story only)',
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
        'Story-only action pattern: close only, one or two actions, with or without close.',
      table: {
        category: 'Controls',
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
      description:
        'Story-only primary Button variant. On solid alerts AlertActions supplies outline.',
      if: { arg: 'fill', neq: 'solid' },
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
      description:
        'Story-only secondary Button variant. On solid alerts AlertActions supplies outline.',
      if: { arg: 'fill', neq: 'solid' },
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
          'Story-only controls render the recommended slot composition. They are not Alert props; production usage still composes icons, Button, AlertActions, and AlertClose as children. On solid alerts AlertActions defaults both actions to the opaque outline variant; variant controls apply to light and none fills. The copyable example includes dismissal state and a focus destination. Adjust its relative component imports to your copied Nexus paths and supply onManage from your application.',
      },
      source: {
        code: `import { useState } from 'react';
import { IconInfoCircleFilled } from '@tabler/icons-react';
import { Button } from '../button';
import {
  Alert, AlertActions, AlertClose, AlertContent,
  AlertDescription, AlertIcon, AlertTitle,
} from './alert';

export function StorageAlert({ onManage }: { onManage: () => void }) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <Button ref={(node) => node?.focus()} onClick={onManage}>
        Manage storage
      </Button>
    );
  }

  return (
    <Alert variant="information" layout="inline">
      <AlertIcon><IconInfoCircleFilled /></AlertIcon>
      <AlertContent>
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>Uploads may fail soon.</AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline" onClick={onManage}>Manage</Button>
      </AlertActions>
      <AlertClose onClick={() => setVisible(false)} />
    </Alert>
  );
}`,
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

export const PlaygroundSolidActions: PlaygroundStory = {
  ...Playground,
  tags: ['!autodocs', '!dev'],
  args: {
    ...Playground.args,
    fill: 'solid',
    actions: 'primary + secondary + close',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['Manage', 'View details', 'Dismiss alert']) {
      const button = canvas.getByRole('button', { name });
      await expect(button).toHaveAttribute('data-variant', 'outline');
      await expect(getComputedStyle(button).backgroundColor).not.toBe(
        'rgba(0, 0, 0, 0)'
      );
    }
    for (const name of ['Manage', 'View details']) {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-size',
        'sm'
      );
    }
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });
    close.focus();
    await userEvent.keyboard('{Enter}');
    const reset = await canvas.findByRole('button', { name: 'Reset alert' });
    await expect(reset).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      await canvas.findByRole('button', { name: 'Dismiss alert' })
    ).toHaveFocus();
  },
};

export const ClearedActionControls: PlaygroundStory = {
  ...Playground,
  tags: ['!autodocs', '!dev'],
  args: {
    ...Playground.args,
    actions: undefined,
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
        <IconInfoCircleFilled />
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
        <IconInfoCircleFilled />
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
        <IconAlertCircleFilled />
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
        <IconInfoCircleFilled />
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

export const DensityActionSizing: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:flex nx:w-full nx:flex-col nx:gap-4">
      {DENSITY_OPTIONS.map(({ value }) => (
        <NexusRoot
          key={value}
          state={{ ...DEFAULT_NEXUS_APPEARANCE, mode: 'light', density: value }}
        >
          <Alert layout="inline" variant="information">
            <AlertIcon>
              <IconInfoCircleFilled />
            </AlertIcon>
            <AlertContent>
              <AlertTitle>Invitation ready</AlertTitle>
              <AlertDescription>
                Review the invitation before sending.
              </AlertDescription>
            </AlertContent>
            <AlertActions>
              <Button startIcon={<IconCircleCheckFilled />}>Send</Button>
              <Button variant="outline" startIcon={<IconInfoCircleFilled />}>
                Review
              </Button>
            </AlertActions>
            <AlertClose />
          </Alert>
        </NexusRoot>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll('[data-slot="alert"]')
    ).toHaveLength(DENSITY_OPTIONS.length);
    for (const alert of canvasElement.querySelectorAll('[data-slot="alert"]')) {
      const close = alert.querySelector('[data-slot="alert-close"]')!;
      for (const button of alert.querySelectorAll('[data-slot="button"]')) {
        await expect(button.getBoundingClientRect().height).toBe(
          close.getBoundingClientRect().height
        );
      }
    }
  },
};

export const CloseKeepsTitleRow: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div className="nx:flex nx:w-full nx:flex-col nx:gap-4">
      {DENSITY_OPTIONS.map(({ value }) => (
        <NexusRoot
          key={value}
          state={{ ...DEFAULT_NEXUS_APPEARANCE, mode: 'light', density: value }}
          className="nx:flex nx:flex-col nx:gap-2"
        >
          <Alert layout="stack" aria-label={`${value} with close`}>
            <AlertContent>
              <AlertTitle>Changes saved</AlertTitle>
            </AlertContent>
            <AlertClose />
          </Alert>
          <Alert layout="stack" aria-label={`${value} without close`}>
            <AlertContent>
              <AlertTitle>Changes saved</AlertTitle>
            </AlertContent>
          </Alert>
        </NexusRoot>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const { value } of DENSITY_OPTIONS) {
      const withClose = canvas.getByLabelText(`${value} with close`);
      const withoutClose = canvas.getByLabelText(`${value} without close`);
      await expect(withClose.getBoundingClientRect().height).toBe(
        withoutClose.getBoundingClientRect().height
      );
    }
  },
};

export const SuccessWithIcon: Story = {
  tags: ['!autodocs', '!dev'],
  args: {
    variant: 'success',
  },
  render: (args) => (
    <Alert {...args} className="nx:max-w-md">
      <AlertIcon>
        <IconCircleCheckFilled />
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
        <IconAlertTriangleFilled />
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
      canvas.getByRole('button', { name: 'Show invitation alert' })
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
            <IconInfoCircleFilled />
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
        Show import alert
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
    const restore = canvas.getByRole('button', { name: 'Show import alert' });
    await expect(restore).toHaveFocus();
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
        <IconAlertCircleFilled />
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
        <IconAlertTriangleFilled />
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
        <IconInfoCircleFilled />
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
        <IconAlertTriangleFilled />
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
          <IconCircleCheckFilled />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Deployment complete</AlertTitle>
          <AlertDescription>
            Version 2.4.0 is live in the production environment.
          </AlertDescription>
        </AlertContent>
        <AlertActions>
          <Button variant="outline">View release</Button>
        </AlertActions>
        <AlertClose />
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
            content.getBoundingClientRect().right
          );
          expect(close.getBoundingClientRect().top).toBeLessThan(
            content.getBoundingClientRect().bottom
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

export const RightToLeftClose: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => (
    <div dir="rtl" className="nx:w-80 nx:max-w-full">
      <Alert layout="inline" variant="information">
        <AlertIcon>
          <IconInfoCircleFilled />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Workspace invitation ready for review</AlertTitle>
          <AlertDescription>
            Review the invitation before sending it to your team.
          </AlertDescription>
        </AlertContent>
        <AlertClose />
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const close = within(canvasElement).getByRole('button', {
      name: 'Dismiss alert',
    });
    const alert = canvasElement.querySelector<HTMLElement>(
      '[data-slot="alert"]'
    )!;
    const content = canvasElement.querySelector<HTMLElement>(
      '[data-slot="alert-content"]'
    )!;
    await expect(close).toHaveAttribute('data-size', 'icon-sm');
    await expect(close).toHaveAttribute('data-variant', 'ghost');
    await expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(
      content.getBoundingClientRect().left
    );
    // A close-only alert has a single row: no empty action row below the message.
    const alertStyle = getComputedStyle(alert);
    await expect(
      alert.getBoundingClientRect().bottom -
        content.getBoundingClientRect().bottom
    ).toBeCloseTo(
      parseFloat(alertStyle.paddingBottom) +
        parseFloat(alertStyle.borderBottomWidth),
      0
    );
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
        <IconCircleCheckFilled />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Deployment complete</AlertTitle>
        <AlertDescription>
          Version 2.4.0 is live in the production environment.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">View release</Button>
      </AlertActions>
      <AlertClose disabled />
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
        <IconInfoCircleFilled />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>New policy available</AlertTitle>
        <AlertDescription>
          Review the updated workspace retention policy.
        </AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">Review</Button>
      </AlertActions>
      <AlertClose />
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
        <IconInfoCircleFilled />
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
      <AlertClose />
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
        <IconInfoCircleFilled />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Custom close icon</AlertTitle>
        <AlertDescription>
          Icon-only custom children need an explicit accessible name.
        </AlertDescription>
      </AlertContent>
      <AlertClose aria-label="Dismiss alert">
        <IconX aria-hidden="true" />
      </AlertClose>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await expect(close).toBeInTheDocument();
    await expect(close).toHaveAttribute('aria-label', 'Dismiss alert');
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
        <IconAlertTriangleFilled />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>Uploads may fail soon.</AlertDescription>
      </AlertContent>
      <AlertActions>
        <Button variant="outline">Manage</Button>
      </AlertActions>
      <AlertClose />
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
    <Alert fill={null} className="nx:max-w-md">
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
    await expect(alert).toHaveAttribute('data-fill', 'light');
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
            <IconInfoCircleFilled />
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
            <IconInfoCircleFilled />
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
            <IconAlertCircleFilled />
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
            <IconCircleCheckFilled />
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
            <IconAlertTriangleFilled />
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
    controls: { disable: true },
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
            <IconInfoCircleFilled />
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
            <IconInfoCircleFilled />
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
            <IconAlertCircleFilled />
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
            <IconCircleCheckFilled />
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
            <IconAlertTriangleFilled />
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
    controls: { disable: true },
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

const statusExamples = [
  {
    variant: 'information',
    title: 'Update available',
    description: 'A new workspace version is ready.',
    icon: IconInfoCircleFilled,
  },
  {
    variant: 'success',
    title: 'Changes saved',
    description: 'Your workspace settings are up to date.',
    icon: IconCircleCheckFilled,
  },
  {
    variant: 'warning',
    title: 'Storage almost full',
    description: 'Remove unused files before your next upload.',
    icon: IconAlertTriangleFilled,
  },
  {
    variant: 'destructive',
    title: 'Upload failed',
    description: 'Check your connection and try again.',
    icon: IconAlertCircleFilled,
  },
] as const;

function TreatmentExamples(args: React.ComponentProps<typeof Alert>) {
  return (
    <div className="nx:flex nx:w-full nx:max-w-2xl nx:flex-col nx:gap-4">
      {statusExamples.map(({ variant, title, description, icon: Icon }) => (
        <Alert key={variant} {...args} variant={variant}>
          <AlertIcon>
            <Icon />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
          </AlertContent>
        </Alert>
      ))}
    </div>
  );
}

export const NoFill: Story = {
  args: { fill: 'none' },
  render: TreatmentExamples,
};
export const Solid: Story = {
  args: { fill: 'solid' },
  render: TreatmentExamples,
};
export const NeutralText: Story = {
  args: { fill: 'light', textTone: 'neutral' },
  render: TreatmentExamples,
  play: async ({ canvasElement }) => {
    const titles = [
      ...canvasElement.querySelectorAll('[data-slot="alert-title"]'),
    ];
    const descriptions = [
      ...canvasElement.querySelectorAll('[data-slot="alert-description"]'),
    ];
    const neutral = getComputedStyle(titles[0]!).color;
    for (const text of [...titles, ...descriptions]) {
      await expect(getComputedStyle(text).color).toBe(neutral);
    }
    for (const icon of canvasElement.querySelectorAll(
      '[data-slot="alert-icon"]'
    )) {
      await expect(getComputedStyle(icon).color).not.toBe(neutral);
    }
  },
};

export const SolidDismissal: Story = {
  args: {
    fill: 'solid',
    variant: 'information',
    layout: 'inline',
  },
  render: (args) => <SolidDismissalExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });
    const title = canvas.getByText('Update available');
    const alert = title.closest('[data-slot="alert"]')!;
    await expect(getComputedStyle(title).color).toBe(
      getComputedStyle(alert).color
    );
    await expect(getComputedStyle(close).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)'
    );
    close.focus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.queryByText('Update available')
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Show alert' })
    ).toHaveFocus();
  },
};

function SolidDismissalExample(args: React.ComponentProps<typeof Alert>) {
  const [visible, setVisible] = React.useState(true);
  if (!visible)
    return (
      <Button ref={(node) => node?.focus()} onClick={() => setVisible(true)}>
        Show alert
      </Button>
    );
  return (
    <Alert {...args}>
      <AlertIcon>
        <IconInfoCircleFilled />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>Update available</AlertTitle>
        <AlertDescription>A new workspace version is ready.</AlertDescription>
      </AlertContent>
      <AlertClose onClick={() => setVisible(false)} />
    </Alert>
  );
}
