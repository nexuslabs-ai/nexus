import { type ReactNode, useId } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Badge } from '../badge/badge';
import { Button } from '../button/button';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from '../description-list/description-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs/tabs';

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderTitle,
  PageHeaderTitleRow,
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
          'PageHeader titles a page or section, with optional metadata, status, description and actions. Compact, standard and detail headers are compositions of the same parts, not variants.\n\n- The title renders an `h1`. Use `asChild` to pick another heading level.\n- For a larger title, add `className="nx:typography-heading-large"` to PageHeaderTitle.\n- Put page headers inside `main` and section headers inside their `section`.\n- Actions wrap below the content in narrow containers. Your app owns what they do.',
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
  tags: ['docs'],
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
        <PageHeaderMeta data-testid="meta">Workspace</PageHeaderMeta>
        <PageHeaderTitleRow data-testid="title-row">
          <PageHeaderTitle data-testid="title">Activity report</PageHeaderTitle>
        </PageHeaderTitleRow>
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
    await expect(canvas.getByTestId('meta')).toHaveAttribute(
      'data-slot',
      'page-header-meta'
    );
    await expect(canvas.getByTestId('title-row')).toHaveAttribute(
      'data-slot',
      'page-header-title-row'
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
function NotificationSettingsSection() {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId}>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle asChild>
            <h2 id={titleId}>Notification settings</h2>
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
  );
}
export const SectionHeader: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Title a section inside a page with an `h2` through `asChild`.',
      },
    },
  },
  render: () => <NotificationSettingsSection />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', {
        level: 2,
        name: 'Notification settings',
      })
    ).toHaveAttribute('data-slot', 'page-header-title');
  },
};
const longDescription =
  'A longer description that must wrap without pushing actions outside the available space.';
function LongContentHeader() {
  return (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>
          RegionalDisasterRecoveryConfigurationReview
        </PageHeaderTitle>
        <PageHeaderDescription>{longDescription}</PageHeaderDescription>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button variant="outline">Download report</Button>
        <Button>Share report</Button>
        <Button variant="outline">Archive</Button>
      </PageHeaderActions>
    </PageHeader>
  );
}
export const ContainerLayouts: Story = {
  render: () => (
    <div className="nx:grid nx:gap-8">
      <section style={{ width: 280 }} data-testid="narrow">
        <ReportHeader />
      </section>
      <section style={{ width: 280 }} data-testid="narrow-long">
        <LongContentHeader />
      </section>
      <section style={{ width: 460 }} data-testid="medium">
        <LongContentHeader />
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

    const narrowLongHeader = canvas
      .getByTestId('narrow-long')
      .querySelector('header')!;
    await expect(narrowLongHeader.scrollWidth).toBeLessThanOrEqual(
      narrowLongHeader.clientWidth + 1
    );

    const medium = canvas.getByTestId('medium');
    const mediumContent = within(medium)
      .getByText(longDescription)
      .getBoundingClientRect();
    const mediumAction = within(medium)
      .getByRole('button', { name: 'Download report' })
      .getBoundingClientRect();
    await expect(mediumAction.top).toBeGreaterThanOrEqual(mediumContent.bottom);
    await expect(medium.scrollWidth).toBeLessThanOrEqual(
      medium.clientWidth + 1
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
          <PageHeaderMeta>PO-0001 · Project 254</PageHeaderMeta>
          <PageHeaderTitleRow>
            {title}
            <Badge variant="secondary">Sent</Badge>
          </PageHeaderTitleRow>
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

export const Compact: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Pair a title with one small action for a dense page.',
      },
    },
  },
  render: () => <CompactHeader />,
};
export const Detail: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Show a record with metadata, a status Badge in PageHeaderTitleRow and actions.',
      },
    },
  },
  render: () => <DetailHeader />,
};
export const WithTabs: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Place Tabs under the header to switch between views of the page.',
      },
    },
  },
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
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Add `nx:typography-heading-large` to the title for a larger heading.',
      },
    },
  },
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle className="nx:typography-heading-large">
          Workspace overview
        </PageHeaderTitle>
        <PageHeaderDescription>
          Track usage, members, and billing across your workspace.
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
