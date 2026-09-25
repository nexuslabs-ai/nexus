import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Badge } from '../badge';
import { Button } from '../button';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from '../description-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from './page-header';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  decorators: [
    (Story) => (
      <main className="nx:w-full nx:max-w-5xl nx:p-4">
        <Story />
      </main>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Shared page and section anatomy. Compact, standard, and detail are compositions, not component variants. Title defaults to an h1 at heading-medium, the everyday size; LargeHeading opts into heading-large with className. Use asChild to choose the heading level for the document hierarchy. Compose content and actions as needed. Action behavior belongs to the application. Actions wrap below content in narrow containers. Place page headers inside main and section headers inside their section.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

function ReportHeader({
  title = <PageHeaderTitle>Activity report</PageHeaderTitle>,
}: {
  title?: ReactNode;
}) {
  return (
    <PageHeader>
      <PageHeaderContent>
        {title}
        <PageHeaderDescription>
          Review activity for the selected period.
        </PageHeaderDescription>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button variant="outline">Export</Button>
        <Button>Share</Button>
      </PageHeaderActions>
    </PageHeader>
  );
}
export const Default: Story = {
  render: () => <ReportHeader />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', {
        level: 1,
        name: 'Activity report',
      })
    ).toBeVisible();
  },
};
export const WithDataAttributes: Story = {
  render: () => (
    <PageHeader data-testid="header">
      <PageHeaderContent data-testid="content">
        <PageHeaderTitle data-testid="title">Activity report</PageHeaderTitle>
        <PageHeaderDescription data-testid="description">
          Review activity for the selected period.
        </PageHeaderDescription>
      </PageHeaderContent>
      <PageHeaderActions data-testid="actions">
        <Button>Share</Button>
      </PageHeaderActions>
    </PageHeader>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('header')).toHaveAttribute(
      'data-slot',
      'page-header'
    );
    await expect(canvas.getByTestId('content')).toHaveAttribute(
      'data-slot',
      'page-header-content'
    );
    await expect(canvas.getByTestId('title')).toHaveAttribute(
      'data-slot',
      'page-header-title'
    );
    await expect(canvas.getByTestId('description')).toHaveAttribute(
      'data-slot',
      'page-header-description'
    );
    await expect(canvas.getByTestId('actions')).toHaveAttribute(
      'data-slot',
      'page-header-actions'
    );
  },
};
export const TitleOnly: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Documents</PageHeaderTitle>
      </PageHeaderContent>
    </PageHeader>
  ),
};
export const SectionHeader: Story = {
  render: () => (
    <section aria-labelledby="settings-title">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle asChild>
            <h2 id="settings-title">Notification settings</h2>
          </PageHeaderTitle>
          <PageHeaderDescription>
            Choose which updates you receive.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Reset</Button>
        </PageHeaderActions>
      </PageHeader>
    </section>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', {
        level: 2,
        name: 'Notification settings',
      })
    ).toHaveAttribute('data-slot', 'page-header-title');
  },
};
export const ContainerLayouts: Story = {
  render: () => (
    <div className="nx:grid nx:gap-8">
      <section style={{ width: 280 }} data-testid="narrow">
        <ReportHeader />
      </section>
      <section style={{ width: 720 }} data-testid="wide">
        <ReportHeader />
      </section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const description = 'Review activity for the selected period.';

    const narrow = canvas.getByTestId('narrow');
    const narrowContent = within(narrow)
      .getByText(description)
      .getBoundingClientRect();
    const narrowAction = within(narrow)
      .getByRole('button', { name: 'Export' })
      .getBoundingClientRect();
    await expect(narrowAction.top).toBeGreaterThanOrEqual(narrowContent.bottom);
    await expect(narrow.scrollWidth).toBeLessThanOrEqual(
      narrow.clientWidth + 1
    );

    const wide = canvas.getByTestId('wide');
    const wideContent = within(wide)
      .getByText(description)
      .getBoundingClientRect();
    const wideAction = within(wide)
      .getByRole('button', { name: 'Export' })
      .getBoundingClientRect();
    await expect(wideAction.left).toBeGreaterThanOrEqual(wideContent.right);
    await expect(wide.scrollWidth).toBeLessThanOrEqual(wide.clientWidth + 1);
  },
};
export const LongContent: Story = {
  render: () => (
    <section style={{ width: 280 }}>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>
            RegionalDisasterRecoveryConfigurationReview
          </PageHeaderTitle>
          <PageHeaderDescription>
            A longer description that must wrap without pushing actions outside
            the available space.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Download report</Button>
          <Button>Share report</Button>
          <Button variant="outline">Archive</Button>
        </PageHeaderActions>
      </PageHeader>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector('header')!;
    await expect(header.scrollWidth).toBeLessThanOrEqual(
      header.clientWidth + 1
    );
  },
};
const onSave = fn();
export const KeyboardAction: Story = {
  beforeEach: () => {
    onSave.mockClear();
  },
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Document</PageHeaderTitle>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button onClick={onSave}>Save</Button>
      </PageHeaderActions>
    </PageHeader>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(
      within(canvasElement).getByRole('button', { name: 'Save' })
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onSave).toHaveBeenCalledOnce();
  },
};

