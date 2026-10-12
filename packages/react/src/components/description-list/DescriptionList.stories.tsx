import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Badge } from '../badge';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from './description-list';

const meta: Meta<typeof DescriptionList> = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  parameters: {
    docs: {
      description: {
        component:
          'Compose one term and description per item. Values, formatting, missing-value text and actions belong to the consumer. Put actions inside DescriptionListDescription. Rows stack in narrow containers and align in two columns when the list has enough room.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DescriptionList>;

function ProfileDetails() {
  return (
    <DescriptionList>
      <DescriptionListItem>
        <DescriptionListTerm>Name</DescriptionListTerm>
        <DescriptionListDescription>Priya Shah</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Email</DescriptionListTerm>
        <DescriptionListDescription>
          priya@example.com
        </DescriptionListDescription>
      </DescriptionListItem>
    </DescriptionList>
  );
}

export const Default: Story = {
  tags: ['docs'],
  render: () => <ProfileDetails />,
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('dl');
    await expect(list).not.toBeNull();
    await expect(list?.children).toHaveLength(2);
    for (const item of Array.from(list!.children)) {
      await expect(item.tagName).toBe('DIV');
      await expect(Array.from(item.children, (child) => child.tagName)).toEqual(
        ['DT', 'DD']
      );
    }
  },
};

export const FileMetadata: Story = {
  tags: ['docs'],
  render: () => (
    <DescriptionList>
      <DescriptionListItem>
        <DescriptionListTerm>Filename</DescriptionListTerm>
        <DescriptionListDescription>
          Research findings.pdf
        </DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Size</DescriptionListTerm>
        <DescriptionListDescription>2.4 MB</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Modified</DescriptionListTerm>
        <DescriptionListDescription>
          <time dateTime="2026-09-24">24 September 2026</time>
        </DescriptionListDescription>
      </DescriptionListItem>
    </DescriptionList>
  ),
};

export const Configuration: Story = {
  tags: ['docs'],
  render: () => (
    <DescriptionList>
      <DescriptionListItem>
        <DescriptionListTerm>Region</DescriptionListTerm>
        <DescriptionListDescription>Mumbai</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Backups</DescriptionListTerm>
        <DescriptionListDescription>
          <Badge variant="secondary">Enabled</Badge>
        </DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Retention override</DescriptionListTerm>
        <DescriptionListDescription>Not configured</DescriptionListDescription>
      </DescriptionListItem>
    </DescriptionList>
  ),
};

export const ContainerLayouts: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:gap-8">
      <div style={{ width: 280 }} data-testid="narrow">
        <ProfileDetails />
      </div>
      <div style={{ width: 640 }} data-testid="wide">
        <ProfileDetails />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const narrow = canvas.getByTestId('narrow');
    const wide = canvas.getByTestId('wide');
    const termNarrow = narrow.querySelector('dt')!;
    const valueNarrow = narrow.querySelector('dd')!;
    const termWide = wide.querySelector('dt')!;
    const valueWide = wide.querySelector('dd')!;
    await expect(narrow.getBoundingClientRect().width).toBeLessThan(448);
    await expect(wide.getBoundingClientRect().width).toBeGreaterThan(448);
    await expect(
      valueNarrow.getBoundingClientRect().top
    ).toBeGreaterThanOrEqual(termNarrow.getBoundingClientRect().bottom);
    await expect(valueWide.getBoundingClientRect().left).toBeGreaterThan(
      termWide.getBoundingClientRect().left
    );
    await expect(
      Math.abs(
        valueWide.getBoundingClientRect().top -
          termWide.getBoundingClientRect().top
      )
    ).toBeLessThan(2);
  },
};

export const LongContent: Story = {
  render: () => (
    <div className="nx:grid nx:gap-8">
      {[280, 640].map((width) => (
        <div key={width} style={{ width }}>
          <DescriptionList>
            <DescriptionListItem>
              <DescriptionListTerm>
                RegionalDisasterRecoveryBackupConfigurationIdentifier
              </DescriptionListTerm>
              <DescriptionListDescription>
                production-archive-2026-09-24-regional-backup-retention-configuration-7d841b239aca38ce
              </DescriptionListDescription>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Delivery address</DescriptionListTerm>
              <DescriptionListDescription>
                24 Riverside Road
                <br />
                Mumbai
                <br />
                Maharashtra
              </DescriptionListDescription>
            </DescriptionListItem>
          </DescriptionList>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const list of canvasElement.querySelectorAll('dl')) {
      await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 1);
      for (const cell of list.querySelectorAll('dt, dd')) {
        await expect(cell.scrollWidth).toBeLessThanOrEqual(
          cell.clientWidth + 1
        );
      }
    }
  },
};

export const WithDataAttributes: Story = {
  render: () => <ProfileDetails />,
  play: async ({ canvasElement }) => {
    for (const slot of [
      'description-list',
      'description-list-item',
      'description-list-term',
      'description-list-description',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).not.toBeNull();
    }
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:w-full nx:max-w-3xl nx:gap-8">
      <ProfileDetails />
      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Backups</DescriptionListTerm>
          <DescriptionListDescription>
            <Badge variant="secondary">Enabled</Badge>
          </DescriptionListDescription>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Retention override</DescriptionListTerm>
          <DescriptionListDescription>
            Not configured
          </DescriptionListDescription>
        </DescriptionListItem>
      </DescriptionList>
    </div>
  ),
};
