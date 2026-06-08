import type { Meta, StoryObj } from '@storybook/react';
import { IconFolder, IconHome, IconSettings } from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbMenuTrigger,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

type PlaygroundArgs = {
  itemCount: number;
  showIcons: boolean;
  iconOnly: boolean;
  showMenus: boolean;
  collapseMiddle: boolean;
  constrainedWidth: boolean;
};

const playgroundCrumbs = [
  {
    label: 'Home',
    href: '/home',
    icon: IconHome,
    menuItems: ['Dashboard', 'Activity', 'Reports'],
  },
  {
    label: 'Workspace',
    href: '/workspaces/team',
    icon: IconFolder,
    menuItems: ['Personal', 'Team', 'Archived'],
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: IconFolder,
    menuItems: ['Components', 'Patterns', 'Tokens'],
  },
  {
    label: 'Breadcrumb settings with a long page name',
    href: '/components/breadcrumb',
    icon: IconSettings,
    menuItems: ['API', 'Stories', 'Changelog'],
  },
];

function renderCrumbContent({
  crumb,
  iconOnly,
  isCurrent,
  showIcons,
}: {
  crumb: (typeof playgroundCrumbs)[number];
  iconOnly: boolean;
  isCurrent: boolean;
  showIcons: boolean;
}) {
  const CrumbIcon = crumb.icon;
  const showVisualIcon = showIcons || iconOnly;

  if (iconOnly) {
    return (
      <>
        <CrumbIcon aria-hidden />
        {isCurrent ? <span className="nx:sr-only">{crumb.label}</span> : null}
      </>
    );
  }

  return (
    <>
      {showVisualIcon ? <CrumbIcon aria-hidden /> : null}
      <span>{crumb.label}</span>
    </>
  );
}

function renderMenuContent(crumb: (typeof playgroundCrumbs)[number]) {
  return (
    <DropdownMenuContent align="start">
      {crumb.menuItems.map((label) => (
        <DropdownMenuItem key={label} asChild>
          <a href={`${crumb.href}/${label.toLowerCase()}`}>{label}</a>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
}

function renderPlaygroundItem({
  crumb,
  iconOnly,
  isCurrent,
  showIcons,
  showMenus,
}: {
  crumb: (typeof playgroundCrumbs)[number];
  iconOnly: boolean;
  isCurrent: boolean;
  showIcons: boolean;
  showMenus: boolean;
}) {
  return (
    <BreadcrumbItem key={crumb.label}>
      {isCurrent ? (
        <BreadcrumbPage>
          {renderCrumbContent({ crumb, iconOnly, isCurrent, showIcons })}
        </BreadcrumbPage>
      ) : (
        <BreadcrumbLink
          href={crumb.href}
          aria-label={iconOnly ? crumb.label : undefined}
        >
          {renderCrumbContent({ crumb, iconOnly, isCurrent, showIcons })}
        </BreadcrumbLink>
      )}
      {showMenus ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <BreadcrumbMenuTrigger
              aria-label={
                isCurrent
                  ? `Show related pages for ${crumb.label}`
                  : `Show alternate paths for ${crumb.label}`
              }
            />
          </DropdownMenuTrigger>
          {renderMenuContent(crumb)}
        </DropdownMenu>
      ) : null}
    </BreadcrumbItem>
  );
}

function renderSeparator(key: string) {
  return <BreadcrumbSeparator key={key} />;
}

// Compound playground for trying the breadcrumb anatomy without adding runtime
// props to the component itself.
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    itemCount: 4,
    showIcons: true,
    iconOnly: false,
    showMenus: true,
    collapseMiddle: false,
    constrainedWidth: false,
  },
  argTypes: {
    itemCount: {
      control: 'select',
      options: [2, 3, 4],
      description: 'Number of breadcrumb items to render',
    },
    showIcons: {
      control: 'boolean',
      description: 'Show leading icons in each breadcrumb segment',
    },
    iconOnly: {
      control: 'boolean',
      description:
        'Render items as icons only while preserving accessible names',
    },
    showMenus: {
      control: 'boolean',
      description: 'Show dropdown menu triggers next to breadcrumb segments',
    },
    collapseMiddle: {
      control: 'boolean',
      description: 'Collapse middle items into the ellipsis dropdown',
    },
    constrainedWidth: {
      control: 'boolean',
      description: 'Render inside a narrow container to preview truncation',
    },
  },
  render: ({
    collapseMiddle,
    constrainedWidth,
    iconOnly,
    itemCount,
    showIcons,
    showMenus,
  }) => {
    const selectedCrumbs = playgroundCrumbs.slice(0, itemCount);
    const shouldCollapse = collapseMiddle && selectedCrumbs.length > 3;
    const visibleTrail = shouldCollapse
      ? [
          renderPlaygroundItem({
            crumb: selectedCrumbs[0]!,
            iconOnly,
            isCurrent: false,
            showIcons,
            showMenus,
          }),
          renderSeparator('separator-ellipsis'),
          <BreadcrumbItem key="ellipsis">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <BreadcrumbEllipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {selectedCrumbs.slice(1, -1).map((crumb) => (
                  <DropdownMenuItem key={crumb.label} asChild>
                    <a href={crumb.href}>{crumb.label}</a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>,
          renderSeparator('separator-current'),
          renderPlaygroundItem({
            crumb: selectedCrumbs[selectedCrumbs.length - 1]!,
            iconOnly,
            isCurrent: true,
            showIcons,
            showMenus,
          }),
        ]
      : selectedCrumbs.flatMap((crumb, index) => {
          const isCurrent = index === selectedCrumbs.length - 1;
          const item = renderPlaygroundItem({
            crumb,
            iconOnly,
            isCurrent,
            showIcons,
            showMenus,
          });

          return index === 0
            ? [item]
            : [renderSeparator(`separator-${crumb.label}`), item];
        });
    const breadcrumb = (
      <Breadcrumb>
        <BreadcrumbList>{visibleTrail}</BreadcrumbList>
      </Breadcrumb>
    );

    return constrainedWidth ? (
      <div className="nx:w-[240px]">{breadcrumb}</div>
    ) : (
      breadcrumb
    );
  },
};

// A three-level trail ending on the current page.
export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// A long trail collapsed with an ellipsis standing in for the middle.
export const WithEllipsis: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/projects">Projects</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/projects/design-system">Design System</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/projects/design-system/components">Components</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Settings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Show hidden breadcrumbs' })
    );

    await waitFor(async () => {
      await expect(
        within(document.body).getByRole('menuitem', {
          name: 'Design System',
        })
      ).toBeVisible();
    });
  },
};

// Figma supports optional item icons and trailing dropdown affordances. The
// chevron is a real menu trigger next to the link, not an interactive control
// nested inside the anchor.
export const WithIcons: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">
            <IconFolder aria-hidden />
            <span>Workspace</span>
          </BreadcrumbLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbMenuTrigger aria-label="Show alternate paths for Workspace" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/workspaces/personal">Personal</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/workspaces/team">Team</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/workspaces/archived">Archived</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">
            <IconFolder aria-hidden />
            <span>Projects</span>
          </BreadcrumbLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbMenuTrigger aria-label="Show alternate paths for Projects" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/projects/components">Components</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/projects/patterns">Patterns</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/projects/tokens">Tokens</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            <IconFolder aria-hidden />
            <span>Breadcrumb</span>
          </BreadcrumbPage>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbMenuTrigger aria-label="Show related pages for Breadcrumb" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/components/breadcrumb/api">Breadcrumb API</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/components/breadcrumb/stories">Breadcrumb Stories</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Show alternate paths for Workspace',
      })
    );

    await waitFor(async () => {
      await expect(
        within(document.body).getByRole('menuitem', { name: 'Team' })
      ).toBeVisible();
    });
  },
};