function CompactHeader({
  title = (
    <PageHeaderTitle className="nx:typography-heading-small">
      Reports
    </PageHeaderTitle>
  ),
}: {
  title?: ReactNode;
}) {
  return (
    <PageHeader>
      <PageHeaderContent>{title}</PageHeaderContent>
      <PageHeaderActions>
        <Button size="sm">New report</Button>
      </PageHeaderActions>
    </PageHeader>
  );
}

function DetailHeader({
  title = <PageHeaderTitle>Purchase order</PageHeaderTitle>,
}: {
  title?: ReactNode;
}) {
  return (
    <div className="nx:grid nx:gap-6">
      <PageHeader>
        <PageHeaderContent>
          <p className="nx:typography-label-small nx:text-muted-foreground">
            PO-0001 · Project 254
          </p>
          <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            {title}
            <Badge variant="secondary">Sent</Badge>
          </div>
          <PageHeaderDescription>
            Office furniture for the Riverside workspace.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Download</Button>
          <Button>Edit order</Button>
        </PageHeaderActions>
      </PageHeader>
      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Supplier</DescriptionListTerm>
          <DescriptionListDescription>
            Riverside Furniture
          </DescriptionListDescription>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Delivery date</DescriptionListTerm>
          <DescriptionListDescription>
            <time dateTime="2026-10-12">12 October 2026</time>
          </DescriptionListDescription>
        </DescriptionListItem>
      </DescriptionList>
    </div>
  );
}

function TabbedHeader({
  title = <PageHeaderTitle>Usage</PageHeaderTitle>,
}: {
  title?: ReactNode;
}) {
  return (
    <div className="nx:grid nx:gap-4">
      <PageHeader>
        <PageHeaderContent>
          {title}
          <PageHeaderDescription>
            Monitor activity and spending across your workspace.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <Tabs defaultValue="activity">
        <TabsList aria-label="Usage views">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="spend">Spend</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Activity for the current billing period.
          </p>
        </TabsContent>
        <TabsContent value="spend">
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Spending for the current billing period.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Compact: Story = { render: () => <CompactHeader /> };
export const Standard: Story = { render: () => <ReportHeader /> };
export const Detail: Story = { render: () => <DetailHeader /> };
export const WithTabs: Story = {
  render: () => <TabbedHeader />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Spend' }));
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'Spending for the current billing period.'
    );
    await expect(canvas.getByRole('tab', { name: 'Spend' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  },
};
export const LargeHeading: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle className="nx:typography-heading-large">
          Workspace overview
        </PageHeaderTitle>
        <PageHeaderDescription>
          A larger title for pages that need stronger emphasis.
        </PageHeaderDescription>
      </PageHeaderContent>
    </PageHeader>
  ),
};
export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:gap-10">
      <section aria-label="Compact header">
        <CompactHeader
          title={
            <PageHeaderTitle asChild className="nx:typography-heading-small">
              <h2>Reports</h2>
            </PageHeaderTitle>
          }
        />
      </section>
      <section aria-label="Standard header">
        <ReportHeader
          title={
            <PageHeaderTitle asChild>
              <h2>Activity report</h2>
            </PageHeaderTitle>
          }
        />
      </section>
      <section aria-label="Detail header">
        <DetailHeader
          title={
            <PageHeaderTitle asChild>
              <h2>Purchase order</h2>
            </PageHeaderTitle>
          }
        />
      </section>
      <section aria-label="Header with tabs">
        <TabbedHeader
          title={
            <PageHeaderTitle asChild>
              <h2>Usage</h2>
            </PageHeaderTitle>
          }
        />
      </section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('heading', { level: 1 })).toHaveLength(
      0
    );
    await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(4);
  },
};
