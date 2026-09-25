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
          'Shared page and section anatomy. Compact, standard, and detail are compositions, not component variants. Everyday examples use heading-medium; LargeHeading demonstrates the larger treatment. Compose content and actions as needed. Title defaults to h1; choose the heading level for the document hierarchy, and use className to adjust visual size independently. Action behavior belongs to the application. Actions wrap below content in narrow containers. Place page headers inside main and section headers inside their section.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

function ReportHeader() {
  return (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle className="nx:typography-heading-medium">
          Activity report
        </PageHeaderTitle>
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
export const TitleOnly: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle className="nx:typography-heading-medium">
          Documents
        </PageHeaderTitle>
      </PageHeaderContent>
    </PageHeader>
  ),
};
export const SectionHeader: Story = {
  render: () => (
    <section aria-labelledby="settings-title">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle
            as="h2"
            id="settings-title"
            className="nx:typography-heading-medium"
          >
            Notification settings
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
    ).toBeVisible();
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
    for (const name of ['narrow', 'wide']) {
      const container = canvas.getByTestId(name);
      const content = container
        .querySelector('[data-slot="page-header-content"]')!
        .getBoundingClientRect();
      const actions = container
        .querySelector('[data-slot="page-header-actions"]')!
        .getBoundingClientRect();
      if (name === 'narrow')
        await expect(actions.top).toBeGreaterThanOrEqual(content.bottom);
      else await expect(actions.left).toBeGreaterThanOrEqual(content.right);
      await expect(container.scrollWidth).toBeLessThanOrEqual(
        container.clientWidth + 1
      );
    }
  },
};
export const LongContent: Story = {
  render: () => (
    <section style={{ width: 280 }}>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle className="nx:typography-heading-medium">
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
        <PageHeaderTitle className="nx:typography-heading-medium">
          Document
        </PageHeaderTitle>
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

function CompactHeader() {
  return (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle className="nx:typography-heading-small">
          Reports
        </PageHeaderTitle>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button size="sm">New report</Button>
      </PageHeaderActions>
    </PageHeader>
  );
}

function DetailHeader() {
  return (
    <div className="nx:grid nx:gap-6">
      <PageHeader>
        <PageHeaderContent>
          <p className="nx:typography-label-small nx:text-muted-foreground">
            PO-0001 · Project 254
          </p>
          <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <PageHeaderTitle className="nx:typography-heading-medium">
              Purchase order
            </PageHeaderTitle>
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

function TabbedHeader() {
  return (
    <div className="nx:grid nx:gap-4">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle className="nx:typography-heading-medium">
            Usage
          </PageHeaderTitle>
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
        <CompactHeader />
      </section>
      <section aria-label="Standard header">
        <ReportHeader />
      </section>
      <section aria-label="Detail header">
        <DetailHeader />
      </section>
      <section aria-label="Header with tabs">
        <TabbedHeader />
      </section>
    </div>
  ),
};