// Breadcrumb items can be icon-only visually. Links still need an accessible
// name, and the current page carries screen-reader text because it is not a
// named interactive control.
export const IconOnly: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/home" aria-label="Home">
            <IconHome aria-hidden />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/projects" aria-label="Projects">
            <IconFolder aria-hidden />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            <IconSettings aria-hidden />
            <span className="nx:sr-only">Settings</span>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'data-slot',
      'breadcrumb-link'
    );
    await expect(
      canvas.getByRole('link', { name: 'Projects' })
    ).toHaveAttribute('data-slot', 'breadcrumb-link');
    await expect(canvas.getByText('Settings')).toHaveClass('nx:sr-only');
  },
};

// Breadcrumb labels cap at 150px, then shrink below that when the available
// breadcrumb width is tighter.
export const LongContent: Story = {
  render: () => (
    <div className="nx:w-[240px]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">
              Quarterly reporting workspace with an unusually long name
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              Budget assumptions and approval workflow details
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
};

// BreadcrumbLink composes with a custom element via asChild (e.g. a router
// link), keeping the link styling and the data-slot hook.
export const AsChild: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <a href="/contacts" data-testid="router-link">
              Home
            </a>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Contacts</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    // Slot merges BreadcrumbLink's props onto the child anchor.
    const link = within(canvasElement).getByTestId('router-link');
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('data-slot', 'breadcrumb-link');
  },
};

// The list is a focusable scroll region (first tab stop); the links then follow
// the native anchor focus contract, and the current page stays out of the order.
export const KeyboardInteraction: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbMenuTrigger aria-label="Show alternate paths for Home" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/accounts">Accounts</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/companies">Companies</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Contacts</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');
    const link = canvas.getByRole('link', { name: 'Home' });
    const trigger = canvas.getByRole('button', {
      name: 'Show alternate paths for Home',
    });
    const page = canvas.getByText('Contacts');

    // The list is a keyboard-focusable scroll region, so it is the first tab
    // stop; the link and trigger follow, and the current page is never focused.
    await userEvent.tab();
    await expect(list).toHaveFocus();
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link).toHaveAttribute('data-slot', 'breadcrumb-link');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute(
      'data-slot',
      'breadcrumb-menu-trigger'
    );
    await expect(page).not.toHaveFocus();
  },
};

// Every structural part carries a data-slot hook; the current page advertises
// aria-current without pretending to be a disabled link.
export const WithDataAttributes: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbMenuTrigger aria-label="Show alternate paths for Home" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/companies">Companies</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/companies">Companies</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Contacts</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    for (const slot of [
      'breadcrumb',
      'breadcrumb-list',
      'breadcrumb-item',
      'breadcrumb-link',
      'breadcrumb-menu-trigger',
      'breadcrumb-separator',
      'breadcrumb-ellipsis',
      'breadcrumb-page',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }

    const page = canvasElement.querySelector('[data-slot="breadcrumb-page"]');
    await expect(page).toHaveAttribute('aria-current', 'page');
    await expect(page).not.toHaveAttribute('role');
    await expect(page).not.toHaveAttribute('aria-disabled');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// The full anatomy: links, slash separators, a collapsed ellipsis, and the
// current page. Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/projects/design-system">Design System</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
